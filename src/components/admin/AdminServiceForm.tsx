import React from 'react';
import { X, Tag, DollarSign, Calendar, FileText, CheckCircle, Loader } from 'lucide-react';

// Define the props interface for the AdminServiceForm component
interface AdminServiceFormProps {
  // Form type
  isEditMode?: boolean;
  
  // Form data
  formName: string;
  setFormName: (value: string) => void;
  formRate: number;
  setFormRate: (value: number) => void;
  formDaily: boolean;
  setFormDaily: (value: boolean) => void;
  formDescription: string;
  setFormDescription: (value: string) => void;
  formAvailable: boolean;
  setFormAvailable: (value: boolean) => void;
  
  // Form actions
  handleSubmit: (e: React.FormEvent) => void;
  closeForm: () => void;
  isLoading: boolean;
  
  // Optional - only required for edit mode
  currentService?: Service | null;
}

const AdminServiceForm: React.FC<AdminServiceFormProps> = ({
  // Form type
  isEditMode = false,
  
  // Form data
  formName,
  setFormName,
  formRate,
  setFormRate,
  formDaily,
  setFormDaily,
  formDescription,
  setFormDescription,
  formAvailable,
  setFormAvailable,
  
  // Form actions
  handleSubmit,
  closeForm,
  isLoading,
  
  // Optional - only required for edit mode
  currentService = null
}) => {
  // Determine title and button text based on mode
  const formTitle = isEditMode ? "Edit Service" : "Add New Service";
  const submitButtonText = isEditMode ? "Update Service" : "Create Service";
  const loadingText = isEditMode ? "Updating..." : "Creating...";
  
  // Form submission handler that calls the appropriate function
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(e);
  };

  // Handle rate change - converting string to number
  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert the string value to number
    const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
    setFormRate(value);
  };

  return (
    <div className="mb-8 p-6 border border-[#8A7D55] rounded-lg shadow-md bg-[url('/images/subtle-pattern.png')] bg-repeat bg-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-[#8A7D55] opacity-5 rounded-full -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#8A7D55] opacity-5 rounded-full -ml-16 -mb-16"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-5 border-b border-[#e8e0cc] pb-3">
          <h3 className="text-xl font-semibold text-[#8A7D55] flex items-center">
            {formTitle}
          </h3>
          <button
            onClick={closeForm}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 bg-white rounded-full p-1 hover:bg-gray-100 shadow-sm"
            aria-label="Close form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label
                htmlFor="service-name"
                className="text-sm font-medium text-[#6b5d3e] mb-1 flex items-center"
              >
                Service Name <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <Tag className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  id="service-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55] bg-white transition-all duration-200"
                  placeholder="Enter service name"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="service-rate"
                className="text-sm font-medium text-[#6b5d3e] mb-1 flex items-center"
              >
                Rate <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <DollarSign className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="number"
                  id="service-rate"
                  min="0"
                  step="0.01"
                  value={formRate} 
                  onChange={handleRateChange} 
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55] bg-white transition-all duration-200"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-[#f9f7f2] p-4 rounded-md border border-[#e8e0cc] shadow-sm">
            <div className="flex items-center">
              <div className="relative flex items-center mr-3">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="billing-type"
                    checked={formDaily}
                    onChange={(e) => setFormDaily(e.target.checked)}
                    className="h-5 w-5 opacity-0 absolute z-10 cursor-pointer"
                  />
                  <div
                    className={`flex items-center justify-center h-5 w-5 border rounded ${
                      formDaily
                        ? "bg-[#8A7D55] border-[#8A7D55]"
                        : "bg-white border-gray-300"
                    } transition-colors duration-200`}
                  >
                    {formDaily && (
                      <svg
                        className="h-3.5 w-3.5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
              <label
                htmlFor="billing-type"
                className="flex items-center cursor-pointer"
              >
                <Calendar className="h-4 w-4 mr-2 text-[#8A7D55]" />
                <div>
                  <span className="text-sm font-medium text-[#6b5d3e]">
                    Billing Type:
                  </span>
                  <span className="ml-2 text-sm font-semibold bg-[#8A7D55] bg-opacity-10 py-0.5 px-2 rounded-full text-[#8A7D55]">
                    {formDaily ? "Per Day" : "One Time"}
                  </span>
                </div>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1 ml-8">
              {formDaily
                ? "Client will be charged this rate for each day of service"
                : "Client will be charged this rate once for the entire service"}
            </p>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="service-description"
              className="text-sm font-medium text-[#6b5d3e] mb-1 flex items-center"
            >
              Description <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <FileText className="h-4 w-4 absolute left-3 top-3 text-gray-500" />
              <textarea
                id="service-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55] bg-white transition-all duration-200"
                placeholder="Describe your service..."
                required
              />
            </div>
          </div>

          <div className="p-4 bg-[#f9f7f2] rounded-md border border-[#e8e0cc] shadow-sm">
            <label className="flex items-center hover:cursor-pointer group">
              <div className="relative mr-3">
                <input
                  type="checkbox"
                  id="service-available"
                  checked={formAvailable}
                  onChange={(e) => setFormAvailable(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#8A7D55] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8A7D55] shadow-inner"></div>
              </div>
              <div>
                <span className="text-sm font-medium text-[#6b5d3e] group-hover:text-[#8A7D55] transition-colors duration-200">
                  Available for booking
                </span>
                <p className="text-xs text-gray-500">
                  {formAvailable
                    ? "This service is visible to clients and can be booked"
                    : "This service is hidden from clients and cannot be booked"}
                </p>
              </div>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={closeForm}
              className="px-4 py-2.5 border border-gray-300 bg-white rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center font-medium shadow-sm"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2.5 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center font-medium shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  {loadingText}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {submitButtonText}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminServiceForm;