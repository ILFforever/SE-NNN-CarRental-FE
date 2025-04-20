// app/account/topup/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function TopUpPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [amount, setAmount] = useState<number>(0);
  const [totalCredit, setTotalCredit] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // preset buttons for quick select
  const presetAmounts = [100, 200, 500, 1000];

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

  const handleConfirm = () => {
    if (error || amount < 100) return;
    setLoading(true);
    router.push(
      `/account/topup/confirm?amount=${amount}&credit=${totalCredit}`
    );
  };

  return (
    <main className="space-y-6">
      {/* Banner Image */}
      <div className="w-full h-[350px] relative">
        <Image
          src="/img/top-up-banner.jpg"
          alt="Top Up Banner"
          layout="fill"
          objectFit="cover"
          className="mask-b-from-20% mask-b-to-80%"
        />
      </div>

      <section className="px-4 max-w-lg mx-auto">
        <h1 className="text-3xl font-semibold mb-4 text-center">
          Account Top-Up
        </h1>

        {/* Preset Buttons */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Select Quick Amount</label>
          <div className="flex flex-wrap gap-2">
            {presetAmounts.map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val)}
                className={`px-4 py-2 rounded-lg border 
                  ${
                    amount === val
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-700 border-gray-300"
                  }
                  hover:bg-green-100 transition-colors
                `}
              >
                ${val}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div className="mb-4">
          <label htmlFor="amount" className="block mb-1 font-medium">
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
          <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-200">
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

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={!!error || loading}
          className={`w-full py-3 text-white font-medium rounded-lg transition
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }
          `}
        >
          {loading ? "Processing..." : "Confirm Top-Up"}
        </button>
      </section>
    </main>
  );
}
