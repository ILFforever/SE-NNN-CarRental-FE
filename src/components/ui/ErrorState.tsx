"use client";

import React from "react";
import Link from "next/link";

interface ErrorStateProps {
  error: string;
  isLoggedIn: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, isLoggedIn }) => {
  return (
    <div className="bg-red-100 text-red-800 p-4 rounded-lg">
      <p>{error}</p>
      {!isLoggedIn && (
        <div className="mt-4">
          <Link
            href="/signin?callbackUrl=/catalog"
            className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
          >
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
};

export default ErrorState;