"use client";

import React, { useState } from "react";
import { Dayjs } from "dayjs";
import { ChevronDown } from "lucide-react";
import {
  getTierName,
  formatCurrency,
  getTierDiscount,
  getRentalPeriod,
  calculateServicesTotalCost,
  calculateSubtotal,
  calculateDiscount,
  getTotalCost,
} from "@/libs/bookingUtils";

interface ReservationSummaryProps {
  car: Car;
  pickupDate: Dayjs | null;  // นี่คือ pickupDateTime แล้ว
  returnDate: Dayjs | null;  // นี่คือ returnDateTime แล้ว
  pickupTime: string;
  returnTime: string;
  userTier: number;
  selectedServices: string[];
  services: Service[];
  formValid: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
}

const ReservationSummary: React.FC<ReservationSummaryProps> = ({
  car,
  pickupDate,
  returnDate,
  pickupTime,
  returnTime,
  userTier,
  selectedServices,
  services,
  formValid,
  isSubmitting,
  onSubmit,
}) => {
  const [servicesExpanded, setServicesExpanded] = useState(false);

  // คำนวณจำนวนวันเช่าโดยคำนึงถึงวันที่และเวลา
  const rentalDays = getRentalPeriod(pickupDate, returnDate);

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
      <div className="bg-[#8A7D55] text-white px-6 py-4">
        <h2 className="text-xl font-serif font-medium">
          Reservation Summary
        </h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Vehicle</h3>
            <p className="text-gray-700">
              <span className="text-gray-500">Make/Model:</span> {car.brand}{" "}
              {car.model}
            </p>
            <p className="text-gray-700">
              <span className="text-gray-500">License:</span>{" "}
              {car.license_plate || "N/A"}
            </p>
            <p className="text-gray-700">
              <span className="text-gray-500">Daily Rate:</span> $
              {car.dailyRate?.toFixed(2) || "0.00"}
            </p>
            {car.tier !== undefined && (
              <p className="text-gray-700">
                <span className="text-gray-500">Vehicle Tier:</span>{" "}
                {getTierName(car.tier)}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Rental Period</h3>
            <p className="text-gray-700">
              <span className="text-gray-500">Pickup:</span>{" "}
              {pickupDate?.format("MMM D, YYYY")} at {pickupTime}
            </p>
            <p className="text-gray-700">
              <span className="text-gray-500">Return:</span>{" "}
              {returnDate?.format("MMM D, YYYY")} at {returnTime}
            </p>
            <p className="text-gray-700">
              <span className="text-gray-500">Duration:</span>{" "}
              {rentalDays} {rentalDays === 1 ? "day" : "days"}
            </p>
            {pickupDate && returnDate && (
              <p className="text-xs text-gray-500 mt-1">
                Duration includes precise pickup and return time calculations
              </p>
            )}
          </div>
        </div>

        {/* Selected Services Section */}
        {selectedServices.length > 0 && services.length > 0 && (
          <div className="border-t border-gray-200 mt-6 pt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Additional Services</h3>
              <div className="flex items-center">
                {!servicesExpanded && (
                  <span className="mr-3 text-[#8A7D55] font-medium"></span>
                )}
                <button
                  onClick={() => setServicesExpanded(!servicesExpanded)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={
                    servicesExpanded
                      ? "Collapse services"
                      : "Expand services"
                  }
                >
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${
                      servicesExpanded ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            <div
              className={`transition-all duration-300 overflow-hidden ${
                servicesExpanded ? "max-h-[400px]" : "max-h-0"
              }`}
            >
              <div className="space-y-2 pr-2">
                {services
                  .filter((service) =>
                    selectedServices.includes(service._id)
                  )
                  .map((service) => (
                    <div
                      key={service._id}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <span className="font-medium text-gray-800">
                          {service.name}
                        </span>
                        {service.description && (
                          <p className="text-xs text-gray-500 mt-1 max-w-md">
                            {service.description.length > 100
                              ? `${service.description.substring(
                                  0,
                                  100
                                )}...`
                              : service.description}
                          </p>
                        )}
                      </div>
                      <span className="text-[#8A7D55] font-medium">
                        {service.daily
                          ? `$${service.rate.toFixed(2)}/day`
                          : `$${service.rate.toFixed(2)}`}
                      </span>
                    </div>
                  ))}
              </div>

              <div className="flex justify-between items-center mt-3 text-sm font-medium">
                <span className="text-gray-600">
                  Total Additional Services:
                </span>
                <div className="flex items-center space-x-2">
                  {services
                    .filter((service) =>
                      selectedServices.includes(service._id)
                    )
                    .map((service) => (
                      <span
                        key={service._id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#F0F4FF] text-[#3366FF]"
                      >
                        {service.daily ? "Daily" : "One-Time"} $
                        {service.rate.toFixed(2)}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cost Breakdown */}
        <div className="border-t border-gray-200 mt-6 pt-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Base Daily Rate:</span>
            <span>${car?.dailyRate?.toFixed(2) || "0.00"}</span>
          </div>

          {selectedServices.length > 0 && (
            <>
              <div className="border-t border-gray-200 mt-3 pt-3">
                <h4 className="text-gray-800 font-medium mb-2">
                  Additional Services:
                </h4>
                {services
                  .filter((service) =>
                    selectedServices.includes(service._id)
                  )
                  .map((service) => {
                    const cost = service.daily
                      ? service.rate * rentalDays
                      : service.rate;
                    return (
                      <div
                        key={service._id}
                        className="flex justify-between items-center py-1"
                      >
                        <span className="text-gray-600">
                          {service.name}
                        </span>
                        <span>
                          ${service.rate.toFixed(2)}
                          {service.daily
                            ? ` × ${rentalDays} days`
                            : ""}{" "}
                          = ${cost.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                <div className="flex justify-between items-center mt-2 font-medium">
                  <span>Services Subtotal:</span>
                  <span>
                    $
                    {calculateServicesTotalCost(
                      selectedServices,
                      services,
                      pickupDate,
                      returnDate
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">Number of Days:</span>
            <span>{rentalDays}</span>
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">Car Rental Subtotal:</span>
            <span>
              ${((car?.dailyRate || 0) * rentalDays).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">Total Subtotal:</span>
            <span>${calculateSubtotal(
              pickupDate,
              returnDate,
              car?.dailyRate || 0,
              selectedServices,
              services
            ).toFixed(2)}</span>
          </div>

          {userTier > 0 && (
            <div className="flex justify-between items-center mt-2 text-green-600">
              <span className="text-green-600">
                Loyalty Discount ({getTierDiscount(userTier)}%):
              </span>
              <span>-${calculateDiscount(
                pickupDate,
                returnDate,
                car?.dailyRate || 0,
                selectedServices,
                services,
                userTier
              ).toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between items-center mt-4 border-t border-gray-200 pt-3 text-lg font-medium">
            <span>Total Cost:</span>
            <span className="text-[#8A7D55]">
              {formatCurrency(
                getTotalCost(
                  pickupDate,
                  returnDate,
                  car?.dailyRate || 0,
                  selectedServices,
                  services,
                  userTier
                )
              )}
            </span>
          </div>
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="text-center p-6 pt-0">
        <button
          onClick={onSubmit}
          disabled={!formValid || isSubmitting}
          className={`px-8 py-3 text-white rounded-md font-medium transition-all duration-200 ${
            formValid && !isSubmitting
              ? "bg-[#8A7D55] hover:bg-[#766b48] shadow-md hover:shadow-lg"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Processing...
            </span>
          ) : (
            "Confirm Reservation"
          )}
        </button>
        
        {/* คำอธิบายสั้นๆ เกี่ยวกับการคำนวณวันที่กับเวลา */}
        {pickupDate && returnDate && (
          <div className="mt-2 text-xs text-gray-500">
            <p>* Rental cost calculated based on exact pickup and return times.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationSummary;