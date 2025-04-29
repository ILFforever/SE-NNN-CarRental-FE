"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Clock, X } from "lucide-react";
import { roundToNearestTen } from "@/libs/timePickerUtils";

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
  const [pickerID] = useState(() => `time-picker-${Math.random().toString(36).substring(2, 9)}`);
  const [dropdownPosition, setDropdownPosition] = useState<React.CSSProperties>({});
  
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
  const [selectedMinute, setSelectedMinute] = useState(roundToNearestTen(minute));
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  // MODIFIED: Mark as initialized after first render
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      console.log(`TimePicker ${fieldLabel} initialized with value:`, value);
    }
  }, []);

  // MODIFIED: Save current time to sessionStorage when changed, but only if initialized
  useEffect(() => {
    if (initializedRef.current && fieldLabel && value) {
      const storedValue = sessionStorage.getItem(`${pickerID}-${fieldLabel}`);
      
      // Only update sessionStorage if value has actually changed
      if (storedValue !== value) {
        sessionStorage.setItem(`${pickerID}-${fieldLabel}`, value);
        console.log(`Saved ${fieldLabel} to sessionStorage:`, value);
      }
    }
  }, [value, pickerID, fieldLabel]);

  // MODIFIED: Update state when props change, but only if value is valid
  useEffect(() => {
    if (value) {
      const { hour, minute, period } = parseTime(value);
      setSelectedHour(hour);
      setSelectedMinute(roundToNearestTen(minute));
      setSelectedPeriod(period);
    }
  }, [value]);

  // Generate minute options in steps of 10 (0, 10, 20, 30, 40, 50)
  const minuteOptions = [0, 10, 20, 30, 40, 50];

  // Calculate dropdown position - using useLayoutEffect to ensure it happens before render
  useLayoutEffect(() => {
    if (isOpen && buttonRef.current) {
      updateDropdownPosition();
    }
  }, [isOpen]);

  // Handle window resize and scroll to update position
  useEffect(() => {
    if (isOpen) {
      const handlePositionChange = () => {
        updateDropdownPosition();
        
        // Check if button is still in viewport
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          const isInViewport = 
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth;
            
          // Close picker if button is out of viewport
          if (!isInViewport) {
            setIsOpen(false);
          }
        }
      };

      window.addEventListener("resize", handlePositionChange);
      window.addEventListener("scroll", handlePositionChange, true); 

      return () => {
        window.removeEventListener("resize", handlePositionChange);
        window.removeEventListener("scroll", handlePositionChange, true);
      };
    }
  }, [isOpen]);

  // MODIFIED: Better visibility change handler to prevent value resets
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && fieldLabel) {
        const storedValue = sessionStorage.getItem(`${pickerID}-${fieldLabel}`);
        
        // Only update if there's a stored value and it's different from current value
        if (storedValue && storedValue !== value) {
          console.log(`Tab visible: Restoring ${fieldLabel} from sessionStorage:`, storedValue);
          onChange(storedValue);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [value, onChange, pickerID, fieldLabel]);

  // MODIFIED: Handle page load to restore values from sessionStorage only once
  useEffect(() => {
    if (fieldLabel && !initializedRef.current) {
      const storedValue = sessionStorage.getItem(`${pickerID}-${fieldLabel}`);
      
      if (storedValue) {
        // If we have a stored value and it's different from the prop value
        if (storedValue !== value) {
          console.log(`Loading ${fieldLabel} from sessionStorage:`, storedValue);
          onChange(storedValue);
        }
      } else if (value) {
        // If we don't have a stored value but we do have a prop value
        sessionStorage.setItem(`${pickerID}-${fieldLabel}`, value);
        console.log(`Initializing ${fieldLabel} in sessionStorage:`, value);
      }
      
      initializedRef.current = true;
    }
  }, []);

  // Update dropdown position based on button position
  const updateDropdownPosition = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const requiredSpace = 350; // Approximate height of the picker

    const isNearBottom = spaceBelow < requiredSpace && spaceAbove > spaceBelow;

    setDropdownPosition({
      top: isNearBottom ? "auto" : rect.bottom + window.scrollY + 8,
      bottom: isNearBottom ? window.innerHeight - rect.top + window.scrollY + 8 : "auto",
      left: rect.left + window.scrollX,
      maxWidth: `${Math.min(350, window.innerWidth - 20)}px`, // Responsive width
    });
  };

  // Modal overlay effect when TimePicker is open
  useEffect(() => {
    if (isOpen) {
      // Add overlay class to body
      document.body.classList.add("time-picker-active");

      // Highlight only the input field, not the label text
      if (buttonRef.current) {
        buttonRef.current.classList.add("active-time-input");
      }

      // Disable scrolling
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.overflow = "hidden";

      // Add CSS in runtime
      const style = document.createElement("style");
      style.id = "time-picker-overlay-style";
      style.innerHTML = `
        body.time-picker-active::after {
          content: '';
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 40;
          pointer-events: none;
        }
        
        .active-time-input {
          position: relative;
          z-index: 45 !important;
          background: white;
          border-color: #8A7D55 !important;
          box-shadow: 0 0 0 4px rgba(138, 125, 85, 0.2), 0 0 15px rgba(138, 125, 85, 0.25);
          transition: all 0.3s ease;
          transform: translateZ(0);
          border-radius: 0.375rem;
          animation: pulse-highlight 2s infinite;
        }
        
        @keyframes pulse-highlight {
          0% {
            box-shadow: 0 0 0 0 rgba(138, 125, 85, 0.4), 0 0 15px rgba(138, 125, 85, 0.25);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(138, 125, 85, 0), 0 0 15px rgba(138, 125, 85, 0.25);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(138, 125, 85, 0), 0 0 15px rgba(138, 125, 85, 0.25);
          }
        }
        
        /* Fade other text */
        body.time-picker-active .time-field-container:not(:has(.active-time-input)) {
          opacity: 0.5;
          filter: grayscale(30%);
          transition: all 0.3s ease;
        }
        
        body.time-picker-active .time-field-container p.text-sm {
          opacity: 0.6;
          transition: all 0.3s ease;
        }
      `;
      document.head.appendChild(style);

      return () => {
        // Remove overlay
        document.body.classList.remove("time-picker-active");

        // Remove highlight from input
        if (buttonRef.current) {
          buttonRef.current.classList.remove("active-time-input");
        }

        // Enable scrolling
        document.body.style.position = "";
        document.body.style.width = "";
        document.body.style.top = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);

        // Remove runtime CSS
        const styleElement = document.getElementById("time-picker-overlay-style");
        if (styleElement) {
          styleElement.remove();
        }
      };
    }
  }, [isOpen]);

  // Handle clicks outside
  useEffect(() => {
    const handleMouseClickOutside = (event: MouseEvent) => {
      const isClickInsidePicker =
        (pickerRef.current && pickerRef.current.contains(event.target as Node)) ||
        (mobilePickerRef.current && mobilePickerRef.current.contains(event.target as Node));

      const isClickOnButton =
        buttonRef.current && buttonRef.current.contains(event.target as Node);

      if (!isClickInsidePicker && !isClickOnButton) {
        setIsOpen(false);
      }
    };

    const handleTouchOutside = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;

      // Convert touch to element at position
      const element = document.elementFromPoint(touch.clientX, touch.clientY);

      const isClickInsidePicker =
        (pickerRef.current && pickerRef.current.contains(element)) ||
        (mobilePickerRef.current && mobilePickerRef.current.contains(element));

      const isClickOnButton =
        buttonRef.current && buttonRef.current.contains(element);

      if (!isClickInsidePicker && !isClickOnButton) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleMouseClickOutside, true);
      document.addEventListener("touchstart", handleTouchOutside, true);
    }

    return () => {
      document.removeEventListener("mousedown", handleMouseClickOutside, true);
      document.removeEventListener("touchstart", handleTouchOutside, true);
    };
  }, [isOpen]);

  // Format the time value
  const formatTime = (hour: number, minute: number, period: string) => {
    if (use12Hours) {
      return `${hour}:${minute < 10 ? "0" + minute : minute} ${period}`;
    } else {
      return `${hour < 10 ? "0" + hour : hour}:${minute < 10 ? "0" + minute : minute}`;
    }
  };

  // MODIFIED: Update the time when selections change, with sessionStorage sync
  const updateTime = (hour: number, minute: number, period: string) => {
    const newValue = formatTime(hour, minute, period);
    onChange(newValue);

    if (fieldLabel) {
      sessionStorage.setItem(`${pickerID}-${fieldLabel}`, newValue);
      console.log(`Time updated ${fieldLabel}:`, newValue);
    }
  };

  // Handle the value display click
  const handleValueClick = () => {
    setIsOpen(!isOpen);
  };

  // =========== Time Control Functions ===========

  // Hour control functions
  const incrementHour = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const newHour = use12Hours
      ? (selectedHour % 12) + 1
      : (selectedHour + 1) % 24;
    setSelectedHour(newHour);
    updateTime(newHour, selectedMinute, selectedPeriod);
  };

  const decrementHour = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const newHour = use12Hours
      ? ((selectedHour - 2 + 12) % 12) + 1
      : (selectedHour - 1 + 24) % 24;
    setSelectedHour(newHour);
    updateTime(newHour, selectedMinute, selectedPeriod);
  };

  // Minute control functions
  const incrementMinute = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const nextIndex = (minuteOptions.indexOf(selectedMinute) + 1) % minuteOptions.length;
    const newMinute = minuteOptions[nextIndex];
    setSelectedMinute(newMinute);
    updateTime(selectedHour, newMinute, selectedPeriod);
  };

  const decrementMinute = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const currentIndex = minuteOptions.indexOf(selectedMinute);
    const prevIndex = currentIndex === 0 ? minuteOptions.length - 1 : currentIndex - 1;
    const newMinute = minuteOptions[prevIndex];
    setSelectedMinute(newMinute);
    updateTime(selectedHour, newMinute, selectedPeriod);
  };

  // Period toggle function
  const togglePeriod = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const newPeriod = selectedPeriod === "AM" ? "PM" : "AM";
    setSelectedPeriod(newPeriod);
    updateTime(selectedHour, selectedMinute, newPeriod);
  };

  return (
    <div className={`relative time-field-container ${className}`} data-picker-id={pickerID}>
      {/* Label for the field if provided */}
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
        <Clock size={16} className={isOpen ? "text-[#8A7D55]" : "text-gray-500"} />
        <span className="flex-1 text-left">
          {formatTime(selectedHour, selectedMinute, selectedPeriod)}
        </span>
      </button>

      {/* Dropdown - Mobile bottom sheet & Desktop dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Bottom Sheet */}
            <motion.div
              ref={mobilePickerRef}
              className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
                duration: 0.3,
              }}
            >
              <div className="bg-white rounded-t-xl shadow-lg overflow-hidden">
                {/* Handle for dragging */}
                <div className="w-full flex justify-center py-2">
                  <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                </div>

                {/* Mobile Header with Title and Close */}
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

                {/* Mobile Time Picker Controls */}
                <div className="p-4">
                  <div className="flex justify-center items-center gap-4 py-6">
                    {/* Hour column */}
                    <div className="flex flex-col items-center">
                      <button
                        type="button"
                        onMouseDown={incrementHour}
                        onTouchStart={incrementHour}
                        className="p-3 hover:bg-gray-100 rounded-full text-gray-700 active:bg-gray-200"
                      >
                        <ChevronUp size={24} className="text-gray-500" />
                      </button>
                      <div className="my-3 text-3xl font-semibold w-16 text-center bg-[#8A7D55]/10 rounded-lg py-2">
                        {selectedHour}
                      </div>
                      <button
                        type="button"
                        onMouseDown={decrementHour}
                        onTouchStart={decrementHour}
                        className="p-3 hover:bg-gray-100 rounded-full text-gray-700 active:bg-gray-200"
                      >
                        <ChevronDown size={24} className="text-gray-500" />
                      </button>
                    </div>

                    <div className="flex items-center text-2xl font-medium text-gray-400">
                      :
                    </div>

                    {/* Minute column */}
                    <div className="flex flex-col items-center">
                      <button
                        type="button"
                        onMouseDown={incrementMinute}
                        onTouchStart={incrementMinute}
                        className="p-3 hover:bg-gray-100 rounded-full text-gray-700 active:bg-gray-200"
                      >
                        <ChevronUp size={24} className="text-gray-500" />
                      </button>
                      <div className="my-3 text-3xl font-semibold w-16 text-center bg-[#8A7D55]/10 rounded-lg py-2">
                        {selectedMinute < 10 ? `0${selectedMinute}` : selectedMinute}
                      </div>
                      <button
                        type="button"
                        onMouseDown={decrementMinute}
                        onTouchStart={decrementMinute}
                        className="p-3 hover:bg-gray-100 rounded-full text-gray-700 active:bg-gray-200"
                      >
                        <ChevronDown size={24} className="text-gray-500" />
                      </button>
                    </div>

                    {/* AM/PM column (if 12-hour format) */}
                    {use12Hours && (
                      <div className="flex flex-col items-center">
                        <button
                          type="button"
                          onMouseDown={togglePeriod}
                          onTouchStart={togglePeriod}
                          className="p-3 hover:bg-gray-100 rounded-full text-gray-700 active:bg-gray-200"
                        >
                          <ChevronUp size={24} className="text-gray-500" />
                        </button>
                        <div className="my-3 text-3xl font-semibold w-16 text-center bg-[#8A7D55]/10 rounded-lg py-2">
                          {selectedPeriod}
                        </div>
                        <button
                          type="button"
                          onMouseDown={togglePeriod}
                          onTouchStart={togglePeriod}
                          className="p-3 hover:bg-gray-100 rounded-full text-gray-700 active:bg-gray-200"
                        >
                          <ChevronDown size={24} className="text-gray-500" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Buttons */}
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
            </motion.div>

            {/* Desktop Dropdown */}
            <motion.div
              ref={pickerRef}
              className="hidden md:block fixed z-50"
              style={dropdownPosition}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <div
                className="bg-white rounded-lg border border-gray-200 shadow-lg p-4"
                style={{ width: "300px" }}
              >
                {/* Desktop Header */}
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

                {/* Desktop Time Controls */}
                <div className="flex justify-center items-center gap-6 py-4">
                  {/* Hour column */}
                  <div className="flex flex-col items-center">
                    <div className="text-xs text-gray-500 mb-1">Hour</div>
                    <button
                      type="button"
                      onMouseDown={incrementHour}
                      className="p-2 hover:bg-gray-100 rounded-full text-gray-700"
                    >
                      <ChevronUp size={20} className="text-gray-500" />
                    </button>
                    <div className="my-2 text-2xl font-semibold w-14 text-center bg-[#8A7D55]/10 rounded-lg py-1">
                      {selectedHour}
                    </div>
                    <button
                      type="button"
                      onMouseDown={decrementHour}
                      className="p-2 hover:bg-gray-100 rounded-full text-gray-700"
                    >
                      <ChevronDown size={20} className="text-gray-500" />
                    </button>
                  </div>

                  <div className="flex items-center text-xl font-medium text-gray-400">
                    :
                  </div>

                  {/* Minute column */}
                  <div className="flex flex-col items-center">
                    <div className="text-xs text-gray-500 mb-1">Minute</div>
                    <button
                      type="button"
                      onMouseDown={incrementMinute}
                      className="p-2 hover:bg-gray-100 rounded-full text-gray-700"
                    >
                      <ChevronUp size={20} className="text-gray-500" />
                    </button>
                    <div className="my-2 text-2xl font-semibold w-14 text-center bg-[#8A7D55]/10 rounded-lg py-1">
                      {selectedMinute < 10 ? `0${selectedMinute}` : selectedMinute}
                    </div>
                    <button
                      type="button"
                      onMouseDown={decrementMinute}
                      className="p-2 hover:bg-gray-100 rounded-full text-gray-700"
                    >
                      <ChevronDown size={20} className="text-gray-500" />
                    </button>
                  </div>

                  {/* AM/PM column (if 12-hour format) */}
                  {use12Hours && (
                    <div className="flex flex-col items-center">
                      <div className="text-xs text-gray-500 mb-1">Period</div>
                      <button
                        type="button"
                        onMouseDown={togglePeriod}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-700"
                      >
                        <ChevronUp size={20} className="text-gray-500" />
                      </button>
                      <div className="my-2 text-2xl font-semibold w-14 text-center bg-[#8A7D55]/10 rounded-lg py-1">
                        {selectedPeriod}
                      </div>
                      <button
                        type="button"
                        onMouseDown={togglePeriod}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-700"
                      >
                        <ChevronDown size={20} className="text-gray-500" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Desktop Buttons */}
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SimpleTimePicker;