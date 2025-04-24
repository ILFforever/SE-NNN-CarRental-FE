'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Clock } from 'lucide-react';

interface SimpleTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  use12Hours?: boolean;
  className?: string;
}

const SimpleTimePicker: React.FC<SimpleTimePickerProps> = ({
  value,
  onChange,
  use12Hours = true,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  
  // Parse the current value
  const parseTime = (timeString: string) => {
    let hour = 10;
    let minute = 0;
    let period = 'AM';
    
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
        period = 'PM';
      }
      
      // Handle 12 AM/PM edge cases
      if (use12Hours && hour === 0) {
        hour = 12;
        period = 'AM';
      }
    }
    
    return { hour, minute, period };
  };
  
  const { hour, minute, period } = parseTime(value);
  
  // State for selected values
  const [selectedHour, setSelectedHour] = useState(hour);
  const [selectedMinute, setSelectedMinute] = useState(minute);
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  
  // Update state when props change
  useEffect(() => {
    const { hour, minute, period } = parseTime(value);
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setSelectedPeriod(period);
  }, [value]);
  
  // Generate options
  const hours = use12Hours
    ? Array.from({ length: 12 }, (_, i) => i + 1) // 1-12 for 12-hour format
    : Array.from({ length: 24 }, (_, i) => i);    // 0-23 for 24-hour format
  
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods = ['AM', 'PM'];
  
  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
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
  
  // Format the time value
  const formatTime = (hour: number, minute: number, period: string) => {
    if (use12Hours) {
      return `${hour}:${minute < 10 ? '0' + minute : minute} ${period}`;
    } else {
      return `${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute}`;
    }
  };
  
  // Update the time when selections change
  const updateTime = (hour: number, minute: number, period: string) => {
    onChange(formatTime(hour, minute, period));
  };
  
  // Handle the value display click
  const handleValueClick = () => {
    setIsOpen(!isOpen);
  };
  
  // Increment/decrement functions
  const incrementHour = () => {
    const newHour = use12Hours
      ? selectedHour % 12 + 1
      : (selectedHour + 1) % 24;
    setSelectedHour(newHour);
    updateTime(newHour, selectedMinute, selectedPeriod);
  };
  
  const decrementHour = () => {
    const newHour = use12Hours
      ? (selectedHour - 2 + 12) % 12 + 1
      : (selectedHour - 1 + 24) % 24;
    setSelectedHour(newHour);
    updateTime(newHour, selectedMinute, selectedPeriod);
  };
  
  const incrementMinute = () => {
    const newMinute = (selectedMinute + 1) % 60;
    setSelectedMinute(newMinute);
    updateTime(selectedHour, newMinute, selectedPeriod);
  };
  
  const decrementMinute = () => {
    const newMinute = (selectedMinute - 1 + 60) % 60;
    setSelectedMinute(newMinute);
    updateTime(selectedHour, newMinute, selectedPeriod);
  };
  
  const togglePeriod = () => {
    const newPeriod = selectedPeriod === 'AM' ? 'PM' : 'AM';
    setSelectedPeriod(newPeriod);
    updateTime(selectedHour, selectedMinute, newPeriod);
  };
  
  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      {/* Time display button */}
      <button
        type="button"
        onClick={handleValueClick}
        className="flex items-center space-x-2 text-sm bg-white/50 border border-gray-200 rounded-md px-3 py-2 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8A7D55]/30 text-gray-700 w-full"
      >
        <Clock size={16} className="text-gray-500" />
        <span className="flex-1 text-left">{formatTime(selectedHour, selectedMinute, selectedPeriod)}</span>
      </button>
      
      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute z-50 mt-1 p-3 bg-white rounded-lg border border-gray-200 shadow-lg"
            style={{ width: '220px' }}
          >
            <div className="flex justify-between">
              {/* Hour column */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={incrementHour}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <ChevronUp size={18} className="text-gray-500" />
                </button>
                <div className="my-1 text-lg font-semibold w-12 text-center">
                  {selectedHour}
                </div>
                <button
                  type="button"
                  onClick={decrementHour}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <ChevronDown size={18} className="text-gray-500" />
                </button>
              </div>
              
              <div className="flex items-center mx-1 text-lg font-medium">:</div>
              
              {/* Minute column */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={incrementMinute}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <ChevronUp size={18} className="text-gray-500" />
                </button>
                <div className="my-1 text-lg font-semibold w-12 text-center">
                  {selectedMinute < 10 ? `0${selectedMinute}` : selectedMinute}
                </div>
                <button
                  type="button"
                  onClick={decrementMinute}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <ChevronDown size={18} className="text-gray-500" />
                </button>
              </div>
              
              {/* AM/PM column (if 12-hour format) */}
              {use12Hours && (
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={togglePeriod}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <ChevronUp size={18} className="text-gray-500" />
                  </button>
                  <div className="my-1 text-lg font-semibold w-12 text-center">
                    {selectedPeriod}
                  </div>
                  <button
                    type="button"
                    onClick={togglePeriod}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <ChevronDown size={18} className="text-gray-500" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Bottom buttons */}
            <div className="flex justify-end mt-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 text-sm rounded-md bg-[#8A7D55] text-white hover:bg-[#766b48] transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SimpleTimePicker;