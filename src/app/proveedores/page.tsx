import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import ProveedoresHero from '@/components/landing/ProveedoresHero';
import ProveedoresFeatures from '@/components/landing/ProveedoresFeatures';
import styles from './page.module.css';

export default function ProveedoresPage() {
  return (
    <main className={styles.main}>
      <Navbar />
      <ProveedoresHero />
      <ProveedoresFeatures />
      <Footer />
    </main>
  );
}

