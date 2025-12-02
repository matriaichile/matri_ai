"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import styles from './Navbar.module.css';

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

  // Bloquear scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.container}>
          <Link href="/" className={styles.logo}>
            Matri<span className={styles.logoAccent}>.</span>
          </Link>

          <div className={styles.desktopMenu}>
            <Link href="/novios" className={styles.navLink}>Parejas</Link>
            <Link href="/proveedores" className={styles.navLink}>Proveedores</Link>
            <Link href="/como-funciona" className={styles.navLink}>Cómo Funciona</Link>
          </div>

          <div className={styles.authButtons}>
            <ThemeToggle />
            <Link href="/login" className={styles.loginBtn}>Ingresar</Link>
            <Link href="/register/user" className={styles.registerBtn}>Comenzar</Link>
          </div>

          <div className={styles.mobileActions}>
            <ThemeToggle />
            <button 
              className={styles.mobileToggle}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </nav>

      {/* Menú móvil */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ''}`}>
        <button 
          className={styles.closeBtn}
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Cerrar menú"
        >
          <X size={28} strokeWidth={1.5} />
        </button>
        
        <Link href="/novios" onClick={() => setMobileMenuOpen(false)}>Parejas</Link>
        <Link href="/proveedores" onClick={() => setMobileMenuOpen(false)}>Proveedores</Link>
        <Link href="/como-funciona" onClick={() => setMobileMenuOpen(false)}>Cómo Funciona</Link>
        <hr />
        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Ingresar</Link>
        <Link href="/register/user" onClick={() => setMobileMenuOpen(false)}>Comenzar</Link>
      </div>
    </>
  );
}
