import React from "react";
import Link from "next/link";

type ErrorStateProps = {
  error: string;
  backUrl?: string;
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  backUrl = "/account/reservations",
}) => {
  return (
    <main className="py-10 px-4 max-w-4xl mx-auto">
      <div className="bg-red-50 text-red-800 p-6 rounded-lg shadow-sm border border-red-100">
        <div className="flex items-start">
          <div className="mr-4 mt-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-medium mb-2">Payment Error</h2>
            <p className="mb-6 text-red-700">{error}</p>
            <Link
              href={backUrl}
              className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors inline-flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to My Reservations
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ErrorState;