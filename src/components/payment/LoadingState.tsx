import React from "react";

type LoadingStateProps = {
  message?: string;
};

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading payment details...",
}) => {
  return (
    <main className="py-16 px-4 max-w-4xl mx-auto text-center">
      <div className="flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#8A7D55] rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#8A7D55] animate-pulse"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <p className="mt-6 text-gray-700 font-medium">{message}</p>
        <p className="mt-2 text-sm text-gray-500">
          This may take a few moments. Please wait...
        </p>
      </div>
    </main>
  );
};

export default LoadingState;