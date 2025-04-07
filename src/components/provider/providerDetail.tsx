"use client";

import React, { useState, useEffect } from "react";
import { Mail,Phone,Building,CheckCircle, Star } from "lucide-react";
import { API_BASE_URL } from "@/config/apiConfig";

interface ProviderReviewData {
  _id: string;
  name: string;
  address: string;
  telephone_number: string;
  email: string;
  createdAt: string;
  __v: number;
  verified: boolean;
  review: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
      "1": number;
      "2": number;
      "3": number;
      "4": number;
      "5": number;
    };
  };
}

interface ProviderDetailsProps {
  providerId: string;
  token?: string; // if your API requires a token
}

const ProviderDetails: React.FC<ProviderDetailsProps> = ({
  providerId,
  token,
}) => {
  const [providerData, setProviderData] = useState<ProviderReviewData | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProviderData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/Car_Provider/${providerId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          throw new Error("Failed to fetch provider details");
        }

        const data = await res.json();
        if (data.success && data.data) {
          setProviderData(data.data);
        } else {
          throw new Error("Invalid provider data received");
        }
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, [providerId, token]);

  if (loading) {
    return (
      <div className="text-sm text-gray-500">Loading provider details...</div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!providerData) {
    return null;
  }

  const { totalReviews, averageRating, ratingDistribution } =
    providerData.review;

  // Helper to get the width (percentage) of each rating bar
  const getRatingPercentage = (rating: number) => {
    if (totalReviews === 0) return 0;
    return (
      (ratingDistribution[
        rating.toString() as keyof typeof ratingDistribution
      ] /
        totalReviews) *
      100
    );
  };

  // Optional: a helper to render star icons for the average rating
  const renderStars = (rating: number) => {
    // We'll round down to nearest whole star for display
    const wholeStars = Math.floor(rating);
    // Check if there's a partial star
    const hasHalfStar = rating - wholeStars >= 0.5;

    return (
      <div className="flex items-center">
        {[...Array(wholeStars)].map((_, idx) => (
          <Star key={idx} className="text-yellow-500 w-4 h-4 fill-current" />
        ))}
        {hasHalfStar && (
          <Star
            className="text-yellow-500 w-4 h-4 fill-current"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />
        )}
        {[...Array(5 - wholeStars - (hasHalfStar ? 1 : 0))].map((_, idx) => (
          <Star key={idx} className="text-gray-300 w-4 h-4" />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full mt-4">
      {/* Provider Name & Verified Badge */}
      <div className="flex items-center space-x-2 mb-5">
        <h2 className="text-xl font-bold text-gray-800">{providerData.name}</h2>
        {providerData.verified && (
          <div className="relative group inline-block">
            <CheckCircle className="text-green-500 w-5 h-5" />
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-80 transition-opacity whitespace-nowrap">
              Verified
            </span>
          </div>
        )}
      </div>
       {/* Contact Information */}
       <div className="space-y-3 mb-6">
        {/* Provider Phone number */}
        <div className="flex items-center">
          <div className="flex-shrink-0 w-8">
            <Phone className="text-gray-500 w-5 h-5" />
          </div>
          <div className="text-gray-600">Phone number: {providerData.telephone_number}</div>
        </div>
        {/* Provider Email */}
        <div className="flex items-center">
          <div className="flex-shrink-0 w-8">
            <Mail className="text-gray-500 w-5 h-5" />
          </div>
          <div className="text-gray-600">Email: {providerData.email}</div>
        </div>
      </div>
       {/* Ratings Section */}
       <div className="mt-5 pt-5 border-t border-gray-100">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Reviews & Ratings</h3>
        
        {totalReviews === 0 ? (
          <div className="text-gray-500 italic">No reviews yet.</div>
        ) : (
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Left side: Average Rating + Star Display */}
            <div className="flex flex-col items-center px-4">
              <div className="text-6xl font-bold text-gray-800 leading-tight">
                {averageRating.toFixed(1)}
              </div>
              <div className="mt-2">{renderStars(averageRating)}</div>
              <div className="text-sm text-gray-500 mt-2">
                ({totalReviews} reviews)
              </div>
            </div>

          {/* Right side: Distribution bars */}
          <div className="flex-1 w-full space-y-2.5">
              {[5, 4, 3, 2, 1].map((rating) => {
                const ratingCount =
                  ratingDistribution[
                    rating.toString() as keyof typeof ratingDistribution
                  ];
                const percentage = getRatingPercentage(rating);

                return (
                  <div key={rating} className="flex items-center space-x-2">
                    <Star className="text-yellow-500 w-4 h-4 fill-current" />
                    <span className="text-sm w-4 font-medium text-gray-600">
                      {rating}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded h-2.5 relative">
                      <div
                        className="bg-yellow-500 h-2.5 rounded absolute left-0 top-0"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 w-10 text-right">
                      {ratingCount}
                    </span>
                  </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default ProviderDetails;
