"use client";
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

// Reuse or mirror the Transaction interface from your types
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: "deposit" | "withdraw";
  date: string;
  details: {
    transactionId: string;
    userId: string;
    paymentType: string;
    time: string;
  };
}

interface TransactionCardProps {
  tx: Transaction;
  isOpen: boolean;
  toggle: (id: string) => void;
}

export default function TransactionCard({
  tx,
  isOpen,
  toggle,
}: TransactionCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-4 md:p-6 border">
      <div className="flex items-start justify-between">
        {/* Left: amount & description */}
        <div>
          <p
            className={`text-md md:text-xl lg:text-2xl font-semibold ${
              tx.type === "deposit" ? "text-green-500" : "text-red-500"
            }`}
          >
            {tx.type === "deposit" ? "+" : "-"}
            {Math.abs(tx.amount).toFixed(2)} THB
          </p>
          <p className="hidden lg:block text-sm lg:text-md text-gray-500">
            {tx.description}
          </p>
        </div>

        {/* Right: type, date, toggle */}
        <div className="text-right flex items-center space-x-2">
          <div>
            <p
              className={`font-medium text-sm md:text-md lg:text-xl ${
                tx.type === "deposit" ? "text-green-500" : "text-red-500"
              }`}
            >
              {tx.type === "deposit" ? "deposit" : "withdraw"}
            </p>
            <p className="text-xs text-gray-400">{tx.date}</p>
          </div>
          <button
            onClick={() => toggle(tx.id)}
            className="p-1 hover:bg-gray-100 rounded-full"
            aria-label={isOpen ? "Collapse details" : "Expand details"}
          >
            {isOpen ? (
              <ChevronUp className="w-3 h-3 md:w-5 md:h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-3 h-3 md:w-5 md:h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-y-2 text-xs md:text-sm text-gray-700">
            <div className="font-medium">TransactionID:</div>
            <div>{tx.details.transactionId}</div>

            <div className="font-medium">UserID:</div>
            <div>{tx.details.userId}</div>

            <div className="font-medium">Payment Type:</div>
            <div>{tx.details.paymentType}</div>

            <div className="font-medium">Time (GMT+7):</div>
            <div>{tx.details.time}</div>
          </div>
        </div>
      )}
    </div>
  );
}