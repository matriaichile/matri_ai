"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Check if we are on the home page for transparent navbar logic
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation logic: always animate on scroll
  const navbarClass = `${styles.navbar} ${isScrolled ? styles.scrolled : ''}`;

  return (
    <nav className={navbarClass}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Matri.AI
        </Link>

        <div className={styles.desktopMenu}>
          <Link href="/novios" className={styles.navLink}>Para Novios</Link>
          <Link href="/proveedores" className={styles.navLink}>Para Proveedores</Link>
          <Link href="/como-funciona" className={styles.navLink}>Cómo Funciona</Link>
        </div>

        <div className={styles.authButtons}>
          <Link href="/login" className={styles.loginBtn}>Iniciar Sesión</Link>
          <Link href="/register/user" className={styles.registerBtn}>Registrarse</Link>
        </div>

        <button 
          className={styles.mobileToggle}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/novios" onClick={() => setMobileMenuOpen(false)}>Para Novios</Link>
          <Link href="/proveedores" onClick={() => setMobileMenuOpen(false)}>Para Proveedores</Link>
          <Link href="/como-funciona" onClick={() => setMobileMenuOpen(false)}>Cómo Funciona</Link>
          <hr />
          <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Iniciar Sesión</Link>
          <Link href="/register/user" onClick={() => setMobileMenuOpen(false)}>Registrarse</Link>
        </div>
      )}
    </nav>
  );
}
