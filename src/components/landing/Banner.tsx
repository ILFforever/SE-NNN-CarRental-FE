'use client';

import styles from './banner.module.css';
import Image from 'next/image';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

import BannerSearch from '@/components/landing/BannerSearch';

export default function Banner() {
    const router = useRouter();
    const bannerRef = useRef(null);
    const { data: session } = useSession();

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
            image: '/img/banner4cropped.jpg',
            title: "The Art of Automotive Excellence",
            subtitle: "Craftsmanship That Commands Attention"
        },
        {
            image: '/img/banner5.jpg',
            title: "Redefine Your Journey",
            subtitle: "Luxury That Exceeds All Expectations"
        }
    ];

    const covers = bannerSlides.map(slide => slide.image);
    const [index, setIndex] = useState(0);
    const [previousIndex, setPreviousIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const { scrollYProgress } = useScroll({
        target: bannerRef,
        offset: ["start start", "end start"]
    });

    const textY = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const imageY = useTransform(scrollYProgress, [0, 1], [0, 150]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    // Preload images for smoother transitions
    useEffect(() => {
        covers.forEach(src => {
            const img = new window.Image();
            img.src = src;
        });
    }, [covers]);

    const nextSlide = useCallback(() => {
        if (isTransitioning) return;
        
        setPreviousIndex(index);
        const nextIndex = (index + 1) % covers.length;
        setIndex(nextIndex);
        setIsTransitioning(true);
        
        setTimeout(() => {
            setIsTransitioning(false);
        }, 1500); // Longer transition time for the morphing effect
    }, [index, covers.length, isTransitioning]);

    const goToSlide = (slideIndex: number) => {
        if (slideIndex === index || isTransitioning) return;
        
        setPreviousIndex(index);
        setIndex(slideIndex);
        setIsTransitioning(true);
        
        setTimeout(() => {
            setIsTransitioning(false);
        }, 1500);
        
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 5000);
    };

    useEffect(() => {
        let slideInterval: NodeJS.Timeout;

        if (!isPaused && !isTransitioning) {
            slideInterval = setInterval(() => {
                nextSlide();
            }, 5000);
        }

        return () => clearInterval(slideInterval);
    }, [isPaused, isTransitioning, nextSlide]);

    const handleBannerHover = () => setIsPaused(true);
    const handleBannerLeave = () => setIsPaused(false);

    const currentSlide = bannerSlides[index];
    const previousSlide = bannerSlides[previousIndex];

    // Define transition variants for morphing effect
    const imageVariants = {
        enter: { 
            opacity: 0,
            scale: 1.05,
            filter: "blur(8px)"
        },
        center: { 
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            transition: {
                opacity: { duration: 1 },
                scale: { duration: 1.2, ease: [0.165, 0.84, 0.44, 1] },
                filter: { duration: 0.8 }
            }
        },
        exit: { 
            opacity: 0,
            scale: 0.95,
            filter: "blur(8px)",
            transition: {
                duration: 0.5
            }
        }
    };

    // Subtle zoom effect for the active image
    const activeImageZoom = {
        initial: { scale: 1 },
        animate: { 
            scale: 1.05,
            transition: { 
                duration: 10,
                ease: "linear"
            }
        }
    };

    return (
        <div
            ref={bannerRef}
            className={styles.banner}
            onMouseEnter={handleBannerHover}
            onMouseLeave={handleBannerLeave}
        >
            {/* Current image with morphing transition */}
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={index}
                    className={styles.imageContainer}
                    variants={imageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    style={{ y: imageY }}
                >
                    <motion.div 
                        className="w-full h-full"
                        variants={activeImageZoom}
                        initial="initial"
                        animate="animate"
                    >
                        <Image
                            src={covers[index]}
                            alt={`luxury car ${index + 1}`}
                            fill
                            quality={90}
                            sizes="100vw"
                            style={{
                                objectFit: 'cover',
                                objectPosition: 'center',
                            }}
                            priority
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (target) target.src = '/img/cover.jpg';
                            }}
                        />
                    </motion.div>
                    <div className="absolute inset-0 bg-black bg-opacity-30" />
                </motion.div>
            </AnimatePresence>

            <BannerSearch />

            <motion.div
                className={`${styles.bannerText} bg-black bg-opacity-40 p-6 rounded-lg z-20 flex flex-col items-center text-center`}
                style={{ y: textY, opacity }}
            >
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ 
                            duration: 0.8, 
                            ease: [0.19, 1, 0.22, 1] // Expo-like easing for smooth text transitions
                        }}
                        className="w-full"
                    >
                        <h1 className='text-4xl md:text-6xl font-medium text-white tracking-tight mb-2'>
                            {currentSlide.title}
                        </h1>
                        <h3 className='text-xl font-serif text-white mb-6'>
                            {currentSlide.subtitle}
                        </h3>
                        <div className="flex justify-center">
                            <button
                                onClick={() => router.push('/catalog')}
                                className="px-6 py-3 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors shadow-lg flex items-center"
                            >
                                View Our Collection
                                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            <div className={styles.paginationContainer}>
                {covers.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goToSlide(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className={`${styles.paginationDot} ${i === index ? styles.activeDot : ''}`}
                    />
                ))}
            </div>
        </div>
    );
}