// pages/transactions.tsx
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import TransactionFilters from "@/components/cashSystem/TransactionFilters";
import TransactionCard from "@/components/cashSystem/CardTransaction";
import TransactionFetch, {
  TransactionResponse,
} from "@/libs/cash/transaction_fetch";
import CircularProgress from "@mui/material/CircularProgress";
import { summary } from "framer-motion/client";

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
  type: "deposit" | "withdrawal" | "payment" | "refund";
  user: string;
  __v: number;
}

export interface TransactionSummary {
  deposits: { count: number; total: number };
  withdrawals: { count: number; total: number };
  payments: { count: number; total: number };
  refunds: { count: number; total: number };
  netFlow: number;
}//           onChange={() => setTransactionType("refund")}

export default function TransactionsPage() {
  const { data: session, status } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [filters, setFilters] = useState<any>({});
  const [pagination, setPagination] = useState({ page: 1, limit: 6, total: 0 });
const [summary, setSummary] = useState<TransactionSummary | null>(null);

  //fetchFilteredTransactions function to fetch transactions based on filters
  const fetchFilteredTransactions = async (filters: any) => {
    if (status !== "authenticated" || !session) return;

    try {
      const token = session.user.token;
      const roles = "admin";

      const response: TransactionResponse = await TransactionFetch({
        token,
        roles,
        filter: {
          type: filters.transactionType,
          status: filters.status,
          startDate: filters.startDate,
          endDate: filters.endDate,
          reference: filters.reference,
          rentalId: filters.rentalId,
          minPrice: filters.minAmount,
          maxPrice: filters.maxAmount,
          search: filters.search,
        },
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
        },
      });
      setTransactions(response.data.transactions);
      setSummary(response.summary);
      console.log(filters.minAmount);
      setPagination((prev) => ({
        ...prev,
        total: response.total as any,
      }));
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredTransactions(filters);
  }, [filters, pagination.page]);

  //Function to handle toggle of transaction details
  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Function to handle pagination
  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };
  //Function to handle next page
  const handleNextPage = () => {
    if (pagination.page * pagination.limit < pagination.total) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  //page loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircularProgress size="3rem" />
      </div>
    );
  }

  //page error state
  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl md:text-3xl lg:text-4xl font-bold mb-2">
          All Transaction logs for Admin
        </h1>
        <p className="text-md lg:text-lg text-gray-700 mb-6">
          Transaction History
        </p>

        <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
          <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-4">
            Transaction Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-blue-600">Deposits</h3>
              <p className="text-lg font-medium text-gray-800">
                {summary?.deposits?.count || 0}{" "}
                <span className="text-sm text-gray-500">
                  (Total:{" "}
                  {summary?.deposits?.total
                    ? summary.deposits.total.toFixed(2)
                    : 0}
                  )
                </span>
              </p>
            </div>
            <div className="bg-green-50 hover:bg-green-100 p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-green-600">Payments</h3>
              <p className="text-lg font-medium text-gray-800">
                {summary?.payments?.count || 0}{" "}
                <span className="text-sm text-gray-500">
                  (Total:{" "}
                  {summary?.payments?.total
                    ? summary.payments.total.toFixed(2)
                    : 0}
                  )
                </span>
              </p>
            </div>
            <div className="bg-red-50 hover:bg-red-100 p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-red-600">Refunds</h3>
              <p className="text-lg font-medium text-gray-800">
                {summary?.refunds?.count || 0}{" "}
                <span className="text-sm text-gray-500">
                  (Total:{" "}
                  {summary?.refunds?.total
                    ? summary.refunds.total.toFixed(2)
                    : 0}
                  )
                </span>
              </p>
            </div>
            <div className="bg-yellow-50 hover:bg-yellow-100 p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-yellow-600">
                Withdrawals
              </h3>
              <p className="text-lg font-medium text-gray-800">
                {summary?.withdrawals?.count || 0}{" "}
                <span className="text-sm text-gray-500">
                  (Total:{" "}
                  {summary?.withdrawals?.total
                    ? summary.withdrawals.total.toFixed(2)
                    : 0}
                  )
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Content Filter & Transaction list */}
        <div className="flex flex-col md:flex-row gap-6 mt-8">
          {/* Filter */}
          <div className="w-full md:w-[30%] xl:w-[20%]">
            <TransactionFilters onSearch={setFilters} />
          </div>
          {/* Transaction List */}
          <div className="space-y-1 md:space-y-3 w-full md:w-[70%] xl:w-[80%]">
            {transactions.map((tx) => {
              const id = tx._id;
              const isOpen = openIds.has(id);
              return (
                <div data-test-id="transaction-card" key={id}>
                  <TransactionCard
                    key={id}
                    tx={tx}
                    isOpen={isOpen}
                    toggle={() => toggle(id)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-16">
          <button
            onClick={handlePreviousPage}
            disabled={pagination.page <= 1}
            className="text-sm md:text-xl px-4 py-2 rounded-md bg-[#8A7D55] text-white hover:bg-[#766b48] disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm md:text-xl px-4 py-2 text-gray-700">
            Page {pagination.page} of{" "}
            {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button
            onClick={handleNextPage}
            disabled={pagination.page * pagination.limit >= pagination.total}
            className="text-sm md:text-xl px-4 py-2 rounded-md bg-[#8A7D55] text-white hover:bg-[#766b48] disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
