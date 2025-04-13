// src/components/forms/CarImageUpload.tsx
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  XCircle,
  Image as ImageIcon,
  Move,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { API_BASE_URL } from "@/config/apiConfig";

interface ExistingImage {
  url: string;
  id: string;
}

interface CarImageUploadProps {
  token?: string;
  carId?: string;
  onImagesChange: (files: File[]) => void;
  maxImages?: number;
  existingImages?: ExistingImage[];
  onExistingImageRemove?: (imageId: string) => void;
  onExistingImagesReorder?: (newOrder: string[]) => void;
}

export default function CarImageUpload({
  token,
  carId,
  onImagesChange,
  maxImages = 5,
  existingImages = [],
  onExistingImageRemove,
  onExistingImagesReorder,
}: CarImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [orderedExistingImages, setOrderedExistingImages] = useState<
    ExistingImage[]
  >([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedExistingIndex, setDraggedExistingIndex] = useState<
    number | null
  >(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [dropExistingIndex, setDropExistingIndex] = useState<number | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    //console.log("Initial existingImages:", existingImages);

    // If existingImages is empty, do nothing
    if (existingImages.length === 0) return;

    // Helper function to get full URL
    const getFullUrl = (image: string) =>
      image.startsWith("http")
        ? image
        : `https://blob.ngixx.me/images/${image}`;

    // Reorder images based on first image in the pair being the filename
    const reorderedImages = existingImages.map((img) => ({
      url: getFullUrl(typeof img === "string" ? img : img.url),
      id: typeof img === "string" ? img : img.id,
    }));

    //console.log("Reordered Images:", reorderedImages);

    setOrderedExistingImages(reorderedImages);
  }, [existingImages]);

  // Log ordered images when they change
  useEffect(() => {
    //console.log("Ordered Existing Images:", orderedExistingImages);
  }, [orderedExistingImages]);

  // Total image count for validation
  const totalImageCount = selectedFiles.length + existingImages.length;
  const remainingSlots =
    maxImages - selectedFiles.length - existingImages.length;

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      const newFiles = [...selectedFiles];
      const newPreviews = [...previews];

      // Only add up to the max number of allowed images
      const remainingSlots =
        maxImages - existingImages.length - selectedFiles.length;
      fileArray.slice(0, remainingSlots).forEach((file) => {
        // Only add image files
        if (file.type.startsWith("image/")) {
          newFiles.push(file);
          const fileUrl = URL.createObjectURL(file);
          newPreviews.push(fileUrl);
        }
      });

      setSelectedFiles(newFiles);
      setPreviews(newPreviews);
      onImagesChange(newFiles);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  const saveImageOrder = async (newOrder: string[]) => {
    if (!token || !carId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/cars/${carId}/image-order`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            // Use the actual filenames, not full URLs
            imageOrder: newOrder.map((url) =>
              url.startsWith("https://blob.ngixx.me/images/")
                ? url.replace("https://blob.ngixx.me/images/", "")
                : url
            ),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        //console.error("Failed to save image order:", errorData);
        throw new Error(errorData.message || "Failed to save image order");
      }
    } catch (error) {
      //console.error("Error saving image order:", error);
      // Optionally show a toast or error message to the user
    }
  };
  // Remove a new file
  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    const newPreviews = [...previews];

    // Remove the file and its preview
    newFiles.splice(index, 1);

    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(previews[index]);
    newPreviews.splice(index, 1);

    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    onImagesChange(newFiles);
  };

  // Remove an existing image
  const removeExistingImage = (index: number) => {
    if (onExistingImageRemove && existingImages[index]) {
      onExistingImageRemove(existingImages[index].id);
    }
  };

  // Move a new image up in the order
  const moveImageUp = (index: number) => {
    if (index <= 0) return;

    const newFiles = [...selectedFiles];
    const newPreviews = [...previews];

    // Swap with the previous item
    [newFiles[index], newFiles[index - 1]] = [
      newFiles[index - 1],
      newFiles[index],
    ];
    [newPreviews[index], newPreviews[index - 1]] = [
      newPreviews[index - 1],
      newPreviews[index],
    ];

    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    onImagesChange(newFiles);
  };

  // Move a new image down in the order
  const moveImageDown = (index: number) => {
    if (index >= selectedFiles.length - 1) return;

    const newFiles = [...selectedFiles];
    const newPreviews = [...previews];

    // Swap with the next item
    [newFiles[index], newFiles[index + 1]] = [
      newFiles[index + 1],
      newFiles[index],
    ];
    [newPreviews[index], newPreviews[index + 1]] = [
      newPreviews[index + 1],
      newPreviews[index],
    ];

    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    onImagesChange(newFiles);
  };

  // Move an existing image up in the order
  const moveExistingImageUp = (index: number) => {
    if (index <= 0 || !onExistingImagesReorder) return;

    const newExistingOrder = existingImages.map((img) => img.id);

    // Swap with the previous item
    [newExistingOrder[index], newExistingOrder[index - 1]] = [
      newExistingOrder[index - 1],
      newExistingOrder[index],
    ];

    onExistingImagesReorder(newExistingOrder);

    // Try to save order to backend if possible
    if (token && carId) {
      saveImageOrder(newExistingOrder);
    }
  };

  // Move an existing image down in the order
  const moveExistingImageDown = (index: number) => {
    if (index >= existingImages.length - 1 || !onExistingImagesReorder) return;

    const newExistingOrder = existingImages.map((img) => img.id);

    // Swap with the next item
    [newExistingOrder[index], newExistingOrder[index + 1]] = [
      newExistingOrder[index + 1],
      newExistingOrder[index],
    ];

    onExistingImagesReorder(newExistingOrder);

    // Try to save order to backend if possible
    if (token && carId) {
      saveImageOrder(newExistingOrder);
    }
  };

  // Drag and drop handlers for new images
  const handleDragStart = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      setDraggedExistingIndex(index);
    } else {
      setDraggedIndex(index);
    }
  };

  const handleDragEnter = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      setDropExistingIndex(index);
    } else {
      setDropIndex(index);
    }
  };

  const handleDragEnd = () => {
    // Handle drag between new images
    if (
      draggedIndex !== null &&
      dropIndex !== null &&
      draggedIndex !== dropIndex
    ) {
      const newFiles = [...selectedFiles];
      const newPreviews = [...previews];

      // Remove item at draggedIndex
      const [draggedFile] = newFiles.splice(draggedIndex, 1);
      const [draggedPreview] = newPreviews.splice(draggedIndex, 1);

      // Insert at dropIndex
      newFiles.splice(dropIndex, 0, draggedFile);
      newPreviews.splice(dropIndex, 0, draggedPreview);

      setSelectedFiles(newFiles);
      setPreviews(newPreviews);
      onImagesChange(newFiles);
    }
    // Handle drag between existing images
    else if (
      draggedExistingIndex !== null &&
      dropExistingIndex !== null &&
      draggedExistingIndex !== dropExistingIndex &&
      onExistingImagesReorder
    ) {
      const newExistingOrder = existingImages.map((img) => img.id);

      // Remove item at draggedIndex
      const [draggedId] = newExistingOrder.splice(draggedExistingIndex, 1);

      // Insert at dropIndex
      newExistingOrder.splice(dropExistingIndex, 0, draggedId);

      // Update local state
      onExistingImagesReorder(newExistingOrder);

      // Try to save order to backend if possible
      if (token && carId) {
        saveImageOrder(newExistingOrder);
      }
    }

    // Reset drag state
    setDraggedIndex(null);
    setDraggedExistingIndex(null);
    setDropIndex(null);
    setDropExistingIndex(null);
  };

  return (
    <div className="my-6">
      <div className="bg-gray-50 p-4 rounded-md border border-dashed border-gray-300 relative">
        <div className="mb-4 flex flex-col items-center justify-center">
          <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">Car Photos</h3>
          <p className="text-sm text-gray-500 text-center">
            {totalImageCount === 0 ? (
              <>
                Upload up to {maxImages} images of your car.
                <br />
                The first image will be used as the main photo.
              </>
            ) : (
              <>
                {totalImageCount} of {maxImages} images selected.
                {remainingSlots > 0
                  ? ` You can add ${remainingSlots} more.`
                  : " Maximum limit reached."}
              </>
            )}
          </p>
        </div>

        <input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.gif" //update to add more data types later
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
          disabled={totalImageCount >= maxImages}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={totalImageCount >= maxImages}
          className={`w-full py-2.5 rounded-md mt-2 flex items-center justify-center 
            ${
              totalImageCount >= maxImages
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-[#8A7D55] text-white hover:bg-[#766b48]"
            } 
            transition-colors`}
        >
          Select Photos
        </button>

        {(existingImages.length > 0 || selectedFiles.length > 0) && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2 font-medium">
              {totalImageCount} image{totalImageCount !== 1 ? "s" : ""} selected
            </p>
            <p className="text-xs text-gray-500 mb-2">
              <Move className="inline h-3 w-3 mr-1" />
              Drag and drop or use arrows to reorder. The first image will be
              used as the main photo.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Existing images */}
              {orderedExistingImages.map((image, index) => (
                <div
                  key={`existing-${image.id}`}
                  className={`
                    relative p-1 rounded-md 
                    ${
                      index === 0 && selectedFiles.length === 0
                        ? "ring-2 ring-[#8A7D55]"
                        : "ring-1 ring-gray-300"
                    } 
                    ${
                      draggedExistingIndex === index
                        ? "opacity-50"
                        : "opacity-100"
                    }
                    ${dropExistingIndex === index ? "bg-gray-100" : "bg-white"}
                  `}
                  draggable
                  onDragStart={() => handleDragStart(index, true)}
                  onDragEnter={() => handleDragEnter(index, true)}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnd={handleDragEnd}
                >
                  <div className="aspect-w-16 aspect-h-9 mb-1 overflow-hidden rounded">
                    <img
                      src={image.url}
                      alt={`Car photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-1">
                      <button
                        type="button"
                        onClick={() => moveExistingImageUp(index)}
                        disabled={index === 0}
                        className={`p-1 rounded-md text-gray-600 ${
                          index === 0
                            ? "opacity-30 cursor-not-allowed"
                            : "hover:bg-gray-100"
                        }`}
                        title="Move up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveExistingImageDown(index)}
                        disabled={index === existingImages.length - 1}
                        className={`p-1 rounded-md text-gray-600 ${
                          index === existingImages.length - 1
                            ? "opacity-30 cursor-not-allowed"
                            : "hover:bg-gray-100"
                        }`}
                        title="Move down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>

                    {index === 0 && selectedFiles.length === 0 && (
                      <span className="text-xs font-medium text-[#8A7D55] bg-[#f8f5f0] px-2 py-0.5 rounded-md">
                        Main Photo
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="p-1 rounded-md text-red-500 hover:bg-red-50"
                      title="Remove image"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* New images */}
              {previews.map((src, index) => (
                <div
                  key={`new-${index}`}
                  className={`
                    relative p-1 rounded-md 
                    ${
                      index === 0 && existingImages.length === 0
                        ? "ring-2 ring-[#8A7D55]"
                        : "ring-1 ring-gray-300"
                    } 
                    ${draggedIndex === index ? "opacity-50" : "opacity-100"}
                    ${dropIndex === index ? "bg-gray-100" : "bg-white"}
                  `}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnd={handleDragEnd}
                >
                  <div className="aspect-w-16 aspect-h-9 mb-1 overflow-hidden rounded">
                    <img
                      src={src}
                      alt={`Car photo ${existingImages.length + index + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-1">
                      <button
                        type="button"
                        onClick={() => moveImageUp(index)}
                        disabled={index === 0}
                        className={`p-1 rounded-md text-gray-600 ${
                          index === 0
                            ? "opacity-30 cursor-not-allowed"
                            : "hover:bg-gray-100"
                        }`}
                        title="Move up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImageDown(index)}
                        disabled={index === selectedFiles.length - 1}
                        className={`p-1 rounded-md text-gray-600 ${
                          index === selectedFiles.length - 1
                            ? "opacity-30 cursor-not-allowed"
                            : "hover:bg-gray-100"
                        }`}
                        title="Move down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>

                    {index === 0 && existingImages.length === 0 && (
                      <span className="text-xs font-medium text-[#8A7D55] bg-[#f8f5f0] px-2 py-0.5 rounded-md">
                        Main Photo
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 rounded-md text-red-500 hover:bg-red-50"
                      title="Remove image"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
