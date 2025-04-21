"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { API_BASE_URL } from "@/config/apiConfig";

export default function TopUpStatusPage() {
  const params = useParams();
  const transId = params.transId;
  const router = useRouter();

  const [status, setStatus] = useState<"pending" | "completed" | "expired" | "error" | null>(null);
  const [details, setDetails] = useState<{ uid: string; amount: number } | null>(null);
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
            router.push(`/topup/${transId}`);
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
  }, [transId, router]);

  // Icon selection
  let Icon = Clock;
  let bgIcon = "bg-yellow-100";
  if (status === "completed") {
    Icon = CheckCircle;
    bgIcon = "bg-green-100";
  } else if (status === "expired" || status === "error") {
    Icon = XCircle;
    bgIcon = "bg-red-100";
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {loading ? (
          <p className="text-gray-600">Checking transaction status...</p>
        ) : (
          <>
            <div className={`${bgIcon} p-4 rounded-full inline-block mb-6`}>
              <Icon className="w-16 h-16 text-current" />
            </div>
            <h2 className="text-2xl font-semibold mb-2 capitalize text-gray-800">
              {status}
            </h2>

            {status === "pending" && (
              <p className="text-gray-600 mb-4">Your payment is pending.</p>
            )}
            {status === "expired" && (
              <p className="text-red-600 mb-4">
                This QR code has expired. Please generate a new one.
              </p>
            )}
            {status === "error" && <p className="text-red-600 mb-4">{error}</p>}

            {details && status !== "error" && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">User ID</span>
                  <span className="font-medium text-gray-800">
                    {details.uid}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-medium text-gray-800">
                    ${details.amount}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => router.push("/")}
              className="inline-block bg-[#8A7D55] hover:-translate-y-[5%] hover:scale-105 text-white px-6 py-2 rounded-lg transition"
            >
              Back to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
