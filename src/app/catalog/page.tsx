"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Calendar } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import {API_BASE_URL} from "@/config/apiConfig"
import Image from 'next/image';
import Link from 'next/link';

// Type definitions
interface Provider {
  _id: string;
  name: string;
  address?: string;
  telephone_number?: string;
  email?: string;
}

interface Rent {
  _id: string;
  startDate: string;
  returnDate: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
}

interface Car {
  id: string;
  _id?: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  type: string;
  color?: string;
  seats?: number;
  providerId: string;
  provider: string;
  image?: string;
  rents?: Rent[];
  available?: boolean;
  license_plate?: string;
  manufactureDate?: string;
  dailyRate?: number;
  tier?: number;
}

interface ProvidersMap {
  [key: string]: Provider;
}

interface PriceRange {
  min: number;
  max: number;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

interface ActiveFilters {
  vehicleType: string;
  brand: string;
  year: string;
  seats: string;
  provider: string;
}

interface FilterOptions {
  vehicleType: string[];
  brand: string[];
  year: string[];
  seats: string[];
  provider: string[];
}

export default function CatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Authentication
  const { data: session } = useSession();
  
  // Car data state
  const [cars, setCars] = useState<Car[]>([]);
  const [providers, setProviders] = useState<ProvidersMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Price range state
  const [priceRange, setPriceRange] = useState<PriceRange>({
    min: 0,
    max: Number.MAX_SAFE_INTEGER
  });
  
  // Date range state
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || ''
  });

  const [timePickup, setTimePickup] = useState<string>(searchParams.get('pickupTime') || '10:00 AM');
const [timeReturn, setTimeReturn] = useState<string>(searchParams.get('returnTime') || '10:00 AM');
const timeOptions = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', 
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'
];
  // Location state
  const [selectedLocation, setSelectedLocation] = useState<string>(
    searchParams.get('location') || ''
  );
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  // Filter states
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    vehicleType: '',
    brand: '',
    year: '',
    seats: '',
    provider: ''
  });

  //Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [pagination, setPagination] = useState<{
    next?: { page: number; limit: number };
    prev?: { page: number; limit: number };
  }>({});
  const [itemsPerPage, setItemsPerPage] = useState<number>(25); // Default from API
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalMatchingCount, setTotalMatchingCount] = useState<number>(0);


   function useLocationSuggestions() {
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        
        // Skip if clicking inside a dropdown or dropdown toggle
        if (target.closest('.location-search-container') || 
            target.closest('.location-suggestions')) {
          return;
        }
        
        setShowLocationSuggestions(false);
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
  
    return {
      showLocationSuggestions,
      setShowLocationSuggestions
    };
  }
  const { showLocationSuggestions, setShowLocationSuggestions } = useLocationSuggestions();
  // Manage dropdown visibility states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Extract unique values for filter options from fetched data
  const extractFilterOptions = (): FilterOptions => {
    if (!cars.length) {
      return {
        vehicleType: [],
        brand: [],
        year: [],
        seats: [],
        provider: []
      };
    }
    
    return {
      vehicleType: Array.from(new Set(cars.map(car => car.type).filter((type): type is string => !!type))),
      brand: Array.from(new Set(cars.map(car => car.brand).filter((brand): brand is string => !!brand))),
      year: Array.from(new Set(cars.map(car => car.year?.toString()).filter((year): year is string => !!year))),
      seats: Array.from(new Set(cars.map(car => car.seats?.toString()).filter((seats): seats is string => !!seats))),
      provider: Array.from(new Set(cars.map(car => car.provider).filter((provider): provider is string => !!provider)))
    };
  };

  // Toggle filter selection
  const toggleFilter = (category: keyof ActiveFilters, value: string): void => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: prev[category] === value ? '' : value
    }));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Skip if clicking inside a dropdown or dropdown toggle
      if (target.closest('.filter-dropdown') || target.closest('.dropdown-toggle')) {
        return;
      }
      
      setOpenDropdown(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // Handle location and date changes
const updateSearch = (updates: Record<string, string>): void => {
  const newParams = new URLSearchParams(searchParams.toString());
  
  Object.entries(updates).forEach(([key, value]) => {
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
  });
  
  router.push(`/catalog?${newParams.toString()}`);
};
  
// Fetch car data and providers from API
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Set up headers based on authentication status
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Add auth token if user is logged in
      if (session?.user?.token) {
        headers['Authorization'] = `Bearer ${session.user.token}`;
      }
      
      // Fetch providers first
      const providersResponse = await fetch(`${API_BASE_URL}/Car_Provider`, {
        headers
      });
      
      // Create a map of provider IDs to provider objects for easy lookup
      const providersMap: ProvidersMap = {};
      
      if (providersResponse.ok) {
        const providersData = await providersResponse.json();
        
        if (providersData.success && Array.isArray(providersData.data)) {
          providersData.data.forEach((provider: Provider) => {
            providersMap[provider._id] = provider;
          });
          setProviders(providersMap);
        }
      } else {
        console.warn('Unable to fetch providers. Using default provider names.');
      }
      
      // Build query parameters
      let queryParams = new URLSearchParams();
      
      // Add pagination parameters
      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', itemsPerPage.toString());
      
      // Add location filter (by provider)
      if (selectedLocation) {
        // Find provider ID by location name
        const providerEntry = Object.entries(providersMap).find(
          ([_, provider]) => provider.name === selectedLocation || 
                            (provider.address && provider.address.includes(selectedLocation))
        );
        
        if (providerEntry) {
          queryParams.append('providerId', providerEntry[0]);
        }
      }
      
      // Then fetch cars
      const carsResponse = await fetch(`${API_BASE_URL}/cars?${queryParams.toString()}`, {
        headers
      });
      
      if (!carsResponse.ok) {
        throw new Error(`Error fetching cars: ${carsResponse.status}`);
      }
      
      const carsData = await carsResponse.json();
      
      // Map the API response to match our expected car format
      if (carsData.success && Array.isArray(carsData.data)) {
        setTotalCount(carsData.totalCount || 0);
        setTotalMatchingCount(carsData.totalMatchingCount || 0);
        const formattedCars: Car[] = carsData.data.map((car: any) => {
          // Get provider details from our providers map
          
          const provider = providersMap[car.provider_id] || { name: 'Unknown Provider' };
          return {
            id: car._id || car.id,
            brand: car.brand || 'Unknown Brand',
            model: car.model || 'Unknown Model',
            year: car.manufactureDate ? new Date(car.manufactureDate).getFullYear() : 2023,
            price: car.dailyRate || 0,
            type: car.type || 'Other',
            color: car.color || 'Unknown',
            seats: car.seats || 5,
            providerId: car.provider_id,
            provider: provider.name || 'Unknown Provider',
            rents: car.rents || [],
            available: car.available ?? true,
            image: car.image || '/img/banner.jpg',
            license_plate: car.license_plate,
            manufactureDate: car.manufactureDate,
            dailyRate: car.dailyRate,
            tier: car.tier
          };
        });
        
        // Set the cars
        setCars(formattedCars);
        
        // Update pagination state
        setTotalItems(carsData.count || formattedCars.length);
        
        // Store pagination information from the response
        if (carsData.pagination) {
          setPagination(carsData.pagination);
          
          // Update items per page if it's provided in the response
          if (carsData.pagination.next?.limit) {
            setItemsPerPage(carsData.pagination.next.limit);
          }
        } else {
          setPagination({});
        }
      } else {
        setCars([]);
        setError('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Always fetch data, regardless of authentication status
  fetchData();
}, [session, selectedLocation, dateRange.startDate, dateRange.endDate, currentPage, itemsPerPage]);

  // Filter cars based on date availability
  const filterAvailableCars = (carsList: Car[]): Car[] => {
    // If no start date is provided, return all cars
    if (!dateRange.startDate) {
      return carsList;
    }
    
    // If no end date, use start date as end date
    const start = new Date(dateRange.startDate);
    const end = dateRange.endDate 
      ? new Date(dateRange.endDate) 
      : new Date(dateRange.startDate);
    
    // Ensure end date is not before start date
    if (end < start) {
      end.setTime(start.getTime());
    }
    
    return carsList.filter(car => {
      // If car has rents array, check if any bookings overlap with selected dates
      if (car.rents && Array.isArray(car.rents)) {
        const activeRents = car.rents.filter(rent => 
          rent.status === 'active' || rent.status === 'pending'
        );

        const conflictingRent = activeRents.find(rent => {
          if (!rent.startDate || !rent.returnDate) return false;
          
          const rentStart = new Date(rent.startDate);
          const rentEnd = new Date(rent.returnDate);
          
          // Check for complete time-based overlap
          return (
            (rentStart < end && rentEnd > start) ||  // Overlapping period
            (start >= rentStart && start < rentEnd) ||  // Start date within rent period
            (end > rentStart && end <= rentEnd)  // End date within rent period
          );
        });
        
        return !conflictingRent; // Car is available if there's no conflict
      }
      
      return true; // Assume available if no rent data
    });
  };
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside all dropdown containers
      const isOutsideDropdowns = Object.values(dropdownRefs.current).every(
        ref => ref && !ref.contains(event.target as Node)
      );
  
      if (isOutsideDropdowns) {
        setActiveDropdown(null);
      }
    };
  
    // Add event listener when a dropdown is open
    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [activeDropdown]);
  

  const filterOptions = extractFilterOptions();

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    // Escape special regex characters to prevent errors
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? <span key={i} className="bg-yellow-100 font-medium">{part}</span> : part
    );
  };
  
  // Filter the cars
  const filteredCars = cars.filter(car => {
    // Apply search query filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const modelMatch = `${car.brand} ${car.model}`.toLowerCase().includes(searchLower);
      const providerMatch = car.provider.toLowerCase().includes(searchLower);
      const typeMatch = car.type.toLowerCase().includes(searchLower);
      const colorMatch = car.color ? car.color.toLowerCase().includes(searchLower) : false;
      
      if (!modelMatch && !providerMatch && !typeMatch && !colorMatch) return false;
    }
    
    // Apply price range filter
    if (car.price < priceRange.min || car.price > priceRange.max) return false;
    
    // Apply location filter in a more responsive way, matching anywhere in the text
    if (selectedLocation && !car.provider.toLowerCase().includes(selectedLocation.toLowerCase())) return false;
    
    // Apply all other filters with case-insensitive comparison
    if (activeFilters.vehicleType && car.type.toLowerCase() !== activeFilters.vehicleType.toLowerCase()) return false;
    if (activeFilters.brand && car.brand.toLowerCase() !== activeFilters.brand.toLowerCase()) return false;
    if (activeFilters.year && car.year?.toString() !== activeFilters.year) return false;
    if (activeFilters.seats && car.seats?.toString() !== activeFilters.seats) return false;
    if (activeFilters.provider && car.provider.toLowerCase() !== activeFilters.provider.toLowerCase()) return false;
    
    return true;
  });
  
  // Further filter for availability based on dates
  const availableCars = filterAvailableCars(filteredCars);

  // Handle booking a car
  const handleBookCar = (carId: string) => {
    if (!session) {
      router.push('/signin?callbackUrl=/catalog');
      return;
    }
    
    // Navigate to booking page with car ID and dates/times if selected
    const bookingParams = new URLSearchParams();
    bookingParams.set('carId', carId);
    
    if (dateRange.startDate) {
      bookingParams.set('startDate', dateRange.startDate);
    }
    
    if (dateRange.endDate) {
      bookingParams.set('endDate', dateRange.endDate);
    }
    
    // Add time parameters
    if (timePickup) {
      bookingParams.set('pickupTime', timePickup);
    }
    
    if (timeReturn) {
      bookingParams.set('returnTime', timeReturn);
    }
    
    router.push(`/reserve?${bookingParams.toString()}`);
  };

  const isCarAvailableForDates = (car: Car): boolean => {
    // If no dates are selected, consider the car as available
    if (!dateRange.startDate || !dateRange.endDate) return true;
  
    // If car doesn't have rents data or is explicitly marked as available
    if (!car.rents || car.rents.length === 0 || car.available === true) return true;
  
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    
    // Check for overlaps in the booking dates
    const conflicts = car.rents.filter((rent: Rent) => {
      // Only check active and pending bookings
      if (rent.status !== 'active' && rent.status !== 'pending') {
        return false;
      }
      
      const rentStartDate = new Date(rent.startDate);
      const rentEndDate = new Date(rent.returnDate);
      
      // If the rental period overlaps with the requested booking, return true
      return (start < rentEndDate && end > rentStartDate);
    });
  
    return conflicts.length === 0;
  };
  
  // Function to handle booking or show auth prompt
  const handleCarAction = (carId: string, car: Car) => {
    if (!session) {
      setShowAuthPrompt(true);
      return;
    }
    
    // Use our more sophisticated availability checker
    const isAvailableForSelectedDates = isCarAvailableForDates(car);
    
    if (isAvailableForSelectedDates) {
      handleBookCar(carId);
    } else {
      // If we have selected dates but car isn't available for those dates
      if (dateRange.startDate && dateRange.endDate) {
        alert('This car is not available for the selected dates. Please choose different dates or another vehicle.');
      } else {
        // If no dates selected, let them proceed to the reservation page
        handleBookCar(carId);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <header className="mb-6">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-[#8A7D55]">
            {loading ? 'Looking for vehicles...' : 
            error ? 'Error loading cars' : 
            'Available Vehicles'}
          </h1>
          <p className="text-gray-600 mt-1">
            {!loading && !error && `${totalMatchingCount} premium cars ready for your journey`}
            {error && 'We encountered an issue while fetching available cars'}
          </p>
        </div>
        
        {!loading && !error && cars.length > 0 && (
          <div className="bg-[#f8f5f0] px-4 py-2 rounded-lg">
            <span className="font-medium text-[#8A7D55]">{totalMatchingCount}</span>
            <span className="text-gray-700"> cars match your criteria</span>
          </div>
        )}
      </div>
        
             {/* Filters and search */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Date range selector - now more compact */}
            <div className="col-span-2">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-gray-700 whitespace-nowrap">Rental Period:</div>
                <div className="flex space-x-2 flex-1">
                <div className="flex-1 relative">
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2 text-xs">From</span>
                    <div className="flex-1 relative flex space-x-1">
                      {/* Date input */}
                      <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                          <Calendar className="h-3 w-3 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={dateRange.startDate}
                          onChange={(e) => {
                            setDateRange({...dateRange, startDate: e.target.value});
                            updateSearch({startDate: e.target.value});
                          }}
                          className="block w-full pl-5 pr-2 py-1 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-[#8A7D55] focus:border-[#8A7D55] text-xs"
                        />
                      </div>
                      
                      {/* Time select */}
                      <select
                        value={timePickup}
                        onChange={(e) => {
                          setTimePickup(e.target.value);
                          updateSearch({pickupTime: e.target.value});
                        }}
                        className="border border-gray-300 rounded-md text-xs py-1 px-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#8A7D55] focus:border-[#8A7D55]"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                  
                <div className="flex-1 relative">
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2 text-xs">Until</span>
                    <div className="flex-1 flex items-center space-x-2">
                      <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                          <Calendar className="h-3 w-3 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={dateRange.endDate}
                          min={dateRange.startDate || undefined}
                          onChange={(e) => {
                            const newEndDate = e.target.value;
                            setDateRange({...dateRange, endDate: newEndDate});
                            updateSearch({endDate: newEndDate});
                          }}
                          className="block w-full pl-5 pr-2 py-1 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-[#8A7D55] focus:border-[#8A7D55] text-xs"
                        />
                      </div>
                      <select
                        value={timeReturn}
                        onChange={(e) => {
                          const newReturnTime = e.target.value;
                          setTimeReturn(newReturnTime);
                          updateSearch({returnTime: newReturnTime});
                        }}
                        className="border border-gray-300 rounded-md text-xs py-1 px-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#8A7D55] focus:border-[#8A7D55]"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>

                    {/* Location selector - more compact */}
                    <div className="relative">
              <div className="flex items-center">
                <div className="text-sm font-medium text-gray-700 mr-2 whitespace-nowrap">Location:</div>
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter city or provider..."
                    value={selectedLocation}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedLocation(value);
                      updateSearch({location: value});
                      // Show suggestions if there's a value
                      setShowLocationSuggestions(value.trim() !== '');
                    }}
                    onFocus={(e) => {
                      // Show suggestions if there's a value when focused
                      if (e.target.value.trim() !== '') {
                        setShowLocationSuggestions(true);
                      }
                    }}
                    className="block w-full pl-7 pr-2 py-1 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#8A7D55] focus:border-[#8A7D55] text-sm placeholder-opacity-50 focus:placeholder-opacity-0"
                  />
                </div>
              </div>
              
             {/* Location suggestions */}
              {filterOptions.provider.length > 0 && selectedLocation.trim() !== '' && showLocationSuggestions && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 max-h-56 overflow-auto">
                  {filterOptions.provider
                    .filter(provider => provider.toLowerCase().includes(selectedLocation.toLowerCase()))
                    .map((provider, index) => (
                      <div
                        key={index}
                        className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                        onClick={() => {
                          setSelectedLocation(provider);
                          updateSearch({location: provider});
                          setShowLocationSuggestions(false);
                        }}
                      >
                        {/* Highlight matching text */}
                        {highlightMatch(provider, selectedLocation)}
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
            
            {/* Second row */}
            <div className="md:col-span-2">
              {/* Price range selector - lowercase from/until */}
              <div className="flex items-center">
                <div className="text-sm font-medium text-gray-700 mr-2 whitespace-nowrap">Price Range:</div>
                <div className="flex-1 flex space-x-3 items-center">
                  <div className="flex-1 relative">
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-1 text-xs">from</span>
                      <div className="flex-1 relative">
                        <span className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-gray-400">$</span>
                        <input
                          type="number"
                          min="0"
                          max={priceRange.max}
                          value={priceRange.min}
                          onChange={(e) => setPriceRange({...priceRange, min: parseInt(e.target.value) || 0})}
                          className="block w-full pl-5 pr-2 py-1 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-[#8A7D55] focus:border-[#8A7D55] text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 relative">
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-1 text-xs">until</span>
                      <div className="flex-1 relative">
                        <span className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-gray-400">$</span>
                        <input
                          type="text"
                          min={priceRange.min}
                          value={priceRange.max === Number.MAX_SAFE_INTEGER ? "" : priceRange.max}
                          onChange={(e) => setPriceRange({...priceRange, max: parseInt(e.target.value) || 0})}
                          className="block w-full pl-5 pr-2 py-1 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-[#8A7D55] focus:border-[#8A7D55] text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setPriceRange({min: 0, max: Number.MAX_SAFE_INTEGER})}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              {/* Search input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by model, brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-7 pr-2 py-1 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#8A7D55] focus:border-[#8A7D55] text-sm placeholder-opacity-50 focus:placeholder-opacity-0"
                />
              </div>
            </div>
          </div>
          
          {/* Filter buttons - styled better */}
          <div className="flex flex-wrap gap-2">
          <div className="flex flex-wrap gap-2">
  {/* Vehicle Type Dropdown */}
  <div 
    ref={(el) => {if (el) {dropdownRefs.current['vehicleType'] = el;}}} 
    className="relative group"
  >
    <div 
      className={`flex items-center px-3 py-1 border rounded-md cursor-pointer transition-colors ${activeFilters.vehicleType ? 'bg-[#8A7D55] text-white border-[#766b48]' : 'bg-white hover:bg-gray-50 border-gray-300'}`}
      onClick={() => setActiveDropdown(prev => prev === 'vehicleType' ? null : 'vehicleType')}
    >
      <span className="text-sm">Vehicle type {activeFilters.vehicleType && `· ${activeFilters.vehicleType}`}</span>
      <ChevronDown size={14} className="ml-1" />
    </div>
    
    {activeDropdown === 'vehicleType' && (
      <div className="absolute left-0 top-full mt-1 bg-white shadow-lg rounded-md p-1 z-10 min-w-[150px]">
        {filterOptions.vehicleType.map(type => (
          <div 
            key={type} 
            className={`px-3 py-1.5 cursor-pointer hover:bg-gray-100 rounded text-sm ${activeFilters.vehicleType === type ? 'bg-gray-100 font-medium' : ''}`}
            onClick={() => {
              toggleFilter('vehicleType', type);
              setActiveDropdown(null);
            }}
          >
            {type}
          </div>
        ))}
      </div>
    )}
  </div>

  {/* Brand Dropdown */}
  <div 
    ref={(el) => {if (el) {dropdownRefs.current['brand'] = el;}}} 
    className="relative group"
  >
    <div 
      className={`flex items-center px-3 py-1 border rounded-md cursor-pointer transition-colors ${activeFilters.brand ? 'bg-[#8A7D55] text-white border-[#766b48]' : 'bg-white hover:bg-gray-50 border-gray-300'}`}
      onClick={() => setActiveDropdown(prev => prev === 'brand' ? null : 'brand')}
    >
      <span className="text-sm">Make {activeFilters.brand && `· ${activeFilters.brand}`}</span>
      <ChevronDown size={14} className="ml-1" />
    </div>
    
    {activeDropdown === 'brand' && (
      <div className="absolute left-0 top-full mt-1 bg-white shadow-lg rounded-md p-1 z-10 min-w-[150px]">
        {filterOptions.brand.map(brand => (
          <div 
            key={brand} 
            className={`px-3 py-1.5 cursor-pointer hover:bg-gray-100 rounded text-sm ${activeFilters.brand === brand ? 'bg-gray-100 font-medium' : ''}`}
            onClick={() => {
              toggleFilter('brand', brand);
              setActiveDropdown(null);
            }}
          >
            {brand}
          </div>
        ))}
      </div>
    )}
  </div>

  {/* Year Dropdown */}
  <div 
    ref={(el) => {if (el) {dropdownRefs.current['year'] = el;}}} 
    className="relative group"
  >
    <div 
      className={`flex items-center px-3 py-1 border rounded-md cursor-pointer transition-colors ${activeFilters.year ? 'bg-[#8A7D55] text-white border-[#766b48]' : 'bg-white hover:bg-gray-50 border-gray-300'}`}
      onClick={() => setActiveDropdown(prev => prev === 'year' ? null : 'year')}
    >
      <span className="text-sm">Year {activeFilters.year && `· ${activeFilters.year}`}</span>
      <ChevronDown size={14} className="ml-1" />
    </div>
    
    {activeDropdown === 'year' && (
      <div className="absolute left-0 top-full mt-1 bg-white shadow-lg rounded-md p-1 z-10 min-w-[150px]">
        {filterOptions.year.map(year => (
          <div 
            key={year} 
            className={`px-3 py-1.5 cursor-pointer hover:bg-gray-100 rounded text-sm ${activeFilters.year === year ? 'bg-gray-100 font-medium' : ''}`}
            onClick={() => {
              toggleFilter('year', year);
              setActiveDropdown(null);
            }}
          >
            {year}
          </div>
        ))}
      </div>
    )}
  </div>

  {/* Seats Dropdown */}
  <div 
    ref={(el) => {if (el) {dropdownRefs.current['seats'] = el;}}} 
    className="relative group"
  >
    <div 
      className={`flex items-center px-3 py-1 border rounded-md cursor-pointer transition-colors ${activeFilters.seats ? 'bg-[#8A7D55] text-white border-[#766b48]' : 'bg-white hover:bg-gray-50 border-gray-300'}`}
      onClick={() => setActiveDropdown(prev => prev === 'seats' ? null : 'seats')}
    >
      <span className="text-sm">Seats {activeFilters.seats && `· ${activeFilters.seats}`}</span>
      <ChevronDown size={14} className="ml-1" />
    </div>
    
    {activeDropdown === 'seats' && (
      <div className="absolute left-0 top-full mt-1 bg-white shadow-lg rounded-md p-1 z-10 min-w-[150px]">
        {filterOptions.seats.map(seat => (
          <div 
            key={seat} 
            className={`px-3 py-1.5 cursor-pointer hover:bg-gray-100 rounded text-sm ${activeFilters.seats === seat ? 'bg-gray-100 font-medium' : ''}`}
            onClick={() => {
              toggleFilter('seats', seat);
              setActiveDropdown(null);
            }}
          >
            {seat} seats
          </div>
        ))}
      </div>
    )}
  </div>
</div>
            
            {/* Clear filters button */}
            {(Object.values(activeFilters).some(filter => filter !== '') || 
              priceRange.min > 0 || 
              priceRange.max < 500 || 
              dateRange.startDate || 
              dateRange.endDate ||
              selectedLocation || 
              searchQuery) && (
              <button 
                className="flex items-center px-3 py-1 border border-red-300 text-red-600 rounded-md cursor-pointer hover:bg-red-50 ml-auto text-sm transition-colors"
                onClick={() => {
                  setActiveFilters({vehicleType: '', brand: '', year: '', seats: '', provider: ''});
                  setPriceRange({min: 0, max: Number.MAX_SAFE_INTEGER});
                  setDateRange({startDate: '', endDate: ''});
                  setSelectedLocation('');
                  setSearchQuery('');
                  // Clear URL params
                  router.push('/catalog');
                }}
              >
                <span>Clear all filters</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Authentication error (check only on press view car) */}
      {/* {!session && (
        <div className="text-center py-10">
          <h3 className="text-xl font-medium text-red-600">Authentication Required</h3>
          <p className="text-gray-600 mt-2">Please sign in to view available cars.</p>
          <Link 
            href="/signin?callbackUrl=/catalog" 
            className="mt-4 px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] inline-block"
          >
            Sign In
          </Link>
        </div>
      )} */}
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55]"></div>
        </div>
      )}
      
      {/* Error state */}
      {error && !loading && (
        <div className="text-center py-10">
          <h3 className="text-xl font-medium text-red-600">Error loading cars</h3>
          <p className="text-gray-600 mt-2">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48]"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )}
      
      {/* Cars grid - only show when we have data and no errors */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableCars.map((car) => (
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
                      {car.year} •  <span className="font-medium text-[#8A7D55]">{car.provider}</span>
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
                  <button 
                    className={`w-full py-2.5 ${
                      isCarAvailableForDates(car)
                        ? 'bg-[#8A7D55] hover:bg-[#766b48] text-white' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    } rounded-md text-sm font-medium transition-colors duration-200 shadow-sm`}
                    onClick={() => handleCarAction(car.id, car)}
                    disabled={!isCarAvailableForDates(car)}
                  >
                    {isCarAvailableForDates(car) ? 'View Car' : 'Not Available for Selected Dates'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* No results message */}
      {!loading && !error && session && availableCars.length === 0 && (
        <div className="text-center py-10">
          <h3 className="text-xl font-medium text-gray-600">No cars match your search criteria</h3>
          <p className="text-gray-500 mt-2">Try adjusting your dates, location, or other filters</p>
          <button 
            className="mt-4 px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48]"
            onClick={() => {
              setActiveFilters({vehicleType: '', brand: '', year: '', seats: '', provider: ''});
              setPriceRange({min: 0, max: 500});
              setDateRange({startDate: '', endDate: ''});
              setSelectedLocation('');
              setSearchQuery('');
              // Clear URL params
              router.push('/catalog');
            }}
          >
            Clear all filters
          </button>
        </div>
      )}
      {/* Authentication Prompt Modal */}
        {showAuthPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <div className="text-center">
                <h3 className="text-xl font-medium text-gray-900 mb-3">Authentication Required</h3>
                <p className="text-gray-600 mb-5">
                  Please sign in to view vehicle details and make reservations.
                </p>
                <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0 justify-center">
                  <Link
                    href={`/signin?callbackUrl=/catalog`}
                    className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors inline-block"
                  >
                    Sign In
                  </Link>
                  <button
                    onClick={() => setShowAuthPrompt(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Pagination Controls */}
          {!loading && !error && availableCars.length > 0 && (
            <div className="flex flex-col items-center mt-10 space-y-2">
              {/* Show count information - simplified version */}
              <div className="text-sm text-gray-600">
                {/* Check if any filters are applied */}
                {(searchQuery || selectedLocation || dateRange.startDate || dateRange.endDate || 
                  priceRange.min > 0 || priceRange.max < Number.MAX_SAFE_INTEGER || 
                  Object.values(activeFilters).some(filter => filter !== '')) ? (
                  // Filters applied - show filtered count
                  `Showing ${availableCars.length} available cars`
                ) : (
                  // No filters - show total count
                  `Showing ${availableCars.length} of ${totalCount} total cars`
                )}
              </div>
              
              {/* Pagination buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 rounded-md bg-[#8A7D55] text-white hover:bg-[#766b48] disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {currentPage} of {Math.ceil(totalMatchingCount / itemsPerPage)}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.next}
                  className="px-4 py-2 rounded-md bg-[#8A7D55] text-white hover:bg-[#766b48] disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
    </div>
  );
}