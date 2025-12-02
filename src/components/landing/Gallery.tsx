"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Star, ArrowRight, Quote } from 'lucide-react';
import { useAnimateOnScroll } from '@/hooks/useAnimateOnScroll';
import styles from './Gallery.module.css';

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop",
    alt: "Ceremonia de boda elegante"
  },
  {
    src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=800&auto=format&fit=crop",
    alt: "Detalles florales"
  },
  {
    src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop",
    alt: "Mesa de celebración"
  },
  {
    src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=800&auto=format&fit=crop",
    alt: "Momento especial"
  },
  {
    src: "https://images.unsplash.com/photo-1460978812857-470ed1c77af0?q=80&w=800&auto=format&fit=crop",
    alt: "Brindis de boda"
  }
];

const testimonials = [
  {
    text: "Matri nos ayudó a encontrar los proveedores perfectos para nuestra boda. Todo fue tan fácil y elegante, exactamente como lo soñamos.",
    author: "Carolina & Andrés",
    location: "Bogotá, Colombia",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
  },
  {
    text: "La plataforma es increíble. Encontramos un fotógrafo excepcional que capturó cada momento. No podríamos estar más felices.",
    author: "María & José",
    location: "Medellín, Colombia",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
  },
  {
    text: "Gracias a Matri pudimos comparar opciones y encontrar el venue perfecto dentro de nuestro presupuesto. ¡Altamente recomendado!",
    author: "Valentina & Diego",
    location: "Cartagena, Colombia",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop"
  }
];

export default function Gallery() {
  const { ref: headerRef, isVisible: headerVisible } = useAnimateOnScroll<HTMLDivElement>({ threshold: 0.3 });
  const { ref: galleryRef, isVisible: galleryVisible } = useAnimateOnScroll<HTMLDivElement>({ threshold: 0.1 });
  const { ref: testimonialsRef, isVisible: testimonialsVisible } = useAnimateOnScroll<HTMLDivElement>({ threshold: 0.2 });
  const { ref: ctaRef, isVisible: ctaVisible } = useAnimateOnScroll<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section className={styles.section}>
      {/* Header */}
      <div 
        ref={headerRef}
        className={`${styles.header} ${headerVisible ? styles.visible : ''}`}
      >
        <span className={styles.label}>Historias de amor</span>
        <h2 className={styles.title}>Momentos que perduran</h2>
      </div>

      {/* Galería */}
      <div 
        ref={galleryRef}
        className={`${styles.gallery} ${galleryVisible ? styles.visible : ''}`}
      >
        {galleryImages.map((image, index) => (
          <div 
            key={index} 
            className={styles.galleryItem}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              style={{ objectFit: 'cover' }}
            />
            <div className={styles.galleryOverlay}>
              <span className={styles.galleryCaption}>{image.alt}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Testimonios */}
      <div 
        ref={testimonialsRef}
        className={`${styles.testimonials} ${testimonialsVisible ? styles.visible : ''}`}
      >
        <div className={styles.testimonialGrid}>
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className={styles.testimonial}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className={styles.testimonialContent}>
                <Quote size={32} className={styles.quoteIcon} />
                <div className={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className={styles.testimonialText}>{testimonial.text}</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorImage}>
                    <Image
                      src={testimonial.image}
                      alt={testimonial.author}
                      fill
                      sizes="48px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className={styles.authorInfo}>
                    <h4>{testimonial.author}</h4>
                    <p>{testimonial.location}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div 
        ref={ctaRef}
        className={`${styles.cta} ${ctaVisible ? styles.visible : ''}`}
      >
        <h3 className={styles.ctaTitle}>¿Listo para tu historia?</h3>
        <p className={styles.ctaText}>
          Únete a miles de parejas que encontraron a sus proveedores perfectos.
        </p>
        <Link href="/register/user" className={styles.ctaButton}>
          <span>Comenzar ahora</span>
          <ArrowRight size={18} strokeWidth={1.5} />
        </Link>
      </div>
    </section>
  );
}
