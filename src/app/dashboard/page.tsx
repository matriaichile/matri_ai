'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Check,
  X,
  ChevronRight,
  Sparkles,
  Camera,
  Music,
  Utensils,
  Building2,
  Video,
  Flower2,
  ClipboardList,
  Palette,
  FileText,
  ExternalLink,
  MapPin,
  DollarSign,
  Star,
  Calendar,
  Heart,
  Search,
  Mail
} from 'lucide-react';
import { useAuthStore, UserProfile } from '@/store/authStore';
import { logout } from '@/lib/firebase/auth';
import { BUDGET_RANGES, GUEST_COUNTS, REGIONS, PRIORITY_CATEGORIES } from '@/store/wizardStore';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Sidebar, DashboardHeader, DashboardLayout, EmptyState, LoadingState } from '@/components/dashboard';
import styles from './page.module.css';

// Interfaz para los leads/matches
interface LeadMatch {
  id: string;
  providerId: string;
  category: string;
  matchScore: number;
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
  providerInfo: {
    providerName: string;
    categories: string[];
    priceRange: string;
  };
}

// Interfaz para proveedores
interface Provider {
  id: string;
  providerName: string;
  categories: string[];
  serviceStyle: string;
  priceRange: string;
  workRegion: string;
  description: string;
  instagram: string;
  website: string;
  portfolioImages: string[];
}

// Iconos por categoría
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  photography: <Camera size={20} />,
  video: <Video size={20} />,
  dj: <Music size={20} />,
  catering: <Utensils size={20} />,
  venue: <Building2 size={20} />,
  decoration: <Flower2 size={20} />,
  wedding_planner: <ClipboardList size={20} />,
  makeup: <Palette size={20} />,
};

// Imágenes placeholder para categorías
const CATEGORY_IMAGES: Record<string, string> = {
  photography: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400',
  video: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400',
  dj: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400',
  catering: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400',
  venue: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400',
  decoration: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=400',
  wedding_planner: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400',
  makeup: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400',
};

// Mini encuestas por categoría
const MINI_SURVEYS: Record<string, { title: string; questions: string[] }> = {
  photography: {
    title: 'Fotografía',
    questions: [
      '¿Qué estilo fotográfico prefieres?',
      '¿Cuántas horas de cobertura necesitas?',
      '¿Necesitas sesión pre-boda?',
      '¿Formato de entrega preferido?',
    ],
  },
  video: {
    title: 'Videografía',
    questions: [
      '¿Prefieres estilo documental o cinemático?',
      '¿Necesitas segundo camarógrafo?',
      '¿Qué duración de video final esperas?',
      '¿Necesitas highlight para redes?',
    ],
  },
  dj: {
    title: 'DJ/VJ',
    questions: [
      '¿Qué géneros musicales prefieres?',
      '¿Necesitas equipos de iluminación?',
      '¿Cuántas horas de música?',
      '¿Requieres animación?',
    ],
  },
  catering: {
    title: 'Banquetería',
    questions: [
      '¿Tipo de servicio preferido?',
      '¿Hay restricciones alimentarias?',
      '¿Incluir bebestibles?',
      '¿Necesitas degustación previa?',
    ],
  },
  venue: {
    title: 'Centro de Eventos',
    questions: [
      '¿Interior o exterior?',
      '¿Capacidad mínima requerida?',
      '¿Necesitas exclusividad del lugar?',
      '¿Requieres estacionamiento?',
    ],
  },
  decoration: {
    title: 'Decoración',
    questions: [
      '¿Qué estilo de decoración buscas?',
      '¿Tipo de flores preferidas?',
      '¿Incluir ramo de novia?',
      '¿Decoración de mesas incluida?',
    ],
  },
  wedding_planner: {
    title: 'Wedding Planner',
    questions: [
      '¿Coordinación total o parcial?',
      '¿Necesitas ayuda con proveedores?',
      '¿Coordinación el día del evento?',
      '¿Gestión de timeline?',
    ],
  },
  makeup: {
    title: 'Maquillaje & Peinado',
    questions: [
      '¿Prueba de maquillaje incluida?',
      '¿Servicio para cortejo?',
      '¿Estilo natural o dramático?',
      '¿Necesitas retoque durante el evento?',
    ],
  },
};

/**
 * Dashboard principal del usuario (novios).
 * Diseño elegante y minimalista con sidebar.
 */
export default function UserDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, userProfile, userType, isLoading, firebaseUser } = useAuthStore();
  const [activeSection, setActiveSection] = useState<'matches' | 'surveys' | 'profile'>('matches');
  const [matches, setMatches] = useState<LeadMatch[]>([]);
  const [providers, setProviders] = useState<Record<string, Provider>>({});
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null);
  const [completedSurveys, setCompletedSurveys] = useState<string[]>([]);

  // Verificar autenticación y tipo de usuario
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated()) {
        router.push('/login');
      } else if (userType === 'provider') {
        router.push('/dashboard/provider');
      }
    }
  }, [isAuthenticated, userType, isLoading, router]);

  // Cargar matches del usuario
  useEffect(() => {
    const loadMatches = async () => {
      if (!firebaseUser?.uid) return;

      try {
        setLoadingMatches(true);
        
        const leadsRef = collection(db, 'leads');
        const q = query(
          leadsRef, 
          where('userId', '==', firebaseUser.uid),
          orderBy('matchScore', 'desc')
        );
        const snapshot = await getDocs(q);
        
        const leadsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as LeadMatch[];

        setMatches(leadsData);

        // Cargar información de proveedores
        const providerIds = [...new Set(leadsData.map(l => l.providerId))];
        const providersData: Record<string, Provider> = {};

        for (const providerId of providerIds) {
          const providerRef = collection(db, 'providers');
          const providerQuery = query(providerRef, where('id', '==', providerId));
          const providerSnapshot = await getDocs(providerQuery);
          
          if (!providerSnapshot.empty) {
            const providerDoc = providerSnapshot.docs[0];
            providersData[providerId] = {
              id: providerDoc.id,
              ...providerDoc.data()
            } as Provider;
          }
        }

        setProviders(providersData);
      } catch (error) {
        console.error('Error cargando matches:', error);
      } finally {
        setLoadingMatches(false);
      }
    };

    loadMatches();
  }, [firebaseUser?.uid]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleApproveMatch = (leadId: string) => {
    setMatches(prev => prev.map(m => 
      m.id === leadId ? { ...m, status: 'approved' as const } : m
    ));
  };

  const handleRejectMatch = (leadId: string) => {
    setMatches(prev => prev.map(m => 
      m.id === leadId ? { ...m, status: 'rejected' as const } : m
    ));
  };

  const handleCompleteSurvey = (categoryId: string) => {
    setCompletedSurveys(prev => [...prev, categoryId]);
    setSelectedSurvey(null);
  };

  // Obtener labels
  const getBudgetLabel = (id: string) => BUDGET_RANGES.find((b) => b.id === id)?.label || id;
  const getGuestLabel = (id: string) => GUEST_COUNTS.find((g) => g.id === id)?.label || id;
  const getRegionLabel = (id: string) => REGIONS.find((r) => r.id === id)?.label || id;
  const getCategoryLabel = (id: string) => PRIORITY_CATEGORIES.find((c) => c.id === id)?.label || id;
  const getPriceLabel = (id: string) => {
    const labels: Record<string, string> = {
      budget: 'Económico',
      mid: 'Rango Medio',
      premium: 'Premium',
      luxury: 'Lujo',
    };
    return labels[id] || id;
  };

  if (isLoading) {
    return <LoadingState message="Cargando tu dashboard..." fullScreen />;
  }

  const profile = userProfile as UserProfile | null;
  const pendingMatches = matches.filter(m => m.status === 'pending');
  const approvedMatches = matches.filter(m => m.status === 'approved');

  // Configuración del header según la sección activa
  const headerConfig = {
    matches: { title: 'Tus Matches', subtitle: 'Proveedores recomendados para tu boda' },
    surveys: { title: 'Mini Encuestas', subtitle: 'Personaliza tus preferencias por categoría' },
    profile: { title: 'Tu Perfil', subtitle: 'Información de tu evento' },
  };

  return (
    <DashboardLayout
      sidebar={
        <Sidebar
          variant="user"
          profile={profile}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onLogout={handleLogout}
          pendingMatchesCount={pendingMatches.length}
          completedSurveysCount={completedSurveys.length}
          matchesCount={matches.length}
          approvedCount={approvedMatches.length}
        />
      }
    >
      <DashboardHeader
        title={headerConfig[activeSection].title}
        subtitle={headerConfig[activeSection].subtitle}
      />

      <div className={styles.content}>
        {/* Sección de Matches */}
        {activeSection === 'matches' && (
          <div className={styles.matchesSection}>
            {loadingMatches ? (
              <LoadingState message="Buscando los mejores proveedores..." />
            ) : matches.length === 0 ? (
              <EmptyState
                icon={<Sparkles size={48} />}
                title="Aún no tienes matches"
                description="Completa las mini encuestas para obtener recomendaciones personalizadas"
                action={{
                  label: 'Completar encuestas',
                  onClick: () => setActiveSection('surveys'),
                }}
              />
            ) : (
              <div className={styles.matchesGrid}>
                {matches.map((match) => {
                  const provider = providers[match.providerId];
                  const categoryImage = CATEGORY_IMAGES[match.category] || CATEGORY_IMAGES.photography;
                  
                  return (
                    <div 
                      key={match.id} 
                      className={`${styles.matchCard} ${match.status !== 'pending' ? styles.matchCardProcessed : ''}`}
                    >
                      <div className={styles.matchImage}>
                        <img 
                          src={categoryImage} 
                          alt={match.providerInfo.providerName}
                        />
                        <div className={styles.matchScore}>
                          <Star size={14} />
                          <span>{match.matchScore}%</span>
                        </div>
                        <div className={styles.matchCategory}>
                          {CATEGORY_ICONS[match.category]}
                          <span>{getCategoryLabel(match.category)}</span>
                        </div>
                      </div>

                      <div className={styles.matchInfo}>
                        <h3 className={styles.matchName}>
                          {match.providerInfo.providerName}
                        </h3>
                        
                        <p className={styles.matchDescription}>
                          {provider?.description || 'Proveedor profesional para tu evento.'}
                        </p>

                        <div className={styles.matchMeta}>
                          <span className={styles.matchMetaItem}>
                            <MapPin size={14} />
                            <span>{provider?.workRegion ? getRegionLabel(provider.workRegion) : 'Chile'}</span>
                          </span>
                          <span className={styles.matchMetaItem}>
                            <DollarSign size={14} />
                            <span>{getPriceLabel(match.providerInfo.priceRange)}</span>
                          </span>
                        </div>

                        {match.status !== 'pending' && (
                          <div className={`${styles.statusBadge} ${styles[`status${match.status.charAt(0).toUpperCase() + match.status.slice(1)}`]}`}>
                            {match.status === 'approved' && <Check size={14} />}
                            {match.status === 'rejected' && <X size={14} />}
                            <span>
                              {match.status === 'approved' ? 'Aprobado' : 
                               match.status === 'rejected' ? 'Rechazado' : 'Contactado'}
                            </span>
                          </div>
                        )}

                        {match.status === 'pending' && (
                          <div className={styles.matchActions}>
                            <button 
                              className={styles.rejectButton}
                              onClick={() => handleRejectMatch(match.id)}
                            >
                              <X size={16} />
                            </button>
                            <button 
                              className={styles.approveButton}
                              onClick={() => handleApproveMatch(match.id)}
                            >
                              <Check size={16} />
                              <span>Aprobar</span>
                            </button>
                            <button className={styles.detailsButton}>
                              <ExternalLink size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Sección de Mini Encuestas */}
        {activeSection === 'surveys' && (
          <div className={styles.surveysSection}>
            {selectedSurvey ? (
              <div className={styles.surveyDetail}>
                <button 
                  className={styles.backButton}
                  onClick={() => setSelectedSurvey(null)}
                >
                  <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
                  <span>Volver</span>
                </button>

                <div className={styles.surveyCard}>
                  <div className={styles.surveyCardHeader}>
                    <div className={styles.surveyIcon}>
                      {CATEGORY_ICONS[selectedSurvey]}
                    </div>
                    <h2>{MINI_SURVEYS[selectedSurvey]?.title}</h2>
                  </div>

                  <div className={styles.surveyQuestions}>
                    {MINI_SURVEYS[selectedSurvey]?.questions.map((question, index) => (
                      <div key={index} className={styles.surveyQuestion}>
                        <label>{question}</label>
                        <input 
                          type="text" 
                          placeholder="Tu respuesta..."
                          className={styles.surveyInput}
                        />
                      </div>
                    ))}
                  </div>

                  <button 
                    className={styles.primaryButton}
                    onClick={() => handleCompleteSurvey(selectedSurvey)}
                  >
                    <Check size={18} />
                    <span>Guardar preferencias</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.surveysGrid}>
                {profile?.priorityCategories?.map((category) => {
                  const isCompleted = completedSurveys.includes(category);
                  const survey = MINI_SURVEYS[category];
                  
                  return (
                    <div 
                      key={category} 
                      className={`${styles.surveyItem} ${isCompleted ? styles.surveyItemCompleted : ''}`}
                      onClick={() => !isCompleted && setSelectedSurvey(category)}
                    >
                      <div className={styles.surveyItemIcon}>
                        {CATEGORY_ICONS[category]}
                      </div>
                      <div className={styles.surveyItemInfo}>
                        <h3>{survey?.title || getCategoryLabel(category)}</h3>
                        <p>{survey?.questions.length || 4} preguntas</p>
                      </div>
                      <div className={styles.surveyItemStatus}>
                        {isCompleted ? (
                          <span className={styles.completedBadge}>
                            <Check size={14} />
                            <span>Completado</span>
                          </span>
                        ) : (
                          <ChevronRight size={20} />
                        )}
                      </div>
                    </div>
                  );
                })}

                {(!profile?.priorityCategories || profile.priorityCategories.length === 0) && (
                  <EmptyState
                    icon={<FileText size={48} />}
                    title="No hay categorías seleccionadas"
                    description="Actualiza tu perfil para seleccionar las categorías de proveedores que necesitas"
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Sección de Perfil */}
        {activeSection === 'profile' && (
          <div className={styles.profileSection}>
            <div className={styles.profileGrid}>
              {/* Información del evento */}
              <div className={styles.profileCard}>
                <h3 className={styles.profileCardTitle}>
                  <Calendar size={20} />
                  <span>Información del Evento</span>
                </h3>
                <div className={styles.profileCardContent}>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Fecha del evento</span>
                    <span className={styles.fieldValue}>
                      {profile?.eventDate || 'Por definir'}
                      {profile?.isDateTentative && <span className={styles.tentativeBadge}>Tentativa</span>}
                    </span>
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Región</span>
                    <span className={styles.fieldValue}>
                      {profile?.region ? getRegionLabel(profile.region) : 'Por definir'}
                    </span>
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Estilo del evento</span>
                    <span className={styles.fieldValue}>{profile?.eventStyle || 'Por definir'}</span>
                  </div>
                </div>
              </div>

              {/* Presupuesto e invitados */}
              <div className={styles.profileCard}>
                <h3 className={styles.profileCardTitle}>
                  <DollarSign size={20} />
                  <span>Presupuesto y Capacidad</span>
                </h3>
                <div className={styles.profileCardContent}>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Presupuesto</span>
                    <span className={styles.fieldValue}>
                      {profile?.budget ? getBudgetLabel(profile.budget) : 'Por definir'}
                    </span>
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Número de invitados</span>
                    <span className={styles.fieldValue}>
                      {profile?.guestCount ? getGuestLabel(profile.guestCount) : 'Por definir'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tipo de ceremonia */}
              <div className={styles.profileCard}>
                <h3 className={styles.profileCardTitle}>
                  <Heart size={20} />
                  <span>Ceremonia</span>
                </h3>
                <div className={styles.profileCardContent}>
                  <div className={styles.tagsList}>
                    {profile?.ceremonyTypes?.map((type) => (
                      <span key={type} className={styles.tag}>
                        {type === 'civil' ? 'Civil' : 
                         type === 'religious' ? 'Religiosa' : 'Simbólica'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Categorías prioritarias */}
              <div className={styles.profileCard}>
                <h3 className={styles.profileCardTitle}>
                  <Search size={20} />
                  <span>Buscando proveedores de</span>
                </h3>
                <div className={styles.profileCardContent}>
                  <div className={styles.tagsList}>
                    {profile?.priorityCategories?.map((cat) => (
                      <span key={cat} className={styles.tag}>
                        {CATEGORY_ICONS[cat]}
                        <span>{getCategoryLabel(cat)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contacto */}
              <div className={styles.profileCard}>
                <h3 className={styles.profileCardTitle}>
                  <Mail size={20} />
                  <span>Contacto</span>
                </h3>
                <div className={styles.profileCardContent}>
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

              {/* Expectativas */}
              <div className={`${styles.profileCard} ${styles.profileCardFull}`}>
                <h3 className={styles.profileCardTitle}>
                  <Sparkles size={20} />
                  <span>Tus expectativas</span>
                </h3>
                <div className={styles.profileCardContent}>
                  <p className={styles.expectationsText}>
                    {profile?.expectations || 'No has agregado expectativas aún.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
