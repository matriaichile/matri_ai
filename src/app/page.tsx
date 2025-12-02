import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Services from '@/components/landing/Services';
import Process from '@/components/landing/Process';
import Gallery from '@/components/landing/Gallery';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Services />
      <Process />
      <Gallery />
      <Footer />
    </main>
  );
}
