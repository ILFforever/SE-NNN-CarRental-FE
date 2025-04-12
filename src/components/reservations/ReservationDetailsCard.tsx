import React, { useState, useEffect } from "react";
import { Edit, Loader2, Save, X, Plus, Minus } from "lucide-react";
import { API_BASE_URL } from "@/config/apiConfig";
import dayjs from "dayjs";

interface DetailsCardProps {
  rental: any;
  userType: "customer" | "provider" | "admin";
  token: string;
  onUpdate?: (updatedRental: any) => void;
  calculateRentalPeriod: (startDate: string, returnDate: string) => number;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
  calculateServiceCost: () => number;
  calculateTotalPrice: () => number;
  daysLate: number;
  totalLateFee: number;
  userTier?: number; // user tier
}

export default function ReservationDetailsCard({
  rental,
  userType,
  token,
  userTier = 0,
  onUpdate,
  calculateRentalPeriod,
  formatCurrency,
  formatDate,
  formatTime,
  calculateServiceCost,
  calculateTotalPrice,
  daysLate,
  totalLateFee,
}: DetailsCardProps) {
  // State for edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // State for services
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [serviceNames, setServiceNames] = useState<{ [key: string]: string }>(
    {}
  );
  const [serviceRates, setServiceRates] = useState<{ [key: string]: number }>(
    {}
  );
  const [serviceDailyStatus, setServiceDailyStatus] = useState<{
    [key: string]: boolean;
  }>({});
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingServiceNames, setIsLoadingServiceNames] = useState(false);
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [price, setPrice] = useState<number>(0);

  const tierDiscounts = [0, 5, 10, 15, 20];
  // State to track car data for availability check
  const [carData, setCarData] = useState<Car | null>(null);

  // Handle edit availability
  const canEdit =
    (userType === "customer" && rental.status === "pending") ||
    (userType === "admin" &&
      (rental.status === "pending" || rental.status === "active"));

  useEffect(() => {
    if (isEditing && rental) {
      // Calculate the new base price
      const newBasePrice = calculateBasePrice();

      // Calculate new service cost (if you have the necessary service data)
      const newServiceCost = calculateServiceCostFromIds();

      // Update the price state
      setPrice(newBasePrice + newServiceCost);
    }
  }, [isEditing, startDate, returnDate, selectedServices]);

  // Initialize form data when rental changes
  useEffect(() => {
    if (rental) {
      // Format dates for input fields (YYYY-MM-DD)
      setStartDate(dayjs(rental.startDate).format("YYYY-MM-DD"));
      setReturnDate(dayjs(rental.returnDate).format("YYYY-MM-DD"));

      // Initialize selected services
      if (rental.service && Array.isArray(rental.service)) {
        setSelectedServices([...rental.service]);
      }

      // Get car data for availability checks and services
      const carId =
        typeof rental.car === "object" ? rental.car._id : rental.car;
      if (carId && token) {
        fetchCarData(carId);
        fetchCarServices(carId);
      }
    }
  }, [rental, token]);

  //use effect for updating discount
  useEffect(() => {
    if (isEditing && rental) {
      const dynamicDiscountAmount = calculateDynamicDiscount();

      // Update price state if needed
      setPrice(
        calculateBasePrice() +
          calculateServiceCostFromIds() -
          dynamicDiscountAmount
      );
    }
  }, [isEditing, startDate, returnDate, selectedServices, rental, userTier]);

  // Fetch car data for availability checks
  const fetchCarData = async (carId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cars/${carId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setCarData(data.data);
        }
      }
    } catch (err) {
      console.error("Error fetching car data:", err);
    }
  };

  // Fetch services available for this specific car
  const fetchCarServices = async (carId: string) => {
    setIsLoadingServices(true);
    setIsLoadingServiceNames(true);

    try {
      // Use the car-specific services endpoint
      const response = await fetch(`${API_BASE_URL}/services/${carId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch car services: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success || !Array.isArray(data.data)) {
        throw new Error("Invalid service data format received");
      }

      // Filter only available services
      const services = data.data.filter(
        (service: Service) => service.available
      );
      setAvailableServices(services);

      // Create maps for service properties
      const namesMap: { [key: string]: string } = {};
      const ratesMap: { [key: string]: number } = {};
      const dailyStatusMap: { [key: string]: boolean } = {};

      services.forEach((service: Service) => {
        namesMap[service._id] = service.name;
        ratesMap[service._id] = service.rate;
        dailyStatusMap[service._id] = service.daily;
      });

      // Handle services that are in the rental but not in the list (legacy services)
      if (rental.service && Array.isArray(rental.service)) {
        rental.service.forEach((serviceId: string) => {
          if (!namesMap[serviceId]) {
            namesMap[serviceId] = `Service ${serviceId.substring(0, 6)}...`;
            ratesMap[serviceId] = 0;
            dailyStatusMap[serviceId] = true; // Default to daily for unknown services
          }
        });
      }

      setServiceNames(namesMap);
      setServiceRates(ratesMap);
      setServiceDailyStatus(dailyStatusMap);
    } catch (err) {
      console.error("Error fetching car services:", err);
      setError("Could not load services for this car");

      // Create fallback data for services already in the rental
      if (rental.service && Array.isArray(rental.service)) {
        const fallbackNames: { [key: string]: string } = {};
        const fallbackRates: { [key: string]: number } = {};
        const fallbackDaily: { [key: string]: boolean } = {};

        rental.service.forEach((serviceId: string) => {
          fallbackNames[serviceId] = `Service ${serviceId.substring(0, 6)}...`;
          fallbackRates[serviceId] = 0;
          fallbackDaily[serviceId] = true;
        });

        setServiceNames(fallbackNames);
        setServiceRates(fallbackRates);
        setServiceDailyStatus(fallbackDaily);
      }
    } finally {
      setIsLoadingServices(false);
      setIsLoadingServiceNames(false);
    }
  };

  // Check car availability for the selected dates
  const checkCarAvailability = (): boolean => {
    // Don't check if we're not changing dates or if this is the original rental's dates
    if (
      startDate === dayjs(rental.startDate).format("YYYY-MM-DD") &&
      returnDate === dayjs(rental.returnDate).format("YYYY-MM-DD")
    ) {
      return true;
    }

    if (!carData || !carData.rents) {
      setError("Cannot check car availability. Car data is missing.");
      return false;
    }

    const newStart = dayjs(startDate);
    const newEnd = dayjs(returnDate);

    // Check for overlaps with other active/pending rentals
    const conflicts = carData.rents.filter((rent: any) => {
      // Skip the current rental we're editing
      if (rent._id === rental._id) {
        return false;
      }

      // Only check active and pending rentals
      if (rent.status !== "active" && rent.status !== "pending") {
        return false;
      }

      const rentStart = dayjs(rent.startDate);
      const rentEnd = dayjs(rent.returnDate);

      // Check for overlap
      return newStart.isBefore(rentEnd) && newEnd.isAfter(rentStart);
    });

    if (conflicts.length > 0) {
      setError(
        "Car is not available for these dates. Another reservation overlaps with your requested period."
      );
      return false;
    }

    return true;
  };

  // Toggle a service selection
  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    // Validate dates
    const newStartDate = dayjs(startDate);
    const newReturnDate = dayjs(returnDate);

    if (!newStartDate.isValid() || !newReturnDate.isValid()) {
      setError("Invalid date format");
      return;
    }

    if (newReturnDate.isBefore(newStartDate)) {
      setError("Return date cannot be before start date");
      return;
    }

    // Check availability
    if (!checkCarAvailability()) {
      return; // Error is set by checkCarAvailability
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Calculate new price based on changes
      const newBasePrice = calculateBasePrice();
      const newServicePrice = calculateServiceCostFromIds();
      const subtotal = newBasePrice + newServicePrice;

      // Dynamic discount calculation
      const tierDiscounts = [0, 5, 10, 15, 20];
      const userTier = rental.user?.tier || 0;
      const discountPercentage = tierDiscounts[userTier] || 0;
      const dynamicDiscountAmount = calculateDynamicDiscount();

      const newFinalPrice =
        subtotal - dynamicDiscountAmount + (rental.additionalCharges || 0);

      // Create update payload
      const updateData = {
        startDate: newStartDate.toISOString(),
        returnDate: newReturnDate.toISOString(),
        service: selectedServices,
        price: newBasePrice,
        servicePrice: newServicePrice,
        discountAmount: dynamicDiscountAmount, // Use dynamically calculated discount
        finalPrice: newFinalPrice,
      };

      // Make API call to update reservation
      const response = await fetch(`${API_BASE_URL}/rents/${rental._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update reservation");
      }

      // Get the updated data
      const data = await response.json();

      // Fetch the full reservation details with populated references
      try {
        const fullDataResponse = await fetch(
          `${API_BASE_URL}/rents/${rental._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (fullDataResponse.ok) {
          const fullData = await fullDataResponse.json();
          if (fullData.success && fullData.data) {
            // Update with complete data
            if (onUpdate) {
              onUpdate(fullData.data);
            }
          } else {
            throw new Error("Invalid response format");
          }
        } else {
          throw new Error("Failed to fetch updated rental details");
        }
      } catch (err) {
        console.warn("Error fetching complete rental data:", err);
        // Fall back to the partial data from the update
        if (onUpdate && data.data) {
          onUpdate(data.data);
        }
      }

      setSuccess("Reservation updated successfully");
      setIsEditing(false);
      setShowServiceSelector(false);
    } catch (err) {
      console.error("Error updating reservation:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    // Reset to original values
    setStartDate(dayjs(rental.startDate).format("YYYY-MM-DD"));
    setReturnDate(dayjs(rental.returnDate).format("YYYY-MM-DD"));

    // Reset selected services to original
    if (rental.service && Array.isArray(rental.service)) {
      setSelectedServices([...rental.service]);
    } else {
      setSelectedServices([]);
    }

    setIsEditing(false);
    setShowServiceSelector(false);
    setError(null);
  };

  // Calculate service costs based on the selected services and rental period
  const calculateServiceCostFromIds = () => {
    if (!selectedServices.length) return 0;

    // Calculate rental period
    const days = dayjs(returnDate).diff(dayjs(startDate), "day") + 1;

    // Calculate service costs
    return selectedServices.reduce((sum, serviceId) => {
      const rate = serviceRates[serviceId] || 0;
      const isDaily = serviceDailyStatus[serviceId] || false;

      // Apply rate based on service type
      return sum + (isDaily ? rate * days : rate);
    }, 0);
  };

  const calculateDynamicDiscount = () => {
    // Calculate base price for the current dates
    const basePrice = calculateBasePrice();

    // Calculate service cost based on current selections
    const servicePrice = calculateServiceCostFromIds();

    // Calculate total subtotal
    const subtotal = basePrice + servicePrice;

    // Use provided userTier or fallback to 0
    const discountPercentage = tierDiscounts[userTier] || 0;
    const dynamicDiscountAmount = subtotal * (discountPercentage / 100);

    return dynamicDiscountAmount;
  };

  // Calculate base price (car daily rate * days) + services
  const calculateBasePrice = () => {
    if (!rental) return 0;

    // Get the daily rate from the car
    const dailyRate =
      typeof rental.car === "object" ? rental.car.dailyRate || 0 : 0;

    // Calculate rental period
    const days = dayjs(returnDate).diff(dayjs(startDate), "day") + 1;

    // Return base price
    return days * dailyRate;
  };

  // Get the service name by ID with loading state handling
  const getServiceName = (serviceId: string): string => {
    if (isLoadingServiceNames) return "Loading...";

    // Check if we have the name cached
    if (serviceNames[serviceId]) {
      return serviceNames[serviceId];
    }

    // Check if it's in available services
    const service = availableServices.find((s) => s._id === serviceId);
    if (service) {
      return service.name;
    }

    // Fallback
    return `Service ${serviceId.substring(0, 6)}...`;
  };

  // Get the service rate by ID
  const getServiceRate = (serviceId: string): number => {
    // Check if we have the rate cached
    if (serviceRates[serviceId] !== undefined) {
      return serviceRates[serviceId];
    }

    // Check if it's in available services
    const service = availableServices.find((s) => s._id === serviceId);
    if (service) {
      return service.rate;
    }

    // Fallback
    return 0;
  };

  // Get if service is daily or one-time
  const getServiceIsDaily = (serviceId: string): boolean => {
    // Check if we have the status cached
    if (serviceDailyStatus[serviceId] !== undefined) {
      return serviceDailyStatus[serviceId];
    }

    // Check if it's in available services
    const service = availableServices.find((s) => s._id === serviceId);
    if (service) {
      return service.daily;
    }

    // Fallback - assume daily
    return true;
  };

  // Format for service badge display
  const formatServiceRate = (serviceId: string): string => {
    const rate = getServiceRate(serviceId);
    const isDaily = getServiceIsDaily(serviceId);

    if (rate <= 0) return "";

    return isDaily ? `+$${rate}/day` : `+$${rate} (once)`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium text-[#8A7D55]">
          Reservation Details
        </h2>

        {/* Edit button - only shown when editable */}
        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center text-gray-600 hover:text-[#8A7D55] transition-colors"
            aria-label="Edit reservation details"
          >
            <Edit size={16} className="mr-1" />
            <span className="text-sm">Edit</span>
          </button>
        )}

        {/* Save/Cancel buttons when editing */}
        {isEditing && (
          <div className="relative">
            <div className="absolute right-0 -top-3 flex items-center space-x-2">
              <button
                onClick={handleSaveChanges}
                className="flex items-center justify-center px-2 py-1.5 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors text-sm"
                aria-label="Save changes"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Save size={14} className="mr-1" />
                )}
                {isLoading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center justify-center px-2 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                aria-label="Cancel editing"
                disabled={isLoading}
              >
                <X size={14} className="mr-1" />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error and success messages */}
      {error && (
        <div className="mb-4 p-2 bg-red-50 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-2 bg-green-50 text-green-700 text-sm rounded-md">
          {success}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <p className="text-gray-600 text-sm">Reservation ID</p>
          <p className="font-medium text-sm">{rental._id}</p>
        </div>

        <div>
          <p className="text-gray-600 text-sm">Created On</p>
          <p className="font-medium">
            {formatDate(rental.createdAt)} {formatTime(rental.createdAt)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {isEditing ? (
            // Editable date fields
            <>
              <div>
                <p className="text-gray-600 text-sm">Start Date</p>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                  min={dayjs().format("YYYY-MM-DD")} // Can't select dates in the past
                />
              </div>

              <div>
                <p className="text-gray-600 text-sm">Return Date</p>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                  min={startDate} // Return date must be after start date
                />
              </div>
            </>
          ) : (
            // Read-only date fields
            <>
              <div>
                <p className="text-gray-600 text-sm">Start Date</p>
                <p className="font-medium">{formatDate(rental.startDate)}</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Return Date</p>
                <p className="font-medium">{formatDate(rental.returnDate)}</p>
              </div>
            </>
          )}

          {rental.actualReturnDate && (
            <div>
              <p className="text-gray-600 text-sm">Actual Return</p>
              <p className="font-medium">
                {formatDate(rental.actualReturnDate)}
              </p>
            </div>
          )}

          <div>
            <p className="text-gray-600 text-sm">Duration</p>
            <p className="font-medium">
              {isEditing
                ? `${dayjs(returnDate).diff(dayjs(startDate), "day") + 1} days`
                : `${calculateRentalPeriod(
                    rental.startDate,
                    rental.returnDate
                  )} days`}
            </p>
          </div>
        </div>

        <hr className="my-3" />

        {/* Services Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-gray-600 text-sm font-medium">
              Additional Services
            </p>

            {isEditing && (
              <button
                onClick={() => setShowServiceSelector(!showServiceSelector)}
                className="text-xs flex items-center text-[#8A7D55] hover:text-[#766b48]"
              >
                {showServiceSelector ? (
                  <>
                    <Minus size={14} className="mr-1" />
                    Hide Services
                  </>
                ) : (
                  <>
                    <Edit size={14} className="mr-1" />
                    Edit Services
                  </>
                )}
              </button>
            )}
          </div>

          {/* Current selected services display */}
          {!isEditing || !showServiceSelector ? (
            <div className="mb-3">
              {selectedServices.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No additional services selected
                </p>
              ) : (
                <div>
                  {isLoadingServiceNames ? (
                    // Display loading indicator while fetching service names
                    <div className="flex items-center text-gray-500 text-sm">
                      <Loader2 size={14} className="mr-2 animate-spin" />
                      Loading service details...
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedServices.map((serviceId) => (
                        <div
                          key={serviceId}
                          className="bg-[#F5F2EA] text-[#8A7D55] px-2 py-1 rounded-full text-xs flex items-center"
                        >
                          {getServiceName(serviceId)}
                          {getServiceRate(serviceId) > 0 && (
                            <span className="ml-1 font-medium">
                              ({formatServiceRate(serviceId)})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}

          {/* Service selector in edit mode */}
          {isEditing && showServiceSelector && (
            <div className="border border-gray-200 rounded-md p-3 mb-4 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-sm">Select Services</h4>
                {isLoadingServices ? (
                  <span className="text-xs text-gray-500">Loading...</span>
                ) : (
                  availableServices.length > 0 && (
                    <button
                      onClick={() =>
                        setSelectedServices(
                          availableServices.length === selectedServices.length
                            ? []
                            : availableServices.map((s) => s._id)
                        )
                      }
                      className="text-xs text-[#8A7D55] hover:underline"
                    >
                      {availableServices.length === selectedServices.length
                        ? "Clear all"
                        : "Select all"}
                    </button>
                  )
                )}
              </div>

              {isLoadingServices ? (
                <div className="flex items-center justify-center py-4 text-gray-500">
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Loading available services for this car...
                </div>
              ) : availableServices.length === 0 ? (
                <div className="bg-amber-50 text-amber-800 p-3 rounded text-sm">
                  <p className="flex items-center">
                    <svg
                      className="h-4 w-4 mr-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    No additional services are available for this vehicle
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {availableServices.map((service) => (
                    <div
                      key={service._id}
                      className="flex items-center justify-between bg-white p-2 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center flex-1 min-w-0 mr-2">
                        <input
                          type="checkbox"
                          id={`service-${service._id}`}
                          checked={selectedServices.includes(service._id)}
                          onChange={() => toggleService(service._id)}
                          className="h-4 w-4 text-[#8A7D55] rounded border-gray-300 focus:ring-[#8A7D55]"
                        />
                        <label
                          htmlFor={`service-${service._id}`}
                          className="ml-2 text-sm text-gray-700 cursor-pointer truncate"
                          title={service.description || service.name}
                        >
                          {service.name}
                          {service.description && (
                            <span className="hidden sm:inline text-xs text-gray-500 ml-1">
                              -{" "}
                              {service.description.length > 30
                                ? service.description.substring(0, 30) + "..."
                                : service.description}
                            </span>
                          )}
                        </label>
                      </div>
                      <span className="text-xs flex-shrink-0 bg-[#F5F2EA] text-[#8A7D55] px-2 py-0.5 rounded-full">
                        +${service.rate.toFixed(2)}
                        {service.daily ? "/day" : " (once)"}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {isEditing && showServiceSelector && !isLoadingServices && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  {availableServices.length === 0 ? (
                    <p className="text-amber-600 text-sm">
                      No additional services available for this vehicle
                    </p>
                  ) : (
                    <>
                      <h4 className="text-sm font-medium mb-1">
                        Estimated Cost with Services
                      </h4>
                      <p className="text-[#8A7D55] font-bold">
                        {formatCurrency(calculateBasePrice())}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        for{" "}
                        {dayjs(returnDate).diff(dayjs(startDate), "day") + 1}{" "}
                        days
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Price Column */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Base Rental</span>
            <span className="text-sm font-medium">
              {isEditing
                ? formatCurrency(calculateBasePrice())
                : formatCurrency(rental.price)}
            </span>
          </div>

          {/* Service Charges - dynamic during editing */}
          {(isEditing
            ? calculateServiceCostFromIds() > 0
            : rental.servicePrice > 0) && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Service Charges</span>
              <span className="text-sm font-medium text-blue-600">
                {isEditing
                  ? formatCurrency(calculateServiceCostFromIds())
                  : formatCurrency(rental.servicePrice || 0)}
              </span>
            </div>
          )}

          {userTier > 0 && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-600 text-sm">
                Loyalty Discount ({tierDiscounts[userTier]}%):
              </span>
              <span className="text-sm font-medium text-green-600">
                -{formatCurrency(calculateDynamicDiscount())}
              </span>
            </div>
          )}

          {rental.additionalCharges != null && rental.additionalCharges > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Additional Charges</span>
              <span className="text-sm font-medium text-amber-600">
                {formatCurrency(rental.additionalCharges)}
              </span>
            </div>
          )}

          {daysLate > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Late Fees</span>
              <span className="text-sm font-medium text-red-600">
                {formatCurrency(totalLateFee)}
              </span>
            </div>
          )}

          <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between items-center">
            <span className="text-gray-800 font-semibold text-sm">
              Final Price
            </span>
            <span className="font-bold text-lg text-[#8A7D55]">
              {isEditing
                ? formatCurrency(
                    calculateBasePrice() +
                      calculateServiceCostFromIds() -
                      calculateDynamicDiscount()
                  )
                : formatCurrency(rental.finalPrice || calculateTotalPrice())}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
