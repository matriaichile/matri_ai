import Navbar from '@/components/landing/Navbar';
import HowItWorksDetail from '@/components/landing/HowItWorksDetail';
import Footer from '@/components/landing/Footer';

export const metadata = {
  title: "Matri | Cómo Funciona - Tu boda perfecta en 3 pasos",
  description: "Descubre cómo Matri te ayuda a encontrar los mejores proveedores de boda. Cuestionario simple, matches personalizados y conexión directa.",
};

export default function HowItWorksPage() {
  return (
    <main>
      <Navbar />
      <HowItWorksDetail />
      <Footer />
    </main>
  );
}
