'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { API_BASE_URL } from '@/config/apiConfig';

export default function FavoriteCars() {
  const [favoriteCars, setFavoriteCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFavorites() {
      try {
        // Fetch user data
        const userRes = await fetch(`${API_BASE_URL}/curuser`);
        if (!userRes.ok) throw new Error('Failed to fetch user data');
        const userData = await userRes.json();

        // Fetch cars data
        const carsRes = await fetch(`${API_BASE_URL}/cars/`);
        if (!carsRes.ok) throw new Error('Failed to fetch cars data');
        const carsData = await carsRes.json();

        // Filter cars based on favorite IDs
        const favoriteCarsList = carsData.filter(car => userData.favorite_cars.includes(car.id));
        setFavoriteCars(favoriteCarsList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, []);

  return (
    <main className="p-6">
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
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
                <div className="mt-4">
                  <Link href={`/car/${car.id}`}>
                    <button className="w-full py-2.5 bg-[#8A7D55] hover:bg-[#766b48] text-white rounded-md text-sm font-medium transition-colors duration-200 shadow-sm">
                      View Car
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
