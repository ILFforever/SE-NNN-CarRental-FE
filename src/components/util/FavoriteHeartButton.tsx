// src/components/FavoriteHeartButton.tsx
'use client';

import { useState, useEffect, useContext } from 'react';
import { useSession } from 'next-auth/react';
import { API_BASE_URL } from '@/config/apiConfig';
import { Heart } from 'lucide-react';

// Create a context to store favorite cars
import React from 'react';

// Define the context type
interface FavoriteCarsContextType {
  favoriteCars: string[];
  refreshFavorites: () => Promise<void>;
  addFavorite: (carId: string) => Promise<boolean>;
  removeFavorite: (carId: string) => Promise<boolean>;
  isLoading: boolean;
}

// Create the context with a default value
const FavoriteCarsContext = React.createContext<FavoriteCarsContextType>({
  favoriteCars: [],
  refreshFavorites: async () => {},
  addFavorite: async () => false,
  removeFavorite: async () => false,
  isLoading: false,
});

// Create a provider component
export function FavoriteCarsProvider({ children }: { children: React.ReactNode }) {
  const [favoriteCars, setFavoriteCars] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();

  // Fetch favorite cars from API
  const refreshFavorites = async () => {
    if (status !== 'authenticated' || !session?.user?.token) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/curuser`, {
        headers: {
          'Authorization': `Bearer ${session.user.token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.success && userData.data.favorite_cars) {
          setFavoriteCars(userData.data.favorite_cars);
        }
      }
    } catch (error) {
      console.error('Error fetching favorite cars:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a car to favorites
  const addFavorite = async (carId: string): Promise<boolean> => {
    if (status !== 'authenticated' || !session?.user?.token) {
      return false;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.token}`
        },
        body: JSON.stringify({ carID: carId })
      });

      if (response.ok) {
        setFavoriteCars((prev) => [...prev, carId]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding favorite:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a car from favorites
  const removeFavorite = async (carId: string): Promise<boolean> => {
    if (status !== 'authenticated' || !session?.user?.token) {
      return false;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/favorite`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.token}`
        },
        body: JSON.stringify({ carID: carId })
      });

      if (response.ok) {
        setFavoriteCars((prev) => prev.filter(id => id !== carId));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch favorites when session changes
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.token) {
      refreshFavorites();
    }
  }, [status, session]);

  return (
    <FavoriteCarsContext.Provider value={{ 
      favoriteCars, 
      refreshFavorites, 
      addFavorite, 
      removeFavorite,
      isLoading 
    }}>
      {children}
    </FavoriteCarsContext.Provider>
  );
}

// Hook to use the favorites context
export function useFavoriteCars() {
  return useContext(FavoriteCarsContext);
}

// Interface for the FavoriteHeartButton props
interface FavoriteHeartButtonProps {
  carId: string;
  className?: string;
}

// The FavoriteHeartButton component that uses the context
export default function FavoriteHeartButton({ carId, className = '' }: FavoriteHeartButtonProps) {
  const { status } = useSession();
  const { favoriteCars, addFavorite, removeFavorite, isLoading } = useFavoriteCars();
  const isFavorite = favoriteCars.includes(carId);

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (status !== 'authenticated') {
      // Prompt user to sign in
      return;
    }

    if (isFavorite) {
      await removeFavorite(carId);
    } else {
      await addFavorite(carId);
    }
  }

  if (status !== 'authenticated') {
    return null; // Don't show heart icon for unauthenticated users
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`absolute z-10 p-2 rounded-full ${
        isFavorite 
          ? 'bg-red-500 text-white hover:bg-red-600' 
          : 'bg-white/80 text-gray-700 hover:bg-white'
      } transition-all duration-200 ${className}`}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart 
        size={20} 
        className={isFavorite ? 'fill-current' : ''} 
      />
    </button>
  );
}