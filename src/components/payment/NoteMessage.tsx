import React from "react";

type NoteMessageProps = {
  depositAmount: number;
  remainingAmount: number;
};

export const NoteMessage: React.FC<NoteMessageProps> = ({
  depositAmount,
  remainingAmount,
}) => {
  return (
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
          A 10% deposit (${depositAmount.toFixed(2)}) has already been charged.
          The remaining balance (${remainingAmount.toFixed(2)}) is due now.
        </p>
      </div>
    </div>
  );
};