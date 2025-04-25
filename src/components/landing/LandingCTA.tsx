'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ModernBookingCTA() {
  const router = useRouter();
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Parallax scrolling effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [100, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9], [0, 1, 1]);
  
  // Images for the 3D perspective effect
  const carImages = [
    '/img/car-bentley.jpg',
    '/img/car-mercedes.jpg',
    '/img/car-porsche.jpg',
  ];
  
  return (
    <motion.section 
      ref={containerRef}
      style={{ opacity, y }}
      className="relative py-20 md:py-32 overflow-hidden"
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#111] to-[#333] opacity-90 z-0"></div>
      
      {/* Floating car images in background */}
      <div className="absolute inset-0 overflow-hidden">
        {carImages.map((src, index) => (
          <motion.div
            key={index}
            className="absolute rounded-xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 0.3,
              x: `${-25 + index * 25}%`,
              y: `${50 - index * 20}%`,
              rotate: index % 2 === 0 ? -6 : 6,
              scale: 0.8 + index * 0.1
            }}
            transition={{ 
              duration: 0.8, 
              delay: index * 0.2,
              ease: "easeOut"
            }}
            style={{
              width: '300px',
              height: '200px',
              backgroundImage: `url(${src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(1px)',
              zIndex: 0
            }}
          />
        ))}
      </div>
      
      {/* Content container */}
      <div className="relative max-w-5xl mx-auto px-6 z-10">
        <motion.div 
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Main heading with subtle gradient */}
          <h2 className="text-4xl md:text-6xl font-serif font-medium mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Experience Luxury on Your Terms
          </h2>
          
          {/* Subheading */}
          <p className="text-base md:text-xl text-gray-300 max-w-2xl mb-10">
            Choose from our meticulously curated selection of premium automobiles, 
            each promising an exceptional journey tailored to your desires.
          </p>
          
          {/* CTA Button with hover effect */}
          <motion.button 
            className="group relative overflow-hidden rounded-full bg-white text-black px-8 py-4 text-lg font-medium transition-all duration-300"
            whileHover={{ 
              scale: 1.03,
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={() => router.push('/catalog')}
          >
            {/* Button glow effect */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#8A7D55] via-[#a59572] to-[#8A7D55] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></span>
            
            {/* Button sliding gradient background */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#8A7D55] via-[#a59572] to-[#8A7D55] opacity-0 group-hover:opacity-90 transition-opacity duration-300"></span>
            
            {/* Button moving sheen effect */}
            <motion.span 
              className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
              animate={isHovered ? 
                { left: ["100%", "-100%"], opacity: [0, 0.2, 0] } : 
                { left: "100%" }
              }
              transition={isHovered ? 
                { duration: 1.5, repeat: Infinity, repeatType: "loop" } : 
                {}
              }
            />
            
            {/* Button text that changes color on hover */}
            <span className="relative z-10 font-medium tracking-wide group-hover:text-white transition-colors duration-300">
              Book a Car Now
            </span>
            
            {/* Animated arrow */}
            <motion.span
              className="relative z-10 inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1"
              animate={isHovered ? { x: [0, 5, 0] } : {}}
              transition={isHovered ? 
                { duration: 1, repeat: Infinity, repeatType: "reverse" } : 
                {}
              }
            >
              →
            </motion.span>
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  );
}