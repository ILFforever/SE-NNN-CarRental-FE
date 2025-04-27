import React, { ReactNode } from "react";
import { CreditInfoCard } from "./CreditInfoCard";
import { PaymentButton } from "./PaymentButton";
import { PaymentInformationCard } from "./PaymentInformationCard";

type PaymentSideCardProps = {
  title?: string;
  userCredits: number;
  remainingAmount: number;
  processingPayment: boolean;
  onRefreshCredits: () => void;
  onPayClick: () => void;
  children?: ReactNode;
};

export const PaymentSideCard: React.FC<PaymentSideCardProps> = ({
  title = "Complete Payment",
  userCredits,
  remainingAmount,
  processingPayment,
  onRefreshCredits,
  onPayClick,
  children,
}) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 sticky top-4">
      <h2 className="text-lg font-medium mb-4 pb-3 border-b text-gray-800">
        {title}
      </h2>
      
      {/* ข้อมูลเครดิต */}
      <CreditInfoCard
        userCredits={userCredits}
        remainingAmount={remainingAmount}
        onRefresh={onRefreshCredits}
      />
      
      {/* ปุ่มชำระเงิน */}
      <PaymentButton
        userCredits={userCredits}
        remainingAmount={remainingAmount}
        processingPayment={processingPayment}
        onPayClick={onPayClick}
      />
      
      {/* ข้อมูลการชำระเงิน */}
      <PaymentInformationCard />
      
      {/* ส่วนเสริมที่อาจจะมีเพิ่มเติม */}
      {children}
    </div>
  );
};