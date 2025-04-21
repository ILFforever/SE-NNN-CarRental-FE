'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Calendar, Clock, X, Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  actionType: 'confirm' | 'unpaid' | 'complete' | 'cancel' | 'delete';
  rentalId: string;
  carDetails?: {
    brand: string;
    model: string;
    licensePlate: string;
  };
  dates?: {
    startDate: string;
    returnDate: string;
  };
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  rentalId,
  carDetails,
  dates
}: ConfirmationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && !isProcessing) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose, isProcessing]);
  
  // Handle escape key to close
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isProcessing) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose, isProcessing]);
  
  // Get icon and colors based on action type
  const getActionDetails = () => {
    switch(actionType) {
      case "confirm":
        return {
          icon: <CheckCircle className="h-10 w-10 text-blue-500" />,
          title: 'Confirm Reservation',
          message: 'Are you sure you want to confirm this reservation? This will mark it as active and notify the customer.',
          buttonColor: 'bg-blue-500 hover:bg-blue-600',
          buttonText: 'Yes, Confirm Reservation'
        };
      case "complete":
        return {
          icon: <CheckCircle className="h-10 w-10 text-purple-500" />, // Changed from green to purple
          title: 'Mark Reservation as Unpaid', // Changed title
          message: 'Are you sure you want to mark this reservation as unpaid? This will make the vehicle available for other reservations.', // Updated message
          buttonColor: 'bg-purple-500 hover:bg-purple-600', // Changed from green to purple
          buttonText: 'Yes, Mark as Unpaid' // Updated button text
        };
      case 'cancel':
        return {
          icon: <XCircle className="h-10 w-10 text-amber-500" />,
          title: 'Cancel Reservation',
          message: 'Are you sure you want to cancel this reservation? This will make the vehicle available for other customers.',
          buttonColor: 'bg-amber-500 hover:bg-amber-600',
          buttonText: 'Yes, Cancel Reservation'
        };
      case 'delete':
        return {
          icon: <AlertTriangle className="h-10 w-10 text-red-500" />,
          title: 'Delete Reservation',
          message: 'Are you sure you want to permanently delete this reservation? This action cannot be undone.',
          buttonColor: 'bg-red-500 hover:bg-red-600',
          buttonText: 'Yes, Delete Permanently'
        };
      default:
        return {
          icon: <AlertTriangle className="h-10 w-10 text-gray-500" />,
          title: 'Confirm Action',
          message: 'Are you sure you want to proceed with this action?',
          buttonColor: 'bg-blue-500 hover:bg-blue-600',
          buttonText: 'Confirm'
        };
    }
  };
  
  const { icon, title, message, buttonColor, buttonText } = getActionDetails();
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const handleConfirmAction = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      // Successful operation handled by parent component
    } catch (error) {
      console.error('Error processing action:', error);
      // Error handling should be done by parent component
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto overflow-hidden transform transition-all"
        style={{ animation: 'modalFadeIn 0.3s ease-out' }}
      >
        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-3 border-b border-gray-200">
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center">
            {icon}
            <h3 className="text-xl font-semibold text-gray-900 ml-3">{title}</h3>
          </div>
        </div>
        
        {/* Modal Content */}
        <div className="px-6 py-4">
          <p className="text-gray-700 mb-4">{message}</p>
          
          {/* Reservation Details */}
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="text-sm text-gray-500 mb-1">Reservation ID:</div>
            <div className="text-sm font-medium text-gray-800 mb-3">{rentalId}</div>
            
            {carDetails && (
              <div className="mb-3">
                <div className="text-sm text-gray-500 mb-1">Vehicle:</div>
                <div className="text-sm font-medium text-gray-800">
                  {carDetails.brand} {carDetails.model} ({carDetails.licensePlate})
                </div>
              </div>
            )}
            
            {dates && (
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <div className="text-sm text-gray-500 mr-2">Start Date:</div>
                  <div className="text-sm font-medium text-gray-800">{formatDate(dates.startDate)}</div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <div className="text-sm text-gray-500 mr-2">Return Date:</div>
                  <div className="text-sm font-medium text-gray-800">{formatDate(dates.returnDate)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmAction}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-75 flex items-center ${buttonColor}`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              buttonText
            )}
          </button>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}