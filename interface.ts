// Define the Car Item interface
interface CarItem {
  id: string;
  name: string;
  picture: string;
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

// Define the Booking Item interface
interface BookingItem {
  nameLastname: string;
  tel: string;
  car: string;
  bookDate: string;
  returnDate?: string;
}



//OLD STUFF REMOVE LATER
interface VenueItem {
    _id: string,
    name: string,
    address: string,
    district: string,
    province: string,
    postalcode: string,
    tel: string,
    picture: string,
    dailyrate: number,
    __v: number,
    id: string
  }
  
  interface VenueJson {
    success: boolean,
    count: number,
    pagination: Object,
    data: VenueItem[]
  }

  interface BookingItem {
    nameLastname: string;
    tel: string;
    bookDate: string;
    pickupTime: string;
    returnTime: string;
  }