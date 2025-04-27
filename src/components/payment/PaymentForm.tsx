import React from "react";
import { ReservationDetails } from "./ReservationDetails";
import { CreditInfo } from "./CreditInfo";
import { PaymentButton } from "./PaymentButton";
import { PaymentBreakdown } from "./PaymentBreakdown";
import { formatDate } from "@/utils/dateUtils";
import { Wallet, Calendar, Car, Tag, Clock, Info, ShieldCheck } from "lucide-react";

type PaymentFormProps = {
  reservation: any;
  userCredits: number;
  processingPayment: boolean;
  onPayWithCredits: () => void;
};

export const PaymentForm = ({
  reservation,
  userCredits,
  processingPayment,
  onPayWithCredits,
}: PaymentFormProps) => {
  const reservationPrice = reservation.finalPrice || 0;
  
  // แยกแยะข้อมูลการจองเพื่อแสดงรายละเอียดเพิ่มเติม
  const startDate = new Date(reservation.startDate);
  const returnDate = new Date(reservation.returnDate);
  
  // คำนวณจำนวนวันที่เช่า
  const rentalDays = Math.ceil((returnDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // ข้อมูลค่าใช้จ่ายต่างๆ
  const carRentalCost = reservation.price || 0;
  const serviceCost = reservation.servicePrice || 0;
  const discountAmount = reservation.discountAmount || 0;
  const depositAmount = reservationPrice * 0.1; // สมมติว่ามีเงินมัดจำ 10% ของราคารวม
  const paidAmount = reservation.depositAmount || depositAmount; // เงินที่จ่ายไปแล้ว (กรณีมีการจ่ายมัดจำ)
  const remainingAmount = reservationPrice - paidAmount; // เงินที่ต้องจ่ายเพิ่ม
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-medium mb-6 text-[#8A7D55]">
        Reservation Payment
      </h2>

      {/* ส่วนสรุปข้อมูลการจอง */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-md font-medium mb-4 flex items-center text-gray-700">
          <Info size={16} className="mr-2" />
          Reservation Overview
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ข้อมูลรถ */}
          <div className="flex items-start">
            <Car size={16} className="text-[#8A7D55] mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Vehicle</p>
              <p className="text-md">
                {typeof reservation.car === "object"
                  ? `${reservation.car.brand} ${reservation.car.model}`
                  : "Vehicle details not available"}
              </p>
              {reservation.car && reservation.car.license_plate && (
                <p className="text-xs text-gray-500">
                  License: {reservation.car.license_plate}
                </p>
              )}
            </div>
          </div>
          
          {/* ระยะเวลาเช่า */}
          <div className="flex items-start">
            <Calendar size={16} className="text-[#8A7D55] mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Rental Period</p>
              <p className="text-md">
                {formatDate(startDate)} - {formatDate(returnDate)}
              </p>
              <p className="text-xs text-gray-500">
                {rentalDays} {rentalDays === 1 ? 'day' : 'days'} rental
              </p>
            </div>
          </div>
          
          {/* เวลารับ-คืนรถ */}
          <div className="flex items-start">
            <Clock size={16} className="text-[#8A7D55] mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Pickup/Return Time</p>
              <p className="text-md">
                {reservation.pickupTime || 'N/A'} / {reservation.returnTime || 'N/A'}
              </p>
            </div>
          </div>
          
          {/* บริการเพิ่มเติม */}
          <div className="flex items-start">
            <Tag size={16} className="text-[#8A7D55] mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Additional Services</p>
              <p className="text-md">
                {reservation.service && reservation.service.length > 0 
                  ? `${reservation.service.length} services selected` 
                  : 'No additional services'}
              </p>
              {serviceCost > 0 && (
                <p className="text-xs text-gray-500">
                  Total: ${serviceCost.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ข้อมูลรายละเอียดค่าใช้จ่าย */}
      <div className="mb-6">
        <PaymentBreakdown
          carRentalCost={carRentalCost}
          serviceCost={serviceCost}
          discountAmount={discountAmount}
          finalPrice={reservationPrice}
          depositAmount={paidAmount}
          remainingAmount={remainingAmount}
          rentalDays={rentalDays}
          dailyRate={reservation.car && reservation.car.dailyRate ? reservation.car.dailyRate : carRentalCost / rentalDays}
        />
      </div>

      {/* ข้อมูลเครดิตและยอดคงเหลือ */}
      <div className="mb-6">
        <CreditInfo 
          userCredits={userCredits} 
          reservationPrice={remainingAmount} 
        />
      </div>

      {/* นโยบายการชำระเงินและการคืนเงิน */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="text-md font-medium mb-2 flex items-center text-blue-700">
          <ShieldCheck size={16} className="mr-2" />
          Payment & Refund Policy
        </h3>
        <ul className="text-sm text-blue-800 space-y-2 pl-6 list-disc">
          <li>Full payment is required to complete the reservation.</li>
          <li>10% deposit has already been paid to secure this booking.</li>
          <li>Cancellations made 48 hours before pickup time receive a full refund.</li>
          <li>Cancellations made less than 48 hours before pickup time are subject to a 50% fee.</li>
          <li>No-shows or late cancellations are non-refundable.</li>
        </ul>
      </div>

      {/* ปุ่มชำระเงิน */}
      <PaymentButton
        userCredits={userCredits}
        reservationPrice={remainingAmount}
        processingPayment={processingPayment}
        onPayClick={onPayWithCredits}
        buttonText={`Pay Remaining Balance (${remainingAmount.toFixed(2)})`}
      />

      {/* หมายเหตุการชำระเงิน */}
      <p className="mt-4 text-xs text-gray-500 text-center">
        By completing this payment, you agree to our rental terms and conditions.
        Reservation ID: {reservation._id}
      </p>
    </div>
  );
};