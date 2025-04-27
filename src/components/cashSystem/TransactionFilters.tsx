"use client";
import React, {useState} from "react";

/**
 * A responsive filter panel for transactions.
 * - Mobile: wraps items horizontally
 * - Desktop (lg+): vertical sidebar
 */
export default function TransactionFilters({
  onSearch,
}: {
  onSearch: (filters: any) => void;
}) {
  // State variables for filter inputs
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [transactionType, setTransactionType] = useState<string>("");
  const [minAmount, setMinAmount] = useState<number | string>("");
  const [maxAmount, setMaxAmount] = useState<number | string>("");

  const handleSearch = () => {
    onSearch({
      startDate,
      endDate,
      transactionType,
      minAmount: minAmount ? parseFloat(minAmount.toString()) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount.toString()) : undefined,
    });
  };

  return (
    <div
      className={`
      bg-white border border-gray-200 rounded-2xl p-4 md:p-6
        justify-center items-center

      /* Mobile: wrap horizontally */
      flex flex-row flex-wrap gap-3 

      /* Desktop: vertical list */
      lg:flex-col lg:flex-nowrap lg:gap-6 lg:w-64 
      `}
    >
      {/* Start Date */}
      <div className="flex-shrink-0 w-40">
        <label className="block text-sm md:text-md font-bold text-[#8A7D55]">
          Start Date
        </label>
        <input
          type="date"
          className="mt-2 h-8 md:h-10 block w-full border-2 border-gray-300 rounded-lg p-2"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      {/* End Date */}
      <div className="flex-shrink-0 w-40">
        <label className="block text-sm md:text-md font-bold text-[#8A7D55]">
          End Date
        </label>
        <input
          type="date"
          className="mt-2 h-8 md:h-10 block w-full border-2 border-gray-300 rounded-lg p-2"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* Transaction Type */}
      <div className="flex-shrink-0 w-40 space-y-2">
        <label className="block text-sm md:text-md font-bold text-[#8A7D55]">
          Transaction Type
        </label>
        <div className="flex items-center">
          <input
            id="filter-deposit"
            name="filter-type"
            type="radio"
            value="deposit"
            checked={transactionType === "deposit"}
            onChange={() => setTransactionType("deposit")}
            className="h-4 w-4 border-gray-300"
          />
          <label
            htmlFor="filter-deposit"
            className="ml-2 text-sm md:text-md text-gray-700"
          >
            Deposit
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="filter-withdraw"
            name="filter-type"
            type="radio"
            value="withdrawal"
            checked={transactionType === "withdrawal"}
            onChange={() => setTransactionType("withdrawal")}
            className="h-4 w-4 border-gray-300"
          />
          <label
            htmlFor="filter-withdraw"
            className="ml-2 text-sm md:text-md text-gray-700"
          >
            Withdraw
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="filter-payment"
            name="filter-type"
            type="radio"
            value="payment"
            checked={transactionType === "payment"}
            onChange={() => setTransactionType("payment")}
            className="h-4 w-4 border-gray-300"
          />
          <label
            htmlFor="filter-payment"
            className="ml-2 text-sm md:text-md text-gray-700"
          >
            Payment
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="filter-refund"
            name="filter-type"
            type="radio"
            value="refund"
            checked={transactionType === "refund"}
            onChange={() => setTransactionType("refund")}
            className="h-4 w-4 border-gray-300"
          />
          <label
            htmlFor="filter-refund"
            className="ml-2 text-sm md:text-md text-gray-700"
          >
            Refund
          </label>
        </div>
      </div>

      {/* Amount Range */}
      <div className="flex flex-col align-center items-center w-40 space-y-2">
        <div className="block text-sm md:text-md font-bold text-[#8A7D55]">
          Range of Amount
        </div>
        <div className="flex flex-row gap-3">
          <div className="flex-shrink-0 w-20">
            <label className="block text-sm md:text-md font-bold text-[#8A7D55]">
              Min
            </label>
            <input
              type="number"
              className="mt-2 h-8 md:h-10 block w-full border-2 border-gray-300 rounded-lg p-2"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
            />
          </div>
          <div className="flex-shrink-0 w-20">
            <label className="block text-sm md:text-md font-bold text-[#8A7D55]">
              Max
            </label>
            <input
              type="number"
              className="mt-2 h-8 md:h-10 block w-full border-2 border-gray-300 rounded-lg p-2"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Search Button */}
      <div className="flex-shrink-0 w-20 md:w-32 mt-4 md:mt-0">
        <button
          onClick={handleSearch}
          className="flex justify-center items-center item w-full h-8 py-2 bg-white text-black font-medium rounded-lg shadow hover:bg-gray-100 border border-[#8A7D55] transition duration-200 ease-in-out"
        >
          Search
        </button>
      </div>
    </div>
  );
}
