'use client';

import { useState } from 'react';
import { Mail, X, Copy, Check, BadgeCheck, Menu } from 'lucide-react';
import styles from './DashboardHeader.module.css';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  userName?: string;
  showUserBadge?: boolean;
  isVerified?: boolean; // NUEVO: Para mostrar badge de verificación
  /** Callback para abrir el menú móvil */
  onMenuClick?: () => void;
}

/**
 * Header reutilizable para los dashboards.
 * Muestra el título de la sección y opcionalmente el nombre del usuario.
 * La flecha fue eliminada ya que no tenía funcionalidad.
 * El nombre del proveedor ahora destaca más en color morado/dorado.
 * Incluye botón de "Contáctanos" con modal mostrando el email.
 */
export default function DashboardHeader({ 
  title, 
  subtitle, 
  userName, 
  showUserBadge = false,
  isVerified = false,
  onMenuClick
}: DashboardHeaderProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Email de contacto unificado para novios y proveedores
  const CONTACT_EMAIL = 'matrimatch.chile@gmail.com';
  
  // Copiar email al portapapeles
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };
  
  return (
    <>
      <header className={styles.header}>
        {/* Botón hamburguesa - solo visible en móvil */}
        {onMenuClick && (
          <button 
            className={styles.menuButton}
            onClick={() => {
              console.log('Menu button clicked');
              onMenuClick();
            }}
            aria-label="Abrir menú"
          >
            <Menu size={24} />
          </button>
        )}
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>{title}</h1>
          <p className={styles.pageSubtitle}>{subtitle}</p>
        </div>
        <div className={styles.headerRight}>
          {/* Toggle de tema */}
          <ThemeToggle compact className={styles.themeToggle} />
          
          {/* Botón de contacto */}
          <button 
            className={styles.contactButton}
            onClick={() => setIsContactModalOpen(true)}
          >
            <Mail size={16} />
            <span>Contáctanos</span>
          </button>
          
          {/* Nombre destacado con badge de verificación */}
          {showUserBadge && userName && (
            <div className={styles.userNameContainer}>
              <span className={styles.userNameHighlight}>{userName}</span>
              {isVerified && (
                <span className={styles.verifiedBadge}>
                  <BadgeCheck size={14} />
                  <span>Verificado</span>
                </span>
              )}
            </div>
          )}
        </div>
      </header>
      
      {/* Modal de contacto */}
      {isContactModalOpen && (
        <div 
          className={styles.modalOverlay}
          onClick={() => setIsContactModalOpen(false)}
        >
          <div 
            className={styles.contactModal}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className={styles.modalCloseButton}
              onClick={() => setIsContactModalOpen(false)}
            >
              <X size={18} />
            </button>
            
            <div className={styles.modalContent}>
              <div className={styles.modalIcon}>
                <Mail size={32} />
              </div>
              <h2 className={styles.modalTitle}>¿Necesitas ayuda?</h2>
              <p className={styles.modalSubtitle}>
                Escríbenos a nuestro correo y te responderemos lo antes posible
              </p>
              
              <div className={styles.emailContainer}>
                <span className={styles.emailText}>{CONTACT_EMAIL}</span>
                <button 
                  className={styles.copyButton}
                  onClick={handleCopyEmail}
                  title="Copiar email"
                >
                  {isCopied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{isCopied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}





