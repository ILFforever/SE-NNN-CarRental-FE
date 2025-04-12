import { Dayjs } from "dayjs";
import { API_BASE_URL } from "@/config/apiConfig";
import { calculateSubtotal, calculateDiscount, getRentalPeriod } from "./bookingUtils";

interface BookingResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export const makeBooking = async (
  carId: string,
  pickupDateTime: Dayjs,
  returnDateTime: Dayjs,
  selectedServices: string[],
  services: Service[],
  userTier: number,
  dailyRate: number,
  token: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Format dates and times for the API
    const formattedStartDate = pickupDateTime.format("YYYY-MM-DD");
    const formattedReturnDate = returnDateTime.format("YYYY-MM-DD");
    const formattedStartTime = pickupDateTime.format("HH:mm");
    const formattedReturnTime = returnDateTime.format("HH:mm");

    // Double-check availability one more time before booking
    const availabilityResponse = await fetch(
      `${API_BASE_URL}/cars/check-availability/${carId}?startDate=${formattedStartDate}&returnDate=${formattedReturnDate}&startTime=${formattedStartTime}&returnTime=${formattedReturnTime}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!availabilityResponse.ok) {
      throw new Error("Failed to check car availability");
    }

    const availabilityData = await availabilityResponse.json();
    if (!availabilityData.success) {
      throw new Error(
        availabilityData.message || "Failed to check availability"
      );
    }

    const isStillAvailable = availabilityData.data.available;
    if (!isStillAvailable) {
      return {
        success: false,
        message: "Car is no longer available for the selected dates and times. Another booking may have been made. Please choose different schedule."
      };
    }

    // Calculate all price values with the updated time-aware rental period
    const days = getRentalPeriod(pickupDateTime, returnDateTime);
    const basePrice = days * dailyRate;

    // Get service price using the utility function
    const servicePrice = services
      .filter((service) => selectedServices.includes(service._id))
      .reduce((total, service) => {
        const serviceCost = service.daily ? service.rate * days : service.rate;
        return total + serviceCost;
      }, 0);

    const subtotal = calculateSubtotal(
      pickupDateTime,
      returnDateTime,
      dailyRate,
      selectedServices,
      services
    );

    const discountAmount = calculateDiscount(
      pickupDateTime,
      returnDateTime,
      dailyRate,
      selectedServices,
      services,
      userTier
    );

    const finalPrice = subtotal - discountAmount;

    // Send booking data to backend
    const response = await fetch(`${API_BASE_URL}/rents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: formattedStartDate,
        returnDate: formattedReturnDate,
        startTime: formattedStartTime,
        returnTime: formattedReturnTime,
        car: carId,
        price: basePrice,
        servicePrice: servicePrice,
        discountAmount: discountAmount,
        finalPrice: finalPrice,
        service: selectedServices,
        rentalDays: days,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || "Booking failed. Please try again."
      };
    }

    return {
      success: true,
      message: "Booking successful!"
    };
  } catch (error) {
    console.error("Error booking:", error);
    return {
      success: false,
      message: "An error occurred. Please try again."
    };
  }
};