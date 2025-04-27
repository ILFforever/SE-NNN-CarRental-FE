"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { API_BASE_URL } from "@/config/apiConfig";
import { formatDate, calculateDays } from "@/utils/dateUtils";

// Import components
import { LoadingState } from "@/components/payment/LoadingState";
import { ErrorState } from "@/components/payment/ErrorState";
import { SuccessState } from "@/components/payment/SuccessState";
import { PageHeader } from "@/components/payment/PageHeader";
import { ReservationCard } from "@/components/payment/ReservationCard";
import { PaymentBreakdown } from "@/components/payment/PaymentBreakdown";
import { PaymentSideCard } from "@/components/payment/PaymentSideCard";

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

  // ดึงข้อมูล services และ selectedServiceIds
  const selectedServiceIds = reservation.service || [];
  const allServices = reservation.allServices || [];

  // หน้าชำระเงินหลัก
  return (
    <main className="py-12 px-4 max-w-5xl mx-auto font-sans">
      {/* ส่วนหัว */}
      <PageHeader
        title="Complete Your Payment"
        backUrl="/account/reservations"
      />

      <div className="grid md:grid-cols-3 gap-8">
        {/* คอลัมน์ซ้าย: ข้อมูลการจอง */}
        <div className="md:col-span-2 space-y-6">
          {/* การ์ดข้อมูลการจอง */}
          <ReservationCard
            reservation={reservation}
            startDate={startDate}
            returnDate={returnDate}
            rentalDays={rentalDays}
            depositAmount={depositAmount}
            remainingAmount={remainingAmount}
            formatDate={formatDate}
          />

          {/* รายละเอียดค่าใช้จ่าย */}
          <PaymentBreakdown
            carRentalCost={carRentalCost}
            serviceCost={serviceCost}
            discountAmount={discountAmount}
            finalPrice={finalPrice}
            depositAmount={depositAmount}
            remainingAmount={remainingAmount}
            rentalDays={rentalDays}
            dailyRate={dailyRate}
            depositDate={formatDate(
              new Date(reservation.createdAt || Date.now())
            )}
            dueDate={formatDate(new Date())}
            services={allServices}
            selectedServiceIds={selectedServiceIds}
          />
        </div>

        {/* คอลัมน์ขวา: ข้อมูลการชำระเงิน */}
        <div className="md:col-span-1">
          <PaymentSideCard
            title="Complete Payment"
            userCredits={userCredits}
            remainingAmount={remainingAmount}
            processingPayment={processingPayment}
            onRefreshCredits={refreshUserCredits}
            onPayClick={handlePayWithCredits}
          />
        </div>
      </div>
    </main>
  );
}
