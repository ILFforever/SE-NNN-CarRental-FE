import React from "react";
import { CreditStatusMessage } from "./CreditStatusMessage";

type CreditInfoCardProps = {
  userCredits: number;
  remainingAmount: number;
  onRefresh: () => void;
};

export const CreditInfoCard: React.FC<CreditInfoCardProps> = ({
  userCredits,
  remainingAmount,
  onRefresh,
}) => {
  const hasEnoughCredits = userCredits >= remainingAmount;
  
  return (
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
          onClick={onRefresh}
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
            <span className="text-gray-600">Remaining After Payment:</span>
            <span
              className={`font-medium ${
                hasEnoughCredits ? "text-green-600" : "text-red-600"
              }`}
            >
              ${(userCredits - remainingAmount).toFixed(2)}
            </span>
          </div>
        </div>

        <CreditStatusMessage
          userCredits={userCredits}
          remainingAmount={remainingAmount}
        />
      </div>
    </div>
  );
};