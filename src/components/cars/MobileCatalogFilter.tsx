'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  DollarSign, 
  Calendar 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface MobileCatalogFilterProps {
  filterOptions: {
    vehicleType: string[];
    brand: string[];
    year: string[];
    seats: string[];
  };
  activeFilters: {
    vehicleType: string;
    brand: string;
    year: string;
    seats: string;
  };
  setActiveFilters: (filters: any) => void;
  priceRange: { min: number; max: number };
  setPriceRange: (range: { min: number; max: number }) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cars: any[];
  onApplyFilters: () => void;
}

export default function MobileCatalogFilter({
  filterOptions,
  activeFilters, 
  setActiveFilters,
  priceRange,
  setPriceRange,
  searchQuery,
  setSearchQuery,
  cars,
  onApplyFilters
}: MobileCatalogFilterProps) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilterSection, setActiveFilterSection] = useState<string | null>(null);

  const toggleFilter = (category: string, value: string) => {
    setActiveFilters((prev: any) => ({
      ...prev,
      [category]: prev[category] === value ? '' : value
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      vehicleType: '',
      brand: '',
      year: '',
      seats: ''
    });
    setPriceRange({ min: 0, max: Number.MAX_SAFE_INTEGER });
    setSearchQuery('');
  };

  const renderFilterSection = (
    title: string, 
    options: string[], 
    category: keyof typeof activeFilters
  ) => {
    return (
      <div className="border-b border-gray-200 pb-4">
        <div 
          className="flex justify-between items-center py-2 px-4"
          onClick={() => setActiveFilterSection(
            activeFilterSection === category ? null : category
          )}
        >
          <h3 className="text-lg font-medium">{title}</h3>
          <ChevronDown 
            className={`transition-transform ${
              activeFilterSection === category ? 'rotate-180' : ''
            }`} 
          />
        </div>
        {activeFilterSection === category && (
          <div className="px-4 space-y-2">
            {options.map((option) => (
              <div 
                key={option}
                className="flex items-center"
                onClick={() => toggleFilter(category, option)}
              >
                <input 
                  type="checkbox" 
                  checked={activeFilters[category] === option}
                  readOnly
                  className="mr-3 rounded text-[#8A7D55] focus:ring-[#8A7D55]"
                />
                <span>{option}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="md:hidden">
      {/* Mobile Filter Trigger */}
      <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
        <div className="relative flex-1 mr-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search cars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-[#8A7D55] focus:border-[#8A7D55] text-sm"
          />
        </div>
        <button 
          onClick={() => setIsFilterModalOpen(true)}
          className="p-2 bg-[#8A7D55] text-white rounded-md"
        >
          <Filter className="h-5 w-5" />
        </button>
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'tween' }}
            className="fixed inset-0 z-50 bg-white flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Filters</h2>
              <button 
                onClick={() => setIsFilterModalOpen(false)}
                className="text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Filter Sections */}
            <div className="flex-1 overflow-y-auto">
              {/* Price Range */}
              <div className="border-b border-gray-200 pb-4 px-4 pt-4">
                <h3 className="text-lg font-medium mb-3">Price Range</h3>
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min === 0 ? '' : priceRange.min}
                      onChange={(e) => setPriceRange({
                        ...priceRange,
                        min: parseInt(e.target.value) || 0
                      })}
                      className="block w-full pl-7 pr-2 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-[#8A7D55] focus:border-[#8A7D55] text-sm"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max === Number.MAX_SAFE_INTEGER ? '' : priceRange.max}
                      onChange={(e) => setPriceRange({
                        ...priceRange,
                        max: parseInt(e.target.value) || Number.MAX_SAFE_INTEGER
                      })}
                      className="block w-full pl-7 pr-2 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-[#8A7D55] focus:border-[#8A7D55] text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Type Filter */}
              {renderFilterSection('Vehicle Type', filterOptions.vehicleType, 'vehicleType')}
              
              {/* Brand Filter */}
              {renderFilterSection('Make', filterOptions.brand, 'brand')}
              
              {/* Year Filter */}
              {renderFilterSection('Year', filterOptions.year, 'year')}
              
              {/* Seats Filter */}
              {renderFilterSection('Seats', filterOptions.seats, 'seats')}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 flex space-x-2">
              <button 
                onClick={clearAllFilters}
                className="flex-1 py-2 border border-red-300 text-red-600 rounded-md"
              >
                Clear All
              </button>
              <button 
                onClick={() => {
                  onApplyFilters();
                  setIsFilterModalOpen(false);
                }}
                className="flex-1 py-2 bg-[#8A7D55] text-white rounded-md"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}