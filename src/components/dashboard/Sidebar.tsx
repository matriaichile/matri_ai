'use client';

import Image from 'next/image';
import Link from 'next/link';
import { LogOut, Heart, Calendar, User, Sparkles, FileText, BarChart3, Inbox } from 'lucide-react';
import styles from './Sidebar.module.css';

// Definición de tipos para las secciones
type UserSection = 'matches' | 'surveys' | 'profile';
type ProviderSection = 'overview' | 'leads' | 'surveys' | 'profile';

// Props base del sidebar
interface BaseSidebarProps {
  onLogout: () => void;
}

// Props específicas para usuario
interface UserSidebarProps extends BaseSidebarProps {
  variant: 'user';
  profile: {
    coupleNames?: string;
    eventDate?: string;
    priorityCategories?: string[];
  } | null;
  activeSection: UserSection;
  onSectionChange: (section: UserSection) => void;
  pendingMatchesCount: number;
  completedSurveysCount: number;
  matchesCount: number;
  approvedCount: number;
}

// Props específicas para proveedor
interface ProviderSidebarProps extends BaseSidebarProps {
  variant: 'provider';
  profile: {
    providerName?: string;
    status?: 'active' | 'pending' | 'closed';
    categories?: string[];
    leadLimit?: number;
    leadsUsed?: number;
    categorySurveyStatus?: Record<string, 'not_started' | 'pending' | 'completed' | 'matches_generated'>;
  } | null;
  activeSection: ProviderSection;
  onSectionChange: (section: ProviderSection) => void;
  pendingLeadsCount: number;
  categoryIcon?: React.ReactNode;
  completedSurveysCount?: number;
}

type SidebarProps = UserSidebarProps | ProviderSidebarProps;

/**
 * Sidebar reutilizable para los dashboards de usuario y proveedor.
 * Diseño elegante con navegación y estadísticas.
 */
export default function Sidebar(props: SidebarProps) {
  const { variant, onLogout } = props;

  // Renderizado para usuario
  if (variant === 'user') {
    const { profile, activeSection, onSectionChange, pendingMatchesCount, completedSurveysCount, matchesCount, approvedCount } = props;
    
    return (
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logoLink}>
            <Image 
              src="/logo.png" 
              alt="Matri.AI" 
              width={140} 
              height={50}
              className={styles.logo}
            />
          </Link>
        </div>

        {/* Perfil resumido */}
        <div className={styles.sidebarProfile}>
          <div className={styles.profileAvatar}>
            <Heart size={24} />
          </div>
          <div className={styles.profileInfo}>
            <h3 className={styles.profileName}>{profile?.coupleNames || 'Pareja'}</h3>
            <p className={styles.profileDate}>
              <Calendar size={12} />
              <span>{profile?.eventDate || 'Fecha por definir'}</span>
            </p>
          </div>
        </div>

        {/* Navegación */}
        <nav className={styles.sidebarNav}>
          <button 
            className={`${styles.navItem} ${activeSection === 'matches' ? styles.navItemActive : ''}`}
            onClick={() => onSectionChange('matches')}
          >
            <Sparkles size={20} />
            <span>Mis Matches</span>
            {pendingMatchesCount > 0 && (
              <span className={styles.navBadge}>{pendingMatchesCount}</span>
            )}
          </button>
          
          <button 
            className={`${styles.navItem} ${activeSection === 'surveys' ? styles.navItemActive : ''}`}
            onClick={() => onSectionChange('surveys')}
          >
            <FileText size={20} />
            <span>Mini Encuestas</span>
            {profile?.priorityCategories && (
              <span className={styles.navBadge}>
                {completedSurveysCount}/{profile.priorityCategories.length}
              </span>
            )}
          </button>
          
          <button 
            className={`${styles.navItem} ${activeSection === 'profile' ? styles.navItemActive : ''}`}
            onClick={() => onSectionChange('profile')}
          >
            <User size={20} />
            <span>Mi Perfil</span>
          </button>
        </nav>

        {/* Stats rápidos */}
        <div className={styles.sidebarStats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{matchesCount}</span>
            <span className={styles.statLabel}>Matches</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{approvedCount}</span>
            <span className={styles.statLabel}>Aprobados</span>
          </div>
        </div>

        {/* Logout */}
        <div className={styles.sidebarFooter}>
          <button onClick={onLogout} className={styles.logoutButton}>
            <LogOut size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    );
  }

  // Renderizado para proveedor
  const { profile, activeSection, onSectionChange, pendingLeadsCount, categoryIcon, completedSurveysCount = 0 } = props;
  const leadsRemaining = (profile?.leadLimit || 10) - (profile?.leadsUsed || 0);
  const leadsUsedPercentage = ((profile?.leadsUsed || 0) / (profile?.leadLimit || 10)) * 100;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <Link href="/" className={styles.logoLink}>
          <Image 
            src="/logo.png" 
            alt="Matri.AI" 
            width={140} 
            height={50}
            className={styles.logo}
          />
        </Link>
      </div>

      {/* Perfil resumido */}
      <div className={styles.sidebarProfile}>
        <div className={styles.profileAvatar}>
          {categoryIcon || <User size={24} />}
        </div>
        <div className={styles.profileInfo}>
          <h3 className={styles.profileName}>{profile?.providerName || 'Proveedor'}</h3>
          <div className={`${styles.statusBadge} ${styles[`status${profile?.status?.charAt(0).toUpperCase()}${profile?.status?.slice(1)}`]}`}>
            {profile?.status === 'active' ? 'Activo' : 
             profile?.status === 'pending' ? 'Pendiente' : 'Cerrado'}
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className={styles.sidebarNav}>
        <button 
          className={`${styles.navItem} ${activeSection === 'overview' ? styles.navItemActive : ''}`}
          onClick={() => onSectionChange('overview')}
        >
          <BarChart3 size={20} />
          <span>Resumen</span>
        </button>
        
        <button 
          className={`${styles.navItem} ${activeSection === 'leads' ? styles.navItemActive : ''}`}
          onClick={() => onSectionChange('leads')}
        >
          <Inbox size={20} />
          <span>Mis Leads</span>
          {pendingLeadsCount > 0 && (
            <span className={styles.navBadge}>{pendingLeadsCount}</span>
          )}
        </button>

        <button 
          className={`${styles.navItem} ${activeSection === 'surveys' ? styles.navItemActive : ''}`}
          onClick={() => onSectionChange('surveys')}
        >
          <FileText size={20} />
          <span>Encuestas</span>
          {profile?.categories && (
            <span className={styles.navBadge}>
              {completedSurveysCount}/{profile.categories.length}
            </span>
          )}
        </button>
        
        <button 
          className={`${styles.navItem} ${activeSection === 'profile' ? styles.navItemActive : ''}`}
          onClick={() => onSectionChange('profile')}
        >
          <User size={20} />
          <span>Mi Perfil</span>
        </button>
      </nav>

      {/* Leads disponibles */}
      <div className={styles.leadsQuota}>
        <div className={styles.quotaHeader}>
          <span className={styles.quotaLabel}>Leads disponibles</span>
          <span className={styles.quotaValue}>{leadsRemaining}/{profile?.leadLimit || 10}</span>
        </div>
        <div className={styles.quotaBar}>
          <div 
            className={styles.quotaProgress}
            style={{ width: `${leadsUsedPercentage}%` }}
          />
        </div>
      </div>

      {/* Logout */}
      <div className={styles.sidebarFooter}>
        <button onClick={onLogout} className={styles.logoutButton}>
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

