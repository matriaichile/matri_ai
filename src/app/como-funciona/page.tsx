import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import HowItWorksSteps from '@/components/landing/HowItWorksSteps';
import styles from './page.module.css';

export default function HowItWorksPage() {
  return (
    <main className={styles.main}>
      <Navbar />
      <HowItWorksSteps />
      <Footer />
    </main>
  );
}

