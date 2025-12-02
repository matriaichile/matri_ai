import styles from './Footer.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <div className={styles.logoContainer}>
            <Image 
              src="/logo.png" 
              alt="MatriMatch" 
              width={400} 
              height={100} 
              className={styles.logoImage}
            />
          </div>
        </div>

        <div className={styles.links}>
            <div className={styles.column}>
                <Link href="/novios">Para Novios</Link>
                <Link href="/proveedores">Para Proveedores</Link>
                <Link href="/como-funciona">Cómo Funciona</Link>
            </div>
        </div>

        <div className={styles.social}>
            <a href="mailto:hola@matrimatch.com" aria-label="Email"><Mail /></a>
            <Instagram />
            <Facebook />
            <Twitter />
        </div>
      </div>
    </footer>
  );
}

