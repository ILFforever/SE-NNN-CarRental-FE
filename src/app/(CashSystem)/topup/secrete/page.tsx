"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { API_BASE_URL } from "@/config/apiConfig";

const symbols = ["🍒", "🍋", "🍉", "🍇", "💎"];
const PRIZE_AMOUNT = 100; // amount for top-up QR

export default function SlotMachinePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [reels, setReels] = useState<string[]>([symbols[0], symbols[0], symbols[0]]);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState<string>("");

  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [transId, setTransId] = useState<string | null>(null);

  const spinReels = () => {
    if (spinning) return;
    setMessage("");
    setQrUrl(null);
    setQrError(null);
    setTransId(null);
    setSpinning(true);

    const spinDuration = 1000;
    const intervalMs = 100;
    let elapsed = 0;

    const interval = setInterval(() => {
      setReels([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ]);
      elapsed += intervalMs;
      if (elapsed >= spinDuration) {
        clearInterval(interval);
        const final = [
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
        ];
        setReels(final);

        // win condition: any two match or all three
        const unique = new Set(final).size;
        if (unique < 3) {
          setMessage("🎉 You Win! Generating QR code... 🎉");
          generateQr();
        } else {
          setMessage("Try Again!");
        }
        setSpinning(false);
      }
    }, intervalMs);
  };

  const generateQr = async () => {
    if (!session?.user?.token) {
      setQrError("Authentication required");
      return;
    }
    setLoadingQr(true);
    try {
      const res = await fetch(`${API_BASE_URL}/credits/topup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.token}`,
        },
        body: JSON.stringify({ uid: session.user.id, amount: PRIZE_AMOUNT }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setQrUrl(data.url);
        // extract transaction ID from returned url
        try {
          const urlObj = new URL(data.url);
          const id = urlObj.searchParams.get('trans_id') || urlObj.searchParams.get('transaction_id');
          setTransId(id);
        } catch {
          setTransId(null);
        }
      } else {
        setQrError(data.message || "Failed to generate QR code");
      }
    } catch {
      setQrError("Network error");
    } finally {
      setLoadingQr(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
        <div className="text-center">
          <p className="mb-4 text-yellow-800 bg-yellow-100 p-4 rounded">
            Please sign in to play.
          </p>
          <Link href="/signin?callbackUrl=/slot-machine">
            <a className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
              Sign In
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-6">Slot Machine</h1>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {reels.map((symbol, idx) => (
          <div
            key={idx}
            className="w-24 h-24 flex items-center justify-center text-6xl bg-white rounded-lg shadow-inner"
          >
            {symbol}
          </div>
        ))}
      </div>

      <button
        onClick={spinReels}
        disabled={spinning}
        className={`px-6 py-3 rounded-full text-white font-semibold transition
          ${spinning ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
      >
        {spinning ? "Spinning..." : "Spin"}
      </button>

      {message && <p className="mt-4 text-2xl font-medium text-indigo-700">{message}</p>}
      {loadingQr && <p className="mt-4 text-gray-600">Generating QR Code...</p>}
      {qrError && <p className="mt-4 text-red-600">{qrError}</p>}

      {qrUrl && transId && (
        <div className="mt-6 text-center space-y-2">
          <img
            src={qrUrl}
            alt="Prize QR Code"
            className="mx-auto w-48 h-48 rounded-lg border border-gray-300 cursor-pointer"
            onClick={() => router.push(`/topup/${transId}`)}
          />
          <p className="text-sm text-gray-700">
            Scan or <span className="text-blue-600 underline cursor-pointer" onClick={() => router.push(`/topup/${transId}`)}>
              click here
            </span> to claim your ${PRIZE_AMOUNT} top-up
          </p>
        </div>
      )}
    </main>
  );
}