import Navbar from '@/components/landing/Navbar';
import ProveedoresHero from '@/components/landing/ProveedoresHero';
import ProveedoresFeatures from '@/components/landing/ProveedoresFeatures';
import Footer from '@/components/landing/Footer';

export const metadata = {
  title: "Matri | Para Proveedores - Haz crecer tu negocio de bodas",
  description: "Conecta con parejas que buscan tus servicios. Leads cualificados, dashboard profesional y más. Únete a la comunidad de proveedores de bodas.",
};

export default function ProveedoresPage() {
  return (
    <main>
      <Navbar />
      <ProveedoresHero />
      <ProveedoresFeatures />
      <Footer />
    </main>
  );
}
