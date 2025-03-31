"use client"

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/apiConfig';
import { useSession } from 'next-auth/react';
import { ChevronDown, ChevronLeft, ChevronRight, Search, CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { Check, Trash2, Eye } from "lucide-react";
import { useRouter } from 'next/navigation';

// Type definitions
interface Car {
  _id: string;
  brand: string;
  model: string;
  license_plate: string;
  type: string;
  color: string;
  dailyRate: number;
  tier: number;
  provider_id: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  telephone_number: string;
  role: string;
}

interface Reservation {
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
  const { data: session } = useSession();
  // State variables
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRangeFilter, setDateRangeFilter] = useState<{start: string, end: string}>({
    start: '', 
    end: ''
  });
  
  // Details view
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Fetch cars and users for better display
  const [cars, setCars] = useState<{[key: string]: Car}>({});
  const [users, setUsers] = useState<{[key: string]: User}>({});
  

  // Notes for reservation actions
  const [actionNotes, setActionNotes] = useState('');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialSearchQuery = params.get('search');
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);  // Set the initial search query from the URL
    }
  }, []);
  useEffect(() => {
    let results = [...reservations];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      
      results = results.filter(reservation => {
        // Search in reservation ID
        if (reservation._id.toLowerCase().includes(query)) return true;
        
        // Search in car details
        const car = typeof reservation.car === 'string' 
          ? cars[reservation.car]
          : reservation.car as Car;
          
        if (car) {
          if (car.brand?.toLowerCase().includes(query)) return true;
          if (car.model?.toLowerCase().includes(query)) return true;
          if (car.license_plate?.toLowerCase().includes(query)) return true;
        }
        
        // Search in user details
        const user = typeof reservation.user === 'string'
          ? users[reservation.user]
          : reservation.user as User;
          
        if (user) {
          if (user.name?.toLowerCase().includes(query)) return true;
          if (user.email?.toLowerCase().includes(query)) return true;
          if (user.telephone_number?.toLowerCase().includes(query)) return true;
        }
        
        return false;
      });
    }
    
    setFilteredReservations(results);
  }, [searchQuery, statusFilter, dateRangeFilter, reservations, cars, users]);
  // Fetch all reservations
  useEffect(() => {
    const fetchReservations = async () => {
      if (!token) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        // Fetch all reservations
        const response = await fetch(`${API_BASE_URL}/rents/all`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch reservations: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          // Store all reservations
          setReservations(data.data);
          
          // Also set filtered reservations initially to all reservations
          setFilteredReservations(data.data);
          
          // Calculate total pages based on items per page
          setTotalPages(Math.ceil(data.data.length / itemsPerPage));
          
          // Collect all car and user IDs for further fetching
          const carIds = new Set<string>();
          const userIds = new Set<string>();
          
          data.data.forEach((reservation: Reservation) => {
            if (typeof reservation.car === 'string') {
              carIds.add(reservation.car);
            } else if (reservation.car && typeof reservation.car === 'object') {
              carIds.add(reservation.car._id);
            }
            
            if (typeof reservation.user === 'string') {
              userIds.add(reservation.user);
            } else if (reservation.user && typeof reservation.user === 'object') {
              userIds.add(reservation.user._id);
            }
          });
          
          // Fetch car details
          await fetchCarDetails(Array.from(carIds));
          
          // Fetch user details
          await fetchUserDetails(Array.from(userIds));
        } else {
          setFilteredReservations([]);
          throw new Error('Invalid data format received from server');
        }
      } catch (err) {
        console.error('Error fetching reservations:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch reservations');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReservations();
  }, [token, itemsPerPage]);

  // Fetch car details by IDs
  const fetchCarDetails = async (carIds: string[]) => {
    try {
      // Create a map to store car details
      const carDetailsMap: {[key: string]: Car} = {};
      
      // Fetch details for each car
      for (const carId of carIds) {
        const response = await fetch(`${API_BASE_URL}/cars/${carId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            carDetailsMap[carId] = data.data;
          }
        }
      }
      
      setCars(carDetailsMap);
    } catch (err) {
      console.error('Error fetching car details:', err);
    }
  };

  // Fetch user details by IDs
  const fetchUserDetails = async (userIds: string[]) => {
    try {
      const endpoints = [`/auth/users`, `/auth/admins`];
      const userDetailsMap: { [key: string]: User } = {};

      // Fetch both users and admins in parallel
      const responses = await Promise.all(
        endpoints.map(endpoint =>
          fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
        )
      );

      // Process responses
      for (const response of responses) {
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            data.data.forEach((user: User) => {
              userDetailsMap[user._id] = user;
            });
          }
        }
      }

      // Update state once after processing all responses
      setUsers(userDetailsMap);
    } catch (err) {
      console.error('Error fetching user details:', err);
    }
  };


  // Apply filters and search
  useEffect(() => {
    let results = [...reservations];
    
    // Apply status filter
    if (statusFilter) {
      results = results.filter(reservation => reservation.status === statusFilter);
    }
    
    // Apply date range filter
    if (dateRangeFilter.start) {
      const startDate = new Date(dateRangeFilter.start);
      results = results.filter(reservation => new Date(reservation.startDate) >= startDate);
    }
    
    if (dateRangeFilter.end) {
      const endDate = new Date(dateRangeFilter.end);
      results = results.filter(reservation => new Date(reservation.returnDate) <= endDate);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      
      results = results.filter(reservation => {
        // Search in reservation ID
        if (reservation._id.toLowerCase().includes(query)) return true;
        
        // Search in car details
        const car = typeof reservation.car === 'string' 
          ? cars[reservation.car]
          : reservation.car as Car;
          
        if (car) {
          if (car.brand?.toLowerCase().includes(query)) return true;
          if (car.model?.toLowerCase().includes(query)) return true;
          if (car.license_plate?.toLowerCase().includes(query)) return true;
        }
        
        // Search in user details
        const user = typeof reservation.user === 'string'
          ? users[reservation.user]
          : reservation.user as User;
          
        if (user) {
          if (user.name?.toLowerCase().includes(query)) return true;
          if (user.email?.toLowerCase().includes(query)) return true;
          if (user.telephone_number?.toLowerCase().includes(query)) return true;
        }
        
        return false;
      });
    }
    
    setFilteredReservations(results);
    setTotalPages(Math.ceil(results.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, statusFilter, dateRangeFilter, reservations, cars, users, itemsPerPage]);

  // Handle reservation confirmation (change from pending to active)
  const confirmReservation = async (reservationId: string) => {
    console.log("PRESSED CONFIRM")
    try {
      const response = await fetch(`${API_BASE_URL}/rents/${reservationId}/confirm`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: actionNotes })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to confirm reservation: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Reservation confirmed successfully');
        
        // Update the reservation in the state
        setReservations(prev => prev.map(res => 
          res._id === reservationId ? { ...res, status: 'active' } : res
        ));
        
        // Also update in filtered reservations
        setFilteredReservations(prev => prev.map(res => 
          res._id === reservationId ? { ...res, status: 'active' } : res
        ));
        
        // Close any open modals
        setActionNotes('');
      } else {
        throw new Error(data.message || 'Failed to confirm reservation');
      }
    } catch (err) {
      console.error('Error confirming reservation:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while confirming the reservation');
    } finally {
    }
  };

  // Handle reservation completion
  const completeReservation = async (reservationId: string) => {
    
    try {
      const response = await fetch(`${API_BASE_URL}/rents/${reservationId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: actionNotes })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to complete reservation: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Reservation completed successfully');
        
        // Update the reservation in the state
        setReservations(prev => prev.map(res => 
          res._id === reservationId ? { ...res, status: 'completed', actualReturnDate: new Date().toISOString() } : res
        ));
        
        // Also update in filtered reservations
        setFilteredReservations(prev => prev.map(res => 
          res._id === reservationId ? { ...res, status: 'completed', actualReturnDate: new Date().toISOString() } : res
        ));
        
        // Close any open modals
        setActionNotes('');
      } else {
        throw new Error(data.message || 'Failed to complete reservation');
      }
    } catch (err) {
      console.error('Error completing reservation:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while completing the reservation');
    } finally {
    }
  };
  const deleteReservation = async (reservationId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rents/${reservationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: actionNotes
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete reservation: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Reservation deleted successfully');
        
        // Remove the reservation from the state
        setReservations(prev => prev.filter(res => res._id !== reservationId));
        
        // Remove from filtered reservations
        setFilteredReservations(prev => prev.filter(res => res._id !== reservationId));
        
        // Reset action notes
        setActionNotes('');
      } else {
        throw new Error(data.message || 'Failed to delete reservation');
      }
    } catch (err) {
      console.error('Error deleting reservation:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the reservation');
    }
  };
  // Handle reservation cancellation
  const cancelReservation = async (reservationId: string) => {
    
    try {
      // For cancellation, we'll use the update endpoint since there might not be a dedicated cancel endpoint
      const response = await fetch(`${API_BASE_URL}/rents/${reservationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: 'cancelled',
          notes: actionNotes 
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to cancel reservation: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Reservation cancelled successfully');
        
        // Update the reservation in the state
        setReservations(prev => prev.map(res => 
          res._id === reservationId ? { ...res, status: 'cancelled' } : res
        ));
        
        // Also update in filtered reservations
        setFilteredReservations(prev => prev.map(res => 
          res._id === reservationId ? { ...res, status: 'cancelled' } : res
        ));
        
        // Close any open modals
        setActionNotes('');
      } else {
        throw new Error(data.message || 'Failed to cancel reservation');
      }
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while cancelling the reservation');
    } finally {
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
    // console.log(user)
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

  // Format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
  const paginatedData = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  const executeAction = (action: 'confirm' | 'complete' | 'delete' | 'cancel'| 'edit', reservation: Reservation) => {
    // Ensure the action and reservation are valid
    if (!action || !reservation) return;
  
    const reservationId = reservation._id;
  
    // Ask for user confirmation
    const isConfirmed = window.confirm(`Are you sure you want to ${action} this reservation?`);
  
    if (!isConfirmed) {
      console.log("Action canceled by the user");
      return; // Exit if the user doesn't confirm
    }
  
    console.log("Executing Action:", action, reservation); // Debugging log
  
    // Perform the action based on the input
    switch (action) {
      case 'confirm':
        confirmReservation(reservationId); // Call the appropriate function
        break;
      case 'complete':
        completeReservation(reservationId);
        break;
      case 'cancel':
        cancelReservation(reservationId);
        break;
      case 'delete':
        deleteReservation(reservationId);
        break;
        case 'edit' :
          router.push(`/account/reservations/${reservationId}`);
          break;
      default:
        console.error('Unknown action:', action);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
    {/* Success and Error Messages */}
      {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
        {error}
      </div>
    )}
     {success && (
    <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
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
        placeholder="Search by ID, car, or customer..."
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

  {/* Reservations Table */}
  {isLoading ? (
    <div className="flex justify-center items-center h-64" >
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55]"></div>
    </div>
  ) : filteredReservations.length === 0 ? (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <p className="text-gray-500 text-lg">No reservations match your criteria</p>
      <p className="text-gray-400 mt-2">Try adjusting your filters or search terms</p>
    </div>
  ) : (
    <>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200" style={{ height: 'auto' }}>
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle
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
            {paginatedData.map((reservation) => {
              const car = getCarDetails(reservation.car);
              const user = getUserDetails(reservation.user);
              
              return (
                <tr key={reservation._id} className="hover:bg-gray-50">
                   {/* Reservation ID */}
                   <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="text-gray-900 font-medium">
                          {formatDate(reservation.createdAt).split(',')[0]+formatDate(reservation.createdAt).split(',')[1]}
                        </div>
                        <div className="text-gray-500 font-medium">
                          {formatDate(reservation.createdAt).split(',')[2]}
                        </div>
                    </td>
                  
                  {/* Customer */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-500">{user.telephone_number}</div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Unknown customer</div>
                    )}
                  </td>
                  
                  {/* Vehicle */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {car ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{car.brand} {car.model}</div>
                        <div className="text-sm text-gray-500">{car.license_plate}</div>
                        <div className="text-xs text-gray-500 capitalize">{car.type} • {car.color}</div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Unknown vehicle</div>
                    )}
                  </td>
                  
                  {/* Dates */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="text-xs font-medium text-gray-500 w-12">From:</span>
                        <span>{formatDate(reservation.startDate).split(',')[0]+formatDate(reservation.startDate).split(',')[1]}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs font-medium text-gray-500 w-12">Until:</span>
                        <span>{formatDate(reservation.returnDate).split(',')[0]+formatDate(reservation.returnDate).split(',')[1]}</span>
                      </div>
                      {reservation.actualReturnDate && (
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="text-xs font-medium text-gray-500 w-12">Actual:</span>
                          <span>{formatDate(reservation.actualReturnDate).split(',')[0]+formatDate(reservation.actualReturnDate).split(',')[1]}</span>
                        </div>
                      )}
                    </div>
                  </td>
                                    
                  {/* Price */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(reservation.price)}
                    </div>
                    {reservation.additionalCharges != null && reservation.additionalCharges > 0 ? (
                      <div className="text-xs text-red-500">
                        {formatCurrency(reservation.additionalCharges)} (extra)
                      </div>
                    ) : null}
                  </td>

                  
                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(reservation.status)}`}
                    >
                      {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </span>
                  </td>
                  
                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-center items-center space-x-0.5">
                      {/* Confirm Button */}
                      <button
                        onClick={() => router.push(`/account/reservations/${reservation._id}`)}
                        className="text-[#8A7D55] hover:text-[#766b48] mr-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {/* Conditional Button for Active or Completed Reservations */}
                      <button
                        onClick={() =>
                          reservation.status === 'active'
                            ? executeAction('complete', reservation) // Call complete for active reservations
                            : executeAction('confirm', reservation) // Call confirm for other statuses
                        }
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition duration-200 mr-2 ${
                          reservation.status === 'completed' || reservation.status === 'cancelled'
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' // Greyed out when completed or cancelled
                            : reservation.status === 'active'
                            ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' // Blue for active reservations
                            : 'bg-green-100 hover:bg-green-200 text-green-700' // Green for other statuses
                        }`}
                        disabled={reservation.status === 'completed' || reservation.status === 'cancelled'} // Disable if completed or cancelled
                      >
                        <Check className="w-4 h-4" />
                      </button>
                     {/* Edit Button */}
                       <button
                          onClick={() => executeAction('edit', reservation)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full transition duration-200 bg-gray-100 hover:bg-gray-400 text-gray-700" 
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.232 5.232l3.536 3.536m-2.036-6.036L8.5 12.232V15.5h3.268l8.732-8.732m-11.5 4h2m-8 4h2m-8 4h18m-16 4h14"
                            />
                          </svg>
                        </button>

                      {/* Cancel / Delete Button */}
                        <button
                          onClick={() => executeAction(
                            (reservation.status === 'pending' || reservation.status === 'active') 
                              ? 'cancel' 
                              : 'delete', 
                            reservation
                          )}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition duration-200 ${
                            (reservation.status === 'pending' || reservation.status === 'active')
                              ? 'bg-red-100 hover:bg-red-200 text-red-700'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  )}
</div>
)}