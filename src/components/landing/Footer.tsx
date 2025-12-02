import styles from './Footer.module.css';
import Link from 'next/link';
import { Instagram, Facebook, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <h2 className={styles.logo}>Matri.AI</h2>
          <p className={styles.tagline}>Conectando sueños con realidad.</p>
        </div>

        <div className={styles.links}>
          <div className={styles.column}>
            <h3>Plataforma</h3>
            <Link href="#couples">Para Novios</Link>
            <Link href="#providers">Para Proveedores</Link>
            <Link href="#how-it-works">Cómo Funciona</Link>
          </div>
          <div className={styles.column}>
            <h3>Legal</h3>
            <Link href="/terms">Términos y Condiciones</Link>
            <Link href="/privacy">Política de Privacidad</Link>
          </div>
          <div className={styles.column}>
            <h3>Contacto</h3>
            <a href="mailto:hola@matri.ai" className={styles.contactLink}>
              <Mail size={16} /> hola@matri.ai
            </a>
            <div className={styles.social}>
              <Instagram size={20} />
              <Facebook size={20} />
              <Twitter size={20} />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.copyright}>
        © {new Date().getFullYear()} Matri.AI. Todos los derechos reservados.
      </div>
    </footer>
  );
}

