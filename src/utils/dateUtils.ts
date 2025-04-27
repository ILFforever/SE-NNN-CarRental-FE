/**
 * Format date to display in a human-readable format
 * @param {Date} date - Date object to format
 * @param {boolean} includeTime - Whether to include time in the formatted string
 * @returns {string} Formatted date string
 */
export const formatDate = (date: Date, includeTime: boolean = false): string => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return 'Invalid date';
    }
  
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
  
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
  
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };
  
  /**
   * Calculate the number of days between two dates
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {number} Number of days
   */
  export const calculateDays = (startDate: Date, endDate: Date): number => {
    if (!(startDate instanceof Date) || !(endDate instanceof Date) || 
        isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 0;
    }
  
    // Calculate difference in milliseconds and convert to days
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  /**
   * Format a date range to display
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {string} Formatted date range
   */
  export const formatDateRange = (startDate: Date, endDate: Date): string => {
    if (!(startDate instanceof Date) || !(endDate instanceof Date) || 
        isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 'Invalid date range';
    }
  
    const sameMonth = startDate.getMonth() === endDate.getMonth() && 
                      startDate.getFullYear() === endDate.getFullYear();
    
    // If dates are in the same month, show a more compact format
    if (sameMonth) {
      const startDay = startDate.getDate();
      const endDay = endDate.getDate();
      const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(startDate);
      const year = startDate.getFullYear();
      
      return `${startDay} - ${endDay} ${month} ${year}`;
    }
    
    // Otherwise show the full range
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };