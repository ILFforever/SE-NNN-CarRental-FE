"use client";

import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import ProviderDetail from "@/components/provider/providerDetail";
import { 
  timeOptions, 
  createDateTimeObject, 
  isBookingAtLeastTwoHours,
  calculateRentalDays,
  getRentalPeriod 
} from "@/libs/bookingUtils";

interface BookingFormProps {
  nameLastname: string;
  setNameLastname: (name: string) => void;
  tel: string;
  setTel: (tel: string) => void;
  pickupDate: Dayjs | null;
  setPickupDate: (date: Dayjs | null) => void;
  returnDate: Dayjs | null;
  setReturnDate: (date: Dayjs | null) => void;
  pickupTime: string;
  setPickupTime: (time: string) => void;
  returnTime: string;
  setReturnTime: (time: string) => void;
  isAvailable: boolean;
  isCheckingAvailability: boolean;
  availabilityMessage: string;
  providerId: string | undefined;
  token: string | undefined;
  pickupDateTime: Dayjs | null;
  setPickupDateTime: (dateTime: Dayjs | null) => void;
  returnDateTime: Dayjs | null;
  setReturnDateTime: (dateTime: Dayjs | null) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  nameLastname,
  setNameLastname,
  tel,
  setTel,
  pickupDate,
  setPickupDate,
  returnDate,
  setReturnDate,
  pickupTime,
  setPickupTime,
  returnTime,
  setReturnTime,
  isAvailable,
  isCheckingAvailability,
  availabilityMessage,
  providerId,
  token,
  pickupDateTime,
  setPickupDateTime,
  returnDateTime,
  setReturnDateTime,
}) => {
  // วันที่ปัจจุบัน
  const today = dayjs();
  
  // สถานะสำหรับแสดงข้อผิดพลาดเกี่ยวกับเวลาขั้นต่ำ
  const [timeError, setTimeError] = useState<string | null>(null);

  // ฟังก์ชันสำหรับหาเวลาถัดไปจาก timeOptions ที่มีระยะห่างอย่างน้อย 2 ชั่วโมง
  const findNextTimeWithTwoHourGap = (baseTime: string, baseDate: Dayjs, targetDate: Dayjs) => {
    const baseDateTime = createDateTimeObject(baseDate, baseTime);
    if (!baseDateTime) return null;
    
    // เพิ่มเวลาอย่างน้อย 2 ชั่วโมง
    const minimumTime = baseDateTime.add(2, 'hour');
    
    // ตรวจสอบว่าวันเดียวกันหรือไม่
    const isSameDay = baseDate.isSame(targetDate, 'day');
    
    if (isSameDay) {
      // หาเวลาถัดไปที่ห่างอย่างน้อย 2 ชั่วโมง
      const minimumHour = minimumTime.hour();
      const minimumMinute = minimumTime.minute();
      
      const nextAvailableTime = timeOptions.find(time => {
        const isPM = time.toLowerCase().includes('pm');
        let [hours, minutes] = time
          .replace(/\s*(AM|PM|am|pm)\s*/, '')
          .split(':')
          .map(Number);
        
        if (isPM && hours < 12) hours += 12;
        else if (!isPM && hours === 12) hours = 0;
        
        return hours > minimumHour || (hours === minimumHour && minutes >= minimumMinute);
      });
      
      return nextAvailableTime;
    }
    
    // ถ้าไม่ใช่วันเดียวกัน ให้คืนค่าเวลาเริ่มต้นของวัน
    return timeOptions[0]; // ปกติคือ "10:00 AM"
  };
  
  // อัพเดท datetime objects เมื่อมีการเปลี่ยนแปลงวันที่หรือเวลา
  useEffect(() => {
    if (pickupDate && pickupTime) {
      const dateTimeObj = createDateTimeObject(pickupDate, pickupTime);
      setPickupDateTime(dateTimeObj);
    }
  }, [pickupDate, pickupTime, setPickupDateTime]);

  useEffect(() => {
    if (returnDate && returnTime) {
      const dateTimeObj = createDateTimeObject(returnDate, returnTime);
      setReturnDateTime(dateTimeObj);
    }
  }, [returnDate, returnTime, setReturnDateTime]);

  // ตรวจสอบเงื่อนไขขั้นต่ำ 2 ชั่วโมง
  useEffect(() => {
    if (pickupDateTime && returnDateTime) {
      const hoursDiff = returnDateTime.diff(pickupDateTime, "hour");
      const minutesDiff = returnDateTime.diff(pickupDateTime, "minute") % 60;
      
      if (hoursDiff < 2 || (hoursDiff === 2 && minutesDiff < 0)) {
        setTimeError("Booking must be at least 2 hours.");
      } else {
        setTimeError(null);
      }
    }
  }, [pickupDateTime, returnDateTime]);

  // อัพเดทเวลาที่คืนเมื่อมีการเลือกวันที่หรือเวลารับรถครั้งแรก
  useEffect(() => {
    // เมื่อมีการเลือกวันที่รับรถและวันที่คืนรถครั้งแรก
    if (pickupDate && returnDate && pickupTime) {
      const nextReturnTime = findNextTimeWithTwoHourGap(pickupTime, pickupDate, returnDate);
      if (nextReturnTime) {
        // ตรวจสอบว่าเวลาคืนเดิมให้ระยะเวลามากกว่า 2 ชั่วโมงหรือไม่
        const pickupDT = createDateTimeObject(pickupDate, pickupTime);
        const returnDT = createDateTimeObject(returnDate, returnTime);
        
        if (pickupDT && returnDT) {
          const hoursDiff = returnDT.diff(pickupDT, "hour");
          const minutesDiff = returnDT.diff(pickupDT, "minute") % 60;
          
          // หากไม่ถึง 2 ชั่วโมง ให้อัพเดทเวลาคืน
          if (hoursDiff < 2 || (hoursDiff === 2 && minutesDiff < 0)) {
            setReturnTime(nextReturnTime);
          }
        } else {
          // กรณีที่ยังไม่มีเวลาคืนที่ถูกต้อง
          setReturnTime(nextReturnTime);
        }
      }
    }
  }, [pickupDate, returnDate, pickupTime]);

  // ฟังก์ชันการจัดการการเปลี่ยนแปลงวันที่รับรถ
  const handlePickupDateChange = (newDate: Dayjs | null) => {
    if (!newDate) {
      setPickupDate(null);
      return;
    }
    
    setPickupDate(newDate);
    
    // ปรับวันที่คืนรถให้ไม่น้อยกว่าวันที่รับรถ
    if (returnDate && newDate.isAfter(returnDate, 'day')) {
      setReturnDate(newDate);
    } else if (!returnDate) {
      // ถ้ายังไม่เคยกำหนดวันที่คืนรถ ให้ตั้งเป็นวันเดียวกับวันที่รับรถ
      setReturnDate(newDate);
    }
    
    // ตรวจสอบและปรับเวลาคืนรถให้เป็นไปตามเงื่อนไขขั้นต่ำ 2 ชั่วโมง
    if (pickupTime && returnTime) {
      const returnDt = returnDate || newDate;
      const nextReturnTime = findNextTimeWithTwoHourGap(pickupTime, newDate, returnDt);
      
      if (nextReturnTime) {
        // ตรวจสอบว่าเวลาคืนเดิมน้อยกว่าเวลาที่ต้องการหรือไม่
        const pickupDT = createDateTimeObject(newDate, pickupTime);
        const returnDT = createDateTimeObject(returnDt, returnTime);
        
        if (pickupDT && returnDT) {
          const hoursDiff = returnDT.diff(pickupDT, "hour");
          const minutesDiff = returnDT.diff(pickupDT, "minute") % 60;
          
          if (hoursDiff < 2 || (hoursDiff === 2 && minutesDiff < 0)) {
            setReturnTime(nextReturnTime);
          }
        }
      }
    }
  };

  // ฟังก์ชันการจัดการการเปลี่ยนแปลงเวลารับรถ
  const handlePickupTimeChange = (newTime: string) => {
    setPickupTime(newTime);
    
    // ตรวจสอบและปรับเวลาคืนรถตามเงื่อนไข
    if (pickupDate && returnDate) {
      const nextReturnTime = findNextTimeWithTwoHourGap(newTime, pickupDate, returnDate);
      
      if (nextReturnTime) {
        // ตรวจสอบว่าเวลาคืนเดิมให้ระยะเวลามากกว่า 2 ชั่วโมงหรือไม่
        const newPickupDateTime = createDateTimeObject(pickupDate, newTime);
        const currentReturnDateTime = createDateTimeObject(returnDate, returnTime);
        
        if (newPickupDateTime && currentReturnDateTime) {
          const hoursDiff = currentReturnDateTime.diff(newPickupDateTime, "hour");
          const minutesDiff = currentReturnDateTime.diff(newPickupDateTime, "minute") % 60;
          
          if (hoursDiff < 2 || (hoursDiff === 2 && minutesDiff < 0)) {
            // ถ้าวันเดียวกันและเวลาที่หาได้เป็น null (หมายความว่าไม่มีช่วงเวลาที่เหมาะสม)
            if (pickupDate.isSame(returnDate, 'day') && !nextReturnTime) {
              // เลื่อนไปวันถัดไป
              setReturnDate(returnDate.add(1, 'day'));
              setReturnTime(timeOptions[0]); // ใช้เวลาเริ่มต้นของวันถัดไป
            } else {
              // ใช้เวลาที่หาได้
              setReturnTime(nextReturnTime);
            }
          }
        }
      }
    }
  };

  // ฟังก์ชันการจัดการการเปลี่ยนแปลงวันที่คืนรถ
  const handleReturnDateChange = (newDate: Dayjs | null) => {
    if (!newDate) {
      setReturnDate(null);
      return;
    }
    
    // ถ้าวันที่คืนน้อยกว่าวันที่รับ ให้ใช้วันที่รับแทน
    if (pickupDate && newDate.isBefore(pickupDate, 'day')) {
      setReturnDate(pickupDate);
      
      // ตรวจสอบว่าเวลาคืนเป็นไปตามเงื่อนไขหรือไม่
      if (pickupTime) {
        const nextReturnTime = findNextTimeWithTwoHourGap(pickupTime, pickupDate, pickupDate);
        if (nextReturnTime) setReturnTime(nextReturnTime);
      }
    } else {
      setReturnDate(newDate);
      
      // ถ้าเปลี่ยนเป็นวันคืนที่ไม่ใช่วันเดียวกับวันรับ ไม่จำเป็นต้องตรวจสอบเวลาขั้นต่ำ
      // แต่ถ้าเป็นวันเดียวกัน ต้องตรวจสอบเวลาขั้นต่ำ
      if (pickupDate && pickupDate.isSame(newDate, 'day') && pickupTime) {
        const nextReturnTime = findNextTimeWithTwoHourGap(pickupTime, pickupDate, newDate);
        if (nextReturnTime) {
          const pickupDT = createDateTimeObject(pickupDate, pickupTime);
          const returnDT = createDateTimeObject(newDate, returnTime);
          
          if (pickupDT && returnDT) {
            const hoursDiff = returnDT.diff(pickupDT, "hour");
            const minutesDiff = returnDT.diff(pickupDT, "minute") % 60;
            
            if (hoursDiff < 2 || (hoursDiff === 2 && minutesDiff < 0)) {
              setReturnTime(nextReturnTime);
            }
          }
        }
      }
    }
  };

  // ฟังก์ชันการจัดการการเปลี่ยนแปลงเวลาคืนรถ
  const handleReturnTimeChange = (newTime: string) => {
    // ตรวจสอบกรณีวันเดียวกันและต้องการระยะเวลาอย่างน้อย 2 ชั่วโมง
    if (pickupDate && returnDate && pickupDate.isSame(returnDate, 'day') && pickupDateTime) {
      const newReturnDateTime = createDateTimeObject(returnDate, newTime);
      
      if (newReturnDateTime) {
        const hoursDiff = newReturnDateTime.diff(pickupDateTime, 'hour');
        const minutesDiff = newReturnDateTime.diff(pickupDateTime, 'minute') % 60;
        
        if (hoursDiff < 2 || (hoursDiff === 2 && minutesDiff < 0)) {
          // คำนวณเวลาคืนขั้นต่ำ (รับรถ + 2 ชั่วโมง)
          const nextReturnTime = findNextTimeWithTwoHourGap(pickupTime, pickupDate, returnDate);
          
          if (nextReturnTime) {
            setReturnTime(nextReturnTime);
            setTimeError(null);
          } else {
            // ถ้าไม่พบเวลาที่เหมาะสมในวันเดียวกัน ให้เลื่อนไปวันถัดไป
            setReturnDate(returnDate.add(1, 'day'));
            setReturnTime(timeOptions[0]);  // เวลาเริ่มต้นของวันถัดไป
            setTimeError(null);
          }
          
          return;
        }
      }
    }
    
    // ผ่านการตรวจสอบแล้ว ให้อัพเดทเวลาคืนตามปกติ
    setReturnTime(newTime);
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-serif font-medium mb-6 text-[#6B5B35]">
        Booking Information
      </h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
        <div className="p-6 space-y-5">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">
              Full Name
            </p>
            <input
              type="text"
              value={nameLastname}
              onChange={(e) => setNameLastname(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:border-transparent transition-colors duration-200 mt-1"
              required
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">
              Contact Number
            </p>
            <input
              type="tel"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:border-transparent transition-colors duration-200 mt-1"
              required
              placeholder="Enter your phone number"
            />
          </div>

          {/* Date/time fields with improved styling */}
<div className="grid grid-cols-2 gap-4">
  <div>
    <p className="text-sm font-medium text-gray-700 mb-1.5">
      Pickup Date
    </p>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <input
        type="date"
        value={pickupDate ? pickupDate.format("YYYY-MM-DD") : ""}
        onChange={(e) => {
          const newDate = e.target.value ? dayjs(e.target.value) : null;
          handlePickupDateChange(newDate);
        }}
        min={today.format("YYYY-MM-DD")}
        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:border-transparent transition-colors duration-200 text-sm"
      />
    </div>
  </div>
  <div>
    <p className="text-sm font-medium text-gray-700 mb-1.5">
      Pickup Time
    </p>
    <select
      value={pickupTime}
      onChange={(e) => handlePickupTimeChange(e.target.value)}
      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:border-transparent transition-colors duration-200 text-sm"
    >
      {timeOptions.map((time) => (
        <option key={time} value={time}>
          {time}
        </option>
      ))}
    </select>
  </div>
</div>

<div className="grid grid-cols-2 gap-4 mt-4">
  <div>
    <p className="text-sm font-medium text-gray-700 mb-1.5">
      Return Date
    </p>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <input
        type="date"
        value={returnDate ? returnDate.format("YYYY-MM-DD") : ""}
        onChange={(e) => {
          const newDate = e.target.value ? dayjs(e.target.value) : null;
          handleReturnDateChange(newDate);
        }}
        min={
          pickupDate ? pickupDate.format("YYYY-MM-DD") : today.format("YYYY-MM-DD")
        }
        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:border-transparent transition-colors duration-200 text-sm"
      />
    </div>
  </div>
  <div>
    <p className="text-sm font-medium text-gray-700 mb-1.5">
      Return Time
    </p>
    <select
      value={returnTime}
      onChange={(e) => handleReturnTimeChange(e.target.value)}
      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:border-transparent transition-colors duration-200 text-sm"
    >
      {timeOptions.map((time) => (
        <option key={time} value={time}>
          {time}
        </option>
      ))}
    </select>
  </div>
</div>

{/* ข้อความแสดงข้อผิดพลาดเกี่ยวกับเวลาขั้นต่ำ */}
{timeError && (
  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md mt-2 border border-red-200">
    <div className="flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p>{timeError}</p>
    </div>
  </div>
)}

{/* Rental duration display */}
{pickupDateTime && returnDateTime && !timeError && (
  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md mt-4 border border-gray-200">
    {(() => {
      // คำนวณจำนวนวันเช่ารถตามเงื่อนไขที่กำหนด
      const rentalDays = calculateRentalDays(pickupDateTime, returnDateTime);
      
      return (
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#8A7D55]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Rental duration: <span className="font-medium">{rentalDays} {rentalDays === 1 ? 'day' : 'days'}</span></p>
        </div>
      );
    })()}
  </div>
)}

{/* Availability message */}
{availabilityMessage && (
  <div
    className={`p-3 rounded-md text-sm ${
      isAvailable
        ? "bg-green-50 text-green-700"
        : "bg-red-50 text-red-700"
    }`}
  >
    {isCheckingAvailability ? (
      <div className="flex items-center">
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2"></div>
        {availabilityMessage}
      </div>
    ) : (
      availabilityMessage
    )}
  </div>
)}
        </div>
      </div>

      {/* Provider Details */}
      <div
        className={`${
          isAvailable ? "mt-4" : "mt-8"
        } bottom-0 bg-white shadow-md rounded-lg overflow-hidden`}
      >
        {providerId && token && (
          <ProviderDetail providerId={providerId} token={token} />
        )}
      </div>
    </div>
  );
};

export default BookingForm;