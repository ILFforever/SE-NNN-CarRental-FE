"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL, createAuthHeader } from "@/config/apiConfig";
import { User, ApiResponse } from "@/types/dataTypes";
import { useSession } from "next-auth/react";
import TierBadge from "@/components/util/TierBadge";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface AdminUserManagementProps {
  token: string;
}

interface AdminUserFormData {
  name: string;
  email: string;
  telephone_number: string;
  password: string;
  confirmPassword: string;
}

export default function AdminUserManagement({
  token,
}: AdminUserManagementProps) {
  const { data: session } = useSession();
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [filteredAdminUsers, setFilteredAdminUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formData, setFormData] = useState<AdminUserFormData>({
    name: "",
    email: "",
    telephone_number: "",
    password: "",
    confirmPassword: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<User | null>(null);

  // Open delete modal
  const openDeleteModal = (admin: User) => {
    setAdminToDelete(admin);
    setShowDeleteModal(true);
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setAdminToDelete(null);
    setShowDeleteModal(false);
  };
  // Reset form fields function
  const resetFormFields = () => {
    setFormData({
      name: "",
      email: "",
      telephone_number: "",
      password: "",
      confirmPassword: "",
    });
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter admin users based on name or email
    const filtered = adminUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );

    setFilteredAdminUsers(filtered);
  };

  // Handle cancel button click
  const handleCancelCreate = () => {
    resetFormFields();
    setShowCreateForm(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch all admin users on component mount
  useEffect(() => {
    if (!token) {
      setError("No authentication token available. Please log in again.");
    } else {
      fetchAdminUsers();
    }
  }, [token]);

  const fetchAdminUsers = async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/admins`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Admin users fetch failed with status:", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to fetch admin users: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setAdminUsers(data.data);
        setFilteredAdminUsers(data.data);
      } else {
        throw new Error("Unexpected response format from server");
      }
    } catch (error) {
      console.error("Error fetching admin users:", error);
      setError("Could not load admin users. Please try again later.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Validate form input
  const validateForm = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.telephone_number ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("All fields are required");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    // Validate phone format (XXX-XXXXXXX)
    const phoneRegex = /^\d{3}-\d{7}$/;
    if (!phoneRegex.test(formData.telephone_number)) {
      setError(
        "Phone number must be in format XXX-XXXXXXX (e.g., 123-4567890)"
      );
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          telephone_number: formData.telephone_number,
          role: "admin",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.msg || "Failed to create admin user"
        );
      }

      // Reset form and show success message
      resetFormFields();
      setSuccess("Admin user created successfully");
      setShowCreateForm(false);

      // Refresh the admin users list
      fetchAdminUsers();
    } catch (error) {
      console.error("Error creating admin user:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    // Remove the confirm dialog since we're using a modal now
    // if (!confirm('Are you sure you want to deactivate this admin user?')) {
    //   return;
    // }

    // Prevent deleting themselves
    if (userId === session?.user?._id) {
      setError("You cannot delete your own admin account");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/admins/${userId}`, {
        method: "DELETE",
        headers: {
          ...createAuthHeader(token),
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.message || data.msg || "Failed to deactivate user"
        );
      }

      setSuccess("Admin user deactivated successfully");

      // Update the admin users list
      setAdminUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== userId)
      );
      setFilteredAdminUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== userId)
      );

      // Close the modal
      closeDeleteModal();
    } catch (error) {
      console.error("Error deactivating user:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
      closeDeleteModal();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && adminToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    Deactivate Admin User
                  </h3>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to deactivate{" "}
                  <span className="font-semibold">{adminToDelete.name}</span>?
                </p>
                <div className="mt-4 bg-red-50 p-4 rounded-md">
                  <p className="text-sm text-red-700">
                    WARNING: Deactivating this admin user will permanently
                    remove their administrative privileges.
                  </p>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={() => handleDeactivateUser(adminToDelete._id)}
                  disabled={isLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                >
                  {isLoading ? "Deactivating..." : "Deactivate"}
                </button>
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={isLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8A7D55] sm:mt-0 sm:col-start-1 sm:text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Success and Error Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
          {error.includes("401") && (
            <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
              <p className="font-medium">Troubleshooting tips:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>
                  Your session might have expired. Try signing out and back in.
                </li>
                <li>Make sure you have admin privileges.</li>
                <li>Check if your backend API is running correctly.</li>
              </ul>
            </div>
          )}
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
            placeholder="Search administrators by name or email"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:border-[#8A7D55] transition-all duration-300 ease-in-out"
          />
        </div>
        {/* Refresh button */}
        <button
          onClick={fetchAdminUsers}
          disabled={isRefreshing}
          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:ring-opacity-50"
          title="Refresh admin list"
        >
          <RefreshCw
            className={`h-5 w-5 text-gray-500 ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
        </button>
        {/* Create Admin Button with Icon */}
        <button
          onClick={() => {
            if (showCreateForm) {
              handleCancelCreate();
            } else {
              setShowCreateForm(true);
            }
          }}
          className="flex items-center justify-center px-4 py-2 bg-[#8A7D55] text-white rounded-lg hover:bg-[#766b48] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:ring-opacity-50"
        >
          {showCreateForm ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create New Admin
            </>
          )}
        </button>
      </div>

      {/* Create Admin Form */}
      {showCreateForm && (
        <div className="mb-8 p-5 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-medium mb-4">Create New Administrator</h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                />
              </div>

              <div>
                <label
                  htmlFor="telephone_number"
                  className="block text-gray-700 mb-1"
                >
                  Telephone (XXX-XXXXXXX)
                </label>
                <input
                  type="tel"
                  id="telephone_number"
                  name="telephone_number"
                  value={formData.telephone_number}
                  onChange={handleInputChange}
                  placeholder="123-4567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-gray-700 mb-1"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancelCreate}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors disabled:opacity-50"
              >
                {isLoading ? "Creating..." : "Create Admin User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin Users Table */}
      <div className="overflow-x-auto">
        {isLoading && !filteredAdminUsers.length ? (
          <p className="text-center py-4">Loading admin users...</p>
        ) : filteredAdminUsers.length === 0 ? (
          <p className="text-center py-4 text-gray-600">
            No admin users found.
          </p>
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
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Telephone
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Created
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tier
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdminUsers.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {user.telephone_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TierBadge tier={user.tier} showLabel={false} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user._id === session?.user?._id ? (
                      <span className="text-gray-400 cursor-not-allowed">
                        Current User
                      </span>
                    ) : (
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Deactivate
                      </button>
                    )}
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
