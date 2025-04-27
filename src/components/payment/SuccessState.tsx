import React from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export const SuccessState = () => {
  return (
    <main className="py-10 px-4 max-w-4xl mx-auto">
      <div className="bg-green-100 text-green-800 p-8 rounded-lg shadow-md text-center">
        <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
        <h2 className="text-2xl font-medium mb-4">Payment Successful!</h2>
        <p className="mb-2">
          Your payment has been processed successfully using your credits.
        </p>
        <p className="mb-6">Your reservation is now completed.</p>
        <p className="text-sm mb-6">
          You will be redirected to your reservations...
        </p>
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