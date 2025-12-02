"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Heart, Sparkles } from 'lucide-react';
import { useAnimateOnScroll } from '@/hooks/useAnimateOnScroll';
import styles from './Hero.module.css';

export default function Hero() {
  const { ref: contentRef, isVisible: contentVisible } = useAnimateOnScroll<HTMLDivElement>({ threshold: 0.2 });
  const { ref: imageRef, isVisible: imageVisible } = useAnimateOnScroll<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section className={styles.hero}>
      {/* Elementos decorativos animados */}
      <div className={styles.decorCircle1} />
      <div className={styles.decorCircle2} />
      <div className={styles.decorLine} />

      <div className={styles.container}>
        {/* Contenido principal */}
        <div 
          ref={contentRef}
          className={`${styles.content} ${contentVisible ? styles.visible : ''}`}
        >
          <span className={styles.tagline}>
            <Sparkles size={14} strokeWidth={1.5} className={styles.taglineIcon} />
            Tu boda perfecta comienza aquí
          </span>
          
          <h1 className={styles.title}>
            <span className={styles.titleLine}>Donde los sueños</span>
            <span className={styles.titleLine}>
              se hacen <span className={styles.titleAccent}>realidad</span>
            </span>
          </h1>
          
          <p className={styles.subtitle}>
            Conectamos parejas con los proveedores más exclusivos para crear 
            momentos inolvidables. Tu historia de amor merece lo mejor.
          </p>
          
          <div className={styles.actions}>
            <Link href="/register/user" className={styles.primaryBtn}>
              <span>Planear mi boda</span>
              <ArrowRight size={18} strokeWidth={1.5} className={styles.btnIcon} />
            </Link>
            <Link href="/proveedores" className={styles.secondaryBtn}>
              <span>Soy proveedor</span>
            </Link>
          </div>

          {/* Badges animados */}
          <div className={styles.badges}>
            <div className={styles.badge}>
              <span className={styles.badgeNumber}>500+</span>
              <span className={styles.badgeText}>Proveedores</span>
            </div>
            <div className={styles.badgeDivider} />
            <div className={styles.badge}>
              <span className={styles.badgeNumber}>2.5k</span>
              <span className={styles.badgeText}>Bodas</span>
            </div>
            <div className={styles.badgeDivider} />
            <div className={styles.badge}>
              <span className={styles.badgeNumber}>98%</span>
              <span className={styles.badgeText}>Satisfacción</span>
            </div>
          </div>
        </div>

        {/* Imagen principal con efectos */}
        <div 
          ref={imageRef}
          className={`${styles.imageWrapper} ${imageVisible ? styles.visible : ''}`}
        >
          <div className={styles.imageFrame}>
            <div className={styles.mainImage}>
              <Image
                src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
                alt="Elegante celebración de boda"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
            
            {/* Overlay con gradiente */}
            <div className={styles.imageOverlay} />
          </div>
          
          {/* Tarjeta flotante decorativa */}
          <div className={styles.floatingCard}>
            <div className={styles.cardContent}>
              <div className={styles.cardIcon}>
                <Heart size={20} strokeWidth={1.5} />
              </div>
              <div className={styles.cardText}>
                <h4>+2,500 bodas</h4>
                <p>celebradas con éxito</p>
              </div>
            </div>
          </div>

          {/* Elemento decorativo adicional */}
          <div className={styles.floatingBadge}>
            <Sparkles size={16} />
            <span>Verificado</span>
          </div>
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className={styles.scrollIndicator}>
        <span>Descubre más</span>
        <div className={styles.scrollLine} />
      </div>
    </section>
  );
}
