// components/payment/PaymentBreakdown.tsx
import React, { useState } from "react";

type PaymentBreakdownProps = {
  carRentalCost: number;
  serviceCost: number;
  discountAmount: number;
  finalPrice: number;
  depositAmount: number;
  remainingAmount: number;
  rentalDays: number;
  dailyRate: number;
  depositDate?: string;
  dueDate?: string;
  services?: Service[]; // เพิ่ม services ที่ผู้ใช้เลือก
  selectedServiceIds?: string[]; // ID ของ services ที่ผู้ใช้เลือก
};

export const PaymentBreakdown: React.FC<PaymentBreakdownProps> = ({
  carRentalCost,
  serviceCost,
  discountAmount,
  finalPrice,
  depositAmount,
  remainingAmount,
  rentalDays,
  dailyRate,
  depositDate,
  dueDate,
  services = [],
  selectedServiceIds = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isServicesExpanded, setIsServicesExpanded] = useState(false);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  
  const subtotal = carRentalCost + serviceCost;

  // กรองบริการที่ผู้ใช้เลือก
  const selectedServices = services.filter(service => 
    selectedServiceIds.includes(service._id)
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center py-3 px-5 bg-gray-50 border-b border-gray-200 text-left"
      >
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#8A7D55] mr-2"
          >
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
          </svg>
          <span className="font-medium text-gray-700">Payment Details</span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-300 ${
            isExpanded ? "transform rotate-180" : ""
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div
        className={`transition-all duration-300 overflow-hidden ${
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-5">
          <div className="space-y-4">
            {/* Car Rental Cost */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-gray-600">Car Rental:</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  ${dailyRate.toFixed(2)} × {rentalDays} days
                </p>
              </div>
              <span className="font-medium text-gray-800">
                ${carRentalCost.toFixed(2)}
              </span>
            </div>

            {/* Additional Services - ปรับให้เป็น Dropdown */}
            {selectedServices.length > 0 && (
              <div className="border border-gray-100 rounded-md overflow-hidden">
                <button
                  onClick={() => setIsServicesExpanded(!isServicesExpanded)}
                  className="w-full flex justify-between items-center py-2 px-3 bg-gray-50 text-left"
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-gray-600">Additional Services:</span>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-800 mr-2">
                        ${serviceCost.toFixed(2)}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform duration-300 ${
                          isServicesExpanded ? "transform rotate-180" : ""
                        }`}
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </button>
                
                <div
                  className={`transition-all duration-300 overflow-hidden bg-white ${
                    isServicesExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-3 space-y-3">
                    {selectedServices.map((service) => (
                      <div key={service._id} className="flex justify-between items-start border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{service.name}</p>
                          {service.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{service.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-700">
                            ${service.daily 
                              ? (service.rate * rentalDays).toFixed(2)
                              : service.rate.toFixed(2)}
                          </p>
                          {service.daily && (
                            <p className="text-xs text-gray-500">
                              ${service.rate.toFixed(2)} × {rentalDays} days
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Subtotal */}
            <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-200">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium text-gray-800">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            {/* Discount */}
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span>Discount:</span>
                <span className="font-medium">
                  -${discountAmount.toFixed(2)}
                </span>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-gray-700 font-medium">Total Cost:</span>
              <span className="text-lg font-semibold text-[#8A7D55]">
                ${finalPrice.toFixed(2)}
              </span>
            </div>

            {/* Payment Status */}
            <div className="bg-gray-50 p-4 rounded-lg mt-4 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-700">
                  Payment Status
                </h4>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  Partially Paid
                </span>
              </div>

              {/* Deposit Already Paid */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm text-gray-600">Deposit Paid:</span>
                </div>
                <span className="font-medium text-green-600">
                  ${depositAmount.toFixed(2)}
                </span>
              </div>

              {/* Remaining Balance */}
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
                  <span className="text-sm text-gray-600">
                    Remaining Balance:
                  </span>
                </div>
                <span className="font-semibold text-orange-600">
                  ${remainingAmount.toFixed(2)}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentBreakdown;