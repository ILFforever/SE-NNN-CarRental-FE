'use client';

import { useState, useRef, useEffect } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import styles from './banner-search.module.css';

// Define proper TypeScript interface for props
interface DatePickerSectionProps {
  label: string;
  date: Dayjs | null;
  setDate: (date: Dayjs | null) => void;
  timeValue: string;
  setTimeValue: (time: string) => void;
  timeOptions: string[];
}

// This component shows how to implement the date picker section correctly
export default function DatePickerSection({ 
  label, 
  date, 
  setDate, 
  timeValue, 
  setTimeValue, 
  timeOptions 
}: DatePickerSectionProps) {
  // Create a ref for the date picker with correct type
  const pickerRef = useRef<HTMLDivElement>(null);

  // Function to open the date picker
  const openPicker = () => {
    // Find the actual input element within the date picker container
    const container = pickerRef.current;
    if (container) {
      // Use DOM traversal to find the actual button that opens the picker
      // In MUI DatePicker, there's an invisible button that controls the popup
      // We need to click this instead of the input field
      const buttons = container.querySelectorAll('button');
      // The button that opens the picker is usually the first or second button
      if (buttons.length > 0) {
        buttons[0].click();
      }
    }
  };

  return (
    <div className={styles.inputGroup}>
      <label className={styles.label}>{label}</label>
      <div className={styles.dateTimeWrapper}>
        <div 
          ref={pickerRef} 
          className={styles.datePickerContainer}
          onClick={openPicker} // This makes the entire container area clickable
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={date}
              onChange={(newValue) => setDate(newValue)}
              className={styles.datePicker}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  fullWidth: true,
                  size: 'small',
                  InputProps: {
                    className: styles.datePickerInput,
                    // Remove the calendar icon
                    endAdornment: null,
                    style: { 
                      fontSize: '14px',
                      padding: 0
                    }
                  },
                  // We don't need onClick here anymore as we're using the container's onClick
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