'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { API_BASE_URL } from '@/config/apiConfig';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Car {
  id: string;
  _id?: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  dailyRate?: number;
  type: string;
  color?: string;
  seats?: number;
  provider: string;
  image?: string;
  tier?: number;
  available?: boolean;
}

export default function FavoriteCars() {
  const [favoriteCars, setFavoriteCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect if user is not authenticated
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/favorite');
      return;
    }

    if (status === 'authenticated' && session?.user?.token) {
      fetchFavorites();
    }
  }, [status, session]);

  async function fetchFavorites() {
    setLoading(true);
    setError(null);

    try {
      // Set up headers with auth token
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user?.token}`
      };

      // Fetch current user data to get favorite car IDs
      const userRes = await fetch(`${API_BASE_URL}/auth/curuser`, { headers });
      if (!userRes.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const userData = await userRes.json();
      
      if (!userData.success || !userData.data.favorite_cars) {
        setFavoriteCars([]);
        setLoading(false);
        return;
      }

      const favoriteCarIds = userData.data.favorite_cars;
      
      if (favoriteCarIds.length === 0) {
        setFavoriteCars([]);
        setLoading(false);
        return;
      }

      // Fetch all cars
      const carsRes = await fetch(`${API_BASE_URL}/cars`, { headers });
      if (!carsRes.ok) {
        throw new Error('Failed to fetch cars data');
      }
      
      const carsData = await carsRes.json();
      
      if (!carsData.success) {
        throw new Error('Invalid car data format received');
      }

      // Filter cars based on favorite IDs
      const favorites = carsData.data.filter((car: Car) => 
        favoriteCarIds.includes(car._id || car.id)
      ).map((car: Car) => ({
        ...car,
        id: car._id || car.id,
        price: car.dailyRate || car.price || 0
      }));

      setFavoriteCars(favorites);
    } catch (err: any) {
      console.error('Error fetching favorites:', err);
      setError(err.message || 'Failed to load favorite cars');
    } finally {
      setLoading(false);
    }
  }

  // Function to remove a car from favorites
  async function removeFavorite(carId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/favorite`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.token}`
        },
        body: JSON.stringify({ carId })
      });

      if (!response.ok) {
        throw new Error('Failed to remove from favorites');
      }

      // Update the UI by removing the car from the state
      setFavoriteCars(prev => prev.filter(car => car.id !== carId));
    } catch (err: any) {
      console.error('Error removing favorite:', err);
      setError(err.message || 'Failed to remove from favorites');
    }
  }

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55]"></div>
    </div>;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#8A7D55] mb-6">Your Favorite Cars</h1>
      
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55]"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {!loading && !error && favoriteCars.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-6">You haven't added any cars to your favorites yet.</p>
          <Link 
            href="/reserve" 
            className="px-6 py-3 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
          >
            Browse Cars
          </Link>
        </div>
      )}
      
      {!loading && !error && favoriteCars.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteCars.map(car => (
            <div key={car.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-48">
                <Image 
                  src={car.image || '/img/banner.jpg'} 
                  alt={`${car.brand} ${car.model}`} 
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="text-lg font-bold">{car.brand} {car.model}</h2>
                    <p className="text-sm text-gray-600 -mt-1">
                      {car.year} • <span className="font-medium text-[#8A7D55]">{car.provider}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-lg text-[#8A7D55]">${car.price}</span>
                    <span className="text-gray-600 text-sm"> /day</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">
                    {car.type.charAt(0).toUpperCase() + car.type.slice(1)}
                  </span>
                  {car.seats && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">
                      {car.seats} seats
                    </span>
                  )}
                  {car.color && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">
                      {car.color}
                    </span>
                  )}
                  {car.tier !== undefined && (
                    <span className="px-3 py-1 bg-[#f8f5f0] text-[#8A7D55] text-xs rounded-full font-medium">
                      Tier {car.tier}
                    </span>
                  )}
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Link 
                    href={`/reserve?carId=${car.id}`}
                    className="flex-1"
                  >
                    <button className="w-full py-2.5 bg-[#8A7D55] hover:bg-[#766b48] text-white rounded-md text-sm font-medium transition-colors duration-200 shadow-sm">
                      Reserve Now
                    </button>
                  </Link>
                  
                  <button 
                    onClick={() => removeFavorite(car.id)}
                    className="py-2.5 px-3 border border-red-300 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition-colors duration-200"
                    title="Remove from favorites"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}