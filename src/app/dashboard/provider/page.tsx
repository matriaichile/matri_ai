'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  LogOut, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle,
  Users,
  TrendingUp,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';
import { useAuthStore, ProviderProfile } from '@/store/authStore';
import { logout } from '@/lib/firebase/auth';
import { PROVIDER_CATEGORIES, REGIONS } from '@/store/wizardStore';
import styles from './page.module.css';

// Datos mock de leads para simular
const MOCK_LEADS = [
  {
    id: 'lead-1',
    coupleNames: 'María & Juan',
    eventDate: '2025-06-15',
    budget: '15m_20m',
    region: 'rm',
    email: 'maria.juan@email.com',
    phone: '+56 9 1234 5678',
    status: 'pending',
    matchScore: 95,
  },
  {
    id: 'lead-2',
    coupleNames: 'Camila & Pedro',
    eventDate: '2025-08-20',
    budget: '20m_30m',
    region: 'valparaiso',
    email: 'camila.pedro@email.com',
    phone: '+56 9 8765 4321',
    status: 'approved',
    matchScore: 88,
  },
];

/**
 * Dashboard del proveedor.
 * Muestra leads generados y estadísticas.
 */
export default function ProviderDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, userProfile, userType, isLoading, firebaseUser } = useAuthStore();

  // Verificar autenticación y tipo de usuario
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated()) {
        router.push('/login');
      } else if (userType === 'user') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, userType, isLoading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const getCategoryLabel = (id: string) => PROVIDER_CATEGORIES.find((c) => c.id === id)?.label || id;
  const getRegionLabel = (id: string) => REGIONS.find((r) => r.id === id)?.label || id;

  if (isLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
        </div>
      </main>
    );
  }

  const profile = userProfile as ProviderProfile | null;
  const isPending = profile?.status === 'pending';

  return (
    <main className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.logoLink}>
            <Image 
              src="/logo.png" 
              alt="MatriMatch Logo" 
              width={160} 
              height={58}
              className={styles.logo}
            />
          </Link>
          
          <nav className={styles.nav}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                <User size={20} />
              </div>
              <span className={styles.userName}>
                {profile?.providerName || firebaseUser?.email}
              </span>
            </div>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <LogOut size={18} />
              <span>Salir</span>
            </button>
          </nav>
        </div>
      </header>

      <div className={styles.container}>
        {/* Banner de estado pendiente */}
        {isPending && (
          <div className={styles.pendingBanner}>
            <Clock size={20} />
            <div>
              <h3>Tu cuenta está en revisión</h3>
              <p>Estamos verificando tu perfil. Te notificaremos cuando esté activa.</p>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Users size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{MOCK_LEADS.length}</span>
              <span className={styles.statLabel}>Leads totales</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <CheckCircle size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {MOCK_LEADS.filter((l) => l.status === 'approved').length}
              </span>
              <span className={styles.statLabel}>Aprobados</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <TrendingUp size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>92%</span>
              <span className={styles.statLabel}>Tasa de match</span>
            </div>
          </div>
        </div>

        {/* Perfil del proveedor */}
        <div className={styles.profileSection}>
          <h2 className={styles.sectionTitle}>Tu Perfil</h2>
          <div className={styles.profileCard}>
            <div className={styles.profileInfo}>
              <h3>{profile?.providerName}</h3>
              <p>{profile?.description}</p>
              <div className={styles.profileMeta}>
                <span>
                  <strong>Categorías:</strong> {profile?.categories?.map(getCategoryLabel).join(', ')}
                </span>
                <span>
                  <strong>Región:</strong> {profile?.workRegion ? getRegionLabel(profile.workRegion) : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de leads */}
        <div className={styles.leadsSection}>
          <h2 className={styles.sectionTitle}>Tus Leads</h2>
          <div className={styles.leadsList}>
            {MOCK_LEADS.map((lead) => (
              <div key={lead.id} className={styles.leadCard}>
                <div className={styles.leadHeader}>
                  <h3>{lead.coupleNames}</h3>
                  <span className={`${styles.leadStatus} ${styles[`status${lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}`]}`}>
                    {lead.status === 'pending' ? 'Pendiente' : 
                     lead.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                  </span>
                </div>
                <div className={styles.leadDetails}>
                  <span><Calendar size={14} /> {lead.eventDate}</span>
                  <span><Mail size={14} /> {lead.email}</span>
                  <span><Phone size={14} /> {lead.phone}</span>
                </div>
                <div className={styles.leadMatch}>
                  Match: <strong>{lead.matchScore}%</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

