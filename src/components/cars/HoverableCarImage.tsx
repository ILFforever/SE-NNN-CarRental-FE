import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';

// Define the Car interface to resolve type errors
interface Car {
  brand: string;
  model: string;
  image?: string;
  images?: string[];
}

interface HoverableCarImageProps {
  car: Car;
  className?: string;
}

const HoverableCarImage = ({ car, className = '' }: HoverableCarImageProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Extract and prepare images array
  const images = useMemo(() => {
    // Handle cases where we receive an images array from API
    if (car.images && Array.isArray(car.images) && car.images.length > 0) {
      return car.images.map(img => {
        // Check if the image is already a full URL
        if (typeof img === 'string' && img.startsWith('http')) {
          return img;
        }
        // Check if it's a relative path that should be used as-is
        if (typeof img === 'string' && (img.startsWith('/') || img.includes('/'))) {
          return img;
        }
        // Otherwise, assume it's a filename in the R2 bucket
        return `https://blob.ngixx.me/images/${img}`;
      });
    }
    
    // Fall back to single image property if no images array
    if (car.image) {
      return [car.image];
    }
    
    // Default fallback
    return ['/img/car-placeholder.jpg'];
  }, [car]);

  // Memoized function to cycle through images
  const cycleImages = useCallback(() => {
    setCurrentImageIndex(prev => (prev + 1) % images.length);
  }, [images.length]);

  // Use a memoized version of interval setup to prevent unnecessary re-renders
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isHovering && images.length > 1) {
      // Change image immediately on first hover
      if (currentImageIndex === 0) {
        cycleImages();
      }
      
      // Setup interval for subsequent image changes
      intervalId = setInterval(cycleImages, 1000); // Change image every second
    }

    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isHovering, images.length, cycleImages, currentImageIndex]);

  // Memoized mouse enter/leave handlers
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    // Reset to first image when mouse leaves
    setCurrentImageIndex(0);
  }, []);

  return (
    <div 
      className={`relative h-48 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Image
        src={images[currentImageIndex]}
        alt={`${car.brand} ${car.model}`}
        fill
        className="object-cover transition-opacity duration-300"
      />
      
      {/* Optional: Image counter indicator (only show if multiple images) */}
      {images.length > 1 && (
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
          {currentImageIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

export default HoverableCarImage;