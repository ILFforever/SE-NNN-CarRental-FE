//this is shared between admin and provider -Hammy
'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/apiConfig';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus, X, RefreshCw } from 'lucide-react';
import CarForm from '@/components/forms/CarForm';
import CarServicesDropdown from '@/components/service/CarServicesDropdown';

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
  service?: string[];
  createdAt?: string;
}

interface CarProvider {
  _id: string;
  name: string;
}

interface Pagination {
  next?: { page: number; limit: number };
  prev?: { page: number; limit: number };
}

interface UnifiedCarManagementProps {
  token: string;
  userType: 'admin' | 'provider';
  providerId?: string; // Only needed for providers
}

export default function UnifiedCarManagement({ token, userType, providerId }: UnifiedCarManagementProps) {
  const router = useRouter();
  
  // State management
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [carProviders, setCarProviders] = useState<CarProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [providerMap, setProviderMap] = useState<{[key: string]: string}>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({});
  const [totalItems, setTotalItems] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get tier name based on number
  const getTierName = (tier: number) => {
    const tierNames = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    return tierNames[tier] || `Tier ${tier}`;
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter cars based on license plate, brand, model, or provider (for admin)
    const filtered = cars.filter(car => 
      car.license_plate.toLowerCase().includes(query) || 
      car.brand.toLowerCase().includes(query) || 
      car.model.toLowerCase().includes(query) ||
      (userType === 'admin' && providerMap[car.provider_id] && 
       providerMap[car.provider_id].toLowerCase().includes(query))
    );

    setFilteredCars(filtered);
  };

  // Fetch car providers (admin only)
  const fetchCarProviders = async () => {
    if (userType !== 'admin') return;
    
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

  // Handle successful car add/edit
  const handleCarActionSuccess = () => {
    setShowCreateForm(false);
    fetchCars();
  };

  // Fetch cars based on user type
  const fetchCars = async (page = 1) => {
    setIsLoading(true);
    setError('');
    setIsRefreshing(true);
    
    try {
      // Different API endpoint based on user type
      const endpoint = userType === 'admin'
        ? `${API_BASE_URL}/cars?page=${page}&limit=25`
        : `${API_BASE_URL}/cars?page=${page}&limit=25&providerId=${providerId}`;
      
      const response = await fetch(endpoint, {
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
      setIsRefreshing(false);
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
        if (userType === 'admin') {
          await fetchCarProviders();
        }
        await fetchCars();
      };
      
      loadData();
    } else {
      setError('No authentication token available. Please log in again.');
    }
  }, [token, userType, providerId]);

  // Handle car deletion
  const handleDeleteCar = async (carId: string) => {
    if (!confirm('Are you sure you want to delete this car? This action cannot be undone. Any active rentals will be canceled.')) {
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

  // Handle edit car function
  const handleEditCar = (carId: string) => {
    const path = userType === 'admin' 
      ? `/admin/manageCars/edit?carId=${carId}`
      : `/provider/manageCars/edit?carId=${carId}`;
    
    router.push(path);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
            placeholder={userType === 'admin' 
              ? "Search cars by license plate, brand, model, or provider" 
              : "Search cars by license plate, brand, or model"
            }
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:border-[#8A7D55] transition-all duration-300 ease-in-out"
          />
        </div>

        {/* Refresh button */}
        <button
          onClick={() => fetchCars(currentPage)}
          disabled={isRefreshing}
          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:ring-opacity-50"
          title="Refresh cars list"
        >
          <RefreshCw className={`h-5 w-5 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>

        {/* Add Car Button with Icon */}
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center justify-center px-4 py-2 bg-[#8A7D55] text-white rounded-lg hover:bg-[#766b48] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:ring-opacity-50"
        >
          {showCreateForm ? (
            <>
              <X className="h-5 w-5 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="h-5 w-5 mr-2" />
              Add New Car
            </>
          )}
        </button>
      </div>

      {/* Create Car Form */}
      {showCreateForm && (
        <div className="mb-8">
          <CarForm 
            token={token}
            providerId={userType === 'provider' ? providerId : undefined}
            isAdmin={userType === 'admin'}
            onSuccess={handleCarActionSuccess}
            backUrl={userType === 'admin' ? '/admin/manageCars' : '/provider/manageCars'}
            title="Add New Car"
          />
        </div>
      )}

      {/* Cars Table */}
      <div className="overflow-x-auto">
        {isLoading && cars.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55] mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading cars...</p>
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              {searchQuery 
                ? "No cars match your search criteria." 
                : "No cars found. Add your first car to get started."}
            </p>
            {!searchQuery && !showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
              >
                Add New Car
              </button>
            )}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]"
                >
                  License Plate
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[14%]"
                >
                  Brand/Model
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]"
                >
                  Type/Color
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]"
                >
                  Manufacture Date
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]"
                >
                  Daily Rate
                </th>
                {userType === 'admin' && (
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]"
                  >
                    Provider
                  </th>
                )}
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]"
                >
                  Tier
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]"
                >
                  Services
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCars.map((car) => (
                <tr
                  key={car._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {car.license_plate}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 truncate">
                      {car.brand} {car.model}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-500 truncate">
                      {car.type.charAt(0).toUpperCase() + car.type.slice(1)} /{' '}
                      {car.color}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-500">
                      {formatDate(car.manufactureDate)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-500">
                      ${car.dailyRate.toFixed(2)}/day
                    </div>
                  </td>
                  
                  {/* Provider column for admin only */}
                  {userType === 'admin' && (
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-500 truncate">
                        {providerMap[car.provider_id] || 'Unknown'}
                      </div>
                    </td>
                  )}
                  
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-500 truncate">
                      {getTierName(car.tier)}
                    </div>
                  </td>
                  
                  {/* Services column */}
                  {token && car.service ? (
                    <CarServicesDropdown
                      token={token}
                      serviceIds={car.service}
                    />
                  ) : (
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-500">No services</div>
                    </td>
                  )}
                  
                  {/* Status column */}
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        car.available
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {car.available ? "Available" : "Rented"}
                    </span>
                  </td>
                  
                  {/* Actions column */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-3">
                      {/* Edit button */}
                      <button
                        onClick={() => handleEditCar(car._id)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition-colors"
                        title="Edit car"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteCar(car._id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                        title="Delete car"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="flex justify-center mt-6">
          {/* <h2 className="text-xl font-medium">
            {userType === 'admin' ? 'All Cars' : 'My Cars'}{' '}
            {filteredCars.length !== cars.length &&
              `(${filteredCars.length} of ${totalItems})`}
          </h2> */}

          {/* Pagination Controls */}
          <div className="flex items-center">
            <button
              onClick={handlePrevPage}
              disabled={!pagination.prev}
              className="p-2 rounded-md bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {Math.ceil(totalItems / 25) || 1}
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
      </div>
    </div>
  );
}