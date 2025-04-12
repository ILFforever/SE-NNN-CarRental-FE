// Define the Car Item interface
interface CarItem {
  id: string;
  name: string;
  images: string[];
  description: string;
  category: string;
  make: string;
  model: string;
  year: number;
  dailyRate: number;
  transmission: string;
  seats: number;
  available: boolean;
}

// Define the Cars Json interface
interface CarsJson {
  count: number;
  data: CarItem[];
}

interface User {
  _id: string;
  name: string;
  email: string;
  telephone_number: string;
  tier?: number;
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
  _id: string;
  startDate: string;
  returnDate: string;
  actualReturnDate?: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  price: number;
  servicePrice?: number;
  additionalCharges?: number;
  notes?: string;
  car: string | Car;
  user: string | User;
  createdAt: string;
  service?: string[];
  isRated?: boolean;
  finalPrice?: number;
  discountAmount?: number;
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

// Define the Car Item interface
interface CarItem {
  id: string;
  name: string;
  images: string[];
  description: string;
  category: string;
  make: string;
  model: string;
  year: number;
  dailyRate: number;
  transmission: string;
  seats: number;
  available: boolean;
}

// Define the Cars Json interface
interface CarsJson {
  count: number;
  data: CarItem[];
}

// Define the Booking Item interface for bookslice
interface BookingItem {
  nameLastname: string;
  tel: string;
  car: string;
  bookDate: string;
  returnDate?: string;
}