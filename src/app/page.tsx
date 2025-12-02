import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Footer from '@/components/landing/Footer';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Footer />
    </main>
  );
}
