"use client";

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import useFavorite from '@/hooks/useFavorite'; // Import our custom hook

/**
 * FavoriteButton component for toggling favorite status of cars
 * 
 * @param {Object} props Component props
 * @param {string} props.carId Car ID
 * @param {boolean} props.initialIsFavorite Initial favorite status
 * @param {function} props.onToggle Callback function after toggling favorite status
 * @param {string} props.className Additional CSS classes
 */
interface FavoriteButtonProps {
  carId: string;
  initialIsFavorite?: boolean;
  onToggle?: (carId: string) => void;
  className?: string;
}
export default function FavoriteButton({ 
  carId, 
  initialIsFavorite = false, 
  onToggle, 
  className = "" 
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const { addToFavorites, removeFromFavorites, isProcessing } = useFavorite();
  const [isLoading, setIsLoading] = useState(false);

  // Update local state when initialIsFavorite prop changes
  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading || isProcessing) return;
    
    setIsLoading(true);
    
    try {
      let success;
      
      if (isFavorite) {
        // Remove from favorites
        success = await removeFromFavorites(carId);
      } else {
        // Add to favorites
        success = await addToFavorites(carId);
      }
      
      if (success) {
        // Update local state
        setIsFavorite(!isFavorite);
        
        // Call onToggle callback if provided
        if (typeof onToggle === 'function') {
          onToggle(!isFavorite);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`relative z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-all ${
        isLoading ? "opacity-50" : ""
      } ${className}`}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`w-5 h-5 ${
          isFavorite
            ? "fill-red-500 text-red-500"
            : "fill-none text-gray-600 hover:text-red-500"
        } transition-colors`}
      />
    </button>
  );
}