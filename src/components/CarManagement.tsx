'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/apiConfig';
import { useSession } from 'next-auth/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Type definitions
interface Car {
  _id: string;
  license_plate: string;
  brand: string;
  model: string;
  type: string;
  color: string;
  manufactureDate: string;
  available: boolean;
  dailyRate: number;
  tier: number;
  provider_id: string;
  createdAt?: string;
}

interface CarProvider {
  _id: string;
  name: string;
}

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

interface CarManagementProps {
  token: string;
}

interface Pagination {
    next?: { page: number; limit: number };
    prev?: { page: number; limit: number };
  }

export default function CarManagement({ token }: CarManagementProps) {
  // State management
  const { data: session } = useSession();
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [carProviders, setCarProviders] = useState<CarProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [providerMap, setProviderMap] = useState<{[key: string]: string}>({});

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({});
  const [totalItems, setTotalItems] = useState(0);
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
    provider_id: ''
  };
  
  const [formData, setFormData] = useState<CarFormData>(initialFormData);

  // Car types options
  const carTypes = ['sedan', 'suv', 'hatchback', 'convertible', 'truck', 'van', 'other'];
  
  // Tiers options (0-4)
  const tiers = [0, 1, 2, 3, 4];

  // Colors options
  const carColors = [
    'Black', 'White', 'Silver', 'Gray', 'Blue', 'Red', 
    'Green', 'Yellow', 'Orange', 'Purple', 'Brown', 'Gold', 'Other'
  ];

  // Reset form fields
  const resetFormFields = () => {
    setFormData(initialFormData);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter cars based on license plate, brand, model, or provider
    const filtered = cars.filter(car => 
      car.license_plate.toLowerCase().includes(query) || 
      car.brand.toLowerCase().includes(query) || 
      car.model.toLowerCase().includes(query) ||
      (providerMap[car.provider_id] && providerMap[car.provider_id].toLowerCase().includes(query))
    );

    setFilteredCars(filtered);
  };

  // Handle cancel button click
  const handleCancelCreate = () => {
    resetFormFields();
    setShowCreateForm(false);
  };

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

  // Fetch car providers
  const fetchCarProviders = async () => {
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
        
        // Create a map of provider IDs to names for quick lookup
        const providerMapping: {[key: string]: string} = {};
        data.data.forEach((provider: CarProvider) => {
          providerMapping[provider._id] = provider.name;
        });
        setProviderMap(providerMapping);
      }
    } catch (error) {
      console.error('Error fetching car providers:', error);
      setError('Could not load car providers. Please try again later.');
    }
  };

  // Fetch all cars
  const fetchCars = async (page = 1) => {
    setIsLoading(true);
    setError('');
    
    try {
        const response = await fetch(`${API_BASE_URL}/cars?page=${page}&limit=25`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch cars: ${response.status}`);
          }
    
          const data = await response.json();
          
          if (data.success && Array.isArray(data.data)) {
            setCars(data.data);
            setFilteredCars(data.data);
            setCurrentPage(page);
            setPagination(data.pagination || {});
            setTotalItems(data.totalCount || 0);
          } else {
            throw new Error('Unexpected response format from server');
          }
        } catch (error) {
          console.error('Error fetching cars:', error);
          setError('Could not load cars. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      };
       // Pagination navigation functions
  const handleNextPage = () => {
    if (pagination.next) {
      fetchCars(pagination.next.page);
    }
  };

  const handlePrevPage = () => {
    if (pagination.prev) {
      fetchCars(pagination.prev.page);
    }
  };
  // Initial data fetch on component mount
  useEffect(() => {
    if (token) {
      const loadData = async () => {
        await fetchCarProviders();
        await fetchCars();
      };
      
      loadData();
    } else {
      setError('No authentication token available. Please log in again.');
    }
  }, [token]);

  // Validate form input
  const validateForm = () => {
    if (
      !formData.license_plate || 
      !formData.brand || 
      !formData.model || 
      !formData.type || 
      !formData.color || 
      !formData.manufactureDate || 
      formData.dailyRate <= 0 || 
      !formData.provider_id
    ) {
      setError('All fields are required. Daily rate must be greater than 0.');
      return false;
    }

    // Validate license plate format (can be customized based on requirements)
    const licensePlateRegex = /^[A-Za-z0-9 -]{2,20}$/;
    if (!licensePlateRegex.test(formData.license_plate)) {
      setError('License plate format is invalid. It should be 2-20 alphanumeric characters, spaces, or hyphens.');
      return false;
    }

    return true;
  };

  // Submit form to create new car
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/cars`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.msg || 'Failed to create car');
      }

      // Reset form and show success message
      resetFormFields();
      setSuccess('Car created successfully');
      setShowCreateForm(false);
      
      // Refresh the cars list
      fetchCars();
    } catch (error) {
      console.error('Error creating car:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle car deletion
  const handleDeleteCar = async (carId: string) => {
    if (!confirm('Are you sure you want to delete this car? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/cars/${carId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.msg || 'Failed to delete car');
      }

      setSuccess('Car deleted successfully');
      
      // Update the cars list
      setCars(prevCars => prevCars.filter(car => car._id !== carId));
      setFilteredCars(prevCars => prevCars.filter(car => car._id !== carId));
    } catch (error) {
      console.error('Error deleting car:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get tier name based on number
  const getTierName = (tier: number) => {
    const tierNames = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    return tierNames[tier] || `Tier ${tier}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Success and Error Messages */}
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
            placeholder="Search cars by license plate, brand, model, or provider"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:border-[#8A7D55] transition-all duration-300 ease-in-out"
          />
        </div>

        {/* Create Car Button with Icon */}
        <button
          onClick={() => {
            if (showCreateForm) {
              handleCancelCreate();
            } else {
              setShowCreateForm(true);
            }
          }}
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
              Add New Car
            </>
          )}
        </button>
      </div>

      {/* Create Car Form */}
      {showCreateForm && (
        <div className="mb-8 p-5 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-medium mb-4">Add New Car</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                      {getTierName(tier)} (Tier {tier})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Provider */}
              <div>
                <label htmlFor="provider_id" className="block text-gray-700 mb-1">
                  Car Provider *
                </label>
                <div className="relative">
                  <select
                    id="provider_id"
                    name="provider_id"
                    value={formData.provider_id}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      !formData.provider_id && carProviders.length > 0 
                        ? 'border-yellow-300 bg-yellow-50' 
                        : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]`}
                  >
                    <option value="">Select Provider</option>
                    {carProviders.map(provider => (
                      <option key={provider._id} value={provider._id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                  {carProviders.length === 0 && (
                    <div className="mt-1 text-sm text-red-600">
                      No providers available. Please create a provider first.
                    </div>
                  )}
                  {carProviders.length > 0 && !formData.provider_id && (
                    <div className="absolute right-3 top-2.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  )}
                </div>
                {carProviders.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    This will associate the car with the selected provider.
                  </div>
                )}
              </div></div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancelCreate}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || carProviders.length === 0}
                className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Adding Car...' : 'Add Car'}
              </button>
            </div>
          </form>
        </div>
      )}

       {/* Cars Table */}
       <div className="overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">
            Cars {filteredCars.length !== cars.length && `(${filteredCars.length} of ${totalItems})`}            
            </h2>
        
 {/* Pagination Controls */}
 <div className="flex items-center space-x-2">
            <button 
              onClick={handlePrevPage} 
              disabled={!pagination.prev}
              className="p-2 rounded-md bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-600">
                Page {currentPage} of {pagination.next ? currentPage + 1 : currentPage}
            </span>
            <button 
              onClick={handleNextPage} 
              disabled={!pagination.next}
              className="p-2 rounded-md bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {isLoading && !filteredCars.length ? (
          <p className="text-center py-4">Loading cars...</p>
        ) : filteredCars.length === 0 ? (
          searchQuery ? (
            <p className="text-center py-4 text-gray-600">No cars match your search.</p>
          ) : (
            <p className="text-center py-4 text-gray-600">No cars found.</p>
          )
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  License Plate
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand/Model
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type/Color
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manufacture Date
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Daily Rate
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCars.map((car) => (
                <tr key={car._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{car.license_plate}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{car.brand} {car.model}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {car.type.charAt(0).toUpperCase() + car.type.slice(1)} / {car.color}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(car.manufactureDate)}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">${car.dailyRate.toFixed(2)}/day</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{providerMap[car.provider_id] || 'Unknown'}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{getTierName(car.tier)}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span 
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        car.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {car.available ? 'Available' : 'Rented'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteCar(car._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
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
