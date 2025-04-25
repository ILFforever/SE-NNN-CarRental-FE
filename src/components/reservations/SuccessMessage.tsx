import React from "react";
import { Check, Calendar, Car, X, CreditCard, Info } from "lucide-react";
import { formatCurrency } from "@/libs/bookingUtils";

interface RentalDetails {
  carName: string;
  pickupDate: string;
  returnDate: string;
  reservationId?: string;
}

interface SuccessMessageProps {
  message: string;
  depositAmount: number;
  rentalDetails: RentalDetails;
  remainingCredits?: number;
  onClose: () => void;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  depositAmount,
  rentalDetails,
  remainingCredits,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-green-50 p-4 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <Check size={20} className="text-green-600" />
            </div>
            <h2 className="text-lg font-medium text-green-800">Booking Successful!</h2>
          </div>
          <p className="text-green-700">{message}</p>
        </div>

        {/* Receipt-like content */}
        <div className="p-6 pt-5">
          <h3 className="text-gray-700 font-medium border-b pb-2 mb-3">Reservation Details</h3>
          
          {/* Reservation ID */}
          {rentalDetails.reservationId && (
            <div className="flex items-start py-2 border-b border-dashed border-gray-200">
              <div className="w-8 flex-shrink-0 text-gray-500 mt-0.5">
                <Info size={16} />
              </div>
              <div className="flex-1">
                <span className="text-sm text-gray-600">Reservation ID</span>
                <p className="font-medium text-gray-800">{rentalDetails.reservationId}</p>
              </div>
            </div>
          )}

          {/* Car Details */}
          <div className="flex items-start py-2 border-b border-dashed border-gray-200">
            <div className="w-8 flex-shrink-0 text-gray-500 mt-0.5">
              <Car size={16} />
            </div>
            <div className="flex-1">
              <span className="text-sm text-gray-600">Vehicle</span>
              <p className="font-medium text-gray-800">{rentalDetails.carName}</p>
            </div>
          </div>

          {/* Pickup */}
          <div className="flex items-start py-2 border-b border-dashed border-gray-200">
            <div className="w-8 flex-shrink-0 text-gray-500 mt-0.5">
              <Calendar size={16} />
            </div>
            <div className="flex-1">
              <span className="text-sm text-gray-600">Pickup Date & Time</span>
              <p className="font-medium text-gray-800">{rentalDetails.pickupDate}</p>
            </div>
          </div>

          {/* Return */}
          <div className="flex items-start py-2 border-b border-dashed border-gray-200">
            <div className="w-8 flex-shrink-0 text-gray-500 mt-0.5">
              <Calendar size={16} />
            </div>
            <div className="flex-1">
              <span className="text-sm text-gray-600">Return Date & Time</span>
              <p className="font-medium text-gray-800">{rentalDetails.returnDate}</p>
            </div>
          </div>

          {/* Deposit Payment */}
          <div className="flex items-start py-2 border-b border-gray-200 bg-blue-50 -mx-6 px-6 mt-3 mb-3">
            <div className="w-8 flex-shrink-0 text-blue-500 mt-0.5">
              <CreditCard size={16} />
            </div>
            <div className="flex-1">
              <span className="text-sm text-blue-700">Deposit Paid</span>
              <p className="font-medium text-blue-800">{formatCurrency(depositAmount)}</p>
            </div>
          </div>

          {/* Remaining Credits */}
          {remainingCredits !== undefined && (
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-200 mt-4">
              <span className="text-sm font-medium text-gray-700">Remaining Balance:</span>
              <span className="font-bold text-green-600">{formatCurrency(remainingCredits)}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-[#8A7D55] to-[#9D8E62] text-white rounded-md hover:from-[#7D7049] hover:to-[#8A7D55] transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessMessage;