'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/apiConfig';
import { useSession } from 'next-auth/react';
import { ChevronDown, Search, CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Type definitions
interface Car {
  _id: string;
  license_plate: string;
  brand: string;
  model: string;
  type: string;
  color: string;
  dailyRate: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  telephone_number: string;
}

interface Rent {
  _id: string;
  startDate: string;
  returnDate: string;
  actualReturnDate?: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  price: number;
  additionalCharges?: number;
  notes?: string;
  car: string | Car;
  user: string | User;
  createdAt: string;
}

interface ProviderRentalManagementProps {
  initialStatusFilter?: string;
  initialSearchQuery?: string;
}

export default function ProviderRentalManagement({
  initialStatusFilter = '',
  initialSearchQuery = ''
}: ProviderRentalManagementProps) {
  const { data: session } = useSession();
  
  // State variables
  const [rentals, setRentals] = useState<Rent[]>([]);
  const [filteredRentals, setFilteredRentals] = useState<Rent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [dateRangeFilter, setDateRangeFilter] = useState<{start: string, end: string}>({
    start: '', 
    end: ''
  });
  
  // Store for cars and users
  const [cars, setCars] = useState<{[key: string]: Car}>({});
  const [users, setUsers] = useState<{[key: string]: User}>({});
  
  // Fetch all rentals for provider's cars
  useEffect(() => {
    const fetchRentals = async () => {
      if (!session?.user?.token) {
        setError('Authentication required. Please sign in.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        // Get provider ID safely from session
        const providerId = session.user.id || session.user._id || 'provider_id';
        
        console.log('Fetching rentals for provider ID:', providerId);
        
        // First, get all cars belonging to this provider
        const carsResponse = await fetch(`${API_BASE_URL}/cars?providerId=${providerId}&limit=100`, {
          headers: {
            'Authorization': `Bearer ${session.user.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!carsResponse.ok) {
          throw new Error(`Failed to fetch provider cars: ${carsResponse.status}`);
        }

        const carsData = await carsResponse.json();
        
        if (!carsData.success || !Array.isArray(carsData.data) || carsData.data.length === 0) {
          setRentals([]);
          setFilteredRentals([]);
          setIsLoading(false);
          return; // No error if no cars, just empty state
        }
        
        // Create a map of car IDs and store car details
        const providerCars = carsData.data;
        const carMap: {[key: string]: Car} = {};
        const carIds = providerCars.map((car: any) => {
          carMap[car._id] = car;
          return car._id;
        });
        
        setCars(carMap);
        
        // If no cars, don't try to fetch rentals
        if (carIds.length === 0) {
          setRentals([]);
          setFilteredRentals([]);
          setIsLoading(false);
          return;
        }
        
        // Fetch rentals for all provider's cars
        const rentalsPromises = carIds.map((carId: string) => 
          fetch(`${API_BASE_URL}/rents/all?carId=${carId}`, {
            headers: {
              'Authorization': `Bearer ${session.user.token}`,
              'Content-Type': 'application/json'
            }
          })
        );
        
        const rentalsResponses = await Promise.all(rentalsPromises);
        
        // Process all rental responses
        const allRentalsData = await Promise.all(
          rentalsResponses.map(async (response) => {
            if (!response.ok) return { success: false, data: [] };
            return response.json();
          })
        );
        
        // Combine all rentals into a single array
        let allRentals: any[] = [];
        allRentalsData.forEach(data => {
          if (data.success && Array.isArray(data.data)) {
            allRentals = [...allRentals, ...data.data];
          }
        });
        
        // Sort rentals by start date (most recent first)
        allRentals.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        
        setRentals(allRentals);
        
        // Apply initial filters if provided
        let filtered = [...allRentals];
        
        if (initialStatusFilter) {
          filtered = filtered.filter(rental => rental.status === initialStatusFilter);
        }
        
        if (initialSearchQuery) {
          const query = initialSearchQuery.toLowerCase();
          filtered = filtered.filter(rental => {
            // Simple search in ID
            if (rental._id.toLowerCase().includes(query)) return true;
            
            // Search in car details
            const car = typeof rental.car === 'string' 
              ? carMap[rental.car]
              : rental.car;
              
            if (car) {
              if (car.brand?.toLowerCase().includes(query)) return true;
              if (car.model?.toLowerCase().includes(query)) return true;
              if (car.license_plate?.toLowerCase().includes(query)) return true;
            }
            
            return false;
          });
        }
        
        setFilteredRentals(filtered);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        
        // Collect user IDs for fetching user details
        const userIds = new Set<string>();
        allRentals.forEach(rental => {
          if (typeof rental.user === 'string') {
            userIds.add(rental.user);
          } else if (rental.user && typeof rental.user === 'object' && rental.user._id) {
            userIds.add(rental.user._id);
          }
        });
        
        // Fetch user details
        if (userIds.size > 0) {
          await fetchUserDetails(Array.from(userIds));
        }
      } catch (err) {
        console.error('Error fetching rentals:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch rental data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRentals();
  }, [session, itemsPerPage, initialStatusFilter, initialSearchQuery]);

  // Fetch user details by IDs
  const fetchUserDetails = async (userIds: string[]) => {
    if (!session?.user?.token) return;
    
    try {
      const userDetailsMap: {[key: string]: User} = {};
      
      // Fetch details for each user
      for (const userId of userIds) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
            headers: {
              'Authorization': `Bearer ${session.user.token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              userDetailsMap[userId] = data.data;
            }
          }
        } catch (e) {
          console.warn(`Could not fetch details for user ${userId}:`, e);
        }
      }
      
      setUsers(userDetailsMap);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  // Apply filters
  useEffect(() => {
    let results = [...rentals];
    
    // Apply status filter
    if (statusFilter) {
      results = results.filter(rental => rental.status === statusFilter);
    }
    
    // Apply date range filter
    if (dateRangeFilter.start) {
      const startDate = new Date(dateRangeFilter.start);
      results = results.filter(rental => new Date(rental.startDate) >= startDate);
    }
    
    if (dateRangeFilter.end) {
      const endDate = new Date(dateRangeFilter.end);
      results = results.filter(rental => new Date(rental.returnDate) <= endDate);
    }
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      
      results = results.filter(rental => {
        // Search in rental ID
        if (rental._id.toLowerCase().includes(query)) return true;
        
        // Search in car details
        const car = typeof rental.car === 'string' 
          ? cars[rental.car]
          : rental.car as Car;
          
        if (car) {
          if (car.brand?.toLowerCase().includes(query)) return true;
          if (car.model?.toLowerCase().includes(query)) return true;
          if (car.license_plate?.toLowerCase().includes(query)) return true;
        }
        
        // Search in user details
        const user = typeof rental.user === 'string'
          ? users[rental.user]
          : rental.user as User;
          
        if (user) {
          if (user.name?.toLowerCase().includes(query)) return true;
          if (user.email?.toLowerCase().includes(query)) return true;
          if (user.telephone_number?.toLowerCase().includes(query)) return true;
        }
        
        return false;
      });
    }
    
    setFilteredRentals(results);
    setTotalPages(Math.ceil(results.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, statusFilter, dateRangeFilter, rentals, cars, users, itemsPerPage]);

  // Handle rental update (Accept/Complete)
  const updateRentalStatus = async (rentalId: string, newStatus: 'active' | 'completed') => {
    if (!session?.user?.token) {
      setError('Authentication required. Please sign in.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const endpoint = newStatus === 'active' 
        ? `${API_BASE_URL}/rents/${rentalId}/confirm` 
        : `${API_BASE_URL}/rents/${rentalId}/complete`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update rental status to ${newStatus}`);
      }
      
      // Update rentals list
      setRentals(prev => 
        prev.map(rental => 
          rental._id === rentalId 
            ? { ...rental, status: newStatus } 
            : rental
        )
      );
      
      setFilteredRentals(prev => 
        prev.map(rental => 
          rental._id === rentalId 
            ? { ...rental, status: newStatus } 
            : rental
        )
      );
      
      setSuccess(`Rental ${newStatus === 'active' ? 'confirmed' : 'completed'} successfully`);
    } catch (error) {
      console.error(`Error updating rental status to ${newStatus}:`, error);
      setError(error instanceof Error ? error.message : 'An error occurred while updating the rental');
    } finally {
      setIsLoading(false);
    }
  };

  // Get car details by ID or object
  const getCarDetails = (car: string | Car): Car | undefined => {
    if (typeof car === 'string') {
      return cars[car];
    }
    return car as Car;
  };

  // Get user details by ID or object
  const getUserDetails = (user: string | User): User | undefined => {
    if (typeof user === 'string') {
      return users[user];
    }
    return user as User;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge classes
  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate paginated data
  const paginatedData = filteredRentals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Success and Error Messages */}
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

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Search Bar */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by user, car, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
          />
        </div>
        
        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55] appearance-none"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        {/* Date Range Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="date"
              placeholder="From Date"
              value={dateRangeFilter.start}
              onChange={(e) => setDateRangeFilter(prev => ({ ...prev, start: e.target.value }))}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
            />
          </div>
          <span className="text-gray-500">to</span>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="date"
              placeholder="To Date"
              value={dateRangeFilter.end}
              min={dateRangeFilter.start}
              onChange={(e) => setDateRangeFilter(prev => ({ ...prev, end: e.target.value }))}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
            />
          </div>
        </div>
        
        {/* Clear Filters */}
        <button
          onClick={() => {
            setSearchQuery('');
            setStatusFilter('');
            setDateRangeFilter({ start: '', end: '' });
          }}
          className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>

      {/* Rentals Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55]"></div>
        </div>
      ) : filteredRentals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No rentals found</p>
          <p className="text-gray-400 mt-2">
            {rentals.length === 0 
              ? "There are no rentals for your cars yet" 
              : "Try adjusting your filters to see more results"
            }
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID/Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Car
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((rental) => {
                  const car = getCarDetails(rental.car);
                  const user = getUserDetails(rental.user);
                  
                  return (
                    <tr key={rental._id} className="hover:bg-gray-50">
                      {/* ID/Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{rental._id.substring(0, 8)}...</div>
                        <div className="text-xs text-gray-400">{formatDate(rental.createdAt)}</div>
                      </td>
                      
                      {/* Car */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {car ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{car.brand} {car.model}</div>
                            <div className="text-xs text-gray-500">{car.license_plate}</div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Unknown car</div>
                        )}
                      </td>
                      
                      {/* Customer */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.telephone_number}</div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Unknown customer</div>
                        )}
                      </td>
                      
                      {/* Period */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(rental.startDate)} - {formatDate(rental.returnDate)}
                        </div>
                        {rental.actualReturnDate && (
                          <div className="text-xs text-gray-500">
                            Returned: {formatDate(rental.actualReturnDate)}
                          </div>
                        )}
                      </td>
                      
                      {/* Price */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(rental.price)}
                        </div>
                        {rental.additionalCharges && rental.additionalCharges > 0 && (
                          <div className="text-xs text-red-500">
                            +{formatCurrency(rental.additionalCharges)}
                          </div>
                        )}
                      </td>
                      
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(rental.status)}`}
                        >
                          {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                        </span>
                      </td>
                      
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <div className="flex items-center justify-center space-x-3">
                          {/* View Details */}
                          <Link 
                            href={`/provider/rentals/${rental._id}`}
                            className="text-[#8A7D55] hover:text-[#645c40]"
                          >
                            Details
                          </Link>
                          
                          {/* Confirm Button (only for pending rentals) */}
                          {rental.status === 'pending' && (
                            <button
                              onClick={() => updateRentalStatus(rental._id, 'active')}
                              className="text-blue-600 hover:text-blue-800"
                              disabled={isLoading}
                            >
                              Confirm
                            </button>
                          )}
                          
                          {/* Complete Button (only for active rentals) */}
                          {rental.status === 'active' && (
                            <button
                              onClick={() => updateRentalStatus(rental._id, 'completed')}
                              className="text-green-600 hover:text-green-800"
                              disabled={isLoading}
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center">
                <button
                  onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                  disabled={currentPage <= 1}
                  className="px-3 py-1 rounded-md mr-2 bg-white border border-gray-300 disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1 rounded-md ml-2 bg-white border border-gray-300 disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}