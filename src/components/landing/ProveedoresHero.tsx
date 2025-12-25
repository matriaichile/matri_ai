import Link from 'next/link';
import styles from './ProveedoresHero.module.css';

export default function ProveedoresHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <span className={styles.tag}>Para Profesionales</span>
        <h1 className={styles.title}>Haz crecer tu negocio<br />con leads calificados.</h1>
        <p className={styles.subtitle}>
          Conecta con parejas que buscan exactamente lo que ofreces. Gestiona tu agenda y propuestas en un solo lugar.
        </p>
        <div className={styles.buttonGroup}>
          <Link href="/register/provider" className={`${styles.button} ${styles.primary}`}>
            Unirme como proveedor
          </Link>
          <Link href="#benefits" className={`${styles.button} ${styles.secondary}`}>
            Ver beneficios
          </Link>
        </div>
      </div>
      <div className={styles.imageContainer}>
         {/* Placeholder for provider/business image */}
         <div className={styles.imagePlaceholder} />
      </div>
    </section>
  );
}












