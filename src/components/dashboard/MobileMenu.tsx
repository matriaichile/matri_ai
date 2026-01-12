'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  X,
  Home,
  FileText,
  Heart,
  User,
  LogOut,
  ChevronRight,
  Mail,
  Copy,
  Check,
  BadgeCheck,
  Sun,
  Moon,
  Briefcase,
  Calendar,
  ImageIcon,
  Users,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import styles from './MobileMenu.module.css';

// Tipo de variante del menú
type MenuVariant = 'user' | 'provider' | 'admin';

// Definición de un item de navegación
interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

interface MobileMenuProps {
  variant: MenuVariant;
  userName?: string;
  isVerified?: boolean;
  onLogout: () => void;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  isOpen: boolean; // Controlado desde el padre
  onClose: () => void; // Callback para cerrar
}

/**
 * Componente de menú hamburguesa para dispositivos móviles.
 * Se muestra solo en pantallas pequeñas (< 768px).
 * Soporta tres variantes: user (novios), provider (proveedores), admin.
 * El botón hamburguesa está en el DashboardHeader.
 */
export default function MobileMenu({
  variant,
  userName,
  isVerified = false,
  onLogout,
  activeSection,
  onSectionChange,
  isOpen,
  onClose
}: MobileMenuProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useThemeStore();

  // Email de contacto
  const CONTACT_EMAIL = 'matrimatch.chile@gmail.com';

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Prevenir scroll del body cuando el menú está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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

  // Manejar clic en sección (para dashboards con navegación interna)
  const handleSectionClick = (sectionId: string) => {
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
    onClose();
  };

  // Items de navegación según la variante
  const getNavItems = (): NavItem[] => {
    switch (variant) {
      case 'user':
        return [
          { id: 'home', label: 'Inicio', icon: <Home size={20} />, href: '/dashboard' },
          { id: 'surveys', label: 'Encuestas', icon: <FileText size={20} />, onClick: () => handleSectionClick('surveys') },
          { id: 'matches', label: 'Mis Matches', icon: <Heart size={20} />, onClick: () => handleSectionClick('matches') },
          { id: 'profile', label: 'Mi Perfil', icon: <User size={20} />, onClick: () => handleSectionClick('profile') },
        ];
      case 'provider':
        return [
          { id: 'overview', label: 'Resumen', icon: <Home size={20} />, onClick: () => handleSectionClick('overview') },
          { id: 'leads', label: 'Leads', icon: <Users size={20} />, onClick: () => handleSectionClick('leads') },
          { id: 'surveys', label: 'Encuestas', icon: <FileText size={20} />, onClick: () => handleSectionClick('surveys') },
          { id: 'portfolio', label: 'Portafolio', icon: <ImageIcon size={20} />, onClick: () => handleSectionClick('portfolio') },
          { id: 'availability', label: 'Disponibilidad', icon: <Calendar size={20} />, onClick: () => handleSectionClick('availability') },
          { id: 'profile', label: 'Mi Perfil', icon: <User size={20} />, onClick: () => handleSectionClick('profile') },
        ];
      case 'admin':
        return [
          { id: 'overview', label: 'Dashboard', icon: <BarChart3 size={20} />, onClick: () => handleSectionClick('overview') },
          { id: 'users', label: 'Usuarios', icon: <Users size={20} />, onClick: () => handleSectionClick('users') },
          { id: 'providers', label: 'Proveedores', icon: <Briefcase size={20} />, onClick: () => handleSectionClick('providers') },
          { id: 'stats', label: 'Estadísticas', icon: <TrendingUp size={20} />, onClick: () => handleSectionClick('stats') },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  // Determinar si un item está activo
  const isItemActive = (item: NavItem): boolean => {
    if (item.href) {
      return pathname === item.href;
    }
    return activeSection === item.id;
  };

  // Obtener el título según la variante
  const getTitle = (): string => {
    switch (variant) {
      case 'user':
        return 'Panel de Novios';
      case 'provider':
        return 'Panel de Proveedor';
      case 'admin':
        return 'Panel de Admin';
      default:
        return 'Menú';
    }
  };

  return (
    <>
      {/* Overlay oscuro */}
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={onClose}
        />
      )}

      {/* Panel del menú */}
      <nav className={`${styles.menuPanel} ${isOpen ? styles.menuPanelOpen : ''}`}>
        {/* Header del menú */}
        <div className={styles.menuHeader}>
          <div className={styles.menuHeaderInfo}>
            <span className={styles.menuTitle}>{getTitle()}</span>
            {userName && (
              <div className={styles.userInfo}>
                <span className={styles.userName}>{userName}</span>
                {isVerified && (
                  <span className={styles.verifiedBadge}>
                    <BadgeCheck size={12} />
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navegación principal */}
        <div className={styles.menuContent}>
          <div className={styles.navSection}>
            <span className={styles.navSectionTitle}>Navegación</span>
            <ul className={styles.navList}>
              {navItems.map((item) => (
                <li key={item.id}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className={`${styles.navItem} ${isItemActive(item) ? styles.navItemActive : ''}`}
                    >
                      <span className={styles.navIcon}>{item.icon}</span>
                      <span className={styles.navLabel}>{item.label}</span>
                      <ChevronRight size={16} className={styles.navArrow} />
                    </Link>
                  ) : (
                    <button
                      className={`${styles.navItem} ${isItemActive(item) ? styles.navItemActive : ''}`}
                      onClick={item.onClick}
                    >
                      <span className={styles.navIcon}>{item.icon}</span>
                      <span className={styles.navLabel}>{item.label}</span>
                      <ChevronRight size={16} className={styles.navArrow} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Sección de configuración */}
          <div className={styles.navSection}>
            <span className={styles.navSectionTitle}>Configuración</span>
            <ul className={styles.navList}>
              {/* Toggle de tema */}
              <li>
                <button className={styles.navItem} onClick={toggleTheme}>
                  <span className={styles.navIcon}>
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                  </span>
                  <span className={styles.navLabel}>
                    {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                  </span>
                </button>
              </li>
              {/* Contacto */}
              <li>
                <button
                  className={styles.navItem}
                  onClick={() => setIsContactModalOpen(true)}
                >
                  <span className={styles.navIcon}>
                    <Mail size={20} />
                  </span>
                  <span className={styles.navLabel}>Contáctanos</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer del menú con logout */}
        <div className={styles.menuFooter}>
          <button className={styles.logoutButton} onClick={onLogout}>
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </nav>

      {/* Modal de contacto */}
      {isContactModalOpen && (
        <div
          className={styles.contactModalOverlay}
          onClick={() => setIsContactModalOpen(false)}
        >
          <div
            className={styles.contactModal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.contactModalClose}
              onClick={() => setIsContactModalOpen(false)}
            >
              <X size={18} />
            </button>

            <div className={styles.contactModalContent}>
              <div className={styles.contactModalIcon}>
                <Mail size={28} />
              </div>
              <h3 className={styles.contactModalTitle}>¿Necesitas ayuda?</h3>
              <p className={styles.contactModalSubtitle}>
                Escríbenos a nuestro correo
              </p>

              <div className={styles.emailContainer}>
                <span className={styles.emailText}>{CONTACT_EMAIL}</span>
                <button
                  className={`${styles.copyButton} ${isCopied ? styles.copyButtonCopied : ''}`}
                  onClick={handleCopyEmail}
                >
                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
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
