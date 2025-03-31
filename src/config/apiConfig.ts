export const API_BASE_URL = 'https://cedt-rentals-be.vercel.app/api/v1';


// Auth endpoints
export const AUTH_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  GET_PROFILE: `${API_BASE_URL}/auth/curuser`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  CHANGE_PASSWORD: `${API_BASE_URL}/auth/update-password`, // Changed to match common backend naming
};

// Booking/reservation endpoints
export const RESERVATION_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/bookings`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/bookings/${id}`,
  CREATE: `${API_BASE_URL}/bookings`,
  UPDATE: (id: string) => `${API_BASE_URL}/bookings/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/bookings/${id}`,
};

// Venue/vehicle endpoints
export const VENUE_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/venues`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/venues/${id}`,
};

// Helper function to create authentication header
export const createAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`
});
