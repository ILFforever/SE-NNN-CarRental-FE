'use client';

import { useRouter } from 'next/navigation';
import styles from './cta-button.module.css';

export default function BookingCTA() {
  const router = useRouter();
  
  return (
    <section className={styles.ctaContainer}>
      <div className={styles.ctaContent}>
        <h2 className={styles.ctaHeading}>Experience Luxury on Your Terms</h2>
        <p className={styles.ctaText}>
          Choose from our curated selection of premium automobiles for your next journey
        </p>
        <button 
          className={styles.ctaButton}
          onClick={() => router.push('/catalog')}
        >
          Book a Car Now
        </button>
      </div>
    </section>
  );
}