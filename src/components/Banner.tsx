'use client';

import styles from './banner.module.css';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import BannerSearch from './BannerSearch';

export default function Banner() {
    const router = useRouter();
    // Using default Next.js sample images until custom images are added
    const covers = [
        '/img/banner.jpg', 
        '/img/banner2.jpg', 
        '/img/banner3.jpg',
        '/img/banner4.jpg'
    ];
    const [index, setIndex] = useState(0);
    const [currentImage, setCurrentImage] = useState(covers[0]);
    const [nextImage, setNextImage] = useState(covers[0]);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const {data:session} = useSession();
    const [isPaused, setIsPaused] = useState(false);

    // Function to handle the image transition with fade effect
    const transitionToNextImage = useCallback((nextIndex: number) => {
        setNextImage(covers[nextIndex]);
        setIsTransitioning(true);
        
        // After the fade-in animation completes, update the current image
        setTimeout(() => {
            setCurrentImage(covers[nextIndex]);
            setIsTransitioning(false);
        }, 800); // This should match the CSS transition duration
    }, [covers]);

    // Function to advance to the next slide
    const nextSlide = useCallback(() => {
        const nextIndex = (index + 1) % covers.length;
        setIndex(nextIndex);
        transitionToNextImage(nextIndex);
    }, [index, covers.length, transitionToNextImage]);

    // Function to go to a specific slide
    const goToSlide = (slideIndex: number) => {
        if (slideIndex === index || isTransitioning) return;
        
        setIndex(slideIndex);
        transitionToNextImage(slideIndex);
        
        // Reset the timer when manually changing slides
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 5000); // Resume auto-cycling after 5 seconds
    };

    // Set up auto-cycling with useEffect
    useEffect(() => {
        let slideInterval: NodeJS.Timeout;
        
        if (!isPaused && !isTransitioning) {
            slideInterval = setInterval(() => {
                nextSlide();
            }, 5000); // Change slide every 5 seconds
        }
        
        // Clean up interval on component unmount or when isPaused changes
        return () => {
            clearInterval(slideInterval);
        };
    }, [isPaused, isTransitioning, nextSlide]);

    // Pause auto-cycling when user interacts with the banner
    const handleBannerHover = () => {
        setIsPaused(true);
    };

    const handleBannerLeave = () => {
        setIsPaused(false);
    };

    return (
        <div 
            className={styles.banner} 
            onMouseEnter={handleBannerHover}
            onMouseLeave={handleBannerLeave}
        >
            {/* Current image (fading out) */}
            <div className={styles.imageContainer}>
                <Image 
                    src={currentImage}
                    alt="luxury car"
                    fill={true}
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                    priority
                    quality={100}
                    sizes="100vw"
                    className={isTransitioning ? styles.fadeOut : ''}
                    onError={(e) => {
                      // Fallback if image fails to load
                      console.log('Image failed to load, using fallback');
                      const target = e.target as HTMLImageElement;
                      if (target) target.src = '/img/cover.jpg';
                    }}
                />
            </div>
            
            {/* Next image (fading in) */}
            {isTransitioning && (
                <div className={styles.imageContainer}>
                    <Image 
                        src={nextImage}
                        alt="luxury car"
                        fill={true}
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                        quality={100}
                        sizes="100vw"
                        className={styles.fadeIn}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target) target.src = '/img/cover.jpg';
                        }}
                    />
                </div>
            )}
            
            {/* Banner Search Bar */}
            <BannerSearch />
            
            <div className={`${styles.bannerText} bg-black bg-opacity-40 p-6 rounded-lg z-30`}>
                <h1 className='text-4xl font-medium text-white'>Timeless Elegance on Wheels</h1>
                <h3 className='text-xl font-serif text-white mt-2'>Distinguished Automobiles for Discerning Clients</h3>
            </div>
            
            {/* Pagination Indicators */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
                {covers.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goToSlide(i)}
                        aria-label={`Go to slide ${i+1}`}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            i === index ? 'bg-white scale-110' : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}