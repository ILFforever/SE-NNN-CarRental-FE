import React from "react";

type ReservationStatusItemProps = {
  reservationId: string;
  status?: string;
};

export const ReservationStatusItem: React.FC<ReservationStatusItemProps> = ({
  reservationId,
  status = "Awaiting Payment",
}) => {
  return (
    <div className="flex items-start p-4 bg-gray-50 rounded-lg">
      <div className="mr-4 p-2 bg-[#8A7D55] bg-opacity-10 rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#8A7D55]"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </svg>
      </div>
      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          Reservation Status
        </h3>
        <p className="text-base text-gray-800">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            {status}
          </span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          ID: {reservationId.substring(0, 8)}...
        </p>
      </div>
    </div>
  );
};
