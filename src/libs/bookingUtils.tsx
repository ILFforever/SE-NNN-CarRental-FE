import dayjs, { Dayjs } from "dayjs";

// Tier name mapping
export const getTierName = (tier: number) => {
  const tierNames = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
  return tierNames[tier] || `Tier ${tier}`;
};

// Format currency
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

// Tier discount percentage
export const getTierDiscount = (tier: number) => {
  const tierDiscount = [0, 5, 10, 15, 20];
  return tierDiscount[tier] || 0;
};

// Time options for pickup and return times
export const timeOptions = [
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
];

// Helper function to convert time string to dayjs object with date
export const createDateTimeObject = (date: Dayjs | null, timeStr: string) => {
  if (!date || !timeStr) return null;

  const isPM = timeStr.toLowerCase().includes("pm");
  const timePattern = /(\d{1,2}):(\d{2})/;
  const match = timeStr.match(timePattern);

  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (isPM && hours < 12) {
    hours += 12;
  } else if (!isPM && hours === 12) {
    hours = 0;
  }

  return date.hour(hours).minute(minutes).second(0);
};

// Calculate rental period with precise time consideration
export const getRentalPeriod = (
  pickupDateTime: Dayjs | null,
  returnDateTime: Dayjs | null
) => {
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
};

// คำนวณจำนวนวันเช่ารถตามเงื่อนไขที่กำหนด - เหมือนกับ getRentalPeriod เพื่อความเข้ากันได้กับโค้ดเดิม
export const calculateRentalDays = getRentalPeriod;

/**
 * ตรวจสอบว่าการจองใช้เวลาอย่างน้อย 2 ชั่วโมงหรือไม่
 * ฟังก์ชันนี้ยังคงใช้ได้แต่ควรใช้ validateBookingDuration แทนเพื่อข้อความที่เป็นประโยชน์กว่า
 */
export const isBookingAtLeastTwoHours = (
  pickupDateTime: Dayjs | null,
  returnDateTime: Dayjs | null
): boolean => {
  if (!pickupDateTime || !returnDateTime) return false;
  const hoursDiff = returnDateTime.diff(pickupDateTime, "hour");
  const minutesDiff = returnDateTime.diff(pickupDateTime, "minute") % 60;
  return hoursDiff > 2 || (hoursDiff === 2 && minutesDiff >= 0);
};

// Calculate total service cost correctly handling daily vs one-time services
export const calculateServicesTotalCost = (
  selectedServices: string[],
  services: Service[],
  pickupDateTime: Dayjs | null,
  returnDateTime: Dayjs | null
) => {
  if (!selectedServices.length) return 0;

  const days = getRentalPeriod(pickupDateTime, returnDateTime);

  return services
    .filter((service) => selectedServices.includes(service._id))
    .reduce((total, service) => {
      // Daily services are multiplied by the number of days
      // One-time services are added just once
      const serviceCost = service.daily ? service.rate * days : service.rate;
      return total + serviceCost;
    }, 0);
};

// Calculate subtotal (car cost + services cost)
export const calculateSubtotal = (
  pickupDateTime: Dayjs | null,
  returnDateTime: Dayjs | null,
  dailyRate: number = 0,
  selectedServices: string[],
  services: Service[]
) => {
  const days = getRentalPeriod(pickupDateTime, returnDateTime);
  const carCost = days * dailyRate;
  const servicesCost = calculateServicesTotalCost(
    selectedServices,
    services,
    pickupDateTime,
    returnDateTime
  );

  return carCost + servicesCost;
};

// Calculate discount based on user tier
export const calculateDiscount = (
  pickupDateTime: Dayjs | null,
  returnDateTime: Dayjs | null,
  dailyRate: number = 0,
  selectedServices: string[],
  services: Service[],
  userTier: number
) => {
  const subtotal = calculateSubtotal(
    pickupDateTime,
    returnDateTime,
    dailyRate,
    selectedServices,
    services
  );

  return subtotal * (getTierDiscount(userTier) / 100);
};

// คำนวณราคาทั้งหมดตามจำนวนวัน
export const getTotalCost = (
  pickupDateTime: Dayjs | null,
  returnDateTime: Dayjs | null,
  dailyRate: number = 0,
  selectedServices: string[],
  services: Service[],
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
 * ฟังก์ชันใหม่เพื่อตรวจสอบเงื่อนไขเวลาจองขั้นต่ำ (2 ชั่วโมงสำหรับการจองในวันเดียวกัน)
 * @param pickupDateTime เวลารับรถ
 * @param returnDateTime เวลาคืนรถ
 * @returns ผลลัพธ์การตรวจสอบพร้อมข้อความแสดงผล
 */
export const validateBookingDuration = (
  pickupDateTime: Dayjs | null,
  returnDateTime: Dayjs | null
): { isValid: boolean; errorMessage: string | null } => {
  // ถ้าวันที่ใดวันที่หนึ่งเป็น null
  if (!pickupDateTime || !returnDateTime) {
    return {
      isValid: false,
      errorMessage: "Please select both pickup and return date and time.",
    };
  }

  // คำนวณความแตกต่างในนาที
  const diffMinutes = returnDateTime.diff(pickupDateTime, "minute");

  // ตรวจสอบว่าเวลารับอยู่ก่อนเวลาคืน
  if (diffMinutes <= 0) {
    return {
      isValid: false,
      errorMessage: "Return time must be after pickup time.",
    };
  }

  // ตรวจสอบว่าเป็นการจองในวันเดียวกันหรือไม่
  const isSameDay = pickupDateTime.isSame(returnDateTime, "day");

  // ถ้าเป็นวันเดียวกัน ตรวจสอบเงื่อนไขขั้นต่ำ 2 ชั่วโมง (120 นาที)
  if (isSameDay && diffMinutes < 120) {
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return {
      isValid: false,
      errorMessage: `Same-day bookings require a minimum of 2 hours. Current duration: ${hours} hour${
        hours !== 1 ? "s" : ""
      } and ${mins} minute${mins !== 1 ? "s" : ""}.`,
    };
  }

  return { isValid: true, errorMessage: null };
};
/**
 * แปลงเวลาในรูปแบบ "10:00 AM" เป็นนาทีตั้งแต่เที่ยงคืน
 * @param timeStr เวลาในรูปแบบ string
 * @returns นาทีตั้งแต่เที่ยงคืน
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
 * แสดงระยะเวลาในรูปแบบที่อ่านง่าย
 * @param minutes ระยะเวลาเป็นนาที
 * @returns ข้อความแสดงระยะเวลา เช่น "2 hours and 30 minutes"
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins} minute${mins !== 1 ? "s" : ""}`;
  } else if (mins === 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  } else {
    return `${hours} hour${hours !== 1 ? "s" : ""} and ${mins} minute${
      mins !== 1 ? "s" : ""
    }`;
  }
};

/**
 * คำนวณและแสดงระยะเวลาจองที่แม่นยำ
 * @param pickupDateTime เวลารับรถ
 * @param returnDateTime เวลาคืนรถ
 * @returns ข้อความแสดงระยะเวลาที่แม่นยำ
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
