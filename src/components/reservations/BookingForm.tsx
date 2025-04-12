"use client";

import React, { useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import ProviderDetail from "@/components/provider/providerDetail";
import { timeOptions, createDateTimeObject } from "@/libs/bookingUtils";

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
  // เพิ่ม props เพื่อรับค่า datetime objects
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

  // ฟังก์ชันสำหรับตรวจสอบและแก้ไขกรณีเลือกวันที่ return น้อยกว่า pickup
  const handleReturnDateChange = (newDate: Dayjs | null) => {
    // ถ้าไม่มีวันที่ pickup หรือ newDate เป็น null ให้ตั้งค่าตามปกติ
    if (!pickupDate || !newDate) {
      setReturnDate(newDate);
      return;
    }
    
    // ถ้าวันที่ return น้อยกว่า pickup ให้ใช้วันที่ pickup
    if (newDate.isBefore(pickupDate, 'day')) {
      setReturnDate(pickupDate);
    } else {
      setReturnDate(newDate);
    }
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-2xl font-serif font-medium mb-6">
        Booking Information
      </h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 space-y-4 ">
          <div>
            <p className="text-sm font-medium text-gray-700">Full Name</p>
            <input
              type="text"
              value={nameLastname}
              onChange={(e) => setNameLastname(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55] mt-1"
              required
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              Contact Number
            </p>
            <input
              type="tel"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55] mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Pickup Date
              </p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-gray-400"
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
                    setPickupDate(newDate);
                    
                    // ถ้าวันที่ pickup มากกว่าวันที่ return ให้ปรับ return ด้วย
                    if (newDate && returnDate && newDate.isAfter(returnDate, 'day')) {
                      setReturnDate(newDate);
                    }
                  }}
                  min={dayjs().format("YYYY-MM-DD")} // ไม่ให้เลือกวันที่ผ่านมาแล้ว
                  className="block w-full pl-5 pr-2 py-1 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-[#8A7D55] focus:border-[#8A7D55] text-xs"
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Pickup Time
              </p>
              <select
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Return Date
              </p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-gray-400"
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
                    pickupDate ? pickupDate.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")
                  }
                  className="block w-full pl-5 pr-2 py-1 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-[#8A7D55] focus:border-[#8A7D55] text-xs"
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Return Time
              </p>
              <select
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* แสดงจำนวนวันเช่า (ไม่จำเป็นแต่อาจจะมีประโยชน์สำหรับผู้ใช้) */}
          {pickupDateTime && returnDateTime && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
              {(() => {
                // คำนวณจำนวนวันเช่าโดยใช้ logic ตามที่กำหนด
                const days = returnDateTime.diff(pickupDateTime, "day");
                let rentalDays = days;
                
                if (days === 0) {
                  return <p>Rental duration: 1 day</p>;
                } else {
                  const pickupHour = pickupDateTime.hour();
                  const pickupMinute = pickupDateTime.minute();
                  const returnHour = returnDateTime.hour();
                  const returnMinute = returnDateTime.minute();
                  
                  if (returnHour > pickupHour || (returnHour === pickupHour && returnMinute > pickupMinute)) {
                    rentalDays = days + 1;
                  }
                  
                  return <p>Rental duration: {rentalDays} {rentalDays === 1 ? 'day' : 'days'}</p>;
                }
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
        className={` ${
          isAvailable ? "mt-4" : "mt-8"
        } bottom-0 bg-white shadow-md rounded-lg overflow-hidden`}
      >
        {providerId && token && (
          <ProviderDetail
            providerId={providerId}
            token={token}
          />
        )}
      </div>
    </div>
  );
};

export default BookingForm;