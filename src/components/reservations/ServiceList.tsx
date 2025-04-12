"use client";

import React from "react";
import { getRentalPeriod } from "@/libs/bookingUtils";
import { Dayjs } from "dayjs";

interface ServiceListProps {
  selectedServices: string[];
  services: Service[];
  pickupDate: Dayjs | null;
  returnDate: Dayjs | null;
}

const ServiceList: React.FC<ServiceListProps> = ({
  selectedServices,
  services,
  pickupDate,
  returnDate,
}) => {
  if (!selectedServices.length || !services.length) {
    return null;
  }

  return (
    <div className="space-y-2">
      {services
        .filter((service) => selectedServices.includes(service._id))
        .map((service) => {
          const cost = service.daily
            ? service.rate * getRentalPeriod(pickupDate, returnDate)
            : service.rate;
          return (
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
                      ? `${service.description.substring(0, 100)}...`
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
          );
        })}
      <div className="flex justify-between items-center mt-3 text-sm font-medium">
        <span className="text-gray-600">Total Services:</span>
        <span>
          $
          {services
            .filter((service) => selectedServices.includes(service._id))
            .reduce((total, service) => {
              const cost = service.daily
                ? service.rate * getRentalPeriod(pickupDate, returnDate)
                : service.rate;
              return total + cost;
            }, 0)
            .toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default ServiceList;