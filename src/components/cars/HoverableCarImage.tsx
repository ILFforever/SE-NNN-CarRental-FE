import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Maximize2, ZoomIn } from 'lucide-react';

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
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImageIndex, setGalleryImageIndex] = useState(0);
  const imageRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

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
    if (isHovering && cycleStarted && images.length > 1 && !galleryOpen) {
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
  }, [isHovering, cycleStarted, images.length, galleryOpen]);

  // Set the gallery to show the current thumbnail image when opened
  useEffect(() => {
    if (galleryOpen) {
      setGalleryImageIndex(currentImageIndex);
    }
  }, [galleryOpen, currentImageIndex]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (galleryRef.current && !galleryRef.current.contains(event.target as Node)) {
        setGalleryOpen(false);
      }
    };

    if (galleryOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [galleryOpen]);

  // Handle key presses for gallery navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!galleryOpen) return;
      
      switch (e.key) {
        case 'Escape':
          setGalleryOpen(false);
          break;
        case 'ArrowLeft':
          navigateGallery(-1);
          break;
        case 'ArrowRight':
          navigateGallery(1);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryOpen]);

  // Navigation functions for gallery
  const navigateGallery = (direction: number) => {
    setGalleryImageIndex(prevIndex => {
      const newIndex = prevIndex + direction;
      if (newIndex < 0) return images.length - 1;
      if (newIndex >= images.length) return 0;
      return newIndex;
    });
  };

  // Memoized mouse enter/leave handlers
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  // Open gallery when image is clicked
  const handleImageClick = () => {
    setGalleryOpen(true);
  };

  // Close gallery
  const handleCloseGallery = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGalleryOpen(false);
  };

  return (
    <>
      <div 
        className={`relative h-48 cursor-pointer ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleImageClick}
        ref={imageRef}
      >
        <Image
          src={images[currentImageIndex]}
          alt={`${car.brand} ${car.model}`}
          fill
          className="object-cover transition-opacity duration-300"
          style={{objectFit: "cover"}}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        
        {/* Image counter indicator (only show if multiple images) */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
        
        {/* Expand indicator overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
          <Maximize2 className="text-white opacity-0 hover:opacity-100 transform scale-75 hover:scale-100 transition-all duration-300" size={30} />
        </div>
      </div>

      {/* Floating Gallery Modal */}
      {galleryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Semi-transparent backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={(e) => handleCloseGallery(e)}></div>
          
          {/* Gallery modal */}
          <div 
            ref={galleryRef}
            className="bg-white rounded-lg shadow-2xl overflow-hidden z-10 max-w-4xl w-full max-h-[85vh] animate-fadeIn"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gallery header */}
            <div className="relative bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">{car.brand} {car.model}</h3>
              <button 
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={handleCloseGallery}
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Main image display */}
            <div className="relative bg-gray-50 flex items-center justify-center" style={{ height: '50vh' }}>
              <Image
                src={images[galleryImageIndex]}
                alt={`${car.brand} ${car.model} - image ${galleryImageIndex + 1}`}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
                quality={90}
              />
              
              {/* Image counter */}
              <div className="absolute bottom-4 right-4 bg-white bg-opacity-75 text-gray-800 text-sm px-3 py-1 rounded-full shadow-md">
                {galleryImageIndex + 1} / {images.length}
              </div>
              
              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button 
                    className="absolute left-4 bg-white bg-opacity-75 hover:bg-opacity-100 text-gray-800 p-2 rounded-full shadow-md transition-all duration-200 transform hover:scale-105"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateGallery(-1);
                    }}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    className="absolute right-4 bg-white bg-opacity-75 hover:bg-opacity-100 text-gray-800 p-2 rounded-full shadow-md transition-all duration-200 transform hover:scale-105"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateGallery(1);
                    }}
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="px-6 py-4 bg-white border-t border-gray-200">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      className={`w-16 h-16 flex-shrink-0 rounded-md overflow-hidden transition-all duration-200 hover:opacity-100 
                        ${galleryImageIndex === index ? 
                          'ring-2 ring-[#8A7D55] ring-offset-2' : 
                          'opacity-60 hover:ring-1 hover:ring-gray-300 hover:ring-offset-1'}`}
                      onClick={() => setGalleryImageIndex(index)}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={img}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        /* Custom scrollbar styles */
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
        }
        
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }
        
        .scrollbar-track-gray-100::-webkit-scrollbar-track {
          background-color: #f3f4f6;
        }
      `}</style>
    </>
  );
};

export default HoverableCarImage;