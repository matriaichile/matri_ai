import Navbar from '@/components/landing/Navbar';
import NoviosHero from '@/components/landing/NoviosHero';
import NoviosFeatures from '@/components/landing/NoviosFeatures';
import Gallery from '@/components/landing/Gallery';
import Footer from '@/components/landing/Footer';

export const metadata = {
  title: "Matri | Para Parejas - Encuentra tus proveedores de boda",
  description: "Descubre los mejores proveedores para tu boda. Fotografía, venues, catering y más. Compara, conecta y celebra el amor.",
};

export default function NoviosPage() {
  return (
    <main>
      <Navbar />
      <NoviosHero />
      <NoviosFeatures />
      <Gallery />
      <Footer />
    </main>
  );
}
