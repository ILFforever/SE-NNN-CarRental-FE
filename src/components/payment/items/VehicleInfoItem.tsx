import React from "react";

type VehicleInfoItemProps = {
  car: any;
};

export const VehicleInfoItem: React.FC<VehicleInfoItemProps> = ({ car }) => {
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
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.2 1 12 1 13v3c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <path d="M9 17h6" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      </div>
      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          Vehicle
        </h3>
        <p className="text-base text-gray-800">
          {typeof car === "object"
            ? `${car.brand} ${car.model}`
            : "Vehicle details not available"}
        </p>
        {car && car.tier && (
          <p className="text-xs text-gray-500 mt-1">
            {["Economy", "Standard", "Premium", "Luxury"][car.tier] ||
              "Standard"}{" "}
            Class
          </p>
        )}
      </div>
    </div>
  );
};