/**
 * Time picker utility functions
 */

/**
 * Rounds a minute value to the nearest 10
 * @param {number} minute - The minute value to round
 * @returns {number} - The rounded minute value
 */
export const roundToNearestTen = (minute: number): number => {
    return Math.round(minute / 10) * 10 % 60;
  };
  
  /**
   * Gets a default time value based on the current time (rounded to the nearest 10 minutes)
   * If it's after hours (6 PM to 8 AM), defaults to 10:00 AM
   * @returns {string} - The default time string in "h:mm AM/PM" format
   */
  export const getDefaultTime = (): string => {
    // Check if we already have a stored default time to avoid resetting
    const storedDefaultTime = sessionStorage.getItem("defaultTimeSet");
    
    // If we've already set a default time in this session, return "10:00 AM"
    // This prevents the time from changing during the session
    if (storedDefaultTime === "true") {
      return "10:00 AM";
    }
    
    // First time setting the default in this session
    // Mark that we've set a default to avoid resetting on future calls
    sessionStorage.setItem("defaultTimeSet", "true");
    
    // Get current time
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // For business hours (8 AM to 6 PM), use current time (rounded)
    if (hours >= 8 && hours < 18) {
      const roundedMinutes = roundToNearestTen(minutes);
      
      // Convert to 12-hour format
      let displayHour = hours % 12;
      if (displayHour === 0) displayHour = 12;
      
      const period = hours < 12 ? "AM" : "PM";
      return `${displayHour}:${roundedMinutes < 10 ? '0' + roundedMinutes : roundedMinutes} ${period}`;
    }
    
    // For after hours, default to 10:00 AM
    return "10:00 AM";
  };
  
  /**
   * Converts a time string to minutes from midnight
   * @param {string} timeStr - Time string in format "h:mm AM/PM"
   * @returns {number} - Minutes from midnight
   */
  export const timeToMinutes = (timeStr: string): number => {
    const isPM = timeStr.toLowerCase().includes("pm");
    const timePattern = /(\d{1,2}):(\d{2})/;
    const match = timeStr.match(timePattern);
  
    if (!match) return 0;
  
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
  
    // Convert to 24-hour format
    if (isPM && hours < 12) hours += 12;
    else if (!isPM && hours === 12) hours = 0;
  
    return hours * 60 + minutes;
  };
  
  /**
   * Creates an array of times at 10-minute intervals in the format "h:mm AM/PM"
   * @returns {string[]} - Array of time strings
   */
  export const createTimeOptions = (): string[] => {
    const options: string[] = [];
    
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 10) {
        const h = hour % 12 || 12;
        const m = minute < 10 ? `0${minute}` : minute;
        const period = hour < 12 ? 'AM' : 'PM';
        
        options.push(`${h}:${m} ${period}`);
      }
    }
    
    return options;
  };
  
  /**
   * Gets the next time option from a list that is at least the specified minutes ahead
   * @param {string[]} options - Array of time options
   * @param {string} currentTime - Current time string
   * @param {number} minGapMinutes - Minimum gap in minutes
   * @returns {string} - Next available time
   */
  export const getNextTimeOption = (
    options: string[],
    currentTime: string,
    minGapMinutes: number
  ): string => {
    const currentMinutes = timeToMinutes(currentTime);
    const targetMinutes = currentMinutes + minGapMinutes;
    
    // Find first option that's at least minGapMinutes ahead
    for (const option of options) {
      const optionMinutes = timeToMinutes(option);
      if (optionMinutes >= targetMinutes) {
        return option;
      }
    }
    
    // If no option found, return the first option (next day implied)
    return options[0] || "10:00 AM";
  };