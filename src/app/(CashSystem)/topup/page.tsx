"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { API_BASE_URL } from "@/config/apiConfig";

export default function TopUpPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [amount, setAmount] = useState<number>(0);
  const [totalCredit, setTotalCredit] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [transId, setTransId] = useState<string | null>(null);
  const [qrStatus, setQrStatus] = useState<
    "pending" | "completed" | "expired" | null
  >(null);

  const [userCredit,setUserCredit]=useState<number>(0);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // preset buttons for quick select
  const presetAmounts = [100, 500, 1000];

  // calculate bonus when amount changes
  useEffect(() => {
    if (amount < 100) {
      setError("Minimum top-up is $100");
      setTotalCredit(0);
    } else {
      setError(null);
      let pct = 0;
      if (amount >= 1000) pct = 10;
      else if (amount >= 500) pct = 5;
      const bonus = Math.floor((amount * pct) / 100);
      setTotalCredit(amount + bonus);
    }
  }, [amount]);

  // extract transaction ID from QR URL
  useEffect(() => {
    if (qrUrl) {
      try {
        const url = new URL(qrUrl);
        const id = url.pathname.split("/").pop();
        setTransId(id || null);
        setQrStatus("pending");
      } catch {
        setTransId(null);
      }
    }
  }, [qrUrl]);

  // poll status every 10 seconds
  useEffect(() => {
    if (!transId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/credits/topup/status?trans_id=${transId}`
        );
        if (res.status === 404) {
          setQrStatus("expired");
          clearInterval(interval);
          return;
        }
        const data = await res.json();
        if (data.status === "completed") {
          setQrStatus("completed");
          clearInterval(interval);
          router.push(`/topup/${transId}`);
        } else {
          setQrStatus("pending");
        }
      } catch (err) {
        console.error("Error checking QR status", err);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [transId, router]);

  if (!session) {
    return (
      <div className="py-12 px-4 max-w-md mx-auto text-center">
        <p className="mb-4 text-yellow-800 bg-yellow-100 p-4 rounded">
          Please sign in to top up your account.
        </p>
        <Link href="/signin?callbackUrl=/account/topup">
          <a className="inline-block px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
            Sign In
          </a>
        </Link>
      </div>
    );
  }

  // handle top-up confirmation: fetch QR code
  const handleConfirm = async () => {
    if (error || amount < 100) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/credits/topup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.token}`,
        },
        body: JSON.stringify({ uid: session.user.id, amount }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        setQrUrl(data.url);
      } else {
        setError(data.message || "Failed to generate QR code");
      }
      setShowQRModal(true);
    } catch (err) {
      setError("Network error while generating QR code");
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    const fetchData = async()=>{
      try{
        const response = await fetch(`${API_BASE_URL}/credits`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.user.token}`,
          }
        });
        const data = await response.json();
        setUserCredit(data.data.credits);
      }
      catch (error) {
        console.error('Error fetching coin data:', error);
      }
    }
    fetchData();
  },[userCredit,session]);

  const handlePresetTopupClick = (amount: number) => {
    setAmount(amount);
    setShowPresetModal(true);
  };

  const handleCustomTopupClick = () => {
    setShowCustomModal(true);
  };

  return (
    <main className="space-y-6 mb-12">
      <div className="w-lg h-40 m-10 font-sans">
        <h1 className="text-3xl font-bold mb-8">Topup</h1>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="p-6 bg-white rounded-xl shadow col-span-2 md:col-span-1">
          <h2 className="text-sm font-semibold text-gray-500">Total Balance</h2>
          <p className="text-2xl font-bold text-black">{userCredit} Coin</p>
          <p className="text-xs text-gray-400 mt-2">
            Note: this currency is only being used in our website only
          </p>
        </div>
        {
          presetAmounts.map((val)=>(
            <button key={val} onClick={()=>(handlePresetTopupClick(val))} className="p-4 bg-white rounded-xl shadow hover:shadow-md">
              <p className="font-semibold">{val} THB</p>
              <p className="text-xs text-gray-500">Add {val} Coin</p>
            </button>
          ))
        }
        <button onClick={()=>(handleCustomTopupClick())} className="p-4 bg-white rounded-xl shadow hover:shadow-md">
          <p className="font-semibold">Custom Amount</p>
          <p className="text-xs text-gray-500">Add custom amount</p>
        </button>
        </div>
      </div>

      {showPresetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <p className="mb-4 text-lg font-semibold">Confirm Topup</p>
            <p className="mb-6">Are you sure you want to top up {amount} THB?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={()=>{handleConfirm(); setShowPresetModal(false);}}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowPresetModal(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCustomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <p className="mb-4 text-lg font-semibold">Custom Topup</p>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Minimum $100"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="flex justify-center gap-4">
              <button
                onClick={()=>{handleConfirm(); setShowCustomModal(false);}}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            {qrUrl && qrStatus === "pending" && (
              <div className="mt-8 text-center">
                <img
                  src={qrUrl}
                  alt="Top-Up QR Code"
                  className="mx-auto w-[150px] md:w-[300px] h-[150px] md:h-[300px] rounded-lg border border-gray-300"
                />
              </div>
            )}
            {qrStatus === "expired" && (
              <div>
                <p className="mt-8 text-center text-red-600 font-medium">
                  This QR code has expired. Please retry.
                </p>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            )}
            </div>
        </div>
      )}
    </main>
  );
}
