// pages/transactions.tsx
"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import TransactionFilters from "@/components/cashSystem/TransactionFilters";

//interface Transaction
interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: "deposit" | "withdraw";
  date: string; // e.g. "xx/xx/xxxx"
  details: {
    transactionId: string;
    userId: string;
    paymentType: string;
    time: string; // e.g. "00.00 น."
  };
}

//mock data
// This is just a mock data. You can replace it with your actual data fetching logic.
const mockTransactions: Array<Transaction> = [
  {
    id: "1",
    amount: -100,
    description: "Withdraw 100 Coin",
    type: "withdraw",
    date: "xx/xx/xxxx",
    details: {
      transactionId: "TXN-123456",
      userId: "USER-7890",
      paymentType: "QRCODE",
      time: "00.00 น.",
    },
  },
  {
    id: "2",
    amount: 100,
    description: "Deposit 100 Coin",
    type: "deposit",
    date: "xx/xx/xxxx",
    details: {
      transactionId: "TXN-234567",
      userId: "USER-8901",
      paymentType: "QR",
      time: "01.23 น.",
    },
  },
  // ...add as many as you like
];

export default function TransactionsPage() {
  // track which rows are expanded
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">My Transaction logs</h1>
        <p className="text-lg text-gray-700 mb-6">Transaction History</p>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-[20%]"><TransactionFilters/></div>
          <div className="space-y-4 w-full md:w-[80%]">
            {mockTransactions.map((tx) => {
              const isOpen = openIds.has(tx.id);
              return (
                <div
                  key={tx.id}
                  className="bg-white rounded-xl shadow p-6 border block"
                >
                  <div className="flex items-start justify-between">
                    {/* Left: amount & description */}
                    <div>
                      <p
                        className={`text-2xl font-semibold ${
                          tx.type === "deposit"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {tx.type === "deposit" ? "+" : "-"}
                        {Math.abs(tx.amount).toFixed(2)} THB
                      </p>
                      <p className="text-sm text-gray-500">{tx.description}</p>
                    </div>

                    {/* Right: type, date, toggle */}
                    <div className="text-right flex flex-row">
                      <div className="flex flex-col items-end mr-2">
                        <p
                          className={`font-medium text-xl ${
                            tx.type === "deposit"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {tx.type === "deposit" ? "Deposit" : "Withdraw"}
                        </p>
                        <p className="text-md text-gray-400 mb-2">{tx.date}</p>
                      </div>
                      <button
                        onClick={() => toggle(tx.id)}
                        className="p-1 hover:bg-gray-100 rounded-full"
                        aria-label={
                          isOpen ? "Collapse details" : "Expand details"
                        }
                      >
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-700">
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
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
