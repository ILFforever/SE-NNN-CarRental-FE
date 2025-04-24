//this is for style ref only CR. Hailun for the Idea -Hammy

"use client"

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

export default function AppleStyleHome() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Parallax effects for different sections
  const heroTextY = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const showcaseOpacity = useTransform(scrollYProgress, [0.1, 0.2, 0.3, 0.4], [0, 1, 1, 0]);
  const showcaseY = useTransform(scrollYProgress, [0.1, 0.2, 0.4], [100, 0, -100]);
  const experienceOpacity = useTransform(scrollYProgress, [0.3, 0.4, 0.6, 0.7], [0, 1, 1, 0]);
  const experienceY = useTransform(scrollYProgress, [0.3, 0.4, 0.6], [100, 0, -50]);
  const testimonialsOpacity = useTransform(scrollYProgress, [0.6, 0.7, 0.9], [0, 1, 1]);
  const testimonialsY = useTransform(scrollYProgress, [0.6, 0.7, 0.9], [100, 0, 0]);

  // Car carousel state
  const [activeCarIndex, setActiveCarIndex] = useState(0);
  const cars = [
    { 
      name: "Bentley Continental GT", 
      image: "/img/car-bentley.jpg", 
      tagline: "Refined Elegance", 
      description: "Experience unparalleled luxury with our flagship Bentley Continental GT" 
    },
    { 
      name: "Mercedes G-Wagon", 
      image: "/img/car-mercedes.jpg", 
      tagline: "Commanding Presence", 
      description: "Dominate every road with the iconic Mercedes-Benz G-Wagon" 
    },
    { 
      name: "Porsche Cayenne", 
      image: "/img/car-porsche.jpg", 
      tagline: "Athletic Precision", 
      description: "Performance and luxury perfectly balanced in the Porsche Cayenne" 
    }
  ];

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCarIndex((prevIndex) => (prevIndex + 1) % cars.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [cars.length]);

  return (
    <div className="overflow-x-hidden" ref={containerRef}>
      {/* Hero Section */}
      <motion.section 
        className="relative h-screen w-full flex items-center justify-center overflow-hidden"
        style={{ opacity: heroOpacity }}
      >
        <div className="absolute inset-0 w-full h-full">
          <Image 
            src="/img/car-bentley.jpg" 
            alt="Luxury Car" 
            fill 
            priority
            className="object-cover brightness-75"
          />
        </div>
        <motion.div 
          className="relative z-10 text-center max-w-4xl px-6"
          style={{ y: heroTextY }}
        >
          <h1 className="text-5xl md:text-7xl font-serif font-medium text-white mb-4">
            Timeless Luxury
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 mb-8">
            Experience automotive excellence with our curated collection
          </p>
          <Link 
            href="/catalog" 
            className="inline-flex items-center px-6 py-3 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors duration-300"
          >
            Explore Our Collection <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </motion.div>
      </motion.section>

      {/* Showcase Section */}
      <motion.section 
        className="py-24 px-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white"
        style={{ 
          opacity: showcaseOpacity,
          y: showcaseY
        }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-16">
            Exceptional Vehicles
          </h2>

          <div className="relative h-96 md:h-[500px] w-full rounded-2xl overflow-hidden mb-12">
            {cars.map((car, index) => (
              <motion.div 
                key={car.name}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: activeCarIndex === index ? 1 : 0,
                  scale: activeCarIndex === index ? 1 : 1.1
                }}
                transition={{ duration: 1, ease: "easeInOut" }}
              >
                <Image 
                  src={car.image} 
                  alt={car.name} 
                  fill 
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ 
                      y: activeCarIndex === index ? 0 : 50,
                      opacity: activeCarIndex === index ? 1 : 0
                    }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    <h3 className="text-3xl font-serif font-medium mb-2">{car.name}</h3>
                    <p className="text-xl font-light text-gray-200 mb-1">{car.tagline}</p>
                    <p className="text-base text-gray-300">{car.description}</p>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center space-x-3 mb-12">
            {cars.map((_, index) => (
              <button 
                key={index}
                className={`w-3 h-3 rounded-full ${activeCarIndex === index ? 'bg-white' : 'bg-gray-600'}`}
                onClick={() => setActiveCarIndex(index)}
              />
            ))}
          </div>

          <div className="text-center">
            <Link 
              href="/catalog" 
              className="inline-flex items-center text-white border border-white px-6 py-3 rounded-full hover:bg-white hover:text-gray-900 transition-colors duration-300"
            >
              View All Vehicles <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Experience Section */}
      <motion.section 
        className="py-24 px-6 bg-white"
        style={{ 
          opacity: experienceOpacity,
          y: experienceY
        }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif text-[#111] text-center mb-16">
            The CEDT Experience
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#f8f5f0] rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-10 h-10 bg-[#8A7D55] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">01</span>
                </div>
              </div>
              <h3 className="text-xl font-serif font-medium mb-4">Curated Selection</h3>
              <p className="text-gray-600">
                Every vehicle in our collection meets our exacting standards for performance, comfort, and style.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-[#f8f5f0] rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-10 h-10 bg-[#8A7D55] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">02</span>
                </div>
              </div>
              <h3 className="text-xl font-serif font-medium mb-4">White Glove Service</h3>
              <p className="text-gray-600">
                From reservation to return, our team ensures every detail of your experience is flawless.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-[#f8f5f0] rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-10 h-10 bg-[#8A7D55] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">03</span>
                </div>
              </div>
              <h3 className="text-xl font-serif font-medium mb-4">Flexible Options</h3>
              <p className="text-gray-600">
                Customizable rental periods and optional services tailored to your specific needs.
              </p>
            </div>
          </div>

          <div className="relative h-80 md:h-[400px] w-full rounded-2xl overflow-hidden">
            <Image 
              src="/img/luxury-experience.jpg" 
              alt="Luxury Experience" 
              fill 
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-6">
                <h3 className="text-3xl md:text-4xl font-serif font-medium mb-4">Elevate Your Journey</h3>
                <p className="text-xl max-w-2xl mx-auto">
                  More than transportation - an extension of your lifestyle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        className="py-24 px-6 bg-[#f8f5f0]"
        style={{ 
          opacity: testimonialsOpacity,
          y: testimonialsY
        }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif text-[#111] text-center mb-16">
            Client Experiences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 rounded-full bg-gray-200 mr-4"></div>
                <div>
                  <h4 className="font-medium text-lg">Jonathan W.</h4>
                  <p className="text-gray-500">CEO, Sterling Enterprises</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 italic">
                "The attention to detail and personalized service exceeded my expectations. From selection to delivery, every aspect was handled with professionalism and discretion."
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 rounded-full bg-gray-200 mr-4"></div>
                <div>
                  <h4 className="font-medium text-lg">Elizabeth C.</h4>
                  <p className="text-gray-500">Art Director</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 italic">
                "I needed a vehicle that reflected both sophistication and style for an important client event. The team understood exactly what I needed and delivered the perfect automobile."
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link 
              href="/reserve" 
              className="inline-flex items-center bg-[#8A7D55] text-white px-8 py-4 rounded-full hover:bg-[#766b48] transition-colors duration-300 text-lg font-medium"
            >
              Reserve Your Experience <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Final CTA */}
      <section className="py-32 px-6 bg-[#111] text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif font-medium mb-6">
            Extraordinary Journeys Await
          </h2>
          <p className="text-xl text-gray-300 mb-10 font-light">
            Discover the perfect vehicle for your next adventure from our exclusive collection.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              href="/catalog" 
              className="px-8 py-4 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors duration-300"
            >
              Explore Collection
            </Link>
            <Link 
              href="/reserve" 
              className="px-8 py-4 border border-white text-white rounded-full hover:bg-white hover:text-gray-900 transition-colors duration-300"
            >
              Make Reservation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}