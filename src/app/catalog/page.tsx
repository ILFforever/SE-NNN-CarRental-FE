"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, Calendar } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config/apiConfig";
import Link from "next/link";
import { CheckCircle, Star } from "lucide-react";
import HoverableCarImage from "@/components/cars/HoverableCarImage";
import FavoriteHeartButton, {
  FavoriteCarsProvider,
} from "@/components/cars/FavoriteHeartButton";
import MobileCatalogFilter from "@/components/cars/MobileCatalogFilter"; // Adjust path as needed

// Type definitions
interface Provider {
  _id: string;
  name: string;
  address?: string;
  telephone_number?: string;
  email?: string;
  verified?: boolean;
  review?: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
      "1": number;
      "2": number;
      "3": number;
      "4": number;
      "5": number;
    };
  };
}
interface Rent {
  _id: string;
  startDate: string;
  returnDate: string;
  status: "pending" | "active" | "completed" | "cancelled";
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
  useEffect(() => {
    if (session?.user?.userType === "provider") {
      router.back(); // Go back to previous page
    }
  }, [session, router]);
  // Car data state
  const [cars, setCars] = useState<Car[]>([]);
  const [providers, setProviders] = useState<ProvidersMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);

  // Price range state
  const [priceRange, setPriceRange] = useState<PriceRange>({
    min: 0,
    max: Number.MAX_SAFE_INTEGER,
  });

  // Date range state
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
  });

  const [timePickup, setTimePickup] = useState<string>(
    searchParams.get("pickupTime") || "10:00 AM"
  );
  const [timeReturn, setTimeReturn] = useState<string>(
    searchParams.get("returnTime") || "10:00 AM"
  );
  const timeOptions = [
    "8:00 AM",
    "8:30 AM",
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
    "5:30 PM",
    "6:00 PM",
    "6:30 PM",
    "7:00 PM",
    "7:30 PM",
  ];
  // Location state
  const [selectedLocation, setSelectedLocation] = useState<string>(
    searchParams.get("location") || ""
  );
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  // Filter states
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    vehicleType: "",
    brand: "",
    year: "",
    seats: "",
    provider: "",
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

  // Option to show unavailable cars (admin only)
  const [showUnavailable, setShowUnavailable] = useState<boolean>(false);

  function useLocationSuggestions() {
    const [showLocationSuggestions, setShowLocationSuggestions] =
      useState(false);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;

        // Skip if clicking inside a dropdown or dropdown toggle
        if (
          target.closest(".location-search-container") ||
          target.closest(".location-suggestions")
        ) {
          return;
        }

        setShowLocationSuggestions(false);
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return {
      showLocationSuggestions,
      setShowLocationSuggestions,
    };
  }
  const { showLocationSuggestions, setShowLocationSuggestions } =
    useLocationSuggestions();
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
        provider: [],
      };
    }

    return {
      vehicleType: Array.from(
        new Set(
          cars.map((car) => car.type).filter((type): type is string => !!type)
        )
      ),
      brand: Array.from(
        new Set(
          cars
            .map((car) => car.brand)
            .filter((brand): brand is string => !!brand)
        )
      ),
      year: Array.from(
        new Set(
          cars
            .map((car) => car.year?.toString())
            .filter((year): year is string => !!year)
        )
      ),
      seats: Array.from(
        new Set(
          cars
            .map((car) => car.seats?.toString())
            .filter((seats): seats is string => !!seats)
        )
      ),
      provider: Array.from(
        new Set(
          cars
            .map((car) => car.provider)
            .filter((provider): provider is string => !!provider)
        )
      ),
    };
  };

  // Toggle filter selection
  const toggleFilter = (category: keyof ActiveFilters, value: string): void => {
    setActiveFilters((prev) => ({
      ...prev,
      [category]: prev[category] === value ? "" : value,
    }));
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
    };

    // Check initial load
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    // Cleanup listener
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Skip if clicking inside a dropdown or dropdown toggle
      if (
        target.closest(".filter-dropdown") ||
        target.closest(".dropdown-toggle")
      ) {
        return;
      }

      setOpenDropdown(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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

  // Set showUnavailable based on user role
  useEffect(() => {
    setShowUnavailable(session?.user?.role === "admin");
  }, [session]);

  // Fetch car data and providers from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Set up headers based on authentication status
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        // Add auth token if user is logged in
        if (session?.user?.token) {
          headers["Authorization"] = `Bearer ${session.user.token}`;
        }

        // Fetch providers first
        const providersResponse = await fetch(`${API_BASE_URL}/Car_Provider`, {
          headers,
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
          console.warn(
            "Unable to fetch providers. Using default provider names."
          );
        }

        // Build query parameters
        let queryParams = new URLSearchParams();

        // Add pagination parameters
        queryParams.append("page", currentPage.toString());
        queryParams.append("limit", itemsPerPage.toString());

        // Add location filter (by provider)
        if (selectedLocation) {
          // Find provider ID by location name
          const providerEntry = Object.entries(providersMap).find(
            ([_, provider]) =>
              provider.name === selectedLocation ||
              (provider.address && provider.address.includes(selectedLocation))
          );

          if (providerEntry) {
            queryParams.append("providerId", providerEntry[0]);
          }
        }

        // Then fetch cars
        const carsResponse = await fetch(
          `${API_BASE_URL}/cars?${queryParams.toString()}`,
          {
            headers,
          }
        );

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
            const provider = providersMap[car.provider_id] || {
              name: "Unknown Provider",
            };

            return {
              id: car._id || car.id,
              brand: car.brand || "Unknown Brand",
              model: car.model || "Unknown Model",
              year: car.manufactureDate
                ? new Date(car.manufactureDate).getFullYear()
                : 2025,
              price: car.dailyRate || 0,
              type: car.type || "Other",
              color: car.color || "Unknown",
              seats: car.seats || 5,
              providerId: car.provider_id,
              provider: provider.name || "Unknown Provider",
              verified: provider.verified || false,
              rents: car.rents || [],
              available: car.available ?? true,
              // Handle images array properly
              images:
                car.imageOrder && Array.isArray(car.imageOrder)
                  ? car.imageOrder
                  : [],
              // Keep single image for backward compatibility
              image: car.image || "/img/banner.jpg",
              license_plate: car.license_plate,
              manufactureDate: car.manufactureDate,
              dailyRate: car.dailyRate,
              tier: car.tier,
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
          setError("Invalid data format received from server");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    // Always fetch data, regardless of authentication status
    fetchData();
  }, [
    session,
    selectedLocation,
    dateRange.startDate,
    dateRange.endDate,
    currentPage,
    itemsPerPage,
  ]);

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

    return carsList.filter((car) => {
      // If car has rents array, check if any bookings overlap with selected dates
      if (car.rents && Array.isArray(car.rents)) {
        const activeRents = car.rents.filter(
          (rent) => rent.status === "active" || rent.status === "pending"
        );

        const conflictingRent = activeRents.find((rent) => {
          if (!rent.startDate || !rent.returnDate) return false;

          const rentStart = new Date(rent.startDate);
          const rentEnd = new Date(rent.returnDate);

          // Check for complete time-based overlap
          return (
            (rentStart < end && rentEnd > start) || // Overlapping period
            (start >= rentStart && start < rentEnd) || // Start date within rent period
            (end > rentStart && end <= rentEnd) // End date within rent period
          );
        });

        return !conflictingRent; // Car is available if there's no conflict
      }

      return true; // Assume available if no rent data
    });
  };
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside all dropdown containers
      const isOutsideDropdowns = Object.values(dropdownRefs.current).every(
        (ref) => ref && !ref.contains(event.target as Node)
      );

      if (isOutsideDropdowns) {
        setActiveDropdown(null);
      }
    };

    // Add event listener when a dropdown is open
    if (activeDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [activeDropdown]);

  const filterOptions = extractFilterOptions();

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    // Escape special regex characters to prevent errors
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-100 font-medium">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Filter the cars
  const filteredCars = cars.filter((car) => {
    // Filter out unavailable cars for non-admin users
    if (!showUnavailable && !car.available) {
      return false;
    }

    // Apply search query filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const modelMatch = `${car.brand} ${car.model}`
        .toLowerCase()
        .includes(searchLower);
      const providerMatch = car.provider.toLowerCase().includes(searchLower);
      const typeMatch = car.type.toLowerCase().includes(searchLower);
      const colorMatch = car.color
        ? car.color.toLowerCase().includes(searchLower)
        : false;

      if (!modelMatch && !providerMatch && !typeMatch && !colorMatch)
        return false;
    }

    // Apply price range filter
    if (car.price < priceRange.min || car.price > priceRange.max) return false;

    // Apply location filter in a more responsive way, matching anywhere in the text
    if (
      selectedLocation &&
      !car.provider.toLowerCase().includes(selectedLocation.toLowerCase())
    )
      return false;

    // Apply all other filters with case-insensitive comparison
    if (
      activeFilters.vehicleType &&
      car.type.toLowerCase() !== activeFilters.vehicleType.toLowerCase()
    )
      return false;
    if (
      activeFilters.brand &&
      car.brand.toLowerCase() !== activeFilters.brand.toLowerCase()
    )
      return false;
    if (activeFilters.year && car.year?.toString() !== activeFilters.year)
      return false;
    if (activeFilters.seats && car.seats?.toString() !== activeFilters.seats)
      return false;
    if (
      activeFilters.provider &&
      car.provider.toLowerCase() !== activeFilters.provider.toLowerCase()
    )
      return false;

    return true;
  });

  // Further filter for availability based on dates
  const availableCars = filterAvailableCars(filteredCars);

  // Handle booking a car
  const handleBookCar = (carId: string) => {
    if (!session) {
      router.push("/signin?callbackUrl=/catalog");
      return;
    }

    // Navigate to booking page with car ID and dates/times if selected
    const bookingParams = new URLSearchParams();
    bookingParams.set("carId", carId);

    if (dateRange.startDate) {
      bookingParams.set("startDate", dateRange.startDate);
    }

    if (dateRange.endDate) {
      bookingParams.set("endDate", dateRange.endDate);
    }

    // Add time parameters
    if (timePickup) {
      bookingParams.set("pickupTime", timePickup);
    }

    if (timeReturn) {
      bookingParams.set("returnTime", timeReturn);
    }

    router.push(`/reserve?${bookingParams.toString()}`);
  };

  const isCarAvailableForDates = (car: Car): boolean => {
    // If no dates are selected, consider the car as available based on its available property
    if (!dateRange.startDate || !dateRange.endDate) return car.available;

    // If car is marked as unavailable, return false
    if (!car.available) return false;

    // If car doesn't have rents data, use the available flag
    if (!car.rents || car.rents.length === 0) return car.available;

    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);

    // Check for overlaps in the booking dates
    const conflicts = car.rents.filter((rent) => {
      // Only check active and pending bookings (explicitly include acceptable statuses)
      // This avoids the TypeScript error with the "unpaid" status
      if (rent.status === "active" || rent.status === "pending") {
        const rentStartDate = new Date(rent.startDate);
        const rentEndDate = new Date(rent.returnDate);

        // If the rental period overlaps with the requested booking, return true
        return start < rentEndDate && end > rentStartDate;
      }
      return false;
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
        alert(
          "This car is not available for the selected dates. Please choose different dates or another vehicle."
        );
      } else {
        // If no dates selected, let them proceed to the reservation page
        handleBookCar(carId);
      }
    }
  };
  const handleApplyFilters = () => {
    // This can trigger your existing filter logic
    // For example, you might want to update the URL or refresh the car list
    const newParams = new URLSearchParams(searchParams.toString());

    // Update params based on current filter state
    if (searchQuery) {
      newParams.set("query", searchQuery);
    } else {
      newParams.delete("query");
    }

    if (activeFilters.vehicleType) {
      newParams.set("type", activeFilters.vehicleType);
    } else {
      newParams.delete("type");
    }

    if (activeFilters.brand) {
      newParams.set("brand", activeFilters.brand);
    } else {
      newParams.delete("brand");
    }

    // Similar logic for other filters...

    // Update URL
    router.push(`/catalog?${newParams.toString()}`);
  };
  return (
    <FavoriteCarsProvider>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="mb-6">
          <div className="relative mb-8 pb-5">
            {/* Background accent */}
            <div className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#8A7D55] to-transparent opacity-40"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              {/* Main heading section */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-black-600">
                  {loading
                    ? "Looking for vehicles..."
                    : error
                    ? "Error loading cars"
                    : "Premium Fleet"}
                </h1>
                <p className="text-gray-600 mt-2 md:mt-3">
                  {!loading && !error ? (
                    <span className="flex items-center">
                      Discover{" "}
                      <span className="inline-flex items-center justify-center bg-[#f8f5f0] border border-[#e6e1d8] text-[#8A7D55] font-medium rounded-md px-2 py-0.5 mx-1.5">
                        {totalCount}
                      </span>{" "}
                      exceptional vehicles for your journey
                    </span>
                  ) : error ? (
                    "We encountered an issue while fetching available cars"
                  ) : null}
                </p>
              </div>

              {/* Stats card */}
              {!loading && !error && cars.length > 0 && (
                <div className="flex items-center bg-white py-2 px-4 border-l-4 border-[#8A7D55] rounded shadow-sm self-stretch md:self-auto">
                  <div className="text-sm text-gray-500 mr-2">Available:</div>
                  <div className="text-lg font-semibold text-[#8A7D55]">
                    {totalMatchingCount}
                  </div>
                  <div className="mx-2 h-5 w-px bg-gray-200"></div>
                  <div className="text-sm text-gray-500 whitespace-nowrap">
                    matching your criteria
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Mobile Filter Component */}
          {isMobile && (
            <MobileCatalogFilter
              filterOptions={{
                vehicleType: extractFilterOptions().vehicleType,
                brand: extractFilterOptions().brand,
                year: extractFilterOptions().year,
                seats: extractFilterOptions().seats.map(String),
              }}
              activeFilters={activeFilters}
              setActiveFilters={setActiveFilters}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              cars={cars}
              onApplyFilters={handleApplyFilters}
            />
          )}

          {/* Filters and search */}
          {!isMobile && (
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Date range selector - now more compact */}
                <div className="col-span-2">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      Rental Period:
                    </div>
                    <div className="flex space-x-2 flex-1">
                      <div className="flex-1 relative">
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-2 text-xs">
                            From
                          </span>
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
                                  setDateRange({
                                    ...dateRange,
                                    startDate: e.target.value,
                                  });
                                  updateSearch({ startDate: e.target.value });
                                }}
                                className="block w-full pl-5 pr-2 py-1 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-[#8A7D55] focus:border-[#8A7D55] text-xs"
                              />
                            </div>

                            {/* Time select */}
                            <select
                              value={timePickup}
                              onChange={(e) => {
                                setTimePickup(e.target.value);
                                updateSearch({ pickupTime: e.target.value });
                              }}
                              className="border border-gray-300 rounded-md text-xs py-1 px-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#8A7D55] focus:border-[#8A7D55]"
                            >
                              {timeOptions.map((time) => (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 relative">
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-2 text-xs">
                            Until
                          </span>
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
                                  setDateRange({
                                    ...dateRange,
                                    endDate: newEndDate,
                                  });
                                  updateSearch({ endDate: newEndDate });
                                }}
                                className="block w-full pl-5 pr-2 py-1 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-[#8A7D55] focus:border-[#8A7D55] text-xs"
                              />
                            </div>
                            <select
                              value={timeReturn}
                              onChange={(e) => {
                                const newReturnTime = e.target.value;
                                setTimeReturn(newReturnTime);
                                updateSearch({ returnTime: newReturnTime });
                              }}
                              className="border border-gray-300 rounded-md text-xs py-1 px-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#8A7D55] focus:border-[#8A7D55]"
                            >
                              {timeOptions.map((time) => (
                                <option key={time} value={time}>
                                  {time}
                                </option>
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
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none z-[1000]">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by model, brand..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setActiveDropdown("search");
                    }}
                    onClick={() => {
                      if (searchQuery.trim() !== "") {
                        setActiveDropdown("search");
                      }
                    }}
                    onFocus={() => {
                      if (searchQuery.trim() !== "") {
                        setActiveDropdown("search");
                      }
                    }}
                    className="block w-full pl-7 pr-2 py-1 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#8A7D55] focus:border-[#8A7D55] text-sm placeholder-opacity-50 focus:placeholder-opacity-0"
                  />

                  {/* Search suggestions dropdown */}
                  {activeDropdown === "search" && searchQuery.trim() !== "" && (
                    <div
                      ref={(el) => {
                        if (el) {
                          dropdownRefs.current["search"] = el;
                        }
                      }}
                      className="absolute z-[99] mt-1 w-full bg-white shadow-lg rounded-md py-1 max-h-56 overflow-auto"
                    >
                      {/* Show brand suggestions */}
                      {filterOptions.brand
                        .filter((brand) =>
                          brand
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        )
                        .map((brand, index) => (
                          <div
                            key={`brand-${index}`}
                            className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                            onClick={() => {
                              setSearchQuery(brand);
                              setActiveFilters((prev) => ({ ...prev, brand }));
                              setActiveDropdown(null);
                            }}
                          >
                            <span className="text-xs text-gray-500 mr-2">
                              Brand:
                            </span>
                            {highlightMatch(brand, searchQuery)}
                          </div>
                        ))}

                      {/* Show model suggestions from cars */}
                      {cars
                        .filter((car) =>
                          car.model
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        )
                        .slice(0, 5) // Limit to 5 suggestions
                        .map((car, index) => (
                          <div
                            key={`model-${index}`}
                            className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                            onClick={() => {
                              setSearchQuery(car.model);
                              setActiveDropdown(null);
                            }}
                          >
                            <span className="text-xs text-gray-500 mr-2">
                              Model:
                            </span>
                            {highlightMatch(car.model, searchQuery)}
                          </div>
                        ))}

                      {/* Show provider suggestions */}
                      {filterOptions.provider
                        .filter((provider) =>
                          provider
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        )
                        .map((provider, index) => (
                          <div
                            key={`provider-${index}`}
                            className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                            onClick={() => {
                              setSearchQuery(provider);
                              setActiveFilters((prev) => ({
                                ...prev,
                                provider,
                              }));
                              setActiveDropdown(null);
                            }}
                          >
                            <span className="text-xs text-gray-500 mr-2">
                              Provider:
                            </span>
                            {highlightMatch(provider, searchQuery)}
                          </div>
                        ))}

                      {/* Show type suggestions */}
                      {filterOptions.vehicleType
                        .filter((type) =>
                          type.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((type, index) => (
                          <div
                            key={`type-${index}`}
                            className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                            onClick={() => {
                              setSearchQuery(type);
                              setActiveFilters((prev) => ({
                                ...prev,
                                vehicleType: type,
                              }));
                              setActiveDropdown(null);
                            }}
                          >
                            <span className="text-xs text-gray-500 mr-2">
                              Type:
                            </span>
                            {highlightMatch(type, searchQuery)}
                          </div>
                        ))}

                      {/* No results message */}
                      {!filterOptions.brand.some((brand) =>
                        brand.toLowerCase().includes(searchQuery.toLowerCase())
                      ) &&
                        !cars.some((car) =>
                          car.model
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        ) &&
                        !filterOptions.provider.some((provider) =>
                          provider
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        ) &&
                        !filterOptions.vehicleType.some((type) =>
                          type.toLowerCase().includes(searchQuery.toLowerCase())
                        ) && (
                          <div className="px-4 py-2 text-gray-500 italic text-sm">
                            No matching results found
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>

              {/* Second row */}
              <div className="md:col-span-2">
                {/* Price range selector - lowercase from/until */}
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-700 mr-2 whitespace-nowrap">
                    Price Range:
                  </div>
                  <div className="flex-1 flex space-x-3 items-center">
                    <div className="flex-1 relative">
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-1 text-xs">from</span>
                        <div className="flex-1 relative">
                          <span className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-gray-400">
                            $
                          </span>
                          <input
                            type="number"
                            min="0"
                            max={priceRange.max}
                            value={priceRange.min}
                            onChange={(e) =>
                              setPriceRange({
                                ...priceRange,
                                min: parseInt(e.target.value) || 0,
                              })
                            }
                            className="block w-full pl-5 pr-2 py-1 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-[#8A7D55] focus:border-[#8A7D55] text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 relative">
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-1 text-xs">
                          until
                        </span>
                        <div className="flex-1 relative">
                          <span className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-gray-400">
                            $
                          </span>
                          <input
                            type="text"
                            min={priceRange.min}
                            value={
                              priceRange.max === Number.MAX_SAFE_INTEGER
                                ? ""
                                : priceRange.max
                            }
                            onChange={(e) =>
                              setPriceRange({
                                ...priceRange,
                                max: parseInt(e.target.value) || 0,
                              })
                            }
                            className="block w-full pl-5 pr-2 py-1 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-[#8A7D55] focus:border-[#8A7D55] text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setPriceRange({ min: 0, max: Number.MAX_SAFE_INTEGER })
                      }
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <div>
                {/* Filter buttons - styled better */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <div className="flex flex-wrap gap-2 pt-2">
                    {/* Vehicle Type Dropdown */}
                    <div
                      ref={(el) => {
                        if (el) {
                          dropdownRefs.current["vehicleType"] = el;
                        }
                      }}
                      className="relative group"
                    >
                      <div
                        className={`flex items-center px-3 py-1 border rounded-md cursor-pointer transition-colors ${
                          activeFilters.vehicleType
                            ? "bg-[#8A7D55] text-white border-[#766b48]"
                            : "bg-white hover:bg-gray-50 border-gray-300"
                        }`}
                        onClick={() =>
                          setActiveDropdown((prev) =>
                            prev === "vehicleType" ? null : "vehicleType"
                          )
                        }
                      >
                        <span className="text-sm">
                          Vehicle type{" "}
                          {activeFilters.vehicleType &&
                            `· ${activeFilters.vehicleType}`}
                        </span>
                        <ChevronDown size={14} className="ml-1" />
                      </div>

                      {activeDropdown === "vehicleType" && (
                        <div className="absolute left-0 top-full mt-1 bg-white shadow-lg rounded-md p-1 z-10 min-w-[150px]">
                          {filterOptions.vehicleType.map((type) => (
                            <div
                              key={type}
                              className={`px-3 py-1.5 cursor-pointer hover:bg-gray-100 rounded text-sm ${
                                activeFilters.vehicleType === type
                                  ? "bg-gray-100 font-medium"
                                  : ""
                              }`}
                              onClick={() => {
                                toggleFilter("vehicleType", type);
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
                      ref={(el) => {
                        if (el) {
                          dropdownRefs.current["brand"] = el;
                        }
                      }}
                      className="relative group"
                    >
                      <div
                        className={`flex items-center px-3 py-1 border rounded-md cursor-pointer transition-colors ${
                          activeFilters.brand
                            ? "bg-[#8A7D55] text-white border-[#766b48]"
                            : "bg-white hover:bg-gray-50 border-gray-300"
                        }`}
                        onClick={() =>
                          setActiveDropdown((prev) =>
                            prev === "brand" ? null : "brand"
                          )
                        }
                      >
                        <span className="text-sm">
                          Make{" "}
                          {activeFilters.brand && `· ${activeFilters.brand}`}
                        </span>
                        <ChevronDown size={14} className="ml-1" />
                      </div>

                      {activeDropdown === "brand" && (
                        <div className="absolute left-0 top-full mt-1 bg-white shadow-lg rounded-md p-1 z-10 min-w-[150px]">
                          {filterOptions.brand.map((brand) => (
                            <div
                              key={brand}
                              className={`px-3 py-1.5 cursor-pointer hover:bg-gray-100 rounded text-sm ${
                                activeFilters.brand === brand
                                  ? "bg-gray-100 font-medium"
                                  : ""
                              }`}
                              onClick={() => {
                                toggleFilter("brand", brand);
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
                      ref={(el) => {
                        if (el) {
                          dropdownRefs.current["year"] = el;
                        }
                      }}
                      className="relative group"
                    >
                      <div
                        className={`flex items-center px-3 py-1 border rounded-md cursor-pointer transition-colors ${
                          activeFilters.year
                            ? "bg-[#8A7D55] text-white border-[#766b48]"
                            : "bg-white hover:bg-gray-50 border-gray-300"
                        }`}
                        onClick={() =>
                          setActiveDropdown((prev) =>
                            prev === "year" ? null : "year"
                          )
                        }
                      >
                        <span className="text-sm">
                          Year {activeFilters.year && `· ${activeFilters.year}`}
                        </span>
                        <ChevronDown size={14} className="ml-1" />
                      </div>

                      {activeDropdown === "year" && (
                        <div className="absolute left-0 top-full mt-1 bg-white shadow-lg rounded-md p-1 z-10 min-w-[150px]">
                          {filterOptions.year.map((year) => (
                            <div
                              key={year}
                              className={`px-3 py-1.5 cursor-pointer hover:bg-gray-100 rounded text-sm ${
                                activeFilters.year === year
                                  ? "bg-gray-100 font-medium"
                                  : ""
                              }`}
                              onClick={() => {
                                toggleFilter("year", year);
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
                      ref={(el) => {
                        if (el) {
                          dropdownRefs.current["seats"] = el;
                        }
                      }}
                      className="relative group"
                    >
                      <div
                        className={`flex items-center px-3 py-1 border rounded-md cursor-pointer transition-colors ${
                          activeFilters.seats
                            ? "bg-[#8A7D55] text-white border-[#766b48]"
                            : "bg-white hover:bg-gray-50 border-gray-300"
                        }`}
                        onClick={() =>
                          setActiveDropdown((prev) =>
                            prev === "seats" ? null : "seats"
                          )
                        }
                      >
                        <span className="text-sm">
                          Seats{" "}
                          {activeFilters.seats && `· ${activeFilters.seats}`}
                        </span>
                        <ChevronDown size={14} className="ml-1" />
                      </div>

                      {activeDropdown === "seats" && (
                        <div className="absolute left-0 top-full mt-1 bg-white shadow-lg rounded-md p-1 z-10 min-w-[150px]">
                          {filterOptions.seats.map((seat) => (
                            <div
                              key={seat}
                              className={`px-3 py-1.5 cursor-pointer hover:bg-gray-100 rounded text-sm ${
                                activeFilters.seats === seat
                                  ? "bg-gray-100 font-medium"
                                  : ""
                              }`}
                              onClick={() => {
                                toggleFilter("seats", seat);
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
                  {(Object.values(activeFilters).some(
                    (filter) => filter !== ""
                  ) ||
                    priceRange.min > 0 ||
                    priceRange.max < 500 ||
                    dateRange.startDate ||
                    dateRange.endDate ||
                    selectedLocation ||
                    searchQuery) && (
                    <button
                      className="flex items-center px-3 py-1 border border-red-300 text-red-600 rounded-md cursor-pointer hover:bg-red-50 ml-auto text-sm transition-colors"
                      onClick={() => {
                        setActiveFilters({
                          vehicleType: "",
                          brand: "",
                          year: "",
                          seats: "",
                          provider: "",
                        });
                        setPriceRange({ min: 0, max: Number.MAX_SAFE_INTEGER });
                        setDateRange({ startDate: "", endDate: "" });
                        setSelectedLocation("");
                        setSearchQuery("");
                        // Clear URL params
                        router.push("/catalog");
                      }}
                    >
                      <span>Clear all filters</span>
                    </button>
                  )}
                  {/* Admin toggle as a filter button */}
                  {session?.user?.role === "admin" && (
                    <div className="ml-auto">
                      <button
                        onClick={() => setShowUnavailable(!showUnavailable)}
                        className={`px-2 py-1 rounded-md transition-colors ${
                          showUnavailable
                            ? "bg-[#8A7D55] text-white"
                            : "bg-white border border-gray-300 text-gray-700"
                        }`}
                      >
                        Admin {showUnavailable ? "Hiding" : "Show"} Unavailable
                        Cars
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55]"></div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-10">
            <h3 className="text-xl font-medium text-red-600">
              Error loading cars
            </h3>
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
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            data-test-id="catalog"
          >
            {availableCars.map((car) => (
              <div
                key={car.id}
                className={`${
                  !car.available && showUnavailable ? "opacity-60" : ""
                } bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:scale-[1.02] hover:rotate-1`}
                data-test-id="catalog-item"
              >
                <div className="relative h-48">
                  <FavoriteHeartButton
                    carId={car.id}
                    className="top-2 right-2"
                  />
                  <HoverableCarImage car={car} />
                  {/* Show unavailable badge for admin */}
                  {!car.available && showUnavailable && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                      Unavailable
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2
                        className="text-lg font-bold"
                        data-test-id="catalog-item-title"
                      >
                        {car.brand} {car.model}
                      </h2>
                      <div className="text-sm text-gray-600 -mt-1 flex items-center flex-wrap">
                        {car.year} •{" "}
                        <span className="font-medium text-[#8A7D55] ml-1">
                          {car.provider}
                        </span>
                        {/* verified icon */}
                        {car.verified && (
                          <div className="ml-2 relative group inline-flex items-center">
                            <CheckCircle className="text-green-500 w-4 h-4" />
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-70 transition-opacity">
                              Verified
                            </span>
                          </div>
                        )}
                        {/* Rating */}
                        {providers[car.providerId]?.review?.averageRating !==
                          undefined && (
                          <div className="ml-2 relative group inline-flex items-center">
                            <Star className="text-yellow-500 w-4 h-4" />
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-70 transition-opacity">
                              Rated by{" "}
                              {providers[car.providerId]?.review?.totalReviews}{" "}
                              {providers[car.providerId]?.review
                                ?.totalReviews === 1
                                ? "person"
                                : "people"}
                            </span>
                            <span className="ml-1 text-sm text-yellow-500">
                              {providers[
                                car.providerId
                              ]?.review?.averageRating?.toFixed(1)}
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
                          ? "bg-[#8A7D55] hover:bg-[#766b48] text-white"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      } rounded-md text-sm font-medium transition-colors duration-200 shadow-sm`}
                      onClick={() => handleCarAction(car.id, car)}
                      disabled={!isCarAvailableForDates(car)}
                    >
                      {isCarAvailableForDates(car)
                        ? "View Car"
                        : car.available
                        ? "Not Available for Selected Dates"
                        : "Currently Unavailable"}
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
            <h3 className="text-xl font-medium text-gray-600">
              No cars match your search criteria
            </h3>
            <p className="text-gray-500 mt-2">
              Try adjusting your dates, location, or other filters
            </p>
            <button
              className="mt-4 px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48]"
              onClick={() => {
                setActiveFilters({
                  vehicleType: "",
                  brand: "",
                  year: "",
                  seats: "",
                  provider: "",
                });
                setPriceRange({ min: 0, max: Number.MAX_SAFE_INTEGER });
                setDateRange({ startDate: "", endDate: "" });
                setSelectedLocation("");
                setSearchQuery("");
                // Clear URL params
                router.push("/catalog");
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
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  Authentication Required
                </h3>
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
              {searchQuery ||
              selectedLocation ||
              dateRange.startDate ||
              dateRange.endDate ||
              priceRange.min > 0 ||
              priceRange.max < Number.MAX_SAFE_INTEGER ||
              Object.values(activeFilters).some((filter) => filter !== "")
                ? // Filters applied - show filtered count
                  `Showing ${availableCars.length} available cars`
                : // No filters - show total count
                  `Showing ${availableCars.length} of ${totalCount} total cars`}
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1}
                className="px-4 py-2 rounded-md bg-[#8A7D55] text-white hover:bg-[#766b48] disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {currentPage} of{" "}
                {Math.ceil(totalMatchingCount / itemsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!pagination.next}
                className="px-4 py-2 rounded-md bg-[#8A7D55] text-white hover:bg-[#766b48] disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </FavoriteCarsProvider>
  );
}
