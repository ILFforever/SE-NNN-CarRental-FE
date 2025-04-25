import dayjs from "dayjs";

/**
 * Transaction Date
 * Using this method to format the date of a transaction
 * @param date Date that's being formatted
 * @returns Formatted date string
 * @description Formats the date to a DD/MM/YYYY format
 */
export const TransactionDate = (date: Date): string => {
  return dayjs(date).format("DD/MM/YYYY");
};

/**
 * Transaction Time
 * Using this method to format the time of a transaction
 * @param date Date that's being formatted
 * @param _12hr Show 12hr time format or else
 * @returns Formatted time string
 * @description Formats the date to a 12hr or 24hr time format
 */
export const TransactionTime = (date: Date, _12hr: boolean): string => {
  if (_12hr) {
    return dayjs(date).format("hh:mmA");
  } else {
    return dayjs(date).format("HH:mm");
  }
};
