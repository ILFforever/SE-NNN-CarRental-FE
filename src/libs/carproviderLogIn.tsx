import { PROVIDER_ENDPOINTS } from '@/config/apiConfig';

export default async function carproviderLogin(carproviderEmail: string, carproviderPassword: string) {
  try {
    const response = await fetch(PROVIDER_ENDPOINTS.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "email": carproviderEmail,
        "password": carproviderPassword
      }),
    });

    console.log('Login response status:', response.status);
    const data = await response.json();
    console.log('Login response data:', data);

    if (!response.ok) {
      // Return detailed error from server
      return {
        success: false,
        message: data.message || data.msg || "Authentication failed",
        status: response.status
      };
    }
    
    // Normalize token extraction
    const token = data.token || (data.data && data.data.token);
    
    if (!token) {
      return {
        success: false,
        message: 'No authentication token received',
        status: response.status
      };
    }
    
    return {
      success: true,
      token: token
    };
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