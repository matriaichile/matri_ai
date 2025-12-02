"use client";

import Link from 'next/link';
import { Instagram, Facebook, Linkedin, Mail } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Top section */}
        <div className={styles.top}>
          {/* Brand */}
          <div className={styles.brand}>
            <h2 className={styles.logo}>
              Matri<span className={styles.logoAccent}>.</span>
            </h2>
            <p className={styles.tagline}>
              Conectamos parejas con los mejores proveedores de bodas. 
              Tu historia de amor merece lo mejor.
            </p>
            
            {/* Newsletter */}
            <div className={styles.newsletter}>
              <label className={styles.newsletterLabel}>Mantente informado</label>
              <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Tu email" 
                  className={styles.newsletterInput}
                />
                <button type="submit" className={styles.newsletterBtn}>
                  Suscribir
                </button>
              </form>
            </div>
          </div>

          {/* Links - Parejas */}
          <div className={styles.column}>
            <h4>Para Parejas</h4>
            <ul>
              <li><Link href="/novios">Cómo Funciona</Link></li>
              <li><Link href="/register/user">Crear Cuenta</Link></li>
              <li><Link href="/categorias">Categorías</Link></li>
              <li><Link href="/blog">Blog de Bodas</Link></li>
            </ul>
          </div>

          {/* Links - Proveedores */}
          <div className={styles.column}>
            <h4>Para Proveedores</h4>
            <ul>
              <li><Link href="/proveedores">Beneficios</Link></li>
              <li><Link href="/register/provider">Registrarse</Link></li>
              <li><Link href="/precios">Precios</Link></li>
              <li><Link href="/casos-exito">Casos de Éxito</Link></li>
            </ul>
          </div>

          {/* Links - Empresa */}
          <div className={styles.column}>
            <h4>Empresa</h4>
            <ul>
              <li><Link href="/nosotros">Nosotros</Link></li>
              <li><Link href="/contacto">Contacto</Link></li>
              <li><Link href="/carreras">Carreras</Link></li>
              <li><Link href="/prensa">Prensa</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Matri. Todos los derechos reservados.
          </p>

          {/* Social */}
          <div className={styles.social}>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
              <Instagram size={18} strokeWidth={1.5} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
              <Facebook size={18} strokeWidth={1.5} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="LinkedIn">
              <Linkedin size={18} strokeWidth={1.5} />
            </a>
            <a href="mailto:hola@matri.com" className={styles.socialLink} aria-label="Email">
              <Mail size={18} strokeWidth={1.5} />
            </a>
          </div>

          {/* Legal */}
          <div className={styles.legal}>
            <Link href="/privacidad">Privacidad</Link>
            <Link href="/terminos">Términos</Link>
            <Link href="/cookies">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

