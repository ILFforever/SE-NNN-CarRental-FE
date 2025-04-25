import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
  variant?: 'error' | 'warning' | 'info';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onClose,
  variant = 'error'
}) => {
  const variantStyles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-500',
      text: 'text-red-700'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-500',
      text: 'text-amber-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-500',
      text: 'text-blue-700'
    }
  };

  const style = variantStyles[variant];

  return (
    <div className={`${style.bg} ${style.border} border rounded-md p-4 mb-4 animate-fadeIn`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className={`${style.icon} flex-shrink-0 mr-3`}>
            <AlertCircle size={20} />
          </div>
          <div className={`${style.text} text-sm font-medium`}>
            {message}
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className={`${style.text} ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 hover:bg-opacity-20 hover:bg-gray-200 focus:outline-none`}
          >
            <span className="sr-only">Close</span>
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;