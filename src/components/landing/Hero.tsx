import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.overlay}></div>
      <div className={styles.content}>
        <span className={styles.eyebrow}>La Nueva Era de las Bodas</span>
        <h1 className={styles.title}>
          Planifica tu Boda <br />
          <span className={styles.highlight}>Sin Estrés, Con Estilo</span>
        </h1>
        <p className={styles.subtitle}>
          Conectamos a parejas exigentes con los proveedores más exclusivos mediante 
          inteligencia artificial. Tu boda perfecta, diseñada a medida.
        </p>
        
        <div className={styles.ctaGroup}>
          <div className={styles.ctaBox}>
            <span className={styles.ctaLabel}>¿Se van a casar?</span>
            <Link href="/register/user" className={`${styles.button} ${styles.primary}`}>
              Soy Usuario
            </Link>
          </div>
          <div className={styles.divider}></div>
          <div className={styles.ctaBox}>
            <span className={styles.ctaLabel}>¿Ofreces servicios?</span>
            <Link href="/register/provider" className={`${styles.button} ${styles.secondary}`}>
              Soy Proveedor
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

