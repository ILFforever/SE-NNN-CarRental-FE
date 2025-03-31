import { PROVIDER_ENDPOINTS } from '@/config/apiConfig';
import { signOut } from 'next-auth/react';

/**
 * Logs out a car provider by making a request to the server to invalidate the token
 * 
 * @param token Provider authentication token
 * @returns Promise with logout result
 */
export default async function carProviderLogOut(token: string) {
  try {
    // First, invalidate the token on the server
    const response = await fetch(PROVIDER_ENDPOINTS.LOGOUT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      // Don't follow redirects
      redirect: 'manual'
    });

    // Check if response was successful or a redirect (both are acceptable)
    const success = response.ok || response.status === 302;
    
    // Try to parse the response body if it exists
    let data = {};
    try {
      if (response.status !== 302) {
        data = await response.json();
        console.log(data);
      }
    } catch (e) {
      // Ignore parsing errors
    }

    return {
      success,
      status: response.status,
      data
    };
  } catch (error) {
    console.error('Logout error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during logout'
    };
  }
}