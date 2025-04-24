"use client";
import React from "react";

/**
 * A responsive filter panel for transactions.
 * - Mobile: horizontal toolbar
 * - Desktop (lg+): vertical sidebar
 */
export default function TransactionFilters() {
  return (
    <div
      className={`
        bg-white border border-gray-200 rounded-2xl p-6

        /* Mobile*/
        flex flex-row overflow-x-auto space-x-4

        /* Desktop*/
        lg:flex-col lg:overflow-visible lg:space-x-0 lg:space-y-6 lg:w-64
        `}
    >
      {/* Start Date */}
      <div className="flex-shrink-0 min-w-[140px]">
        <label className="block text-sm font-medium text-gray-700">
          วันที่เริ่มต้น
        </label>
        <input
          type="date"
          className="mt-2 block w-full border-gray-300 rounded-lg p-2"
        />
      </div>

      {/* End Date */}
      <div className="flex-shrink-0 min-w-[140px]">
        <label className="block text-sm font-medium text-gray-700">
          จนถึงวันที่
        </label>
        <input
          type="date"
          className="mt-2 block w-full border-gray-300 rounded-lg p-2"
        />
      </div>

      {/* Value Range */}
      <div className="flex-shrink-0 min-w-[160px]">
        <label className="block text-sm font-medium text-gray-700">
          มูลค่า
        </label>
        <div className="mt-2 flex items-center space-x-2">
          <input
            type="number"
            placeholder="min"
            className="w-1/2 border-gray-300 rounded-lg p-2"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="max"
            className="w-1/2 border-gray-300 rounded-lg p-2"
          />
        </div>
        <input type="range" className="mt-3 w-full" />
      </div>

      {/* Deposit / Withdraw */}
      <div className="flex-shrink-0 min-w-[140px] space-y-3">
        <div className="flex items-center">
          <input
            id="filter-deposit"
            name="filter-type"
            type="radio"
            className="h-4 w-4 border-gray-300"
          />
          <label
            htmlFor="filter-deposit"
            className="ml-2 text-sm text-gray-700"
          >
            เติมเงิน
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
            className="ml-2 text-sm text-gray-700"
          >
            ถอนเงิน
          </label>
        </div>
      </div>

      {/* Payment Method */}
      <div className="flex-shrink-0 min-w-[160px]">
        <label className="block text-sm font-medium text-gray-700">
          ช่องทางการชำระเงิน
        </label>
        <select className="mt-2 block w-full border-gray-300 rounded-lg p-2">
          <option value="">ทั้งหมด</option>
          <option value="qr">QR Code</option>
          <option value="bank">Bank Transfer</option>
        </select>
      </div>

      {/* Search Button */}
      <div className="flex-shrink-0 min-w-[120px]">
        <button className="w-full py-3 bg-yellow-400 text-white font-medium rounded-lg shadow hover:bg-yellow-500">
          ค้นหา
        </button>
      </div>
    </div>
  );
}
