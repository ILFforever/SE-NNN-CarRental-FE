import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/apiConfig';

interface Service {
  available: boolean;
  _id: string;
  name: string;
  description: string;
  rate: number;
}

interface GetAllServicesResult {
  services: Service[];
  isLoading: boolean;
  error: string;
  refetch: () => Promise<void>;
}

export function getAllServices(token: string): GetAllServicesResult {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchServices = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/services`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setServices(data.data);
      } else {
        throw new Error('Unexpected response format from server');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Could not load services. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [token]);

  return {
    services,
    isLoading,
    error,
    refetch: fetchServices
  };
}