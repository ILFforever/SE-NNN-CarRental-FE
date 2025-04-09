import { API_BASE_URL } from "@/config/apiConfig";

export async function getServicesByCarId(
  carId: string,
  token: string
): Promise<Service[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/services/${carId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Error fetching services: ${res.status}`);
    }

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to fetch services");
    }

    return data.data as Service[];
  } catch (error) {
    console.error("getServicesByCarId error:", error);
    throw error;
  }
}
