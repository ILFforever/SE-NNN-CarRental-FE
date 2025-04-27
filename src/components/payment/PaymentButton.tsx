import React from "react";

type PaymentButtonProps = {
  userCredits: number;
  reservationPrice: number;
  processingPayment: boolean;
  onPayClick: () => void;
  buttonText?: string;
};

export const PaymentButton = ({
  userCredits,
  reservationPrice,
  processingPayment,
  onPayClick,
  buttonText = "Pay Now with Credits"
}: PaymentButtonProps) => {
  const insufficientCredits = userCredits < reservationPrice;
  
  return (
    <div>
      <button
        onClick={onPayClick}
        disabled={processingPayment || insufficientCredits}
        className={`w-full py-3.5 px-4 rounded-lg font-medium flex items-center justify-center transition-all duration-300 ${
          userCredits >= reservationPrice && !processingPayment
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
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <rect width="20" height="14" x="2" y="5" rx="2"/>
              <line x1="2" x2="22" y1="10" y2="10"/>
            </svg>
            {insufficientCredits 
              ? "Insufficient Credits" 
              : buttonText}
          </>
        )}
      </button>

      {insufficientCredits && (
        <div className="mt-4 bg-red-50 p-4 rounded-lg text-sm text-red-700 flex items-start border border-red-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4"/>
            <path d="M12 16h.01"/>
          </svg>
          <div>
            <p className="font-medium">You need more credits</p>
            <p className="mt-1">
              Add ${(reservationPrice - userCredits).toFixed(2)} more credits to complete this payment.
            </p>
            <div className="mt-3 flex space-x-2">
              <a 
                href="/account/credits/add" 
                className="px-3 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-700 rounded-md text-xs font-medium transition-colors"
              >
                Add Credits
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};