'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import FavoriteHeartButton from '@/components/cars/FavoriteHeartButton';

interface HoverableCarImageProps {
  car: Car;
  href?: string;
  showPrice?: boolean;
  showFavoriteButton?: boolean;
  className?: string;
  height?: string;
}

export default function HoverableCarImage({
  car,
  href,
  showPrice = true,
  showFavoriteButton = true,
  className = '',
  height = 'h-48'
}: HoverableCarImageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [cycleStarted, setCycleStarted] = useState(false);

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

  // Extract and prepare images array with proper ordering logic
  const displayImages = useMemo(() => {
    // First, check if we have an imageOrder array to prioritize
    if (car.imageOrder && Array.isArray(car.imageOrder) && car.imageOrder.length > 0) {
      console.log('Using imageOrder for hoverable display:', car.imageOrder);
      return car.imageOrder.map(img => processImagePath(img));
    }
    
    // If no imageOrder, fallback to the standard images array
    if (car.images && Array.isArray(car.images) && car.images.length > 0) {
      console.log('Using images array for hoverable display:', car.images);
      return car.images.map(img => processImagePath(img));
    }
    
    // Fall back to single image property if no images array
    if (car.image) {
      return [processImagePath(car.image)];
    }
    
    // Default fallback
    return ['/img/car-placeholder.jpg'];
  }, [car]);

  const imageAlt = `${car.brand || ''} ${car.model || ''}`.trim() || 'Car image';

  // Handle the cycling through images
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    // Only start cycling after we've manually changed to image 1
    if (isHovering && cycleStarted && displayImages.length > 1) {
      intervalId = setInterval(() => {
        setCurrentImageIndex(prevIndex => {
          // Once we've shown image 1 immediately on hover,
          // start cycling from index 0 through all images
          const nextIndex = prevIndex + 1;
          
          // If we reached the end, go back to index 0
          return nextIndex >= displayImages.length ? 0 : nextIndex;
        });
      }, 1000); // Change image every second
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isHovering, cycleStarted, displayImages.length]);

  // Handle mouse enter - show the second image and start cycling
  const handleMouseEnter = () => {
    setIsHovering(true);
    
    // Only change to the second image if we have multiple images
    if (displayImages.length > 1 && currentImageIndex === 0) {
      setCurrentImageIndex(1);
      setCycleStarted(true);
    }
  };

  // Handle mouse leave - reset to first image and stop cycling
  const handleMouseLeave = () => {
    setIsHovering(false);
    setCurrentImageIndex(0);
    setCycleStarted(false);
  };

  // Reset image index when component mounts or car changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setCycleStarted(false);
  }, [car._id]);

  // Handle image load error by replacing with placeholder
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log('Image failed to load, using placeholder');
    e.currentTarget.src = '/img/car-placeholder.jpg';
  };

  // Determine what content to render
  const content = (
    <div 
      className={`group relative overflow-hidden bg-gray-100 ${height} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Favorite heart button */}
      {showFavoriteButton && car._id && (
        <FavoriteHeartButton
          carId={car._id}
          className="top-2 right-2 z-20"
        />
      )}
      
      {/* Car image */}
      <Image
        src={displayImages[currentImageIndex]}
        alt={imageAlt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={`object-cover transform transition-transform duration-500 ${isHovering ? 'scale-105' : 'scale-100'}`}
        priority={currentImageIndex === 0} // Prioritize loading the first image
        onError={handleImageError}
      />
      
      {/* Price tag */}
      {showPrice && car.dailyRate !== undefined && (
        <div className="absolute top-2 left-2 bg-white bg-opacity-85 px-2 py-1 rounded text-sm font-medium text-gray-900 shadow-sm z-20">
          ${car.dailyRate.toFixed(2)}/day
        </div>
      )}
      
      {/* "Not Available" overlay
      {car.available === false && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
          <span className="text-white font-bold text-lg">Currently Rented</span>
        </div>
      )} */}
      
      {/* Side buttons removed as requested */}
      
      {/* Dark overlay with pagination dots */}
      {displayImages.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-12 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-end justify-center pb-2">
          <div className="flex space-x-1.5">
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex
                    ? 'bg-white scale-110'
                    : 'bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Car type badge */}
      {car.type && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-0.5 rounded text-xs font-medium text-white z-20">
          {car.type}
        </div>
      )}
    </div>
  );

  // If href is provided, wrap in a Link
  if (href) {
    return (
      <Link href={href} className="block rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        {content}
      </Link>
    );
  }

  // Otherwise, return the content directly
  return content;
}