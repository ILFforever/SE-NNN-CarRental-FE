"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/config/apiConfig";
import { Session } from "next-auth";

// Define interfaces with strict typing
interface ProviderProfile {
  _id: string;
  name: string;
  email: string;
  telephone_number?: string; // Make optional
  address?: string;
  createdAt: string;
  verified?: boolean;
  completeRent?: number;
  review?: {
    totalReviews: number;
    averageRating: number;
  };
}

interface ClientProviderProfilePageProps {
  session: Session;
  providerProfile: ProviderProfile;
}

export default function ClientProviderProfilePage({
  session,
  providerProfile,
}: ClientProviderProfilePageProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Use type assertion to handle the undefined case
  const [editForm, setEditForm] = useState({
    name: providerProfile.name,
    telephone_number: providerProfile.telephone_number ?? "", // Use nullish coalescing
    address: providerProfile.address ?? "",
  });

  // Format date for better display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

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

      const response = await fetch(`${API_BASE_URL}/Car_Provider/${providerProfile._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.token}`,
        },
        body: JSON.stringify({
          name: editForm.name,
          telephone_number: editForm.telephone_number,
          address: editForm.address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      // Success
      setSuccess("Profile updated successfully");

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
            Welcome back, {providerProfile.name}
          </p>
        </div>

        {/* User avatar placeholder */}
        <div className="w-20 h-20 rounded-full bg-white text-[#8A7D55] flex items-center justify-center text-xl font-bold shadow-md border-2 border-white">
          {providerProfile.name
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
                  {providerProfile.name}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm font-medium">Email</p>
                <p className="font-medium text-gray-800">
                  {providerProfile.email}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm font-medium">
                  Telephone Number
                </p>
                <p className="font-medium text-gray-800">
                  {providerProfile.telephone_number || "N/A"}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm font-medium">
                  Member Since
                </p>
                <p className="font-medium text-gray-800">
                  {formatDate(providerProfile.createdAt)}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                <p className="text-gray-600 text-sm font-medium">Address</p>
                <p className="font-medium text-gray-800">
                  {providerProfile.address || "N/A"}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm font-medium">Account ID</p>
                <p className="font-medium text-xs text-gray-500">
                  {providerProfile._id}
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
                    value={providerProfile.email}
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
                    pattern="\d{3}-\d{7}"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label
                    htmlFor="address"
                    className="text-gray-600 text-sm font-medium"
                  >
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={editForm.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                    rows={3}
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
                      name: providerProfile.name,
                      telephone_number: providerProfile.telephone_number ?? "",
                      address: providerProfile.address ?? "",
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

      {/* Membership / Performance Section */}
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
          <h2 className="text-xl font-medium text-[#8A7D55]">
            Provider Performance
          </h2>
        </div>

        <div className="text-center mb-4">
          <div className="mb-2">
            <div
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                providerProfile.verified
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {providerProfile.verified ? "Verified" : "Pending Verification"}
            </div>
          </div>
          <p className="text-sm text-gray-600">Account Status</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-gray-600 text-sm font-medium">
                Completed Rentals
              </p>
              <p className="font-bold text-[#8A7D55]">
                {providerProfile.completeRent || 0}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-gray-600 text-sm font-medium">Total Reviews</p>
              <p className="font-bold text-[#8A7D55]">
                {providerProfile.review?.totalReviews || 0}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-gray-600 text-sm font-medium">
                Average Rating
              </p>
              <p className="font-bold text-[#8A7D55] flex items-center">
                {providerProfile.review?.averageRating?.toFixed(1) || "N/A"}
                {providerProfile.review?.averageRating && (
                  <span className="ml-1 text-yellow-500">★</span>
                )}
              </p>
            </div>
          </div>
        </div>
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
            {/* Provider Tools Button */}
            <Link
              href="/provider/tools"
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Provider Tools</h3>
                <p className="text-sm text-white text-opacity-80">
                  Manage your provider account
                </p>
              </div>
            </Link>

            {/* Car Rentals Button */}
            <Link
              href="/provider/rentals"
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
                <h3 className="font-medium">My Rentals</h3>
                <p className="text-sm text-white text-opacity-80">
                  View and manage your car rentals
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
)};
