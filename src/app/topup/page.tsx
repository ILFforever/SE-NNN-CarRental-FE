// app/account/topup/page.tsx
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
      // replace with your actual API base URL or config import
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const res = await fetch(
        `${API_BASE_URL}/qrcode/topup?uid=${session.user.id}&cash=${amount}`
      );
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
      <div className="w-full h-[200px] md:h-[400px] relative">
        <Image
          src="/img/top-up-banner.jpg"
          alt="Top Up Banner"
          layout="fill"
          objectFit="cover"
          className="object-contain"
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

        {/* Confirm Button & Loading */}
        <button
          onClick={handleConfirm}
          disabled={!!error || loading}
          className={`w-full py-3 text-md md:text-xl text-white font-medium rounded-lg transition
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }
          `}
        >
          {loading ? "Generating QR Code..." : "Generate QR Code for Payment"}
        </button>

        {/* QR Code Display */}
        {qrUrl && (
          <div className="mt-16 text-center">
            <p className="text-md md:text-xl mb-4 font-medium">
              Scan this QR code to payment:
            </p>
            <img
              src={qrUrl}
              alt="Top-Up QR Code"
              className="mx-auto w-1/2 h-1/2"
            />
          </div>
        )}
      </section>
    </main>
  );
}
