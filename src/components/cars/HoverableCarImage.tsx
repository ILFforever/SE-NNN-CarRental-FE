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
  const [cycleStarted, setCycleStarted] = useState(false);

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

  // Handle the hover state change
  useEffect(() => {
    // When hover starts
    if (isHovering && images.length > 1) {
      // Immediately show image 1 when hover starts
      setCurrentImageIndex(1);
      setCycleStarted(true);
    } else {
      // Reset to default image when not hovering
      setCurrentImageIndex(0);
      setCycleStarted(false);
    }
  }, [isHovering, images.length]);

  // Handle the cycling through images
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    // Only start cycling after we've manually changed to image 1
    if (isHovering && cycleStarted && images.length > 1) {
      intervalId = setInterval(() => {
        setCurrentImageIndex(prevIndex => {
          // Once we've shown image 1 immediately on hover,
          // start cycling from index 0 through all images
          const nextIndex = prevIndex + 1;
          
          // If we reached the end, go back to index 0
          return nextIndex >= images.length ? 0 : nextIndex;
        });
      }, 1000); // Change image every second
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isHovering, cycleStarted, images.length]);

  // Memoized mouse enter/leave handlers
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
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
        style={{objectFit:"cover"}}
        sizes="(max-width: 768px) 100vw, 50vw"
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