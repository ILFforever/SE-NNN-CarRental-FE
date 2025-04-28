import React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Clock,
  Check,
  X,
  User,
} from "lucide-react";
import { coinDisplay } from "@/libs/cash/coin_display";
import { TransactionDate, TransactionTime } from "@/libs/cash/transaction_date";

// Transaction type definitions
interface TransactionUser {
  _id: string;
  name: string;
  email: string;
}

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
  rental?: {
    _id: string;
    car?: {
      brand: string;
      model: string;
    };
  };
  status: string;
  type: "deposit" | "withdrawal" | "payment" | "refund";
  user: TransactionUser | string;
  __v: number;
}

interface TransactionCardProps {
  tx: Transaction;
  isOpen: boolean;
  toggle: () => void;
  showUserInfo?: boolean;
}

// Helper functions
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "deposit":
      return <ArrowUpRight className="text-green-500 w-5 h-5" />;
    case "withdrawal":
      return <ArrowDownLeft className="text-red-500 w-5 h-5" />;
    case "refund":
      return <RefreshCw className="text-blue-500 w-5 h-5" />;
    case "payment":
      return <ShoppingCart className="text-purple-500 w-5 h-5" />;
    default:
      return null;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "deposit":
      return "text-green-600";
    case "withdrawal":
      return "text-red-600";
    case "refund":
      return "text-blue-600";
    case "payment":
      return "text-purple-600";
    default:
      return "text-gray-600";
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return <Check className="w-4 h-4 text-green-600" />;
    case "pending":
      return <Clock className="w-4 h-4 text-yellow-600" />;
    case "failed":
      return <X className="w-4 h-4 text-red-600" />;
    default:
      return null;
  }
};

const EnhancedTransactionCard: React.FC<TransactionCardProps> = ({
  tx,
  isOpen,
  toggle,
  showUserInfo = false,
}) => {
  // Extract user info if available and in the expected format
  const userInfo =
    typeof tx.user === "object" && tx.user !== null
      ? tx.user
      : {
          _id: typeof tx.user === "string" ? tx.user : "unknown",
          name: "Unknown",
          email: "Unknown",
        };

  // Format transaction date
  const formattedDate = tx.transactionDate
    ? `${TransactionDate(new Date(tx.transactionDate))} ${TransactionTime(
        new Date(tx.transactionDate),
        true
      )}`
    : "N/A";

  // Calculate time since
  const timeAgo = tx.createdAt
    ? formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })
    : "Unknown time";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Main card (always visible) */}
      <div
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={toggle}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            {getTypeIcon(tx.type)}
          </div>

          <div>
            <h3 className={`font-medium ${getTypeColor(tx.type)}`}>
              {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
            </h3>
            <p className="text-sm text-gray-500 truncate max-w-[500px]">
              {tx.description || "No description"}
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <div className="mr-4 text-right">
            <p
              className={`font-semibold ${
                tx.type === "withdrawal" || tx.type === "payment"
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {coinDisplay(
                tx.amount,
                tx.type === "withdrawal" || tx.type === "payment"
                  ? "withdrawal"
                  : "deposit"
              )}
            </p>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(
                tx.status
              )}`}
            >
              {getStatusIcon(tx.status)}
              <span className="ml-1">{tx.status}</span>
            </span>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Transaction Details
            </h4>
            {/* Empty div to maintain grid alignment */}
            <div></div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">ID:</span>
              <span className="text-gray-700 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {tx._id}
              </span>
            </div>

            {showUserInfo && (
              <div className="flex items-center">
                <h4 className="text-sm font-medium text-gray-700 flex items-center">
                  <User className="w-4 h-4 mr-1 text-[#8A7D55]" />
                  User Information
                </h4>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Date:</span>
              <span className="text-gray-700">{formattedDate}</span>
            </div>

            {showUserInfo && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Name:</span>
                <span className="text-gray-700">{userInfo.name}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount:</span>
              <span
                className={`${
                  tx.type === "withdrawal" || tx.type === "payment"
                    ? "text-red-600"
                    : "text-green-600"
                } font-medium`}
              >
                {coinDisplay(
                  tx.amount,
                  tx.type === "withdrawal" || tx.type === "payment"
                    ? "withdrawal"
                    : "deposit"
                )}
              </span>
            </div>

            {showUserInfo && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email:</span>
                <span className="text-gray-700">{userInfo.email}</span>
              </div>
            )}

            {tx.reference && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Reference:</span>
                <span className="text-gray-700">{tx.reference}</span>
              </div>
            )}

            {showUserInfo && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">User ID:</span>
                <span className="text-gray-700 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {userInfo._id}
                </span>
              </div>
            )}

            {/* Related rental info if available */}
            {/* {tx.rental && (
              <div className="md:col-span-2 mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Related Booking
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Booking ID:</span>
                    <span className="text-gray-700 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {tx.rental._id}
                    </span>
                  </div>
                  {tx.rental.car && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Vehicle:</span>
                      <span className="text-gray-700">
                        {tx.rental.car.brand} {tx.rental.car.model}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )} */}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTransactionCard;
