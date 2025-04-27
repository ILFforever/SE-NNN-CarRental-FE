import React from "react";

type CreditStatusMessageProps = {
  userCredits: number;
  remainingAmount: number;
};

export const CreditStatusMessage: React.FC<CreditStatusMessageProps> = ({
  userCredits,
  remainingAmount,
}) => {
  const hasEnoughCredits = userCredits >= remainingAmount;
  
  return (
    <div
      className={`mt-4 p-3 rounded-md flex items-start ${
        hasEnoughCredits
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
        {hasEnoughCredits ? (
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        ) : (
          <circle cx="12" cy="12" r="10" />
        )}
        {hasEnoughCredits ? (
          <polyline points="22 4 12 14.01 9 11.01" />
        ) : (
          <path d="M12 8v4" />
        )}
        {!hasEnoughCredits && <path d="M12 16h.01" />}
      </svg>
      <div>
        <p className="font-medium text-sm">
          {hasEnoughCredits
            ? "You have sufficient credits"
            : "Insufficient credits"}
        </p>
        {!hasEnoughCredits && (
          <p className="text-xs mt-1">
            Add ${(remainingAmount - userCredits).toFixed(2)} more credits.
          </p>
        )}
      </div>
    </div>
  );
};
