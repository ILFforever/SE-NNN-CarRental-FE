'use client';

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dayjs, { Dayjs } from "dayjs";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addBooking } from "@/redux/features/bookSlice";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useSession } from "next-auth/react";
import styles from '@/components/banner-search.module.css';
import Image from "next/image";
import getUserProfile from "@/libs/getUserProfile";
import { API_BASE_URL } from "@/config/apiConfig";
import Link from "next/link";

// Define the Car interface based on your API response
interface Car {
    _id: string;
    brand: string;
    model: string;
    type: string;
    color?: string;
    license_plate?: string;
    dailyRate?: number;
    tier?: number;
    provider_id?: string;
    manufactureDate?: string;
    available?: boolean;
    rents?: Rent[];
}

interface Rent {
    _id: string;
    startDate: string;
    returnDate: string;
    status: 'pending' | 'active' | 'completed' | 'cancelled';
}

export default function Booking() {
    const router = useRouter();
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();

    const timeOptions = [
        '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', 
        '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
        '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
        '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
        '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
        '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'
    ];

    const [car, setCar] = useState<Car | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userData, setUserData] = useState<{
        name: string;
        telephone_number: string | undefined;
    } | null>(null);

    const [nameLastname, setNameLastname] = useState<string>('');
    const [tel, setTel] = useState<string>('');
    const [pickupDate, setPickupDate] = useState<Dayjs | null>(null);
    const [returnDate, setReturnDate] = useState<Dayjs | null>(null);
    const [pickupTime, setPickupTime] = useState<string>('10:00 AM');
    const [returnTime, setReturnTime] = useState<string>('10:00 AM');
    
    // New states for availability checking
    const [isAvailable, setIsAvailable] = useState<boolean>(true);
    const [isCheckingAvailability, setIsCheckingAvailability] = useState<boolean>(false);
    const [availabilityMessage, setAvailabilityMessage] = useState<string>('');
    const [formValid, setFormValid] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Check form validity whenever relevant fields change
    useEffect(() => {
        const isValid = nameLastname.trim() !== '' && 
                        tel.trim() !== '' && 
                        pickupDate !== null && 
                        returnDate !== null &&
                        isAvailable;
        setFormValid(isValid);
    }, [nameLastname, tel, pickupDate, returnDate, isAvailable]);

    // Function to check availability - memoized with useCallback
    const checkCarAvailability = useCallback(async () => {
        if (!car?._id || !pickupDate || !returnDate || !session?.user?.token) {
            return; // Don't check if we don't have all the required data
        }

        // Prevent checking if pickup date is after return date
        if (pickupDate.isAfter(returnDate)) {
            setIsAvailable(false);
            setAvailabilityMessage('Pickup date cannot be after return date');
            return;
        }

        setIsCheckingAvailability(true);
        setAvailabilityMessage('Checking availability...');

        try {
            // Fetch car details (including rents)
            const response = await fetch(`${API_BASE_URL}/cars/${car._id}`, {
                headers: { Authorization: `Bearer ${session.user.token}` },
            });

            if (!response.ok) throw new Error('Failed to fetch car details');

            const carData = await response.json();

            // Check for availability based on the rents array
            if (!carData.success || !carData.data) {
                throw new Error('Invalid car data received');
            }

            const rents = carData.data.rents || [];

            // Check for overlaps in the booking dates
            const conflicts = rents.filter((rent: { 
                startDate: string; 
                returnDate: string; 
                status: string; 
            }) => {
                // Only check active and pending bookings
                if (rent.status !== 'active' && rent.status !== 'pending') {
                    return false;
                }
                
                const rentStartDate = dayjs(rent.startDate);
                const rentEndDate = dayjs(rent.returnDate);
                
                // If the rental period overlaps with the requested booking, return true
                return (pickupDate.isBefore(rentEndDate) && returnDate.isAfter(rentStartDate));
            });

            const available = conflicts.length === 0;
            setIsAvailable(available);
            
            if (available) {
                setAvailabilityMessage('Car is available for selected dates!');
            } else {
                setAvailabilityMessage('Car is not available for the selected dates. Please choose different dates.');
            }

        } catch (error) {
            console.error('Error checking car availability:', error);
            setIsAvailable(false);
            setAvailabilityMessage('Error checking availability. Please try again.');
        } finally {
            setIsCheckingAvailability(false);
        }
    }, [car?._id, pickupDate, returnDate, session?.user?.token]);

    // Check availability whenever dates change
    useEffect(() => {
        if (pickupDate && returnDate && car) {
            checkCarAvailability();
        }
    }, [pickupDate, returnDate, car, checkCarAvailability]);

    const makeBooking = async () => {
        if (!formValid || isSubmitting) {
            return;
        }

        // Double-check availability one more time
        await checkCarAvailability();

        if (!isAvailable) {
            alert('Car is not available for the selected dates. Please choose different dates.');
            return;
        }

        if (car && nameLastname && tel && pickupDate && returnDate) {
            try {
                setIsSubmitting(true);
                // Format dates for the API
                const formattedStartDate = pickupDate.format("YYYY-MM-DD");
                const formattedReturnDate = returnDate.format("YYYY-MM-DD");
                
                // Send booking data to backend
                const response = await fetch(`${API_BASE_URL}/rents`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session?.user?.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        startDate: formattedStartDate,
                        returnDate: formattedReturnDate,
                        car: car._id,
                    })
                });

                if (response.ok) {
                    // Booking successful, dispatch to Redux store
                    const item = {
                        nameLastname: nameLastname,
                        tel: tel,
                        car: car._id,
                        bookDate: pickupDate.format("YYYY/MM/DD"),
                        returnDate: returnDate.format("YYYY/MM/DD"),
                        pickupTime: pickupTime,
                        returnTime: returnTime
                    };
                    
                    dispatch(addBooking(item));
                    alert('Booking successful!');
                    
                    // Redirect to reservations page
                    router.push('/account/reservations');
                } else {
                    const errorData = await response.json();
                    console.error('Booking failed:', errorData);
                    alert(`Booking failed: ${errorData.message || 'Please try again.'}`);
                }
            } catch (error) {
                console.error('Error booking:', error);
                alert('An error occurred. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    // Fetch car details and user profile
    useEffect(() => {
        const carId = searchParams.get('carId') || '';
        const startDate = searchParams.get('startDate') || '';
        const endDate = searchParams.get('endDate') || '';
        const providedPickupTime = searchParams.get('pickupTime') || '10:00 AM';
        const providedReturnTime = searchParams.get('returnTime') || '10:00 AM';

        const fetchData = async () => {
            // Fetch car details
            if (!carId) {
                setError('No car ID provided');
                setLoading(false);
                return;
            }

            if (!session?.user?.token) {
                setError('Please sign in to make a reservation');
                setLoading(false);
                return;
            }

            try {
                // Fetch car details
                const carResponse = await fetch(`${API_BASE_URL}/cars/${carId}`, {
                    headers: { Authorization: `Bearer ${session.user.token}` },
                });

                if (!carResponse.ok) {
                    throw new Error('Failed to fetch car details');
                }

                const carData = await carResponse.json();

                if (carData.success && carData.data) {
                    setCar(carData.data);
                } else {
                    throw new Error('Invalid car data received');
                }

                // Fetch user profile
                const userProfileResponse = await getUserProfile(session.user.token);

                if (userProfileResponse.success && userProfileResponse.data) {
                    setUserData({
                        name: userProfileResponse.data.name,
                        telephone_number: userProfileResponse.data.telephone_number
                    });

                    // Prefill form with user data
                    setNameLastname(userProfileResponse.data.name);
                    setTel(userProfileResponse.data.telephone_number || '');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        // Prefill dates and times
        if (startDate) {
            setPickupDate(dayjs(startDate));
        }
        if (endDate) {
            setReturnDate(dayjs(endDate));
        }
        if (providedPickupTime) {
            setPickupTime(providedPickupTime);
        }
        if (providedReturnTime) {
            setReturnTime(providedReturnTime);
        }

        fetchData();
    }, [searchParams, session]);

    // Calculate rental period and total cost
    const getRentalPeriod = () => {
        if (!pickupDate || !returnDate) return 0;
        
        // Calculate the difference in days, adding 1 because rental period includes the pickup day
        const days = returnDate.diff(pickupDate, 'day') + 1;
        return Math.max(1, days); // Ensure minimum 1 day
    };

    const getTotalCost = () => {
        const days = getRentalPeriod();
        const dailyRate = car?.dailyRate || 0;
        return days * dailyRate;
    };

    // Tier name mapping
    const getTierName = (tier: number) => {
        const tierNames = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
        return tierNames[tier] || `Tier ${tier}`;
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (loading) {
        return (
            <main className="max-w-6xl mx-auto py-10 px-4 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55] mx-auto"></div>
                <p className="mt-4">Loading car details...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="max-w-6xl mx-auto py-10 px-4 text-center">
                <div className="bg-red-100 text-red-800 p-4 rounded-lg">
                    <p>{error}</p>
                    {!session && (
                        <div className="mt-4">
                            <Link
                                href="/signin?callbackUrl=/catalog" 
                                className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
                            >
                                Sign In
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        );
    }

    return(
        <main className="max-w-6xl mx-auto py-10 px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-medium mb-3 font-serif">Make Your Reservation</h1>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Complete the details below to reserve your premium vehicle
            </p>
          </div>
      
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Car Details */}
            {car && (
              <div>
                <h2 className="text-2xl font-serif font-medium mb-6">Vehicle Details</h2>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <div className="relative h-64">
                    <Image 
                      src="/img/banner.jpg" 
                      alt={`${car.brand} ${car.model}`} 
                      fill
                      className="object-cover"
                    />
                    {/* {!car.available && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">Currently Rented</span>
                      </div>
                    )} */}
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-[#8A7D55] font-serif">{car.brand} {car.model}</h3>
                      <p className="text-gray-600">{car.type} {car.color ? `| ${car.color}` : ''}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">License Plate</p>
                        <p className="font-medium">{car.license_plate || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Daily Rate</p>
                        <p className="font-medium">${car.dailyRate?.toFixed(2) || '0.00'}/day</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Manufacture Date</p>
                        <p className="font-medium">
                          {car.manufactureDate 
                            ? new Date(car.manufactureDate).toLocaleDateString() 
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tier</p>
                        <p className="font-medium">{car.tier !== undefined ? getTierName(car.tier) : 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isAvailable ? 'Available' : 'Not Available for Selected Dates'}
                      </span>
                    </div>
                    
                    {/* Vehicle features */}
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Features</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          Air Conditioning
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          Bluetooth
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          Navigation
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          Leather Seats
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Booking Form */}
            <div>
              <h2 className="text-2xl font-serif font-medium mb-6">Booking Information</h2>
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-6 space-y-4">
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
                    <p className="text-sm font-medium text-gray-700">Contact Number</p>
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
                      <p className="text-sm font-medium text-gray-700 mb-1">Pickup Date</p>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          type="date"
                          value={pickupDate ? pickupDate.format("YYYY-MM-DD") : ""}
                          onChange={(e) => setPickupDate(e.target.value ? dayjs(e.target.value) : null)}
                          className="block w-full pl-5 pr-2 py-1 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-[#8A7D55] focus:border-[#8A7D55] text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Pickup Time</p>
                      <select 
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
      
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Return Date</p>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          type="date"
                          value={returnDate ? returnDate.format("YYYY-MM-DD") : ""}
                          onChange={(e) => setReturnDate(e.target.value ? dayjs(e.target.value) : null)}
                          min={pickupDate ? pickupDate.format("YYYY-MM-DD") : undefined}
                          className="block w-full pl-5 pr-2 py-1 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-[#8A7D55] focus:border-[#8A7D55] text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Return Time</p>
                      <select 
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
      
                  {/* Availability message */}
                  {availabilityMessage && (
                    <div className={`p-3 rounded-md text-sm ${
                      isAvailable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
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
            </div>
          </div>
      
          {/* Reservation Summary */}
          {car && pickupDate && returnDate && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
              <div className="bg-[#8A7D55] text-white px-6 py-4">
                <h2 className="text-xl font-serif font-medium">Reservation Summary</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Vehicle</h3>
                    <p className="text-gray-700"><span className="text-gray-500">Make/Model:</span> {car.brand} {car.model}</p>
                    <p className="text-gray-700"><span className="text-gray-500">License:</span> {car.license_plate || 'N/A'}</p>
                    <p className="text-gray-700"><span className="text-gray-500">Daily Rate:</span> ${car.dailyRate?.toFixed(2) || '0.00'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Rental Period</h3>
                    <p className="text-gray-700">
                      <span className="text-gray-500">Pickup:</span> {pickupDate?.format('MMM D, YYYY')} at {pickupTime}
                    </p>
                    <p className="text-gray-700">
                      <span className="text-gray-500">Return:</span> {returnDate?.format('MMM D, YYYY')} at {returnTime}
                    </p>
                    <p className="text-gray-700">
                      <span className="text-gray-500">Duration:</span> {getRentalPeriod()} days
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 mt-6 pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Daily Rate:</span>
                    <span>${car.dailyRate?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">Number of Days:</span>
                    <span>{getRentalPeriod()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-4 text-lg font-medium">
                    <span>Total Cost:</span>
                    <span className="text-[#8A7D55]">{formatCurrency(getTotalCost())}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
      
          {/* Submit Button */}
          <div className="text-center">
            <button
              onClick={makeBooking}
              disabled={!formValid || isSubmitting}
              className={`px-8 py-3 text-white rounded-md font-medium transition-all duration-200 ${
                formValid && !isSubmitting
                  ? 'bg-[#8A7D55] hover:bg-[#766b48] shadow-md hover:shadow-lg'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </span>
              ) : (
                'Confirm Reservation'
              )}
            </button>
          </div>
        </main>
      );}