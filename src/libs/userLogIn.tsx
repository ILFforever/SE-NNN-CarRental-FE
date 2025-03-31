import { AUTH_ENDPOINTS } from '@/config/apiConfig';

export default async function userLogin(userEmail: string, userPassword: string) {
  try {
    console.log('Attempting to login with API endpoint:', AUTH_ENDPOINTS.LOGIN);
    
    const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "email": userEmail,
        "password": userPassword
      }),
    });

    console.log('Login response status:', response.status);
    const data = await response.json();
    console.log('Login response data:', data);

    if (!response.ok) {
      // Return the error response data for better error handling
      return {
        success: false,
        message: data.message || data.msg || "Authentication failed",
        status: response.status
      };
    }
    
    // Make sure data has the expected structure
    if (!data.token && data.success && data.data && data.data.token) {
      // Handle case where token is nested in a data property
      return {
        success: data.success,
        token: data.data.token
      };
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    
    // Return a properly formatted error response
    return {
      success: false,
      message: error instanceof Error ? error.message : "Network error occurred",
      isNetworkError: true
    };
  }
}