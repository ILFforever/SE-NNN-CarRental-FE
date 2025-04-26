"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/config/apiConfig";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify-icon/react";
import { PlusCircle, XCircle, Loader2, CheckCircle, ArrowRight } from "lucide-react";

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          key="modal-content"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4"
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function TopUpPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [modalState, setModalState] = useState<{
    [x: string]: any;
    isOpen: boolean;
    type: "preset" | "custom" | "qr" | "success";
    amount?: number;
    customAmount?: string;
    loading?: boolean;
    error?: string | null;
    qrUrl?: string | null;
    transId?: string | null;
    qrStatus?: "pending" | "completed" | "expired" | null;
  }>({
    isOpen: false,
    type: "preset",
  });

  const [userCredit, setUserCredit] = useState<number>(0);

  // Preset values with bonus labels
  const presetAmounts = [
    { value: 100, label: "100 THB", bonus: "100 Coins" },
    { value: 500, label: "500 THB", bonus: "525 Coins (+5%)" },
    { value: 1000, label: "1,000 THB", bonus: "1,100 Coins (+10%)" },
  ];

  // Fetch user credits
  useEffect(() => {
    const fetchCredits = async () => {
      if (!session?.user.token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/credits`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.token}`,
          },
        });
        const data = await response.json();
        setUserCredit(data.data.credits);
      } catch (error) {
        console.error("Error fetching credit data:", error);
      }
    };
    fetchCredits();
  }, [session]);

  // Poll QR status
  useEffect(() => {
    if (!modalState.transId || modalState.type !== "qr") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/credits/topup/status?trans_id=${modalState.transId}`
        );

        if (res.status === 404) {
          setModalState((prev) => ({
            ...prev,
            qrStatus: "expired",
          }));
          clearInterval(interval);
          return;
        }

        const data = await res.json();
        if (data.status === "completed") {
          // Switch to success state instead of navigating
          setModalState((prev) => ({
            ...prev,
            type: "success",
            details: {
              amount: data.amount,
              transId: modalState.transId,
            },
          }));
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Error checking QR status", err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [modalState.transId, modalState.type]);

  // Open preset modal
  const openPresetModal = useCallback((amount: number) => {
    setModalState({
      isOpen: true,
      type: "preset",
      amount,
      error: null,
    });
  }, []);

  const SuccessContent: React.FC<{
    amount: number;
    transId: string;
    onClose: () => void;
  }> = ({ amount, transId, onClose }) => {
    const calculateReceivedCoins = () => {
      if (amount >= 1000) return Math.floor(amount * 1.1);
      if (amount >= 500) return Math.floor(amount * 1.05);
      return amount;
    };
    return (
      <>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-semibold mb-2 text-gray-800">
            Payment Successful
          </h3>
          <p className="text-gray-600">
            Your top-up has been completed successfully.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Transaction ID</span>
            <span className="font-medium text-gray-800 text-sm truncate max-w-[200px]">
              {transId}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Amount</span>
            <span className="font-medium text-gray-800">
              ฿{amount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Coins Received</span>
            <span className="font-semibold text-[#8A7D55]">
              {calculateReceivedCoins().toLocaleString()} Coins
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl bg-[#8A7D55] text-white font-medium hover:bg-[#766b48] transition-colors"
          >
            Back to Top Up
          </button>
        </div>
      </>
    );
  };

  // Open custom modal
  const openCustomModal = useCallback(() => {
    setModalState({
      isOpen: true,
      type: "custom",
      customAmount: "",
      error: null,
    });
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
      error: null,
      qrUrl: null,
      transId: null,
      qrStatus: null,
    }));
  }, []);

  // Handle custom amount change
  const handleCustomAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setModalState((prev) => ({
        ...prev,
        customAmount: e.target.value,
        error: null,
      }));
    },
    []
  );

  // Validate and submit custom amount
  const handleCustomSubmit = useCallback(() => {
    const numAmount = parseInt(modalState.customAmount || "0");
    if (numAmount < 100) {
      setModalState((prev) => ({
        ...prev,
        error: "Minimum top-up is ฿100",
      }));
      return;
    }

    setModalState({
      isOpen: true,
      type: "preset",
      amount: numAmount,
    });
  }, [modalState.customAmount]);

  // Confirm top-up
  const handleConfirm = useCallback(async () => {
    const amount = modalState.amount;
    if (!amount || amount < 100) {
      setModalState((prev) => ({
        ...prev,
        error: "Invalid amount",
      }));
      return;
    }

    setModalState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const res = await fetch(`${API_BASE_URL}/credits/topup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user.token}`,
        },
        body: JSON.stringify({
          uid: session?.user.id,
          amount,
        }),
      });
      const data = await res.json();

      if (data.success && data.url) {
        setModalState((prev) => ({
          ...prev,
          type: "qr",
          qrUrl: data.url,
          transId: data.transaction_id,
          qrStatus: "pending",
          loading: false,
        }));
      } else {
        setModalState((prev) => ({
          ...prev,
          error: data.message || "Failed to generate QR code",
          loading: false,
        }));
      }
    } catch (err) {
      setModalState((prev) => ({
        ...prev,
        error: "Network error while generating QR code",
        loading: false,
      }));
    }
  }, [session, modalState.amount]);

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return num.toExponential(2);
    }
    return num.toLocaleString();
  };

  // Calculate bonus
  const calculateTotalCredit = useCallback((amount: number) => {
    if (amount < 100) return 0;
    const pct = amount >= 1000 ? 10 : amount >= 500 ? 5 : 0;
    return amount + Math.floor((amount * pct) / 100);
  }, []);

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-[#8A7D55] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl p-10 max-w-md w-full text-center"
        >
          <div className="bg-[#8A7D55]/10 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Icon
              icon="mdi:lock-open-variant-outline"
              className="text-6xl text-[#8A7D55]"
            />
          </div>
          <h1 className="text-4xl font-serif font-semibold mb-4 text-white">
            Sign In Required
          </h1>
          <p className="text-gray-300 mb-8 text-lg">
            Please sign in to access your account and top up your balance.
          </p>
          <Link
            href="/signin?callbackUrl=/topup"
            className="inline-flex items-center px-8 py-4 bg-[#8A7D55] text-white rounded-full 
          hover:bg-[#766b48] transition-all duration-300 
          shadow-lg hover:shadow-xl 
          transform hover:-translate-y-1 
          text-lg font-medium 
          group"
          >
            Sign In
            <ArrowRight className="ml-2 w-5 h-5 transform transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-[#8A7D55] -z-10"></div>

      {/* Dot pattern overlay */}
      <div className="fixed inset-0 opacity-10 -z-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      {/* Hero Section */}
      <div className="py-20 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block mb-6 animate-scale-up">
            <div className="bg-white/10 backdrop-blur-lg rounded-full p-4">
              <Icon icon="mdi:wallet" className="text-4xl text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-4 text-white animate-fade-in">
            Top Up Your Balance
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto animate-fade-in-delay">
            Add funds to your account and unlock premium services. Enjoy
            exclusive bonuses on larger top-ups.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        {/* Balance Card and Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Main Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#8A7D55]/10 to-transparent rounded-full transform translate-x-20 -translate-y-20"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="bg-[#8A7D55]/10 rounded-xl p-3 mr-4">
                    <Icon
                      icon="mdi:wallet"
                      className="text-2xl text-[#8A7D55]"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">
                      Available Balance
                    </p>
                    <h2 className="text-4xl font-bold tracking-tight">
                      {formatNumber(userCredit)}
                    </h2>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <p className="text-sm text-gray-500">Currency</p>
                    <p className="font-medium">CEDT Coins</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-gradient-to-br from-[#8A7D55] to-[#6e6344] rounded-2xl shadow-xl p-6 text-white h-full">
              <h3 className="text-lg font-medium mb-4 opacity-90">
                Bonus Tiers
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="opacity-80">฿500+</span>
                  <span className="bg-white/20 rounded-full px-3 py-1 text-sm">
                    +5%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-80">฿1,000+</span>
                  <span className="bg-white/20 rounded-full px-3 py-1 text-sm">
                    +10%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-80">Custom</span>
                  <span className="bg-white/20 rounded-full px-3 py-1 text-sm">
                    Flexible
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Amount Selection */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl text-white font-semibold">
                Select Amount
              </h3>
              <p className="text-gray-300 mt-1">
                Choose from popular amounts or enter your own
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
              <Icon icon="mdi:shield-check" className="text-green-600" />
              <span className="text-sm text-gray-600">Secure Payment</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {presetAmounts.map((preset, index) => (
              <motion.button
                key={preset.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                onClick={() => openPresetModal(preset.value)}
                className="group relative bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:border-[#8A7D55] hover:shadow-lg transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#8A7D55]/5 to-transparent rounded-bl-full"></div>
                <div className="relative">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">฿{preset.value}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        You'll receive
                      </p>
                      <p className="text-lg font-semibold text-[#8A7D55]">
                        {preset.bonus}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#8A7D55]/10 transition-colors">
                      <Icon
                        icon="mdi:arrow-right"
                        className="text-xl text-gray-400 group-hover:text-[#8A7D55] transform group-hover:translate-x-1 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Custom Amount Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-20"
        >
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 p-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h4 className="text-xl font-semibold mb-2">
                  Need a different amount?
                </h4>
                <p className="text-gray-600">
                  Enter any amount above ฿100 to top up your balance
                </p>
              </div>
              <button
                onClick={openCustomModal}
                className="inline-flex items-center px-6 py-3 rounded-xl bg-black text-white hover:bg-gray-900 transition-colors"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">Custom Amount</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      <Modal isOpen={modalState.isOpen} onClose={closeModal}>
        <div className="p-8">
          {modalState.type === "success" ? (
            <SuccessContent
              amount={modalState.details?.amount || 0}
              transId={modalState.details?.transId || ""}
              onClose={closeModal}
            />
          ) : modalState.type === "custom" ? (
            <CustomAmountContent
              customAmount={modalState.customAmount || ""}
              onChange={handleCustomAmountChange}
              onSubmit={handleCustomSubmit}
              onClose={closeModal}
              error={modalState.error}
            />
          ) : modalState.type === "preset" ? (
            <PresetAmountContent
              amount={modalState.amount || 0}
              onClose={closeModal}
              onConfirm={handleConfirm}
              loading={modalState.loading}
              error={modalState.error}
              totalCredit={calculateTotalCredit(modalState.amount || 0)}
            />
          ) : modalState.type === "qr" ? (
            <QRCodeContent
              amount={modalState.amount || 0}
              qrUrl={modalState.qrUrl}
              qrStatus={modalState.qrStatus}
              onClose={closeModal}
            />
          ) : null}
        </div>
      </Modal>
    </div>
  );
}

// Custom Amount Modal Content
const CustomAmountContent: React.FC<{
  customAmount: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onClose: () => void;
  error?: string | null;
}> = ({ customAmount, onChange, onSubmit, onClose, error }) => {
  const validateAmount = parseInt(customAmount || "0");
  const receivedCoins =
    validateAmount >= 1000
      ? validateAmount * 1.1
      : validateAmount >= 500
      ? validateAmount * 1.05
      : validateAmount;

  return (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#8A7D55]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon="mdi:wallet" className="text-3xl text-[#8A7D55]" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">Enter Amount</h3>
        <p className="text-gray-600">Enter the amount you want to top up</p>
      </div>

      <div className="mb-8">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            ฿
          </span>
          <input
            type="number"
            value={customAmount}
            onChange={onChange}
            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-[#8A7D55] focus:border-transparent outline-none"
            placeholder="Enter amount"
            min="100"
          />
        </div>
        {validateAmount >= 100 && (
          <p className="mt-2 text-sm text-gray-600">
            You will receive {Math.floor(receivedCoins).toLocaleString()} Coins
          </p>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <XCircle className="mr-2 w-4 h-4" />
            {error}
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onClose}
          className="flex-1 px-6 py-3 rounded-xl border border-gray-300 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={!customAmount || validateAmount < 100}
          className="flex-1 px-6 py-3 rounded-xl bg-[#8A7D55] text-white font-medium hover:bg-[#766b48] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </>
  );
};

// Preset Amount Confirmation Content
const PresetAmountContent: React.FC<{
  amount: number;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  error?: string | null;
  totalCredit: number;
}> = ({ amount, onClose, onConfirm, loading, error, totalCredit }) => {
  return (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#8A7D55]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon="mdi:wallet" className="text-3xl text-[#8A7D55]" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">Confirm Top Up</h3>
        <p className="text-gray-600">
          You're about to add funds to your account
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Amount</span>
          <span className="font-semibold">฿{amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Bonus</span>
          <span className="font-semibold text-green-600">
            +{totalCredit - amount} Coins
          </span>
        </div>
        <div className="border-t pt-4 flex justify-between items-center">
          <span className="font-medium">Total Coins</span>
          <span className="text-2xl font-semibold">
            {totalCredit.toLocaleString()}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
          <XCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={onClose}
          className="flex-1 px-6 py-3 rounded-xl border border-gray-300 font-medium hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 px-6 py-3 rounded-xl bg-[#8A7D55] text-white font-medium hover:bg-[#766b48] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            "Confirm"
          )}
        </button>
      </div>
    </>
  );
};

// QR Code Content
const QRCodeContent: React.FC<{
  amount: number;
  qrUrl?: string | null;
  qrStatus?: "pending" | "completed" | "expired" | null;
  onClose: () => void;
}> = ({ amount, qrUrl, qrStatus, onClose }) => {
  return (
    <div className="text-center">
      <div className="mb-8">
        <div className="w-16 h-16 bg-[#8A7D55]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon="mdi:qrcode" className="text-3xl text-[#8A7D55]" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">Scan QR Code</h3>
        <p className="text-gray-600">
          Scan this QR code with your banking app to complete the payment
        </p>
      </div>

      <div className="mb-8">
        {qrStatus === "pending" && qrUrl && (
          <div className="relative inline-block">
            <img
              src={qrUrl}
              alt="Payment QR Code"
              className="w-64 h-64 rounded-2xl border border-gray-200 shadow-sm"
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-8">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Amount</span>
          <span className="font-semibold">฿{amount.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-xl border border-gray-300 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>

      <p className="text-sm text-gray-500 mt-4">
        This QR code will expire in 5 minutes. Please complete the payment
        within this time.
      </p>
    </div>
  );
};
