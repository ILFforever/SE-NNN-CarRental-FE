import dayjs, { Dayjs } from "dayjs";

/**
 * List of available time options
 */
export const timeOptions = [
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM"
];

// Tier name mapping
export const getTierName = (tier: number): string => {
  const tierNames = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
  return tierNames[tier] || `Tier ${tier}`;
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

// Tier discount percentage
export const getTierDiscount = (tier: number): number => {
  const tierDiscount = [0, 5, 10, 15, 20];
  return tierDiscount[tier] || 0;
};

/**
 * Create a Dayjs datetime object from a date and time string
 * @param date Dayjs date object
 * @param timeString Time string in format "HH:MM AM/PM"
 * @returns Dayjs datetime object or null if invalid
 */
export function createDateTimeObject(date: Dayjs, timeString: string): Dayjs | null {
  if (!date || !timeString) return null;

  try {
    // Parse the time string
    const isPM = timeString.toLowerCase().includes("pm");
    let [hours, minutes] = timeString
      .replace(/\s*(AM|PM|am|pm)\s*/, "")
      .split(":")
      .map(Number);

    // Convert to 24-hour format if PM
    if (isPM && hours < 12) hours += 12;
    else if (!isPM && hours === 12) hours = 0;

    // Create new Dayjs object with the same date but updated time
    return date.hour(hours).minute(minutes).second(0).millisecond(0);
  } catch (error) {
    console.error("Error parsing time:", error);
    return null;
  }
}

/**
 * Check if booking spans at least two hours
 * @param pickupDateTime Pickup datetime
 * @param returnDateTime Return datetime
 * @returns True if booking spans at least two hours, false otherwise
 */
export function isBookingAtLeastTwoHours(
  pickupDateTime: Dayjs | null,
  returnDateTime: Dayjs | null
): boolean {
  if (!pickupDateTime || !returnDateTime) return false;
  
  // Calculate the difference in minutes
  const diffMinutes = returnDateTime.diff(pickupDateTime, "minute");
  
  // Check if the difference is at least 120 minutes (2 hours)
  return diffMinutes >= 120;
}

/**
 * Calculate the number of rental days
 * @param pickupDateTime Pickup datetime
 * @param returnDateTime Return datetime
 * @returns The number of rental days
 */
export function calculateRentalDays(
  pickupDateTime: Dayjs | null,
  returnDateTime: Dayjs | null
): number {
  if (!pickupDateTime || !returnDateTime) return 0;

  if (returnDateTime.isSame(pickupDateTime, "day")) {
    return 1;
  }

  const days = returnDateTime.diff(pickupDateTime, "day");

  const pickupHour = pickupDateTime.hour();
  const pickupMinute = pickupDateTime.minute();
  const returnHour = returnDateTime.hour();
  const returnMinute = returnDateTime.minute();

  if (returnHour === pickupHour && returnMinute === pickupMinute) {
    return days;
  }
  
  return days + 1;
}

/**
 * Get the rental period description
 * @param pickupDateTime Pickup datetime
 * @param returnDateTime Return datetime
 * @returns Description of the rental period
 */
export function getRentalPeriodText(
  pickupDateTime: Dayjs | null,
  returnDateTime: Dayjs | null
): string {
  if (!pickupDateTime || !returnDateTime) return "";
  
  const diffDays = calculateRentalDays(pickupDateTime, returnDateTime);
  
  if (diffDays === 1) {
    return "1 day";
  } else {
    return `${diffDays} days`;
  }
}

/**
 * Get the rental period in days
 * @param pickupDateTime Pickup datetime
 * @param returnDateTime Return datetime
 * @returns Number of days
 */
export function getRentalPeriod(
  pickupDateTime: Dayjs | null,
  returnDateTime: Dayjs | null
): number {
  return calculateRentalDays(pickupDateTime, returnDateTime);
}

/**
 * Validate if the booking duration meets the minimum requirements
 * @param pickupDateTime Pickup datetime
 * @param returnDateTime Return datetime
 * @returns Object with validation result and message
 */
export function validateBookingDuration(
  pickupDateTime: Dayjs | null,
  returnDateTime: Dayjs | null
): { isValid: boolean; message: string; errorMessage?: string } {
  // ถ้าวันที่ใดวันที่หนึ่งเป็น null
  if (!pickupDateTime || !returnDateTime) {
    return { 
      isValid: false, 
      message: "Please select both pickup and return date and time.",
      errorMessage: "Please select both pickup and return date and time."
    };
  }

  // คำนวณความแตกต่างในนาที
  const diffMinutes = returnDateTime.diff(pickupDateTime, "minute");

  // ตรวจสอบว่าเวลารับอยู่ก่อนเวลาคืน
  if (diffMinutes <= 0) {
    return {
      isValid: false,
      message: "Return time must be after pickup time.",
      errorMessage: "Return time must be after pickup time."
    };
  }

  // ตรวจสอบว่าเป็นการจองในวันเดียวกันหรือไม่
  const isSameDay = pickupDateTime.isSame(returnDateTime, "day");

  // ถ้าเป็นวันเดียวกัน ตรวจสอบเงื่อนไขขั้นต่ำ 2 ชั่วโมง (120 นาที)
  if (isSameDay && diffMinutes < 120) {
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    const missingMinutes = 120 - diffMinutes;
    
    return {
      isValid: false,
      message: `Same-day bookings require at least 2 hours. Current duration: ${hours}h ${mins}m (${missingMinutes} minutes short)`,
      errorMessage: `Same-day bookings require a minimum of 2 hours. Current duration: ${hours} hour${hours !== 1 ? "s" : ""} and ${mins} minute${mins !== 1 ? "s" : ""}.`
    };
  }

  return { isValid: true, message: "" };
}

/**
 * Format duration in minutes to a readable string
 * @param minutes Duration in minutes
 * @returns Formatted duration string
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
  } else if (mins === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else {
    return `${hours} hour${hours !== 1 ? 's' : ''} and ${mins} minute${mins !== 1 ? 's' : ''}`;
  }
}

/**
 * Find the next time option with at least a 2-hour gap from base time
 * @param baseTime Base time string
 * @param baseDate Base date
 * @param targetDate Target date
 * @returns Next time option or null if not found
 */
export function findNextTimeWithTwoHourGap(
  baseTime: string,
  baseDate: Dayjs,
  targetDate: Dayjs
): string | null {
  const baseDateTime = createDateTimeObject(baseDate, baseTime);
  if (!baseDateTime) return null;

  // Add at least 2 hours
  const minimumTime = baseDateTime.add(2, "hour");

  // Check if it's the same day
  const isSameDay = baseDate.isSame(targetDate, "day");

  if (isSameDay) {
    // Find the next time option that's at least 2 hours after the base time
    const minimumHour = minimumTime.hour();
    const minimumMinute = minimumTime.minute();

    const nextAvailableTime = timeOptions.find((time) => {
      const isPM = time.toLowerCase().includes("pm");
      let [hours, minutes] = time
        .replace(/\s*(AM|PM|am|pm)\s*/, "")
        .split(":")
        .map(Number);

      if (isPM && hours < 12) hours += 12;
      else if (!isPM && hours === 12) hours = 0;

      return (
        hours > minimumHour ||
        (hours === minimumHour && minutes >= minimumMinute)
      );
    });

    return nextAvailableTime || null;
  }

  // If it's not the same day, return the first time option
  return timeOptions[0]; // Usually "10:00 AM"
}

/**
 * Check availability of booking with backend API
 * @param pickupDateTime Pickup datetime
 * @param returnDateTime Return datetime
 * @param providerId Provider ID
 * @returns Promise with availability check result
 */
export async function checkAvailability(
  pickupDateTime: Dayjs | null,
  returnDateTime: Dayjs | null,
  providerId: string
): Promise<{ isAvailable: boolean; message: string }> {
  if (!pickupDateTime || !returnDateTime || !providerId) {
    return { 
      isAvailable: false, 
      message: "Please provide all required booking information" 
    };
  }

  try {
    // Format dates for API
    const pickupDate = pickupDateTime.format("YYYY-MM-DD");
    const pickupTime = pickupDateTime.format("HH:mm");
    const returnDate = returnDateTime.format("YYYY-MM-DD");
    const returnTime = returnDateTime.format("HH:mm");

    // Call API endpoint to check availability
    const response = await fetch("/api/check-availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        providerId,
        pickupDate,
        pickupTime, 
        returnDate,
        returnTime
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to check availability");
    }

    const data = await response.json();
    
    return {
      isAvailable: data.isAvailable,
      message: data.isAvailable 
        ? "This time slot is available!" 
        : "This time slot is not available. Please select another time."
    };
  } catch (error) {
    console.error("Error checking availability:", error);
    return {
      isAvailable: false,
      message: "Error checking availability. Please try again."
    };
  }
}

/**
 * Calculate total service cost correctly handling daily vs one-time services
 */
export const calculateServicesTotalCost = (
  selectedServices: string[],
  services: any[],
  pickupDateTime: Dayjs | null,
  returnDateTime: Dayjs | null
): number => {
  if (!selectedServices.length) return 0;

  const days = calculateRentalDays(pickupDateTime, returnDateTime);

  return services
    .filter((service) => selectedServices.includes(service._id))
    .reduce((total, service) => {
      // Daily services are multiplied by the number of days
      // One-time services are added just once
      const serviceCost = service.daily ? service.rate * days : service.rate;
      return total + serviceCost;
    }, 0);
};

/**
 * Calculate subtotal (car cost + services cost)
 */
export const calculateSubtotal = (
  pickupDateTime: Dayjs | null,
  returnDateTime: Dayjs | null,
  dailyRate: number = 0,
  selectedServices: string[],
  services: any[]
): number => {
  const days = calculateRentalDays(pickupDateTime, returnDateTime);
  const carCost = days * dailyRate;
  const servicesCost = calculateServicesTotalCost(
    selectedServices,
    services,
    pickupDateTime,
    returnDateTime
  );

  return carCost + servicesCost;
};

/**
 * Calculate discount based on user tier
 */
export const calculateDiscount = (
  pickupDateTime: Dayjs | null,
  returnDateTime: Dayjs | null,
  dailyRate: number = 0,
  selectedServices: string[],
  services: any[],
  userTier: number
): number => {
  const subtotal = calculateSubtotal(
    pickupDateTime,
    returnDateTime,
    dailyRate,
    selectedServices,
    services
  );

  return subtotal * (getTierDiscount(userTier) / 100);
};

/**
 * คำนวณราคาทั้งหมดตามจำนวนวัน
 */
export const getTotalCost = (
  pickupDateTime: Dayjs | null,
  returnDateTime: Dayjs | null,
  dailyRate: number = 0,
  selectedServices: string[],
  services: any[],
  userTier: number
): number => {
  const subtotal = calculateSubtotal(
    pickupDateTime,
    returnDateTime,
    dailyRate,
    selectedServices,
    services
  );

  const discount = calculateDiscount(
    pickupDateTime,
    returnDateTime,
    dailyRate,
    selectedServices,
    services,
    userTier
  );

  return subtotal - discount;
};

/**
 * แปลงเวลาในรูปแบบ "10:00 AM" เป็นนาทีตั้งแต่เที่ยงคืน
 */
export const convertTimeToMinutes = (timeStr: string): number => {
  const isPM = timeStr.toLowerCase().includes("pm");
  const timePattern = /(\d{1,2}):(\d{2})/;
  const match = timeStr.match(timePattern);

  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (isPM && hours < 12) hours += 12;
  else if (!isPM && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

/**
 * คำนวณและแสดงระยะเวลาจองที่แม่นยำ
 */
export const getRentalDurationText = (
  pickupDateTime: Dayjs | null,
  returnDateTime: Dayjs | null
): string => {
  if (!pickupDateTime || !returnDateTime) {
    return "";
  }

  const diffMinutes = returnDateTime.diff(pickupDateTime, "minute");

  if (diffMinutes <= 0) {
    return "Invalid duration";
  }

  return formatDuration(diffMinutes);
};