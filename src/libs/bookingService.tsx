import dayjs, { Dayjs } from "dayjs";
import { API_BASE_URL } from "@/config/apiConfig";
import { 
  isBookingAtLeastTwoHours, 
  calculateRentalDays, 
  getTotalCost,
  calculateSubtotal,
  calculateDiscount,
  getTierDiscount,
  getTierName,
  getRentalPeriod
} from "./bookingUtils";

interface BookingResponse {
  success: boolean;
  data?: any;
  message?: string;
}

/**
 * สร้างการจองใหม่
 * @param carId ID ของรถที่ต้องการจอง
 * @param pickupDateTime วันเวลาที่ต้องการรับรถ
 * @param returnDateTime วันเวลาที่ต้องการคืนรถ
 * @param selectedServices บริการเสริมที่เลือก
 * @param services รายการบริการเสริมทั้งหมด
 * @param userTier ระดับของผู้ใช้ (สำหรับคำนวณส่วนลด)
 * @param dailyRate อัตราค่าเช่าต่อวัน
 * @param token Token สำหรับการเรียก API
 * @returns ผลการสร้างการจอง
 */
export const makeBooking = async (
  carId: string,
  pickupDateTime: Dayjs | null,
  returnDateTime: Dayjs | null,
  selectedServices: string[],
  services: Service[],
  userTier: number,
  dailyRate: number,
  token: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // ตรวจสอบว่ามีข้อมูลวันเวลาครบถ้วนหรือไม่
    if (!pickupDateTime || !returnDateTime) {
      return {
        success: false,
        message: "Please select both pickup and return date/time.",
      };
    }
    
    // ตรวจสอบว่าการจองใช้เวลาอย่างน้อย 2 ชั่วโมงหรือไม่
    if (!isBookingAtLeastTwoHours(pickupDateTime, returnDateTime)) {
      return {
        success: false,
        message: "Booking must be at least 2 hours.",
      };
    }
    
    // Format dates and times for the API
    const formattedStartDate = pickupDateTime.format("YYYY-MM-DD");
    const formattedReturnDate = returnDateTime.format("YYYY-MM-DD");
    const formattedStartTime = pickupDateTime.format("HH:mm");
    const formattedReturnTime = returnDateTime.format("HH:mm");
    
    // Double-check availability one more time before booking
    const availabilityResponse = await fetch(
      `${API_BASE_URL}/cars/check-availability/${carId}?startDate=${formattedStartDate}&returnDate=${formattedReturnDate}&startTime=${formattedStartTime}&returnTime=${formattedReturnTime}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    if (!availabilityResponse.ok) {
      throw new Error("Failed to check car availability");
    }
    
    const availabilityData = await availabilityResponse.json();
    
    if (!availabilityData.success) {
      throw new Error(
        availabilityData.message || "Failed to check availability"
      );
    }
    
    const isStillAvailable = availabilityData.data.available;
    
    if (!isStillAvailable) {
      return {
        success: false,
        message: "Car is no longer available for the selected dates and times. Another booking may have been made. Please choose different schedule."
      };
    }
    
    // Calculate all price values with the updated time-aware rental period
    const days = getRentalPeriod(pickupDateTime, returnDateTime);
    const basePrice = days * dailyRate;
    
    // Get service price using the utility function
    const servicePrice = services
      .filter((service) => selectedServices.includes(service._id))
      .reduce((total, service) => {
        const serviceCost = service.daily ? service.rate * days : service.rate;
        return total + serviceCost;
      }, 0);
    
    const subtotal = calculateSubtotal(
      pickupDateTime,
      returnDateTime,
      dailyRate,
      selectedServices,
      services
    );
    
    const discountAmount = calculateDiscount(
      pickupDateTime,
      returnDateTime,
      dailyRate,
      selectedServices,
      services,
      userTier
    );
    
    const finalPrice = subtotal - discountAmount;
    
    // Send booking data to backend
    const response = await fetch(`${API_BASE_URL}/rents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: formattedStartDate,
        returnDate: formattedReturnDate,
        startTime: formattedStartTime,
        returnTime: formattedReturnTime,
        car: carId,
        price: basePrice,
        servicePrice: servicePrice,
        discountAmount: discountAmount,
        finalPrice: finalPrice,
        service: selectedServices,
        rentalDays: days,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || "Booking failed. Please try again."
      };
    }
    
    return {
      success: true,
      message: "Booking successful!"
    };
  } catch (error) {
    console.error("Error booking:", error);
    return {
      success: false,
      message: "An error occurred. Please try again."
    };
  }
};

/**
 * ยกเลิกการจอง
 * @param bookingId ID ของการจองที่ต้องการยกเลิก
 * @param token Token สำหรับการเรียก API
 * @returns ผลการยกเลิกการจอง
 */
export const cancelBooking = async (
  bookingId: string,
  token: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/rents/${bookingId}/cancel`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        message: "Booking cancelled successfully!",
      };
    }

    return {
      success: false,
      message: data.message || "Failed to cancel booking.",
    };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return {
      success: false,
      message: "Error cancelling booking. Please try again.",
    };
  }
};

/**
 * ดึงข้อมูลการจองของผู้ใช้
 * @param token Token สำหรับการเรียก API
 * @returns รายการการจองของผู้ใช้
 */
export const getUserBookings = async (token: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/rents/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        bookings: data.data || [],
      };
    }

    return {
      success: false,
      message: data.message || "Failed to fetch bookings.",
      bookings: [],
    };
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return {
      success: false,
      message: "Error fetching bookings. Please try again.",
      bookings: [],
    };
  }
};

/**
 * ดึงข้อมูลการจองโดยใช้ ID
 * @param bookingId ID ของการจองที่ต้องการดึงข้อมูล
 * @param token Token สำหรับการเรียก API
 * @returns ข้อมูลการจอง
 */
export const getBookingById = async (
  bookingId: string,
  token: string
): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/rents/${bookingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        booking: data.data,
      };
    }

    return {
      success: false,
      message: data.message || "Failed to fetch booking details.",
      booking: null,
    };
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return {
      success: false,
      message: "Error fetching booking details. Please try again.",
      booking: null,
    };
  }
};