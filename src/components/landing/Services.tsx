"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useAnimateOnScroll } from '@/hooks/useAnimateOnScroll';
import { AnimatedCounter } from '@/components/AnimatedSection';
import styles from './Services.module.css';

const categories = [
  {
    id: 1,
    title: "Fotografía",
    description: "Captura cada momento mágico con artistas visuales excepcionales",
    image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Venues",
    description: "Lugares únicos que harán tu celebración inolvidable",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Catering",
    description: "Experiencias gastronómicas que deleitan todos los sentidos",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Música",
    description: "El soundtrack perfecto para tu historia de amor",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop"
  }
];

const stats = [
  { number: 500, suffix: "+", label: "Proveedores verificados" },
  { number: 2500, suffix: "", label: "Bodas celebradas" },
  { number: 98, suffix: "%", label: "Parejas satisfechas" },
  { number: 15, suffix: "+", label: "Ciudades" }
];

export default function Services() {
  const { ref: headerRef, isVisible: headerVisible } = useAnimateOnScroll<HTMLDivElement>({ threshold: 0.2 });
  const { ref: gridRef, isVisible: gridVisible } = useAnimateOnScroll<HTMLDivElement>({ threshold: 0.1 });
  const { ref: statsRef, isVisible: statsVisible } = useAnimateOnScroll<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Header */}
        <div 
          ref={headerRef}
          className={`${styles.header} ${headerVisible ? styles.visible : ''}`}
        >
          <span className={styles.label}>Nuestros servicios</span>
          <h2 className={styles.title}>Todo lo que necesitas, en un solo lugar</h2>
          <p className={styles.description}>
            Desde la decoración hasta la música, conectamos con los mejores 
            profesionales para hacer tu día extraordinario.
          </p>
        </div>

        {/* Grid de categorías */}
        <div 
          ref={gridRef}
          className={`${styles.grid} ${gridVisible ? styles.visible : ''}`}
        >
          {categories.map((category, index) => (
            <Link 
              href={`/categoria/${category.id}`} 
              key={category.id} 
              className={styles.card}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className={styles.cardImage}>
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className={styles.cardOverlay} />
              <div className={styles.cardShine} />
              <div className={styles.cardContent}>
                <span className={styles.cardNumber}>0{index + 1}</span>
                <h3 className={styles.cardTitle}>{category.title}</h3>
                <p className={styles.cardDesc}>{category.description}</p>
              </div>
              <div className={styles.cardArrow}>
                <ArrowUpRight size={18} strokeWidth={1.5} />
              </div>
            </Link>
          ))}
        </div>

        {/* Estadísticas animadas */}
        <div 
          ref={statsRef}
          className={`${styles.stats} ${statsVisible ? styles.visible : ''}`}
        >
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={styles.stat}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={styles.statNumber}>
                <AnimatedCounter 
                  target={stat.number} 
                  suffix={stat.suffix}
                  duration={2000}
                />
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
