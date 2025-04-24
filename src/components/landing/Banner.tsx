'use client';

import styles from './banner.module.css';
import Image from 'next/image';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, useScroll, useTransform } from 'framer-motion';

import BannerSearch from '@/components/landing/BannerSearch'

export default function Banner() {
    const router = useRouter();
    const bannerRef = useRef(null);
    
    // Banner slides with taglines for each image
    const bannerSlides = [
        {
            image: '/img/banner.jpg',
            title: "Timeless Elegance on Wheels",
            subtitle: "Distinguished Automobiles for Discerning Clients"
        },
        {
            image: '/img/banner2.jpg',
            title: "Experience Extraordinary",
            subtitle: "Performance and Luxury Without Compromise"
        },
        {
            image: '/img/banner3.jpg',
            title: "Drive Beyond Expectations",
            subtitle: "Where Innovation Meets Sophistication"
        },
        {
            image: '/img/banner4.jpg',
            title: "The Art of Automotive Excellence",
            subtitle: "Craftsmanship That Commands Attention"
        },
        {
            image: '/img/banner5.jpg', // Add your 5th image path here
            title: "Redefine Your Journey",
            subtitle: "Luxury That Exceeds All Expectations"
        }
    ];
    
    const covers = bannerSlides.map(slide => slide.image);
    
    const [index, setIndex] = useState(0);
    const [currentImage, setCurrentImage] = useState(covers[0]);
    const [nextImage, setNextImage] = useState(covers[0]);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const {data:session} = useSession();
    const [isPaused, setIsPaused] = useState(false);
    
    // Track scroll position for parallax effects
    const { scrollYProgress } = useScroll({
        target: bannerRef,
        offset: ["start start", "end start"]
    });
    
    // Transform values for parallax effects
    const textY = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const imageY = useTransform(scrollYProgress, [0, 1], [0, 150]); // Image moves slower than text
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

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

    // Current slide content
    const currentSlide = bannerSlides[index];

    return (
        <div 
            ref={bannerRef}
            className={styles.banner} 
            onMouseEnter={handleBannerHover}
            onMouseLeave={handleBannerLeave}
        >
            {/* Current image (fading out) */}
            <motion.div 
                className={styles.imageContainer}
                style={{ 
                    y: imageY,
                    opacity: isTransitioning ? 0 : 1,
                }}
            >
                <Image 
                    src={currentImage}
                    alt="luxury car"
                    fill={true}
                    style={{ 
                        objectFit: 'cover', 
                        objectPosition: 'center',
                    }}
                    priority
                    quality={90}
                    sizes="100vw"
                    className={isTransitioning ? styles.fadeOut : ''}
                    onError={(e) => {
                        // Fallback if image fails to load
                        console.log('Image failed to load, using fallback');
                        const target = e.target as HTMLImageElement;
                        if (target) target.src = '/img/cover.jpg';
                    }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-30" />
            </motion.div>
            
            {/* Next image (fading in) */}
            {isTransitioning && (
                <motion.div 
                    className={styles.imageContainer}
                    style={{ 
                        y: imageY,
                    }}
                >
                    <Image 
                        src={nextImage}
                        alt="luxury car"
                        fill={true}
                        style={{ 
                            objectFit: 'cover', 
                            objectPosition: 'center',
                        }}
                        quality={90}
                        sizes="100vw"
                        className={styles.fadeIn}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target) target.src = '/img/cover.jpg';
                        }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30" />
                </motion.div>
            )}
            
            {/* Search bar - positioned higher up */}
            <BannerSearch />
            
            {/* Banner text - using motion for Apple-like parallax */}
            <motion.div 
                className={`${styles.bannerText} bg-black bg-opacity-40 p-6 rounded-lg z-20 flex flex-col items-center text-center`}
                style={{ y: textY, opacity }}
            >
                {bannerSlides.map((slide, i) => (
                    <div key={i} className={`${i === index ? 'block' : 'hidden'} w-full`}>
                        <motion.h1 
                            className='text-4xl md:text-6xl font-medium text-white tracking-tight mb-2'
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ 
                                opacity: i === index ? 1 : 0,
                                y: i === index ? 0 : 50
                            }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            key={`title-${i}-${index}`} // Using index in key to force re-render
                        >
                            {slide.title}
                        </motion.h1>
                        <motion.h3 
                            className='text-xl font-serif text-white mb-6'
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ 
                                opacity: i === index ? 1 : 0,
                                y: i === index ? 0 : 50
                            }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            key={`subtitle-${i}-${index}`} // Using index in key to force re-render
                        >
                            {slide.subtitle}
                        </motion.h3>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ 
                                opacity: 1, 
                                y: 0 
                            }}
                            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                            className="flex justify-center"
                            key={`button-${index}`} // Re-render button with new index
                        >
                            <button 
                                onClick={() => router.push('/catalog')}
                                className="px-6 py-3 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors shadow-lg flex items-center"
                            >
                                View Our Collection
                                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </motion.div>
                    </div>
                ))}
            </motion.div>
            
            {/* Pagination Indicators - Apple-style dots */}
            <div className={styles.paginationContainer}>
                {covers.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goToSlide(i)}
                        aria-label={`Go to slide ${i+1}`}
                        className={`${styles.paginationDot} ${i === index ? styles.activeDot : ''}`}
                    />
                ))}
            </div>
        </div>
    );
}