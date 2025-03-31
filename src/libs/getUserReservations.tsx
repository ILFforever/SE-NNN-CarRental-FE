import { RESERVATION_ENDPOINTS, createAuthHeader } from '@/config/apiConfig';
import { ApiResponse, Reservation } from '@/types/dataTypes';

export default async function getUserReservations(token: string): Promise<ApiResponse<Reservation[]>> {
  try {
    const response = await fetch(RESERVATION_ENDPOINTS.GET_ALL, {
      headers: {
        ...createAuthHeader(token),
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user reservations");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user reservations:", error);
    // Return a properly typed error response
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}