// src/app/provider/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/apiConfig';
import Link from 'next/link';
import { useScrollToTop } from '@/hooks/useScrollToTop';

interface CarStats {
  total: number;
  available: number;
  rented: number;
  carTypes: Record<string, number>;
}

interface RentalStats {
  total: number;
  active: number;
  pending: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

interface RecentRental {
  _id: string;
  car: {
    _id: string;
    brand: string;
    model: string;
    license_plate: string;
  };
  user: {
    _id: string;
    name: string;
  };
  startDate: string;
  returnDate: string;
  status: string;
  price: number;
}

export default function ProviderDashboardPage() {
  useScrollToTop();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [carStats, setCarStats] = useState<CarStats>({
    total: 0,
    available: 0,
    rented: 0,
    carTypes: {}
  });
  
  const [rentalStats, setRentalStats] = useState<RentalStats>({
    total: 0,
    active: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  });
  
  const [recentRentals, setRecentRentals] = useState<RecentRental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not logged in as provider
  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.userType !== 'provider')) {
      router.push('/');
    }
  }, [session, status, router]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user?.token) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Get provider ID safely from session
        const providerId = session.user.id || session.user._id || '';
        
        // Fetch cars using provider_id query parameter
        const carsResponse = await fetch(`${API_BASE_URL}/cars?provider_id=${providerId}&limit=100`, {
          headers: {
            'Authorization': `Bearer ${session.user.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!carsResponse.ok) {
          throw new Error('Failed to fetch car data');
        }
        
        const carsData = await carsResponse.json();
        
        if (!carsData.success || !Array.isArray(carsData.data)) {
          throw new Error('Invalid car data format');
        }
        
        // Process car statistics
        const cars = carsData.data;
        const types: Record<string, number> = {};
        
        let availableCount = 0;
        let rentedCount = 0;
        
        cars.forEach((car: any) => {
          // Count car types
          const type = car.type || 'unknown';
          types[type] = (types[type] || 0) + 1;
          
          // Count availability
          if (car.available) {
            availableCount++;
          } else {
            rentedCount++;
          }
        });
        
        setCarStats({
          total: cars.length,
          available: availableCount,
          rented: rentedCount,
          carTypes: types
        });
        
        // Get all car IDs to fetch their rentals
        const carIds = cars.map((car: any) => car._id);
        
        // If no cars, don't try to fetch rentals
        if (carIds.length === 0) {
          setRentalStats({
            total: 0,
            active: 0,
            pending: 0,
            completed: 0,
            cancelled: 0,
            totalRevenue: 0,
            monthlyRevenue: 0
          });
          setRecentRentals([]);
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
        
        // Calculate rental statistics
        let activeCnt = 0;
        let pendingCnt = 0;
        let completedCnt = 0;
        let cancelledCnt = 0;
        let totalRevenue = 0;
        let monthlyRevenue = 0;
        
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        
        allRentals.forEach(rental => {
          // Count by status
          switch(rental.status) {
            case 'active':
              activeCnt++;
              break;
            case 'pending':
              pendingCnt++;
              break;
            case 'completed':
              completedCnt++;
              break;
            case 'cancelled':
              cancelledCnt++;
              break;
          }
          
          // Total revenue (only from completed rentals)
          if (rental.status === 'completed') {
            totalRevenue += rental.price || 0;
            totalRevenue += rental.additionalCharges || 0;
            
            // Monthly revenue
            const rentalDate = new Date(rental.returnDate);
            if (rentalDate >= firstDayOfMonth) {
              monthlyRevenue += rental.price || 0;
              monthlyRevenue += rental.additionalCharges || 0;
            }
          }
        });
        
        setRentalStats({
          total: allRentals.length,
          active: activeCnt,
          pending: pendingCnt,
          completed: completedCnt,
          cancelled: cancelledCnt,
          totalRevenue,
          monthlyRevenue
        });
        
        // Get recent rentals (sorted by date, active first, then pending)
        const sorted = [...allRentals].sort((a, b) => {
          // First by status priority
          const statusPriority = { active: 0, pending: 1, completed: 2, cancelled: 3 };
          const statusDiff = statusPriority[a.status as keyof typeof statusPriority] - statusPriority[b.status as keyof typeof statusPriority];
          if (statusDiff !== 0) return statusDiff;
          
          // Then by date (recent first)
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        });
        
        setRecentRentals(sorted.slice(0, 5)); // Take first 5
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (session?.user?.token) {
      fetchDashboardData();
    }
  }, [session, router]);

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

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
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

  if (status === 'loading' || isLoading) {
    return (
      <main className="py-10 px-4 max-w-6xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55]"></div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="py-10 px-4 max-w-6xl mx-auto">
        <div className="bg-red-100 p-4 rounded-lg text-red-800">
          <h2 className="text-xl font-medium mb-2">Error</h2>
          <p>{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-[#8A7D55] text-white rounded-md"
            onClick={() => router.refresh()}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="py-10 px-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-medium mb-6">Provider Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm">Total Cars</h2>
          <p className="text-3xl font-bold">{carStats.total}</p>
          <div className="mt-2 flex justify-between">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {carStats.available} Available
            </span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {carStats.rented} Rented
            </span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm">Active Rentals</h2>
          <p className="text-3xl font-bold">{rentalStats.active}</p>
          <div className="mt-2 flex justify-between">
            <Link 
              href="/provider/manageRentals?status=active"
              className="text-xs text-[#8A7D55] hover:underline"
            >
              View active rentals
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm">Pending Rentals</h2>
          <p className="text-3xl font-bold">{rentalStats.pending}</p>
          <div className="mt-2 flex justify-between">
            <Link 
              href="/provider/manageRentals?status=pending"
              className="text-xs text-[#8A7D55] hover:underline"
            >
              View pending rentals
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm">Monthly Revenue</h2>
          <p className="text-3xl font-bold">{formatCurrency(rentalStats.monthlyRevenue)}</p>
          <div className="mt-2 flex justify-between">
            <span className="text-xs text-gray-500">
              Total: {formatCurrency(rentalStats.totalRevenue)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-2">
          {/* Car Type Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-medium mb-4">Car Types</h2>
            
            {Object.keys(carStats.carTypes).length === 0 ? (
              <p className="text-gray-500 text-center py-4">No cars in your fleet yet</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(carStats.carTypes).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="capitalize">{type}</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                        <div 
                          className="bg-[#8A7D55] h-2.5 rounded-full" 
                          style={{ width: `${(count / carStats.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Rental Statistics */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-medium mb-4">Rental Stats</h2>
            
            {rentalStats.total === 0 ? (
              <p className="text-gray-500 text-center py-4">No rental data available</p>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Completed Rentals</span>
                  <span className="font-medium">{rentalStats.completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cancellation Rate</span>
                  <span className="font-medium">
                    {rentalStats.total ? ((rentalStats.cancelled / rentalStats.total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Revenue</span>
                  <span className="font-medium">{formatCurrency(rentalStats.totalRevenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Current Month Revenue</span>
                  <span className="font-medium">{formatCurrency(rentalStats.monthlyRevenue)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Recent Rentals */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Recent Rentals</h2>
              <Link 
                href="/provider/manageRentals"
                className="text-sm text-[#8A7D55] hover:underline"
              >
                View All
              </Link>
            </div>
            
            {recentRentals.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No rentals found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Car
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dates
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentRentals.map((rental) => (
                      <tr key={rental._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {typeof rental.car === 'object' ? `${rental.car.brand} ${rental.car.model}` : 'Unknown Car'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {typeof rental.car === 'object' ? rental.car.license_plate : ''}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {typeof rental.user === 'object' ? rental.user.name : 'Unknown User'}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(rental.startDate)} - {formatDate(rental.returnDate)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(rental.status)}`}>
                            {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(rental.price)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h2 className="text-xl font-medium mb-4">Quick Actions</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                href="/provider/manageCars"
                className="border border-[#8A7D55] rounded-lg p-4 flex items-center hover:bg-[#f8f5f0] transition-colors"
              >
                <div className="bg-[#f8f5f0] p-3 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#8A7D55]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Add New Car</h3>
                  <p className="text-sm text-gray-500">Expand your car fleet</p>
                </div>
              </Link>
              
              <Link 
                href="/provider/manageRentals?status=pending"
                className="border border-[#8A7D55] rounded-lg p-4 flex items-center hover:bg-[#f8f5f0] transition-colors"
              >
                <div className="bg-[#f8f5f0] p-3 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#8A7D55]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Pending Rentals</h3>
                  <p className="text-sm text-gray-500">Review {rentalStats.pending} rentals</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Need Help Section */}
      <div className="mt-8 bg-[#f8f5f0] p-6 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div>
            <h2 className="text-xl font-medium mb-2">Need Help Managing Your Fleet?</h2>
            <p className="text-gray-600">Contact our provider support team for assistance.</p>
          </div>
          <button 
            onClick={() => window.location.href = 'mailto:support@cedtrentals.com'}
            className="mt-4 sm:mt-0 px-6 py-3 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>
    </main>
  );
}