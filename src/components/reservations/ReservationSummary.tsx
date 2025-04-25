"use client";

import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  ChevronDown,
  Car,
  Calendar,
  Tag,
  Info,
  Check,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Clock,
  Wallet,
  CreditCard,
} from "lucide-react";
import {
  getTierName,
  formatCurrency,
  getTierDiscount,
  getRentalPeriod,
  calculateServicesTotalCost,
} from "@/libs/bookingUtils";
import ErrorMessage from "./ErrorToAddRentMessage";
import { useSession } from "next-auth/react";
import { API_BASE_URL } from "@/config/apiConfig";

interface ReservationSummaryProps {
  car: Car;
  pickupDate: dayjs.Dayjs | null;
  returnDate: dayjs.Dayjs | null;
  pickupTime: string;
  returnTime: string;
  userTier: number;
  selectedServices: string[];
  services: Service[];
  formValid: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  userId?: string;
}

interface CreditData {
  credits: number;
  transactions: any[];
  isLoading: boolean;
  error: string | null;
}

const ReservationSummary: React.FC<ReservationSummaryProps> = ({
  car,
  pickupDate,
  returnDate,
  pickupTime,
  returnTime,
  userTier,
  selectedServices,
  services,
  formValid,
  isSubmitting,
  onSubmit,
  userId,
}) => {
  // Toggle state for expandable sections
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [servicesExpanded, setServicesExpanded] = useState(false);
  const [depositExpanded, setDepositExpanded] = useState(true);

  // Status states
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Credit data state
  const [creditData, setCreditData] = useState<CreditData>({
    credits: 0,
    transactions: [],
    isLoading: false,
    error: null,
  });

  // Get session for authentication
  const { data: session } = useSession();

  // Calculate rental period and costs
  const rentalDays = getRentalPeriod(pickupDate, returnDate);
  const carCost = rentalDays * (car?.dailyRate || 0);
  const servicesCost = calculateServicesTotalCost(
    selectedServices,
    services,
    pickupDate,
    returnDate
  );

  // Calculate totals
  const subtotal = carCost + servicesCost;
  const discountPercentage = getTierDiscount(userTier);
  const discountAmount = subtotal * (discountPercentage / 100);
  const finalPrice = subtotal - discountAmount;
  const depositAmount = Math.round(finalPrice * 0.1 * 100) / 100;

  // Round all values to 2 decimal places
  const roundedCarCost = Math.round(carCost * 100) / 100;
  const roundedServicesCost = Math.round(servicesCost * 100) / 100;
  const roundedDiscountAmount = Math.round(discountAmount * 100) / 100;
  const roundedFinalPrice = Math.round(finalPrice * 100) / 100;

  // Get selected services
  const selectedServiceItems = services.filter((service) =>
    selectedServices.includes(service._id)
  );

  // Function to fetch credit data
  const fetchCreditData = async () => {
    setCreditData((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      if (!session?.user?.token) {
        throw new Error("No authentication token available");
      }

      const response = await fetch(`${API_BASE_URL}/credits`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch credit data");
      }

      const data = await response.json();

      if (data.success) {
        setCreditData({
          credits: data.data.credits || 0,
          transactions: data.data.transactions || [],
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(data.message || "Unknown error fetching credit data");
      }
    } catch (err) {
      setCreditData((prev) => ({
        ...prev,
        isLoading: false,
        error:
          err instanceof Error ? err.message : "An unexpected error occurred",
      }));
      console.error("Error fetching credit data:", err);
    }
  };

  // Fetch credit data when session is available
  useEffect(() => {
    if (session?.user?.token) {
      fetchCreditData();
    }
  }, [session]);

  // Handle reservation submission with deposit
  const handleSubmitWithDeposit = async () => {
    // Clear previous messages
    setError(null);
    setSuccessMessage(null);
    setIsProcessing(true);

    // Check if user has enough credits for the deposit
    if (creditData.credits < depositAmount) {
      setError(
        `Insufficient credits. You need ${formatCurrency(
          depositAmount
        )} to pay the deposit for this reservation. Your current balance: ${formatCurrency(
          creditData.credits
        )}`
      );
      setIsProcessing(false);
      return;
    }

    try {
      // Prepare rental data
      const rentalData = {
        car: car._id,
        startDate: pickupDate?.toISOString(),
        returnDate: returnDate?.toISOString(),
        pickupTime: pickupTime,
        returnTime: returnTime,
        price: roundedCarCost,
        service: selectedServices,
        servicePrice: roundedServicesCost,
        discountAmount: roundedDiscountAmount,
        finalPrice: roundedFinalPrice,
        user: userId,
      };

      // Call the API to create a reservation with deposit
      if (!session?.user?.token) {
        throw new Error("No authentication token available");
      }

      const response = await fetch(`${API_BASE_URL}/rents/with-deposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.token}`,
        },
        body: JSON.stringify(rentalData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create reservation");
      }

      // Success! Show success message
      setSuccessMessage(
        `Reservation created successfully! Deposit of ${formatCurrency(
          depositAmount
        )} has been paid.`
      );

      // Refresh credit data after successful payment
      fetchCreditData();

      // Call the original onSubmit to handle any additional logic
      onSubmit();
    } catch (err) {
      // Handle any errors
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8 border border-gray-200">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#8A7D55] to-[#9D8E62] text-white px-6 py-5 flex justify-between items-center">
        <div className="flex flex-col">
          <h2 className="text-xl font-serif font-medium">
            Reservation Summary
          </h2>
          <p className="text-xs text-gray-100 mt-1">
            {rentalDays} {rentalDays === 1 ? "day" : "days"} • {car.brand}{" "}
            {car.model}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-lg font-medium">
            {formatCurrency(roundedFinalPrice)}
          </span>
          <span className="text-xs text-gray-100">Total price</span>
        </div>
      </div>
      {/* Notification Area */}
      {(error || creditData.error || successMessage) && (
        <div className="px-6 pt-4">
          {error && (
            <ErrorMessage
              message={error}
              variant="error"
              onClose={() => setError(null)}
            />
          )}

          {creditData.error && (
            <ErrorMessage
              message={`Unable to fetch credit balance: ${creditData.error}`}
              variant="warning"
              onClose={() =>
                setCreditData((prev) => ({ ...prev, error: null }))
              }
            />
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4 animate-fadeIn">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {successMessage}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-5">
        {/* Key Information Cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Card 1: Pickup */}
          <div className="flex flex-col bg-gray-50 p-3 rounded-md border border-gray-200">
            <div className="flex items-center mb-1">
              <Calendar size={16} className="text-[#8A7D55] mr-2" />
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Pickup
              </span>
            </div>
            <p className="font-medium text-gray-800 ml-6">
              {pickupDate?.format("MMM D, YYYY")}
            </p>
            <p className="text-sm text-gray-600 ml-6">{pickupTime}</p>
          </div>

          {/* Card 2: Return */}
          <div className="flex flex-col bg-gray-50 p-3 rounded-md border border-gray-200">
            <div className="flex items-center mb-1">
              <Calendar size={16} className="text-[#8A7D55] mr-2" />
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Return
              </span>
            </div>
            <p className="font-medium text-gray-800 ml-6">
              {returnDate?.format("MMM D, YYYY")}
            </p>
            <p className="text-sm text-gray-600 ml-6">{returnTime}</p>
          </div>

          {/* Card 3: Vehicle */}
          <div className="flex flex-col bg-gray-50 p-3 rounded-md border border-gray-200">
            <div className="flex items-center mb-1">
              <Car size={16} className="text-[#8A7D55] mr-2" />
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Vehicle
              </span>
            </div>
            <p className="font-medium text-gray-800 ml-6">
              {car.brand} {car.model}
            </p>
            <p className="text-sm text-gray-600 ml-6">
              {getTierName(car.tier)}
            </p>
          </div>

          {/* Card 4: Services */}
          <div className="flex flex-col bg-gray-50 p-3 rounded-md border border-gray-200">
            <div className="flex items-center mb-1">
              <Tag size={16} className="text-[#8A7D55] mr-2" />
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Services
              </span>
            </div>
            <p className="font-medium text-gray-800 ml-6">
              {selectedServices.length > 0
                ? `${selectedServices.length} Selected`
                : "No additional services"}
            </p>
            {selectedServices.length > 0 && (
              <p className="text-sm text-gray-600 ml-6">
                {formatCurrency(roundedServicesCost)}
              </p>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="mb-6 space-y-2">
          <button
            onClick={() => setDetailsExpanded(!detailsExpanded)}
            className="w-full flex justify-between items-center py-3 text-gray-800 bg-gray-50 px-4 rounded-md border border-gray-200"
            aria-expanded={detailsExpanded}
            aria-controls="rental-details-panel"
          >
            <div className="flex items-center space-x-2">
              <Info size={18} className="text-[#8A7D55]" />
              <span className="font-medium">Vehicle Details</span>
            </div>
            <ChevronDown
              size={18}
              className={`transition-transform duration-300 ${
                detailsExpanded ? "transform rotate-180" : ""
              }`}
            />
          </button>

          <div
            id="rental-details-panel"
            className={`overflow-hidden transition-all duration-300 ${
              detailsExpanded
                ? "max-h-[500px] opacity-100 mt-2"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-4 bg-white rounded-md border border-gray-200">
              {/* Vehicle Details */}
              <div>
                <h3 className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">
                  Vehicle Specifications
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-gray-600">Brand:</div>
                  <div className="text-right font-medium text-gray-800">
                    {car.brand}
                  </div>

                  <div className="text-gray-600">Model:</div>
                  <div className="text-right font-medium text-gray-800">
                    {car.model}
                  </div>

                  <div className="text-gray-600">License Plate:</div>
                  <div className="text-right font-medium text-gray-800">
                    {car.license_plate || "N/A"}
                  </div>

                  <div className="text-gray-600">Daily Rate:</div>
                  <div className="text-right font-medium text-gray-800">
                    ${car.dailyRate?.toFixed(2) || "0.00"}
                  </div>

                  {car.tier !== undefined && (
                    <>
                      <div className="text-gray-600">Vehicle Tier:</div>
                      <div className="text-right font-medium text-gray-800">
                        {getTierName(car.tier)}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Services */}
          {selectedServices.length > 0 && services.length > 0 && (
            <div className="mb-6">
              <button
                onClick={() => setServicesExpanded(!servicesExpanded)}
                className="w-full flex justify-between items-center py-3 text-gray-800 bg-gray-50 px-4 rounded-md border border-gray-200"
                aria-expanded={servicesExpanded}
                aria-controls="services-panel"
              >
                <div className="flex items-center space-x-2">
                  <Tag size={18} className="text-[#8A7D55]" />
                  <span className="font-medium">Additional Services</span>
                  <span className="bg-[#F0F4FF] text-[#3366FF] text-xs px-2.5 py-1 rounded-full font-medium">
                    {selectedServices.length}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="mr-3 text-[#8A7D55] font-medium">
                    ${servicesCost.toFixed(2)}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${
                      servicesExpanded ? "transform rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              <div
                id="services-panel"
                className={`overflow-hidden transition-all duration-300 ${
                  servicesExpanded
                    ? "max-h-[500px] opacity-100 mt-2"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-4 bg-white rounded-md border border-gray-200">
                  {selectedServiceItems.map((service) => {
                    const cost = service.daily
                      ? service.rate * rentalDays
                      : service.rate;

                    return (
                      <div
                        key={service._id}
                        className="flex justify-between items-start py-3 px-2 border-b border-gray-200 last:border-0"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Check size={16} className="text-green-500" />
                            <span className="font-medium text-gray-800">
                              {service.name}
                            </span>
                          </div>

                          {service.description && (
                            <p className="text-xs text-gray-600 mt-1 pl-5">
                              {service.description.length > 80
                                ? `${service.description.substring(0, 80)}...`
                                : service.description}
                            </p>
                          )}
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="text-[#8A7D55] font-medium">
                            ${cost.toFixed(2)}
                          </span>
                          <div className="text-xs text-gray-600">
                            {service.daily
                              ? `$${service.rate.toFixed(
                                  2
                                )}/day × ${rentalDays}`
                              : "One-time fee"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Price Breakdown Card */}
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden mb-5">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center">
            <Wallet size={16} className="text-[#8A7D55] mr-2" />
            <span className="text-xs text-gray-700 uppercase tracking-wider font-medium">
              Price Breakdown
            </span>
          </div>

          <div className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">Car Rental:</span>
                <div className="flex flex-col items-end">
                  <span className="font-medium text-gray-800">
                    ${roundedCarCost.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500">
                    ${car.dailyRate?.toFixed(2)}/day × {rentalDays}
                  </span>
                </div>
              </div>

              {selectedServices.length > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">Additional Services:</span>
                  <span className="font-medium text-gray-800">
                    ${roundedServicesCost.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-dashed border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-medium text-gray-800">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {userTier > 0 && (
                <div className="flex justify-between items-center text-sm text-green-700">
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Loyalty Discount ({getTierDiscount(userTier)}%):
                  </span>
                  <span className="font-medium">
                    -${roundedDiscountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200 text-base font-medium">
                <span className="text-gray-800">Total:</span>
                <span className="text-[#8A7D55] font-semibold">
                  {formatCurrency(roundedFinalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Deposit Section */}
        <div className="mb-5">
          <div className="border border-blue-200 rounded-md overflow-hidden">
            <button
              onClick={() => setDepositExpanded(!depositExpanded)}
              className="w-full flex justify-between items-center py-3 px-4 bg-blue-50 text-blue-800"
              aria-expanded={depositExpanded}
              aria-controls="deposit-panel"
            >
              <div className="flex items-center space-x-2">
                <CreditCard size={18} className="text-blue-600" />
                <span className="font-medium">10% Deposit Payment</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2 font-medium">
                  {formatCurrency(depositAmount)}
                </span>
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-300 ${
                    depositExpanded ? "transform rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            <div
              id="deposit-panel"
              className={`overflow-hidden transition-all duration-300 ${
                depositExpanded
                  ? "max-h-[500px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="p-4 bg-white">
                <div className="flex items-start mb-3 bg-blue-50 p-3 rounded-md border border-blue-100">
                  <div className="mr-3 mt-0.5">
                    <Info size={16} className="text-blue-500" />
                  </div>
                  <p className="text-sm text-blue-800">
                    A 10% deposit ({formatCurrency(depositAmount)}) will be
                    charged immediately from your account credits to secure this
                    reservation.
                  </p>
                </div>

                <div className="flex justify-between items-center mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex items-center">
                    <Wallet size={16} className="text-gray-700 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Your current balance:
                    </span>
                    {creditData.isLoading && (
                      <RefreshCw
                        size={14}
                        className="ml-2 animate-spin text-blue-500"
                      />
                    )}
                  </div>
                  <span
                    className={`font-bold ${
                      creditData.credits < depositAmount
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {formatCurrency(creditData.credits)}
                  </span>
                </div>

                {!creditData.isLoading && (
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={fetchCreditData}
                      className="text-xs flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <RefreshCw size={12} className="mr-1" />
                      Refresh balance
                    </button>
                  </div>
                )}

                {creditData.credits < depositAmount && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-md text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-2 flex-shrink-0" />
                    <span>
                      You need an additional{" "}
                      {formatCurrency(depositAmount - creditData.credits)}{" "}
                      credits to make this reservation.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom CTA Section */}
      <div className="px-6 py-5 bg-gray-50 border-t border-gray-200">
        <button
          onClick={handleSubmitWithDeposit}
          disabled={
            !formValid ||
            isProcessing ||
            creditData.isLoading ||
            creditData.credits < depositAmount
          }
          className={`w-full py-3.5 text-white rounded-md font-medium transition-all duration-300 flex justify-center items-center ${
            formValid &&
            !isProcessing &&
            !creditData.isLoading &&
            creditData.credits >= depositAmount
              ? "bg-gradient-to-r from-[#8A7D55] to-[#9D8E62] hover:from-[#7D7049] hover:to-[#8A7D55]"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
              Processing...
            </>
          ) : creditData.isLoading ? (
            <>
              <RefreshCw size={20} className="animate-spin mr-2" />
              Loading credit data...
            </>
          ) : (
            `Confirm & Pay ${formatCurrency(depositAmount)} Deposit`
          )}
        </button>

        <div className="mt-3 text-xs text-gray-600 text-center">
          <p>
            * All prices include standard insurance. A 10% deposit will be
            charged immediately from your credits.
          </p>
          {creditData.credits < depositAmount && !creditData.isLoading && (
            <p className="mt-1 text-red-600 font-medium">
              You need additional{" "}
              {formatCurrency(depositAmount - creditData.credits)} credits to
              make this reservation.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationSummary;
