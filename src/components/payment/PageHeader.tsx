import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PageHeaderProps = {
  title: string;
};

export const PageHeader = ({ title }: PageHeaderProps) => {
  return (
    <div className="flex items-center mb-8">
      <Link
        href="/account/reservations"
        className="mr-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
      >
        <ArrowLeft size={20} />
      </Link>
      <h1 className="text-3xl font-medium font-serif">{title}</h1>
    </div>
  );
};