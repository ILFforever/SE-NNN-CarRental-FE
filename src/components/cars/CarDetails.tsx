"use client";

import React from "react";
import { getTierName } from "@/libs/bookingUtils";
import CarImageGallery from "@/components/cars/CarImageGallery";
import FavoriteHeartButton from "./FavoriteHeartButton";

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
      <h2 className="text-2xl font-serif font-medium mb-6 text-[#6B5B35]">
        Vehicle Details
      </h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
        <div className="aspect-w-16 aspect-h-9 max-h-[300px] overflow-hidden">
          <CarImageGallery car={car} showFavoriteButton = {true} 
          />

        </div>
        <div className="p-6 space-y-5">
          <div>
            <h3 className="text-xl font-semibold text-[#8A7D55] font-serif flex items-center">
              {car.brand} {car.model}
              {car.tier >= 3 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  Premium
                </span>
              )}
            </h3>
            <p className="text-gray-600 mt-1">
              {car.type} {car.color ? `| ${car.color}` : ""}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500 mb-1">License Plate</p>
              <p className="font-medium text-gray-800">
                {car.license_plate || "N/A"}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500 mb-1">Daily Rate</p>
              <p className="font-medium text-gray-800">
                ${car.dailyRate?.toFixed(2) || "0.00"}/day
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500 mb-1">Manufacture Date</p>
              <p className="font-medium text-gray-800">
                {car.manufactureDate
                  ? new Date(car.manufactureDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500 mb-1">Tier</p>
              <p className="font-medium text-gray-800">
                {car.tier !== undefined ? getTierName(car.tier) : "N/A"}
              </p>
            </div>
          </div>

          <div className="mt-1">
            <p className="text-sm text-gray-500 mb-2">Status</p>
            <span
              className={`px-3 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-md ${
                isAvailable
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              } transition-colors duration-200`}
            >
              {isAvailable
                ? "Available for Reservation"
                : "Not Available for Selected Dates"}
            </span>
          </div>

          {/* Vehicle features with improved styling */}
          <div className="mt-1">
            <p className="text-sm text-gray-500 mb-3">Features</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-gray-100 text-gray-800 text-sm rounded-md border border-gray-200 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1.5 text-[#8A7D55]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Air Conditioning
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-800 text-sm rounded-md border border-gray-200 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1.5 text-[#8A7D55]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Bluetooth
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-800 text-sm rounded-md border border-gray-200 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1.5 text-[#8A7D55]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                Navigation
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-800 text-sm rounded-md border border-gray-200 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1.5 text-[#8A7D55]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
                Leather Seats
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Service Selection styling */}
      {car && session?.user?.token && (
        <div className="mt-6">
          <h2 className="text-2xl font-serif font-medium mb-4 text-[#6B5B35]">
            Additional Services
          </h2>
          <div className="bg-white shadow-md rounded-lg overflow-hidden p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
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
