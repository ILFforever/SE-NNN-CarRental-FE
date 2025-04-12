import dayjs, { Dayjs } from "dayjs";
import { API_BASE_URL } from "@/config/apiConfig";
import { isBookingAtLeastTwoHours } from "./bookingUtils";

interface AvailabilityResponse {
  success: boolean;
  data: {
    available: boolean;
    conflicts?: any[];
  };
  message?: string;
}

/**
 * ตรวจสอบความพร้อมใช้งานของรถตามช่วงเวลาที่กำหนด
 * @param carId ID ของรถที่ต้องการตรวจสอบ
 * @param pickupDateTime วันเวลาที่ต้องการรับรถ
 * @param returnDateTime วันเวลาที่ต้องการคืนรถ
 * @param token Token สำหรับการเรียก API
 * @returns ผลการตรวจสอบความพร้อมใช้งาน
 */
export const checkCarAvailability = async (
  carId: string,
  pickupDateTime: Dayjs | null,
  returnDateTime: Dayjs | null,
  token: string
): Promise<{ isAvailable: boolean; availabilityMessage: string; conflicts?: any[] }> => {
  try {
    // ตรวจสอบว่ามีข้อมูลวันเวลาครบถ้วนหรือไม่
    if (!pickupDateTime || !returnDateTime) {
      return {
        isAvailable: false,
        availabilityMessage: "Please select both pickup and return date/time.",
      };
    }
    
    // ตรวจสอบว่าการจองใช้เวลาอย่างน้อย 2 ชั่วโมงหรือไม่
    if (!isBookingAtLeastTwoHours(pickupDateTime, returnDateTime)) {
      return {
        isAvailable: false,
        availabilityMessage: "Booking must be at least 2 hours.",
      };
    }
    
    // Prevent checking if pickup date is after return date
    if (pickupDateTime.isAfter(returnDateTime)) {
      return {
        isAvailable: false,
        availabilityMessage: "Pickup date and time cannot be after return date and time",
      };
    }
    
    // Format dates and times for the API
    const formattedStartDate = pickupDateTime.format("YYYY-MM-DD");
    const formattedReturnDate = returnDateTime.format("YYYY-MM-DD");
    const formattedStartTime = pickupDateTime.format("HH:mm");
    const formattedReturnTime = returnDateTime.format("HH:mm");
    
    const response = await fetch(
      `${API_BASE_URL}/cars/check-availability/${carId}?startDate=${formattedStartDate}&returnDate=${formattedReturnDate}&startTime=${formattedStartTime}&returnTime=${formattedReturnTime}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    if (!response.ok) throw new Error("Failed to check car availability");
    
    const availabilityData: AvailabilityResponse = await response.json();
    
    if (!availabilityData.success) {
      throw new Error(availabilityData.message || "Failed to check availability");
    }
    
    const available = availabilityData.data.available;
    const conflicts = availabilityData.data.conflicts || [];
    let message = "";
    
    if (available) {
      message = "Car is available for selected dates and times!";
    } else {
      if (conflicts.length > 0) {
        message = `Car is not available for the selected dates and times. There ${
          conflicts.length === 1 ? "is" : "are"
        } ${conflicts.length} existing ${
          conflicts.length === 1 ? "booking" : "bookings"
        } during this period.`;
      } else {
        message = "Car is not available for the selected dates and times. Please choose different schedule.";
      }
    }
    
    return {
      isAvailable: available,
      availabilityMessage: message,
      conflicts,
    };
  } catch (error) {
    console.error("Error checking car availability:", error);
    return {
      isAvailable: false,
      availabilityMessage: "Error checking availability. Please try again.",
    };
  }
};

/**
 * ตรวจสอบว่าการจองทับกับการจองอื่นหรือไม่
 * @param existingBookings รายการการจองที่มีอยู่
 * @param newPickupDateTime วันเวลาที่ต้องการรับรถของการจองใหม่
 * @param newReturnDateTime วันเวลาที่ต้องการคืนรถของการจองใหม่
 * @returns ผลการตรวจสอบการทับซ้อน
 */
export const checkOverlappingBookings = (
  existingBookings: any[],
  newPickupDateTime: Dayjs,
  newReturnDateTime: Dayjs
): { isOverlapping: boolean; overlappingBooking: any | null } => {
  // ตรวจสอบการทับซ้อนกับการจองที่มีอยู่
  for (const booking of existingBookings) {
    const existingPickup = dayjs(booking.pickupDateTime);
    const existingReturn = dayjs(booking.returnDateTime);
    
    // ต้องเว้นช่วง 1 ชั่วโมงระหว่างการจอง
    const availableAfterReturn = existingReturn.add(1, 'hour');
    
    // ตรวจสอบการทับซ้อน
    if (
      // กรณี 1: การจองใหม่เริ่มระหว่างการจองเดิม
      (newPickupDateTime.isAfter(existingPickup) && newPickupDateTime.isBefore(availableAfterReturn)) ||
      // กรณี 2: การจองใหม่จบระหว่างการจองเดิม
      (newReturnDateTime.isAfter(existingPickup) && newReturnDateTime.isBefore(availableAfterReturn)) ||
      // กรณี 3: การจองใหม่ครอบคลุมการจองเดิม
      (newPickupDateTime.isBefore(existingPickup) && newReturnDateTime.isAfter(availableAfterReturn)) ||
      // กรณี 4: การจองใหม่เริ่มตรงกับการจองเดิม
      newPickupDateTime.isSame(existingPickup)
    ) {
      return {
        isOverlapping: true,
        overlappingBooking: booking,
      };
    }
  }
  
  return {
    isOverlapping: false,
    overlappingBooking: null,
  };
};