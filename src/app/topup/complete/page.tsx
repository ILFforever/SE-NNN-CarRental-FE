"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Clock } from "lucide-react";

type TransactionDetails = {
  uid: string;
  cash: number;
};

export default function StatusPage() {
  const searchParams = useSearchParams();
  const transId = searchParams.get("trans_id");

  const [status, setStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [details, setDetails] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchStatus() {
      if (!transId) return;
      try {
        const res = await fetch(`/api/v1/qrcode/getStatus?trans_id=${transId}`);
        const data = await res.json();
        if (data.success) {
          setStatus(data.data.status);
          setMessage(data.message);
          setDetails({ uid: data.data.uid, cash: data.data.cash });
        } else {
          setStatus("error");
          setMessage(data.message);
        }
      } catch (err) {
        setStatus("error");
        setMessage("Network error while fetching status.");
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, [transId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-700">Loading transaction status...</p>
      </div>
    );
  }

  // Determine icon and colors
  let IconComponent = CheckCircle;
  let bgLight = "bg-green-50";
  let bgIcon = "bg-green-100";

  if (status === "error" || status === "expired" || status === "already processed") {
    IconComponent = XCircle;
    bgLight = "bg-red-50";
    bgIcon = "bg-red-100";
  } else if (status === "pending") {
    IconComponent = Clock;
    bgLight = "bg-yellow-50";
    bgIcon = "bg-yellow-100";
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className={`${bgIcon} p-4 rounded-full mb-6 inline-block`}> 
          <IconComponent className="w-16 h-16 text-current" />
        </div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 capitalize">{status}</h2>
        <p className="text-gray-600 mb-6">{message}</p>

        {details && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">User ID</span>
              <span className="font-medium text-gray-800">{details.uid}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Amount</span>
              <span className="font-medium text-gray-800">${details.cash}</span>
            </div>
          </div>
        )}

        <a
          href="/"
          className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
