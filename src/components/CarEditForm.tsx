// src/components/CarEditForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/apiConfig';
import Link from 'next/link';

interface CarFormData {
  license_plate: string;
  brand: string;
  model: string;
  type: string;
  color: string;
  manufactureDate: string;
  dailyRate: number;
  tier: number;
  provider_id: string;
}

interface CarEditFormProps {
  carId?: string;
  token: string;
  isAdmin?: boolean;
  providerId?: string;
  onSuccess?: () => void;
  backUrl?: string;
}

export default function CarEditForm({
  carId,
  token,
  isAdmin = false,
  providerId,
  onSuccess,
  backUrl = '/provider/manageCars',
}: CarEditFormProps) {
  const router = useRouter();
  
  // States
  const [isLoading, setIsLoading] = useState(!!carId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [providers, setProviders] = useState<Array<{_id: string, name: string}>>([]);

  // Car types options
  const carTypes = ['sedan', 'suv', 'hatchback', 'convertible', 'truck', 'van', 'other'];
  
  // Tiers options (0-4)
  const tiers = [0, 1, 2, 3, 4];

  // Colors options
  const carColors = [
    'Black', 'White', 'Silver', 'Gray', 'Blue', 'Red', 
    'Green', 'Yellow', 'Orange', 'Purple', 'Brown', 'Gold', 'Other'
  ];

  // Initial form data
  const initialFormData: CarFormData = {
    license_plate: '',
    brand: '',
    model: '',
    type: 'sedan',
    color: '',
    manufactureDate: new Date().toISOString().split('T')[0],
    dailyRate: 0,
    tier: 0,
    provider_id: providerId || '',
  };

  const [formData, setFormData] = useState<CarFormData>(initialFormData);

  // If admin, fetch car providers
  useEffect(() => {
    const fetchProviders = async () => {
      if (!isAdmin || !token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/Car_Provider`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch car providers');
        }

        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          setProviders(data.data);
        }
      } catch (err) {
        console.error('Error fetching providers:', err);
        setError('Could not load provider list. Some features may be limited.');
      }
    };

    if (isAdmin) {
      fetchProviders();
    }
  }, [isAdmin, token]);

  // Fetch car data if editing existing car
  useEffect(() => {
    const fetchCarData = async () => {
      if (!carId || !token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/cars/${carId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch car data');
        }

        const data = await response.json();

        if (data.success && data.data) {
          // Format the date from ISO to YYYY-MM-DD for input
          const manufactureDate = new Date(data.data.manufactureDate)
            .toISOString()
            .split('T')[0];

          setFormData({
            license_plate: data.data.license_plate,
            brand: data.data.brand,
            model: data.data.model,
            type: data.data.type,
            color: data.data.color,
            manufactureDate,
            dailyRate: data.data.dailyRate,
            tier: data.data.tier,
            provider_id: data.data.provider_id
          });
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        console.error('Error fetching car:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarData();
  }, [carId, token]);

  // Handle input change for form fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for numeric values
    if (name === 'dailyRate' || name === 'tier') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: name === 'tier' ? parseInt(value) : parseFloat(value) 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Form validation
  const validateForm = () => {
    if (!formData.license_plate || 
        !formData.brand || 
        !formData.model || 
        !formData.type || 
        !formData.color || 
        !formData.manufactureDate || 
        formData.dailyRate <= 0 ||
        !formData.provider_id) {
      setError('All fields are required. Daily rate must be greater than 0.');
      return false;
    }

    // Validate license plate format
    const licensePlateRegex = /^[A-Za-z0-9 -]{2,20}$/;
    if (!licensePlateRegex.test(formData.license_plate)) {
      setError('License plate format is invalid. It should be 2-20 alphanumeric characters, spaces, or hyphens.');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Missing authentication token');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Determine if we're creating a new car or updating an existing one
      const url = carId 
        ? `${API_BASE_URL}/cars/${carId}` 
        : `${API_BASE_URL}/cars`;
      
      const method = carId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${carId ? 'update' : 'create'} car`);
      }

      setSuccess(`Car ${carId ? 'updated' : 'created'} successfully`);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Otherwise redirect back to car management page after a short delay
        setTimeout(() => {
          router.push(backUrl);
        }, 1500);
      }
    } catch (err) {
      console.error(`Error ${carId ? 'updating' : 'creating'} car:`, err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* License Plate */}
          <div>
            <label htmlFor="license_plate" className="block text-gray-700 mb-1">
              License Plate *
            </label>
            <input
              type="text"
              id="license_plate"
              name="license_plate"
              value={formData.license_plate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
              placeholder="e.g., ABC-123"
            />
          </div>
          
          {/* Brand */}
          <div>
            <label htmlFor="brand" className="block text-gray-700 mb-1">
              Brand *
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
              placeholder="e.g., Mercedes, BMW"
            />
          </div>
          
          {/* Model */}
          <div>
            <label htmlFor="model" className="block text-gray-700 mb-1">
              Model *
            </label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
              placeholder="e.g., C-Class, 5 Series"
            />
          </div>
          
          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-gray-700 mb-1">
              Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
            >
              {carTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          {/* Color */}
          <div>
            <label htmlFor="color" className="block text-gray-700 mb-1">
              Color *
            </label>
            <select
              id="color"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
            >
              <option value="">Select Color</option>
              {carColors.map(color => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>
          
          {/* Manufacture Date */}
          <div>
            <label htmlFor="manufactureDate" className="block text-gray-700 mb-1">
              Manufacture Date *
            </label>
            <input
              type="date"
              id="manufactureDate"
              name="manufactureDate"
              value={formData.manufactureDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
            />
          </div>
          
          {/* Daily Rate */}
          <div>
            <label htmlFor="dailyRate" className="block text-gray-700 mb-1">
              Daily Rate (USD) *
            </label>
            <input
              type="number"
              id="dailyRate"
              name="dailyRate"
              value={formData.dailyRate}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
            />
          </div>
          
          {/* Tier */}
          <div>
            <label htmlFor="tier" className="block text-gray-700 mb-1">
              Tier *
            </label>
            <select
              id="tier"
              name="tier"
              value={formData.tier}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
            >
              {tiers.map(tier => (
                <option key={tier} value={tier}>
                  {tier === 0 ? 'Bronze' : 
                   tier === 1 ? 'Silver' : 
                   tier === 2 ? 'Gold' : 
                   tier === 3 ? 'Platinum' : 
                   'Diamond'} (Tier {tier})
                </option>
              ))}
            </select>
          </div>

          {/* Provider Selector (Admin only) */}
          {isAdmin && (
            <div>
              <label htmlFor="provider_id" className="block text-gray-700 mb-1">
                Car Provider *
              </label>
              <select
                id="provider_id"
                name="provider_id"
                value={formData.provider_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
              >
                <option value="">Select Provider</option>
                {providers.map(provider => (
                  <option key={provider._id} value={provider._id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-4">
          <Link
            href={backUrl}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : carId ? 'Save Changes' : 'Add Car'}
          </button>
        </div>
      </form>
    </div>
  );
}