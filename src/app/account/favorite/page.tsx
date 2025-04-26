"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/config/apiConfig";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import FavoriteHeartButton, { FavoriteCarsProvider, useFavoriteCars } from "@/components/cars/FavoriteHeartButton";
import { CheckCircle, Star, RefreshCw } from "lucide-react";
import HoverableCarImage from "@/components/cars/HoverableCarImage";

// Define types for API responses
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export default function FavoriteCars() {
  useScrollToTop();
  const [favoriteCars, setFavoriteCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Get the favorite cars context
  const { favorites, setFavorites } = useFavoriteCars();
  
  // Add state for showing the refresh button
  const [showRefreshButton, setShowRefreshButton] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // Initial load when component mounts
  useEffect(() => {
    console.log('Initial useEffect - Authentication Status:', status);
    
    // Redirect if user is not authenticated
    if (status === "unauthenticated") {
      console.log('User not authenticated - redirecting to sign in');
      router.push("/signin?callbackUrl=/account/favorite");
      return;
    }

    if (status === "authenticated" && session?.user?.token) {
      console.log('User authenticated - fetching favorites');
      fetchFavorites();
    }
  }, [status, session, router]);

  async function fetchProviderDetails(providerId: string, headers: HeadersInit): Promise<Provider | null> {
    try {
      console.log(`Fetching provider details for ID: ${providerId}`);
      const response = await fetch(`${API_BASE_URL}/Car_Provider/${providerId}`, { headers });
      
      if (!response.ok) {
        console.warn(`Failed to fetch provider details for ID: ${providerId}`);
        return null;
      }
      
      const providerData = await response.json();
      
      if (providerData.success && providerData.data) {
        console.log('Provider details fetched successfully:', providerData.data);
        return providerData.data;
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching provider details for ID ${providerId}:`, error);
      return null;
    }
  }

  const fetchFavorites = useCallback(async (showLoadingState = true): Promise<void> => {
    console.log('Fetch Favorites called', { showLoadingState });
    
    if (showLoadingState) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    
    setError(null);
    
    try {
      // Set up headers with auth token
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.user?.token}`,
      };

      // Fetch current user data to get favorite car IDs
      const userRes = await fetch(`${API_BASE_URL}/auth/curuser`, { headers });
      if (!userRes.ok) {
        console.error('Failed to fetch user data');
        throw new Error("Failed to fetch user data");
      }

      const userData: ApiResponse<User> = await userRes.json();
      console.log('User data fetched:', userData);

      if (!userData.success || !userData.data.favorite_cars) {
        console.log('No favorite cars found');
        setFavoriteCars([]);
        setShowRefreshButton(false);
        return;
      }

      const favoriteCarIds: string[] = userData.data.favorite_cars;
      console.log('Favorite car IDs:', favoriteCarIds);
      
      // Update global favorites context
      setFavorites(favoriteCarIds);

      if (favoriteCarIds.length === 0) {
        console.log('Favorite car list is empty');
        setFavoriteCars([]);
        setShowRefreshButton(false);
        return;
      }

      // Fetch cars using specific car IDs
      const carPromises = favoriteCarIds.map(carId => 
        fetch(`${API_BASE_URL}/cars/${carId}`, { headers })
      );
      
      const carResponses = await Promise.all(carPromises);
      
      // Process car data
      const carDataPromises = carResponses.map(async (response) => {
        if (!response.ok) {
          console.warn(`Failed to fetch car details for a favorite car`);
          return null;
        }
        
        const carData = await response.json();
        if (!carData.success || !carData.data) {
          console.warn(`Invalid car data received`);
          return null;
        }
        
        const car = carData.data;
        
        // Fetch provider details if provider_id exists
        let provider: Provider | null = null;
        if (car.provider_id) {
          provider = await fetchProviderDetails(car.provider_id, headers);
        }

        // Return the car data with the provider's information merged
        return {
          ...car,
          id: car._id || car.id,
          price: car.dailyRate || car.price || 0,
          verified: provider ? provider.verified : false,
          providerName: provider ? provider.name : "Unknown Provider",
          provider: provider ? provider.name : "Unknown Provider",
          // Ensure images array is properly populated from either images or imageOrder
          images: car.imageOrder && Array.isArray(car.imageOrder) 
            ? car.imageOrder 
            : car.images && Array.isArray(car.images) 
            ? car.images 
            : [],
          // Keep single image for backward compatibility
          image: car.image || "/img/banner.jpg"
        };
      });
      
      const favorites = (await Promise.all(carDataPromises)).filter(car => car !== null) as Car[];
      console.log('Processed favorite cars:', favorites);
      
      setFavoriteCars(favorites);
      setShowRefreshButton(false);
    } catch (err: unknown) {
      console.error("Error fetching favorites:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load favorite cars"
      );
    } finally {
      if (showLoadingState) {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
      console.log('Fetch favorites completed');
    }
  }, [session, setFavorites]);

  const handleCarAction = (carId: string) => {
    console.log('Handle car action for car ID:', carId);
    if (!session) {
      router.push("/signin?callbackUrl=/account/favorite");
      return;
    }
    router.push(`/reserve?carId=${carId}`);
  };
  
  // Handle refresh button click
  const handleRefresh = useCallback(() => {
    console.log('Refresh button clicked');
    setIsRefreshing(true);
    fetchFavorites(false)
      .then(() => {
        console.log('Refresh completed successfully');
      })
      .catch((error) => {
        console.error('Refresh failed:', error);
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  }, [fetchFavorites]);

  // Log context changes
  useEffect(() => {
    console.log('Favorites context changed:', favorites);
  }, [favorites]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55]"></div>
      </div>
    );
  }

  return (
    <FavoriteCarsProvider>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#8A7D55]">
            Your Favorite Cars
          </h1>
          
          {/* Refresh button that appears when a favorite is removed */}
          {showRefreshButton && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors disabled:opacity-70"
              data-test-id="refresh-favorites"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh List'}
            </button>
          )}
        </div>

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
            <p className="text-gray-600 mb-6">
              You haven't added any cars to your favorites yet.
            </p>
            <Link
              href="/catalog"
              className="px-6 py-3 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
            >
              Browse Cars
            </Link>
          </div>
        )}

        {!loading && !error && favoriteCars.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteCars.map((car) => (
              <div
                key={car.id}
                className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 ${!car.available ? 'opacity-60' : ''}`}
                data-test-id="favorite-car-item"
              >
                <div className="relative h-48">
                  <FavoriteHeartButton 
                    carId={car.id} 
                    className="top-2 right-2" 
                    onToggle={() => {
                      console.log('Favorite button toggled for car:', car.id);
                      // When a user removes a car from favorites, show the refresh button
                      setShowRefreshButton(true);
                    }}
                  />
                  <HoverableCarImage car={car} />
                  
                  {/* Add unavailable badge to clarify the status
                  {!car.available && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full z-20">
                      Currently Unavailable
                    </div>
                  )} */}
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="text-lg font-bold">
                        {car.brand} {car.model}
                      </h2>
                      <div className="text-sm text-gray-600 -mt-1 flex items-center">
                        {new Date(car.manufactureDate).getFullYear()} •{" "}
                        <span className="font-medium text-[#8A7D55] ml-1">
                          {car.providerName}
                        </span>
                        
                        {car.verified && (
                          <div className="ml-2 relative group inline-flex items-center">
                            <CheckCircle className="text-green-500 w-4 h-4" />
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-70 transition-opacity">
                              Verified
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg text-[#8A7D55]">
                        ${car.price}
                      </span>
                      <span className="text-gray-600 text-sm"> /day</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">
                      {car.type?.charAt(0).toUpperCase() + car.type?.slice(1) || "Unknown"}
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
                    <button
                      onClick={() => handleCarAction(car.id)}
                      disabled={!car.available}
                      className={`w-full py-2.5 ${
                        car.available 
                          ? "bg-[#8A7D55] hover:bg-[#766b48] text-white" 
                          : "bg-gray-300 text-gray-600 cursor-not-allowed"
                      } rounded-md text-sm font-medium transition-colors duration-200 shadow-sm`}
                    >
                      {car.available ? "Reserve Now" : "Car Unavailable"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Show refresh list message when needed */}
        {showRefreshButton && !loading && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-md text-center">
            <p className="text-yellow-700 mb-2">Your favorites list has changed. Refresh to see the updated list.</p>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-70"
              data-test-id="refresh-favorites"

            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh List Now'}
            </button>
          </div>
        )}
      </main>
    </FavoriteCarsProvider>
  );
}