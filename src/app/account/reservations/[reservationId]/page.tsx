'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { getTierName } from '@/utils/tierUtils';
import { API_BASE_URL } from '@/config/apiConfig';

export default function ReservationDetailsPage({ 
  params 
}: { 
  params: { reservationId: string } 
}) {
  const router = useRouter();
  const { data: session } = useSession();
  
  // State for reservation data and loading
  const [reservation, setReservation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


 // State for editing notes
 const [isEditingNotes, setIsEditingNotes] = useState(false);
 const [editedNotes, setEditedNotes] = useState('');


  // Fetch reservation details
  useEffect(() => {
    async function fetchReservationDetails() {
      // Check if session exists
      if (!session?.user?.token) {
        router.push('/signin?callbackUrl=/account/reservations');
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/rents/${params.reservationId}`, {
          headers: {
            'Authorization': `Bearer ${session.user.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch reservation details');
        }

        const data = await response.json();
        setReservation(data.data);
      } catch (err) {
        console.error('Error fetching reservation details:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchReservationDetails();
  }, [params.reservationId, session?.user?.token, router]);
  const handleUpdateNotes = async () => {
    if (!session?.user?.token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/rents/${params.reservationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: editedNotes })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update notes');
      }

      // Update local state
      setReservation((prev: any) => ({
        ...prev,
        notes: editedNotes
      }));
      setIsEditingNotes(false);
    } catch (err) {
      console.error('Error updating notes:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancelling reservation
  const handleCancelReservation = async () => {
    if (!session?.user?.token) return;

    if (!confirm('Are you sure you want to cancel this reservation?')) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/rents/${params.reservationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'cancelled' })
      } );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel reservation');
      }






      const getcar = await fetch(`${API_BASE_URL}/rents/${params.reservationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.user.token}`,
          'Content-Type': 'application/json'
        }
      } );
      if (!getcar.ok) {
        throw new Error('Failed to fetch car ID');
      }
  
      const getCarData = await getcar.json();
      const carId = getCarData.carId;
  
      console.log(`Car ID for reservation ${params.reservationId}: ${carId}`);



        const upcar = await fetch(`${API_BASE_URL}/cars/${carId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ available: true })
        } );
  
        if (!upcar.ok) {
          const errorData = await upcar.json();
          throw new Error(errorData.message || 'Failed to cancel reservation');
        }






      // Update local state
      setReservation((prev: any) => ({
        ...prev,
        status: 'cancelled'
      }));

      // Redirect or show success message
      router.push('/account/reservations');
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };




  // Calculate rental period
  const calculateRentalPeriod = (startDate: string, returnDate: string) => {
    const start = new Date(startDate);
    const end = new Date(returnDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    return days;
  };

  // Calculate late days and fees
  const calculateLateFees = (reservation: any) => {
    if (!reservation.actualReturnDate) return { daysLate: 0, lateFeePerDay: 0, totalLateFee: 0 };

    const expectedReturnDate = new Date(reservation.returnDate);
    const actualReturnDate = new Date(reservation.actualReturnDate);
    
    const daysLate = Math.max(0, Math.ceil((actualReturnDate.getTime() - expectedReturnDate.getTime()) / (1000 * 3600 * 24)));
    const lateFeePerDay = reservation.car.tier ? (reservation.car.tier + 1) * 500 : 500;
    const totalLateFee = daysLate * lateFeePerDay;

    return { daysLate, lateFeePerDay, totalLateFee };
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  // Loading state
  if (isLoading) {
    return (
      <main className="py-10 px-4 max-w-4xl mx-auto text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55] inline-block"></div>
        <p className="mt-4">Loading reservation details...</p>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="py-10 px-4 max-w-4xl mx-auto">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
          <button 
            onClick={() => router.refresh()}
            className="mt-4 px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48]"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // No reservation data
  if (!reservation) {
    return (
      <main className="py-10 px-4 max-w-4xl mx-auto">
        <div className="bg-white p-10 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-medium text-red-600 mb-4">Reservation Not Found</h2>
          <p className="text-gray-600 mb-6">The requested reservation could not be retrieved.</p>
          <Link 
            href="/account/reservations" 
            className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
          >
            Back to Reservations
          </Link>
        </div>
      </main>
    );
  }

  // Calculate late fees
  const { daysLate, lateFeePerDay, totalLateFee } = calculateLateFees(reservation);

  return (
    <main className="py-10 px-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-medium">Reservation Details</h1>
        <Link 
          href="/account/reservations" 
          className="px-4 py-2 border border-[#8A7D55] text-[#8A7D55] rounded-md hover:bg-[#f8f5f0] transition-colors"
        >
          Back to Reservations
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Vehicle Details */}
        <div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="relative h-64">
              <Image 
                src="/img/banner.jpg" 
                alt={`${reservation.car.brand} ${reservation.car.model}`} 
                fill 
                className="object-cover"
              />
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-serif font-medium text-[#8A7D55]">
                  {reservation.car.brand} {reservation.car.model}
                </h2>
                <p className="text-gray-600">
                  {reservation.car.type} | {reservation.car.color}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">License Plate</p>
                  <p className="font-medium">{reservation.car.license_plate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Daily Rate</p>
                  <p className="font-medium">{formatCurrency(reservation.car.dailyRate)}/day</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Vehicle Tier</p>
                  <p className="font-medium">
                    {getTierName(reservation.car.tier)} (Tier {reservation.car.tier})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reservation Status</p>
                  <span 
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(reservation.status)}`}
                  >
                    {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reservation Details */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-3">Booking Information</h3>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-600">Reservation ID:</span>
                  <span className="font-medium">{reservation._id}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Pickup Date:</span>
                  <span className="font-medium">{formatDate(reservation.startDate)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Expected Return Date:</span>
                  <span className="font-medium">{formatDate(reservation.returnDate)}</span>
                </p>
                {reservation.actualReturnDate && (
                  <p className="flex justify-between">
                    <span className="text-gray-600">Actual Return Date:</span>
                    <span className="font-medium">{formatDate(reservation.actualReturnDate)}</span>
                  </p>
                )}
                <p className="flex justify-between">
                  <span className="text-gray-600">Rental Period:</span>
                  <span className="font-medium">
                    {calculateRentalPeriod(reservation.startDate, reservation.returnDate)} days
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-3">Pricing Details</h3>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-600">Daily Rate:</span>
                  <span>{formatCurrency(reservation.car.dailyRate)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Total Rental Cost:</span>
                  <span>{formatCurrency(reservation.price)}</span>
                </p>
                
                {/* Late Fees Section */}
                {daysLate > 0 && (
                  <>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Days Late:</span>
                      <span className="text-red-600">{daysLate} days</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Late Fee per Day:</span>
                      <span>{formatCurrency(lateFeePerDay)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Total Late Fee:</span>
                      <span className="text-red-600">{formatCurrency(totalLateFee)}</span>
                    </p>
                  </>
                )}
                
                <p className="flex justify-between">
                  <span className="text-gray-600">Additional Charges:</span>
                  {reservation.additionalCharges && reservation.additionalCharges > 0 ? (
                    <span className="text-red-600">{formatCurrency(reservation.additionalCharges)}</span>
                  ) : (
                    <span className="text-green-600">No extra charges</span>
                  )}
                </p>
                
                <p className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total Paid:</span>
                  <span className="text-[#8A7D55]">
                    {formatCurrency(
                      reservation.price + 
                      (reservation.additionalCharges || 0) + 
                      (daysLate > 0 ? totalLateFee : 0)
                    )}
                  </span>
                </p>
              </div>
            </div>

            {reservation.notes && (
              <div>
                <h3 className="text-xl font-medium mb-3">Additional Notes</h3>
                <p className="text-gray-600 italic">{reservation.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
  <h3 className="text-xl font-medium">Additional Notes</h3>
  {/* Only allow editing for pending reservations or admin users */}
          {(reservation.status === 'pending' || session?.user?.role === 'admin') && (
            <div className="flex space-x-2">
              {!isEditingNotes ? (
                <button 
                  onClick={() => {
                    setEditedNotes(reservation.notes || '');
                    setIsEditingNotes(true);
                  }}
                  className="text-[#8A7D55] font-medium hover:text-[#645c40] transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Notes
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button 
                    onClick={handleUpdateNotes}
                    disabled={isLoading}
                    className="bg-[#8A7D55] text-white px-4 py-1.5 rounded-md hover:bg-[#766b48] disabled:opacity-50 transition-colors duration-200 flex items-center shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save
                  </button>
                  <button 
                    onClick={() => setIsEditingNotes(false)}
                    className="border border-gray-300 text-gray-700 px-4 py-1.5 rounded-md hover:bg-gray-100 transition-colors duration-200 flex items-center shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {isEditingNotes ? (
          <textarea
            value={editedNotes}
            onChange={(e) => setEditedNotes(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3 min-h-[120px] focus:border-[#8A7D55] focus:ring-1 focus:ring-[#8A7D55] focus:outline-none transition-colors duration-200"
            placeholder="Enter additional notes..."
          />
        ) : (
          <p className={`text-gray-600 p-2 ${!reservation.notes && 'italic'}`}>
            {reservation.notes || 'No additional notes'}
          </p>
        )}
        </div>

        {/* Action Buttons for Pending Reservation or Admin */}
        {(reservation.status === 'pending' || session?.user?.role === 'admin') && (
          <div className="mt-8 flex justify-center space-x-4">
            <button 
              onClick={handleCancelReservation}
              disabled={isLoading}
              className="px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 shadow-md hover:shadow-lg flex items-center justify-center transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cancelling...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel Reservation
                </>
              )}
            </button>
          </div>
        )}
        </main>
  );
}