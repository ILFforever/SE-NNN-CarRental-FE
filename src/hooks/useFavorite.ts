"use client";

import { useState, useCallback } from 'react';
import { API_BASE_URL } from "@/config/apiConfig";
import { useSession } from "next-auth/react";

/**
 * Custom hook for managing favorite cars
 * Provides functions to add, remove favorites and fetch the current list
 */
export default function useFavorite() {
  const { data: session } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Add a car to favorites
   * @param {string} carId - The ID of the car to add to favorites
   * @returns {Promise<boolean>} Success status
   */
  const addToFavorites = useCallback(async (carId: string) => {
    if (!session?.user?.token || isProcessing) return false;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/favorite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.token}`,
        },
        body: JSON.stringify({ carID: carId }),
      });
      
      setIsProcessing(false);
      return response.ok;
    } catch (error) {
      console.error("Error adding to favorites:", error);
      setIsProcessing(false);
      return false;
    }
  }, [session, isProcessing]);

  /**
   * Remove a car from favorites
   * @param {string} carId - The ID of the car to remove from favorites
   * @returns {Promise<boolean>} Success status
   */
  const removeFromFavorites = useCallback(async (carId: string) => {
    if (!session?.user?.token || isProcessing) return false;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/favorite`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.token}`,
        },
        body: JSON.stringify({ carID: carId }),
      });
      
      setIsProcessing(false);
      return response.ok;
    } catch (error) {
      console.error("Error removing from favorites:", error);
      setIsProcessing(false);
      return false;
    }
  }, [session, isProcessing]);

  /**
   * Fetch the current user's favorite car IDs
   * @returns {Promise<string[]>} Array of favorite car IDs
   */
  const getFavoriteIds = useCallback(async () => {
    if (!session?.user?.token) return [];
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/curuser`, {
        headers: {
          Authorization: `Bearer ${session.user.token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      
      const userData = await response.json();
      
      if (!userData.success || !userData.data.favorite_cars) {
        return [];
      }
      
      return userData.data.favorite_cars;
    } catch (error) {
      console.error("Error fetching favorites:", error);
      return [];
    }
  }, [session]);

  return {
    addToFavorites,
    removeFromFavorites,
    getFavoriteIds,
    isProcessing
  };
}