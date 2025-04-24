// pages/transactions.tsx
"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import TransactionFilters from "@/components/cashSystem/TransactionFilters";
import TransactionCard from "@/components/cashSystem/CardTransaction";

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
        <h1 className="text-xl md:text-3xl lg:text-4xl font-bold mb-2">
          My Transaction logs
        </h1>
        <p className="text-md lg:text-lg text-gray-700 mb-6">
          Transaction History
        </p>

        {/* Content */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter */}
          <div className="w-full md:w-[30%] xl:w-[20%]">
            <TransactionFilters />
          </div>
          {/* Transaction List */}
          <div className="space-y-1 md:space-y-3 w-full md:w-[70%] xl:w-[80%]">
            {mockTransactions.map((tx: Transaction) => {
              const isOpen = openIds.has(tx.id);
              return (
                <TransactionCard
                  key={tx.id}
                  tx={tx}
                  isOpen={isOpen}
                  toggle={toggle}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
