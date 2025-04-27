import React from "react";

type InfoItem = {
  icon: React.ReactNode;
  text: string;
};

type PaymentInformationCardProps = {
  items?: InfoItem[];
};

export const PaymentInformationCard: React.FC<PaymentInformationCardProps> = ({
  items = defaultItems,
}) => {
  return (
    <div className="mt-5 rounded-lg bg-gray-50 p-4 text-sm text-gray-600 border border-gray-200">
      <h3 className="font-medium text-gray-700 mb-2">Payment Information</h3>
      <ul className="space-y-2 text-xs">
        {items.map((item, index) => (
          <li key={index} className="flex items-start">
            {item.icon}
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Default items that will be shown if no custom items are provided
const defaultItems: InfoItem[] = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-500 mr-2 mt-0.5"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    text: "Payment is secure and processed instantly",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-500 mr-2 mt-0.5"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      </svg>
    ),
    text: "Cancellations within 48 hours: 50% refund",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-500 mr-2 mt-0.5"
      >
        <path d="M9 11V6a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v0" />
        <path d="M5 5a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v6" />
        <path d="M13 5a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v6" />
        <path d="M17 7v7" />
        <path d="M17 15a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-3" />
      </svg>
    ),
    text: "By completing payment, you agree to our terms",
  },
];