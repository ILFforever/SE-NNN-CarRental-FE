"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { API_BASE_URL } from "@/config/apiConfig";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from "@/components/util/Button";
import { TextField } from "@mui/material";
import { Icon } from "@iconify-icon/react";

export default function TopUpPage() {
  const [open, setOpen] = useState(false);
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

  const [userCredit, setUserCredit] = useState<number>(0);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);


  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    // refresh the page by navigating to the same URL
    setQrStatus(null);
    setQrUrl(null);
    setTransId(null);
    };

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

  useEffect(() => {
    const fetchData = async () => {
      try {
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
  }, [userCredit, session]);

  const handlePresetTopupClick = (amount: number) => {
    setAmount(amount);
    setOpen(true);
  };

  const handleCustomTopupClick = () => {
    setOpen(true);
  };

  return (
    <main className="space-y-6 mb-12">
      <div className="w-lg h-40 m-10 font-sans">
        <h1 className="text-3xl font-bold mb-8">Topup</h1>
        <div className="flex md:flex-row flex-col gap-4">
          <div className="p-6 bg-gradient-to-tl from-white to-[#8A7D5599] border-2 border-[#8A7D55] hover:shadow-md transition-all duration-300 rounded-xl shadow flex flex-col items-start md:w-1/2 w-full">
            <h2 className="text-sm font-semibold text-black">Total Balance</h2>
            <p className="text-2xl font-bold text-black">{userCredit} Coin</p>
            <p className="text-xs text-black mt-2">
              Note: this currency is only being used in our website only
            </p>
          </div>
          <div className="grid md:grid-cols-2 md:grid-rows-2 sm:grid-rows-2 sm:grid-cols-2 grid-cols-1 grid-rows-4  gap-4 w-full">
            {
              presetAmounts.map((val) => (
                <button key={val} onClick={() => (handlePresetTopupClick(val))} className=" p-4 flex flex-col  justify-start items-start bg-white hover:bg-gradient-to-tl hover:from-[#6e6344] hover:to-[#8A7D5599] text-black group hover:text-white rounded-xl min-h-32 shadow hover:shadow-md border border-gray-300 hover:border-[#8A7D55]">
                  <p className="font-semibold text-2xl">{val} THB</p>
                  <p className="text-xs group-hover:text-white">Add {val} Coin</p>
                </button>
              ))
            }
            <button onClick={() => (handleCustomTopupClick())} className="p-4 relative rounded-xl min-h-32 group">
              <span className="absolute bottom-4 left-1/2 bg-white group-hover:bg-gradient-to-tl group-hover:from-[#6e6344] group-hover:to-[#8A7D5599] rounded-xl -translate-x-1/2 w-[90%] h-[90%] shadow border border-gray-300 group-hover:shadow-md group-hover:border-[#8A7D55]"></span>
              <span className="absolute bottom-2 left-1/2 bg-white group-hover:bg-gradient-to-tl group-hover:from-[#6e6344] group-hover:to-[#8A7D5599] rounded-xl -translate-x-1/2 w-[95%] h-[90%] shadow border border-gray-300 group-hover:shadow-md group-hover:border-[#8A7D55]"></span>
              <span className="absolute bottom-0 right-0 bg-white group-hover:bg-gradient-to-tl group-hover:from-[#6e6344] group-hover:to-[#8A7D5599] rounded-xl w-full h-[90%] shadow border border-gray-300 group-hover:shadow-md group-hover:border-[#8A7D55]"></span>
              <div className="relative group-hover:text-white flex flex-col justify-start items-start mt-3 h-full">
                <p className="font-semibold text-2xl">Custom Amount</p>
                <p className="text-xs text-gray-500 group-hover:text-white">Add custom amount</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {showPresetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <p className="mb-4 text-lg font-semibold">Confirm Topup</p>
            <p className="mb-6">Are you sure you want to top up {amount} THB?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => { handleConfirm(); setShowPresetModal(false); }}
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

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"

      >
        <DialogTitle id="alert-dialog-title">
          <div className="flex items-center">
            <Icon icon="mdi:coin" className="text-[#8A7D55] mr-2" />
            <span className="text-[#8A7D55] text-lg font-bold">Top Up</span>
          </div>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {qrUrl && qrStatus === "pending" ? (
              <img
                src={qrUrl}
                alt="Top-Up QR Code"
                className="mx-auto w-[150px] md:w-[300px] h-[150px] md:h-[300px] rounded-lg border border-gray-300"
              />
            ) : (

              <div>
                Are you sure you want to top up {amount} THB? This will add {totalCredit} Coin to your account.
                <p className="text-red-500 text-sm mt-2">{error}</p>
                <TextField
                  autoFocus
                  margin="dense"
                  id="amount"
                  label="Amount"
                  type="number"
                  fullWidth
                  variant="standard"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  error={!!error}
                  helperText={error}
                  className="mt-4"
                  InputProps={{
                    startAdornment: (
                      <span className="text-gray-500 mr-2">THB</span>
                    ),
                  }}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Note: This currency is only being used on our website.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  You will receive {totalCredit} Coin after the top-up.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Please confirm your top-up amount.
                </p>
              </div>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant="primary" disabled={!!(loading || (qrUrl && qrStatus === "pending"))}>
            {loading ? "Loading..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
