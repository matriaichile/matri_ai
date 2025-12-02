import Link from 'next/link';
import Image from 'next/image';
import { Heart, Briefcase } from 'lucide-react';
import styles from './LandingHero.module.css';

export default function LandingHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.overlay} />
      
      {/* Background Image Placeholder - In production, use a high quality wedding image */}
      <div className={styles.backgroundImage}>
        {/* <Image src="/path/to/wedding-bg.jpg" alt="Wedding Background" fill style={{objectFit: 'cover'}} priority /> */}
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>
          El Match Perfecto<br />
          <span className={styles.highlight}>para tu Matrimonio.</span>
        </h1>
        
        <p className={styles.subtitle}>
          Olvídate de buscar entre miles de opciones. Nuestro algoritmo inteligente conecta novios con los proveedores ideales basándose en estilo, presupuesto y fecha.
        </p>

        <div className={styles.actions}>
          <div className={styles.actionCard}>
            <div className={styles.iconWrapper}>
              <Heart size={32} />
            </div>
            <h3>Soy Novio/a</h3>
            <p>Encuentra el equipo perfecto para tu gran día.</p>
            <Link href="/register/user" className={`${styles.button} ${styles.primaryBtn}`}>
              Comenzar mi boda
            </Link>
          </div>

          <div className={styles.divider}>
            <span className={styles.dividerText}>o</span>
          </div>

          <div className={styles.actionCard}>
            <div className={styles.iconWrapper}>
              <Briefcase size={32} />
            </div>
            <h3>Soy Proveedor</h3>
            <p>Conecta con parejas que buscan tus servicios.</p>
            <Link href="/register/provider" className={`${styles.button} ${styles.secondaryBtn}`}>
              Ofrecer mis servicios
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

