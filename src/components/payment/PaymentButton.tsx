import React from "react";

type PaymentButtonProps = {
  userCredits: number;
  remainingAmount: number;
  processingPayment: boolean;
  onPayClick: () => void;
};

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  userCredits,
  remainingAmount,
  processingPayment,
  onPayClick,
}) => {
  const hasEnoughCredits = userCredits >= remainingAmount;
  
  return (
    <button
      onClick={onPayClick}
      disabled={processingPayment || !hasEnoughCredits}
      className={`w-full py-3.5 px-4 rounded-lg font-medium flex items-center justify-center transition-all duration-300 ${
        hasEnoughCredits && !processingPayment
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
          {!hasEnoughCredits
            ? "Insufficient Credits"
            : `Pay $${remainingAmount.toFixed(2)}`}
        </>
      )}
    </button>
  );
};