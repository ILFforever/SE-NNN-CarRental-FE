import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Clock, X } from "lucide-react";
import { createPortal } from "react-dom";

// Helper function to round to nearest 10
const roundToNearestTen = (minutes: number): number => {
  return Math.round(minutes / 10) * 10 % 60;
};

// Time Picker Control component for better event handling
interface TimePickerControlProps {
  label: string;
  value: number | string;
  onIncrement: () => void;
  onDecrement: () => void;
  valueFormat?: (value: number | string) => string | number;
  storageKey?: string;
}

const TimePickerControl: React.FC<TimePickerControlProps> = ({
  label,
  value,
  onIncrement,
  onDecrement,
  valueFormat = (v: number | string) => {
    if (typeof v === "number" && v < 10) {
      return `0${v}`;
    }
    return v;
  },
}) => {
  // Use mousedown instead of onClick for more responsive interactions
  const handleIncrement = (e: React.MouseEvent | React.TouchEvent): void => {
    e.stopPropagation();
    e.preventDefault();
    onIncrement();
  };

  const handleDecrement = (e: React.MouseEvent | React.TouchEvent): void => {
    e.stopPropagation();
    e.preventDefault();
    onDecrement();
  };

  return (
    <div 
      className="flex flex-col items-center" 
      onClick={(e) => e.stopPropagation()}
    >
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <button
        type="button"
        onMouseDown={handleIncrement}
        onTouchStart={handleIncrement}
        className="p-2 hover:bg-gray-100 rounded-full text-gray-700 z-50"
      >
        <ChevronUp size={20} className="text-gray-500" />
      </button>
      <div className="my-2 text-2xl font-semibold w-14 text-center bg-[#8A7D55]/10 rounded-lg py-1">
        {valueFormat(value)}
      </div>
      <button
        type="button"
        onMouseDown={handleDecrement}
        onTouchStart={handleDecrement}
        className="p-2 hover:bg-gray-100 rounded-full text-gray-700 z-50"
      >
        <ChevronDown size={20} className="text-gray-500" />
      </button>
    </div>
  );
};

interface SimpleTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  use12Hours?: boolean;
  className?: string;
  fieldLabel?: string;
}

const SimpleTimePicker: React.FC<SimpleTimePickerProps> = ({
  value,
  onChange,
  use12Hours = true,
  className = "",
  fieldLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const mobilePickerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef<boolean>(false);
  const [pickerID] = useState(
    () => `time-picker-${Math.random().toString(36).substring(2, 9)}`
  );
  
  // Create a portal element for dropdown attachment
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  
  // Parse the current time value
  const parseTime = (timeString: string) => {
    let hour = 10;
    let minute = 0;
    let period = "AM";

    const timePattern = use12Hours
      ? /^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?$/
      : /^(\d{1,2}):(\d{2})$/;

    const match = timeString.match(timePattern);

    if (match) {
      hour = parseInt(match[1], 10);
      minute = parseInt(match[2], 10);

      if (use12Hours && match[3]) {
        period = match[3].toUpperCase();
      }

      // Convert 24-hour format to 12-hour format if needed
      if (use12Hours && !match[3] && hour > 12) {
        hour = hour - 12;
        period = "PM";
      }

      // Handle 12 AM/PM edge cases
      if (use12Hours && hour === 0) {
        hour = 12;
        period = "AM";
      }
    }

    return { hour, minute, period };
  };

  const { hour, minute, period } = parseTime(value);

  // State for selected values
  const [selectedHour, setSelectedHour] = useState(hour);
  const [selectedMinute, setSelectedMinute] = useState(
    roundToNearestTen(minute)
  );
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  // Mark as initialized after first render
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
    }
  }, []);

  // Save current time to sessionStorage when changed
  useEffect(() => {
    if (initializedRef.current && fieldLabel && value) {
      const storedValue = sessionStorage.getItem(`${pickerID}-${fieldLabel}`);
      // Only update if value has changed
      if (storedValue !== value) {
        sessionStorage.setItem(`${pickerID}-${fieldLabel}`, value);
      }
    }
  }, [value, pickerID, fieldLabel]);

  // Update component state when props change 
  useEffect(() => {
    if (value) {
      const { hour, minute, period } = parseTime(value);
      setSelectedHour(hour);
      setSelectedMinute(roundToNearestTen(minute));
      setSelectedPeriod(period);
    }
  }, [value]);

  // Create or remove portal container when picker opens/closes
  useEffect(() => {
    if (isOpen) {
      // Create portal container element
      const container = document.createElement('div');
      container.id = `time-picker-portal-${pickerID}`;
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.zIndex = '9999'; // Very high z-index
      container.style.pointerEvents = 'none'; // Pass through events except where needed
      
      document.body.appendChild(container);
      setPortalContainer(container);
      
      // Add overlay style
      document.body.classList.add("time-picker-overlay");
      
      // Create overlay styles 
      const styleElement = document.createElement('style');
      styleElement.id = 'time-picker-styles';
      styleElement.textContent = `
        .time-picker-overlay::after {
          content: '';
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 9990;
          pointer-events: none;
        }
        
        .time-picker-content {
          pointer-events: auto !important;
        }
        
        .time-picker-button-active {
          position: relative;
          z-index: 9991;
          border-color: #8A7D55 !important;
          box-shadow: 0 0 0 4px rgba(138, 125, 85, 0.2);
        }
      `;
      
      document.head.appendChild(styleElement);
      
      if (buttonRef.current) {
        buttonRef.current.classList.add('time-picker-button-active');
      }
      
      // Handle body scroll lock
      const scrollY = window.scrollY;
      const body = document.body;
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.width = '100%';
      body.style.overflow = 'hidden';
      
      return () => {
        // Clean up
        document.body.removeChild(container);
        setPortalContainer(null);
        
        document.body.classList.remove("time-picker-overlay");
        
        const styleEl = document.getElementById('time-picker-styles');
        if (styleEl) {
          document.head.removeChild(styleEl);
        }
        
        if (buttonRef.current) {
          buttonRef.current.classList.remove('time-picker-button-active');
        }
        
        // Restore scrolling
        body.style.position = '';
        body.style.top = '';
        body.style.width = '';
        body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen, pickerID]);

  // Position the picker when it opens
  useLayoutEffect(() => {
    if (isOpen && buttonRef.current && portalContainer) {
      positionPicker();
    }
  }, [isOpen, portalContainer]);

  // Position picker based on button location
  const positionPicker = () => {
    if (!buttonRef.current || !portalContainer) return;
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // Mobile styles are handled by fixed positioning in the component
      return;
    }
    
    // For desktop, create picker at right position
    const picker = portalContainer.querySelector('.desktop-picker') as HTMLElement;
    if (picker) {
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const requiredHeight = 350; // Approximate picker height
      
      const showAbove = spaceBelow < requiredHeight && buttonRect.top > requiredHeight;
      
      picker.style.position = 'fixed';
      picker.style.zIndex = '9995';
      picker.style.width = '300px';
      
      if (showAbove) {
        picker.style.bottom = `${viewportHeight - buttonRect.top + 8}px`;
        picker.style.top = 'auto';
      } else {
        picker.style.top = `${buttonRect.bottom + 8}px`;
        picker.style.bottom = 'auto';
      }
      
      // Center horizontally with the button
      const left = Math.max(
        10,
        Math.min(
          buttonRect.left + buttonRect.width / 2 - 150,
          window.innerWidth - 310
        )
      );
      picker.style.left = `${left}px`;
    }
  };

  // Update position on window events
  useEffect(() => {
    if (isOpen) {
      const handleResize = () => positionPicker();
      const handleScroll = () => positionPicker();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isOpen]);

  // Handle clicks outside to close picker
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && 
          buttonRef.current && 
          !buttonRef.current.contains(e.target as Node) &&
          pickerRef.current && 
          !pickerRef.current.contains(e.target as Node) &&
          mobilePickerRef.current && 
          !mobilePickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Restore value from sessionStorage when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && fieldLabel) {
        const storedValue = sessionStorage.getItem(`${pickerID}-${fieldLabel}`);
        
        if (storedValue && storedValue !== value) {
          onChange(storedValue);
        }
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [value, onChange, pickerID, fieldLabel]);

  // Restore from sessionStorage on load
  useEffect(() => {
    if (fieldLabel && !initializedRef.current) {
      const storedValue = sessionStorage.getItem(`${pickerID}-${fieldLabel}`);
      
      if (storedValue && storedValue !== value) {
        onChange(storedValue);
      } else if (value) {
        sessionStorage.setItem(`${pickerID}-${fieldLabel}`, value);
      }
      
      initializedRef.current = true;
    }
  }, []);

  // Format the time value
  const formatTime = (hour: number, minute: number, period: string) => {
    if (use12Hours) {
      return `${hour}:${minute < 10 ? "0" + minute : minute} ${period}`;
    } else {
      return `${hour < 10 ? "0" + hour : hour}:${
        minute < 10 ? "0" + minute : minute
      }`;
    }
  };

  // Update time value and notify parent
  const updateTime = (hour: number, minute: number, period: string) => {
    const newValue = formatTime(hour, minute, period);
    onChange(newValue);
    
    if (fieldLabel) {
      sessionStorage.setItem(`${pickerID}-${fieldLabel}`, newValue);
    }
  };

  // Toggle picker visibility
  const handleValueClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Time value modification handlers
  const handleHourIncrement = () => {
    const newHour = use12Hours
      ? (selectedHour % 12) + 1
      : (selectedHour + 1) % 24;
    setSelectedHour(newHour);
    updateTime(newHour, selectedMinute, selectedPeriod);
  };

  const handleHourDecrement = () => {
    const newHour = use12Hours
      ? ((selectedHour - 2 + 12) % 12) + 1
      : (selectedHour - 1 + 24) % 24;
    setSelectedHour(newHour);
    updateTime(newHour, selectedMinute, selectedPeriod);
  };

  const handleMinuteIncrement = () => {
    const minuteOptions = [0, 10, 20, 30, 40, 50];
    const nextIndex =
      (minuteOptions.indexOf(selectedMinute) + 1) % minuteOptions.length;
    const newMinute = minuteOptions[nextIndex];
    setSelectedMinute(newMinute);
    updateTime(selectedHour, newMinute, selectedPeriod);
  };

  const handleMinuteDecrement = () => {
    const minuteOptions = [0, 10, 20, 30, 40, 50];
    const currentIndex = minuteOptions.indexOf(selectedMinute);
    const prevIndex =
      currentIndex === 0 ? minuteOptions.length - 1 : currentIndex - 1;
    const newMinute = minuteOptions[prevIndex];
    setSelectedMinute(newMinute);
    updateTime(selectedHour, newMinute, selectedPeriod);
  };

  const handlePeriodToggle = () => {
    const newPeriod = selectedPeriod === "AM" ? "PM" : "AM";
    setSelectedPeriod(newPeriod);
    updateTime(selectedHour, selectedMinute, newPeriod);
  };

  // Prevent event propagation
  const stopPropagation = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`relative time-field-container ${className}`}
      data-picker-id={pickerID}
    >
      {/* Field label if provided */}
      {fieldLabel && (
        <p className="text-sm font-medium text-gray-700 mb-1.5">{fieldLabel}</p>
      )}

      {/* Time display button */}
      <button
        type="button"
        ref={buttonRef}
        onClick={handleValueClick}
        className={`flex items-center space-x-2 text-sm bg-white border ${
          isOpen
            ? "border-[#8A7D55] ring-2 ring-[#8A7D55]/30"
            : "border-gray-300"
        } rounded-md px-3 py-2.5 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8A7D55]/30 text-gray-700 w-full transition-all duration-200`}
      >
        <Clock
          size={16}
          className={isOpen ? "text-[#8A7D55]" : "text-gray-500"}
        />
        <span className="flex-1 text-left">
          {formatTime(selectedHour, selectedMinute, selectedPeriod)}
        </span>
      </button>

      {/* Time picker UI rendered through portals */}
      {isOpen && portalContainer && (
        <>
          {/* Mobile picker (bottom sheet) */}
          {createPortal(
            <motion.div
              ref={mobilePickerRef}
              className="fixed bottom-0 left-0 right-0 z-[9995] md:hidden time-picker-content"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
                duration: 0.3,
              }}
              onClick={stopPropagation}
            >
              <div className="bg-white rounded-t-xl shadow-lg overflow-hidden">
                {/* Drag handle */}
                <div className="w-full flex justify-center py-2">
                  <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                </div>

                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <div className="font-medium text-gray-700">
                    {fieldLabel ? `Select ${fieldLabel}` : "Select Time"}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                {/* Time controls */}
                <div className="p-4">
                  <div className="flex justify-center items-center gap-4 py-6">
                    {/* Hour column */}
                    <TimePickerControl
                      label="Hour"
                      value={selectedHour}
                      onIncrement={handleHourIncrement}
                      onDecrement={handleHourDecrement}
                    />

                    <div className="flex items-center text-2xl font-medium text-gray-400">
                      :
                    </div>

                    {/* Minute column */}
                    <TimePickerControl
                      label="Minute"
                      value={selectedMinute}
                      onIncrement={handleMinuteIncrement}
                      onDecrement={handleMinuteDecrement}
                      valueFormat={(v) => {
                        if (typeof v === "number" && v < 10) {
                          return `0${v}`;
                        }
                        return v;
                      }}
                    />

                    {/* AM/PM toggle */}
                    {use12Hours && (
                      <TimePickerControl
                        label="Period"
                        value={selectedPeriod}
                        onIncrement={handlePeriodToggle}
                        onDecrement={handlePeriodToggle}
                      />
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-between p-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                    className="w-full py-3 text-center rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 active:bg-gray-100 mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                    className="w-full py-3 text-center rounded-md bg-[#8A7D55] text-white font-medium hover:bg-[#766b48] active:bg-[#665d3f]"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>,
            portalContainer
          )}

          {/* Desktop picker (dropdown) */}
          {createPortal(
            <motion.div
              ref={pickerRef}
              className="hidden md:block desktop-picker time-picker-content"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={stopPropagation}
            >
              <div
                className="bg-white rounded-lg border border-gray-200 shadow-lg p-4"
                style={{ width: "300px" }}
              >
                {/* Header */}
                <div className="flex justify-between items-center pb-2 mb-3 border-b border-gray-100">
                  <div className="font-medium text-gray-700">
                    {fieldLabel ? `Select ${fieldLabel}` : "Select Time"}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>

                {/* Time controls */}
                <div className="flex justify-center items-center gap-6 py-4">
                  {/* Hour column */}
                  <TimePickerControl
                    label="Hour"
                    value={selectedHour}
                    onIncrement={handleHourIncrement}
                    onDecrement={handleHourDecrement}
                  />

                  <div className="flex items-center text-xl font-medium text-gray-400">
                    :
                  </div>

                  {/* Minute column */}
                  <TimePickerControl
                    label="Minute"
                    value={selectedMinute}
                    onIncrement={handleMinuteIncrement}
                    onDecrement={handleMinuteDecrement}
                    valueFormat={(v) => {
                      if (typeof v === "number" && v < 10) {
                        return `0${v}`;
                      }
                      return v;
                    }}
                  />

                  {/* AM/PM column (if 12-hour format) */}
                  {use12Hours && (
                    <TimePickerControl
                      label="Period"
                      value={selectedPeriod}
                      onIncrement={handlePeriodToggle}
                      onDecrement={handlePeriodToggle}
                    />
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                    className="px-3 py-1.5 text-sm rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                    className="px-3 py-1.5 text-sm rounded-md bg-[#8A7D55] text-white hover:bg-[#766b48] transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>,
            portalContainer
          )}
        </>
      )}
    </div>
  );
};

export default SimpleTimePicker;