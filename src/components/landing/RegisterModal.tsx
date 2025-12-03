"use client";

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { X, Heart, Briefcase, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './RegisterModal.module.css';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Montar el portal solo en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Cerrar al hacer clic fuera del modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // No renderizar en el servidor
  if (!mounted) return null;

  // Usar createPortal para renderizar el modal fuera del DOM del Navbar
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={modalRef}
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            {/* Decoración de fondo */}
            <div className={styles.glowEffect} />
            
            {/* Botón de cerrar */}
            <button 
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Cerrar modal"
            >
              <X size={20} />
            </button>

            {/* Contenido del modal */}
            <div className={styles.content}>
              <motion.div 
                className={styles.header}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Sparkles className={styles.sparkleIcon} size={24} />
                <h2 className={styles.title}>¿Cómo te gustaría unirte?</h2>
                <p className={styles.subtitle}>
                  Elige tu camino hacia la boda perfecta
                </p>
              </motion.div>

              <div className={styles.options}>
                {/* Opción Novio/a */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Link 
                    href="/register/user" 
                    className={styles.optionCard}
                    onClick={onClose}
                  >
                    <div className={styles.iconWrapper}>
                      <Heart size={28} />
                    </div>
                    <div className={styles.optionContent}>
                      <h3>Soy Novio/a</h3>
                      <p>Planifica tu boda de ensueño con los mejores proveedores</p>
                    </div>
                    <div className={styles.arrow}>→</div>
                  </Link>
                </motion.div>

                {/* Separador */}
                <div className={styles.divider}>
                  <span>o</span>
                </div>

                {/* Opción Proveedor */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link 
                    href="/register/provider" 
                    className={`${styles.optionCard} ${styles.providerCard}`}
                    onClick={onClose}
                  >
                    <div className={styles.iconWrapper}>
                      <Briefcase size={28} />
                    </div>
                    <div className={styles.optionContent}>
                      <h3>Soy Proveedor</h3>
                      <p>Conecta con parejas que buscan tus servicios exclusivos</p>
                    </div>
                    <div className={styles.arrow}>→</div>
                  </Link>
                </motion.div>
              </div>

              {/* Footer del modal */}
              <motion.p 
                className={styles.footerText}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className={styles.loginLink} onClick={onClose}>
                  Inicia sesión
                </Link>
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

