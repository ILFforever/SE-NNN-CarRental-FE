"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import TierBadge from "@/components/util/TierBadge";
import { getTierName, getTierColorClass } from "@/utils/tierUtils";
import { API_BASE_URL } from "@/config/apiConfig";
import { Session } from "next-auth";

// Define interfaces with strict typing
interface UserProfile {
  _id: string;
  name: string;
  email: string;
  telephone_number?: string; // Make optional
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
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Use type assertion to handle the undefined case
  const [editForm, setEditForm] = useState({
    name: userProfile.name,
    telephone_number: userProfile.telephone_number ?? "", // Use nullish coalescing
  });

  // Format date for better display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate how close user is to next tier
  const currentTier = userProfile.tier;
  const nextTierName = getTierName(currentTier + 1);
  const nextTierThreshold = (currentTier + 1) * 10000;
  const progress = (userProfile.total_spend / nextTierThreshold) * 100;
  const progressCapped = Math.min(progress, 100);
  const remainingAmount = nextTierThreshold - userProfile.total_spend;

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Get tier colors for progress bar
  const getTierProgressColor = (tier: number): string => {
    switch (tier) {
      case 0: // Bronze
        return "bg-yellow-600";
      case 1: // Silver
        return "bg-gray-400";
      case 2: // Gold
        return "bg-yellow-400";
      case 3: // Platinum
        return "bg-blue-400";
      case 4: // Diamond
        return "bg-teal-400";
      default:
        return "bg-[#8A7D55]";
    }
  };

  const progressBarColor = getTierProgressColor(currentTier);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Simple validation for phone number
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

      // Success
      setSuccess("Profile updated successfully");

      // Update the local user profile data
      userProfile.name = editForm.name;
      userProfile.telephone_number = editForm.telephone_number;

      // Exit edit mode
      setIsEditing(false);

      // Refresh the page after a short delay to show the updated info
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

  return (
    <main className="py-10 px-4 max-w-4xl mx-auto">
      {/* Decorative header with pattern */}
      <div className="relative mb-8 bg-gradient-to-r from-[#8A7D55] to-[#a59670] rounded-xl p-6 shadow-lg overflow-hidden">
        {/* Abstract pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('/img/pattern.png')] bg-repeat"></div>

        <div className="relative flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-medium text-white">My Profile</h1>
            <p className="text-white text-opacity-80 mt-1">
              Welcome back, {userProfile.name}
            </p>
          </div>

          {/* User avatar placeholder */}
          <div className="w-20 h-20 rounded-full bg-white text-[#8A7D55] flex items-center justify-center text-xl font-bold shadow-md border-2 border-white">
            {userProfile.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
        </div>
      </div>

      {/* Success and error messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-lg">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main profile info */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-[#f8f5f0] flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-[#8A7D55]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-medium text-[#8A7D55]">
                Account Information
              </h2>

              {/* Add edit button */}
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="ml-auto text-sm px-3 py-1 bg-[#f8f5f0] text-[#8A7D55] rounded-md hover:bg-[#e6e1d8] transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {!isEditing ? (
              // Display mode
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm font-medium">Name</p>
                  <p className="font-medium text-gray-800">
                    {userProfile.name}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm font-medium">Email</p>
                  <p className="font-medium text-gray-800">
                    {userProfile.email}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm font-medium">
                    Telephone Number
                  </p>
                  <p className="font-medium text-gray-800">
                    {userProfile.telephone_number}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm font-medium">
                    Account Type
                  </p>
                  <p className="font-medium text-gray-800 capitalize">
                    {userProfile.role}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm font-medium">
                    Member Since
                  </p>
                  <p className="font-medium text-gray-800">
                    {formatDate(userProfile.createdAt)}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm font-medium">
                    Account ID
                  </p>
                  <p className="font-medium text-xs text-gray-500">
                    {userProfile._id}
                  </p>
                </div>
              </div>
            ) : (
              // Edit mode
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-gray-600 text-sm font-medium"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={editForm.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-gray-600 text-sm font-medium"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={userProfile.email}
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500"
                      disabled
                    />
                    <p className="text-xs text-gray-500">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="telephone_number"
                      className="text-gray-600 text-sm font-medium"
                    >
                      Telephone Number
                    </label>
                    <input
                      type="text"
                      id="telephone_number"
                      name="telephone_number"
                      value={editForm.telephone_number}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                      placeholder="Format: XXX-XXXXXXX"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="role"
                      className="text-gray-600 text-sm font-medium"
                    >
                      Account Type
                    </label>
                    <input
                      type="text"
                      id="role"
                      value={userProfile.role}
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 capitalize"
                      disabled
                    />
                  </div>
                </div>

                <div className="mt-6 flex space-x-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors disabled:opacity-70"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        name: userProfile.name,
                        telephone_number: userProfile.telephone_number ?? "", // Add nullish coalescing here
                      });
                      setError("");
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Membership tier card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-[#f8f5f0] flex items-center justify-center mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#8A7D55]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-[#8A7D55]">Membership</h2>
          </div>

          <div className="text-center mb-4">
            <div className="mb-2">
              <TierBadge
                tier={userProfile.tier}
                className="text-base px-4 py-1"
              />
            </div>
            <p className="text-sm text-gray-600">Your membership level</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center mb-1">
              <p className="text-gray-600 text-sm font-medium">Total Spend</p>
              <p className="font-bold text-[#8A7D55]">
                ${userProfile.total_spend.toFixed(2)}
              </p>
            </div>

            {userProfile.tier < 4 && (
              <>
                <div className="w-full bg-gray-200 rounded-full h-2.5 my-3">
                  <div
                    className={`${progressBarColor} h-2.5 rounded-full`}
                    style={{ width: `${progressCapped}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  ${remainingAmount.toFixed(2)} until {nextTierName}
                </p>
              </>
            )}

            {userProfile.tier >= 4 && (
              <div className="mt-3 text-center">
                <p className="text-sm font-medium text-teal-600">
                  Maximum tier reached!
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  You've reached our highest membership level
                </p>
              </div>
            )}
          </div>

          {/* Add link to top up credits */}
          <Link
            href="/topup"
            className="block w-full text-center py-2 px-4 bg-[#f8f5f0] text-[#8A7D55] rounded-md hover:bg-[#e6e1d8] transition-colors"
          >
            Top Up Credits
          </Link>
        </div>

        {/* Action buttons - now full width */}
        <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-[#f8f5f0] flex items-center justify-center mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#8A7D55]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-[#8A7D55]">Actions</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reservations Button */}
              <Link
                href="/account/reservations"
                className="flex items-center gap-3 bg-[#8A7D55] text-white p-4 rounded-lg hover:bg-[#766b48] transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">View My Reservations</h3>
                  <p className="text-sm text-white text-opacity-80">
                    Track your current and past bookings
                  </p>
                </div>
              </Link>

              {/* Favorites Button */}
              <Link
                href="/account/favorite"
                className="flex items-center gap-3 bg-[#8A7D55] text-white p-4 rounded-lg hover:bg-[#766b48] transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">View Favorite Cars</h3>
                  <p className="text-sm text-white text-opacity-80">
                    See your saved vehicle preferences
                  </p>
                </div>
              </Link>
            </div>

            {/* Change Password Button */}
            <div>
              <Link
                href="/account/change-password"
                className="flex items-center gap-3 bg-white border border-[#8A7D55] text-[#8A7D55] p-4 rounded-lg hover:bg-[#f8f5f0] transition-colors group w-full"
              >
                <div className="w-10 h-10 rounded-full bg-[#f8f5f0] flex items-center justify-center group-hover:bg-[#e9e6dd] transition-all">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Change Password</h3>
                  <p className="text-sm text-[#8A7D55] text-opacity-80">
                    Update your account security
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with support info */}
      <div className="mt-8 bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-gray-600 text-sm">
          Need assistance with your account? Contact our support team at{" "}
          <a
            href="mailto:support@cedtrentals.com"
            className="text-[#8A7D55] hover:underline"
          >
            support@cedtrentals.com
          </a>
        </p>
      </div>
    </main>
  );
}
