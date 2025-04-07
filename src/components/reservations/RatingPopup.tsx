"use client";

import React, { useState } from "react";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import { X } from "lucide-react";

interface RatingPopupProps {
  onSelect: (rating: number | null) => void;
}

const RatingPopup: React.FC<RatingPopupProps> = ({ onSelect }) => {
  const [value, setValue] = useState<number | null>(0);

  const handleConfirm = () => {
    if (value && value > 0) {
      onSelect(value);
    } else {
      onSelect(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80">
        {/* Header with title and cancel icon */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Rate Reservation</h2>
          <button
            onClick={() => onSelect(null)}
            className="text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* Rating control and confirm button */}
        <div className="flex flex-col items-center space-y-4">
          <Rating
            name="reservation-rating"
            value={value}
            onChange={(_, newValue) => {
              setValue(newValue);
            }}
            size="large"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirm}
            fullWidth
          >
            Confirm Rating
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RatingPopup;
