"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  Home,
  RefreshCw,
  ArrowDownLeftSquare,
} from "lucide-react";
import { API_BASE_URL } from "@/config/apiConfig";

export default function TopUpStatusPage() {
  const params = useParams();
  const transId = params.transId;
  const router = useRouter();

  const [status, setStatus] = useState<
    "pending" | "completed" | "expired" | "error" | null
  >(null);
  const [details, setDetails] = useState<{
    uid: string;
    amount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!transId) {
      setError("Missing transaction ID in URL");
      setStatus("error");
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/credits/topup/status?trans_id=${transId}`
        );
        if (res.status === 404) {
          setStatus("expired");
        } else {
          const data = await res.json();
          setDetails({ uid: data.uid, amount: data.amount });
          if (data.status === "completed") {
            setStatus("completed");
            return;
          }
          setStatus("pending");
        }
      } catch {
        setError("Network error while fetching status");
        setStatus("error");
      } finally {
        setLoading(false);
      }
    };

    // initial fetch and poll
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [transId]);

  // Determine icon and background based on status
  const getStatusInfo = () => {
    switch (status) {
      case "completed":
        return {
          Icon: CheckCircle,
          bgIcon: "bg-green-100",
          message: "Payment Successful",
          description: "Your top-up has been completed successfully.",
        };
      case "expired":
        return {
          Icon: XCircle,
          bgIcon: "bg-red-100",
          message: "Transaction Expired",
          description: "This transaction has expired.",
        };
      case "error":
        return {
          Icon: XCircle,
          bgIcon: "bg-red-100",
          message: "Transaction Error",
          description: error || "An error occurred during the transaction.",
        };
      default:
        return {
          Icon: Clock,
          bgIcon: "bg-yellow-100",
          message: "Pending Payment",
          description: "Your payment is being processed.",
        };
    }
  };

  const { Icon, bgIcon, message, description } = getStatusInfo();

  // Calculate received coins
  const calculateReceivedCoins = (amount: number) => {
    if (amount >= 1000) return Math.floor(amount * 1.1);
    if (amount >= 500) return Math.floor(amount * 1.05);
    return amount;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-zinc-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        <div
          className={`${bgIcon} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6`}
        >
          <Icon className="w-10 h-10 text-current" />
        </div>

        <h2 className="text-2xl font-semibold mb-2 text-gray-800">{message}</h2>
        <p className="text-gray-600 mb-6">{description}</p>

        {details && status === "completed" && (
          <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Transaction ID</span>
              <span className="font-medium text-gray-800 text-sm truncate max-w-[200px]">
                {transId}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Amount</span>
              <span className="font-medium text-gray-800">
                ฿{details.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Coins Received</span>
              <span className="font-semibold text-[#8A7D55]">
                {calculateReceivedCoins(details.amount).toLocaleString()} Coins
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => router.push("/topup")}
            className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowDownLeftSquare className="mr-2 w-4 h-4" />
            Back to Topup
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex items-center justify-center px-4 py-2 bg-[#8A7D55] text-white rounded-lg hover:bg-[#766b48] transition-colors"
          >
            <Home className="mr-2 w-4 h-4" />
            Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
