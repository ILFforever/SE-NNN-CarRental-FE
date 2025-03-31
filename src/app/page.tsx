import Banner from "../components/Banner";
import Image from "next/image";
import Link from "next/link";
import BookingCTA from "@/components/BookingCTA";

export default function Home() {
  return (
    <main>
      <Banner/>
      <BookingCTA/>

      {/* Features Section */}
      <section className="py-16 px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl mb-3">Elevating Your Journey</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Since 1978, we have provided discerning clients with exceptional automotive experiences that blend tradition with modern luxury.
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
              Hand-selected vehicles maintained to the highest standards of excellence.
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
              Discreet, attentive assistance tailored to your specific requirements.
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
              Your selected vehicle delivered to your desired location upon request.
            </p>
          </div>
        </div>
      </section>
      
      {/* Featured Vehicles Section */}
      <section className="py-12 px-8 bg-[#f8f5f0]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl mb-3">Featured Vehicles</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Discover our selection of premium automobiles, each promising an exceptional driving experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* We'll add vehicle cards here once we have the data structure */}
            <div className="bg-white rounded overflow-hidden shadow-sm">
              <div className="h-48 relative">
                <Image 
                  src="/img/car-mercedes.jpg" 
                  alt="Mercedes" 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-xl mb-2">Mercedes-Benz G-Wagon</h3>
                <p className="text-gray-600 mb-4">Unparalleled luxury and comfort for executive travel.</p>
                <Link href="/vehicles" className="text-[#8A7D55] hover:underline">View Details</Link>
              </div>
            </div>
            
            <div className="bg-white rounded overflow-hidden shadow-sm">
              <div className="h-48 relative">
                <Image 
                  src="/img/car-bentley.jpg" 
                  alt="Bentley" 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-xl mb-2">Bentley Continental GT</h3>
                <p className="text-gray-600 mb-4">The perfect blend of performance and refined elegance.</p>
                <Link href="/catalog" className="text-[#8A7D55] hover:underline">View Details</Link>
              </div>
            </div>
            
            <div className="bg-white rounded overflow-hidden shadow-sm">
              <div className="h-48 relative">
                <Image 
                  src="/img/car-porsche.jpg" 
                  alt="Porsche" 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-xl mb-2">Porsche Cayenne</h3>
                <p className="text-gray-600 mb-4">Iconic design with exhilarating performance.</p>
                <Link href="/catalog" className="text-[#8A7D55] hover:underline">View Details</Link>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <Link 
              href="/catalog" 
              className="inline-block px-6 py-3 bg-white text-[#8A7D55] border border-[#8A7D55] hover:bg-[#8A7D55] hover:text-white transition-colors duration-300"
            >
              View All Vehicles
            </Link>
          </div>
        </div>
      </section>
      
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
                <p className="text-gray-500 text-sm">CEO, Sterling Enterprises</p>
              </div>
            </div>
            <p className="text-gray-600 italic">
              "The attention to detail and personalized service exceeded my expectations. From selection to delivery, every aspect was handled with professionalism and discretion."
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
              "I needed a vehicle that reflected both sophistication and style for an important client event. The team understood exactly what I needed and delivered the perfect automobile."
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}