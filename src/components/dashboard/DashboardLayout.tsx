'use client';

import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  /** Menú móvil hamburguesa - se renderiza fuera del main para evitar problemas de z-index */
  mobileMenu?: React.ReactNode;
}

/**
 * Layout principal para los dashboards.
 * Contiene la estructura base con sidebar y contenido principal.
 */
export default function DashboardLayout({ children, sidebar, mobileMenu }: DashboardLayoutProps) {
  return (
    <div className={styles.dashboardLayout}>
      {/* Menú móvil fuera del main para que position: fixed funcione correctamente */}
      {mobileMenu}
      {sidebar}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}















