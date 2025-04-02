import React, { useState, useRef, useEffect } from 'react';
import { getAllServices } from '@/libs/getAllServices';

interface Service {
  _id: string;
  name: string;
  description: string;
  rate: number;
}

interface ServiceSelectionProps {
  token: string;
  selectedServices: string[];
  onServicesChange: (services: string[]) => void;
}

export default function ServiceSelection({
  token,
  selectedServices,
  onServicesChange
}: ServiceSelectionProps) {
  const { services, isLoading, error } = getAllServices(token);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  
  // Refs for scrolling to expanded description
  const descriptionRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const listRef = useRef<HTMLDivElement>(null);
  
  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    // Reset expanded service when closing dropdown
    if (isOpen) {
      setExpandedService(null);
    }
  };

  // Toggle description visibility and scroll to it
  const toggleDescription = (e: React.MouseEvent, serviceId: string) => {
    e.stopPropagation(); // Prevent triggering the parent div click
    e.preventDefault(); // Prevent any default actions
    
    // If already expanded, just close it
    if (expandedService === serviceId) {
      setExpandedService(null);
      return;
    }
    
    // Otherwise, expand it
    setExpandedService(serviceId);
  };
  
  // Set ref for description element
  const setDescriptionRef = (el: HTMLDivElement | null, serviceId: string) => {
    descriptionRefs.current[serviceId] = el;
  };
  
  // Scroll to expanded description
  useEffect(() => {
    if (expandedService && descriptionRefs.current[expandedService]) {
      // Use a small timeout to ensure the element is rendered before scrolling
      setTimeout(() => {
        if (descriptionRefs.current[expandedService] && listRef.current) {
          const descriptionEl = descriptionRefs.current[expandedService];
          const listEl = listRef.current;
          
          // Calculate positions
          const descriptionRect = descriptionEl.getBoundingClientRect();
          const listRect = listEl.getBoundingClientRect();
          
          // Check if description is below the visible area
          if (descriptionRect.bottom > listRect.bottom) {
            // Calculate how much to scroll
            const scrollAmount = descriptionRect.bottom - listRect.bottom + 16; // 16px extra padding
            listEl.scrollTop += scrollAmount;
          }
        }
      }, 50);
    }
  }, [expandedService]);

  // Handle individual service toggle
  const handleServiceToggle = (e: React.MouseEvent, serviceId: string) => {
    e.stopPropagation(); // Stop event bubbling
    e.preventDefault(); // Prevent default behavior
    
    let updatedServices: string[];
    if (selectedServices.includes(serviceId)) {
      updatedServices = selectedServices.filter(id => id !== serviceId);
    } else {
      updatedServices = [...selectedServices, serviceId];
    }
    onServicesChange(updatedServices);
  };
  
  // Handle select all toggle
  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event bubbling
    e.preventDefault(); // Prevent default behavior
    
    if (services.length === 0) return;
    
    if (selectedServices.length === services.length) {
      onServicesChange([]);
    } else {
      const allServiceIds = services.map(service => service._id);
      onServicesChange(allServiceIds);
    }
  };
  
  // Count of selected services for display
  const selectedCount = selectedServices.length;
  const totalCount = services.length;
  const allSelected = totalCount > 0 && selectedCount === totalCount;

  if (isLoading) {
    return <div className="text-center py-3 text-gray-600 animate-pulse">Loading available services...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-sm py-2 rounded-md bg-red-50 px-3 border border-red-200">{error}</div>;
  }

  return (
    <div>
      {/* Dropdown header with counter */}
      <div 
        onClick={toggleDropdown}
        className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition-all duration-150 ${
          isOpen 
            ? 'bg-gray-50 border-[#8A7D55] shadow-sm' 
            : 'bg-white border-gray-300 hover:bg-gray-50'
        }`}
      >
        <div className="font-medium flex items-center">
          <svg className="w-5 h-5 text-[#8A7D55] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {selectedCount > 0 
            ? `${selectedCount} service${selectedCount !== 1 ? 's' : ''} selected` 
            : 'Click to add services'}
        </div>
        <div className="flex items-center">
          {selectedCount > 0 && (
            <span className="bg-[#8A7D55] text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center mr-2">
              {selectedCount}
            </span>
          )}
          <svg 
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {/* Dropdown content */}
      {isOpen && (
        <div className="mt-1 relative z-10">
          {services.length === 0 ? (
            <p className="text-gray-500 text-sm italic p-3 bg-gray-50 rounded-md border border-gray-300">No additional services available</p>
          ) : (
            <div className="border border-gray-300 rounded-md overflow-hidden shadow-md bg-white">
              {/* Select All option */}
              <div
                onClick={(e) => handleSelectAll(e)}
                className={`flex items-center p-3 cursor-pointer transition-all duration-200 ease-in-out border-b border-gray-200 ${
                  allSelected ? 'bg-[#F5F2EA]' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center flex-1">
                  <div className={`relative flex items-center justify-center h-5 w-5 mr-3 rounded ${
                    allSelected ? 'bg-[#8A7D55]' : 'border border-gray-400 bg-white'
                  }`}>
                    {allSelected && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="font-medium text-gray-800">Select All Services</span>
                </div>
              </div>
              
              {/* List of services */}
              <div 
                ref={listRef}
                className="max-h-60 overflow-y-auto scrollbar-hide"
                style={{
                  scrollbarWidth: 'none', /* Firefox */
                  msOverflowStyle: 'none', /* IE and Edge */
                }}
              >
                <style jsx>{`
                  .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                
                {services.map(service => {
                  const isSelected = selectedServices.includes(service._id);
                  const isExpanded = expandedService === service._id;
                  
                  return (
                    <div
                      key={service._id}
                      className={`border-b border-gray-100 last:border-b-0 transition-all duration-200 ${
                        isSelected 
                          ? 'bg-[#F5F2EA]' 
                          : ''
                      }`}
                    >
                      {/* Service header */}
                      <div 
                        onClick={(e) => handleServiceToggle(e, service._id)}
                        className={`flex items-center p-3 cursor-pointer hover:bg-opacity-80 ${isExpanded ? 'bg-[#F5F2EA] bg-opacity-70' : 'hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          <div 
                            className={`relative flex items-center justify-center h-5 w-5 mr-3 rounded ${
                              isSelected ? 'bg-[#8A7D55]' : 'border border-gray-400 bg-white'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleServiceToggle(e, service._id);
                            }}
                          >
                            {isSelected && (
                              <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                            <input
                              type="checkbox"
                              id={`service-${service._id}`}
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleServiceToggle(e as unknown as React.MouseEvent, service._id);
                              }}
                              className="absolute opacity-0 h-0 w-0"
                              aria-label={`Select ${service.name}`}
                            />
                          </div>
                          
                          <div 
                            className="flex-1 min-w-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleServiceToggle(e, service._id);
                            }}  
                          >
                            <label
                              htmlFor={`service-${service._id}`}
                              className="font-medium text-gray-800 cursor-pointer truncate block"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {service.name}
                            </label>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          {service.rate > 0 && (
                            <span className={`text-sm whitespace-nowrap mr-2 ${
                              isSelected 
                                ? 'bg-[#8A7D55] text-white' 
                                : 'bg-gray-100 text-gray-700'
                            } font-medium px-3 py-1 rounded-full transition-colors duration-200`}>
                              +${service.rate}/day
                            </span>
                          )}
                          
                          {service.description && (
                            <button
                              type="button"
                              onClick={(e) => toggleDescription(e, service._id)}
                              className={`flex items-center justify-center h-7 w-7 rounded-full focus:outline-none transition-colors ${
                                isExpanded
                                  ? 'bg-[#8A7D55] text-white hover:bg-[#6A5D35]'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                              aria-label={isExpanded ? "Hide description" : "Show description"}
                              title={isExpanded ? "Hide details" : "View details"}
                            >
                              <svg 
                                className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`}
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Description section with auto-scroll */}
                      {isExpanded && service.description && (
                        <div 
                          ref={(el) => setDescriptionRef(el, service._id)}
                          className="px-4 py-3 text-sm border-t border-[#DFD8C3] bg-[#FAF7F1] rounded-b-md"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-start">
                            <svg className="h-5 w-5 text-[#8A7D55] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <p className="text-gray-700 leading-relaxed">{service.description}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Selected services tags */}
      {selectedCount > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {services
            .filter(service => selectedServices.includes(service._id))
            .map(service => (
              <div 
                key={`selected-${service._id}`}
                className="inline-flex items-center bg-[#F5F2EA] text-[#8A7D55] px-3 py-1 rounded-full text-sm font-medium group"
              >
                <span className="truncate max-w-[200px]">{service.name}</span>
                {service.rate > 0 && (
                  <span className="mx-1 text-xs font-bold">+${service.rate}/day</span>
                )}
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleServiceToggle(e, service._id);
                  }}
                  className="ml-1 text-[#8A7D55] hover:text-[#6A5D35] focus:outline-none opacity-60 group-hover:opacity-100"
                  aria-label={`Remove ${service.name}`}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}