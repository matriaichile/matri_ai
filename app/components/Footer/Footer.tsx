"use client";

import { motion } from "framer-motion";
import { Heart, Instagram, Facebook, Mail, MapPin } from "lucide-react";
import styles from "./Footer.module.css";

const footerLinks = {
  parejas: [
    { label: "Cómo Funciona", href: "#how-it-works" },
    { label: "Categorías", href: "#categories" },
    { label: "Testimonios", href: "#testimonials" },
    { label: "Blog de Bodas", href: "#blog" },
  ],
  proveedores: [
    { label: "Unirse como Proveedor", href: "#register-provider" },
    { label: "Beneficios", href: "#benefits" },
    { label: "Precios", href: "#pricing" },
    { label: "Recursos", href: "#resources" },
  ],
  legal: [
    { label: "Términos y Condiciones", href: "#terms" },
    { label: "Política de Privacidad", href: "#privacy" },
    { label: "Cookies", href: "#cookies" },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className={styles.footer}>
      {/* Top decorative wave */}
      <div className={styles.waveContainer}>
        <svg
          className={styles.wave}
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 80L60 73.3C120 66.7 240 53.3 360 50C480 46.7 600 53.3 720 56.7C840 60 960 60 1080 55C1200 50 1320 40 1380 35L1440 30V0H1380C1320 0 1200 0 1080 0C960 0 840 0 720 0C600 0 480 0 360 0C240 0 120 0 60 0H0V80Z"
            fill="var(--cream)"
          />
        </svg>
      </div>

      <div className={styles.container}>
        {/* Main Footer Content */}
        <div className={styles.mainContent}>
          {/* Brand Column */}
          <motion.div
            className={styles.brandColumn}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <a href="#" className={styles.logo}>
              <span className={styles.logoText}>
                <span className={styles.logoMain}>Matri</span>
                <span className={styles.logoDot}>.</span>
                <span className={styles.logoAccent}>AI</span>
              </span>
            </a>
            <p className={styles.brandDescription}>
              Conectamos parejas con los proveedores perfectos para crear la boda de sus sueños mediante matchmaking inteligente.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="Email">
                <Mail size={18} />
              </a>
            </div>
          </motion.div>

          {/* Links Columns */}
          <motion.div
            className={styles.linksColumn}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <h4 className={styles.columnTitle}>Para Parejas</h4>
            <ul className={styles.linksList}>
              {footerLinks.parejas.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className={styles.footerLink}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className={styles.linksColumn}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h4 className={styles.columnTitle}>Para Proveedores</h4>
            <ul className={styles.linksList}>
              {footerLinks.proveedores.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className={styles.footerLink}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className={styles.linksColumn}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h4 className={styles.columnTitle}>Legal</h4>
            <ul className={styles.linksList}>
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className={styles.footerLink}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            
            {/* Contact Info */}
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <Mail size={14} />
                <span>hola@matri.ai</span>
              </div>
              <div className={styles.contactItem}>
                <MapPin size={14} />
                <span>Santiago, Chile</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Bottom */}
        <motion.div
          className={styles.bottom}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <p className={styles.copyright}>
            © {currentYear} Matri.AI — Todos los derechos reservados
          </p>
          <p className={styles.madeWith}>
            Hecho con <Heart size={12} className={styles.heartIcon} /> en Chile
          </p>
        </motion.div>
      </div>

      {/* Decorative background */}
      <div className={styles.bgDecoration} />
    </footer>
  );
}

