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
    <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8 transition-all">
      <div className="bg-[#8A7D55] text-white px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-serif font-medium">Reservation Summary</h2>
        <span className="text-lg font-medium">{formatCurrency(totalCost)}</span>
      </div>
      
      {/* ส่วนแสดงข้อมูลสำคัญที่เห็นได้ทันที */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Car size={20} className="text-[#8A7D55]" />
            <p className="font-medium text-gray-800">{car.brand} {car.model}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar size={20} className="text-[#8A7D55]" />
            <p className="text-gray-800">
              {rentalDays} {rentalDays === 1 ? "day" : "days"}
            </p>
          </div>
        </div>
        
        {/* ปุ่มแสดงรายละเอียดการเช่ารถ */}
        <div className="border-t border-gray-100 pt-2">
          <button
            onClick={() => setDetailsExpanded(!detailsExpanded)}
            className="w-full flex justify-between items-center py-3 text-gray-700 hover:text-[#8A7D55] transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Info size={18} />
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
            className={`overflow-hidden transition-all duration-300 ${
              detailsExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-3 bg-gray-50 rounded-md space-y-4 mt-2">
              {/* รายละเอียดรถ */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Vehicle</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Make/Model:</span>
                  </div>
                  <div className="text-right">
                    {car.brand} {car.model}
                  </div>
                  
                  <div>
                    <span className="text-gray-500">License:</span>
                  </div>
                  <div className="text-right">
                    {car.license_plate || "N/A"}
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Daily Rate:</span>
                  </div>
                  <div className="text-right">
                    ${car.dailyRate?.toFixed(2) || "0.00"}
                  </div>
                  
                  {car.tier !== undefined && (
                    <>
                      <div>
                        <span className="text-gray-500">Vehicle Tier:</span>
                      </div>
                      <div className="text-right">
                        {getTierName(car.tier)}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* รายละเอียดการเช่า */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Rental Period</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Pickup:</span>
                  </div>
                  <div className="text-right">
                    {pickupDate?.format("MMM D, YYYY")} at {pickupTime}
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Return:</span>
                  </div>
                  <div className="text-right">
                    {returnDate?.format("MMM D, YYYY")} at {returnTime}
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Duration:</span>
                  </div>
                  <div className="text-right">
                    {rentalDays} {rentalDays === 1 ? "day" : "days"}
                  </div>
                </div>
                
                {pickupDate && returnDate && (
                  <p className="text-xs text-gray-500 mt-2 italic">
                    Duration includes precise pickup and return time calculations
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* ส่วนบริการเสริม (แสดงเฉพาะเมื่อมีการเลือกบริการ) */}
        {selectedServices.length > 0 && services.length > 0 && (
          <div className="border-t border-gray-100 pt-2">
            <button
              onClick={() => setServicesExpanded(!servicesExpanded)}
              className="w-full flex justify-between items-center py-3 text-gray-700 hover:text-[#8A7D55] transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Tag size={18} />
                <span className="font-medium">Additional Services</span>
                <span className="bg-[#F0F4FF] text-[#3366FF] text-xs px-2 py-1 rounded-full">
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
              className={`overflow-hidden transition-all duration-300 ${
                servicesExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="p-3 bg-gray-50 rounded-md space-y-2 mt-2">
                {selectedServiceItems.map((service) => {
                  const cost = service.daily
                    ? service.rate * rentalDays
                    : service.rate;
                  
                  return (
                    <div key={service._id} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-1">
                          <Check size={16} className="text-green-500" />
                          <span className="font-medium text-gray-800">
                            {service.name}
                          </span>
                        </div>
                        
                        {service.description && (
                          <p className="text-xs text-gray-500 mt-1 pl-5">
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
                        <div className="text-xs text-gray-500">
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
        
        {/* ส่วนสรุปค่าใช้จ่าย - แสดงแบบ compact */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          {/* แสดงเฉพาะรายการสำคัญ */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Car Rental ({rentalDays} {rentalDays === 1 ? "day" : "days"}):</span>
              <span>${((car?.dailyRate || 0) * rentalDays).toFixed(2)}</span>
            </div>
            
            {selectedServices.length > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Additional Services:</span>
                <span>${servicesCost.toFixed(2)}</span>
              </div>
            )}
            
            {userTier > 0 && (
              <div className="flex justify-between items-center text-sm text-green-600">
                <span>Loyalty Discount ({getTierDiscount(userTier)}%):</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 text-lg font-medium">
              <span>Total:</span>
              <span className="text-[#8A7D55]">{formatCurrency(totalCost)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* ปุ่มยืนยันการจอง */}
      <div className="px-6 py-4 bg-gray-50">
        <button
          onClick={onSubmit}
          disabled={!formValid || isSubmitting}
          className={`w-full py-3 text-white rounded-md font-medium transition-all duration-200 flex justify-center items-center ${
            formValid && !isSubmitting
              ? "bg-[#8A7D55] hover:bg-[#766b48] shadow hover:shadow-md"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            "Confirm Reservation"
          )}
        </button>
        
        {/* คำอธิบายการคำนวณ */}
        {pickupDate && returnDate && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            <p>* Rental cost calculated based on exact pickup and return times</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationSummary;