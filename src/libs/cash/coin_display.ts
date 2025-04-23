export const coinDisplay = (
  value: number,
  type: "withdrawl" | "deposit"
): string => {
  const truncatedValue = Math.trunc(value * 100) / 100;
  let coinValue = Intl.NumberFormat("en-US", {
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(truncatedValue);

  if (type === "withdrawl") {
    coinValue = "-" + coinValue;
  } else if (type === "deposit") {
    coinValue = "+" + coinValue;
  }
  return coinValue;
};