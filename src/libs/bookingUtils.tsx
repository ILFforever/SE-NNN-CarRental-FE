import { Dayjs } from 'dayjs';

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

// Tier discount
export const getTierDiscount = (tier: number) => {
  const tierDiscount = [0, 5, 10, 15, 20];
  return tierDiscount[tier];
};

// Calculate rental period with precise time consideration
export const getRentalPeriod = (pickupDateTime: Dayjs | null, returnDateTime: Dayjs | null) => {
  if (!pickupDateTime || !returnDateTime) return 0;

  // ถ้าเป็นวันเดียวกันแต่ต่างเวลา ให้คิดเป็น 1 วัน
  // ถ้ามีจำนวนวันที่แตกต่างกัน ให้ใช้จำนวนวันนั้น
  // ตัวอย่างเช่น:
  // - รับรถ 10:00 คืนรถ 18:00 วันเดียวกัน = 1 วัน
  // - รับรถวันที่ 1 เวลา 10:00 คืนรถวันที่ 2 เวลา 9:00 = 1 วัน
  // - รับรถวันที่ 1 เวลา 10:00 คืนรถวันที่ 2 เวลา 11:00 = 2 วัน (เกินเวลารับรถ)
  
  // คำนวณจำนวนวัน (ไม่รวมเวลา)
  const days = returnDateTime.diff(pickupDateTime, "day");
  
  // ถ้าเป็นวันเดียวกัน คิดเป็น 1 วัน
  if (days === 0) {
    return 1;
  }
  
  // เช็คว่าเวลาคืนรถในวันสุดท้ายมากกว่าเวลารับรถในวันแรกหรือไม่
  const pickupHour = pickupDateTime.hour();
  const pickupMinute = pickupDateTime.minute();
  const returnHour = returnDateTime.hour();
  const returnMinute = returnDateTime.minute();
  
  // ถ้าเวลาคืนมากกว่าเวลารับ ให้บวกอีก 1 วัน
  if (returnHour > pickupHour || (returnHour === pickupHour && returnMinute > pickupMinute)) {
    return days + 1;
  }
  
  // กรณีเวลาคืนน้อยกว่าหรือเท่ากับเวลารับ
  return days;
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

export const getTotalCost = (
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
  if (!date) return null;
  
  const isPM = timeStr.toLowerCase().includes('pm');
  let [hours, minutes] = timeStr
    .replace(/\s*(AM|PM|am|pm)\s*/, '')
    .split(':')
    .map(Number);
  
  if (isPM && hours < 12) {
    hours += 12;
  } else if (!isPM && hours === 12) {
    hours = 0;
  }
  
  return date.hour(hours).minute(minutes).second(0);
};