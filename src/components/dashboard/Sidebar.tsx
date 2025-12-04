'use client';

import { useState } from 'react';
import { 
  LogOut, 
  Calendar, 
  User, 
  Sparkles, 
  FileText, 
  BarChart3, 
  Inbox,
  ChevronLeft,
  Menu,
  Mail,
  Image
} from 'lucide-react';
import styles from './Sidebar.module.css';

// Definición de tipos para las secciones
type UserSection = 'matches' | 'surveys' | 'profile';
type ProviderSection = 'overview' | 'leads' | 'surveys' | 'portfolio' | 'profile';

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
    email?: string;
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
    email?: string;
  } | null;
  activeSection: ProviderSection;
  onSectionChange: (section: ProviderSection) => void;
  pendingLeadsCount: number;
  categoryIcon?: React.ReactNode;
  completedSurveysCount?: number;
}

type SidebarProps = UserSidebarProps | ProviderSidebarProps;

/**
 * Sidebar moderno colapsable para los dashboards.
 * Se expande en hover, estilo Make/Supabase.
 */
export default function Sidebar(props: SidebarProps) {
  const { variant, onLogout } = props;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  // Determina si el sidebar debe mostrarse expandido
  const showExpanded = isExpanded || isPinned;

  // Toggle pin del sidebar
  const togglePin = () => {
    setIsPinned(!isPinned);
  };

  // Renderizado para usuario
  if (variant === 'user') {
    const { profile, activeSection, onSectionChange, pendingMatchesCount, completedSurveysCount, matchesCount, approvedCount } = props;
    
    return (
      <aside 
        className={`${styles.sidebar} ${showExpanded ? styles.sidebarExpanded : ''} ${isPinned ? styles.sidebarPinned : ''}`}
        onMouseEnter={() => !isPinned && setIsExpanded(true)}
        onMouseLeave={() => !isPinned && setIsExpanded(false)}
      >
        {/* Perfil del usuario - Ahora es la primera sección */}
        <div className={styles.sidebarProfile}>
          <div className={styles.profileAvatar}>
            {showExpanded ? (
              profile?.coupleNames?.charAt(0)?.toUpperCase() || 'U'
            ) : (
              <User size={16} />
            )}
          </div>
          {showExpanded && (
            <div className={styles.profileInfo}>
              <h3 className={styles.profileName}>{profile?.coupleNames || 'Usuario'}</h3>
              <p className={styles.profileEmail}>
                <Mail size={10} />
                <span>{profile?.email || 'email@ejemplo.com'}</span>
              </p>
              {profile?.eventDate && (
                <p className={styles.profileDate}>
                  <Calendar size={10} />
                  <span>{profile.eventDate}</span>
                </p>
              )}
            </div>
          )}
          {/* Botón para fijar sidebar */}
          {showExpanded && (
            <button 
              className={`${styles.pinButton} ${isPinned ? styles.pinButtonActive : ''}`}
              onClick={togglePin}
              title={isPinned ? 'Contraer sidebar' : 'Fijar sidebar'}
            >
              {isPinned ? <ChevronLeft size={14} /> : <Menu size={14} />}
            </button>
          )}
        </div>

        {/* Navegación */}
        <nav className={styles.sidebarNav}>
          <button 
            className={`${styles.navItem} ${activeSection === 'matches' ? styles.navItemActive : ''}`}
            onClick={() => onSectionChange('matches')}
            title={!showExpanded ? 'Mis Matches' : undefined}
          >
            <Sparkles size={18} />
            {showExpanded && <span>Mis Matches</span>}
            {pendingMatchesCount > 0 && (
              <span className={`${styles.navBadge} ${!showExpanded ? styles.navBadgeCompact : ''}`}>
                {pendingMatchesCount}
              </span>
            )}
          </button>
          
          <button 
            className={`${styles.navItem} ${activeSection === 'surveys' ? styles.navItemActive : ''}`}
            onClick={() => onSectionChange('surveys')}
            title={!showExpanded ? 'Mini Encuestas' : undefined}
          >
            <FileText size={18} />
            {showExpanded && <span>Encuestas</span>}
            {profile?.priorityCategories && showExpanded && (
              <span className={styles.navBadge}>
                {completedSurveysCount}/{profile.priorityCategories.length}
              </span>
            )}
          </button>
          
          <button 
            className={`${styles.navItem} ${activeSection === 'profile' ? styles.navItemActive : ''}`}
            onClick={() => onSectionChange('profile')}
            title={!showExpanded ? 'Mi Perfil' : undefined}
          >
            <User size={18} />
            {showExpanded && <span>Mi Perfil</span>}
          </button>
        </nav>

        {/* Stats rápidos - Solo visible cuando está expandido */}
        {showExpanded && (
          <div className={styles.sidebarStats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{matchesCount}</span>
              <span className={styles.statLabel}>Matches</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statValue}>{approvedCount}</span>
              <span className={styles.statLabel}>Aprobados</span>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className={styles.sidebarFooter}>
          <button 
            onClick={onLogout} 
            className={styles.logoutButton}
            title={!showExpanded ? 'Cerrar sesión' : undefined}
          >
            <LogOut size={16} />
            {showExpanded && <span>Salir</span>}
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
    <aside 
      className={`${styles.sidebar} ${showExpanded ? styles.sidebarExpanded : ''} ${isPinned ? styles.sidebarPinned : ''}`}
      onMouseEnter={() => !isPinned && setIsExpanded(true)}
      onMouseLeave={() => !isPinned && setIsExpanded(false)}
    >
      {/* Perfil del proveedor - Ahora es la primera sección */}
      <div className={styles.sidebarProfile}>
        <div className={styles.profileAvatar}>
          {showExpanded ? (
            profile?.providerName?.charAt(0)?.toUpperCase() || 'P'
          ) : (
            categoryIcon || <User size={16} />
          )}
        </div>
        {showExpanded && (
          <div className={styles.profileInfo}>
            <h3 className={styles.profileName}>{profile?.providerName || 'Proveedor'}</h3>
            <p className={styles.profileEmail}>
              <Mail size={10} />
              <span>{profile?.email || 'email@ejemplo.com'}</span>
            </p>
            <div className={`${styles.statusBadge} ${styles[`status${profile?.status?.charAt(0).toUpperCase()}${profile?.status?.slice(1)}`]}`}>
              {profile?.status === 'active' ? 'Activo' : 
               profile?.status === 'pending' ? 'Pendiente' : 'Cerrado'}
            </div>
          </div>
        )}
        {showExpanded && (
          <button 
            className={`${styles.pinButton} ${isPinned ? styles.pinButtonActive : ''}`}
            onClick={togglePin}
            title={isPinned ? 'Contraer sidebar' : 'Fijar sidebar'}
          >
            {isPinned ? <ChevronLeft size={14} /> : <Menu size={14} />}
          </button>
        )}
      </div>

      {/* Navegación */}
      <nav className={styles.sidebarNav}>
        <button 
          className={`${styles.navItem} ${activeSection === 'overview' ? styles.navItemActive : ''}`}
          onClick={() => onSectionChange('overview')}
          title={!showExpanded ? 'Resumen' : undefined}
        >
          <BarChart3 size={18} />
          {showExpanded && <span>Resumen</span>}
        </button>
        
        <button 
          className={`${styles.navItem} ${activeSection === 'leads' ? styles.navItemActive : ''}`}
          onClick={() => onSectionChange('leads')}
          title={!showExpanded ? 'Mis Leads' : undefined}
        >
          <Inbox size={18} />
          {showExpanded && <span>Mis Leads</span>}
          {pendingLeadsCount > 0 && (
            <span className={`${styles.navBadge} ${!showExpanded ? styles.navBadgeCompact : ''}`}>
              {pendingLeadsCount}
            </span>
          )}
        </button>

        <button 
          className={`${styles.navItem} ${activeSection === 'surveys' ? styles.navItemActive : ''}`}
          onClick={() => onSectionChange('surveys')}
          title={!showExpanded ? 'Encuestas' : undefined}
        >
          <FileText size={18} />
          {showExpanded && <span>Encuestas</span>}
          {profile?.categories && showExpanded && (
            <span className={styles.navBadge}>
              {completedSurveysCount}/{profile.categories.length}
            </span>
          )}
        </button>

        <button 
          className={`${styles.navItem} ${activeSection === 'portfolio' ? styles.navItemActive : ''}`}
          onClick={() => onSectionChange('portfolio')}
          title={!showExpanded ? 'Portafolio' : undefined}
        >
          <Image size={18} />
          {showExpanded && <span>Portafolio</span>}
        </button>
        
        <button 
          className={`${styles.navItem} ${activeSection === 'profile' ? styles.navItemActive : ''}`}
          onClick={() => onSectionChange('profile')}
          title={!showExpanded ? 'Mi Perfil' : undefined}
        >
          <User size={18} />
          {showExpanded && <span>Mi Perfil</span>}
        </button>
      </nav>

      {/* Leads disponibles - Solo visible cuando está expandido */}
      {showExpanded && (
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
      )}

      {/* Logout */}
      <div className={styles.sidebarFooter}>
        <button 
          onClick={onLogout} 
          className={styles.logoutButton}
          title={!showExpanded ? 'Cerrar sesión' : undefined}
        >
          <LogOut size={16} />
          {showExpanded && <span>Salir</span>}
        </button>
      </div>
    </aside>
  );
}
