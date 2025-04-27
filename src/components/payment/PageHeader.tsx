import React from "react";
import Link from "next/link";

type PageHeaderProps = {
  title: string;
  backUrl?: string;
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  backUrl = "/account/reservations",
}) => {
  return (
    <div className="flex items-center mb-8">
      <Link
        href={backUrl}
        className="mr-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </Link>
      <h1 className="text-2xl font-medium text-gray-800">{title}</h1>
    </div>
  );
};