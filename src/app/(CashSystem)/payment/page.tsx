"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { API_BASE_URL } from "@/config/apiConfig";
import { LoadingState } from "@/components/payment/LoadingState";
import { ErrorState } from "@/components/payment/ErrorState";
import { SuccessState } from "@/components/payment/SuccessState";
import { PageHeader } from "@/components/payment/PageHeader";
import { PaymentForm } from "@/components/payment/PaymentForm";
import { ReservationDetails } from "@/components/payment/ReservationDetails";
import { PaymentBreakdown } from "@/components/payment/PaymentBreakdown";
import { CreditInfo } from "@/components/payment/CreditInfo";
import { PaymentButton } from "@/components/payment/PaymentButton";
import { formatDate, calculateDays } from "@/utils/dateUtils";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [reservation, setReservation] = useState<any>(null);
  const [userCredits, setUserCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // รับ reservationId จาก URL query parameters
  const reservationId = searchParams.get("reservationId");

  // ดึงข้อมูลการจองและเครดิตของผู้ใช้
  useEffect(() => {
    async function fetchData() {
      if (!reservationId || !session?.user?.token) {
        setError("Reservation ID not found or you're not logged in");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // ดึงข้อมูลการจอง
        const reservationResponse = await fetch(
          `${API_BASE_URL}/rents/${reservationId}`,
          {
            headers: {
              Authorization: `Bearer ${session.user.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!reservationResponse.ok) {
          throw new Error("Failed to fetch reservation details");
        }

        const reservationData = await reservationResponse.json();

        if (!reservationData.success || !reservationData.data) {
          throw new Error("Invalid reservation data");
        }

        setReservation(reservationData.data);

        // ดึงข้อมูลเครดิตของผู้ใช้
        const userResponse = await fetch(`${API_BASE_URL}/auth/curuser`, {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user details");
        }

        const userData = await userResponse.json();

        if (!userData.success || !userData.data) {
          throw new Error("Invalid user data");
        }

        // ตั้งค่าเครดิตของผู้ใช้
        setUserCredits(userData.data.credits || 0);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.token) {
      fetchData();
    }
  }, [reservationId, session]);

  // ฟังก์ชันรีเฟรชข้อมูลเครดิตของผู้ใช้
  const refreshUserCredits = async () => {
    if (!session?.user?.token) {
      setError("Session expired. Please log in again.");
      return;
    }

    try {
      const userResponse = await fetch(`${API_BASE_URL}/auth/curuser`, {
        headers: {
          Authorization: `Bearer ${session.user.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to refresh credit data");
      }

      const userData = await userResponse.json();

      if (!userData.success || !userData.data) {
        throw new Error("Invalid user data");
      }

      setUserCredits(userData.data.credits || 0);
    } catch (err) {
      console.error("Error refreshing credit data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to refresh credit data"
      );
    }
  };

  // ฟังก์ชันชำระเงินด้วยเครดิต
  const handlePayWithCredits = async () => {
    if (!session?.user?.token || !reservation) {
      setError("Session expired or reservation not found");
      return;
    }

    setProcessingPayment(true);
    setError(null);

    try {
      // เรียกใช้ API เพื่อจ่ายด้วยเครดิต
      const response = await fetch(
        `${API_BASE_URL}/credits/pay-rental/${reservation._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Payment failed");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Payment failed");
      }

      // อัพเดทเครดิตคงเหลือในสถานะ
      setUserCredits(data.data.remainingCredits);

      // แสดงข้อความสำเร็จ
      setSuccess(true);

      // นำทางกลับไปยังหน้ารายการจองหลังจากชำระเงินสำเร็จ
      setTimeout(() => {
        router.push("/account/reservations");
      }, 3000);
    } catch (err) {
      console.error("Payment error:", err);
      setError(
        err instanceof Error ? err.message : "Payment processing failed"
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  // แสดง loading
  if (loading) {
    return <LoadingState />;
  }

  // แสดงข้อความข้อผิดพลาด
  if (error) {
    return <ErrorState error={error} />;
  }

  // แสดงข้อความเมื่อชำระเงินสำเร็จ
  if (success) {
    return <SuccessState />;
  }

  // คำนวณข้อมูลที่จำเป็นสำหรับหน้าการชำระเงิน
  if (!reservation) {
    return <ErrorState error="Reservation data not available" />;
  }

  // แปลงวันที่เป็น Date objects
  const startDate = new Date(reservation.startDate);
  const returnDate = new Date(reservation.returnDate);

  // คำนวณจำนวนวันที่เช่า
  const rentalDays = calculateDays(startDate, returnDate);

  // ข้อมูลค่าใช้จ่ายต่างๆ
  const carRentalCost = reservation.price || 0;
  const serviceCost = reservation.servicePrice || 0;
  const discountAmount = reservation.discountAmount || 0;
  const finalPrice = reservation.finalPrice || 0;
  const depositAmount = finalPrice * 0.1; // สมมติว่ามีเงินมัดจำ 10% ของราคารวม
  const remainingAmount = finalPrice - depositAmount; // เงินที่ต้องจ่ายเพิ่ม
  const dailyRate =
    reservation.car && reservation.car.dailyRate
      ? reservation.car.dailyRate
      : carRentalCost / rentalDays;

  // หน้าชำระเงินหลัก
  // หน้าชำระเงินหลัก
  return (
    <main className="py-12 px-4 max-w-5xl mx-auto font-sans">
      {/* ส่วนหัว */}
      <div className="flex items-center mb-8">
        <a
          href="/account/reservations"
          className="mr-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </a>
        <h1 className="text-2xl font-medium text-gray-800">
          Complete Your Payment
        </h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* คอลัมน์ซ้าย: ข้อมูลการจอง */}
        <div className="md:col-span-2 space-y-6">
          {/* การ์ดข้อมูลการจอง */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-medium mb-5 text-gray-800 border-b pb-3">
              Reservation Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              {/* ข้อมูลรถ */}
              <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                <div className="mr-4 p-2 bg-[#8A7D55] bg-opacity-10 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#8A7D55]"
                  >
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.2 1 12 1 13v3c0 .6.4 1 1 1h2" />
                    <circle cx="7" cy="17" r="2" />
                    <path d="M9 17h6" />
                    <circle cx="17" cy="17" r="2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Vehicle
                  </h3>
                  <p className="text-base text-gray-800">
                    {typeof reservation.car === "object"
                      ? `${reservation.car.brand} ${reservation.car.model}`
                      : "Vehicle details not available"}
                  </p>
                  {reservation.car && reservation.car.tier && (
                    <p className="text-xs text-gray-500 mt-1">
                      {["Economy", "Standard", "Premium", "Luxury"][
                        reservation.car.tier
                      ] || "Standard"}{" "}
                      Class
                    </p>
                  )}
                </div>
              </div>

              {/* ระยะเวลาเช่า */}
              <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                <div className="mr-4 p-2 bg-[#8A7D55] bg-opacity-10 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#8A7D55]"
                  >
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Rental Period
                  </h3>
                  <p className="text-base text-gray-800">
                    {formatDate(startDate)} - {formatDate(returnDate)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {rentalDays} {rentalDays === 1 ? "day" : "days"} rental
                  </p>
                </div>
              </div>

              {/* เวลารับ-คืนรถ */}
              <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                <div className="mr-4 p-2 bg-[#8A7D55] bg-opacity-10 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#8A7D55]"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Pickup/Return Time
                  </h3>
                  <p className="text-base text-gray-800">
                    {reservation.pickupTime || "N/A"} /{" "}
                    {reservation.returnTime || "N/A"}
                  </p>
                </div>
              </div>

              {/* สถานะการจอง */}
              <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                <div className="mr-4 p-2 bg-[#8A7D55] bg-opacity-10 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#8A7D55]"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Reservation Status
                  </h3>
                  <p className="text-base text-gray-800">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Awaiting Payment
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ID: {reservation._id.substring(0, 8)}...
                  </p>
                </div>
              </div>
            </div>

            {/* หมายเหตุ */}
            <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-700 border border-blue-100">
              <div className="flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-500 mr-2 flex-shrink-0 mt-0.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <p>
                  A 10% deposit (${depositAmount.toFixed(2)}) has already been
                  charged. The remaining balance (${remainingAmount.toFixed(2)})
                  is due now.
                </p>
              </div>
            </div>
          </div>

          {/* รายละเอียดค่าใช้จ่าย */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#8A7D55] mr-2"
              >
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
              </svg>
              <h3 className="font-medium text-gray-700">Payment Breakdown</h3>
            </div>

            <div className="p-5">
              <div className="space-y-4">
                {/* Car Rental Cost */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-gray-600">Car Rental:</span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      ${dailyRate.toFixed(2)} × {rentalDays} days
                    </p>
                  </div>
                  <span className="font-medium text-gray-800">
                    ${carRentalCost.toFixed(2)}
                  </span>
                </div>

                {/* Additional Services */}
                {serviceCost > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Additional Services:</span>
                    <span className="font-medium text-gray-800">
                      ${serviceCost.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Subtotal */}
                <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-200">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-800">
                    ${(carRentalCost + serviceCost).toFixed(2)}
                  </span>
                </div>

                {/* Discount */}
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Discount:</span>
                    <span className="font-medium">
                      -${discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-gray-700 font-medium">Total Cost:</span>
                  <span className="text-lg font-semibold text-[#8A7D55]">
                    ${finalPrice.toFixed(2)}
                  </span>
                </div>

                {/* Payment Status */}
                <div className="bg-gray-50 p-4 rounded-lg mt-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-700">
                      Payment Status
                    </h4>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Partially Paid
                    </span>
                  </div>

                  {/* Deposit Already Paid */}
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm text-gray-600">
                        Deposit Paid:
                      </span>
                    </div>
                    <span className="font-medium text-green-600">
                      ${depositAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* Remaining Balance */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
                      <span className="text-sm text-gray-600">
                        Remaining Balance:
                      </span>
                    </div>
                    <span className="font-semibold text-orange-600">
                      ${remainingAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* คอลัมน์ขวา: ข้อมูลการชำระเงิน */}
        <div className="md:col-span-1">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 sticky top-4">
            <h2 className="text-lg font-medium mb-4 pb-3 border-b text-gray-800">
              Complete Payment
            </h2>

            {/* ข้อมูลเครดิต */}
            <div className="rounded-lg border border-gray-200 overflow-hidden mb-5">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <span className="font-medium text-gray-700 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#8A7D55] mr-2"
                  >
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                  </svg>
                  Your Credits
                </span>

                <button
                  onClick={refreshUserCredits}
                  className="text-xs flex items-center text-blue-600 hover:text-blue-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
                  >
                    <path d="M21 2v6h-6" />
                    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                    <path d="M3 22v-6h6" />
                    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                  </svg>
                  Refresh
                </button>
              </div>

              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Available Balance:</span>
                    <span className="font-medium text-[#8A7D55]">
                      ${userCredits.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amount to Pay:</span>
                    <span className="font-medium text-gray-800">
                      ${remainingAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-gray-600">
                      Remaining After Payment:
                    </span>
                    <span
                      className={`font-medium ${
                        userCredits >= remainingAmount
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ${(userCredits - remainingAmount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Status message */}
                <div
                  className={`mt-4 p-3 rounded-md flex items-start ${
                    userCredits >= remainingAmount
                      ? "bg-green-50 border border-green-100 text-green-700"
                      : "bg-red-50 border border-red-100 text-red-700"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 flex-shrink-0 mt-0.5"
                  >
                    {userCredits >= remainingAmount ? (
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    ) : (
                      <circle cx="12" cy="12" r="10" />
                    )}
                    {userCredits >= remainingAmount ? (
                      <polyline points="22 4 12 14.01 9 11.01" />
                    ) : (
                      <path d="M12 8v4" />
                    )}
                    {userCredits < remainingAmount && <path d="M12 16h.01" />}
                  </svg>
                  <div>
                    <p className="font-medium text-sm">
                      {userCredits >= remainingAmount
                        ? "You have sufficient credits"
                        : "Insufficient credits"}
                    </p>
                    {userCredits < remainingAmount && (
                      <p className="text-xs mt-1">
                        Add ${(remainingAmount - userCredits).toFixed(2)} more
                        credits.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ปุ่มชำระเงิน */}
            <button
              onClick={handlePayWithCredits}
              disabled={processingPayment || userCredits < remainingAmount}
              className={`w-full py-3.5 px-4 rounded-lg font-medium flex items-center justify-center transition-all duration-300 ${
                userCredits >= remainingAmount && !processingPayment
                  ? "bg-gradient-to-r from-[#8A7D55] to-[#9D8E62] text-white hover:shadow-md"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {processingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                  {userCredits < remainingAmount
                    ? "Insufficient Credits"
                    : `Pay $${remainingAmount.toFixed(2)}`}
                </>
              )}
            </button>

            {/* ข้อมูลการชำระเงิน */}
            <div className="mt-5 rounded-lg bg-gray-50 p-4 text-sm text-gray-600 border border-gray-200">
              <h3 className="font-medium text-gray-700 mb-2">
                Payment Information
              </h3>
              <ul className="space-y-2 text-xs">
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-500 mr-2 mt-0.5"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>Payment is secure and processed instantly</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-500 mr-2 mt-0.5"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                  <span>Cancellations within 48 hours: 50% refund</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-500 mr-2 mt-0.5"
                  >
                    <path d="M9 11V6a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v0" />
                    <path d="M5 5a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v6" />
                    <path d="M13 5a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v6" />
                    <path d="M17 7v7" />
                    <path d="M17 15a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-3" />
                  </svg>
                  <span>By completing payment, you agree to our terms</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
