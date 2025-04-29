import Banner from "../components/landing/Banner";
import Image from "next/image";
import Link from "next/link";
import BookingCTA from "@/components/landing/BookingCTA";
import FeaturedCarsCarousel from "@/components/landing/FeaturedCars"; // Import the new component

export default function Home() {
  return (
    <main>
      <Banner />
      <BookingCTA />
      {/* Features Section */}
      <section className="py-16 px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl mb-3">Elevating Your Journey</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Since 1978, we have provided discerning clients with exceptional
            automotive experiences that blend tradition with modern luxury.
          </p>
        </div>

        {/* Rest of the home page content remains the same */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white shadow-sm border border-gray-100 rounded">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-[#f8f5f0]">
              {/* Replace with real icon when available */}
              <div className="w-8 h-8 bg-[#8A7D55] rounded-full flex items-center justify-center">
                <span className="text-white text-xs">CAR</span>
              </div>
            </div>
            <h3 className="text-xl mb-2">Curated Collection</h3>
            <p className="text-gray-600">
              Hand-selected vehicles maintained to the highest standards of
              excellence.
            </p>
          </div>

          <div className="text-center p-6 bg-white shadow-sm border border-gray-100 rounded">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-[#f8f5f0]">
              {/* Replace with real icon when available */}
              <div className="w-8 h-8 bg-[#8A7D55] rounded-full flex items-center justify-center">
                <span className="text-white text-xs">SVC</span>
              </div>
            </div>
            <h3 className="text-xl mb-2">Personalized Service</h3>
            <p className="text-gray-600">
              Discreet, attentive assistance tailored to your specific
              requirements.
            </p>
          </div>

          <div className="text-center p-6 bg-white shadow-sm border border-gray-100 rounded">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-[#f8f5f0]">
              {/* Replace with real icon when available */}
              <div className="w-8 h-8 bg-[#8A7D55] rounded-full flex items-center justify-center">
                <span className="text-white text-xs">LOC</span>
              </div>
            </div>
            <h3 className="text-xl mb-2">Convenient Delivery</h3>
            <p className="text-gray-600">
              Your selected vehicle delivered to your desired location upon
              request.
            </p>
          </div>
        </div>
      </section>
      <FeaturedCarsCarousel />

      {/* Testimonial Section */}
      <section className="py-16 px-8 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl mb-3">Client Testimonials</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Experiences shared by our distinguished clientele.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 shadow-sm border border-gray-100 rounded">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
              <div>
                <h4 className="font-medium">Jonathan W.</h4>
                <p className="text-gray-500 text-sm">
                  CEO, Sterling Enterprises
                </p>
              </div>
            </div>
            <p className="text-gray-600 italic">
              "The attention to detail and personalized service exceeded my
              expectations. From selection to delivery, every aspect was handled
              with professionalism and discretion."
            </p>
          </div>

          <div className="bg-white p-8 shadow-sm border border-gray-100 rounded">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
              <div>
                <h4 className="font-medium">Elizabeth C.</h4>
                <p className="text-gray-500 text-sm">Art Director</p>
              </div>
            </div>
            <p className="text-gray-600 italic">
              "I needed a vehicle that reflected both sophistication and style
              for an important client event. The team understood exactly what I
              needed and delivered the perfect automobile."
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
