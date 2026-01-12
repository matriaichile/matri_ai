'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Menu,
  X,
  LayoutDashboard,
  Store,
  Users,
  LogOut,
  ChevronRight,
  Shield,
  Sparkles
} from 'lucide-react';
import styles from './AdminMobileMenu.module.css';

// Tipo de sección del admin
type SectionType = 'overview' | 'providers' | 'users';

interface AdminMobileMenuProps {
  isSuperAdmin?: boolean;
  onLogout: () => void;
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
}

/**
 * Componente de menú hamburguesa para el dashboard de admin en móvil.
 * Solo visible en pantallas < 768px.
 */
export default function AdminMobileMenu({
  isSuperAdmin = false,
  onLogout,
  activeSection,
  onSectionChange
}: AdminMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

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

  // Manejar clic en sección
  const handleSectionClick = (section: SectionType) => {
    onSectionChange(section);
    setIsOpen(false);
  };

  // Items de navegación del admin
  const navItems = [
    { id: 'overview' as SectionType, label: 'Resumen', icon: <LayoutDashboard size={20} /> },
    { id: 'providers' as SectionType, label: 'Proveedores', icon: <Store size={20} /> },
    { id: 'users' as SectionType, label: 'Usuarios', icon: <Users size={20} /> },
  ];

  return (
    <>
      {/* Botón hamburguesa - se oculta cuando el menú está abierto */}
      <button
        className={`${styles.hamburgerButton} ${isOpen ? styles.hamburgerButtonHidden : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu size={24} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Panel del menú */}
      <nav className={`${styles.menuPanel} ${isOpen ? styles.menuPanelOpen : ''}`}>
        {/* Header del menú */}
        <div className={styles.menuHeader}>
          <div className={styles.menuHeaderInfo}>
            <Link href="/" className={styles.logoLink}>
              <Image src="/logo.png" alt="Matri.AI" width={100} height={32} className={styles.logo} />
            </Link>
            <span className={styles.adminBadge}>
              <Shield size={12} />
              <span>{isSuperAdmin ? 'Super Admin' : 'Admin'}</span>
            </span>
          </div>
          <button
            className={styles.closeButton}
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar menú"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navegación */}
        <div className={styles.menuContent}>
          <div className={styles.navSection}>
            <span className={styles.navSectionTitle}>General</span>
            <ul className={styles.navList}>
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    className={`${styles.navItem} ${activeSection === item.id ? styles.navItemActive : ''}`}
                    onClick={() => handleSectionClick(item.id)}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    <span className={styles.navLabel}>{item.label}</span>
                    <ChevronRight size={16} className={styles.navArrow} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Herramientas */}
          <div className={styles.navSection}>
            <span className={styles.navSectionTitle}>Herramientas</span>
            <ul className={styles.navList}>
              <li>
                <Link href="/admin/matchmaking" className={styles.navItem}>
                  <span className={styles.navIcon}><Sparkles size={20} /></span>
                  <span className={styles.navLabel}>Matchmaking</span>
                  <ChevronRight size={16} className={styles.navArrow} />
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer con logout */}
        <div className={styles.menuFooter}>
          <button className={styles.logoutButton} onClick={onLogout}>
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </nav>
    </>
  );
}
