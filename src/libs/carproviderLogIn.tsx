import { AUTH_ENDPOINTS } from '@/config/apiConfig';

export default async function carproviderLogin(carproviderEmail: string, carproviderPassword: string) {
  try {
    console.log('Attempting to login with API endpoint:', AUTH_ENDPOINTS.LOGIN);
    
    const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
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
      throw new Error(data.message || data.msg || "Authentication failed");
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
    throw error;
  }
}
