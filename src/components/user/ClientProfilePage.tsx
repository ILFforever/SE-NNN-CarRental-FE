"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TierBadge from "@/components/util/TierBadge";
import { getTierName, getTierColorClass } from "@/utils/tierUtils";
import { API_BASE_URL } from "@/config/apiConfig";
import { Session } from "next-auth";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Settings,
  Calendar,
  Heart,
  CreditCard,
  Shield,
  ArrowRight,
  Edit2,
  Save,
  X,
} from "lucide-react";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  telephone_number?: string;
  role: string;
  tier: number;
  total_spend: number;
  createdAt: string;
}

interface ClientProfilePageProps {
  session: Session;
  userProfile: UserProfile;
}

export default function ClientProfilePage({
  session,
  userProfile,
}: ClientProfilePageProps) {
  //useScrollToTop();
  const router = useRouter();
  const pageRef = useRef(null);

  // Animation states and refs
  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ["start start", "end end"],
  });

  // Parallax transforms
  const headerY = useTransform(scrollYProgress, [1, 0.3], [0, -50]);
  const headerOpacity = useTransform(scrollYProgress, [1, 0], [1, 0]);
  const patternY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const containerScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.98]);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [editForm, setEditForm] = useState({
    name: userProfile.name,
    telephone_number: userProfile.telephone_number ?? "",
  });

  // Enhanced tier progress calculation
  const currentTier = userProfile.tier;
  const nextTierName = getTierName(currentTier + 1);
  const nextTierThreshold = (currentTier + 1) * 10000;
  const progress = (userProfile.total_spend / nextTierThreshold) * 100;
  const progressCapped = Math.min(progress, 100);
  const remainingAmount = nextTierThreshold - userProfile.total_spend;
  const [userCredits, setUserCredits] = useState<number>(0);

  // Format date with animation
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Enhanced form animations
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/credits`, {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setUserCredits(data.data.credits || 0);
        }
      } catch (error) {
        console.error("Error fetching credits:", error);
      }
    };

    if (session?.user?.token) {
      fetchCredits();
    }
  }, [session]);

  // Animated form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (!/^\d{3}-\d{7}$/.test(editForm.telephone_number)) {
        setError(
          "Please provide a valid telephone number in the format: XXX-XXXXXXX"
        );
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.token}`,
        },
        body: JSON.stringify({
          name: editForm.name,
          telephone_number: editForm.telephone_number,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setSuccess("Profile updated successfully");
      userProfile.name = editForm.name;
      userProfile.telephone_number = editForm.telephone_number;
      setIsEditing(false);

      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Tier color animation helper
  const getTierProgressColor = (tier: number): string => {
    switch (tier) {
      case 0:
        return "from-yellow-600 to-amber-500";
      case 1:
        return "from-gray-400 to-gray-300";
      case 2:
        return "from-yellow-400 to-yellow-300";
      case 3:
        return "from-blue-400 to-blue-300";
      case 4:
        return "from-teal-400 to-emerald-300";
      default:
        return "from-[#8A7D55] to-[#a59670]";
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Dark gradient background matching topup page */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-stone-800 to-[#B8A77A] -z-10" />

      {/* Dot pattern overlay */}
      <div className="fixed inset-0 opacity-10 -z-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <motion.main ref={pageRef} className="relative">
        {/* Enhanced Hero Header */}
        <motion.div
          style={{ y: headerY, opacity: headerOpacity }}
          className="relative py-16 px-4 overflow-hidden"
        >
          <div className="relative max-w-4xl mx-auto">
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="text-center mb-12"
            >
              <motion.div
                className="inline-flex w-24 h-24 bg-white/10 backdrop-blur-lg rounded-full items-center justify-center text-3xl font-medium text-white shadow-lg mb-6 border border-white/20"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {userProfile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </motion.div>

              <h1 className="text-4xl md:text-5xl font-serif font-medium text-white mb-2">
                Welcome back, {userProfile.name}
              </h1>
              <p className="text-xl text-gray-200">
                Your personal space at CEDT Rentals
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          style={{ scale: containerScale }}
          className="max-w-6xl mx-auto px-4 pb-20"
        >
          {/* Alert Messages */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8 p-4 bg-green-500/10 border border-green-500/20 backdrop-blur-lg rounded-xl"
              >
                <p className="text-green-400">{success}</p>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8 p-4 bg-red-500/10 border border-red-500/20 backdrop-blur-lg rounded-xl"
              >
                <p className="text-red-400">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-medium text-white flex items-center">
                      <Settings className="w-6 h-6 mr-3 text-[#d4c4a0]" />
                      Account Information
                    </h2>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(!isEditing)}
                      className={`flex items-center px-4 py-2 rounded-full transition-colors ${
                        isEditing
                          ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                          : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                      }`}
                    >
                      {isEditing ? (
                        <>
                          <X className="w-4 h-4 mr-2" /> Cancel
                        </>
                      ) : (
                        <>
                          <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                        </>
                      )}
                    </motion.button>
                  </div>

                  <AnimatePresence mode="wait">
                    {!isEditing ? (
                      <motion.div
                        key="display"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                      >
                        {[
                          { label: "Name", value: userProfile.name },
                          { label: "Email", value: userProfile.email },
                          {
                            label: "Telephone",
                            value: userProfile.telephone_number || "—",
                          },
                          {
                            label: "Account Type",
                            value:
                              userProfile.role.charAt(0).toUpperCase() +
                              userProfile.role.slice(1),
                          },
                          {
                            label: "Member Since",
                            value: formatDate(userProfile.createdAt),
                          },
                          {
                            label: "Account ID",
                            value: userProfile._id,
                            small: true,
                          },
                        ].map((field, index) => (
                          <motion.div
                            key={field.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/5 p-5 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                          >
                            <p className="text-sm text-gray-400 mb-1">
                              {field.label}
                            </p>
                            <p
                              className={`font-medium ${
                                field.small
                                  ? "text-xs text-gray-500"
                                  : "text-white"
                              }`}
                            >
                              {field.value}
                            </p>
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.form
                        key="edit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleSubmit}
                        className="space-y-6"
                      >
                        <div className="space-y-4">
                          <div>
                            <label
                              htmlFor="name"
                              className="block text-sm font-medium text-gray-300 mb-1"
                            >
                              Name
                            </label>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={editForm.name}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:border-transparent transition-all"
                              required
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="telephone_number"
                              className="block text-sm font-medium text-gray-300 mb-1"
                            >
                              Telephone Number
                            </label>
                            <input
                              type="text"
                              id="telephone_number"
                              name="telephone_number"
                              value={editForm.telephone_number}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:border-transparent transition-all"
                              placeholder="XXX-XXXXXXX"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center px-6 py-3 bg-[#8A7D55] text-white rounded-xl hover:bg-[#766b48] transition-colors disabled:opacity-70"
                          >
                            {isLoading ? (
                              <>
                                <motion.svg
                                  animate={{ rotate: 360 }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: "linear",
                                  }}
                                  className="w-5 h-5 mr-2"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </motion.svg>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-5 h-5 mr-2" />
                                Save Changes
                              </>
                            )}
                          </motion.button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Membership Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="p-8">
                  <h2 className="text-2xl font-medium text-white flex items-center mb-6">
                    <Shield className="w-6 h-6 mr-3 text-[#d4c4a0]" />
                    <span className="mr-4">Membership</span>
                    <TierBadge
                      tier={userProfile.tier}
                      className="text-xl px-5 py-2 shadow-md hover:shadow-lg transition-shadow"
                    />
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-gray-300 font-medium">Total Spend</p>
                        <p className="text-xl font-bold text-white">
                          ${userProfile.total_spend.toFixed(2)}
                        </p>
                      </div>

                      {currentTier < 4 && (
                        <div>
                          <div className="overflow-hidden h-3 bg-white/10 rounded-full">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progressCapped}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full bg-gradient-to-r ${getTierProgressColor(
                                currentTier
                              )} rounded-full`}
                            />
                          </div>

                          <p className="text-sm text-gray-400 mt-2 text-center">
                            ${remainingAmount.toFixed(2)} until {nextTierName}
                          </p>
                        </div>
                      )}

                      {currentTier >= 4 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center py-4"
                        >
                          <p className="text-lg font-medium text-teal-400">
                            Maximum tier reached!
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            Enjoy our highest membership level
                          </p>
                        </motion.div>
                      )}
                    </div>

                    {/* New Credit Amount Display */}
                    <div className="bg-gradient-to-br from-[#8A7D55]/20 via-[#a59670]/10 to-transparent p-6 rounded-xl border border-[#8A7D55]/20">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[#d4c4a0] font-medium">Credits</p>
                          <p className="text-sm text-[#d4c4a0]/60 mt-1">
                            Current balance
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold font-bold bg-gradient-to-r from-[#d4c4a0] to-[#8A7D55] bg-clip-text text-transparent">
                            {userCredits.toLocaleString()}
                          </p>
                          <p className="text-sm text-[#d4c4a0]/80">
                            CEDT Coins
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-6"
                  >
                    <Link
                      href="/topup"
                      className="flex items-center justify-center w-full px-6 py-3 bg-[#8A7D55]/20 text-[#d4c4a0] rounded-xl hover:bg-[#8A7D55]/30 transition-colors border border-[#8A7D55]/30"
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      Top Up Credits
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-medium text-white mb-6">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  href: "/account/reservations",
                  icon: Calendar,
                  title: "My Reservations",
                  description: "Track your current and past bookings",
                },
                {
                  href: "/account/favorite",
                  icon: Heart,
                  title: "Favorite Cars",
                  description: "See your saved vehicle preferences",
                },
                {
                  href: "/transaction",
                  icon: CreditCard,
                  title: "Transactions",
                  description: "View your payment history",
                },
              ].map((action, index) => (
                <motion.div
                  key={action.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Link
                    href={action.href}
                    className="block p-6 bg-white/10 backdrop-blur-lg rounded-xl hover:bg-white/20 transition-all duration-300 h-full border border-white/10 hover:border-white/20"
                  >
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 rounded-full bg-[#8A7D55]/20 flex items-center justify-center group-hover:bg-[#8A7D55]/30 transition-colors">
                        <action.icon className="w-6 h-6 text-[#d4c4a0]" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#d4c4a0] ml-auto opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all" />
                    </div>
                    <h3 className="font-medium text-white">{action.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {action.description}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Support Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-400">
              Need assistance?{" "}
              <a
                href="mailto:support@cedtrentals.com"
                className="text-[#d4c4a0] hover:underline"
              >
                support@cedtrentals.com
              </a>
            </p>
          </motion.div>
        </motion.div>
      </motion.main>
    </div>
  );
}
