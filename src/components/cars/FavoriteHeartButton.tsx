"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { API_BASE_URL } from "@/config/apiConfig";

// Create context for favorite cars
interface FavoriteCarsContextType {
  favorites: string[];
  setFavorites: React.Dispatch<React.SetStateAction<string[]>>;
  addFavorite: (carId: string) => Promise<void>;
  removeFavorite: (carId: string) => Promise<void>;
  isFavorite: (carId: string) => boolean;
}

const FavoriteCarsContext = createContext<FavoriteCarsContextType>({
  favorites: [],
  setFavorites: () => {},
  addFavorite: async () => {},
  removeFavorite: async () => {},
  isFavorite: () => false,
});

export const useFavoriteCars = () => useContext(FavoriteCarsContext);

interface FavoriteCarsProviderProps {
  children: React.ReactNode;
}

export const FavoriteCarsProvider: React.FC<FavoriteCarsProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.token) {
      fetchFavorites();
    }
  }, [session, status]);

  const fetchFavorites = async () => {
    if (!session?.user?.token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/curuser`, {
        headers: {
          Authorization: `Bearer ${session.user.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && Array.isArray(data.data.favorite_cars)) {
          setFavorites(data.data.favorite_cars);
        }
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const addFavorite = async (carId: string) => {
    if (!session?.user?.token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/favorite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.token}`,
        },
        body: JSON.stringify({ carID: carId }),
      });

      if (response.ok) {
        // Update the local state instead of refetching
        setFavorites((prev) => [...prev, carId]);
      }
    } catch (error) {
      console.error("Error adding to favorites:", error);
    }
  };

  const removeFavorite = async (carId: string) => {
    if (!session?.user?.token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/favorite`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.token}`,
        },
        body: JSON.stringify({ carID: carId }),
      });

      if (response.ok) {
        // Update the local state instead of refetching
        setFavorites((prev) => prev.filter((id) => id !== carId));
      }
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  };

  const isFavorite = (carId: string) => {
    return favorites.includes(carId);
  };

  return (
    <FavoriteCarsContext.Provider
      value={{ favorites, setFavorites, addFavorite, removeFavorite, isFavorite }}
    >
      {children}
    </FavoriteCarsContext.Provider>
  );
};

interface FavoriteHeartButtonProps {
  carId: string;
  className?: string;
  onToggle?: () => void;
}

const FavoriteHeartButton: React.FC<FavoriteHeartButtonProps> = ({ 
  carId, 
  className = "", 
  onToggle 
}) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavoriteCars();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status !== "authenticated") return;
    if (isLoading) return;

    setIsLoading(true);
    try {
      const currentlyFavorite = isFavorite(carId);

      if (currentlyFavorite) {
        await removeFavorite(carId);
      } else {
        await addFavorite(carId);
      }
      
      // Ensure onToggle is a function before calling
      if (typeof onToggle === 'function') {
        onToggle();
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFav = isFavorite(carId);

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`absolute z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-all ${
        isLoading ? "opacity-50" : ""
      } ${className}`}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`w-5 h-5 ${
          isFav
            ? "fill-red-500 text-red-500"
            : "fill-none text-gray-600 hover:text-red-500"
        } transition-colors`}
      />
    </button>
  );
};

export default FavoriteHeartButton;