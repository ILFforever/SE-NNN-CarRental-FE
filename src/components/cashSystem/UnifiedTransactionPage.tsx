"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import TransactionFilters from "@/components/cashSystem/TransactionFilters";
import TransactionCard from "@/components/cashSystem/CardTransaction";
import TransactionFetch, {
  TransactionResponse,
} from "@/libs/cash/transaction_fetch";
import CircularProgress from "@mui/material/CircularProgress";
import { User, Search, Users } from "lucide-react";

// Transaction interface
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
  user: {
    _id: string;
    name: string;
    email: string;
  } | string;
  __v: number;
}

export interface TransactionSummary {
  deposits: { count: number; total: number };
  withdrawals: { count: number; total: number };
  payments: { count: number; total: number };
  refunds: { count: number; total: number };
  netFlow: number;
}

// Admin-specific search component
const AdminUserSearch = ({ onUserSearch }: { onUserSearch: (query: string) => void }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUserSearch(searchQuery);
  };

  return (
    <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
        <Users className="w-5 h-5 mr-2 text-[#8A7D55]" />
        User Search
      </h3>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user ID, name or email"
            className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A7D55] focus:border-transparent outline-none"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <button
          type="submit"
          className="bg-[#8A7D55] text-white px-4 py-2 rounded-lg hover:bg-[#766b48] transition-colors"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default function UnifiedTransactionPage({ isAdmin = false }) {
  const { data: session, status } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [filters, setFilters] = useState<any>({});
  const [userSearch, setUserSearch] = useState<string>("");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [summary, setSummary] = useState<TransactionSummary | null>(null);

  // Combined function to fetch transactions based on filters
  const fetchFilteredTransactions = async (filters: any, userQuery?: string) => {
    if (status !== "authenticated" || !session) return;

    try {
      const token = session.user.token;
      const roles = isAdmin ? "admin" : "user";

      // Combine user search with other filters for admin
      const filterParams = {
        ...filters,
        ...(isAdmin && userQuery ? { search: userQuery } : {}),
      };

      const response: TransactionResponse = await TransactionFetch({
        token,
        roles,
        filter: {
          type: filterParams.transactionType,
          status: filterParams.status,
          startDate: filterParams.startDate,
          endDate: filterParams.endDate,
          reference: filterParams.reference,
          rentalId: filterParams.rentalId,
          minPrice: filterParams.minAmount,
          maxPrice: filterParams.maxAmount,
          search: filterParams.search,
        },
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
        },
      });
      
      setTransactions(response.data.transactions);
      setSummary(response.summary);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }));
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Handle user search specifically for admin
  const handleUserSearch = (query: string) => {
    setUserSearch(query);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
    fetchFilteredTransactions(filters, query);
  };

  // Apply filters
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  useEffect(() => {
    fetchFilteredTransactions(filters, userSearch);
  }, [filters, pagination.page, isAdmin]);

  // Toggle transaction details open/closed
  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  const handleNextPage = () => {
    if (pagination.page * pagination.limit < pagination.total) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircularProgress size="3rem" sx={{ color: '#8A7D55' }} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen p-8 flex justify-center items-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-[rgb(var(--background-start-rgb))] to-[rgb(var(--background-end-rgb))]">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl md:text-3xl lg:text-4xl font-bold mb-2 text-gray-800">
          {isAdmin ? "Transaction Management" : "Transaction History"}
        </h1>
        <p className="text-md lg:text-lg text-gray-600 mb-6">
          {isAdmin 
            ? "Review and manage all system transactions" 
            : "Track your account activity and payment history"}
        </p>

        {/* Summary Cards */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-6 mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="w-8 h-8 bg-[#8A7D55]/10 rounded-full flex items-center justify-center mr-2">
              <span className="text-[#8A7D55] text-sm">$</span>
            </span>
            Transaction Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg shadow-sm border border-blue-100 transition-colors">
              <h3 className="text-sm font-semibold text-blue-600 mb-1">Deposits</h3>
              <p className="text-lg font-medium text-gray-800">
                {summary?.deposits?.count || 0}{" "}
                <span className="text-sm text-gray-500">
                  (Total: {summary?.deposits?.total
                    ? summary.deposits.total.toFixed(2)
                    : 0})
                </span>
              </p>
            </div>
            <div className="bg-green-50 hover:bg-green-100 p-4 rounded-lg shadow-sm border border-green-100 transition-colors">
              <h3 className="text-sm font-semibold text-green-600 mb-1">Payments</h3>
              <p className="text-lg font-medium text-gray-800">
                {summary?.payments?.count || 0}{" "}
                <span className="text-sm text-gray-500">
                  (Total: {summary?.payments?.total
                    ? summary.payments.total.toFixed(2)
                    : 0})
                </span>
              </p>
            </div>
            <div className="bg-red-50 hover:bg-red-100 p-4 rounded-lg shadow-sm border border-red-100 transition-colors">
              <h3 className="text-sm font-semibold text-red-600 mb-1">Refunds</h3>
              <p className="text-lg font-medium text-gray-800">
                {summary?.refunds?.count || 0}{" "}
                <span className="text-sm text-gray-500">
                  (Total: {summary?.refunds?.total
                    ? summary.refunds.total.toFixed(2)
                    : 0})
                </span>
              </p>
            </div>
            <div className="bg-yellow-50 hover:bg-yellow-100 p-4 rounded-lg shadow-sm border border-yellow-100 transition-colors">
              <h3 className="text-sm font-semibold text-yellow-600 mb-1">
                Withdrawals
              </h3>
              <p className="text-lg font-medium text-gray-800">
                {summary?.withdrawals?.count || 0}{" "}
                <span className="text-sm text-gray-500">
                  (Total: {summary?.withdrawals?.total
                    ? summary.withdrawals.total.toFixed(2)
                    : 0})
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Admin-only User Search */}
        {isAdmin && <AdminUserSearch onUserSearch={handleUserSearch} />}

        {/* Content Filter & Transaction list */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter Sidebar */}
          <div className="w-full md:w-[30%] xl:w-[20%]">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 sticky top-20">
              <TransactionFilters onSearch={handleFilterChange} />
            </div>
          </div>
          
          {/* Transaction List */}
          <div className="w-full md:w-[70%] xl:w-[80%]">
            {transactions.length === 0 ? (
              <div className="bg-white p-8 rounded-xl text-center shadow-md border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <span className="text-gray-400 text-xl">0</span>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No transactions found</h3>
                <p className="text-gray-500">Try adjusting your filters or search criteria</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => {
                  const id = tx._id;
                  const isOpen = openIds.has(id);
                  
                  // Add user info for admin view
                  const enhancedTx = isAdmin ? {
                    ...tx,
                    user: typeof tx.user === 'string' 
                      ? { _id: tx.user, name: 'Unknown', email: 'unknown' } 
                      : tx.user
                  } : tx;
                  
                  return (
                    <div key={id} data-test-id="transaction-card">
                      <TransactionCard
                        tx={enhancedTx}
                        isOpen={isOpen}
                        toggle={() => toggle(id)}
                        showUserInfo={isAdmin}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
           {/* Pagination Controls */}
           {transactions.length > 0 && (
              <div className="flex justify-center gap-3 items-center mt-8">
                <button
                  onClick={handlePreviousPage}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 text-sm rounded-md bg-[#8A7D55] text-white hover:bg-[#766b48] disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>
                <span className="text-sm text-gray-700">
                  {pagination.page} / {Math.ceil(pagination.total / pagination.limit) || 1}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={pagination.page * pagination.limit >= pagination.total}
                  className="px-3 py-1 text-sm rounded-md bg-[#8A7D55] text-white hover:bg-[#766b48] disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}