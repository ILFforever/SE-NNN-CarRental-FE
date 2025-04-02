import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | CEDT Rentals',
  description: 'Experience timeless elegance and exceptional service with CEDT Rentals',
};

export default function About() {
  return (
    <main className="py-16 px-4 max-w-6xl mx-auto">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-medium mb-4 font-serif">CEDT Rentals: Elevating Your Journey</h1>
        <p className="text-gray-600 max-w-3xl mx-auto text-lg">
          Since 1978, we have curated exceptional automotive experiences that seamlessly blend tradition with modern luxury.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="text-center p-6 bg-white shadow-sm border border-gray-100 rounded">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-[#f8f5f0]">
            <div className="w-8 h-8 bg-[#8A7D55] rounded-full flex items-center justify-center">
              <span className="text-white text-xs">CAR</span>
            </div>
          </div>
          <h3 className="text-xl mb-2 font-serif">Curated Collection</h3>
          <p className="text-gray-600">
            Our meticulously selected vehicles are maintained to the highest standards of excellence, ensuring an unparalleled driving experience.
          </p>
        </div>
        
        <div className="text-center p-6 bg-white shadow-sm border border-gray-100 rounded">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-[#f8f5f0]">
            <div className="w-8 h-8 bg-[#8A7D55] rounded-full flex items-center justify-center">
              <span className="text-white text-xs">SVC</span>
            </div>
          </div>
          <h3 className="text-xl mb-2 font-serif">Personalized Service</h3>
          <p className="text-gray-600">
            Our commitment goes beyond vehicles. We provide discreet, attentive assistance tailored precisely to your specific requirements.
          </p>
        </div>
        
        <div className="text-center p-6 bg-white shadow-sm border border-gray-100 rounded">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-[#f8f5f0]">
            <div className="w-8 h-8 bg-[#8A7D55] rounded-full flex items-center justify-center">
              <span className="text-white text-xs">LOC</span>
            </div>
          </div>
          <h3 className="text-xl mb-2 font-serif">Convenient Delivery</h3>
          <p className="text-gray-600">
            Experience ultimate convenience with our flexible delivery options. Your selected vehicle arrives precisely where and when you need it.
          </p>
        </div>
      </section>

      <section className="bg-[#f8f5f0] p-8 rounded-lg shadow-sm">
        <h2 className="text-3xl font-serif text-center mb-6">Our Heritage</h2>
        <div className="max-w-4xl mx-auto text-gray-700 text-lg leading-relaxed text-center">
          <p className="mb-4">
            Established in 2025, CEDT Rentals has been synonymous with luxury, precision, and exceptional service. 
            What began as a passion for extraordinary automobiles has evolved into a premier rental experience that 
            caters to the most discerning clients.
          </p>
          <p>
            Our journey is defined by an unwavering commitment to quality, a deep respect for automotive craftsmanship, 
            and a belief that every journey should be an experience of comfort, style, and prestige.
          </p>
        </div>
      </section>

      <section className="text-center mt-16">
        <h2 className="text-3xl font-serif mb-6">Reserve Your Ride Today</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Whether you're seeking a statement of sophistication for a business meeting, a memorable weekend escape, 
          or simply wish to indulge in automotive excellence, CEDT Rentals is your gateway to unparalleled luxury.
        </p>
        <a 
          href="/catalog" 
          className="inline-block px-6 py-3 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
        >
          Book Now
        </a>
      </section>
    </main>
  );
}