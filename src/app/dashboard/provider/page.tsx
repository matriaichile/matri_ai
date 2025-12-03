'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Clock, 
  CheckCircle, 
  XCircle,
  Users,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  DollarSign,
  MapPin,
  Star,
  Edit3,
  Eye,
  BarChart3,
  Inbox,
  ExternalLink,
  Camera,
  Music,
  Utensils,
  Building2,
  Video,
  Flower2,
  ClipboardList,
  Palette,
  Instagram,
  Globe,
  AlertCircle
} from 'lucide-react';
import { useAuthStore, ProviderProfile } from '@/store/authStore';
import { logout } from '@/lib/firebase/auth';
import { PROVIDER_CATEGORIES, REGIONS, PRICE_RANGES_PROVIDER, SERVICE_STYLES } from '@/store/wizardStore';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Sidebar, DashboardHeader, DashboardLayout, EmptyState, LoadingState } from '@/components/dashboard';
import styles from './page.module.css';

// Interfaz para los leads
interface Lead {
  id: string;
  userId: string;
  category: string;
  matchScore: number;
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
  userInfo: {
    coupleNames: string;
    eventDate: string;
    budget: string;
    region: string;
    email: string;
    phone: string;
  };
  createdAt: Date;
}

// Iconos por categoría
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  photography: <Camera size={18} />,
  video: <Video size={18} />,
  dj: <Music size={18} />,
  catering: <Utensils size={18} />,
  venue: <Building2 size={18} />,
  decoration: <Flower2 size={18} />,
  wedding_planner: <ClipboardList size={18} />,
  makeup: <Palette size={18} />,
};

// Labels de presupuesto
const BUDGET_LABELS: Record<string, string> = {
  'under_5m': 'Menos de $5M',
  '5m_10m': '$5M - $10M',
  '10m_15m': '$10M - $15M',
  '15m_20m': '$15M - $20M',
  '20m_30m': '$20M - $30M',
  '30m_50m': '$30M - $50M',
  'over_50m': 'Más de $50M',
};

/**
 * Dashboard del proveedor.
 * Diseño elegante y minimalista con sidebar.
 */
export default function ProviderDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, userProfile, userType, isLoading, firebaseUser } = useAuthStore();
  const [activeSection, setActiveSection] = useState<'overview' | 'leads' | 'profile'>('overview');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

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

  // Cargar leads del proveedor
  useEffect(() => {
    const loadLeads = async () => {
      if (!firebaseUser?.uid) return;

      try {
        setLoadingLeads(true);
        
        const leadsRef = collection(db, 'leads');
        const q = query(
          leadsRef, 
          where('providerId', '==', firebaseUser.uid),
          orderBy('matchScore', 'desc')
        );
        const snapshot = await getDocs(q);
        
        const leadsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Lead[];

        setLeads(leadsData);
      } catch (error) {
        console.error('Error cargando leads:', error);
      } finally {
        setLoadingLeads(false);
      }
    };

    loadLeads();
  }, [firebaseUser?.uid]);

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
  const getPriceLabel = (id: string) => PRICE_RANGES_PROVIDER.find((p) => p.id === id)?.label || id;
  const getStyleLabel = (id: string) => SERVICE_STYLES.find((s) => s.id === id)?.label || id;

  if (isLoading) {
    return <LoadingState message="Cargando tu dashboard..." fullScreen />;
  }

  const profile = userProfile as ProviderProfile | null;
  const isPending = profile?.status === 'pending';
  const isClosed = profile?.status === 'closed';

  // Estadísticas
  const totalLeads = leads.length;
  const pendingLeads = leads.filter(l => l.status === 'pending').length;
  const approvedLeads = leads.filter(l => l.status === 'approved').length;
  const matchRate = totalLeads > 0 ? Math.round((approvedLeads / totalLeads) * 100) : 0;

  // Configuración del header según la sección activa
  const headerConfig = {
    overview: { title: 'Resumen', subtitle: 'Vista general de tu rendimiento' },
    leads: { title: 'Mis Leads', subtitle: 'Parejas interesadas en tus servicios' },
    profile: { title: 'Mi Perfil', subtitle: 'Información de tu negocio' },
  };

  return (
    <DashboardLayout
      sidebar={
        <Sidebar
          variant="provider"
          profile={profile}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onLogout={handleLogout}
          pendingLeadsCount={pendingLeads}
          categoryIcon={profile?.categories?.[0] ? CATEGORY_ICONS[profile.categories[0]] : undefined}
        />
      }
    >
      {/* Banner de estado */}
      {isPending && (
        <div className={styles.statusBanner}>
          <Clock size={20} />
          <div className={styles.statusBannerContent}>
            <h3>Tu cuenta está en revisión</h3>
            <p>Estamos verificando tu perfil. Te notificaremos cuando esté activa.</p>
          </div>
        </div>
      )}

      {isClosed && (
        <div className={`${styles.statusBanner} ${styles.statusBannerClosed}`}>
          <AlertCircle size={20} />
          <div className={styles.statusBannerContent}>
            <h3>Tu cuenta está cerrada</h3>
            <p>Contacta al administrador si deseas reactivar tu cuenta.</p>
          </div>
        </div>
      )}

      <DashboardHeader
        title={headerConfig[activeSection].title}
        subtitle={headerConfig[activeSection].subtitle}
        userName={profile?.providerName}
        showUserBadge
      />

      <div className={styles.content}>
        {/* Sección Overview */}
        {activeSection === 'overview' && (
          <div className={styles.overviewSection}>
            {/* Stats Grid */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Users size={24} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{totalLeads}</span>
                  <span className={styles.statLabel}>Leads totales</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.statIconPending}`}>
                  <Clock size={24} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{pendingLeads}</span>
                  <span className={styles.statLabel}>Pendientes</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>
                  <CheckCircle size={24} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{approvedLeads}</span>
                  <span className={styles.statLabel}>Aprobados</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.statIconTrend}`}>
                  <TrendingUp size={24} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{matchRate}%</span>
                  <span className={styles.statLabel}>Tasa de éxito</span>
                </div>
              </div>
            </div>

            {/* Leads recientes */}
            <div className={styles.recentSection}>
              <div className={styles.sectionHeader}>
                <h2>Leads recientes</h2>
                <button 
                  className={styles.viewAllButton}
                  onClick={() => setActiveSection('leads')}
                >
                  <span>Ver todos</span>
                  <ExternalLink size={14} />
                </button>
              </div>

              {loadingLeads ? (
                <LoadingState message="Cargando leads..." />
              ) : leads.length === 0 ? (
                <EmptyState
                  icon={<Inbox size={48} />}
                  title="Aún no tienes leads"
                  description="Cuando las parejas te seleccionen, aparecerán aquí"
                />
              ) : (
                <div className={styles.leadsPreview}>
                  {leads.slice(0, 3).map((lead) => (
                    <div key={lead.id} className={styles.leadPreviewCard}>
                      <div className={styles.leadPreviewHeader}>
                        <h4>{lead.userInfo.coupleNames}</h4>
                        <span className={styles.matchScore}>
                          <Star size={12} />
                          <span>{lead.matchScore}%</span>
                        </span>
                      </div>
                      <div className={styles.leadPreviewMeta}>
                        <span>
                          <Calendar size={12} />
                          <span>{lead.userInfo.eventDate}</span>
                        </span>
                        <span>
                          <MapPin size={12} />
                          <span>{getRegionLabel(lead.userInfo.region)}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick profile */}
            <div className={styles.quickProfile}>
              <div className={styles.sectionHeader}>
                <h2>Tu perfil</h2>
                <button 
                  className={styles.editButton}
                  onClick={() => setActiveSection('profile')}
                >
                  <Edit3 size={14} />
                  <span>Editar</span>
                </button>
              </div>

              <div className={styles.profilePreview}>
                <div className={styles.profilePreviewItem}>
                  <span className={styles.previewLabel}>Categorías</span>
                  <div className={styles.categoryTags}>
                    {profile?.categories?.map((cat) => (
                      <span key={cat} className={styles.categoryTag}>
                        {CATEGORY_ICONS[cat]}
                        <span>{getCategoryLabel(cat)}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className={styles.profilePreviewItem}>
                  <span className={styles.previewLabel}>Rango de precios</span>
                  <span className={styles.previewValue}>{getPriceLabel(profile?.priceRange || '')}</span>
                </div>
                <div className={styles.profilePreviewItem}>
                  <span className={styles.previewLabel}>Región</span>
                  <span className={styles.previewValue}>{getRegionLabel(profile?.workRegion || '')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sección Leads */}
        {activeSection === 'leads' && (
          <div className={styles.leadsSection}>
            {loadingLeads ? (
              <LoadingState message="Cargando leads..." />
            ) : leads.length === 0 ? (
              <EmptyState
                icon={<Inbox size={48} />}
                title="Aún no tienes leads"
                description="Cuando las parejas te seleccionen, aparecerán aquí"
              />
            ) : (
              <div className={styles.leadsGrid}>
                {leads.map((lead) => (
                  <div 
                    key={lead.id} 
                    className={styles.leadCard}
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className={styles.leadCardHeader}>
                      <div className={styles.leadCardTitle}>
                        <h3>{lead.userInfo.coupleNames}</h3>
                        <span className={`${styles.leadStatusBadge} ${styles[`leadStatus${lead.status.charAt(0).toUpperCase()}${lead.status.slice(1)}`]}`}>
                          {lead.status === 'pending' ? 'Pendiente' : 
                           lead.status === 'approved' ? 'Aprobado' : 
                           lead.status === 'contacted' ? 'Contactado' : 'Rechazado'}
                        </span>
                      </div>
                      <div className={styles.leadMatchScore}>
                        <Star size={16} />
                        <span>{lead.matchScore}%</span>
                      </div>
                    </div>

                    <div className={styles.leadCardBody}>
                      <div className={styles.leadDetail}>
                        <Calendar size={16} />
                        <span>{lead.userInfo.eventDate}</span>
                      </div>
                      <div className={styles.leadDetail}>
                        <MapPin size={16} />
                        <span>{getRegionLabel(lead.userInfo.region)}</span>
                      </div>
                      <div className={styles.leadDetail}>
                        <DollarSign size={16} />
                        <span>{BUDGET_LABELS[lead.userInfo.budget] || lead.userInfo.budget}</span>
                      </div>
                    </div>

                    <div className={styles.leadCardFooter}>
                      <div className={styles.leadContact}>
                        <a href={`mailto:${lead.userInfo.email}`} className={styles.contactButton}>
                          <Mail size={14} />
                        </a>
                        <a href={`tel:${lead.userInfo.phone}`} className={styles.contactButton}>
                          <Phone size={14} />
                        </a>
                      </div>
                      <button className={styles.viewLeadButton}>
                        <Eye size={14} />
                        <span>Ver detalles</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sección Perfil */}
        {activeSection === 'profile' && (
          <div className={styles.profileSection}>
            <div className={styles.profileGrid}>
              {/* Información básica */}
              <div className={styles.profileCard}>
                <h3 className={styles.profileCardTitle}>
                  <User size={20} />
                  <span>Información básica</span>
                </h3>
                <div className={styles.profileCardContent}>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Nombre del negocio</span>
                    <span className={styles.fieldValue}>{profile?.providerName}</span>
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Email</span>
                    <span className={styles.fieldValue}>{profile?.email}</span>
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Teléfono</span>
                    <span className={styles.fieldValue}>{profile?.phone || 'No registrado'}</span>
                  </div>
                </div>
              </div>

              {/* Servicios */}
              <div className={styles.profileCard}>
                <h3 className={styles.profileCardTitle}>
                  <Star size={20} />
                  <span>Servicios</span>
                </h3>
                <div className={styles.profileCardContent}>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Categorías</span>
                    <div className={styles.tagsList}>
                      {profile?.categories?.map((cat) => (
                        <span key={cat} className={styles.tag}>
                          {CATEGORY_ICONS[cat]}
                          <span>{getCategoryLabel(cat)}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Estilo de servicio</span>
                    <span className={styles.fieldValue}>{getStyleLabel(profile?.serviceStyle || '')}</span>
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Rango de precios</span>
                    <span className={styles.fieldValue}>{getPriceLabel(profile?.priceRange || '')}</span>
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div className={styles.profileCard}>
                <h3 className={styles.profileCardTitle}>
                  <MapPin size={20} />
                  <span>Ubicación</span>
                </h3>
                <div className={styles.profileCardContent}>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Región de trabajo</span>
                    <span className={styles.fieldValue}>{getRegionLabel(profile?.workRegion || '')}</span>
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Acepta fuera de zona</span>
                    <span className={styles.fieldValue}>
                      {profile?.acceptsOutsideZone ? 'Sí' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Redes sociales */}
              <div className={styles.profileCard}>
                <h3 className={styles.profileCardTitle}>
                  <Globe size={20} />
                  <span>Presencia online</span>
                </h3>
                <div className={styles.profileCardContent}>
                  {profile?.website && (
                    <div className={styles.socialLink}>
                      <Globe size={16} />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer">
                        {profile.website}
                      </a>
                    </div>
                  )}
                  {profile?.instagram && (
                    <div className={styles.socialLink}>
                      <Instagram size={16} />
                      <span>{profile.instagram}</span>
                    </div>
                  )}
                  {!profile?.website && !profile?.instagram && (
                    <p className={styles.noData}>No hay redes configuradas</p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div className={`${styles.profileCard} ${styles.profileCardFull}`}>
                <h3 className={styles.profileCardTitle}>
                  <Edit3 size={20} />
                  <span>Descripción</span>
                </h3>
                <div className={styles.profileCardContent}>
                  <p className={styles.descriptionText}>
                    {profile?.description || 'No has agregado una descripción aún.'}
                  </p>
                </div>
              </div>

              {/* Estadísticas de cuenta */}
              <div className={styles.profileCard}>
                <h3 className={styles.profileCardTitle}>
                  <BarChart3 size={20} />
                  <span>Estado de cuenta</span>
                </h3>
                <div className={styles.profileCardContent}>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Estado</span>
                    <span className={`${styles.fieldValue} ${styles.statusText} ${styles[`status${profile?.status}`]}`}>
                      {profile?.status === 'active' ? 'Activo' : 
                       profile?.status === 'pending' ? 'Pendiente de aprobación' : 'Cerrado'}
                    </span>
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Límite de leads</span>
                    <span className={styles.fieldValue}>{profile?.leadLimit || 10}</span>
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Leads utilizados</span>
                    <span className={styles.fieldValue}>{profile?.leadsUsed || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de lead seleccionado */}
      {selectedLead && (
        <div className={styles.modalOverlay} onClick={() => setSelectedLead(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{selectedLead.userInfo.coupleNames}</h2>
              <button 
                className={styles.modalClose}
                onClick={() => setSelectedLead(null)}
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalSection}>
                <h4>Información del evento</h4>
                <div className={styles.modalGrid}>
                  <div className={styles.modalField}>
                    <Calendar size={16} />
                    <div>
                      <span className={styles.modalLabel}>Fecha</span>
                      <span className={styles.modalValue}>{selectedLead.userInfo.eventDate}</span>
                    </div>
                  </div>
                  <div className={styles.modalField}>
                    <MapPin size={16} />
                    <div>
                      <span className={styles.modalLabel}>Región</span>
                      <span className={styles.modalValue}>{getRegionLabel(selectedLead.userInfo.region)}</span>
                    </div>
                  </div>
                  <div className={styles.modalField}>
                    <DollarSign size={16} />
                    <div>
                      <span className={styles.modalLabel}>Presupuesto</span>
                      <span className={styles.modalValue}>{BUDGET_LABELS[selectedLead.userInfo.budget]}</span>
                    </div>
                  </div>
                  <div className={styles.modalField}>
                    <Star size={16} />
                    <div>
                      <span className={styles.modalLabel}>Match Score</span>
                      <span className={styles.modalValue}>{selectedLead.matchScore}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalSection}>
                <h4>Contacto</h4>
                <div className={styles.modalActions}>
                  <a 
                    href={`mailto:${selectedLead.userInfo.email}`}
                    className={styles.modalActionButton}
                  >
                    <Mail size={18} />
                    <span>{selectedLead.userInfo.email}</span>
                  </a>
                  <a 
                    href={`tel:${selectedLead.userInfo.phone}`}
                    className={styles.modalActionButton}
                  >
                    <Phone size={18} />
                    <span>{selectedLead.userInfo.phone}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
