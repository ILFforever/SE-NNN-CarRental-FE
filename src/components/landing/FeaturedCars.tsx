"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Users, Gauge } from "lucide-react";
import { API_BASE_URL } from "@/config/apiConfig";

// Define types for our car data
interface CarType {
  _id: string;
  brand: string;
  model: string;
  dailyRate: number;
  images?: string[];
  image?: string; // Fallback for single image
  seats?: number;
  type?: string;
  tier?: number;
  year?: number;
  imageOrder?: string[]; // Add imageOrder property
}

// Define car sources
const carSources = {
  POPULAR: "popular",
  NEW: "new",
};

export default function FeaturedCarsCarousel() {
  const [activeCarSource, setActiveCarSource] = useState(carSources.POPULAR);
  const [cars, setCars] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPausedRef = useRef(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Process an individual image path
  const processImagePath = (img: string) => {
    // Check if the image is already a full URL
    if (img?.startsWith("http")) {
      return img;
    }
    // Check if it's a relative path that should be used as-is
    if (img?.startsWith("/") || img?.includes("/")) {
      return img;
    }
    // Otherwise, assume it's a filename in the R2 bucket
    return `https://blob.ngixx.me/images/${img}`;
  };

  // Fetch cars based on the active source
  const fetchCars = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const endpoint =
        activeCarSource === carSources.POPULAR
          ? "/cars/popular"
          : "/cars?limit=10";

      const response = await fetch(API_BASE_URL + endpoint);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${activeCarSource} cars`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setCars(data.data);
      } else {
        setCars([]);
      }
    } catch (err) {
      console.error(`Error fetching ${activeCarSource} cars:`, err);
      setError(
        `Unable to load ${activeCarSource} cars. Please try again later.`
      );
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, [activeCarSource]);

  // Fallback data for development/testing
  const fallbackCars: CarType[] = [
    {
      _id: "1",
      brand: "Mercedes-Benz",
      model: "G-Wagon",
      dailyRate: 350,
      images: ["/img/car-mercedes.jpg"],
      seats: 5,
      type: "SUV",
      tier: 3,
      year: 2023,
    },
    {
      _id: "2",
      brand: "Bentley",
      model: "Continental GT",
      dailyRate: 450,
      images: ["/img/car-bentley.jpg"],
      seats: 4,
      type: "Coupe",
      tier: 4,
      year: 2022,
    },
    {
      _id: "3",
      brand: "Porsche",
      model: "Cayenne",
      dailyRate: 300,
      images: ["/img/car-porsche.jpg"],
      seats: 5,
      type: "SUV",
      tier: 3,
      year: 2023,
    },
  ];
  // If no cars from API, use fallback data
  const displayCars = cars.length > 0 ? cars : fallbackCars;

  // Fetch cars when component mounts or when source changes
  useEffect(() => {
    // Create a continuous scrolling animation
    let animationFrameId: number;
    let lastTimestamp: number | null = null;
    const scrollSpeed = 0.15; // pixels per millisecond - reduced for slower scrolling

    const animate = (timestamp: number) => {
      if (!isPausedRef.current && displayCars.length > 0) {
        if (lastTimestamp) {
          const deltaTime = timestamp - lastTimestamp;
          setScrollPosition((prevPos) => {
            let newPos = prevPos + scrollSpeed * deltaTime;
            // Get the width of a single card (approximately)
            const cardWidth =
              document.querySelector(".car-card")?.clientWidth || 350;
            const totalWidth = cardWidth * displayCars.length;

            // Loop back to start when reaching the end
            if (newPos >= cardWidth * displayCars.length) {
              newPos = 0;
            }

            return newPos;
          });
        }
        lastTimestamp = timestamp;
      } else {
        lastTimestamp = null; // Reset timestamp when paused
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [displayCars.length]);

  // Number of visible cards depends on screen size - determined via CSS
  const visibleCars = 3;

  // Handle next button click
  const handleNext = () => {
    isPausedRef.current = true; // Pause auto-scroll temporarily
    setCurrentIndex((prevIndex) =>
      prevIndex + 1 >= displayCars.length ? 0 : prevIndex + 1
    );
    // Resume auto-scroll after 5 seconds of inactivity
    setTimeout(() => {
      isPausedRef.current = false;
    }, 5000);
  };

  useEffect(() => {
    fetchCars();
    // Reset scroll position when changing source
    setScrollPosition(0);
  }, [activeCarSource, fetchCars]);

  // Handle previous button click
  const handlePrev = () => {
    isPausedRef.current = true; // Pause auto-scroll temporarily
    setCurrentIndex((prevIndex) =>
      prevIndex <= 0 ? displayCars.length - 1 : prevIndex - 1
    );
    // Resume auto-scroll after 5 seconds of inactivity
    setTimeout(() => {
      isPausedRef.current = false;
    }, 5000);
  };

// Touch event handlers
const handleTouchStart = (e: React.TouchEvent) => {
    isPausedRef.current = true; // Pause auto-scroll during touch
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
  
    const distance = touchStart - touchEnd;
    const absDistance = Math.abs(distance);
  
    if (absDistance > 50) {  // Reduced threshold for more sensitive swipes
      if (distance > 0) {
        // Swiped left
        handleNext();
      } else {
        // Swiped right
        handlePrev();
      }
    }
  
    // Gradual resume of auto-scroll
    let resumeProgress = 0;
    const resumeInterval = setInterval(() => {
      resumeProgress += 0.2;
      if (resumeProgress >= 1) {
        isPausedRef.current = false;
        clearInterval(resumeInterval);
      }
    }, 100);
  
    setTouchStart(null);
    setTouchEnd(null);
  };
  
  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isPausedRef.current = true; // Pause auto-scroll
    setTouchStart(e.clientX); // Using same state as touch
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (touchStart !== null) {
      setTouchEnd(e.clientX);
    }
  };
  
  const handleMouseUp = () => {
    if (touchStart === null || touchEnd === null) return;
  
    const distance = touchStart - touchEnd;
    const absDistance = Math.abs(distance);
  
    if (absDistance > 50) {  // Reduced threshold for more sensitive dragging
      if (distance > 0) {
        // Dragged left
        handleNext();
      } else {
        // Dragged right
        handlePrev();
      }
    }
  
    // Gradual resume of auto-scroll
    let resumeProgress = 0;
    const resumeInterval = setInterval(() => {
      resumeProgress += 0.2;
      if (resumeProgress >= 1) {
        isPausedRef.current = false;
        clearInterval(resumeInterval);
      }
    }, 100);
  
    // Reset states
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Get tier stars based on tier level
  const getTierStars = (tier: number = 0) => {
    return Array(tier)
      .fill(0)
      .map((_, index) => (
        <Star
          key={index}
          size={14}
          className="fill-yellow-400 text-yellow-400"
        />
      ));
  };

  const getCarImageUrl = (car: CarType) => {
    try {
      // If car has imageOrder array with filenames, use the first one
      if (car.imageOrder && car.imageOrder.length > 0) {
        // imageOrder contains the image filename directly
        const imageFilename = car.imageOrder[0];
        if (imageFilename) {
          return processImagePath(imageFilename);
        }
      }

      // If car has images array, use the first image
      if (car.images && car.images.length > 0) {
        return processImagePath(car.images[0]);
      }

      // If car has a single image property, use that
      if (car.image) {
        return processImagePath(car.image);
      }

      // Default fallback image
      return "/img/banner.jpg";
    } catch (error) {
      console.error("Error getting car image URL:", error);
      return "/img/banner.jpg";
    }
  };

  return (
    <section className="py-12 px-4 md:px-8 bg-[#f8f5f0]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 md:mb-10">
          <h2 className="text-2xl md:text-3xl mb-3 font-serif">
            Featured Vehicles
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-sm md:text-base">
            Discover our selection of premium automobiles, each promising an
            exceptional driving experience.
          </p>
        </div>

        {/* Source Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full p-1 shadow-md flex relative w-[300px] md:w-[360px]">
            {/* Sliding background */}
            <div
              className="absolute top-1 left-1 h-[calc(100%-0.5rem)] w-1/2 rounded-full bg-[#8A7D55] transition-transform duration-300 ease-in-out"
              style={{
                transform:
                  activeCarSource === carSources.POPULAR
                    ? "translateX(0%)"
                    : "translateX(95%)",
              }}
            ></div>

            <button
              onClick={() => {
                setActiveCarSource(carSources.POPULAR);
                setScrollPosition(0);
              }}
              className={`w-1/2 px-4 py-2 rounded-full text-sm md:text-base transition-all duration-300 z-10 relative ${
                activeCarSource === carSources.POPULAR
                  ? "text-white font-medium"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Popular Cars
            </button>
            <button
              onClick={() => {
                setActiveCarSource(carSources.NEW);
                setScrollPosition(0);
              }}
              className={`w-1/2 px-4 py-2 rounded-full text-sm md:text-base transition-all duration-300 z-10 relative ${
                activeCarSource === carSources.NEW
                  ? "text-white font-medium"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              New Arrivals
            </button>
          </div>
        </div>

        {/* Cars Carousel */}
        <div
          className="relative"
          onMouseEnter={() => {
            isPausedRef.current = true;
          }}
          onMouseLeave={() => {
            isPausedRef.current = false;
          }}
        >
          {/* Navigation Buttons */}
          {/* <div className="absolute top-1/2 -left-4 transform -translate-y-1/2 z-10 hidden md:block">
            <button
              onClick={handlePrev}
              className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all text-gray-800 hover:bg-gray-50"
              aria-label="Previous cars"
            >
              <ChevronLeft size={24} />
            </button>
          </div>

          <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 z-10 hidden md:block">
            <button
              onClick={handleNext}
              className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all text-gray-800 hover:bg-gray-50"
              aria-label="Next cars"
            >
              <ChevronRight size={24} />
            </button>
          </div> */}

          {/* Loading and Error States */}
          {loading && (
            <div className="flex justify-center items-center min-h-[420px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55]"></div>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-12 text-red-600">
              <p>{error}</p>
              <button
                onClick={fetchCars}
                className="mt-4 px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Car Cards Container */}
          {!loading && !error && (
            <div
              className="overflow-hidden relative mx-[-4vw] sm:mx-[-6vw] md:mx-[-8vw] lg:mx-[-10vw] xl:mx-[-12vw]"
              style={{ width: "calc(100% + 24vw)" }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseEnter={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseUp}
            >
              <div
                className="flex px-[4vw] sm:px-[6vw] md:px-[8vw] lg:px-[10vw] xl:px-[12vw]"
                style={{
                  transform: `translateX(-${scrollPosition}px)`,
                  transition: isPausedRef.current
                    ? "none"
                    : "transform 300ms linear",
                }}
                onMouseEnter={() => {
                  isPausedRef.current = true;
                }}
                onMouseLeave={() => {
                  isPausedRef.current = false;
                }}
              >
                {/* Display the cars twice to create the illusion of infinite scrolling */}
                {[...displayCars, ...displayCars].map((car, index) => (
                  <div
                    key={`${car._id}-${index}`}
                    className="car-card flex-shrink-0"
                    style={{ width: "350px", margin: "0 10px" }}
                  >
                    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={getCarImageUrl(car)}
                          alt={`${car.brand} ${car.model}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500"
                          priority
                          onError={(e) => {
                            // Fallback for image loading errors
                            const target = e.target as HTMLImageElement;
                            target.src = "/img/banner.jpg";
                          }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
                          <div className="flex items-center space-x-1">
                            {getTierStars(car.tier)}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 flex-grow">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            {car.brand} {car.model}
                          </h3>
                          <span className="text-[#8A7D55] font-bold text-lg">
                            ${car.dailyRate}/day
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
                            <Users size={16} className="mr-1 text-gray-500" />
                            <span>{car.seats || 5} seats</span>
                          </div>

                          {car.year && (
                            <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
                              <span className="font-medium">{car.year}</span>
                            </div>
                          )}

                          <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
                            <Gauge size={16} className="mr-1 text-gray-500" />
                            <span>{car.type || "Luxury"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 pb-4 mt-auto">
                        <Link
                          href={`/reserve/?carId=${car._id}&pickupTime=10%3A00+AM&returnTime=10%3A00+AM`}
                          className="block w-full text-center py-2 px-4 bg-[#8A7D55] hover:bg-[#766b48] text-white rounded transition-colors duration-200 font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mobile Navigation Dots
          <div className="flex justify-center mt-6 md:hidden">
            {Array.from({
              length: Math.ceil(displayCars.length / visibleCars),
            }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index * visibleCars);
                  isPausedRef.current = true;
                  setTimeout(() => {
                    isPausedRef.current = false;
                  }, 5000);
                }}
                className={`w-2 h-2 mx-1 rounded-full transition-all ${
                  Math.floor(currentIndex / visibleCars) === index
                    ? "bg-[#8A7D55] w-4"
                    : "bg-gray-300"
                }`}
                aria-label={`Go to carousel page ${index + 1}`}
              />
            ))}
          </div> */}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Link
            href="/catalog"
            className="inline-block px-6 py-3 bg-white text-[#8A7D55] border border-[#8A7D55] rounded-md hover:bg-[#8A7D55] hover:text-white transition-colors duration-300"
          >
            View All Vehicles
          </Link>
        </div>
      </div>
    </section>
  );
}
