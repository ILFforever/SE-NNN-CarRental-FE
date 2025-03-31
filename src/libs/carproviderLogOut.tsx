import { AUTH_ENDPOINTS, createAuthHeader } from '@/config/apiConfig';
import { signOut } from 'next-auth/react';

/**
 * Logs out a user by making a request to the server to invalidate the token
 * and then clearing the NextAuth session
 * 
 * @param token User authentication token
 * @returns Promise with logout result
 */
export default async function userLogOut(token: string) {
  try {
    // First, invalidate the token on the server
    const response = await fetch(AUTH_ENDPOINTS.LOGOUT, {
      method: 'POST',
      headers: {
        ...createAuthHeader(token),
        'Content-Type': 'application/json'
      },
      // Don't follow redirects
      redirect: 'manual'
    });

    // Check if response was successful or a redirect (both are acceptable)
    const success = response.ok || response.status === 302;
    
    // If server logout was successful, also clear the client-side session
    if (success) {
      // Log out from NextAuth session
      await signOut({ redirect: false });
    }

    // Try to parse the response body if it exists
    let data = {};
    try {
      if (response.status !== 302) {
        data = await response.json();
        console.log(data)
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
    
    // Even if the server request fails, try to logout from client side
    await signOut({ redirect: false });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during logout'
    };
  }
}