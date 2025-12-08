import Link from 'next/link';
import styles from './NoviosHero.module.css';

export default function NoviosHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <span className={styles.tag}>Para Parejas</span>
        <h1 className={styles.title}>Planifica tu boda perfecta,<br />sin estrés.</h1>
        <p className={styles.subtitle}>
          MatriMatch te ayuda a encontrar los proveedores ideales que se ajustan a tu estilo, presupuesto y visión.
        </p>
        <Link href="/register/user" className={styles.button}>
          Crear mi perfil gratis
        </Link>
      </div>
      <div className={styles.imageContainer}>
         {/* Placeholder for a couple image */}
         <div className={styles.imagePlaceholder} />
      </div>
    </section>
  );
}

