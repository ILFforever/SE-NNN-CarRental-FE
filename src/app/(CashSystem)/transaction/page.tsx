// pages/transactions.tsx
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import TransactionFilters from "@/components/cashSystem/TransactionFilters";
import TransactionCard from "@/components/cashSystem/CardTransaction";
import TransactionFetch, {
  TransactionResponse,
} from "@/libs/cash/transaction_fetch";

//interface Transaction
interface Transaction {
  _id: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
  transactionDate: string;
  description: string;
  metadata: Record<string, any>;
  performedBy: string | null;
  reference: string;
  rental: any;
  status: string;
  type: "deposit" | "withdraw";
  user: string;
  __v: number;
}

export default function TransactionsPage() {
  const { data: session, status } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (status !== "authenticated" || !session) return;

    const fetchTransactions = async () => {
      try {
        const token = session.user.token; // assumes accessToken in session
        const roles = session.user.role as "User" | "Admin"; // assumes role in session.user

        const response: TransactionResponse = await TransactionFetch({
          token,
          roles,
        });
        console.log(response);
        setTransactions(response.data.transactions);
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (loading) {
    return <p>Loading transactions...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

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
            {transactions.map((tx) => {
              const id = tx._id;
              const isOpen = openIds.has(id);
              return (
                <TransactionCard
                  key={id}
                  tx={tx}
                  isOpen={isOpen}
                  toggle={() => {
                    setOpenIds((prev) => {
                      const next = new Set(prev);
                      next.has(id) ? next.delete(id) : next.add(id);
                      return next;
                    });
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
