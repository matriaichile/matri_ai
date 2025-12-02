"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import styles from "./Header.module.css";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Inicio", href: "#hero" },
    { label: "Beneficios", href: "#benefits" },
    { label: "Cómo Funciona", href: "#how-it-works" },
    { label: "Contacto", href: "#contact" },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] as const }}
      className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}
    >
      <div className={styles.container}>
        {/* Logo */}
        <motion.a
          href="#"
          className={styles.logo}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <span className={styles.logoText}>
            <span className={styles.logoMain}>Matri</span>
            <span className={styles.logoDot}>.</span>
            <span className={styles.logoAccent}>AI</span>
          </span>
        </motion.a>

        {/* Desktop Navigation */}
        <nav className={styles.nav}>
          {navItems.map((item, index) => (
            <motion.a
              key={item.label}
              href={item.href}
              className={styles.navLink}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.1 * index,
                ease: [0.22, 1, 0.36, 1] as const
              }}
              whileHover={{ y: -2 }}
            >
              <span className={styles.navText}>{item.label}</span>
              <span className={styles.navLine} />
            </motion.a>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className={styles.ctaGroup}>
          <motion.a
            href="#register"
            className={styles.ctaSecondary}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Comenzar
          </motion.a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
          >
            <nav className={styles.mobileNav}>
              {navItems.map((item, index) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  className={styles.mobileNavLink}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </motion.a>
              ))}
              <motion.a
                href="#register"
                className={styles.mobileCta}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Comenzar
              </motion.a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative line */}
      <motion.div
        className={styles.decorativeLine}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
      />
    </motion.header>
  );
}

