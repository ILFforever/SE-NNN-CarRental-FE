// src/components/FavoriteHeartButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { API_BASE_URL } from '@/config/apiConfig';
import { Heart } from 'lucide-react';

interface FavoriteHeartButtonProps {
  carId: string;
  className?: string;
}

export default function FavoriteHeartButton({ carId, className = '' }: FavoriteHeartButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only check favorite status if authenticated
    if (status === 'authenticated' && session?.user?.token) {
      checkFavoriteStatus();
    }
  }, [carId, status, session]);

  async function checkFavoriteStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/curuser`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.success && userData.data.favorite_cars) {
          setIsFavorite(userData.data.favorite_cars.includes(carId));
        }
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  }

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (status !== 'authenticated') {
      // Prompt user to sign in
      return;
    }

    setIsLoading(true);

    try {
      const method = isFavorite ? 'DELETE' : 'POST';
      const response = await fetch(`${API_BASE_URL}/auth/favorite`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.token}`
        },
        body: JSON.stringify({ carID: carId })
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      } else {
        console.error('Failed to update favorite status');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
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