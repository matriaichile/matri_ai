'use client';

import { ChevronDown } from 'lucide-react';
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
          <div className={styles.userBadge}>
            <span>{userName}</span>
            <ChevronDown size={16} />
          </div>
        </div>
      )}
    </header>
  );
}

