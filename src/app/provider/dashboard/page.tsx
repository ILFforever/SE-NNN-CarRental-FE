'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { API_BASE_URL } from '@/config/apiConfig';
import { RefreshCw, Plus, ClipboardList } from 'lucide-react';
import Link from 'next/link';

interface DashboardData {
  totalCars: number;
  availableCars: number;
  rentedCars: number;
  carTypes: Array<{ type: string; count: number }>;
  activeRentals: {
    count: number;
    list: Array<{
      id: string;
      startDate: string;
      returnDate: string;
      customerName: string;
      car: string;
    }>;
  };
  pendingRentals: {
    count: number;
    list: Array<{
      id: string;
      startDate: string;
      returnDate: string;
      customerName: string;
      car: string;
    }>;
  };
  monthlyRevenue: {
    amount: number;
    count: number;
  };
  recentRentals: Array<{
    id: string;
    status: string;
    startDate: string;
    returnDate: string;
    price: number;
    customer: {
      name: string;
      email: string;
    };
    car: {
      brand: string;
      model: string;
      licensePlate: string;
    };
  }>;
  rentalStats: {
    totalRentals: number;
    totalRevenue: number;
    avgDuration: number;
    avgRentalValue: number;
  } | null;
}

export default function ProviderDashboard() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (refreshing) {
        setRefreshing(true);
      }

      const response = await fetch(`${API_BASE_URL}/Car_Provider/dashboard`, {
        headers: {
          'Authorization': `Bearer ${session?.user.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error fetching dashboard data: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setDashboardData(result.data);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (session?.user?.token) {
      fetchDashboardData();
    }
  }, [session]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55]"></div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">
        <h3 className="font-medium text-lg mb-2">Error Loading Dashboard</h3>
        <p>{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-3 bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-medium text-gray-800">Provider Dashboard</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Cars Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-gray-600 text-sm mb-1">Total Cars</h2>
          <p className="text-4xl font-bold mb-4">{dashboardData?.totalCars || 0}</p>
          <div className="flex gap-4">
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {dashboardData?.availableCars || 0} Available
            </span>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {dashboardData?.rentedCars || 0} Rented
            </span>
          </div>
        </div>

        {/* Active Rentals */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-gray-600 text-sm mb-1">Active Rentals</h2>
          <p className="text-4xl font-bold mb-4">{dashboardData?.activeRentals?.count || 0}</p>
          <Link href="/provider/reservations?status=active" className="text-[#8A7D55] text-sm hover:underline">
            View active rentals
          </Link>
        </div>

        {/* Pending Rentals */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-gray-600 text-sm mb-1">Pending Rentals</h2>
          <p className="text-4xl font-bold mb-4">{dashboardData?.pendingRentals?.count || 0}</p>
          <Link href="/provider/reservations?status=pending" className="text-[#8A7D55] text-sm hover:underline">
            View pending rentals
          </Link>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-gray-600 text-sm mb-1">Monthly Revenue</h2>
          <p className="text-4xl font-bold mb-4">
            ${dashboardData?.monthlyRevenue?.amount?.toFixed(2) || '0.00'}
          </p>
          <div className="text-gray-500 text-sm">
            Total: ${dashboardData?.monthlyRevenue?.amount?.toFixed(2) || '0.00'}
          </div>
        </div>
      </div>

      {/* Secondary Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Car Types */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-medium mb-4">Car Types</h2>
          <div className="space-y-4">
            {dashboardData?.carTypes && dashboardData.carTypes.length > 0 ? (
              dashboardData.carTypes.map((type) => (
                <div key={type.type} className="flex items-center justify-between">
                  <span>{type.type}</span>
                  <div className="flex items-center gap-2 flex-1 mx-4">
                    <div className="bg-[#8A7D55] h-2 rounded" style={{ width: `${(type.count / dashboardData.totalCars) * 100}%` }}></div>
                    <div className="bg-gray-200 h-2 rounded flex-grow"></div>
                  </div>
                  <span className="text-gray-700">{type.count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No car data available</p>
            )}
          </div>
        </div>

        {/* Recent Rentals */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Recent Rentals</h2>
            <Link href="/provider/rentals" className="text-[#8A7D55] text-sm hover:underline">
              View All
            </Link>
          </div>
          
          {dashboardData?.recentRentals && dashboardData.recentRentals.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentRentals.map((rental) => (
                <div key={rental.id} className="border-b pb-3 last:border-0">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{rental.car.brand} {rental.car.model}</span>
                    <span className="text-sm text-gray-500">{formatDate(rental.startDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{rental.customer.name}</span>
                    <span 
                      className={`px-2 py-0.5 rounded-full text-xs font-medium
                        ${rental.status === 'active' ? 'bg-green-100 text-green-800' : 
                          rental.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-blue-100 text-blue-800'}`}
                    >
                      {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic text-center py-8">No rentals found</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rental Stats */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-medium mb-4">Rental Stats</h2>
          {dashboardData?.rentalStats ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-gray-500 text-sm">Total Rentals</h3>
                <p className="text-2xl font-bold">{dashboardData.rentalStats.totalRentals}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-gray-500 text-sm">Total Revenue</h3>
                <p className="text-2xl font-bold">${dashboardData.rentalStats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-gray-500 text-sm">Avg. Duration (days)</h3>
                <p className="text-2xl font-bold">{dashboardData.rentalStats.avgDuration}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-gray-500 text-sm">Avg. Value</h3>
                <p className="text-2xl font-bold">${dashboardData.rentalStats.avgRentalValue.toFixed(2)}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic text-center py-8">No rental data available</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-medium mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/provider/cars/add" className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#f8f5f0] flex items-center justify-center">
                <Plus className="h-5 w-5 text-[#8A7D55]" />
              </div>
              <div>
                <h3 className="font-medium">Add New Car</h3>
                <p className="text-sm text-gray-500">Expand your car fleet</p>
              </div>
            </Link>
            
            <Link href="/provider/reservations?status=pending" className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#f8f5f0] flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-[#8A7D55]" />
              </div>
              <div>
                <h3 className="font-medium">Pending Rentals</h3>
                <p className="text-sm text-gray-500">Review {dashboardData?.pendingRentals?.count || 0} rentals</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-medium">Need Help Managing Your Fleet?</h2>
            <p className="text-gray-600 mt-1">Contact our provider support team for assistance.</p>
          </div>
          <Link
            href="/provider/support"
            className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}