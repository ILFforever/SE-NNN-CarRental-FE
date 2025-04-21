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

  // preset buttons for quick select
  const presetAmounts = [100, 200, 500, 1000, 2000, 5000];

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
    } catch (err) {
      setError("Network error while generating QR code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-6 mb-12">
      {/* Banner Image */}
      <div className="h-[200px] md:h-[350px] w-full relative">
        <Image
          src="/img/top-up-banner.jpg"
          alt="Top Up Banner"
          layout="fill"
          objectFit="cover"
        />
      </div>

      <section className="px-4 max-w-xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-semibold mb-4 text-center">
          Account Top-Up
        </h1>

        {/* Preset Buttons */}
        <div className="mb-8">
          <label className="text-md md:text-2xl block mb-4 font-medium">
            Select Quick Amount
          </label>
          <div className="flex flex-wrap gap-4">
            {presetAmounts.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={`px-4 py-2 rounded-lg border 
                  ${
                    amount === val
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-700 border-gray-300"
                  }
                  text-md md:text-xl
                  hover:bg-green-100 transition-colors
                `}
              >
                ${val}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div className="mb-8">
          <label
            htmlFor="amount"
            className="text-md md:text-2xl block mb-1 font-medium"
          >
            Or Enter Custom Amount ($)
          </label>
          <input
            id="amount"
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Minimum $100"
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {error && <p className="mt-1 text-red-600">{error}</p>}
        </div>

        {/* Summary */}
        {amount >= 100 && (
          <div className="text-md mb-6 bg-green-50 p-4 rounded-lg border border-green-200">
            <p>
              Top-Up Amount: <span className="font-semibold">${amount}</span>
            </p>
            <p>
              Bonus Credit:{" "}
              <span className="font-semibold">${totalCredit - amount}</span>
            </p>
            <p>
              Total Credit:{" "}
              <span className="font-semibold">${totalCredit}</span>
            </p>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleConfirm}
          disabled={loading || qrStatus === "pending"}
          className={`w-full py-3 text-white font-medium rounded-lg transition
            ${
              loading || qrStatus === "pending"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }
          `}
        >
          {loading
            ? "Generating QR Code..."
            : qrStatus === "pending"
            ? "QR Code Pending..."
            : "Confirm Top-Up"}
        </button>

        {/* QR Display & Expired */}
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
          <p className="mt-8 text-center text-red-600 font-medium">
            This QR code has expired. Please retry.
          </p>
        )}
      </section>
    </main>
  );
}
