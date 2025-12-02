"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Matri.AI
        </Link>

        <div className={styles.desktopMenu}>
          <Link href="#couples" className={styles.navLink}>Para Novios</Link>
          <Link href="#providers" className={styles.navLink}>Para Proveedores</Link>
          <Link href="#how-it-works" className={styles.navLink}>Cómo Funciona</Link>
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
          <Link href="#couples" onClick={() => setMobileMenuOpen(false)}>Para Novios</Link>
          <Link href="#providers" onClick={() => setMobileMenuOpen(false)}>Para Proveedores</Link>
          <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>Cómo Funciona</Link>
          <hr />
          <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Iniciar Sesión</Link>
          <Link href="/register/user" onClick={() => setMobileMenuOpen(false)}>Registrarse</Link>
        </div>
      )}
    </nav>
  );
}

