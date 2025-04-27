import React from "react";
import Link from "next/link";

type ErrorStateProps = {
  error: string;
};

export const ErrorState = ({ error }: ErrorStateProps) => {
  return (
    <main className="py-10 px-4 max-w-4xl mx-auto">
      <div className="bg-red-100 text-red-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-medium mb-4">Payment Error</h2>
        <p className="mb-6">{error}</p>
        <Link
          href="/account/reservations"
          className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
        >
          Back to My Reservations
        </Link>
      </div>
    </main>
  );
};