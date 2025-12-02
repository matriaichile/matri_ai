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

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    // Only handle scroll if on home page
    if (isHomePage) {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    // If not on home page, the default Link behavior will work (href="/#id")
    setMobileMenuOpen(false);
  };

  return (
    <nav className={navbarClass}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Matri.AI
        </Link>

        <div className={styles.desktopMenu}>
          <Link 
            href="/#how-it-works" 
            className={styles.navLink}
            onClick={(e) => scrollToSection(e, 'how-it-works')}
          >
            Cómo Funciona
          </Link>
          <Link 
            href="/#features" 
            className={styles.navLink}
            onClick={(e) => scrollToSection(e, 'features')}
          >
            Para quién es
          </Link>
          <Link 
            href="/#testimonials" 
            className={styles.navLink}
            onClick={(e) => scrollToSection(e, 'testimonials')}
          >
            Testimonios
          </Link>
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
          <Link 
            href="/#how-it-works" 
            onClick={(e) => scrollToSection(e, 'how-it-works')}
            className={styles.navLink}
          >
            Cómo Funciona
          </Link>
          <Link 
            href="/#features" 
            onClick={(e) => scrollToSection(e, 'features')}
            className={styles.navLink}
          >
            Para quién es
          </Link>
          <Link 
            href="/#testimonials" 
            onClick={(e) => scrollToSection(e, 'testimonials')}
            className={styles.navLink}
          >
            Testimonios
          </Link>
          <hr />
          <Link href="/login" onClick={() => setMobileMenuOpen(false)} className={styles.navLink}>Iniciar Sesión</Link>
          <Link href="/register/user" onClick={() => setMobileMenuOpen(false)} className={styles.navLink}>Registrarse</Link>
        </div>
      )}
    </nav>
  );
}
