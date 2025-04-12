"use client";

import React, { useState } from "react";
import { Dayjs } from "dayjs";
import { ChevronDown, Car, Calendar, Tag, Info, Check } from "lucide-react";
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
  pickupDate: Dayjs | null;
  returnDate: Dayjs | null;
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
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [servicesExpanded, setServicesExpanded] = useState(false);

  // คำนวณจำนวนวันเช่า
  const rentalDays = getRentalPeriod(pickupDate, returnDate);
  
  // คำนวณค่าใช้จ่ายทั้งหมด
  const totalCost = getTotalCost(
    pickupDate,
    returnDate,
    car?.dailyRate || 0,
    selectedServices,
    services,
    userTier
  );

  // คำนวณส่วนลด
  const discount = calculateDiscount(
    pickupDate,
    returnDate,
    car?.dailyRate || 0,
    selectedServices,
    services,
    userTier
  );
  
  // คำนวณบริการเสริมทั้งหมด
  const servicesCost = calculateServicesTotalCost(
    selectedServices,
    services,
    pickupDate,
    returnDate
  );
  
  // กรองบริการที่เลือก
  const selectedServiceItems = services.filter((service) => 
    selectedServices.includes(service._id)
  );

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8 border border-gray-200">
      <div className="bg-[#8A7D55] text-white px-6 py-5 flex justify-between items-center">
        <h2 className="text-xl font-serif font-medium">Reservation Summary</h2>
        <span className="text-lg font-medium">{formatCurrency(totalCost)}</span>
      </div>
      
      {/* ส่วนแสดงข้อมูลสำคัญที่เห็นได้ทันที */}
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-md border border-gray-100">
            <Car size={22} className="text-[#8A7D55]" />
            <div>
              <p className="text-xs text-gray-500">Vehicle</p>
              <p className="font-medium text-gray-800">{car.brand} {car.model}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-md border border-gray-100">
            <Calendar size={22} className="text-[#8A7D55]" />
            <div>
              <p className="text-xs text-gray-500">Duration</p>
              <p className="font-medium text-gray-800">
                {rentalDays} {rentalDays === 1 ? "day" : "days"}
              </p>
            </div>
          </div>
        </div>
        
        {/* ปุ่มแสดงรายละเอียดการเช่ารถ - ปรับให้เห็นได้ชัดโดยไม่ต้อง hover */}
        <div className="border-t border-gray-200 pt-3">
          <button
            onClick={() => setDetailsExpanded(!detailsExpanded)}
            className="w-full flex justify-between items-center py-3 text-gray-800 bg-gray-50 px-3 rounded-md border border-gray-200 mb-1"
            aria-expanded={detailsExpanded}
            aria-controls="rental-details-panel"
          >
            <div className="flex items-center space-x-2">
              <Info size={18} className="text-[#8A7D55]" />
              <span className="font-medium">Rental Details</span>
            </div>
            <ChevronDown
              size={18}
              className={`transition-transform duration-300 ${
                detailsExpanded ? "transform rotate-180" : ""
              }`}
            />
          </button>
          
          <div
            id="rental-details-panel"
            className={`overflow-hidden transition-all duration-300 ${
              detailsExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-4 bg-gray-50 rounded-md space-y-5 mt-1 border border-gray-200">
              {/* รายละเอียดรถ */}
              <div>
                <h3 className="text-lg font-medium text-gray-600 mb-3 border-b border-gray-200 pb-2">Vehicle Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Make/Model:</span>
                  </div>
                  <div className="text-right font-medium text-gray-800">
                    {car.brand} {car.model}
                  </div>
                  
                  <div>
                    <span className="text-gray-600">License:</span>
                  </div>
                  <div className="text-right font-medium text-gray-800">
                    {car.license_plate || "N/A"}
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Daily Rate:</span>
                  </div>
                  <div className="text-right font-medium text-gray-800">
                    ${car.dailyRate?.toFixed(2) || "0.00"}
                  </div>
                  
                  {car.tier !== undefined && (
                    <>
                      <div>
                        <span className="text-gray-600">Vehicle Tier:</span>
                      </div>
                      <div className="text-right font-medium text-gray-800">
                        {getTierName(car.tier)}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* รายละเอียดการเช่า */}
              <div>
                <h3 className="text-lg font-medium text-gray-600 mb-3 border-b border-gray-200 pb-2">Rental Period</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Pickup:</span>
                  </div>
                  <div className="text-right font-medium text-gray-800">
                    {pickupDate?.format("MMM D, YYYY")} at {pickupTime}
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Return:</span>
                  </div>
                  <div className="text-right font-medium text-gray-800">
                    {returnDate?.format("MMM D, YYYY")} at {returnTime}
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Duration:</span>
                  </div>
                  <div className="text-right font-medium text-gray-800">
                    {rentalDays} {rentalDays === 1 ? "day" : "days"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* ส่วนบริการเสริม (แสดงเฉพาะเมื่อมีการเลือกบริการ) - ปรับให้เห็นได้ชัดโดยไม่ต้อง hover */}
        {selectedServices.length > 0 && services.length > 0 && (
          <div className="border-t border-gray-200 pt-3 mt-3">
            <button
              onClick={() => setServicesExpanded(!servicesExpanded)}
              className="w-full flex justify-between items-center py-3 text-gray-800 bg-gray-50 px-3 rounded-md border border-gray-200 mb-1"
              aria-expanded={servicesExpanded}
              aria-controls="services-panel"
            >
              <div className="flex items-center space-x-2">
                <Tag size={18} className="text-[#8A7D55]" />
                <span className="font-medium">Additional Services</span>
                <span className="bg-[#F0F4FF] text-[#3366FF] text-xs px-2.5 py-1 rounded-full font-medium">
                  {selectedServices.length}
                </span>
              </div>
              <div className="flex items-center">
                <span className="mr-3 text-[#8A7D55] font-medium">
                  ${servicesCost.toFixed(2)}
                </span>
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-300 ${
                    servicesExpanded ? "transform rotate-180" : ""
                  }`}
                />
              </div>
            </button>
            
            <div
              id="services-panel"
              className={`overflow-hidden transition-all duration-300 ${
                servicesExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="p-4 bg-gray-50 rounded-md mt-1 border border-gray-200">
                {selectedServiceItems.map((service) => {
                  const cost = service.daily
                    ? service.rate * rentalDays
                    : service.rate;
                  
                  return (
                    <div key={service._id} className="flex justify-between items-start py-3 px-2 border-b border-gray-200 last:border-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Check size={16} className="text-green-500" />
                          <span className="font-medium text-gray-800">
                            {service.name}
                          </span>
                        </div>
                        
                        {service.description && (
                          <p className="text-xs text-gray-600 mt-1 pl-5">
                            {service.description.length > 80
                              ? `${service.description.substring(0, 80)}...`
                              : service.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <span className="text-[#8A7D55] font-medium">
                          ${cost.toFixed(2)}
                        </span>
                        <div className="text-xs text-gray-600">
                          {service.daily ? `$${service.rate.toFixed(2)}/day × ${rentalDays}` : "One-time fee"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* ส่วนสรุปค่าใช้จ่าย */}
        <div className="mt-5 pt-4 border-t border-gray-200">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700">Car Rental ({rentalDays} {rentalDays === 1 ? "day" : "days"}):</span>
              <span className="font-medium text-gray-800">${((car?.dailyRate || 0) * rentalDays).toFixed(2)}</span>
            </div>
            
            {selectedServices.length > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">Additional Services:</span>
                <span className="font-medium text-gray-800">${servicesCost.toFixed(2)}</span>
              </div>
            )}
            
            {userTier > 0 && (
              <div className="flex justify-between items-center text-sm text-green-700">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Loyalty Discount ({getTierDiscount(userTier)}%):
                </span>
                <span className="font-medium">-${discount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 text-lg font-medium">
              <span className="text-gray-800">Total:</span>
              <span className="text-[#8A7D55] font-semibold">{formatCurrency(totalCost)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* ปุ่มยืนยันการจอง */}
      <div className="px-6 py-5 bg-gray-50 border-t border-gray-200">
        <button
          onClick={onSubmit}
          disabled={!formValid || isSubmitting}
          className={`w-full py-3.5 text-white rounded-md font-medium transition-all duration-300 flex justify-center items-center ${
            formValid && !isSubmitting
              ? "bg-[#8A7D55]"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
              Processing...
            </>
          ) : (
            "Confirm Reservation"
          )}
        </button>
        
        {/* คำอธิบายการคำนวณ */}
        {pickupDate && returnDate && (
          <div className="mt-3 text-xs text-gray-600 text-center">
            <p>* All prices include standard insurance. Additional services may affect the final price.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationSummary;