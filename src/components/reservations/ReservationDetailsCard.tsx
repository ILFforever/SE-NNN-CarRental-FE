import React, { useState, useEffect } from "react";
import { Edit, Loader2, Save, X, Plus, Minus } from "lucide-react";
import { API_BASE_URL } from "@/config/apiConfig";
import dayjs from "dayjs";
import SimpleTimePicker from "@/components/landing/timePicker";

interface DetailsCardProps {
  rental: any;
  userType: "user" | "admin" | "provider";
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
  userTier?: number;
  isEditing?: boolean;
  setIsEditing?: (editing: boolean) => void;
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
  isEditing: isEditingProp,
  setIsEditing: setIsEditingProp,
}: DetailsCardProps) {
  // State for edit mode
  const [isEditingInternal, setIsEditingInternal] = useState(false);
  const isEditing =
    isEditingProp !== undefined ? isEditingProp : isEditingInternal;
  const setIsEditing = setIsEditingProp || setIsEditingInternal;
  const [startDate, setStartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [userCredits, setUserCredits] = useState<number>(0);
  const [isLoadingCredits, setIsLoadingCredits] = useState<boolean>(false);
  const [creditError, setCreditError] = useState<string | null>(null);
  const [insufficientCredits, setInsufficientCredits] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [depositInfo, setDepositInfo] = useState<{
    oldDeposit: number;
    newDeposit: number;
    difference: number;
    action: "refund" | "charge" | null;
  }>({
    oldDeposit: 0,
    newDeposit: 0,
    difference: 0,
    action: null,
  });
  const [showDepositPreview, setShowDepositPreview] = useState(false);

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

  // Handle edit availability - Fixed permission logic
  const canEdit =
    (userType === "user" && rental.status === "pending") ||
    userType === "admin";

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

      // Initialize time fields
      // First check if the rental has dedicated time fields
      if (rental.pickupTime) {
        setPickupTime(rental.pickupTime);
      } else {
        // Fall back to extracting time from startDate
        setPickupTime(dayjs(rental.startDate).format("HH:mm"));
      }

      if (rental.returnTime) {
        setReturnTime(rental.returnTime);
      } else {
        // Fall back to extracting time from returnDate
        setReturnTime(dayjs(rental.returnDate).format("HH:mm"));
      }

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

  // This will calculate deposit changes when editing
  useEffect(() => {
    if (isEditing && rental) {
      // Only calculate deposit if the rental has a depositAmount
      if (rental.depositAmount && rental.depositAmount > 0) {
        // Calculate old deposit from rental
        const oldDeposit = rental.depositAmount;

        // Calculate new price based on changes
        const newBasePrice = calculateBasePrice();
        const newServicePrice = calculateServiceCostFromIds();
        const newDiscountAmount = calculateDynamicDiscount();

        // Calculate new total price
        const newTotalPrice =
          newBasePrice + newServicePrice - newDiscountAmount;

        // Calculate new deposit (10% of new total price)
        const newDeposit = Math.round(newTotalPrice * 0.1 * 100) / 100;

        // Calculate difference
        const difference = Math.round((newDeposit - oldDeposit) * 100) / 100;

        // Determine action based on difference
        const action =
          difference > 0 ? "charge" : difference < 0 ? "refund" : null;

        // Update state
        setDepositInfo({
          oldDeposit,
          newDeposit,
          difference: Math.abs(difference),
          action,
        });

        // Show deposit preview if there's a difference
        setShowDepositPreview(difference !== 0);
      } else {
        // Reset deposit info if no deposit on this rental
        setDepositInfo({
          oldDeposit: 0,
          newDeposit: 0,
          difference: 0,
          action: null,
        });
        setShowDepositPreview(false);
      }
    }
  }, [isEditing, startDate, returnDate, selectedServices, rental]);

  // Also update the discount calculation useEffect
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
  }, [
    isEditing,
    startDate,
    returnDate,
    pickupTime,
    returnTime,
    selectedServices,
    rental,
    userTier,
  ]);

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

  const fetchUserCredits = async () => {
    // Only fetch for users and admins
    if ((userType !== "user" && userType !== "admin") || !token) return;

    setIsLoadingCredits(true);
    setCreditError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/credits`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch credit data");
      }

      const data = await response.json();

      if (data.success) {
        setUserCredits(data.data.credits || 0);
      } else {
        throw new Error(data.message || "Unknown error fetching credit data");
      }
    } catch (err) {
      console.error("Error fetching user credits:", err);
      setCreditError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      setUserCredits(0);
    } finally {
      setIsLoadingCredits(false);
    }
  };

  useEffect(() => {
    fetchUserCredits();
  }, [token, userType]);

  useEffect(() => {
    if (isEditing && rental) {
      // Only calculate deposit if the rental has a depositAmount
      if (rental.depositAmount && rental.depositAmount > 0) {
        // Calculate old deposit from rental
        const oldDeposit = rental.depositAmount;

        // Calculate new price based on changes
        const newBasePrice = calculateBasePrice();
        const newServicePrice = calculateServiceCostFromIds();
        const newDiscountAmount = calculateDynamicDiscount();

        // Calculate new total price
        const newTotalPrice =
          newBasePrice + newServicePrice - newDiscountAmount;

        // Calculate new deposit (10% of new total price)
        const newDeposit = Math.round(newTotalPrice * 0.1 * 100) / 100;

        // Calculate difference
        const difference = Math.round((newDeposit - oldDeposit) * 100) / 100;

        // Determine action based on difference
        const action =
          difference > 0 ? "charge" : difference < 0 ? "refund" : null;

        // Check if user has enough credits for additional deposit
        if (
          action === "charge" &&
          userCredits < difference &&
          userType === "user"
        ) {
          setInsufficientCredits(true);
        } else {
          setInsufficientCredits(false);
        }

        // Update state
        setDepositInfo({
          oldDeposit,
          newDeposit,
          difference: Math.abs(difference),
          action,
        });

        // Show deposit preview if there's a difference
        setShowDepositPreview(difference !== 0);
      } else {
        // Reset deposit info if no deposit on this rental
        setDepositInfo({
          oldDeposit: 0,
          newDeposit: 0,
          difference: 0,
          action: null,
        });
        setShowDepositPreview(false);
        setInsufficientCredits(false);
      }
    }
  }, [
    isEditing,
    startDate,
    returnDate,
    selectedServices,
    rental,
    userCredits,
    userType,
  ]);

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

  // Convert 12-hour time format to 24-hour format
  const convert12To24Format = (timeStr: string): string => {
    // Check if the time is already in 24-hour format (no AM/PM)
    if (!timeStr.match(/AM|PM|am|pm/i)) {
      return timeStr;
    }

    const [timePart, period] = timeStr.split(/\s+/);
    let [hours, minutes] = timePart.split(":").map(Number);

    if (period.toLowerCase() === "pm" && hours < 12) {
      hours += 12;
    } else if (period.toLowerCase() === "am" && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

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

    // Check credits before saving for users
    if (insufficientCredits && userType === "user") {
      setError(
        `Insufficient credits for additional deposit. You need ${formatCurrency(
          depositInfo.difference
        )} but only have ${formatCurrency(userCredits)}.`
      );
      return;
    }

    // Convert time formats if they're in 12-hour format (from SimpleTimePicker)
    const formattedPickupTime = convert12To24Format(pickupTime);
    const formattedReturnTime = convert12To24Format(returnTime);

    // Validate time format for 24-hour time (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (
      !timeRegex.test(formattedPickupTime) ||
      !timeRegex.test(formattedReturnTime)
    ) {
      setError("Invalid time format. Please use HH:MM format (24-hour)");
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
      const discountPercentage = tierDiscounts[userTier] || 0;
      const dynamicDiscountAmount = calculateDynamicDiscount();

      const newFinalPrice =
        subtotal - dynamicDiscountAmount + (rental.additionalCharges || 0);

      // Convert time from UTC+7 to UTC+0
      const pickupDateTimeLocal = dayjs(`${startDate}T${formattedPickupTime}`);
      const returnDateTimeLocal = dayjs(`${returnDate}T${formattedReturnTime}`);

      // Subtract 7 hours to convert to UTC+0
      const pickupDateTimeUTC = pickupDateTimeLocal.subtract(7, "hour");
      const returnDateTimeUTC = returnDateTimeLocal.subtract(7, "hour");

      // Extract just the time in HH:mm format
      const pickupTimeUTC = pickupDateTimeUTC.format("HH:mm");
      const returnTimeUTC = returnDateTimeUTC.format("HH:mm");

      // Create update payload with time values
      const updateData = {
        startDate: newStartDate.toISOString(),
        returnDate: newReturnDate.toISOString(),
        pickupTime: pickupTimeUTC,
        returnTime: returnTimeUTC,
        service: selectedServices,
        price: newBasePrice,
        servicePrice: newServicePrice,
        discountAmount: dynamicDiscountAmount,
        finalPrice: newFinalPrice,
        payDeposit: rental.depositAmount > 0,
      };

      console.log("Sending update data:", JSON.stringify(updateData));

      // Make API call to update reservation
      const response = await fetch(`${API_BASE_URL}/rents/${rental._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const responseText = await response.text();
      console.log("Raw API response:", responseText);

      if (!response.ok) {
        throw new Error(`Failed to update reservation: ${responseText}`);
      }

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Error parsing response as JSON:", parseError);
        throw new Error(`Invalid JSON response from server: ${responseText}`);
      }

      // If update successful
      if (data.success) {
        // Process deposit information from response if available
        let depositMessage = "";
        if (data.depositUpdate) {
          const { depositDifference, newDepositAmount } = data.depositUpdate;
          if (depositDifference > 0) {
            depositMessage = ` Your account has been charged ${formatCurrency(
              depositDifference
            )} for the additional deposit.`;

            // Update credits if charged more
            if (userType === "user" || userType === "admin") {
              setUserCredits((prev) => Math.max(0, prev - depositDifference));
            }
          } else if (depositDifference < 0) {
            depositMessage = ` Your account has been credited ${formatCurrency(
              Math.abs(depositDifference)
            )} for the deposit difference.`;

            // Update credits if refunded
            if (userType === "user" || userType === "admin") {
              setUserCredits((prev) => prev + Math.abs(depositDifference));
            }
          }
        }

        // If data is returned in the data field, use it
        if (onUpdate && data.data) {
          onUpdate(data.data);
        }

        setSuccess(`Reservation updated successfully.${depositMessage}`);
        setIsEditing(false);
        setShowServiceSelector(false);
      } else {
        // If API sends success: false
        throw new Error(data.message || "Unknown error updating reservation");
      }
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

    // Reset time values
    if (rental.pickupTime) {
      setPickupTime(rental.pickupTime);
    } else {
      setPickupTime(dayjs(rental.startDate).format("HH:mm"));
    }

    if (rental.returnTime) {
      setReturnTime(rental.returnTime);
    } else {
      setReturnTime(dayjs(rental.returnDate).format("HH:mm"));
    }

    // Reset selected services to original
    if (rental.service && Array.isArray(rental.service)) {
      setSelectedServices([...rental.service]);
    } else {
      setSelectedServices([]);
    }

    // Reset deposit-related states
    setInsufficientCredits(false);
    setShowDepositPreview(false);

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

  // Helper function to convert 24h time to 12h format for TimePicker display
  const formatTimeFor12HourDisplay = (time24h: string): string => {
    // If the time is already in 12-hour format, return it
    if (time24h.match(/AM|PM|am|pm/i)) return time24h;

    try {
      // Parse hours and minutes
      const [hours, minutes] = time24h.split(":").map(Number);

      // Determine period
      const period = hours >= 12 ? "PM" : "AM";

      // Convert hours to 12-hour format
      const hours12 = hours % 12 || 12;

      // Format with leading zeros for minutes
      return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
    } catch (err) {
      console.error("Error formatting time:", err);
      return time24h; // Return original if parsing fails
    }
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
                className={`flex items-center justify-center px-2 py-1.5 ${
                  insufficientCredits
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#8A7D55] hover:bg-[#766b48]"
                } text-white rounded-md transition-colors text-sm`}
                aria-label="Save changes"
                disabled={isLoading || insufficientCredits}
              >
                {isLoading ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Save size={14} className="mr-1" />
                )}
                {isLoading
                  ? "Saving..."
                  : insufficientCredits
                  ? "Not Enough Credits"
                  : "Save"}
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

      <div className="space-y-5">
        {/* Basic Information */}
        <div className="space-y-3 pb-4 border-b border-gray-100">
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

          <div>
            <p className="text-gray-600 text-sm">Your Credits</p>
            <p className="font-medium">
              {isLoadingCredits ? "Loading..." : formatCurrency(userCredits)}
            </p>
          </div>
        </div>

        {/* Rental Dates and Times */}
        <div className="pb-4 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Rental Period
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {isEditing ? (
              // Editable date and time fields
              <>
                <div>
                  <p className="text-gray-600 text-sm mb-1.5">Start Date</p>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                    min={dayjs().format("YYYY-MM-DD")} // Can't select dates in the past
                  />
                  <div className="mt-3">
                    {/* Replace standard time input with SimpleTimePicker */}
                    <SimpleTimePicker
                      value={formatTimeFor12HourDisplay(pickupTime)}
                      onChange={setPickupTime}
                      use12Hours={true}
                      fieldLabel="Pickup Time"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-gray-600 text-sm mb-1.5">Return Date</p>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                    min={startDate} // Return date must be after start date
                  />
                  <div className="mt-3">
                    {/* Replace standard time input with SimpleTimePicker */}
                    <SimpleTimePicker
                      value={formatTimeFor12HourDisplay(returnTime)}
                      onChange={setReturnTime}
                      use12Hours={true}
                      fieldLabel="Return Time"
                    />
                  </div>
                </div>
              </>
            ) : (
              // Read-only date and time fields
              <>
                <div>
                  <div className="mb-3">
                    <p className="text-gray-600 text-sm">Start Date</p>
                    <p className="font-medium">
                      {formatDate(rental.startDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Pickup Time</p>
                    <p className="font-medium">
                      {rental.pickupTime || formatTime(rental.startDate)}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="mb-3">
                    <p className="text-gray-600 text-sm">Return Date</p>
                    <p className="font-medium">
                      {formatDate(rental.returnDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Return Time</p>
                    <p className="font-medium">
                      {rental.returnTime || formatTime(rental.returnDate)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-4">
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
                  ? `${
                      dayjs(returnDate).diff(dayjs(startDate), "day") + 1
                    } days`
                  : `${calculateRentalPeriod(
                      rental.startDate,
                      rental.returnDate
                    )} days`}
              </p>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="pb-4 border-b border-gray-100">
          <div className="flex justify-between items-center mb-3">
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
              {/* ส่วนนี้ไม่มีการเปลี่ยนแปลง คงเดิม */}
              {/* ... เนื้อหาในส่วนของ Service selector ... */}
            </div>
          )}
        </div>

        {/* Deposit Change Preview - แก้ไขส่วนนี้ */}
        {isEditing && (
          <div
            className={`mb-4 p-3 rounded-md border-l-4 
              ${
                insufficientCredits
                  ? "bg-red-50 border-red-400 text-red-800"
                  : depositInfo.action === "charge"
                  ? "bg-amber-50 border-amber-400 text-amber-800"
                  : "bg-green-50 border-green-400 text-green-800"
              }`}
          >
            <div className="flex items-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    insufficientCredits
                      ? "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      : depositInfo.action === "charge"
                      ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  }
                />
              </svg>
              <h4 className="font-semibold">
                {insufficientCredits
                  ? "Insufficient Credits"
                  : `Deposit ${
                      depositInfo.action === "charge" ? "Change" : "Refund"
                    } Preview`}
              </h4>
            </div>

            <div className="ml-7 space-y-1 text-sm">
              {insufficientCredits && (
                <>
                  <div className="flex justify-between">
                    <span>Your Current Credits:</span>
                    <span className="font-medium">
                      {formatCurrency(userCredits)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Required Additional Deposit:</span>
                    <span className="font-medium">
                      {formatCurrency(depositInfo.difference)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                    <span className="font-medium">Shortage:</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(depositInfo.difference - userCredits)}
                    </span>
                  </div>
                </>
              )} : {(
                <>
                  <div className="flex justify-between">
                    <span>Original Deposit:</span>
                    <span className="font-medium">
                      {formatCurrency(depositInfo.oldDeposit)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>New Deposit Amount:</span>
                    <span className="font-medium">
                      {formatCurrency(depositInfo.newDeposit)}
                    </span>
                  </div>

                  {
                    depositInfo.action === "charge" && (
                      <div className="flex justify-between">
                        <span>Your Available Credits:</span>
                        <span className="font-medium">
                          {formatCurrency(userCredits)}
                        </span>
                      </div>
                    )}

                  <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                    <span className="font-medium">
                      {depositInfo.action === "charge"
                        ? "Additional payment:"
                        : "Credit refund:"}
                    </span>
                    <span
                      className={`font-bold ${
                        depositInfo.action === "charge"
                          ? "text-amber-700"
                          : "text-green-700"
                      }`}
                    >
                      {depositInfo.action === "charge" ? "+" : "-"}
                      {formatCurrency(depositInfo.difference)}
                    </span>
                  </div>
                </>
              )}
            </div>

            <p className="mt-2 ml-7 text-xs">
              {insufficientCredits ? (
                <span className="text-red-700 font-semibold">
                  You need to add more credits to your account before saving
                  these changes.
                </span>
              ) : depositInfo.action === "charge" ? (
                "Your account will be charged for the additional deposit amount upon saving these changes."
              ) : (
                "Your account will be credited with the refund amount upon saving these changes."
              )}
            </p>
          </div>
        )}

        {/* Price Section */}
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

          {rental.depositAmount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm font-medium">
                Deposit (10%)
              </span>
              <span className="text-sm font-medium">
                {isEditing
                  ? formatCurrency(depositInfo.newDeposit)
                  : formatCurrency(rental.depositAmount)}
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
