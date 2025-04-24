"use client";
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

// Mirror the updated Transaction interface
export interface Transaction {
  _id: string;
  amount: number;
  description: string;
  type: "deposit" | "withdraw";
  transactionDate: string;
  reference: string;
  rental: any;
  performedBy: string | null;
  status: string;
  // Optionally include these if you want more details
  createdAt?: string;
  updatedAt?: string;
  user?: string;
  metadata?: Record<string, any>;
  __v?: number;
}

interface TransactionCardProps {
  tx: Transaction;
  isOpen: boolean;
  toggle: () => void;
}

export default function TransactionCard({
  tx,
  isOpen,
  toggle,
}: TransactionCardProps) {
  // Format date to a more readable form (e.g., local time)
  const date = new Date(tx.transactionDate).toLocaleString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="bg-white hover:bg-gray-50 rounded-xl shadow p-4 md:p-6 border">
      <div className="flex items-start justify-between">
        {/* Left: amount & description */}
        <div>
          <p
            className={`text-md md:text-xl lg:text-2xl font-semibold ${
              tx.type === "deposit" ? "text-green-500" : "text-red-500"
            }`}
          >
            {tx.type === "deposit" ? "+" : "-"}
            {Math.abs(tx.amount).toFixed(2)}
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
              {tx.type}
            </p>
            <p className="text-xs text-gray-400">{date}</p>
          </div>
          <button
            onClick={toggle}
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
        <div className="mt-4 pt-4 border-t border-gray-200 text-gray-700">
          <div className="grid grid-cols-2 gap-y-2 text-xs md:text-sm">
            <div className="font-medium">Reference:</div>
            <div>{tx.reference || "-"}</div>

            <div className="font-medium">Performed By:</div>
            <div>{tx.performedBy || "-"}</div>

            <div className="font-medium">Status:</div>
            <div>{tx.status}</div>

            <div className="font-medium">Rental:</div>
            <div>{tx.rental ?? "-"}</div>

            <div className="font-medium">Created At:</div>
            <div>{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '-'}</div>
          </div>
        </div>
      )}
    </div>
  );
}
