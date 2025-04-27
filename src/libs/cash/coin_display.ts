/**
 *
 * @param value Cash Value that's being formatted
 * @param type Transaction type
 * @description Formats the cash value to a string with 2 decimal places
 * @returns The formatted cash value (Example format: +1,234.56 or -1,234.56)
 */
export const coinDisplay = (
  value: number,
  type: "deposit" | "withdrawal" | "payment" | "refund" | "none"
): string => {
  const truncatedValue = Math.trunc(value * 100) / 100;
  let coinValue = Intl.NumberFormat("en-US", {
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(truncatedValue);

  if (type === "withdrawal") {
    coinValue = "-" + coinValue;
  } else if (type === "deposit") {
    coinValue = "+" + coinValue;
  } else if (type === "none") {
    coinValue = coinValue;
  }

  return coinValue;
};
