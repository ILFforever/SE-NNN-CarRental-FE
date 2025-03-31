'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { API_BASE_URL } from '@/config/apiConfig';

interface Car {
  _id: string;
  brand: string;
  model: string;
  license_plate: string;
}

interface Rent {
  _id: string;
  startDate: string;
  returnDate: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  price: number;
  car: Car | string;
  createdAt: string;
}

export default function MyReservationsPage() {
  const { data: session } = useSession();
  const [reservations, setReservations] = useState<Rent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cars, setCars] = useState<{[key: string]: Car}>({});

  useEffect(() => {
    const fetchReservations = async () => {
      if (!session?.user?.token) {
        setError('Authentication required. Please sign in.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Use the rents endpoint to fetch user's rentals
        const response = await fetch(`${API_BASE_URL}/rents`, {
          headers: {
            'Authorization': `Bearer ${session.user.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch reservations: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          setReservations(data.data);
          
          // Extract car IDs to fetch car details
          const carIds = new Set<string>();
          data.data.forEach((rental: Rent) => {
            if (typeof rental.car === 'string') {
              carIds.add(rental.car);
            } else if (rental.car && typeof rental.car === 'object') {
              carIds.add(rental.car._id);
            }
          });
          
          // Fetch car details for each rental
          await fetchCarDetails(Array.from(carIds), session.user.token);
        } else {
          setReservations([]);
        }
      } catch (err) {
        console.error('Error fetching reservations:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch reservations');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [session]);

  // Fetch car details by IDs
  const fetchCarDetails = async (carIds: string[], token: string) => {
    try {
      // Create a map to store car details
      const carDetailsMap: {[key: string]: Car} = {};
      
      // Fetch details for each car
      for (const carId of carIds) {
        const response = await fetch(`${API_BASE_URL}/cars/${carId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            carDetailsMap[carId] = data.data;
          }
        }
      }
      
      setCars(carDetailsMap);
    } catch (err) {
      console.error('Error fetching car details:', err);
    }
  };
  
  // Helper function to get car details
  const getCarDetails = (car: string | Car): Car | undefined => {
    if (typeof car === 'string') {
      return cars[car];
    }
    return car as Car;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge classes
  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!session) {
    return (
      <div className="py-10 px-4 max-w-4xl mx-auto text-center">
        <div className="bg-yellow-100 p-6 rounded-lg text-yellow-800">
          <p className="mb-4">Please sign in to view your reservations.</p>
          <Link 
            href="/signin?callbackUrl=/account/reservations" 
            className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="py-10 px-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-medium font-serif">My Reservations</h1>
        
        <Link 
          href="/catalog" 
          className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
        >
          Make New Reservation
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55]"></div>
          <span className="ml-3">Loading your reservations...</span>
        </div>
      ) : error ? (
        <div className="bg-red-100 p-4 rounded-lg text-red-800">
          <p>{error}</p>
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-white p-10 rounded-lg shadow-md text-center">
          <p className="text-gray-600 mb-6">You don't have any reservations yet.</p>
          <Link 
            href="/catalog" 
            className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
          >
            Browse Available Vehicles
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reservation Period
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reservations.map((reservation) => {
                const car = getCarDetails(reservation.car);
                return (
                  <tr key={reservation._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {car ? `${car.brand} ${car.model}` : 'Car not in system'}
                      </div>
                      {car && (
                        <div className="text-xs text-gray-500">
                          {car.license_plate}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(reservation.startDate)} - {formatDate(reservation.returnDate)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Booked on {formatDate(reservation.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${reservation.price.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(reservation.status)}`}>
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link 
                        href={`/account/reservations/${reservation._id}`}
                        className="text-[#8A7D55] hover:underline font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}