"use client";
import React from "react";

/**
 * A responsive filter panel for transactions.
 * - Mobile: wraps items horizontally
 * - Desktop (lg+): vertical sidebar
 */
export default function TransactionFilters() {
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
          className="mt-2 block w-full border-gray-300 rounded-lg p-2"
        />
      </div>

      {/* End Date */}
      <div className="flex-shrink-0 w-40">
        <label className="block text-sm md:text-md font-bold text-[#8A7D55]">
          End Date
        </label>
        <input
          type="date"
          className="mt-2 block w-full border-gray-300 rounded-lg p-2"
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
            className="h-4 w-4 border-gray-300"
          />
          <label
            htmlFor="filter-withdraw"
            className="ml-2 text-sm md:text-md text-gray-700"
          >
            Withdraw
          </label>
        </div>
      </div>

      {/* Payment Method */}
      <div className="flex-shrink-0 w-40">
        <label className="block text-sm md:text-md font-bold text-[#8A7D55]">
          Payment Method
        </label>
        <select className="mt-2 block w-full border-gray-300 rounded-lg p-2">
          <option value="">All</option>
          <option value="qr">QR Code</option>
          <option value="bank">Bank Transfer</option>
        </select>
      </div>

      {/* Search Button */}
      <div className="flex-shrink-0 w-20 md:w-32 mt-4 md:mt-0">
        <button className="flex justify-center items-center item w-full h-8 py-2 bg-white text-black font-medium rounded-lg shadow hover:bg-gray-100 border border-[#8A7D55] transition duration-200 ease-in-out">
          Search
        </button>
      </div>
    </div>
  );
}
