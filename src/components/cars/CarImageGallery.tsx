import { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import FavoriteHeartButton from '@/components/util/FavoriteHeartButton';

// Using the existing Car interface from your reserve page
interface Car {
  _id: string;
  brand: string;
  model: string;
  type?: string;
  color?: string;
  license_plate?: string;
  dailyRate?: number;
  tier?: number;
  provider_id?: string;
  manufactureDate?: string;
  available?: boolean;
  image?: string;
  images?: string[];
}

interface ImageGalleryProps {
  car: Car;
  showFavoriteButton?: boolean;
}

export default function CarImageGallery({ car, showFavoriteButton = true }: ImageGalleryProps) {
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);
  const [zoomImage, setZoomImage] = useState('');
  
  // Refs for gallery image modal
  const galleryImageContainerRef = useRef<HTMLDivElement>(null);
  
  const zoomFactor = 2.5; // How much to magnify the image in the zoom view
  
  // Process an individual image path
  const processImagePath = (img: string) => {
    // Check if the image is already a full URL
    if (img.startsWith('http')) {
      return img;
    }
    // Check if it's a relative path that should be used as-is
    if (img.startsWith('/') || img.includes('/')) {
      return img;
    }
    // Otherwise, assume it's a filename in the R2 bucket
    return `https://blob.ngixx.me/images/${img}`;
  };

  // Extract and prepare images array using the same logic as HoverableCarImage
  const displayImages = useMemo(() => {
    // Handle cases where we receive an images array from API
    if (car.images && Array.isArray(car.images) && car.images.length > 0) {
      return car.images.map(img => processImagePath(img));
    }
    
    // Fall back to single image property if no images array
    if (car.image) {
      return [processImagePath(car.image)];
    }
    
    // Default fallback to banner.jpg as in your reserve page
    return ['/img/banner.jpg'];
  }, [car]);
  
  // Set zoom image when current image changes
  useEffect(() => {
    setZoomImage(displayImages[currentImageIndex]);
  }, [currentImageIndex, displayImages]);
  
  const imageAlt = `${car.brand || ''} ${car.model || ''}`.trim() || 'Car image';
  
  const openGallery = () => setShowGallery(true);
  const closeGallery = () => setShowGallery(false);
  
  const goToNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };
  
  const goToPrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  // Handle mouse movement for zoom feature in the gallery ONLY
  const handleGalleryMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!galleryImageContainerRef.current) return;
    
    const container = galleryImageContainerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Find the image element inside the container
    const imageElement = container.querySelector('img');
    if (!imageElement) return;
    
    const imageRect = imageElement.getBoundingClientRect();
    
    // Only activate zoom if the mouse is over the actual image
    if (
      e.clientX < imageRect.left || 
      e.clientX > imageRect.right || 
      e.clientY < imageRect.top || 
      e.clientY > imageRect.bottom
    ) {
      setShowZoom(false);
      return;
    }
    
    // Calculate mouse position relative to image
    const x = e.clientX - imageRect.left;
    const y = e.clientY - imageRect.top;
    
    // Position of zoom lens
    const zoomX = e.clientX - rect.left;
    const zoomY = e.clientY - rect.top;
    
    // Set background position percentage for the zoom lens (0-100%)
    const bgPosX = (x / imageRect.width) * 100;
    const bgPosY = (y / imageRect.height) * 100;
    
    // Update the style of zoom element
    const zoomElement = document.getElementById('gallery-zoom-lens');
    if (zoomElement) {
      zoomElement.style.backgroundPosition = `${bgPosX}% ${bgPosY}%`;
      
      // Ensure zoom lens stays within view
      const maxX = rect.width - 150; // 150 = lens width + right margin
      const clampedX = Math.min(Math.max(0, zoomX), maxX);
      const clampedY = Math.min(Math.max(0, zoomY), rect.height - 150);
      
      zoomElement.style.left = `${clampedX + 30}px`;
      zoomElement.style.top = `${clampedY - 30}px`;
    }
    
    setZoomPosition({ x: zoomX, y: zoomY });
    setShowZoom(true);
  };
  
  // Prevent scrolling when gallery is open
  useEffect(() => {
    if (showGallery) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
  }, [showGallery]);
  
  return (
    <div className="relative">
      {/* Main image with button overlay - NO ZOOM FUNCTIONALITY HERE */}
      <div className="relative h-64 rounded-lg overflow-hidden bg-gray-100">
        {/* Favorite heart button */}
        {showFavoriteButton && car._id && (
          <FavoriteHeartButton
            carId={car._id}
            className="top-4 right-4 scale-125 z-10"
          />
        )}
        
        <Image 
          src={displayImages[0]} 
          alt={imageAlt}
          fill
          className="object-cover"
        />
        
        {/* "Not Available" overlay */}
        {/* {car.available === false && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
            <span className="text-white font-bold text-lg">Currently Rented</span>
          </div>
        )} */}
        
        {/* Gallery expand button */}
        <button 
          onClick={openGallery}
          className="absolute bottom-4 right-4 bg-[#8A7D55] bg-opacity-95 text-white p-2.5 rounded-md shadow-md hover:bg-opacity-100 transition-all flex items-center z-20 hover:shadow-lg"
          aria-label="Open image gallery"
        >
          <Expand className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">View Gallery</span>
        </button>
      </div>
      
      {/* Full Gallery Modal with Zoom Functionality */}
      {showGallery && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={closeGallery}
        >
          <div className="relative w-full max-w-5xl max-h-full flex flex-col bg-white bg-opacity-5 backdrop-blur-sm rounded-lg overflow-hidden">
            {/* Header with close button */}
            <div className="p-4 flex justify-between items-center border-b border-white border-opacity-20">
              <h3 className="text-white font-medium">
                {car.brand} {car.model} <span className="text-white text-opacity-70 text-sm font-normal ml-2">{currentImageIndex + 1} / {displayImages.length}</span>
              </h3>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  closeGallery();
                }}
                className="text-white hover:text-gray-300 transition-colors focus:outline-none"
                aria-label="Close gallery"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
          {/* Main image container with zoom functionality */}
            <div 
              className="flex-1 flex items-center justify-center relative p-4 cursor-zoom-in"
              ref={galleryImageContainerRef}
              onMouseMove={(e) => {
                // Only update position if zoom is already active
                if (showZoom) {
                  handleGalleryMouseMove(e);
                }
              }}
              onMouseDown={(e) => {
                if (e.button === 0) { // Only left mouse button
                  handleGalleryMouseMove(e); // Initial position
                  setShowZoom(true);
                }
              }}
              onMouseUp={() => setShowZoom(false)}
              onMouseLeave={() => setShowZoom(false)}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex items-center justify-center">
                <Image 
                  src={displayImages[currentImageIndex]} 
                  alt={`${imageAlt} ${currentImageIndex + 1} of ${displayImages.length}`}
                  width={1200}
                  height={800}
                  className="max-h-[75vh] w-auto object-contain rounded-md"
                  draggable = {false}
                  onDragStart={(e) => e.preventDefault()}
                  priority
                />
                
                {/* Zoom view in full gallery */}
                {showZoom && (
                <div 
                  id="gallery-zoom-lens"
                  className="absolute w-64 h-64 rounded-full overflow-hidden border-2 border-white shadow-lg pointer-events-none z-30 transform -translate-x-1/2 -translate-y-1/2 cursor-zoom-in"
                  style={{
                    left: `${zoomPosition.x}px`,
                    top: `${zoomPosition.y}px`,
                    backgroundImage: `url(${zoomImage})`,
                    backgroundSize: `${zoomFactor * 500}%`,
                    backgroundRepeat: 'no-repeat',
                  }}
                />
                )}
              </div>
              
              {/* Navigation arrows */}
              {displayImages.length > 1 && (
                <>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPrevImage();
                    }}
                    className="absolute left-6 p-3 bg-black bg-opacity-40 text-white rounded-full hover:bg-opacity-60 transition-colors backdrop-blur-sm"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      goToNextImage();
                    }}
                    className="absolute right-6 p-3 bg-black bg-opacity-40 text-white rounded-full hover:bg-opacity-60 transition-colors backdrop-blur-sm"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
                        
            {/* Footer with pagination dots */}
            {displayImages.length > 1 && (
              <div className="p-4 flex justify-center border-t border-white border-opacity-20">
                <div className="flex space-x-2">
                  {displayImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'bg-[#8A7D55] scale-125' 
                          : 'bg-white bg-opacity-30 hover:bg-opacity-50'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}