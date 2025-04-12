"use client";

import React from "react";

const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55]"></div>
      <p className="mt-4">Loading car details...</p>
    </div>
  );
};

export default LoadingState;