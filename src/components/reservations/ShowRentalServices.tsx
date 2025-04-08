import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/apiConfig';
import { Star, ChevronDown, Info } from 'lucide-react';

interface Service {
  _id: string;
  name: string;
  description: string;
  rate: number;
  available?: boolean;
}

interface RentalServicesProps {
  token: string;
  serviceIds: string[];
}

export default function RentalServices({ token, serviceIds = [] }: RentalServicesProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch services data
  useEffect(() => {
    const fetchServices = async () => {
      if (!token || serviceIds.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/services`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }

        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          // Filter only the services that are in serviceIds
          const selectedServices = data.data.filter(
            (service: Service) => serviceIds.includes(service._id)
          );
          
          setServices(selectedServices);
        } else {
          throw new Error('Invalid service data received');
        }
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [token, serviceIds]);

  // Calculate total additional cost
  const totalAdditionalCost = services.reduce((sum, service) => sum + service.rate, 0);

  // Toggle service description
  const toggleServiceDescription = (serviceId: string) => {
    if (expandedService === serviceId) {
      setExpandedService(null);
    } else {
      setExpandedService(serviceId);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-medium mb-4 text-[#8A7D55]">Additional Services</h2>
        <div className="h-16 flex items-center justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-medium mb-4 text-[#8A7D55]">Additional Services</h2>
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-medium mb-4 text-[#8A7D55]">Additional Services</h2>
        <p className="text-gray-500 italic">No additional services added to this reservation</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium text-[#8A7D55]">Additional Services</h2>
        <div className="flex items-center">
          {!isExpanded && (
            <span className="mr-3 text-[#8A7D55] font-bold">
              Total: ${totalAdditionalCost.toFixed(2)}
            </span>
          )}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={isExpanded ? "Collapse services" : "Expand services"}
          >
            <ChevronDown 
              size={20} 
              className={`transition-transform duration-300 ${isExpanded ? 'transform rotate-180' : ''}`} 
            />
          </button>
        </div>
      </div>
      
      <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[1000px]' : 'max-h-0'}`}>
        <div className="rounded-lg bg-[#F8F5F0] p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Total additional cost:</span>
            <span className="text-[#8A7D55] font-bold">${totalAdditionalCost.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {services.map((service) => (
            <div key={service._id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Star className="text-[#8A7D55] h-4 w-4 mr-2 fill-current" />
                  <span className="font-medium text-gray-800">{service.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[#8A7D55] font-medium mr-3">${service.rate.toFixed(2)}/day</span>
                  
                  {service.description && (
                    <button
                      onClick={() => toggleServiceDescription(service._id)}
                      className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none transition-colors"
                      aria-label="Service details"
                    >
                      <Info className="h-4 w-4 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>
              
              {expandedService === service._id && service.description && (
                <div className="mt-2 pl-6 pr-2 py-2 border-t border-gray-200 text-sm text-gray-600">
                  {service.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}