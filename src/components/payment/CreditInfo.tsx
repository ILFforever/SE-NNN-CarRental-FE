import React from "react";

type CreditInfoProps = {
  userCredits: number;
  reservationPrice: number;
  onRefreshCredits?: () => void;
};

export const CreditInfo = ({ 
  userCredits, 
  reservationPrice,
  onRefreshCredits 
}: CreditInfoProps) => {
  const remainingCredits = userCredits - reservationPrice;
  const hasEnoughCredits = userCredits >= reservationPrice;
  
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden mb-5">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <span className="font-medium text-gray-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8A7D55] mr-2">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
          </svg>
          Your Credits
        </span>
        
        {onRefreshCredits && (
          <button 
            onClick={onRefreshCredits}
            className="text-xs flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M21 2v6h-6"/>
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
              <path d="M3 22v-6h6"/>
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
            Refresh
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Available Balance:</span>
            <span className="font-medium text-[#8A7D55]">${userCredits.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Amount to Pay:</span>
            <span className="font-medium text-gray-800">${reservationPrice.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-gray-600">Remaining After Payment:</span>
            <span className={`font-medium ${
              hasEnoughCredits ? 'text-green-600' : 'text-red-600'
            }`}>${remainingCredits.toFixed(2)}</span>
          </div>
        </div>

        {/* Status message */}
        <div className={`mt-4 p-3 rounded-md flex items-start ${
          hasEnoughCredits 
            ? 'bg-green-50 border border-green-100 text-green-700' 
            : 'bg-red-50 border border-red-100 text-red-700'
        }`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 flex-shrink-0 mt-0.5">
            {hasEnoughCredits 
              ? <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/> 
              : <circle cx="12" cy="12" r="10"/>}
            {hasEnoughCredits 
              ? <polyline points="22 4 12 14.01 9 11.01"/> 
              : <path d="M12 8v4"/>}
            {!hasEnoughCredits && <path d="M12 16h.01"/>}
          </svg>
          <div>
            <p className="font-medium text-sm">
              {hasEnoughCredits 
                ? "You have sufficient credits" 
                : "Insufficient credits"}
            </p>
            {!hasEnoughCredits && (
              <p className="text-xs mt-1">
                Add ${(reservationPrice - userCredits).toFixed(2)} more credits.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
