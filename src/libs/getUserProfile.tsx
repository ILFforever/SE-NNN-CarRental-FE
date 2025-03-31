
import { AUTH_ENDPOINTS, createAuthHeader } from '@/config/apiConfig';
import { ApiResponse, User } from '@/types/dataTypes';

export default async function getUserProfile(token: string): Promise<ApiResponse<User>> {
  try {
    console.log('Fetching user profile with token');
    
    const response = await fetch(AUTH_ENDPOINTS.GET_PROFILE, {
      method: "GET",
      headers: {
        ...createAuthHeader(token),
        'Content-Type': 'application/json'
      },
    });
    
    console.log('Profile response status:', response.status);
    
    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }
    
    const data = await response.json();
    console.log('Profile data:', data);
    
    // Handle different API response structures
    if (data.success && data.data) {
      // Return in the expected ApiResponse<User> format
      return data;
    } else if (data.user) {
      // Handle case where user data is directly in 'user' property
      return {
        success: true,
        data: data.user
      };
    } else if (data._id || data.id) {
      // Handle case where the response is the user object itself
      return {
        success: true,
        data: data
      };
    }
    
    // If we couldn't identify the structure, return as is
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}
