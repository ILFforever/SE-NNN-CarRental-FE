import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  ShoppingCart, 
  Check, 
  Clock,
  X,
  Calendar,
  Search,
  DollarSign,
  Hash
} from 'lucide-react';

interface FilterProps {
  onSearch: (filters: any) => void;
}

const EnhancedTransactionFilters: React.FC<FilterProps> = ({ onSearch }) => {
  // State for all filter options
  const [transactionType, setTransactionType] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [rentalId, setRentalId] = useState<string>("");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  
  // Apply filters when any filter changes
  useEffect(() => {
    const filters = {
      transactionType,
      status,
      startDate,
      endDate,
      reference,
      rentalId,
      minAmount,
      maxAmount,
      search,
    };
    
    onSearch(filters);
  }, [transactionType, status, reference, rentalId, search]);
  
  // Debounce date and amount filters to avoid too many API calls
  useEffect(() => {
    const dateAmountTimer = setTimeout(() => {
      onSearch({
        transactionType,
        status,
        startDate,
        endDate,
        reference,
        rentalId,
        minAmount,
        maxAmount,
        search,
      });
    }, 800);
    
    return () => clearTimeout(dateAmountTimer);
  }, [startDate, endDate, minAmount, maxAmount]);
  
  // Handle filter reset
  const resetFilters = () => {
    setTransactionType("");
    setStatus("");
    setStartDate("");
    setEndDate("");
    setReference("");
    setRentalId("");
    setMinAmount("");
    setMaxAmount("");
    setSearch("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800 flex items-center">
          <Filter className="w-5 h-5 mr-2 text-[#8A7D55]" />
          Filters
        </h3>
        <button 
          onClick={resetFilters}
          className="text-sm text-[#8A7D55] hover:text-[#766b48] transition-colors"
        >
          Reset All
        </button>
      </div>
      
      {/* Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <Search className="w-4 h-4 mr-1 text-gray-400" />
          Search
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search in all fields"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#8A7D55] focus:border-transparent outline-none"
        />
      </div>
      
      {/* Transaction Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 block mb-1">Transaction Type</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTransactionType(transactionType === "deposit" ? "" : "deposit")}
            className={`flex items-center justify-center p-2 rounded-md text-sm ${
              transactionType === "deposit"
                ? "bg-[#8A7D55] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } transition-colors`}
          >
            <ArrowUpRight className="w-4 h-4 mr-1" />
            Deposit
          </button>
          <button
            type="button"
            onClick={() => setTransactionType(transactionType === "withdrawal" ? "" : "withdrawal")}
            className={`flex items-center justify-center p-2 rounded-md text-sm ${
              transactionType === "withdrawal"
                ? "bg-[#8A7D55] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } transition-colors`}
          >
            <ArrowDownLeft className="w-4 h-4 mr-1" />
            Withdrawal
          </button>
          <button
            type="button"
            onClick={() => setTransactionType(transactionType === "payment" ? "" : "payment")}
            className={`flex items-center justify-center p-2 rounded-md text-sm ${
              transactionType === "payment"
                ? "bg-[#8A7D55] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } transition-colors`}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Payment
          </button>
          <button
            type="button"
            onClick={() => setTransactionType(transactionType === "refund" ? "" : "refund")}
            className={`flex items-center justify-center p-2 rounded-md text-sm ${
              transactionType === "refund"
                ? "bg-[#8A7D55] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } transition-colors`}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refund
          </button>
        </div>
      </div>
      
      {/* Status */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 block mb-1">Status</label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStatus(status === "completed" ? "" : "completed")}
            className={`flex items-center justify-center p-2 rounded-md text-sm ${
              status === "completed"
                ? "bg-[#8A7D55] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } transition-colors`}
          >
            <Check className="w-4 h-4 mr-1" />
            Completed
          </button>
          <button
            type="button"
            onClick={() => setStatus(status === "pending" ? "" : "pending")}
            className={`flex items-center justify-center p-2 rounded-md text-sm ${
              status === "pending"
                ? "bg-[#8A7D55] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } transition-colors`}
          >
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </button>
          <button
            type="button"
            onClick={() => setStatus(status === "failed" ? "" : "failed")}
            className={`flex items-center justify-center p-2 rounded-md text-sm ${
              status === "failed"
                ? "bg-[#8A7D55] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } transition-colors`}
          >
            <X className="w-4 h-4 mr-1" />
            Failed
          </button>
        </div>
      </div>
      
      {/* Date Range */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
          Date Range
        </label>
        <div className="grid grid-cols-1 gap-2">
          <div>
            <label className="text-xs text-gray-500 block mb-1">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#8A7D55] focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#8A7D55] focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>
      
      {/* Amount Range */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
          Amount Range
        </label>
        <div className="grid grid-cols-1 gap-2">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Min Amount</label>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="0"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#8A7D55] focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Max Amount</label>
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="Any"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#8A7D55] focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>
      
      {/* Reference ID */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <Hash className="w-4 h-4 mr-1 text-gray-400" />
          Reference ID
        </label>
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Transaction reference"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#8A7D55] focus:border-transparent outline-none"
        />
      </div>
      
      {/* Rental ID */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <Hash className="w-4 h-4 mr-1 text-gray-400" />
          Rental ID
        </label>
        <input
          type="text"
          value={rentalId}
          onChange={(e) => setRentalId(e.target.value)}
          placeholder="Related booking ID"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#8A7D55] focus:border-transparent outline-none"
        />
      </div>
    </div>
  );
};

export default EnhancedTransactionFilters;