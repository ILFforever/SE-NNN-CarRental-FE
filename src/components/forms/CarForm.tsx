"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config/apiConfig";
import Link from "next/link";
import { Check, ChevronDown, Loader2, X } from "lucide-react";
import CarImageUpload from "./CarImageUpload";

// Service interface
interface Service {
  _id: string;
  name: string;
  description?: string;
  rate: number;
  available: boolean;
  daily: boolean;
}

interface ServiceListProps {
  serviceList: Service[];
  title: string;
  rateLabel: string;
  selectedServices: string[];
  toggleService: (id: string) => void;
  formatCurrency: (amount: number) => string;
}

// Provider interface
interface Provider {
  _id: string;
  name: string;
}

// Form data interface
interface CarFormData {
  license_plate: string;
  brand: string;
  model: string;
  type: string;
  color: string;
  manufactureDate: string;
  dailyRate: number;
  tier: number;
  service: string[];
  provider_id: string;
}

// Component props interface
interface CarFormProps {
  carId?: string;
  token: string;
  isAdmin?: boolean;
  providerId?: string;
  onSuccess?: () => void;
  backUrl?: string;
  title?: string;
}

// ServiceList component for rendering services by type
const ServiceList: React.FC<ServiceListProps> = ({
  serviceList,
  title,
  rateLabel,
  selectedServices,
  toggleService,
  formatCurrency,
}) => {
  if (serviceList.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-[#8A7D55] mb-3">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {serviceList.map((service) => (
          <div
            key={service._id}
            className={`
              p-3 rounded-md border transition-all cursor-pointer
              ${
                selectedServices.includes(service._id)
                  ? "border-[#8A7D55] bg-[#f8f5f0]"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }
            `}
            onClick={() => toggleService(service._id)}
          >
            <div className="flex items-center">
              <div
                className={`
                  w-5 h-5 rounded border flex items-center justify-center mr-3
                  ${
                    selectedServices.includes(service._id)
                      ? "bg-[#8A7D55] border-[#8A7D55]"
                      : "border-gray-300 bg-white"
                  }
                `}
              >
                {selectedServices.includes(service._id) && (
                  <Check className="w-3.5 h-3.5 text-white" />
                )}
              </div>

              <div className="flex-grow">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-800">{service.name}</h4>
                  <span className="text-sm font-semibold text-[#8A7D55]">
                    {formatCurrency(service.rate)}
                    <span className="text-xs text-gray-500 ml-1">
                      {rateLabel}
                    </span>
                  </span>
                </div>
                {service.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {service.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function CarForm({
  carId,
  token,
  isAdmin = false,
  providerId,
  onSuccess,
  backUrl = "/provider/manageCars",
  title = "Add New Car",
}: CarFormProps) {
  const router = useRouter();

  // States
  const [isLoading, setIsLoading] = useState(!!carId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);

  // Image states
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);

  // Service states
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [serviceError, setServiceError] = useState<string | null>(null);

  // Car types options
  const carTypes = [
    "sedan",
    "suv",
    "hatchback",
    "convertible",
    "truck",
    "van",
    "other",
  ];

  // Tiers options (0-4)
  const tiers = [0, 1, 2, 3, 4];

  // Colors options
  const carColors = [
    "Black",
    "White",
    "Silver",
    "Gray",
    "Blue",
    "Red",
    "Green",
    "Yellow",
    "Orange",
    "Purple",
    "Brown",
    "Gold",
    "Other",
  ];

  // Initial form data
  const initialFormData: CarFormData = {
    license_plate: "",
    brand: "",
    model: "",
    type: "sedan",
    color: "",
    manufactureDate: new Date().toISOString().split("T")[0],
    dailyRate: 0,
    tier: 0,
    service: [],
    provider_id: providerId || "",
  };

  const [formData, setFormData] = useState<CarFormData>(initialFormData);

  // Handle selected images change
  const handleImagesChange = (files: File[]) => {
    setSelectedImages(files);
  };

  // If admin, fetch car providers
  useEffect(() => {
    const fetchProviders = async () => {
      if (!isAdmin || !token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/Car_Provider`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch car providers");
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          setProviders(data.data);
        }
      } catch (err) {
        console.error("Error fetching providers:", err);
        setError("Could not load provider list. Some features may be limited.");
      }
    };

    if (isAdmin) {
      fetchProviders();
    }
  }, [isAdmin, token]);

  // Fetch available services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoadingServices(true);

        const response = await fetch(`${API_BASE_URL}/services`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch services");
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          // Only show available services
          setServices(
            data.data.filter((service: Service) => service.available !== false)
          );
        } else {
          setServices([]);
        }
      } catch (err) {
        console.error("Error fetching services:", err);
        setServiceError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setIsLoadingServices(false);
      }
    };

    if (token) {
      fetchServices();
    }
  }, [token]);

  // Fetch car data if editing existing car
  useEffect(() => {
    const fetchCarData = async () => {
      if (!carId || !token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/cars/${carId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch car data");
        }

        const data = await response.json();

        console.log("Full Car Data:", data);
       // console.log("Images:", data.data.images);
        //console.log("Image Order:", data.data.imageOrder);

        if (data.success && data.data) {
          // Format the date from ISO to YYYY-MM-DD for input
          const manufactureDate = new Date(data.data.manufactureDate)
            .toISOString()
            .split("T")[0];

          // console.log("Detailed Image Information:", {
          //   rawImages: data.data.images,
          //   rawImageOrder: data.data.imageOrder,
          //   manufactureDate: manufactureDate,
          // });
          
          if (data.data.images && Array.isArray(data.data.images)) {
            // Log when setting existing images
            //console.log("Setting Existing Images:", data.data.images);
            setExistingImages(data.data.images);
          }
          // Use imageOrder if available, otherwise fallback to images
          const imagesToSet =
            data.data.imageOrder && data.data.imageOrder.length > 0
              ? data.data.imageOrder
              : data.data.images || [];

          setExistingImages(imagesToSet);
          setFormData({
            license_plate: data.data.license_plate,
            brand: data.data.brand,
            model: data.data.model,
            type: data.data.type,
            color: data.data.color,
            manufactureDate,
            dailyRate: data.data.dailyRate,
            tier: data.data.tier,
            service: data.data.service || [],
            provider_id: data.data.provider_id,
          });
        } else {
          throw new Error("Invalid data format");
        }
      } catch (err) {
        console.error("Error fetching car:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarData();
  }, [carId, token]);

  // Handle input change for form fields
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // Special handling for numeric values
    if (name === "dailyRate" || name === "tier") {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "tier" ? parseInt(value) : parseFloat(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Toggle service selection
  const toggleService = (serviceId: string) => {
    const isSelected = formData.service.includes(serviceId);

    if (isSelected) {
      // Remove service
      setFormData((prev) => ({
        ...prev,
        service: prev.service.filter((id) => id !== serviceId),
      }));
    } else {
      // Add service
      setFormData((prev) => ({
        ...prev,
        service: [...prev.service, serviceId],
      }));
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Mark existing image for removal
  const handleRemoveExistingImage = (imageUrl: string) => {
    setImagesToRemove((prev) => [...prev, imageUrl]);
    setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
  };

  // Form validation
  const validateForm = () => {
    if (
      !formData.license_plate ||
      !formData.brand ||
      !formData.model ||
      !formData.type ||
      !formData.color ||
      !formData.manufactureDate ||
      formData.dailyRate <= 0 ||
      !formData.provider_id
    ) {
      setError("All fields are required. Daily rate must be greater than 0.");
      return false;
    }

    // Validate license plate format
    const licensePlateRegex = /^[A-Za-z0-9 -]{2,20}$/;
    if (!licensePlateRegex.test(formData.license_plate)) {
      setError(
        "License plate format is invalid. It should be 2-20 alphanumeric characters, spaces, or hyphens."
      );
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Missing authentication token");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Create form data for file upload
      const formDataToSend = new FormData();

      // Add all fields to form data
      Object.keys(formData).forEach((key) => {
        if (key === "service") {
          // Handle services array
          formData.service.forEach((serviceId) => {
            formDataToSend.append("service", serviceId);
          });
        } else {
          formDataToSend.append(
            key,
            formData[key as keyof CarFormData].toString()
          );
        }
      });

      // Add images to form data
      selectedImages.forEach((file) => {
        formDataToSend.append("images", file);
      });

      // Add list of images to remove if updating
      if (carId && imagesToRemove.length > 0) {
        formDataToSend.append("removeImage", JSON.stringify(imagesToRemove));
      }

      // Determine if we're creating a new car or updating an existing one
      const url = carId
        ? `${API_BASE_URL}/cars/${carId}`
        : `${API_BASE_URL}/cars`;

      const method = carId ? "PUT" : "POST";
      // console.log("Files to upload:", selectedImages);
      // console.log(
      //   "Form data being submitted:",
      //   Object.fromEntries(formDataToSend)
      // );
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - it will be set automatically with the boundary
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            errorData.msg ||
            `Failed to ${carId ? "update" : "create"} car`
        );
      }

      setSuccess(`Car ${carId ? "updated" : "created"} successfully`);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Otherwise redirect back to car management page after a short delay
        setTimeout(() => {
          router.push(backUrl);
        }, 1500);
      }
    } catch (err) {
      console.error(`Error ${carId ? "updating" : "creating"} car:`, err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Get tier name based on tier number
  const getTierName = (tier: number): string => {
    switch (tier) {
      case 0:
        return "Bronze";
      case 1:
        return "Silver";
      case 2:
        return "Gold";
      case 3:
        return "Platinum";
      case 4:
        return "Diamond";
      default:
        return `Tier ${tier}`;
    }
  };

  // Render ServiceSelection component
  const renderServiceSelection = () => {
    if (isLoadingServices) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-t-2 border-[#8A7D55] rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading services...</span>
        </div>
      );
    }

    if (serviceError) {
      return (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          Unable to load services: {serviceError}
        </div>
      );
    }

    if (services.length === 0) {
      return (
        <div className="p-4 bg-gray-50 rounded-md text-gray-500 text-center">
          No services are currently available.
        </div>
      );
    }

    // Separate daily services from one-time services
    const dailyServices = services.filter((service) => service.daily);
    const oneTimeServices = services.filter((service) => !service.daily);

    return (
      <div>
        {/* All services in one list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {services.map((service) => {
            const isSelected = formData.service.includes(service._id);
            const badgeColor = service.daily
              ? isSelected
                ? "bg-blue-500 text-white"
                : "bg-blue-100 text-blue-700"
              : isSelected
              ? "bg-purple-500 text-white"
              : "bg-purple-100 text-purple-700";

            return (
              <div
                key={service._id}
                className={`
                  p-3 rounded-md border transition-all cursor-pointer
                  ${
                    isSelected
                      ? "border-[#8A7D55] bg-[#f8f5f0]"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }
                `}
                onClick={() => toggleService(service._id)}
              >
                <div className="flex items-center">
                  <div
                    className={`
                      w-5 h-5 rounded border flex items-center justify-center mr-3
                      ${
                        isSelected
                          ? "bg-[#8A7D55] border-[#8A7D55]"
                          : "border-gray-300 bg-white"
                      }
                    `}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>

                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-800">
                        {service.name}
                      </h4>
                      <span
                        className={`text-sm font-semibold ${badgeColor} px-2 py-1 rounded-full`}
                      >
                        {service.daily ? "Daily: " : "One-time: "}$
                        {service.rate.toFixed(2)}
                      </span>
                    </div>
                    {service.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Services Summary */}
        {formData.service.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Selected Services
            </h3>
            <div className="flex flex-wrap gap-2">
              {services
                .filter((service) => formData.service.includes(service._id))
                .map((service) => {
                  const tagColor = service.daily
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-purple-50 text-purple-700 border border-purple-200";

                  return (
                    <div
                      key={`selected-${service._id}`}
                      className={`inline-flex items-center ${tagColor} px-3 py-1.5 rounded-full text-sm font-medium group`}
                    >
                      <span className="truncate max-w-xs">{service.name}</span>
                      <span className="mx-1 text-xs font-bold">
                        ({service.daily ? "Daily" : "One-time"}: $
                        {service.rate.toFixed(2)})
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleService(service._id);
                        }}
                        className="ml-1 hover:text-red-500 focus:outline-none opacity-60 group-hover:opacity-100"
                        aria-label={`Remove ${service.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    );
  };
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-medium mb-4">{carId ? "Edit Car" : title}</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* License Plate */}
          <div>
            <label htmlFor="license_plate" className="block text-gray-700 mb-1">
              License Plate *
            </label>
            <input
              type="text"
              id="license_plate"
              name="license_plate"
              value={formData.license_plate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
              placeholder="e.g., ABC-123"
            />
          </div>

          {/* Brand */}
          <div>
            <label htmlFor="brand" className="block text-gray-700 mb-1">
              Brand *
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
              placeholder="e.g., Mercedes, BMW"
            />
          </div>

          {/* Model */}
          <div>
            <label htmlFor="model" className="block text-gray-700 mb-1">
              Model *
            </label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
              placeholder="e.g., C-Class, 5 Series"
            />
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-gray-700 mb-1">
              Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
            >
              {carTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label htmlFor="color" className="block text-gray-700 mb-1">
              Color *
            </label>
            <select
              id="color"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
            >
              <option value="">Select Color</option>
              {carColors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>

          {/* Manufacture Date */}
          <div>
            <label
              htmlFor="manufactureDate"
              className="block text-gray-700 mb-1"
            >
              Manufacture Date *
            </label>
            <input
              type="date"
              id="manufactureDate"
              name="manufactureDate"
              value={formData.manufactureDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
            />
          </div>

          {/* Daily Rate */}
          <div>
            <label htmlFor="dailyRate" className="block text-gray-700 mb-1">
              Daily Rate (USD) *
            </label>
            <input
              type="number"
              id="dailyRate"
              name="dailyRate"
              value={formData.dailyRate}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
            />
          </div>

          {/* Tier */}
          <div>
            <label htmlFor="tier" className="block text-gray-700 mb-1">
              Tier *
            </label>
            <select
              id="tier"
              name="tier"
              value={formData.tier}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
            >
              {tiers.map((tier) => (
                <option key={tier} value={tier}>
                  {getTierName(tier)} (Tier {tier})
                </option>
              ))}
            </select>
          </div>

          {/* Provider Selector (Admin only) */}
          {isAdmin && (
            <div>
              <label htmlFor="provider_id" className="block text-gray-700 mb-1">
                Car Provider *
              </label>
              <select
                id="provider_id"
                name="provider_id"
                value={formData.provider_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
              >
                <option value="">Select Provider</option>
                {providers.map((provider) => (
                  <option key={provider._id} value={provider._id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Car Image Upload Section */}
        <div className="col-span-1 md:col-span-3 mb-6">
          <CarImageUpload
            token={token}
            carId={carId}
            onImagesChange={handleImagesChange}
            existingImages={existingImages.map((image) => ({
              url: image.startsWith("http")
                ? image
                : `https://blob.ngixx.me/images/${image}`,
              id: image,
            }))}
            onExistingImageRemove={handleRemoveExistingImage}
            onExistingImagesReorder={(newOrder) => {
              // Update the order of existing images
              setExistingImages((prev) =>
                newOrder.map(
                  (orderItem) =>
                    prev.find((img) => img === orderItem) || orderItem
                )
              );
            }}
          />
        </div>

        {/* Service Selection */}
        <div className="col-span-1 md:col-span-3 mt-2 mb-6">
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="text-lg font-medium text-[#8A7D55] mb-3">
              Additional Services
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Select the additional services you want to offer with this car.
              These services will be available for customers to add during
              booking.
            </p>
            {renderServiceSelection()}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href={backUrl}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors disabled:opacity-50 flex items-center"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Saving...
              </>
            ) : carId ? (
              "Save Changes"
            ) : (
              "Add Car"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
