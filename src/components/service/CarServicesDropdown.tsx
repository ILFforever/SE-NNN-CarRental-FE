import React, { useState, useRef, useEffect, useMemo } from 'react';
import { getAllServices } from '@/libs/getAllServices';

interface CarServicesDropdownProps {
  token: string;
  serviceIds: string[];
}

export default function CarServicesDropdown({ token, serviceIds }: CarServicesDropdownProps) {
  const { services: allServices, isLoading, error } = getAllServices(token);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLTableDataCellElement>(null);
  
  // Use useMemo to filter services only when allServices or serviceIds change
  const carServices = useMemo(() => {
    return allServices.filter(service => serviceIds.includes(service._id));
  }, [allServices, serviceIds]);
  
  // Calculate total additional rate with useMemo to avoid recalculation on re-renders
  const totalAdditionalRate = useMemo(() => {
    return carServices.reduce((sum, service) => sum + service.rate, 0);
  }, [carServices]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setExpandedService(null);
      }
    }
    
    // Only add event listener when dropdown is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);
  
  // Toggle dropdown - only if there are services
  const toggleDropdown = () => {
    if (carServices.length > 0) {
      setIsOpen(!isOpen);
      if (isOpen) {
        setExpandedService(null);
      }
    }
  };
  
  // Toggle service description
  const toggleDescription = (e: React.MouseEvent, serviceId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setExpandedService(expandedService === serviceId ? null : serviceId);
  };
  
  if (isLoading) {
    return (
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-sm text-gray-500">Loading...</div>
      </td>
    );
  }
  
  if (error) {
    return (
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-sm text-red-500">Error loading services</div>
      </td>
    );
  }
  
  return (
    <td className="px-4 py-3 whitespace-normal relative" ref={dropdownRef}>
      <div 
        onClick={toggleDropdown}
        className={`flex items-center ${carServices.length > 0 ? 'cursor-pointer text-[#8A7D55] font-medium' : 'text-gray-500'} text-sm`}
      >
        {carServices.length === 0 ? (
          <span>No additional services</span>
        ) : (
          <div className="flex items-center">
            <span>{carServices.length} service{carServices.length !== 1 ? 's' : ''}</span>
            <svg 
              className={`w-4 h-4 ml-1 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Dropdown panel - using React.memo for better performance */}
      {isOpen && carServices.length > 0 && (
        <ServicesDropdownPanel 
          carServices={carServices} 
          expandedService={expandedService} 
          toggleDescription={toggleDescription} 
          totalAdditionalRate={totalAdditionalRate}
        />
      )}
    </td>
  );
}

// Separate component for services panel to prevent unnecessary re-renders
const ServicesDropdownPanel = React.memo(({ 
  carServices, 
  expandedService, 
  toggleDescription, 
  totalAdditionalRate 
}: { 
  carServices: any[], 
  expandedService: string | null, 
  toggleDescription: (e: React.MouseEvent, serviceId: string) => void,
  totalAdditionalRate: number
}) => {
  return (
    <div className="absolute left-0 z-10 mt-1 w-72 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden">
      <div className="py-1 max-h-60 overflow-y-auto scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
          <h3 className="font-medium text-gray-700">Additional Services</h3>
        </div>
        
        {carServices.map(service => {
          const isExpanded = expandedService === service._id;
          
          return (
            <div key={service._id} className="border-b border-gray-100 last:border-b-0">
              <div className="px-3 py-2 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">{service.name}</span>
                  <div className="flex items-center">
                    {service.rate > 0 && (
                      <span className="text-sm bg-[#F5F2EA] text-[#8A7D55] px-2 py-0.5 rounded-full mr-2">
                        +${service.rate}/day
                      </span>
                    )}
                    {service.description && (
                      <button
                        type="button"
                        onClick={(e) => toggleDescription(e, service._id)}
                        className={`flex items-center justify-center h-6 w-6 rounded-full focus:outline-none transition-colors ${
                          isExpanded
                            ? 'bg-[#8A7D55] text-white hover:bg-[#6A5D35]'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        aria-label={isExpanded ? "Hide description" : "Show description"}
                        title={isExpanded ? "Hide details" : "View details"}
                      >
                        <svg 
                          className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`}
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                
                {isExpanded && service.description && (
                  <div className="mt-2 px-3 py-2 text-sm border-t border-[#DFD8C3] bg-[#FAF7F1] rounded-md">
                    <div className="flex items-start">
                      <svg className="h-4 w-4 text-[#8A7D55] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <p className="text-gray-700 leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="border-t border-gray-100 px-3 py-2 bg-gray-50 text-right">
        <p className="text-xs text-gray-500">Total additional rate: <span className="font-bold text-[#8A7D55]">+${totalAdditionalRate}/day</span></p>
      </div>
    </div>
  );
});