'use client';

import styles from './DashboardHeader.module.css';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  userName?: string;
  showUserBadge?: boolean;
}

/**
 * Header reutilizable para los dashboards.
 * Muestra el título de la sección y opcionalmente el nombre del usuario.
 * La flecha fue eliminada ya que no tenía funcionalidad.
 * El nombre del proveedor ahora destaca más en color morado/dorado.
 */
export default function DashboardHeader({ 
  title, 
  subtitle, 
  userName, 
  showUserBadge = false 
}: DashboardHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <h1 className={styles.pageTitle}>{title}</h1>
        <p className={styles.pageSubtitle}>{subtitle}</p>
      </div>
      {showUserBadge && userName && (
        <div className={styles.headerRight}>
          {/* Nombre destacado sin flecha - solo visual */}
          <span className={styles.userNameHighlight}>{userName}</span>
        </div>
      )}
    </header>
  );
}





