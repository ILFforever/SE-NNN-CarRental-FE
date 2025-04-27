import React, { useEffect, useState } from "react";
import Link from "next/link";

type SuccessStateProps = {
    redirectUrl?: string;
    redirectTime?: number; 
    reservationId?: string;
    paymentAmount?: number;
    remainingCredits?: number;
    providerName?: string;
    transactionId?: string;
  };

export const SuccessState: React.FC<SuccessStateProps> = ({
    redirectUrl = "/account/reservations",
    redirectTime = 5,
    reservationId,
    paymentAmount,
    remainingCredits,
    providerName,
    transactionId,
  }) => {
    const [timeLeft, setTimeLeft] = useState(redirectTime);
  
    useEffect(() => {
      if (redirectTime <= 0) return;
  
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = redirectUrl;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
  
      return () => clearInterval(timer);
    }, [redirectTime, redirectUrl]);
  
    return (
      <main className="py-10 px-4 max-w-4xl mx-auto">
        <div className="bg-green-50 p-8 rounded-lg shadow-sm border border-green-100 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-medium mb-4 text-gray-800">
            Payment Successful!
          </h2>
          <div className="max-w-md mx-auto">
            <p className="mb-4 text-gray-700">
              Your payment has been processed successfully and the funds have been transferred to the car provider.
            </p>
            
            <div className="bg-white p-4 rounded-lg border border-green-100 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Payment Amount:</span>
                <span className="text-green-700 font-medium">
                  ${paymentAmount ? paymentAmount.toFixed(2) : '0.00'}
                </span>
              </div>
              
              {remainingCredits !== undefined && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Remaining Credits:</span>
                  <span className="text-blue-700 font-medium">
                    ${remainingCredits.toFixed(2)}
                  </span>
                </div>
              )}
              
              {providerName && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Recipient:</span>
                  <span className="text-gray-800">
                    {providerName}
                  </span>
                </div>
              )}
              
              {reservationId && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Reservation ID:</span>
                  <span className="text-gray-800 font-mono text-sm">
                    {reservationId}
                  </span>
                </div>
              )}
              
              {transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="text-gray-800 font-mono text-sm">
                    {transactionId}
                  </span>
                </div>
              )}
            </div>
            
            <div className="h-2 w-full bg-gray-200 rounded-full mt-6 mb-2 overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-1000"
                style={{
                  width: `${((redirectTime - timeLeft) / redirectTime) * 100}%`,
                }}
              ></div>
            </div>
            {redirectTime > 0 && (
              <p className="text-sm text-gray-500 mb-6">
                You will be redirected to your reservations in {timeLeft}{" "}
                {timeLeft === 1 ? "second" : "seconds"}...
              </p>
            )}
            <Link
              href={redirectUrl}
              className="px-6 py-2.5 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors inline-block"
            >
              View My Reservations
            </Link>
          </div>
        </div>
      </main>
    );
  };