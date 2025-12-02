"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Search, Shield, Calendar, Star, Check, ArrowRight } from 'lucide-react';
import styles from './NoviosFeatures.module.css';

const features = [
  {
    icon: Search,
    title: "Búsqueda inteligente",
    description: "Encuentra proveedores filtrados por estilo, ubicación, presupuesto y disponibilidad."
  },
  {
    icon: Shield,
    title: "Proveedores verificados",
    description: "Todos nuestros profesionales pasan por un proceso de verificación exhaustivo."
  },
  {
    icon: Calendar,
    title: "Gestión simplificada",
    description: "Organiza reuniones, compara presupuestos y gestiona todo desde un solo lugar."
  }
];

const benefits = [
  {
    title: "Ahorra tiempo",
    description: "Encuentra en minutos lo que antes tomaba semanas de investigación."
  },
  {
    title: "Compara fácilmente",
    description: "Ve precios, reseñas y portfolios lado a lado."
  },
  {
    title: "Sin sorpresas",
    description: "Precios transparentes y comunicación directa con proveedores."
  },
  {
    title: "Apoyo constante",
    description: "Nuestro equipo te acompaña en cada paso del proceso."
  }
];

export default function NoviosFeatures() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.label}>¿Por qué elegirnos?</span>
          <h2 className={styles.title}>Todo lo que necesitas para planear tu boda</h2>
        </div>

        {/* Features grid */}
        <div className={styles.grid}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Icon size={28} strokeWidth={1.5} />
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Benefits section */}
        <div className={styles.benefits}>
          <div className={styles.benefitsImage}>
            <Image
              src="https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=1000&auto=format&fit=crop"
              alt="Detalles de boda"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
          
          <div className={styles.benefitsContent}>
            <h3 className={styles.benefitsTitle}>Planea sin estrés</h3>
            <div className={styles.benefitsList}>
              {benefits.map((benefit, index) => (
                <div key={index} className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>
                    <Check size={16} strokeWidth={2} />
                  </div>
                  <div className={styles.benefitText}>
                    <h4>{benefit.title}</h4>
                    <p>{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className={styles.cta}>
          <Link href="/register/user" className={styles.ctaBtn}>
            Crear cuenta gratis
            <ArrowRight size={18} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}

