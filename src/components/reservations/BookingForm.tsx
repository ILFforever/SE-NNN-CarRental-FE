"use client";

import React, { useEffect, useState, useRef } from "react";
import dayjs, { Dayjs } from "dayjs";
import ProviderDetail from "@/components/provider/providerDetail";
import {
timeOptions,
createDateTimeObject,
isBookingAtLeastTwoHours,
calculateRentalDays,
getRentalPeriod,
validateBookingDuration,
formatDuration,
findNextTimeWithTwoHourGap,
checkAvailability
} from "@/libs/bookingUtils";
import SimpleTimePicker from "@/components/landing/timePicker";
import { getDefaultTime } from "@/libs/timePickerUtils";

interface BookingFormProps {
nameLastname: string;
setNameLastname: (name: string) => void;
tel: string;
setTel: (tel: string) => void;
pickupDate: Dayjs | null;
setPickupDate: (date: Dayjs | null) => void;
returnDate: Dayjs | null;
setReturnDate: (date: Dayjs | null) => void;
pickupTime: string;
setPickupTime: (time: string) => void;
returnTime: string;
setReturnTime: (time: string) => void;
isAvailable: boolean;
setIsAvailable?: (isAvailable: boolean) => void;
isCheckingAvailability?: boolean;
setIsCheckingAvailability?: (isChecking: boolean) => void;
availabilityMessage?: string;
setAvailabilityMessage?: (message: string) => void;
providerId?: string;
token?: string;
pickupDateTime: Dayjs | null;
setPickupDateTime: (dateTime: Dayjs | null) => void;
returnDateTime: Dayjs | null;
setReturnDateTime: (dateTime: Dayjs | null) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
nameLastname,
setNameLastname,
tel,
setTel,
pickupDate,
setPickupDate,
returnDate,
setReturnDate,
pickupTime,
setPickupTime,
returnTime,
setReturnTime,
isAvailable = false,
setIsAvailable = () => {},
isCheckingAvailability = false,
setIsCheckingAvailability = () => {},
availabilityMessage = "",
setAvailabilityMessage = () => {},
providerId,
token,
pickupDateTime,
setPickupDateTime,
returnDateTime,
setReturnDateTime,
}) => {
// Current date
const today = dayjs();

// Time error state for minimum booking time
const [timeError, setTimeError] = useState<string | null>(null);

// Use ref to check if this is the first render and if times were initialized
const isInitialRender = useRef(true);
const timesInitialized = useRef(false);

// Internal state for availability checks if props aren't provided
const [internalIsAvailable, setInternalIsAvailable] = useState(false);
const [internalIsCheckingAvailability, setInternalIsCheckingAvailability] = useState(false);
const [internalAvailabilityMessage, setInternalAvailabilityMessage] = useState("");

// Use either the prop state setter or the internal state setter
const updateIsAvailable = (value: boolean) => {
  if (typeof setIsAvailable === 'function') {
    setIsAvailable(value);
  } else {
    setInternalIsAvailable(value);
  }
};

const updateIsCheckingAvailability = (value: boolean) => {
  if (typeof setIsCheckingAvailability === 'function') {
    setIsCheckingAvailability(value);
  } else {
    setInternalIsCheckingAvailability(value);
  }
};

const updateAvailabilityMessage = (value: string) => {
  if (typeof setAvailabilityMessage === 'function') {
    setAvailabilityMessage(value);
  } else {
    setInternalAvailabilityMessage(value);
  }
};

// Get the appropriate state values
const displayIsAvailable = typeof setIsAvailable === 'function' ? isAvailable : internalIsAvailable;
const displayIsCheckingAvailability = typeof setIsCheckingAvailability === 'function' ? isCheckingAvailability : internalIsCheckingAvailability;
const displayAvailabilityMessage = typeof setAvailabilityMessage === 'function' ? availabilityMessage : internalAvailabilityMessage;

// Check availability whenever pickup or return dates/times change
const checkTimeSlotAvailability = async () => {
  if (pickupDateTime && returnDateTime && providerId) {
    // First check if the booking duration is valid
    const validation = validateBookingDuration(pickupDateTime, returnDateTime);
    
    if (!validation.isValid) {
      setTimeError(validation.message);
      updateIsAvailable(false);
      updateAvailabilityMessage("");
      return;
    }
    
    setTimeError(null);
    updateIsCheckingAvailability(true);
    
    try {
      // Call API to check availability
      const result = await checkAvailability(
        pickupDateTime,
        returnDateTime,
        providerId
      );
      
      updateIsAvailable(result.isAvailable);
      updateAvailabilityMessage(result.message);
    } catch (error) {
      console.error("Error checking availability:", error);
      updateIsAvailable(false);
      updateAvailabilityMessage("Error checking availability. Please try again.");
    } finally {
      updateIsCheckingAvailability(false);
    }
  }
};

// Modified visibility change handler to correctly preserve time values
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      // When tab becomes visible again, we need to ensure we're using
      // the latest values from sessionStorage (if they exist)
      const storedPickupTime = sessionStorage.getItem("pickupTime");
      const storedReturnTime = sessionStorage.getItem("returnTime");
      
      if (storedPickupTime && storedPickupTime !== pickupTime) {
        setPickupTime(storedPickupTime);
      }
      
      if (storedReturnTime && storedReturnTime !== returnTime) {
        setReturnTime(storedReturnTime);
      }
      
      console.log("Tab became visible, restored time values from session storage");
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}, [pickupTime, returnTime, setPickupTime, setReturnTime]);

// Modified initialization effect - ONLY runs once and respects existing values
useEffect(() => {
  if (isInitialRender.current && !timesInitialized.current) {
    const storedPickupTime = sessionStorage.getItem("pickupTime");
    const storedReturnTime = sessionStorage.getItem("returnTime");
    
    // Only set default time if no time exists in both props and sessionStorage
    if (!pickupTime && !storedPickupTime) {
      const defaultTime = getDefaultTime();
      setPickupTime(defaultTime);
      sessionStorage.setItem("pickupTime", defaultTime);
    } else if (storedPickupTime && !pickupTime) {
      // If there's a value in sessionStorage but not in props, use sessionStorage
      setPickupTime(storedPickupTime);
    } else if (pickupTime) {
      // If there's a value in props, save it to sessionStorage
      sessionStorage.setItem("pickupTime", pickupTime);
    }
    
    if (!returnTime && !storedReturnTime) {
      const defaultTime = getDefaultTime();
      setReturnTime(defaultTime);
      sessionStorage.setItem("returnTime", defaultTime);
    } else if (storedReturnTime && !returnTime) {
      // If there's a value in sessionStorage but not in props, use sessionStorage
      setReturnTime(storedReturnTime);
    } else if (returnTime) {
      // If there's a value in props, save it to sessionStorage
      sessionStorage.setItem("returnTime", returnTime);
    }
    
    isInitialRender.current = false;
    timesInitialized.current = true;
    console.log("Times initialized:", { pickupTime: pickupTime || storedPickupTime, returnTime: returnTime || storedReturnTime });
  }
}, [pickupTime, returnTime, setPickupTime, setReturnTime]);

// Save times to sessionStorage when they change (but only after initialized)
useEffect(() => {
  if (timesInitialized.current) {
    if (pickupTime) {
      sessionStorage.setItem("pickupTime", pickupTime);
      console.log("Saved pickup time to sessionStorage:", pickupTime);
    }
  }
}, [pickupTime]);

useEffect(() => {
  if (timesInitialized.current) {
    if (returnTime) {
      sessionStorage.setItem("returnTime", returnTime);
      console.log("Saved return time to sessionStorage:", returnTime);
    }
  }
}, [returnTime]);

// Update datetime objects when date or time changes
useEffect(() => {
  if (pickupDate && pickupTime) {
    const dateTimeObj = createDateTimeObject(pickupDate, pickupTime);
    setPickupDateTime(dateTimeObj);
  }
}, [pickupDate, pickupTime, setPickupDateTime]);

useEffect(() => {
  if (returnDate && returnTime) {
    const dateTimeObj = createDateTimeObject(returnDate, returnTime);
    setReturnDateTime(dateTimeObj);
  }
}, [returnDate, returnTime, setReturnDateTime]);

// Check minimum 2-hour requirement and update error message
useEffect(() => {
  if (pickupDateTime && returnDateTime) {
    // Check if it's a same-day booking
    const isSameDay = pickupDate?.isSame(returnDate, "day");

    if (isSameDay) {
      // Calculate difference in minutes
      const diffMinutes = returnDateTime.diff(pickupDateTime, "minute");
      
      // Check if it's at least 2 hours (120 minutes)
      if (diffMinutes < 120) {
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        const missingMinutes = 120 - diffMinutes;
        
        setTimeError(
          `Same-day bookings require at least 2 hours rental period. Current duration: ${hours} hour${hours !== 1 ? 's' : ''} and ${mins} minute${mins !== 1 ? 's' : ''}. (${missingMinutes} minutes short)`
        );
      } else {
        setTimeError(null);
      }
    } else {
      // Not same day - no minimum time requirement
      setTimeError(null);
    }
    
    // Check availability with backend only if providerId is available
    if (providerId) {
      checkTimeSlotAvailability();
    }
  }
}, [pickupDateTime, returnDateTime]);

// Update return time when pickup date/time changes - only if needed for minimum duration
useEffect(() => {
  if (pickupDate && returnDate && pickupTime && timesInitialized.current) {
    // Find next return time that provides at least 2 hours
    const nextReturnTime = findNextTimeWithTwoHourGap(
      pickupTime,
      pickupDate,
      returnDate
    );
    
    if (nextReturnTime) {
      const pickupDT = createDateTimeObject(pickupDate, pickupTime);
      const returnDT = createDateTimeObject(returnDate, returnTime);

      if (pickupDT && returnDT) {
        const validation = validateBookingDuration(pickupDT, returnDT);

        // If current duration is less than 2 hours, update return time
        if (!validation.isValid) {
          setReturnTime(nextReturnTime);
          sessionStorage.setItem("returnTime", nextReturnTime);
        }
      } else {
        // If return time is not set correctly
        setReturnTime(nextReturnTime);
        sessionStorage.setItem("returnTime", nextReturnTime);
      }
    }
  }
}, [pickupDate, returnDate, pickupTime]);

// Pickup date change handler
const handlePickupDateChange = (newDate: Dayjs | null) => {
  if (!newDate) {
    setPickupDate(null);
    return;
  }

  setPickupDate(newDate);

  // Make sure return date is not before pickup date
  if (returnDate && newDate.isAfter(returnDate, "day")) {
    setReturnDate(newDate);
  } else if (!returnDate) {
    // If return date not set, use pickup date
    setReturnDate(newDate);
  }

  // Adjust return time for minimum 2-hour requirement
  if (pickupTime && returnTime) {
    const returnDt = returnDate || newDate;
    const nextReturnTime = findNextTimeWithTwoHourGap(
      pickupTime,
      newDate,
      returnDt
    );

    if (nextReturnTime) {
      const pickupDT = createDateTimeObject(newDate, pickupTime);
      const returnDT = createDateTimeObject(returnDt, returnTime);

      if (pickupDT && returnDT) {
        const validation = validateBookingDuration(pickupDT, returnDT);

        if (!validation.isValid) {
          setReturnTime(nextReturnTime);
          sessionStorage.setItem("returnTime", nextReturnTime);
        }
      }
    }
  }
};

// Pickup time change handler
const handlePickupTimeChange = (newTime: string) => {
  setPickupTime(newTime);
  sessionStorage.setItem("pickupTime", newTime);
};

// Return date change handler
const handleReturnDateChange = (newDate: Dayjs | null) => {
  if (!newDate) {
    setReturnDate(null);
    return;
  }

  // If return date is before pickup date, use pickup date
  if (pickupDate && newDate.isBefore(pickupDate, "day")) {
    setReturnDate(pickupDate);

    // Check if return time meets requirements
    if (pickupTime) {
      const nextReturnTime = findNextTimeWithTwoHourGap(
        pickupTime,
        pickupDate,
        pickupDate
      );
      if (nextReturnTime) {
        setReturnTime(nextReturnTime);
        sessionStorage.setItem("returnTime", nextReturnTime);
      }
    }
  } else {
    setReturnDate(newDate);

    // If it's the same day as pickup, check time requirements
    if (pickupDate && pickupDate.isSame(newDate, "day") && pickupTime) {
      const nextReturnTime = findNextTimeWithTwoHourGap(
        pickupTime,
        pickupDate,
        newDate
      );
      if (nextReturnTime) {
        const pickupDT = createDateTimeObject(pickupDate, pickupTime);
        const returnDT = createDateTimeObject(newDate, returnTime);

        if (pickupDT && returnDT) {
          const validation = validateBookingDuration(pickupDT, returnDT);

          if (!validation.isValid) {
            setReturnTime(nextReturnTime);
            sessionStorage.setItem("returnTime", nextReturnTime);
          }
        }
      }
    }
  }
};

// Return time change handler
const handleReturnTimeChange = (newTime: string) => {
  setReturnTime(newTime);
  sessionStorage.setItem("returnTime", newTime);
};

// Calculate duration between pickup and return times
const calculateDuration = () => {
  if (pickupDateTime && returnDateTime) {
    const diffMinutes = returnDateTime.diff(pickupDateTime, "minute");
    return formatDuration(diffMinutes);
  }
  return "";
};

return (
  <div className="flex flex-col h-full">
    <h2 className="text-2xl font-serif font-medium mb-6 text-[#6B5B35]">
      Booking Information
    </h2>
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <div className="p-6 space-y-5">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1.5">
            Full Name
          </p>
          <input
            type="text"
            value={nameLastname}
            onChange={(e) => setNameLastname(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:border-transparent transition-colors duration-200 mt-1"
            required
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1.5">
            Contact Number
          </p>
          <input
            type="tel"
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:border-transparent transition-colors duration-200 mt-1"
            required
            placeholder="Enter your phone number"
          />
        </div>

        {/* Date/time fields with improved styling */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">
              Pickup Date
            </p>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <input
                type="date"
                value={pickupDate ? pickupDate.format("YYYY-MM-DD") : ""}
                onChange={(e) => {
                  const newDate = e.target.value
                    ? dayjs(e.target.value)
                    : null;
                  handlePickupDateChange(newDate);
                }}
                min={today.format("YYYY-MM-DD")}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:border-transparent transition-colors duration-200 text-sm"
              />
            </div>
          </div>
          <div className="time-field-container">
            <SimpleTimePicker
              value={pickupTime}
              onChange={handlePickupTimeChange}
              use12Hours={true}
              className="mt-0"
              fieldLabel="Pickup Time"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">
              Return Date
            </p>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <input
                type="date"
                value={returnDate ? returnDate.format("YYYY-MM-DD") : ""}
                onChange={(e) => {
                  const newDate = e.target.value
                    ? dayjs(e.target.value)
                    : null;
                  handleReturnDateChange(newDate);
                }}
                min={
                  pickupDate
                    ? pickupDate.format("YYYY-MM-DD")
                    : today.format("YYYY-MM-DD")
                }
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:border-transparent transition-colors duration-200 text-sm"
              />
            </div>
          </div>
          <div className="time-field-container">
            <SimpleTimePicker
              value={returnTime}
              onChange={handleReturnTimeChange}
              use12Hours={true}
              className="mt-0"
              fieldLabel="Return Time"
            />
          </div>
        </div>

        {/* Minimum time error message */}
        {timeError && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md mt-2 border border-red-200">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>{timeError}</p>
            </div>
          </div>
        )}

        {/* Same-day booking warning if applicable */}
        {pickupDate && returnDate && pickupDate.isSame(returnDate, "day") && !timeError && (
          <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-md mt-2 border border-amber-200">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p>
                Same-day bookings require a minimum rental period of 2 hours.
              </p>
            </div>
          </div>
        )}

        {/* Rental duration display */}
        {pickupDateTime && returnDateTime && !timeError && (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md mt-4 border border-gray-200">
            {(() => {
              // Calculate rental days based on the defined conditions
              const rentalDays = calculateRentalDays(
                pickupDateTime,
                returnDateTime
              );
              const exactDuration = calculateDuration();

              return (
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-[#8A7D55]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p>
                      Rental duration:{" "}
                      <span className="font-medium">
                        {rentalDays} {rentalDays === 1 ? "day" : "days"}
                      </span>
                    </p>
                  </div>
                  {exactDuration && (
                    <div className="flex items-center ml-7 mt-1 text-xs text-gray-500">
                      <p>Exact duration: {exactDuration}</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Availability message - only show if we have a message to display */}
        {displayAvailabilityMessage && (
          <div
            className={`p-3 rounded-md text-sm ${
              displayIsAvailable
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {displayIsCheckingAvailability ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2"></div>
                <p>Checking availability...</p>
              </div>
            ) : (
              <div className="flex items-center">
                {displayIsAvailable ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
                <p>{displayAvailabilityMessage}</p>
              </div>
            )}
          </div>
        )}

        {/* Provider Details - only show if we have provider ID and token */}
        {providerId && token && (
          <div className="mt-5">
            <ProviderDetail providerId={providerId} token={token} />
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default BookingForm;