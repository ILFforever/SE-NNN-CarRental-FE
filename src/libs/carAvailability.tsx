import { Dayjs } from "dayjs";
import { API_BASE_URL } from "@/config/apiConfig";

interface AvailabilityResponse {
  success: boolean;
  data: {
    available: boolean;
    conflicts?: any[];
  };
  message?: string;
}

export const checkCarAvailability = async (
  carId: string,
  pickupDateTime: Dayjs,
  returnDateTime: Dayjs,
  token: string
): Promise<{
  isAvailable: boolean;
  availabilityMessage: string;
  conflicts?: any[];
}> => {
  try {
    // Prevent checking if pickup date is after return date
    if (pickupDateTime.isAfter(returnDateTime)) {
      return {
        isAvailable: false,
        availabilityMessage: "Pickup date and time cannot be after return date and time",
      };
    }

    // Format dates and times for the API
    const formattedStartDate = pickupDateTime.format("YYYY-MM-DD");
    const formattedReturnDate = returnDateTime.format("YYYY-MM-DD");
    const formattedStartTime = pickupDateTime.format("HH:mm");
    const formattedReturnTime = returnDateTime.format("HH:mm");

    const response = await fetch(
      `${API_BASE_URL}/cars/check-availability/${carId}?startDate=${formattedStartDate}&returnDate=${formattedReturnDate}&startTime=${formattedStartTime}&returnTime=${formattedReturnTime}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) throw new Error("Failed to check car availability");

    const availabilityData: AvailabilityResponse = await response.json();

    if (!availabilityData.success) {
      throw new Error(availabilityData.message || "Failed to check availability");
    }

    const available = availabilityData.data.available;
    const conflicts = availabilityData.data.conflicts || [];
    let message = "";

    if (available) {
      message = "Car is available for selected dates and times!";
    } else {
      if (conflicts.length > 0) {
        message = `Car is not available for the selected dates and times. There ${
          conflicts.length === 1 ? "is" : "are"
        } ${conflicts.length} existing ${
          conflicts.length === 1 ? "booking" : "bookings"
        } during this period.`;
      } else {
        message = "Car is not available for the selected dates and times. Please choose different schedule.";
      }
    }

    return {
      isAvailable: available,
      availabilityMessage: message,
      conflicts,
    };
  } catch (error) {
    console.error("Error checking car availability:", error);
    return {
      isAvailable: false,
      availabilityMessage: "Error checking availability. Please try again.",
    };
  }
};