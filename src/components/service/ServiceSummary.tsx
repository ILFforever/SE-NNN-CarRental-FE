import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';


interface SelectedServicesProps {
  selectedServices: string[];
  services: Service[];
  calculateServicesCost: () => number;
}

export default function SelectedServicesToggle({ 
  selectedServices, 
  services, 
  calculateServicesCost 
}: SelectedServicesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Only render if there are selected services
  if (selectedServices.length === 0 || services.length === 0) {
    return null;
  }

  // Get the total cost of services
  const totalServicesCost = calculateServicesCost();
  const filteredServices = services.filter(service => selectedServices.includes(service._id));

  return (
    <div className="border-t border-gray-200 mt-6 pt-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Additional Services (this is user Service Summary)</h3>
        <div className="flex items-center">
          {!isExpanded && (
            <span className="mr-3 text-[#8A7D55] font-medium">
              ${totalServicesCost.toFixed(2)}/day
            </span>
          )}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={isExpanded ? "Collapse services" : "Expand services"}
          >
            <ChevronDown 
              size={18} 
              className={`transition-transform duration-300 ${isExpanded ? 'transform rotate-180' : ''}`} 
            />
          </button>
        </div>
      </div>
      
      <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[400px]' : 'max-h-0'}`}>
        <div className="space-y-2 pr-2">
          {filteredServices.map(service => (
            <div key={service._id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <div>
                <span className="font-medium text-gray-800">{service.name}</span>
                {service.description && (
                  <p className="text-xs text-gray-500 mt-1 max-w-md">
                    {service.description.length > 100 
                      ? `${service.description.substring(0, 100)}...` 
                      : service.description}
                  </p>
                )}
              </div>
              <span className="text-[#8A7D55] font-medium">${service.rate.toFixed(2)}/day</span>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center mt-3 text-sm font-medium">
          <span className="text-gray-600">Total Additional Services:</span>
          <span className="text-[#8A7D55]">
            ${totalServicesCost.toFixed(2)}/day
          </span>
        </div>
      </div>
    </div>
  );
}