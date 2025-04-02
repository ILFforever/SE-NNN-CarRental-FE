import { PROVIDER_ENDPOINTS, createAuthHeader } from '@/config/apiConfig';
import { ApiResponse } from '@/types/dataTypes';

interface Provider {
  _id: string;
  name: string;
  address?: string;
  email: string;
  telephone_number?: string;
}

/**
 * Fetch car provider profile from API
 * 
 * @param token Provider authentication token
 * @returns Promise with provider profile data
 */
export default async function getProviderProfile(token: string): Promise<ApiResponse<Provider>> {
  try {
    console.log('Fetching provider profile with token');
    
    const response = await fetch(PROVIDER_ENDPOINTS.GET_PROFILE, {
      method: "GET",
      headers: {
        ...createAuthHeader(token),
        'Content-Type': 'application/json'
      },
    });
    
    console.log('Provider profile response status:', response.status);
    
    if (!response.ok) {
      throw new Error("Failed to fetch provider profile");
    }
    
    const data = await response.json();
    console.log('Provider profile data:', data);
    
    // Handle different API response structures
    if (data.success && data.data) {
      // Return in the expected ApiResponse<Provider> format
      return data;
    } else if (data.provider) {
      // Handle case where provider data is directly in 'provider' property
      return {
        success: true,
        data: data.provider
      };
    } else if (data._id || data.id) {
      // Handle case where the response is the provider object itself
      return {
        success: true,
        data: data
      };
    }
    
    // If we couldn't identify the structure, return as is
    return data;
  } catch (error) {
    console.error('Error fetching provider profile:', error);
    throw error;
  }
}