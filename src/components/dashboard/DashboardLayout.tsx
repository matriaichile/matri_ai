'use client';

import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

/**
 * Layout principal para los dashboards.
 * Contiene la estructura base con sidebar y contenido principal.
 */
export default function DashboardLayout({ children, sidebar }: DashboardLayoutProps) {
  return (
    <div className={styles.dashboardLayout}>
      {sidebar}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}















