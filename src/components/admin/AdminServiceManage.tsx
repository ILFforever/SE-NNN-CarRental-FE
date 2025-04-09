"use client";

import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/apiConfig";
import {
  Plus,
  Edit,
  X,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  Loader,
  FileText,
  Calendar,
  DollarSign,
  Tag,
} from "lucide-react";
import { useSession } from "next-auth/react";
import AdminServiceForm from "./AdminServiceForm";

export interface AdminServiceManagementProps {
  // Optional token prop, will use session if not provided
  token?: string;
}

export default function AdminServiceManagement({
  token,
}: AdminServiceManagementProps) {
  // Use session if token is not provided
  const { data: session } = useSession();
  const authToken = token || session?.user?.token;

  // State management
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form state
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [formName, setFormName] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formDaily, setFormDaily] = useState<boolean>(false);
  const [formRate, setFormRate] = useState<number>(0);
  const [formAvailable, setFormAvailable] = useState<boolean>(true);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter services based on name or description
    const filtered = services.filter(
      (service) =>
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
    );

    setFilteredServices(filtered);
  };

  // Fetch services
  const fetchServices = async () => {
    setIsLoading(true);
    setError("");
    setIsRefreshing(true);

    if (!authToken) {
      setError("Authentication token not available. Please log in again.");
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/services`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setServices(data.data);
        setFilteredServices(data.data);
      } else {
        throw new Error("Unexpected response format from server");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setError("Could not load services. Please try again later.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial data fetch on component mount
  useEffect(() => {
    if (authToken) {
      fetchServices();
    } else {
      setError("No authentication token available. Please log in again.");
    }
  }, [authToken, session]);

  // Reset form state
  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormRate(0);
    setFormDaily(false);
    setFormAvailable(true);
    setCurrentService(null);
  };

  // Open create form
  const openCreateForm = () => {
    resetForm();
    setShowCreateForm(true);
    setShowEditForm(false);
  };

  // Open edit form
  const openEditForm = (service: Service) => {
    setCurrentService(service);
    setFormName(service.name);
    setFormDescription(service.description);
    setFormRate(service.rate);
    setFormAvailable(service.available);
    setShowEditForm(true);
    setShowCreateForm(false);
  };

  // Close forms
  const closeForm = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    resetForm();
  };

  // Create service
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!authToken) {
      setError("Authentication token not available. Please log in again.");
      setIsLoading(false);
      return;
    }

    try {
      // Validate form
      if (!formName.trim()) {
        throw new Error("Service name is required");
      }

      if (!formDescription.trim()) {
        throw new Error("Service description is required");
      }

      if (isNaN(formRate) || formRate < 0) {
        throw new Error("Service rate must be a valid non-negative number");
      }

      const response = await fetch(`${API_BASE_URL}/services`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formName.trim(),
          description: formDescription.trim(),
          daily: formDaily,
          rate: formRate,
          available: formAvailable,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create service");
      }

      const data = await response.json();

      if (data.success) {
        setSuccess("Service created successfully");
        closeForm();
        fetchServices();
      } else {
        throw new Error(data.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error creating service:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update service
  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!authToken) {
      setError("Authentication token not available. Please log in again.");
      setIsLoading(false);
      return;
    }

    if (!currentService) {
      setError("No service selected for update");
      setIsLoading(false);
      return;
    }

    try {
      // Validate form
      if (!formName.trim()) {
        throw new Error("Service name is required");
      }

      if (!formDescription.trim()) {
        throw new Error("Service description is required");
      }

      if (isNaN(formRate) || formRate < 0) {
        throw new Error("Service rate must be a valid non-negative number");
      }

      const response = await fetch(
        `${API_BASE_URL}/services/${currentService._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formName.trim(),
            description: formDescription.trim(),
            daily: formDaily,
            rate: formRate,
            available: formAvailable,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update service");
      }

      const data = await response.json();

      if (data.success) {
        setSuccess("Service updated successfully");
        closeForm();
        fetchServices();
      } else {
        throw new Error(data.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error updating service:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle service availability
  const toggleServiceAvailability = async (service: Service) => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!authToken) {
      setError("Authentication token not available. Please log in again.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/services/${service._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...service,
          available: !service.available,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error ||
            `Failed to ${service.available ? "disable" : "enable"} service`
        );
      }

      const data = await response.json();

      if (data.success) {
        setSuccess(
          `Service ${service.available ? "disabled" : "enabled"} successfully`
        );
        fetchServices();
      } else {
        throw new Error(data.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error toggling service availability:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Success and Error Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}

      {/* Search and Create Section */}
      <div className="flex items-center justify-between mb-6 space-x-4">
        {/* Search Input with Icon */}
        <div className="flex-grow relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search services by name or description"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:border-[#8A7D55] transition-all duration-300 ease-in-out"
          />
        </div>

        {/* Refresh button */}
        <button
          onClick={fetchServices}
          disabled={isRefreshing}
          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:ring-opacity-50"
          title="Refresh services list"
        >
          <RefreshCw
            className={`h-5 w-5 text-gray-500 ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
        </button>

        {/* Add Service Button with Icon */}
        <button
          onClick={openCreateForm}
          className="flex items-center justify-center px-4 py-2 bg-[#8A7D55] text-white rounded-lg hover:bg-[#766b48] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:ring-opacity-50"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Service
        </button>
      </div>

      {/* Create Service Form */}
      {showCreateForm && (
        <AdminServiceForm
          isEditMode={false}
          formName={formName}
          setFormName={setFormName}
          formRate={formRate}
          setFormRate={setFormRate}
          formDaily={formDaily}
          setFormDaily={setFormDaily}
          formDescription={formDescription}
          setFormDescription={setFormDescription}
          formAvailable={formAvailable}
          setFormAvailable={setFormAvailable}
          handleSubmit={handleCreateService}
          closeForm={closeForm}
          isLoading={isLoading}
        />
      )}

      {/* Edit Service Form */}
      {showEditForm && currentService && (
        <AdminServiceForm
          isEditMode={true}
          formName={formName}
          setFormName={setFormName}
          formRate={formRate}
          setFormRate={setFormRate}
          formDaily={formDaily}
          setFormDaily={setFormDaily}
          formDescription={formDescription}
          setFormDescription={setFormDescription}
          formAvailable={formAvailable}
          setFormAvailable={setFormAvailable}
          handleSubmit={handleUpdateService}
          closeForm={closeForm}
          isLoading={isLoading}
          currentService={currentService}
        />
      )}

      {/* Services Table */}
      <div className="overflow-x-auto">
        {isLoading && services.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55] mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              {searchQuery
                ? "No services match your search criteria."
                : "No services found. Add your first service to get started."}
            </p>
            {!searchQuery && !showCreateForm && (
              <button
                onClick={openCreateForm}
                className="mt-4 px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
              >
                Add New Service
              </button>
            )}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Rate
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Created
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredServices.map((service) => (
                <tr
                  key={service._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {service.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {service.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${service.rate.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {service.daily ? "Daily" : "Once"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        service.available
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {service.available ? "Available" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(service.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => openEditForm(service)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition-colors"
                        title="Edit service"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleServiceAvailability(service)}
                        className={`p-1 rounded-full transition-colors ${
                          service.available
                            ? "text-green-600 hover:text-green-900 hover:bg-green-50"
                            : "text-red-600 hover:text-red-900 hover:bg-red-50"
                        }`}
                        title={
                          service.available
                            ? "Disable service"
                            : "Enable service"
                        }
                      >
                        {service.available ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
