'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL, createAuthHeader } from '@/config/apiConfig';

// Comprehensive type definitions
interface CarProviderData {
  _id: string;
  name: string;
  address: string;
  telephone_number: string;
  email: string;
  createdAt?: string;
}

interface CarProviderFormData {
  name: string;
  address: string;
  telephone_number: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface CarProviderProps {
  token: string;
}

export default function CarProvider({ token }: CarProviderProps) {
  // State management
  const [carProviders, setCarProviders] = useState<CarProviderData[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<CarProviderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<CarProviderFormData>({
    name: '',
    address: '',
    telephone_number: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      telephone_number: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setShowCreateForm(false);
  };

  // Validation utilities
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\d{3}-\d{7}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation
  const validateForm = (): boolean => {
    // Check for empty fields
    if (Object.values(formData).some(value => value.trim() === '')) {
      setError('All fields are required');
      return false;
    }

    // Password matching
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Phone number validation
    if (!validatePhoneNumber(formData.telephone_number)) {
      setError('Phone number must be in format XXX-XXXXXXX (e.g., 123-4567890)');
      return false;
    }

    // Email validation
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  // Search functionality
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query.trim() === '') {
      // If search is empty, show all providers
      setFilteredProviders(carProviders);
    } else {
      // Filter providers based on search query
      const filtered = carProviders.filter(provider => 
        provider.name.toLowerCase().includes(query) || 
        provider.email.toLowerCase().includes(query) ||
        provider.address.toLowerCase().includes(query) ||
        provider.telephone_number.includes(query)
      );
      setFilteredProviders(filtered);
    }
  };

  // Fetch car providers
  const fetchCarProviders = async () => {
    setIsLoading(true);
    setError('');
    
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
        setCarProviders(data.data);
        setFilteredProviders(data.data); // Initialize filtered list with all providers
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit new car provider
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/Car_Provider`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          telephone_number: formData.telephone_number,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create car provider');
      }

      // Success handling
      setSuccess('Car provider created successfully');
      resetForm();
      fetchCarProviders(); // Refresh the list after creating a new provider
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Deactivate car provider
  const handleDeactivateProvider = async (providerId: string) => {
    if (!window.confirm('WARNING: Deactivating this car provider will permanently delete ALL cars associated with this provider. Are you sure you want to continue?')) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/Car_Provider/${providerId}`, {
        method: 'DELETE',
        headers: {
          ...createAuthHeader(token),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to deactivate car provider');
      }

      // Success handling
      setSuccess('Car provider deactivated successfully');
      
      // Update both the full list and the filtered list
      const updatedProviders = carProviders.filter(p => p._id !== providerId);
      setCarProviders(updatedProviders);
      
      // Also update the filtered list to maintain consistency
      setFilteredProviders(updatedProviders.filter(provider => {
        if (searchQuery.trim() === '') return true;
        
        const query = searchQuery.toLowerCase();
        return provider.name.toLowerCase().includes(query) || 
               provider.email.toLowerCase().includes(query) ||
               provider.address.toLowerCase().includes(query) ||
               provider.telephone_number.includes(query);
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (token) {
      fetchCarProviders();
    }
  }, [token]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Error Handling */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}

      {/* Search and Create Section */}
      <div className="flex items-center justify-between mb-6 space-x-4">
        {/* Search Input with Icon */}
        <div className="flex-grow relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search car providers by name, email, address, or phone"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:border-[#8A7D55] transition-all duration-300 ease-in-out"
          />
        </div>

        {/* Create Provider Button with Icon */}
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center justify-center px-4 py-2 bg-[#8A7D55] text-white rounded-lg hover:bg-[#766b48] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:ring-opacity-50"
        >
          {showCreateForm ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Provider
            </>
          )}
        </button>
      </div>

      {/* Create Car Provider Form */}
      {showCreateForm && (
        <div className="mb-8 p-5 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-medium mb-4">Create New Car Provider</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Form fields with consistent styling */}
              {[
                { 
                  name: 'name', 
                  label: 'Provider Name *', 
                  type: 'text',
                  required: true
                },
                { 
                  name: 'address', 
                  label: 'Address *', 
                  type: 'text',
                  required: true
                },
                { 
                  name: 'telephone_number', 
                  label: 'Telephone * (XXX-XXXXXXX)', 
                  type: 'tel',
                  placeholder: '123-4567890',
                  required: true
                },
                { 
                  name: 'email', 
                  label: 'Email Address *', 
                  type: 'email',
                  required: true
                },
                { 
                  name: 'password', 
                  label: 'Password *', 
                  type: 'password',
                  required: true,
                  minLength: 6
                },
                { 
                  name: 'confirmPassword', 
                  label: 'Confirm Password *', 
                  type: 'password',
                  required: true
                }
              ].map(field => (
                <div key={field.name}>
                  <label htmlFor={field.name} className="block text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    value={formData[field.name as keyof CarProviderFormData]}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      [field.name]: e.target.value
                    }))}
                    placeholder={field.placeholder}
                    required={field.required}
                    minLength={field.minLength}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                  />
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Provider'}
              </button>
            </div>
          </form>
        </div>
      )}
    
      {/* Providers Table */}
      <div className="overflow-x-auto">
        <h2 className="text-xl font-medium mb-4">
          Car Providers {filteredProviders.length !== carProviders.length && `(${filteredProviders.length} of ${carProviders.length})`}
        </h2>
        
        {isLoading && !carProviders.length ? (
          <p className="text-center py-4">Loading car providers...</p>
        ) : filteredProviders.length === 0 ? (
          searchQuery ? (
            <p className="text-center py-4 text-gray-600">No car providers match your search.</p>
          ) : (
            <p className="text-center py-4 text-gray-600">No car providers found.</p>
          )
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telephone
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProviders.map((provider) => (
                <tr key={provider._id}>
                  <td className="px-6 py-4 whitespace-normal break-words">
                    <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-normal break-words">
                    <div className="text-sm text-gray-500">{provider.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-normal break-words max-w-xs">
                    <div className="text-sm text-gray-500">{provider.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{provider.telephone_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {provider.createdAt ? new Date(provider.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeactivateProvider(provider._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}