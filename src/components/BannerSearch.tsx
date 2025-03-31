'use client';

import { useState, useEffect, useRef } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { useRouter } from 'next/navigation';
import styles from './banner-search.module.css';
import Router from 'next/router';

// Update the handleSearch function in your BannerSearch.tsx


function DateSection({ 
  label, 
  date, 
  setDate, 
  timeValue, 
  setTimeValue, 
  timeOptions 
}: {
  label: string;
  date: Dayjs | null;
  setDate: (date: Dayjs | null) => void;
  timeValue: string;
  setTimeValue: (time: string) => void;
  timeOptions: string[];
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  
  return (
    <div className={styles.inputGroup}>
      <label className={styles.label}>{label}</label>
      <div className={styles.dateTimeWrapper}>
        <div 
          className={styles.datePickerContainer}
          onClick={() => setIsPickerOpen(true)}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={date}
              onChange={(newValue) => setDate(newValue)}
              className={styles.datePicker}
              open={isPickerOpen}
              onClose={() => setIsPickerOpen(false)}
              slotProps={{
                popper: {
                  placement: 'bottom', // Position centered below rather than at start
                  style: { 
                    marginTop: '16px', // Match the location dropdown spacing
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)' // Match location dropdown shadow
                  }
                },
                textField: {
                  variant: 'outlined',
                  fullWidth: true,
                  size: 'small',
                  InputProps: {
                    className: styles.datePickerInput,
                    endAdornment: <span className={styles.hiddenIcon}></span>,
                    style: { 
                      fontSize: '14px',
                      padding: 0
                    }
                  }
                },
                field: {
                  shouldRespectLeadingZeros: true,
                  format: 'MM/DD/YYYY'
                }
              }}
            />
          </LocalizationProvider>
        </div>
        <select 
          value={timeValue}
          onChange={(e) => setTimeValue(e.target.value)}
          className={styles.timeSelect}
        >
          {timeOptions.map(time => (
            <option key={time} value={time}>{time}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function BannerSearch() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [pickupDate, setPickupDate] = useState<Dayjs | null>(null);
  const [returnDate, setReturnDate] = useState<Dayjs | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [timePickup, setTimePickup] = useState('10:00 AM');
  const [timeReturn, setTimeReturn] = useState('10:00 AM');
  
  // Refs for dropdown management
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const componentMounted = useRef(true);
  const dropdownWrapperRef = useRef<HTMLDivElement>(null);

  // Popular locations
  const popularLocations = [
    { type: 'city', name: 'London', icon: '🏙️' },
    { type: 'city', name: 'Manchester', icon: '🏙️' },
    { type: 'city', name: 'Edinburgh', icon: '🏙️' },
    { type: 'airport', name: 'Heathrow Airport', icon: '✈️' },
    { type: 'airport', name: 'Gatwick Airport', icon: '✈️' },
    { type: 'hotel', name: 'The Ritz London', icon: '🏨' }
  ];

  const timeOptions = [
    '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', 
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
    '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
    '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'
  ];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      componentMounted.current = false;
    };
  }, []);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownWrapperRef.current && 
        !dropdownWrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    // Add event listener only when dropdown is shown
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleLocationClick = (locationName: string) => {
    setLocation(locationName);
    // Don't immediately close dropdown to prevent race conditions
    setTimeout(() => {
      if (componentMounted.current) {
        setShowDropdown(false);
      }
    }, 50);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling
    setShowDropdown(prev => !prev);
  };

  const handleSearch = () => {
    // Format dates for URL
    const pickupFormatted = pickupDate ? pickupDate.format('YYYY-MM-DD') : '';
    const returnFormatted = returnDate ? returnDate.format('YYYY-MM-DD') : '';
    
    // Navigate to vehicle listing with search parameters
    router.push(
      `/catalog?location=${encodeURIComponent(location)}&startDate=${pickupFormatted}&pickupTime=${encodeURIComponent(timePickup)}&endDate=${returnFormatted}&returnTime=${encodeURIComponent(timeReturn)}`
    );
  };



  

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchBar}>
        {/* Location field */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Where</label>
          <div 
            className={styles.locationInputWrapper}
            ref={dropdownWrapperRef}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="City, airport, address or hotel"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onClick={toggleDropdown}
              className={styles.input}
            />
            {showDropdown && (
              <div 
                ref={dropdownRef}
                className={styles.dropdown}
              >
                <div className={styles.dropdownSection}>
                  <div 
                    className={styles.dropdownOption} 
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleLocationClick('Current location');
                    }}
                  >
                    <span className={styles.optionIcon}>📍</span>
                    <span>Current location</span>
                  </div>
                  <div 
                    className={styles.dropdownOption} 
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleLocationClick('Anywhere');
                    }}
                  >
                    <span className={styles.optionIcon}>🌎</span>
                    <span>Anywhere</span>
                    <span className={styles.optionSubtext}>Browse all cars</span>
                  </div>
                </div>
                
                <div className={styles.dropdownSection}>
                  <div className={styles.sectionTitle}>Popular Locations</div>
                  {popularLocations.map((loc, index) => (
                    <div 
                      key={index} 
                      className={styles.dropdownOption}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLocationClick(loc.name);
                      }}
                    >
                      <span className={styles.optionIcon}>{loc.icon}</span>
                      <span>{loc.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* From date */}
        <DateSection
          label="From"
          date={pickupDate}
          setDate={setPickupDate}
          timeValue={timePickup}
          setTimeValue={setTimePickup}
          timeOptions={timeOptions}
        />
        
        {/* Until date */}
        <DateSection
          label="Until"
          date={returnDate}
          setDate={setReturnDate}
          timeValue={timeReturn}
          setTimeValue={setTimeReturn}
          timeOptions={timeOptions}
        />

        {/* Search button */}
        <button className={styles.searchButton} onClick={handleSearch}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="white"/>
          </svg>
        </button>
      </div>
    </div>
  );
}