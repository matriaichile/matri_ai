import styles from './Footer.module.css';
import Link from 'next/link';
import { Instagram, Facebook, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <h2 className={styles.logo}>Matri.AI</h2>
          <span className={styles.copyright}>© {new Date().getFullYear()}</span>
        </div>

        <div className={styles.links}>
            <div className={styles.column}>
                <Link href="/novios">Para Novios</Link>
                <Link href="/proveedores">Para Proveedores</Link>
                <Link href="/como-funciona">Cómo Funciona</Link>
            </div>
        </div>

        <div className={styles.social}>
            <a href="mailto:hola@matri.ai" aria-label="Email"><Mail /></a>
            <Instagram />
            <Facebook />
            <Twitter />
        </div>
      </div>
    </footer>
  );
}

