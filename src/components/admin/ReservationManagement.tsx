'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Edit, Trash2, Eye, Check, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/apiConfig';
import ConfirmationModal from '@/components/util/ConfirmationModal';

// Type definitions
interface Car {
  _id: string;
  license_plate: string;
  brand: string;
  model: string;
  type: string;
  color: string;
  available: boolean;
  dailyRate: number;
  tier: number;
  provider_id: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  telephone_number: string;
}

interface Provider {
  _id: string;
  name: string;
  email: string;
  telephone_number?: string;
  address?: string;
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

interface ReservationManagementProps {
  token: string;
}

export default function ReservationManagement({ token }: ReservationManagementProps) {
  const router = useRouter();
  
  // State variables
  const [rentals, setRentals] = useState<Rent[]>([]);
  const [filteredRentals, setFilteredRentals] = useState<Rent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState<{start: string, end: string}>({
    start: '', 
    end: ''
  });
  //modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'confirm' | 'complete' | 'cancel' | 'delete'>('confirm');
  const [selectedRental, setSelectedRental] = useState<any>(null);

  // Storage for cars, users, and providers data
  const [cars, setCars] = useState<{[key: string]: Car}>({});
  const [users, setUsers] = useState<{[key: string]: User}>({});
  const [providers, setProviders] = useState<{[key: string]: Provider}>({});
  
  // Fetch all rentals data
  useEffect(() => {
    const fetchRentals = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // Fetch all rentals
        const response = await fetch(`${API_BASE_URL}/rents/all`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch rentals: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error('Failed to fetch rental data');
        }
        
        // Process the rental data
        const rentals = data.data;
        
        // Create maps for cars and users to avoid refetching
        const carMap: {[key: string]: Car} = {};
        const userMap: {[key: string]: User} = {};
        const providerMap: {[key: string]: Provider} = {};
        
        // Extract car and user details from populated data
        rentals.forEach((rental: any) => {
          if (rental.car && typeof rental.car === 'object') {
            carMap[rental.car._id] = rental.car;
          }
          
          if (rental.user && typeof rental.user === 'object') {
            userMap[rental.user._id] = rental.user;
          }
        });
        
        // Also fetch providers to have their names for reference
        const providersResponse = await fetch(`${API_BASE_URL}/Car_Provider`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (providersResponse.ok) {
          const providersData = await providersResponse.json();
          
          if (providersData.success && Array.isArray(providersData.data)) {
            providersData.data.forEach((provider: Provider) => {
              providerMap[provider._id] = provider;
            });
          }
        }
        
        // Set state with the fetched data
        setCars(carMap);
        setUsers(userMap);
        setProviders(providerMap);
        setRentals(rentals);
        setFilteredRentals(rentals);
        setTotalPages(Math.ceil(rentals.length / itemsPerPage));
        
      } catch (err) {
        console.error('Error fetching rentals:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch rental data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRentals();
  }, [token, itemsPerPage]);

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

  // Handle rental update (Accept/Complete/Cancel)
  const updateRentalStatus = async (rentalId: string, action: 'confirm' | 'complete' | 'cancel') => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Determine the endpoint based on the action
      let endpoint;
      let newStatus: 'pending' | 'active' | 'completed' | 'cancelled';
      
      switch (action) {
        case 'confirm':
          endpoint = `${API_BASE_URL}/rents/${rentalId}/confirm`;
          newStatus = 'active';
          break;
        case 'complete':
          endpoint = `${API_BASE_URL}/rents/${rentalId}/complete`;
          newStatus = 'completed';
          break;
        case 'cancel':
          endpoint = `${API_BASE_URL}/rents/${rentalId}/cancel`;
          newStatus = 'cancelled';
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          notes: `${action.charAt(0).toUpperCase() + action.slice(1)}ed by admin on ${new Date().toLocaleString()}` 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} rental`);
      }
      
      // Update rentals list with proper typing
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
      
      setSuccess(`Rental ${action}ed successfully`);
  
      // If completed or cancelled, update car availability
      if (action === 'complete' || action === 'cancel') {
        // Find the rental and its car
        const rental = rentals.find(r => r._id === rentalId);
        if (rental) {
          const carId = typeof rental.car === 'string' ? rental.car : rental.car._id;
          
          // Update the car in our local state
          setCars(prev => {
            const updatedCars = { ...prev };
            if (updatedCars[carId]) {
              updatedCars[carId] = { 
                ...updatedCars[carId], 
                available: true 
              };
            }
            return updatedCars;
          });
        }
      }
      
    } catch (error) {
      console.error(`Error updating rental status:`, error);
      setError(error instanceof Error ? error.message : `An error occurred while updating the rental`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle rental deletion - Admin only
  const handleDeleteRental = async (rentalId: string) => {
    if (!confirm("Are you sure you want to permanently delete this rental? This action cannot be undone.")) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/rents/${rentalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete rental');
      }
      
      // Remove from both the main and filtered lists
      setRentals(prev => prev.filter(rental => rental._id !== rentalId));
      setFilteredRentals(prev => prev.filter(rental => rental._id !== rentalId));
      
      setSuccess('Rental deleted successfully');
    } catch (error) {
      console.error('Error deleting rental:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while deleting the rental');
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

  // Get provider name by car
  const getProviderName = (car: Car | undefined): string => {
    if (!car || !car.provider_id) return 'Unknown Provider';
    
    const provider = providers[car.provider_id];
    return provider ? provider.name : 'Unknown Provider';
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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

  // Execute actions on rentals
const executeAction = (action: 'confirm' | 'complete' | 'cancel' | 'view' | 'edit' | 'delete', rental: Rent) => {
  if (!rental) return;
  
  const rentalId = rental._id;
  
  // Direct navigation actions - no confirmation needed
  if (action === 'view') {
    router.push(`/admin/reservations/${rentalId}`);
    return;
  }
  
  if (action === 'edit') {
    router.push(`/account/reservations/${rentalId}`);
    return;
  }
  
  // For actions that need confirmation, show the modal
  if (['confirm', 'complete', 'cancel', 'delete'].includes(action)) {
    setSelectedRental(rental);
    setModalAction(action as 'confirm' | 'complete' | 'cancel' | 'delete');
    setIsModalOpen(true);
    return;
  }
  
  // Fallback for unknown actions
  console.error('Unknown action:', action);
};

  const getModalDetails = () => {
    if (!selectedRental) return null;
    
    const car = typeof selectedRental.car === 'string' 
      ? cars[selectedRental.car]
      : selectedRental.car;
    
    return {
      carDetails: car ? {
        brand: car.brand,
        model: car.model,
        licensePlate: car.license_plate
      } : undefined,
      dates: {
        startDate: selectedRental.startDate,
        returnDate: selectedRental.returnDate
      }
    };
  };
  
  const modalDetails = getModalDetails();

  const processConfirmedAction = async () => {
    if (!selectedRental) return;
    
    const rentalId = selectedRental._id;
    setError('');
    setSuccess('');
    
    try {
      switch (modalAction) {
        case 'confirm':
          await updateRentalStatus(rentalId, 'confirm');
          setSuccess(`Reservation #${rentalId.slice(-6)} confirmed successfully`);
          break;
        case 'complete':
          await updateRentalStatus(rentalId, 'complete');
          setSuccess(`Reservation #${rentalId.slice(-6)} marked as completed`);
          break;
        case 'cancel':
          await updateRentalStatus(rentalId, 'cancel');
          setSuccess(`Reservation #${rentalId.slice(-6)} has been cancelled`);
          break;
        case 'delete':
          await handleDeleteRental(rentalId);
          setSuccess(`Reservation #${rentalId.slice(-6)} has been permanently deleted`);
          break;
        default:
          throw new Error(`Unknown action type: ${modalAction}`);
      }
      
      // Refresh the data if needed
      if (modalAction === 'delete') {
        // Remove from lists immediately for better UX
        setRentals(prev => prev.filter(r => r._id !== rentalId));
        setFilteredRentals(prev => prev.filter(r => r._id !== rentalId));
      }
      
    } catch (err) {
      console.error(`Error processing ${modalAction} action:`, err);
      setError(err instanceof Error 
        ? `Failed to ${modalAction} reservation: ${err.message}` 
        : `An unexpected error occurred while trying to ${modalAction} the reservation`
      );
    }
  };

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by ID, car, or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:border-[#8A7D55]"
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
            <ChevronDown size={16} className="text-gray-400" />
          </div>
        </div>
        
        {/* Date Range Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="date"
              placeholder="From Date"
              value={dateRangeFilter.start}
              onChange={(e) => setDateRangeFilter(prev => ({ ...prev, start: e.target.value }))}
              className="pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
            />
          </div>
          <span className="text-gray-500">to</span>
          <div className="relative">
            <input
              type="date"
              placeholder="To Date"
              value={dateRangeFilter.end}
              min={dateRangeFilter.start}
              onChange={(e) => setDateRangeFilter(prev => ({ ...prev, end: e.target.value }))}
              className="pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
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
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
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
          <p className="text-gray-500 text-lg">No reservations found</p>
          <p className="text-gray-400 mt-2">
            {rentals.length === 0 
              ? "There are no reservations in the system yet" 
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
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
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
                  const providerName = getProviderName(car);
                  
                  return (
                    <tr key={rental._id} className="hover:bg-gray-50">
                      {/* Date Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          {formatDate(rental.createdAt)}
                        </div>
                      </td>
                      
                      {/* Customer Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                            <div className="text-xs text-gray-500">{user.telephone_number}</div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Unknown customer</div>
                        )}
                      </td>
                      
                      {/* Vehicle Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {car ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {car.brand} {car.model}
                            </div>
                            <div className="text-xs text-gray-500">
                              {car.license_plate}
                            </div>
                            <div className="text-xs text-gray-500">
                              {car.type.charAt(0).toUpperCase() + car.type.slice(1)} • {car.color}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Unknown vehicle</div>
                        )}
                      </td>
                      
                      {/* Provider Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{providerName}</div>
                      </td>
                      
                      {/* Dates Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-xs flex">
                            <span className="text-xs font-medium text-gray-900 w-12">From:</span>
                            <span>{formatDate(rental.startDate)}</span>
                          </div>
                          <div className="text-xs flex">
                            <span className="text-xs font-medium text-gray-900 w-12">Until:</span>
                            <span>{formatDate(rental.returnDate)}</span>
                          </div>
                          {rental.actualReturnDate && (
                            <div className="text-xs flex">
                              <span className="text-xs font-medium text-gray-900 w-12">Actual:</span>
                              <span>{formatDate(rental.actualReturnDate)}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* Price Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(rental.price)}
                        </div>
                        {rental.additionalCharges != null && rental.additionalCharges > 0 ? (
                          <div className="text-xs text-red-500">
                            {formatCurrency(rental.additionalCharges)} (extra)
                          </div>
                        ) : null}
                      </td>
                      
                      {/* Status Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(rental.status)}`}
                        >
                          {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                        </span>
                      </td>
                      {/* Actions Column */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center space-x-2">
                            {/* View Button */}
                            <button
                              onClick={() => executeAction('view', rental)}
                              className="p-1 text-gray-500 hover:text-gray-700"
                              title="View details"
                            >
                              <Eye size={16} />
                            </button>
                            
                            {/* Check/Confirm Button - Active for pending */}
                            {rental.status === 'pending' && (
                              <button
                                onClick={() => executeAction('confirm', rental)}
                                className="p-1 text-green-500 hover:text-green-700"
                                title="Confirm reservation"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            
                            {/* Complete Button - Active for active */}
                            {rental.status === 'active' && (
                              <button
                                onClick={() => executeAction('complete', rental)}
                                className="p-1 text-blue-500 hover:text-blue-700"
                                title="Complete reservation"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            
                            {/* Disabled Check - For completed/cancelled */}
                            {(rental.status === 'completed' || rental.status === 'cancelled') && (
                              <button
                                disabled
                                className="p-1 text-gray-300 cursor-not-allowed"
                                title={`Rental is ${rental.status}`}
                              >
                                <Check size={16} />
                              </button>
                            )}
                            
                            {/* Edit Button */}
                            <button
                              onClick={() => executeAction('edit', rental)}
                              className="p-1 text-blue-500 hover:text-blue-700"
                              title="Edit reservation"
                            >
                              <Edit size={16} />
                            </button>
                            
                            {/* Delete/Cancel Button */}
                            {rental.status === 'pending' || rental.status === 'active' ? (
                              <button
                                onClick={() => executeAction('cancel', rental)}
                                className="p-1 text-red-500 hover:text-red-700"
                                title="Cancel reservation"
                              >
                                <Trash2 size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => executeAction('delete', rental)}
                                className="p-1 text-red-500 hover:text-red-700"
                                title="Delete reservation permanently"
                              >
                                <Trash2 size={16} />
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
      {/* Confirmation Modal */}
      {selectedRental && (
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={processConfirmedAction}
          actionType={modalAction}
          rentalId={selectedRental._id}
          carDetails={modalDetails?.carDetails}
          dates={modalDetails?.dates}
        />
      )}
    </div>
  );
}