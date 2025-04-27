import React from "react";

export const LoadingState = () => {
  return (
    <main className="py-10 px-4 max-w-4xl mx-auto text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55] inline-block"></div>
      <p className="mt-4">Loading payment details...</p>
    </main>
  );
};