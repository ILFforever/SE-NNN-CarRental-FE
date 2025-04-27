import React from "react";

type TimeInfoItemProps = {
  pickupTime: string;
  returnTime: string;
};

export const TimeInfoItem: React.FC<TimeInfoItemProps> = ({
  pickupTime,
  returnTime,
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
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          Pickup/Return Time
        </h3>
        <p className="text-base text-gray-800">
          {pickupTime || "N/A"} / {returnTime || "N/A"}
        </p>
      </div>
    </div>
  );
};