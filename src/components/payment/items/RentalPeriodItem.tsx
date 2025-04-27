import React from "react";

type RentalPeriodItemProps = {
  startDate: Date;
  returnDate: Date;
  rentalDays: number;
  formatDate: (date: Date) => string;
};

export const RentalPeriodItem: React.FC<RentalPeriodItemProps> = ({
  startDate,
  returnDate,
  rentalDays,
  formatDate,
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
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
      </div>
      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          Rental Period
        </h3>
        <p className="text-base text-gray-800">
          {formatDate(startDate)} - {formatDate(returnDate)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {rentalDays} {rentalDays === 1 ? "day" : "days"} rental
        </p>
      </div>
    </div>
  );
};
