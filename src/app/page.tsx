import Navbar from '@/components/landing/Navbar';
import LandingHero from '@/components/landing/LandingHero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Testimonials from '@/components/landing/Testimonials';
import ComingSoon from '@/components/landing/ComingSoon';
import FinalCallToAction from '@/components/landing/FinalCallToAction';
import Footer from '@/components/landing/Footer';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <Navbar />
      <LandingHero />
      <HowItWorks />
      <Features />
      <Testimonials />
      <ComingSoon />
      <FinalCallToAction />
      <Footer />
    </main>
  );
}
