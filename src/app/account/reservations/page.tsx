"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { API_BASE_URL } from "@/config/apiConfig";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import RatingPopup from "@/components/reservations/RatingPopup";
import {
  Info,
  Calendar,
  CreditCard,
  Tag,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

export default function MyReservationsPage() {
  useScrollToTop();
  const router = useRouter();
  const { data: session } = useSession();
  const [reservations, setReservations] = useState<Rent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cars, setCars] = useState<{ [key: string]: Car }>({});
  const [activeRatingReservation, setActiveRatingReservation] = useState<
    string | null
  >(null);
  const [providers, setProviders] = useState<{ [key: string]: Provider }>({});

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(11);

  // Handler for when a rating is selected (or cancelled)
  const handleRatingSelect = async (rating: number | null) => {
    if (rating !== null && activeRatingReservation) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/rents/${activeRatingReservation}/rate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.user?.token}`,
            },
            body: JSON.stringify({
              rating: rating,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to submit rating");
        }

        console.log(
          `Rating ${rating} submitted for reservation ${activeRatingReservation}`
        );

        // Update the reservations state so that isRated is updated.
        setReservations((prevReservations) =>
          prevReservations.map((reservation) =>
            reservation._id === activeRatingReservation
              ? { ...reservation, isRated: true }
              : reservation
          )
        );
      } catch (error) {
        console.error("Error submitting rating:", error);
      }
    } else {
      console.log(
        `Rating cancelled for reservation ${activeRatingReservation}`
      );
    }
    setActiveRatingReservation(null);
  };

  useEffect(() => {
    const fetchReservations = async () => {
      if (!session?.user?.token) {
        setError("Authentication required. Please sign in.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Use the rents endpoint to fetch user's rentals
        const response = await fetch(
          `${API_BASE_URL}/rents?page=${currentPage}&limit=${itemsPerPage}`,
          {
            headers: {
              Authorization: `Bearer ${session.user.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch reservations: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          // Calculate total pages based on totalCount and itemsPerPage
          const calculatedTotalPages = Math.ceil((data.totalCount || data.count || 0) / itemsPerPage);
        
          console.log('Pagination Data:', {
            calculatedTotalPages: calculatedTotalPages,
            totalCount: data.totalCount || data.count || 0,
            currentPage: currentPage,
            itemsPerPage: itemsPerPage,
            dataLength: data.data.length,
            hasNextPage: data.pagination?.next ? true : false
          });
        
          setTotalPages(calculatedTotalPages);
          setTotalCount(data.totalCount || data.count || 0);
          setReservations(data.data);

          // Extract car IDs to fetch car details
          const carIds = new Set<string>();
          data.data.forEach((rental: Rent) => {
            if (typeof rental.car === "string") {
              carIds.add(rental.car);
            } else if (rental.car && typeof rental.car === "object") {
              carIds.add(rental.car._id);
            }
          });

          // Fetch car details for each rental
          await fetchCarDetails(Array.from(carIds), session.user.token);
        } else {
          setReservations([]);
        }
      } catch (err) {
        console.error("Error fetching reservations:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch reservations"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [session, currentPage, itemsPerPage]);

  // Fetch car details by IDs
  const fetchCarDetails = async (carIds: string[], token: string) => {
    try {
      // Create a map to store car details
      const carDetailsMap: { [key: string]: Car } = {};

      // Fetch details for each car
      for (const carId of carIds) {
        const response = await fetch(`${API_BASE_URL}/cars/${carId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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
      console.error("Error fetching car details:", err);
    }
  };

  // After you have fetched car details and set them in state, add this effect:
  useEffect(() => {
    if (!session?.user?.token) return;

    // Collect unique provider IDs from your cars
    const providerIds = new Set<string>();
    Object.values(cars).forEach((car) => {
      if (car.provider_id) {
        providerIds.add(car.provider_id);
      }
    });

    // For each provider id not already fetched, fetch the provider details
    providerIds.forEach(async (providerId) => {
      if (!providers[providerId]) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/Car_Provider/${providerId}`,
            {
              headers: { Authorization: `Bearer ${session.user.token}` },
            }
          );
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              setProviders((prev) => ({
                ...prev,
                [providerId]: data.data,
              }));
            }
          }
        } catch (error) {
          console.error(
            "Error fetching provider details for",
            providerId,
            error
          );
        }
      }
    });
  }, [cars, providers, session?.user?.token]);

  // Helper function to get car details
  const getCarDetails = (car: string | Car): Car | undefined => {
    if (typeof car === "string") {
      return cars[car];
    }
    return car as Car;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge classes
  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate the final price to display, considering all components
  const getDisplayPrice = (reservation: Rent): number => {
    // If finalPrice is directly available, use it
    if (reservation.finalPrice !== undefined) {
      return reservation.finalPrice;
    }

    // Otherwise calculate it from components
    const basePrice = reservation.price || 0;
    const servicePrice = reservation.servicePrice || 0;
    const discountAmount = reservation.discountAmount || 0;
    const additionalCharges = reservation.additionalCharges.lateFee || 0;

    return basePrice + servicePrice - discountAmount + additionalCharges;
  };

  if (!session) {
    return (
      <div className="py-10 px-4 max-w-4xl mx-auto text-center">
        <div className="bg-yellow-100 p-6 rounded-lg text-yellow-800">
          <p className="mb-4">Please sign in to view your reservations.</p>
          <Link
            href="/signin?callbackUrl=/account/reservations"
            className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const PaginationControls = () => {
    if (totalPages <= 1 || reservations.length === 0) {
      return null;
    }

    // Calculate the range of items being shown
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalCount);

    return (
      <div className="mt-6 flex flex-col items-center space-y-3">
        {/* Results count */}
        <div className="text-sm text-gray-600">
          Showing {startIndex} to {endIndex} of {totalCount} reservations
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center space-x-2">
          {/* First page button */}
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Go to first page"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Previous page button */}
          <button
            onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Page number buttons */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded-md ${
                currentPage === page
                  ? "bg-[#8A7D55] text-white font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next page button */}
          <button
            onClick={() =>
              setCurrentPage((page) => Math.min(page + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Go to next page"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Last page button */}
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Go to last page"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Page size selector */}
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-600">Items per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              const newItemsPerPage = parseInt(e.target.value);
              setItemsPerPage(newItemsPerPage);
              setCurrentPage(1); // Reset to first page when changing page size
            }}
            className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#8A7D55]"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    );
  };

  const handleEditReservation = (reservationId: string): void => {
    // Navigate to the reservation details page with edit mode parameter
    router.push(`/account/reservations/${reservationId}?editDetails=true`);
  };
  
  const handlePayReservation = (reservationId: string): void => {
    // นำทางไปยังหน้าชำระเงิน พร้อมส่ง reservationId เพื่อใช้ในการระบุการจองที่ต้องชำระ
    router.push(`/payment?reservationId=${reservationId}`);
  };
  
  return (
    <main className="py-6 md:py-10 px-4 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-medium font-serif">
          My Reservations
        </h1>
  
        <Link
          href="/catalog"
          className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors w-full sm:w-auto text-center"
        >
          Make New Reservation
        </Link>
      </div>
  
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55]"></div>
          <span className="ml-3">Loading your reservations...</span>
        </div>
      ) : error ? (
        <div className="bg-red-100 p-4 rounded-lg text-red-800">
          <p>{error}</p>
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-white p-6 md:p-10 rounded-lg shadow-md text-center">
          <p className="text-gray-600 mb-6">
            You don't have any reservations yet.
          </p>
          <Link
            href="/catalog"
            className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
          >
            Browse Available Vehicles
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop version (table) - hidden on small screens */}
          <div className="hidden md:block w-fit bg-white rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Vehicle
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Reservation Period
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Action
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservations.map((reservation) => {
                  const car = getCarDetails(reservation.car);
                  const finalPrice = getDisplayPrice(reservation);
                  return (
                    <tr key={reservation._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {car
                            ? `${car.brand} ${car.model}`
                            : "Car not in system"}
                        </div>
                        {car && (
                          <div className="text-xs text-gray-500">
                            {car.license_plate}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(reservation.startDate)} -{" "}
                          {formatDate(reservation.returnDate)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Booked on {formatDate(reservation.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(finalPrice)}
                        </div>
                        {/* Show discounts or additional charges if present */}
                        {reservation.discountAmount ? (
                          <div className="text-xs text-green-600">
                            Includes{" "}
                            {formatCurrency(reservation.discountAmount)}{" "}
                            discount
                          </div>
                        ) : null}
                        {reservation.additionalCharges ? (
                          <div className="text-xs text-amber-600">
                            Includes{" "}
                            {formatCurrency(
                              reservation.additionalCharges.lateFee
                            )}{" "}
                            additional fees
                          </div>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(
                            reservation.status
                          )}`}
                        >
                          {reservation.status.charAt(0).toUpperCase() +
                            reservation.status.slice(1)}
                        </span>
                      </td>
                      {/* Actions column */}
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        {reservation.status === 'pending' ? (
                          <button
                            onClick={() => handleEditReservation(reservation._id)}
                            className="text-[#8A7D55] hover:underline font-medium cursor-pointer"
                            type="button"
                          >
                            Edit Reservation
                          </button>
                        ) : reservation.status === 'unpaid' ? (
                          <button
                            onClick={() => handlePayReservation(reservation._id)}
                            className="text-[#8A7D55] hover:underline font-medium cursor-pointer"
                            type="button"
                          >
                            Pay Now
                          </button>
                        ) : (!reservation.isRated && reservation.status === "completed") ? (
                          <button
                            onClick={() => setActiveRatingReservation(reservation._id)}
                            className="text-[#8A7D55] hover:underline font-medium cursor-pointer"
                            type="button"
                          >
                            <div className="flex items-center justify-center space-x-1" id="Review-Provider">
                              <span>Review Provider</span>
                              {/* Info Icon with tooltip */}
                              {/* {car?.provider_id && (
                                <div className="relative group">
                                  <Info className="w-3 h-3 text-gray-500" />
                                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {providers[car.provider_id]?.name ||
                                      car.provider_id}
                                  </span>
                                </div>
                              )} */}
                            </div>
                          </button>
                        ) : (
                          <div className="flex items-center justify-center space-x-1">
                            <span className="text-gray-400 font-medium">
                              {reservation.isRated && reservation.status === "completed"
                                ? "Already Reviewed"
                                : ""}
                            </span>
                            {/* Info Icon with tooltip */}
                            {car?.provider_id && reservation.status === "completed" && (
                              <div className="relative group">
                                <Info className="w-3 h-3 text-gray-500" />
                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                  {providers[car.provider_id]?.name ||
                                    car.provider_id}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      {/* Details link */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Link
                          href={`/account/reservations/${reservation._id}`}
                          className="text-[#8A7D55] hover:underline font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
  
          {/* Mobile version (cards) - shown only on small screens */}
          <div className="md:hidden space-y-4">
            {reservations.map((reservation) => {
              const car = getCarDetails(reservation.car);
              const finalPrice = getDisplayPrice(reservation);
              return (
                <div
                  key={reservation._id}
                  className="bg-white rounded-lg shadow-md p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {car
                          ? `${car.brand} ${car.model}`
                          : "Car not in system"}
                      </h3>
                      {car && (
                        <p className="text-xs text-gray-500">
                          {car.license_plate}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusBadgeClasses(
                        reservation.status
                      )}`}
                    >
                      {reservation.status.charAt(0).toUpperCase() +
                        reservation.status.slice(1)}
                    </span>
                  </div>
  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      <p>
                        {formatDate(reservation.startDate)} -{" "}
                        {formatDate(reservation.returnDate)}
                      </p>
                    </div>
  
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                      <div>
                        <p className="font-medium">
                          {formatCurrency(finalPrice)}
                        </p>
                        {reservation.discountAmount ? (
                          <p className="text-xs text-green-600">
                            Includes{" "}
                            {formatCurrency(reservation.discountAmount)}{" "}
                            discount
                          </p>
                        ) : null}
                        {reservation.additionalCharges ? (
                          <p className="text-xs text-amber-600">
                            Includes{" "}
                            {formatCurrency(
                              reservation.additionalCharges.lateFee
                            )}{" "}
                            fees
                          </p>
                        ) : null}
                      </div>
                    </div>
  
                    {/* Provider info section */}
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-gray-500" />
                      {car?.provider_id && (
                        <div className="text-sm">
                          <span className="text-gray-700">Provider: </span>
                          <span className="font-medium">
                            {providers[car.provider_id]?.name || "Provider"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
  
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
                    {reservation.status === 'pending' ? (
                      <button
                        onClick={() => handleEditReservation(reservation._id)}
                        className="text-[#8A7D55] font-medium"
                        type="button"
                      >
                        Edit Reservation
                      </button>
                    ) : reservation.status === 'unpaid' ? (
                      <button
                        onClick={() => handlePayReservation(reservation._id)}
                        className="text-[#8A7D55] font-medium"
                        type="button"
                      >
                        Pay Now
                      </button>
                    ) : (!reservation.isRated && reservation.status === "completed") ? (
                      <button
                        onClick={() => setActiveRatingReservation(reservation._id)}
                        className="text-[#8A7D55] font-medium"
                        type="button"
                      >
                        Review Provider
                      </button>
                    ) : (
                      <span className="text-gray-400 font-medium">
                        {reservation.isRated && reservation.status === "completed"
                          ? "Already Reviewed"
                          : ""}
                      </span>
                    )}
  
                    <Link
                      href={`/account/reservations/${reservation._id}`}
                      className="flex items-center text-[#8A7D55] font-medium"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Pagination Controls */}
          <div className="mt-6 flex flex-col items-center space-y-3">
            {/* Results count */}
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}{" "}
              reservations
            </div>
  
            {/* Pagination buttons */}
            <div className="flex items-center space-x-2">
              {/* First page button */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Go to first page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
  
              {/* Previous page button */}
              <button
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Go to previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
  
              {/* Page number buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page
                        ? "bg-[#8A7D55] text-white font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
  
              {/* Next page button */}
              <button
                onClick={() =>
                  setCurrentPage((page) => Math.min(page + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-2 py-1 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Go to next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
  
              {/* Last page button */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Go to last page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
          {/* Render the rating popup if a reservation is active for rating */}
          {activeRatingReservation && (
            <RatingPopup onSelect={handleRatingSelect} />
          )}
        </>
      )}
    </main>
  );
}
