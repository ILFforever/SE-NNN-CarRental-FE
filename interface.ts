interface User {
  _id: string;
  name: string;
  email: string;
  telephone_number: string;
}

interface Provider {
  _id: string;
  name: string;
  email: string;
  telephone_number?: string;
  address?: string;
}


interface Car {
  _id: string;
  license_plate: string;
  brand: string;
  model: string;
  type: string;
  color: string;
  manufactureDate: string;
  available: boolean;
  dailyRate: number;
  tier: number;
  provider_id: string;
  service?: string[];
  images?: string[];
  image?: string; // Fallback single image property
  rents?: Rent[];
}

interface Rent {
  finalPrice: any;
  isRated: any;
  _id: string;
  startDate: string;
  returnDate: string;
  actualReturnDate?: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  price: number;
  additionalCharges?: number;
  notes?: string;
  car: string | Car;
  user: string | User;
  createdAt: string;
  servicePrice?: number;
}

interface BookingItem {
  nameLastname: string;
  tel: string;
  bookDate: string;
  pickupTime: string;
  returnTime: string;
}

interface Service {
  _id: string;
  name: string;
  available: boolean;
  description: string;
  daily: boolean;
  rate: number;
  createdAt: string;
}

