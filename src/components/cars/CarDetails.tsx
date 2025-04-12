"use client";

import React from "react";
import { getTierName } from "@/libs/bookingUtils";
import CarImageGallery from "@/components/cars/CarImageGallery";

interface CarDetailsProps {
  car: Car;
  isAvailable: boolean;
  session: any;
  selectedServices: string[];
  setSelectedServices: (services: string[]) => void;
}

const CarDetails: React.FC<CarDetailsProps> = ({
  car,
  isAvailable,
  session,
  selectedServices,
  setSelectedServices,
}) => {
  return (
    <div>
      <h2 className="text-2xl font-serif font-medium mb-6">Vehicle Details</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <CarImageGallery car={car} />
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-[#8A7D55] font-serif">
              {car.brand} {car.model}
            </h3>
            <p className="text-gray-600">
              {car.type} {car.color ? `| ${car.color}` : ""}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">License Plate</p>
              <p className="font-medium">{car.license_plate || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Daily Rate</p>
              <p className="font-medium">
                ${car.dailyRate?.toFixed(2) || "0.00"}/day
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Manufacture Date</p>
              <p className="font-medium">
                {car.manufactureDate
                  ? new Date(car.manufactureDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tier</p>
              <p className="font-medium">
                {car.tier !== undefined ? getTierName(car.tier) : "N/A"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span
              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                isAvailable
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isAvailable
                ? "Available"
                : "Not Available for Selected Dates"}
            </span>
          </div>

          {/* Vehicle features */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Features</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                Air Conditioning
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                Bluetooth
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                Navigation
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                Leather Seats
              </span>
            </div>
          </div>
        </div>
      </div>
      {car && session?.user?.token && (
        <div className="mt-6">
          <h2 className="text-2xl font-serif font-medium mb-4">
            Additional Services
          </h2>
          <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
            <ServiceSelection
              token={session.user.token}
              carId={car?._id}
              selectedServices={selectedServices}
              onServicesChange={setSelectedServices}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Import is added here to avoid circular dependency
import ServiceSelection from "@/components/service/ServiceSelection";

export default CarDetails;