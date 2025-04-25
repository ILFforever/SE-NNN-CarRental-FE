'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './cta-button.module.css';

export default function BookingCTA() {
  const router = useRouter();
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Parallax scrolling effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [50, -25]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9], [0.8, 1, 1]);
  
  return (
    <motion.section 
      ref={containerRef}
      style={{ opacity, y }}
      className="relative py-16 md:py-24 overflow-hidden mx-auto w-full max-w-7xl px-4 sm:px-6"
    >
      {/* Container with background and custom pattern */}
      <div className={styles.ctaContainer}>
        <div className={styles.ctaContent}>
          {/* Main heading - text size is responsive and will stay in frame */}
          <h2 className={`${styles.ctaHeading} text-2xl sm:text-3xl md:text-4xl lg:text-5xl`}>
            Experience Luxury on Your Terms
          </h2>
          
          {/* Subheading - text is contained and has max-width to prevent overflow */}
          <p className={`${styles.ctaText} text-sm sm:text-base md:text-lg max-w-3xl mx-auto`}>
            Choose from our curated selection of premium automobiles for your next journey
          </p>
          
          {/* CTA Button with hover effect */}
          <button 
            className={`${styles.ctaButton} group relative`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => router.push('/catalog')}
          >
            {/* Button text */}
            <span className="relative z-10 flex items-center">
              Book a Car Now
              
              {/* Animated arrow */}
              <motion.span
                className="inline-block ml-2"
                animate={isHovered ? { x: [0, 5, 0] } : {}}
                transition={isHovered ? 
                  { duration: 1, repeat: Infinity, repeatType: "reverse" } : 
                  {}
                }
              >
                →
              </motion.span>
            </span>
          </button>
        </div>
      </div>
    </motion.section>
  );
}