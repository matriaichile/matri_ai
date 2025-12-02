import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import NoviosHero from '@/components/landing/NoviosHero';
import NoviosFeatures from '@/components/landing/NoviosFeatures';
import styles from './page.module.css';

export default function NoviosPage() {
  return (
    <main className={styles.main}>
      <Navbar />
      <NoviosHero />
      <NoviosFeatures />
      <Footer />
    </main>
  );
}

