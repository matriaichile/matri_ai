import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { Heart, Users, Calendar, Sparkles, CheckCircle, Search } from "lucide-react";

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <h1 className={styles.title}>Matri.AI</h1>
        <p className={styles.subtitle}>
          Conectando sueños con realidad. La plataforma inteligente que une a parejas con los proveedores perfectos para su boda.
        </p>
        
        <div className={styles.buttonGroup}>
          <Link href="/register/user" className={`${styles.button} ${styles.primaryButton}`}>
            Soy Usuario
          </Link>
          <Link href="/register/provider" className={`${styles.button} ${styles.secondaryButton}`}>
            Soy Proveedor
          </Link>
        </div>
      </header>

      <section className={styles.features}>
        <h2 className={styles.featuresTitle}>¿Por qué elegir Matri.AI?</h2>
        
        <div className={styles.grid}>
          <div className={styles.card}>
            <Sparkles className={styles.cardIcon} size={48} />
            <h3 className={styles.cardTitle}>Matchmaking Inteligente</h3>
            <p className={styles.cardText}>
              Nuestro sistema utiliza algoritmos avanzados para conectarte con proveedores que se ajustan exactamente a tu estilo, presupuesto y fecha.
            </p>
          </div>

          <div className={styles.card}>
            <CheckCircle className={styles.cardIcon} size={48} />
            <h3 className={styles.cardTitle}>Proveedores Verificados</h3>
            <p className={styles.cardText}>
              Trabajamos solo con los mejores profesionales del sector para garantizar que tu día especial sea impecable.
            </p>
          </div>

          <div className={styles.card}>
            <Users className={styles.cardIcon} size={48} />
            <h3 className={styles.cardTitle}>Gestión Simplificada</h3>
            <p className={styles.cardText}>
              Administra todas tus cotizaciones, citas y contratos desde un solo lugar. Sin estrés, solo disfrute.
            </p>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Matri.AI. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
