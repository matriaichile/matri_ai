'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Mail,
  ClipboardCheck,
  Edit3,
  Save,
  XCircle,
  Lock,
  Eye,
  RotateCcw,
  Loader2,
  Phone,
  Globe,
  Instagram,
  CheckCircle,
  MapPinned,
  Filter,
  PartyPopper,
  Shirt,
  BadgeCheck,
  Cake,
  Car,
  Send
} from 'lucide-react';
import { useAuthStore, UserProfile, ProviderProfile, CategoryId, ALL_CATEGORIES, PortfolioImage, ProfileImageData } from '@/store/authStore';
import { logout } from '@/lib/firebase/auth';
import { updateUserProfile, updateLeadStatus, rejectLeadWithReason, approveLeadWithMetrics } from '@/lib/firebase/firestore';
import { RejectReasonModal } from '@/components/matches';
import { PortfolioGallery } from '@/components/portfolio';
import { BUDGET_RANGES, GUEST_COUNTS, REGIONS, PRIORITY_CATEGORIES, CEREMONY_TYPES, EVENT_STYLES, PRICE_RANGES_PROVIDER, SERVICE_STYLES } from '@/store/wizardStore';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Sidebar, DashboardHeader, DashboardLayout, EmptyState, LoadingState } from '@/components/dashboard';
import { CATEGORY_INFO, getCategoryInfo, CATEGORY_SURVEYS } from '@/lib/surveys';
import { getMatchCategory, getMatchCategoryStyles, getMatchCategoryStylesCompact, getMatchCategoryStylesLarge } from '@/lib/matching/matchCategories';
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
  // Datos completos del proveedor (cargados al abrir detalles)
  providerDetails?: ProviderProfile;
}

// Interfaz para proveedores
interface Provider {
  id: string;
  providerName: string;
  categories: string[];
  serviceStyle: string;
  priceRange: string;
  workRegion: string;
  acceptsOutsideZone?: boolean;
  description: string;
  instagram: string;
  website: string;
  facebook?: string;
  tiktok?: string;
  email?: string;
  phone?: string;
  portfolioImages: PortfolioImage[];
  profileImage?: ProfileImageData; // Imagen de perfil personalizada
  isVerified?: boolean;
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
  entertainment: <PartyPopper size={20} />,
  dress: <Shirt size={20} />,
  cakes: <Cake size={20} />,
  transport: <Car size={20} />,
  invitations: <Send size={20} />,
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
  entertainment: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
  dress: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=400',
  cakes: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=400',
  transport: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
  invitations: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400',
};


/**
 * Dashboard principal del usuario (novios).
 * Diseño elegante y minimalista con sidebar.
 */
export default function UserDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, userProfile, userType, isLoading, firebaseUser, setUserProfile } = useAuthStore();
  const [activeSection, setActiveSection] = useState<'matches' | 'surveys' | 'profile'>('matches');
  const [matches, setMatches] = useState<LeadMatch[]>([]);
  const [providers, setProviders] = useState<Record<string, Provider>>({});
  const [loadingMatches, setLoadingMatches] = useState(true);
  
  // Estado para edición de perfil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  
  // Estado para el panel de detalles del proveedor
  const [selectedMatch, setSelectedMatch] = useState<LeadMatch | null>(null);
  const [loadingProviderDetails, setLoadingProviderDetails] = useState(false);
  const [processingMatchId, setProcessingMatchId] = useState<string | null>(null);
  
  // Estado para filtro de categoría en matches
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Estado para el modal de rechazo
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [matchToReject, setMatchToReject] = useState<LeadMatch | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);
  
  // Estado para la galería de portafolio (al hacer click en imagen de tarjeta)
  const [galleryProviderId, setGalleryProviderId] = useState<string | null>(null);

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

  // Aprobar match - guarda en la base de datos con métricas
  const handleApproveMatch = async (leadId: string) => {
    try {
      setProcessingMatchId(leadId);
      await approveLeadWithMetrics(leadId);
      setMatches(prev => prev.map(m => 
        m.id === leadId ? { ...m, status: 'approved' as const } : m
      ));
    } catch (error) {
      console.error('Error aprobando match:', error);
    } finally {
      setProcessingMatchId(null);
    }
  };

  // Abrir modal de rechazo - NO rechaza directamente
  const handleRejectClick = (match: LeadMatch) => {
    setMatchToReject(match);
    setRejectModalOpen(true);
  };

  // Confirmar rechazo con motivo
  const handleConfirmReject = async (reason: string, reasonId: string) => {
    if (!matchToReject) return;
    
    try {
      setIsRejecting(true);
      await rejectLeadWithReason(matchToReject.id, reason, reasonId);
      setMatches(prev => prev.map(m => 
        m.id === matchToReject.id ? { ...m, status: 'rejected' as const } : m
      ));
      setRejectModalOpen(false);
      setMatchToReject(null);
    } catch (error) {
      console.error('Error rechazando match:', error);
    } finally {
      setIsRejecting(false);
    }
  };

  // Cerrar modal de rechazo
  const handleCloseRejectModal = () => {
    setRejectModalOpen(false);
    setMatchToReject(null);
  };

  // Revertir estado a pendiente - guarda en la base de datos
  const handleRevertMatch = async (leadId: string) => {
    try {
      setProcessingMatchId(leadId);
      await updateLeadStatus(leadId, 'pending');
      setMatches(prev => prev.map(m => 
        m.id === leadId ? { ...m, status: 'pending' as const } : m
      ));
    } catch (error) {
      console.error('Error revirtiendo match:', error);
    } finally {
      setProcessingMatchId(null);
    }
  };

  // Abrir panel de detalles del proveedor
  const handleViewProviderDetails = async (match: LeadMatch) => {
    setSelectedMatch(match);
    
    // Cargar detalles completos del proveedor si no los tenemos
    if (!match.providerDetails && !providers[match.providerId]?.email) {
      setLoadingProviderDetails(true);
      try {
        const providerDoc = await getDoc(doc(db, 'providers', match.providerId));
        if (providerDoc.exists()) {
          const providerData = providerDoc.data() as Provider;
          
          // Actualizar providers cache
          setProviders(prev => ({
            ...prev,
            [match.providerId]: {
              ...providerData,
              id: providerDoc.id,
            }
          }));
        }
      } catch (error) {
        console.error('Error cargando detalles del proveedor:', error);
      } finally {
        setLoadingProviderDetails(false);
      }
    }
  };

  // Cerrar panel de detalles
  const handleCloseProviderDetails = () => {
    setSelectedMatch(null);
  };

  // Iniciar edición del perfil
  const handleStartEditProfile = () => {
    if (profile) {
      setEditedProfile({
        coupleNames: profile.coupleNames,
        phone: profile.phone,
        eventDate: profile.eventDate,
        isDateTentative: profile.isDateTentative,
        budget: profile.budget,
        guestCount: profile.guestCount,
        region: profile.region,
        ceremonyTypes: profile.ceremonyTypes,
        eventStyle: profile.eventStyle,
        priorityCategories: profile.priorityCategories,
        expectations: profile.expectations,
      });
      setIsEditingProfile(true);
    }
  };

  // Cancelar edición del perfil
  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
    setEditedProfile({});
  };

  // Guardar cambios del perfil
  const handleSaveProfile = async () => {
    if (!firebaseUser?.uid || !editedProfile) return;

    try {
      setIsSavingProfile(true);
      await updateUserProfile(firebaseUser.uid, editedProfile);
      
      // Actualizar el store local
      if (profile) {
        const updatedProfile = { ...profile, ...editedProfile };
        setUserProfile(updatedProfile);
      }
      
      setIsEditingProfile(false);
      setEditedProfile({});
    } catch (error) {
      console.error('Error al guardar perfil:', error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Actualizar campo del perfil editado
  const updateEditedField = (field: keyof UserProfile, value: unknown) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  // Toggle categoría prioritaria
  const togglePriorityCategory = (categoryId: string) => {
    const current = editedProfile.priorityCategories || [];
    if (current.includes(categoryId)) {
      updateEditedField('priorityCategories', current.filter(c => c !== categoryId));
    } else {
      updateEditedField('priorityCategories', [...current, categoryId]);
    }
  };

  // Toggle tipo de ceremonia
  const toggleCeremonyType = (type: string) => {
    const current = editedProfile.ceremonyTypes || [];
    if (current.includes(type)) {
      updateEditedField('ceremonyTypes', current.filter(c => c !== type));
    } else {
      updateEditedField('ceremonyTypes', [...current, type]);
    }
  };

  // Obtener labels
  const getBudgetLabel = (id: string) => BUDGET_RANGES.find((b) => b.id === id)?.label || id;
  const getGuestLabel = (id: string) => GUEST_COUNTS.find((g) => g.id === id)?.label || id;
  const getRegionLabel = (id: string) => REGIONS.find((r) => r.id === id)?.label || id;
  const getCategoryLabel = (id: string) => PRIORITY_CATEGORIES.find((c) => c.id === id)?.label || id;
  const getPriceLabel = (id: string) => PRICE_RANGES_PROVIDER.find((p) => p.id === id)?.label || id;
  const getStyleLabel = (id: string) => SERVICE_STYLES.find((s) => s.id === id)?.label || id;

  if (isLoading) {
    return <LoadingState message="Cargando tu dashboard..." fullScreen />;
  }

  const profile = userProfile as UserProfile | null;
  
  // Obtener categorías únicas de los matches para el filtro
  const uniqueCategories = [...new Set(matches.map(m => m.category))];
  
  // Filtrar matches por categoría
  const filteredMatches = categoryFilter === 'all' 
    ? matches 
    : matches.filter(m => m.category === categoryFilter);
  
  const pendingMatches = filteredMatches.filter(m => m.status === 'pending');
  const approvedMatches = filteredMatches.filter(m => m.status === 'approved');
  
  // Agrupar matches por categoría para vista organizada
  const matchesByCategory = uniqueCategories.reduce((acc, category) => {
    acc[category] = {
      pending: matches.filter(m => m.category === category && m.status === 'pending'),
      approved: matches.filter(m => m.category === category && m.status === 'approved'),
      rejected: matches.filter(m => m.category === category && m.status === 'rejected'),
    };
    return acc;
  }, {} as Record<string, { pending: LeadMatch[]; approved: LeadMatch[]; rejected: LeadMatch[] }>);
  
  // Calcular encuestas completadas desde el perfil (incluye 'completed' y 'matches_generated')
  const completedSurveysCount = profile?.categorySurveyStatus 
    ? Object.values(profile.categorySurveyStatus).filter(status => status === 'completed' || status === 'matches_generated').length 
    : 0;

  // Configuración del header según la sección activa
  const headerConfig = {
    matches: { title: 'Mis Matches', subtitle: 'Proveedores recomendados para tu boda' },
    surveys: { title: 'Categorías', subtitle: 'Personaliza tus preferencias' },
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
          completedSurveysCount={completedSurveysCount}
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
                description="Completa las categorías para obtener recomendaciones personalizadas"
                action={{
                  label: 'Completar categorías',
                  onClick: () => setActiveSection('surveys'),
                }}
              />
            ) : (
              <>
                {/* Resumen de matches por categoría */}
                <div className={styles.matchesSummary}>
                  <div className={styles.matchesSummaryHeader}>
                    <h2 className={styles.matchesSummaryTitle}>
                      <Sparkles size={20} />
                      <span>Resumen de tus matches</span>
                    </h2>
                    <p className={styles.matchesSummaryDesc}>
                      {matches.length} proveedores en {uniqueCategories.length} categorías
                    </p>
                  </div>
                  <div className={styles.matchesSummaryStats}>
                    <div className={styles.matchesSummaryStat}>
                      <span className={styles.statNumber}>{pendingMatches.length}</span>
                      <span className={styles.statLabel}>Por revisar</span>
                    </div>
                    <div className={styles.matchesSummaryStatSuccess}>
                      <span className={styles.statNumber}>{approvedMatches.length}</span>
                      <span className={styles.statLabel}>Te interesan</span>
                    </div>
                  </div>
                </div>

                {/* Vista organizada por categoría */}
                {uniqueCategories.map((category) => {
                  const categoryData = matchesByCategory[category];
                  const totalInCategory = categoryData.pending.length + categoryData.approved.length + categoryData.rejected.length;
                  const categoryInfo = getCategoryInfo(category as CategoryId);
                  
                  // Aplicar filtro si está activo
                  if (categoryFilter !== 'all' && categoryFilter !== category) return null;
                  
                  return (
                    <div key={category} className={styles.categorySection}>
                      {/* Header de categoría */}
                      <div className={styles.categorySectionHeader}>
                        <div className={styles.categorySectionIcon}>
                          {CATEGORY_ICONS[category]}
                        </div>
                        <div className={styles.categorySectionInfo}>
                          <h3 className={styles.categorySectionTitle}>
                            {categoryInfo?.name || getCategoryLabel(category)}
                          </h3>
                          <p className={styles.categorySectionStats}>
                            {totalInCategory} proveedores
                            {categoryData.pending.length > 0 && (
                              <span className={styles.pendingTag}>{categoryData.pending.length} nuevos</span>
                            )}
                            {categoryData.approved.length > 0 && (
                              <span className={styles.approvedTag}>{categoryData.approved.length} favoritos</span>
                            )}
                          </p>
                        </div>
                        <Link 
                          href={`/dashboard/category/${category}/matches`}
                          className={styles.categorySectionLink}
                        >
                          <span>Ver todos</span>
                          <ChevronRight size={14} />
                        </Link>
                      </div>

                      {/* Matches de esta categoría */}
                      <div className={styles.categoryMatchesGrid}>
                        {/* Matches pendientes primero */}
                        {categoryData.pending.map((match) => {
                          const provider = providers[match.providerId];
                          const categoryImage = CATEGORY_IMAGES[match.category] || CATEGORY_IMAGES.photography;
                          const hasProfileImage = provider?.profileImage?.url;
                          const isProcessing = processingMatchId === match.id;
                          const hasPortfolio = provider?.portfolioImages && provider.portfolioImages.length > 0;
                          
                          return (
                            <div 
                              key={match.id} 
                              className={styles.matchCardCompact}
                            >
                              <div 
                                className={styles.matchImageCompact}
                                onClick={() => {
                                  if (hasPortfolio) {
                                    setGalleryProviderId(match.providerId);
                                  } else {
                                    handleViewProviderDetails(match);
                                  }
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className={styles.matchImageWrapper}>
                                  {hasProfileImage ? (
                                    <div 
                                      className={styles.matchProfileImage}
                                      style={{
                                        backgroundImage: `url(${provider.profileImage!.url})`,
                                        backgroundPosition: `${provider.profileImage!.cropData.x}% ${provider.profileImage!.cropData.y}%`,
                                        backgroundSize: `${100 * provider.profileImage!.cropData.zoom}%`,
                                      }}
                                    />
                                  ) : (
                                    <img 
                                      src={categoryImage} 
                                      alt={match.providerInfo.providerName}
                                    />
                                  )}
                                </div>
                                <div 
                                  className={styles.matchBadgeCompactFloating}
                                  style={getMatchCategoryStylesCompact(match.matchScore)}
                                >
                                  {getMatchCategory(match.matchScore).shortLabel}
                                </div>
                              </div>

                              <div className={styles.matchInfoCompact}>
                                <h4 className={styles.matchNameCompact}>
                                  {match.providerInfo.providerName}
                                  {provider?.isVerified && (
                                    <BadgeCheck size={12} className={styles.verifiedIconSmall} />
                                  )}
                                </h4>
                                <div className={styles.matchMetaCompact}>
                                  <span><MapPin size={10} /> {provider?.workRegion ? getRegionLabel(provider.workRegion) : 'Chile'}</span>
                                  <span><DollarSign size={10} /> {getPriceLabel(match.providerInfo.priceRange)}</span>
                                </div>
                              </div>

                              <div className={styles.matchActionsCompact}>
                                <button 
                                  className={styles.rejectButtonCompact}
                                  onClick={() => handleRejectClick(match)}
                                  disabled={isProcessing}
                                  title="Descartar"
                                >
                                  {isProcessing ? <Loader2 size={12} className={styles.spinnerIcon} /> : <X size={12} />}
                                </button>
                                <button 
                                  className={styles.approveButtonCompact}
                                  onClick={() => handleApproveMatch(match.id)}
                                  disabled={isProcessing}
                                  title="Me interesa"
                                >
                                  {isProcessing ? (
                                    <Loader2 size={12} className={styles.spinnerIcon} />
                                  ) : (
                                    <>
                                      <Heart size={10} />
                                      <span>Me interesa</span>
                                    </>
                                  )}
                                </button>
                                <button 
                                  className={styles.detailsButtonCompact}
                                  onClick={() => handleViewProviderDetails(match)}
                                  title="Ver detalles"
                                >
                                  <Eye size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {/* Matches aprobados después */}
                        {categoryData.approved.map((match) => {
                          const provider = providers[match.providerId];
                          const categoryImage = CATEGORY_IMAGES[match.category] || CATEGORY_IMAGES.photography;
                          const hasProfileImage = provider?.profileImage?.url;
                          const isProcessing = processingMatchId === match.id;
                          const hasPortfolio = provider?.portfolioImages && provider.portfolioImages.length > 0;
                          
                          return (
                            <div 
                              key={match.id} 
                              className={`${styles.matchCardCompact} ${styles.matchCardCompactApproved}`}
                            >
                              <div 
                                className={styles.matchImageCompact}
                                onClick={() => {
                                  if (hasPortfolio) {
                                    setGalleryProviderId(match.providerId);
                                  } else {
                                    handleViewProviderDetails(match);
                                  }
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className={styles.matchImageWrapper}>
                                  {hasProfileImage ? (
                                    <div 
                                      className={styles.matchProfileImage}
                                      style={{
                                        backgroundImage: `url(${provider.profileImage!.url})`,
                                        backgroundPosition: `${provider.profileImage!.cropData.x}% ${provider.profileImage!.cropData.y}%`,
                                        backgroundSize: `${100 * provider.profileImage!.cropData.zoom}%`,
                                      }}
                                    />
                                  ) : (
                                    <img 
                                      src={categoryImage} 
                                      alt={match.providerInfo.providerName}
                                    />
                                  )}
                                </div>
                                <div className={styles.approvedBadgeCompact}>
                                  <Heart size={8} />
                                </div>
                              </div>

                              <div className={styles.matchInfoCompact}>
                                <h4 className={styles.matchNameCompact}>
                                  {match.providerInfo.providerName}
                                  {provider?.isVerified && (
                                    <BadgeCheck size={12} className={styles.verifiedIconSmall} />
                                  )}
                                </h4>
                                <div className={styles.matchMetaCompact}>
                                  <span><MapPin size={10} /> {provider?.workRegion ? getRegionLabel(provider.workRegion) : 'Chile'}</span>
                                  <span><DollarSign size={10} /> {getPriceLabel(match.providerInfo.priceRange)}</span>
                                </div>
                              </div>

                              <div className={styles.matchActionsCompact}>
                                <button 
                                  className={styles.revertButtonCompactSmall}
                                  onClick={() => handleRevertMatch(match.id)}
                                  disabled={isProcessing}
                                  title="Cambiar de opinión"
                                >
                                  {isProcessing ? <Loader2 size={12} className={styles.spinnerIcon} /> : <RotateCcw size={12} />}
                                </button>
                                <button 
                                  className={styles.contactButtonCompact}
                                  onClick={() => handleViewProviderDetails(match)}
                                  title="Ver contacto"
                                >
                                  <Eye size={12} />
                                  <span>Contacto</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Matches rechazados colapsados */}
                      {categoryData.rejected.length > 0 && (
                        <div className={styles.rejectedSection}>
                          <span className={styles.rejectedLabel}>
                            {categoryData.rejected.length} descartado{categoryData.rejected.length > 1 ? 's' : ''}
                          </span>
                          <div className={styles.rejectedList}>
                            {categoryData.rejected.map((match) => {
                              const isProcessing = processingMatchId === match.id;
                              return (
                                <button 
                                  key={match.id}
                                  className={styles.rejectedItem}
                                  onClick={() => handleRevertMatch(match.id)}
                                  disabled={isProcessing}
                                  title={`Recuperar ${match.providerInfo.providerName}`}
                                >
                                  {isProcessing ? (
                                    <Loader2 size={10} className={styles.spinnerIcon} />
                                  ) : (
                                    <>
                                      <span>{match.providerInfo.providerName}</span>
                                      <RotateCcw size={10} />
                                    </>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* Sección de Categorías - Diseño Premium */}
        {activeSection === 'surveys' && (
          <div className={styles.surveysSection}>
            {/* Header de la sección */}
            <div className={styles.categoriesHeader}>
              <h2 className={styles.categoriesTitle}>Encuentra tus proveedores ideales</h2>
              <p className={styles.categoriesSubtitle}>
                Completa las categorías para recibir recomendaciones personalizadas
              </p>
            </div>

            {/* Categorías prioritarias - Grid elegante con iconos grandes */}
            {profile?.priorityCategories && profile.priorityCategories.length > 0 && (
              <div className={styles.categoriesPrioritySection}>
                <div className={styles.categoriesSectionLabel}>
                  <Star size={14} />
                  <span>Tus prioridades</span>
                </div>
                <div className={styles.categoriesIconGrid}>
                  {profile.priorityCategories.map((category) => {
                    const categoryId = category as CategoryId;
                    const surveyStatus = profile?.categorySurveyStatus?.[categoryId];
                    const isCompleted = surveyStatus === 'completed' || surveyStatus === 'matches_generated';
                    const categoryInfo = getCategoryInfo(categoryId);
                    const categoryMatches = matches.filter(m => m.category === categoryId);
                    
                    return (
                      <div key={category} className={styles.categoryIconCardWrapper}>
                        {/* Badge de matches - fuera de la tarjeta para que no se corte */}
                        {isCompleted && categoryMatches.length > 0 && (
                          <span className={styles.categoryMatchCount}>
                            {categoryMatches.length}
                          </span>
                        )}
                        <Link 
                          href={isCompleted 
                            ? `/dashboard/category/${categoryId}/matches` 
                            : `/dashboard/category/${categoryId}/survey`
                          }
                          className={`${styles.categoryIconCard} ${isCompleted ? styles.categoryIconCardCompleted : ''}`}
                        >
                          {/* Icono grande */}
                          <div className={styles.categoryIconLarge}>
                            {CATEGORY_ICONS[category]}
                          </div>
                          
                          {/* Nombre */}
                          <span className={styles.categoryIconName}>
                            {categoryInfo?.name || getCategoryLabel(category)}
                          </span>
                          
                          {/* Estado */}
                          {isCompleted ? (
                            <span className={styles.categoryStatusCompleted}>
                              <Check size={10} />
                            </span>
                          ) : (
                            <span className={styles.categoryStatusPending}>
                              Completar
                            </span>
                          )}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Otras categorías - Grid más compacto */}
            {(() => {
              const otherCategories = ALL_CATEGORIES.filter(
                cat => !profile?.priorityCategories?.includes(cat)
              );
              
              if (otherCategories.length === 0) return null;
              
              return (
                <div className={styles.categoriesOtherSection}>
                  <div className={styles.categoriesSectionLabel}>
                    <Search size={14} />
                    <span>Explorar más categorías</span>
                  </div>
                  <div className={styles.categoriesIconGridSmall}>
                    {otherCategories.map((category) => {
                      const categoryId = category as CategoryId;
                      const surveyStatus = profile?.categorySurveyStatus?.[categoryId];
                      const isCompleted = surveyStatus === 'completed' || surveyStatus === 'matches_generated';
                      const categoryInfo = getCategoryInfo(categoryId);
                      const categoryMatches = matches.filter(m => m.category === categoryId);
                      
                      return (
                        <div key={category} className={styles.categoryIconCardSmallWrapper}>
                          {/* Badge de matches - fuera de la tarjeta */}
                          {isCompleted && categoryMatches.length > 0 && (
                            <span className={styles.categoryMatchCountSmall}>
                              {categoryMatches.length}
                            </span>
                          )}
                          <Link 
                            href={isCompleted 
                              ? `/dashboard/category/${categoryId}/matches` 
                              : `/dashboard/category/${categoryId}/survey`
                            }
                            className={`${styles.categoryIconCardSmall} ${isCompleted ? styles.categoryIconCardSmallCompleted : ''}`}
                          >
                            {/* Icono */}
                            <div className={styles.categoryIconMedium}>
                              {CATEGORY_ICONS[category]}
                            </div>
                            
                            {/* Nombre */}
                            <span className={styles.categoryIconNameSmall}>
                              {categoryInfo?.name || getCategoryLabel(category)}
                            </span>
                            
                            {/* Estado */}
                            {isCompleted && (
                              <span className={styles.categoryStatusCompletedSmall}>
                                <Check size={8} />
                              </span>
                            )}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {(!profile?.priorityCategories || profile.priorityCategories.length === 0) && (
              <EmptyState
                icon={<FileText size={48} />}
                title="No hay categorías seleccionadas"
                description="Actualiza tu perfil para seleccionar las categorías de proveedores que necesitas"
              />
            )}
          </div>
        )}

        {/* Sección de Perfil */}
        {activeSection === 'profile' && (
          <div className={styles.profileSection}>
            {/* Botones de acción del perfil */}
            <div className={styles.profileActions}>
              {isEditingProfile ? (
                <>
                  <button 
                    className={styles.cancelEditButton}
                    onClick={handleCancelEditProfile}
                    disabled={isSavingProfile}
                  >
                    <XCircle size={16} />
                    <span>Cancelar</span>
                  </button>
                  <button 
                    className={styles.saveProfileButton}
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? (
                      <>
                        <span className={styles.buttonSpinner} />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Guardar cambios</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button 
                  className={styles.editProfileButton}
                  onClick={handleStartEditProfile}
                >
                  <Edit3 size={16} />
                  <span>Editar perfil</span>
                </button>
              )}
            </div>

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
                    {isEditingProfile ? (
                      <div className={styles.editFieldGroup}>
                        <input
                          type="date"
                          className={styles.editInput}
                          value={editedProfile.eventDate || ''}
                          onChange={(e) => updateEditedField('eventDate', e.target.value)}
                        />
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={editedProfile.isDateTentative || false}
                            onChange={(e) => updateEditedField('isDateTentative', e.target.checked)}
                          />
                          <span>Fecha tentativa</span>
                        </label>
                      </div>
                    ) : (
                      <span className={styles.fieldValue}>
                        {profile?.eventDate || 'Por definir'}
                        {profile?.isDateTentative && <span className={styles.tentativeBadge}>Tentativa</span>}
                      </span>
                    )}
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Región</span>
                    {isEditingProfile ? (
                      <select
                        className={styles.editSelect}
                        value={editedProfile.region || ''}
                        onChange={(e) => updateEditedField('region', e.target.value)}
                      >
                        <option value="">Seleccionar región</option>
                        {REGIONS.map((r) => (
                          <option key={r.id} value={r.id}>{r.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={styles.fieldValue}>
                        {profile?.region ? getRegionLabel(profile.region) : 'Por definir'}
                      </span>
                    )}
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Estilo del evento</span>
                    {isEditingProfile ? (
                      <select
                        className={styles.editSelect}
                        value={editedProfile.eventStyle || ''}
                        onChange={(e) => updateEditedField('eventStyle', e.target.value)}
                      >
                        <option value="">Seleccionar estilo</option>
                        {EVENT_STYLES.map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={styles.fieldValue}>{profile?.eventStyle || 'Por definir'}</span>
                    )}
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
                    {isEditingProfile ? (
                      <select
                        className={styles.editSelect}
                        value={editedProfile.budget || ''}
                        onChange={(e) => updateEditedField('budget', e.target.value)}
                      >
                        <option value="">Seleccionar presupuesto</option>
                        {BUDGET_RANGES.map((b) => (
                          <option key={b.id} value={b.id}>{b.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={styles.fieldValue}>
                        {profile?.budget ? getBudgetLabel(profile.budget) : 'Por definir'}
                      </span>
                    )}
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Número de invitados</span>
                    {isEditingProfile ? (
                      <select
                        className={styles.editSelect}
                        value={editedProfile.guestCount || ''}
                        onChange={(e) => updateEditedField('guestCount', e.target.value)}
                      >
                        <option value="">Seleccionar cantidad</option>
                        {GUEST_COUNTS.map((g) => (
                          <option key={g.id} value={g.id}>{g.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={styles.fieldValue}>
                        {profile?.guestCount ? getGuestLabel(profile.guestCount) : 'Por definir'}
                      </span>
                    )}
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
                  {isEditingProfile ? (
                    <div className={styles.editTagsGrid}>
                      {CEREMONY_TYPES.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          className={`${styles.editTagButton} ${
                            editedProfile.ceremonyTypes?.includes(type.id) ? styles.editTagButtonSelected : ''
                          }`}
                          onClick={() => toggleCeremonyType(type.id)}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.tagsList}>
                      {profile?.ceremonyTypes?.map((type) => (
                        <span key={type} className={styles.tag}>
                          {type === 'civil' ? 'Civil' : 
                           type === 'religious' ? 'Religiosa' : 'Simbólica'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Categorías prioritarias */}
              <div className={styles.profileCard}>
                <h3 className={styles.profileCardTitle}>
                  <Search size={20} />
                  <span>Buscando proveedores de</span>
                </h3>
                <div className={styles.profileCardContent}>
                  {isEditingProfile ? (
                    <div className={styles.editTagsGrid}>
                      {PRIORITY_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          className={`${styles.editTagButton} ${
                            editedProfile.priorityCategories?.includes(cat.id) ? styles.editTagButtonSelected : ''
                          }`}
                          onClick={() => togglePriorityCategory(cat.id)}
                        >
                          {CATEGORY_ICONS[cat.id]}
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.tagsList}>
                      {profile?.priorityCategories?.map((cat) => (
                        <span key={cat} className={styles.tag}>
                          {CATEGORY_ICONS[cat]}
                          <span>{getCategoryLabel(cat)}</span>
                        </span>
                      ))}
                    </div>
                  )}
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
                    <span className={styles.fieldLabel}>
                      Email
                      <Lock size={12} className={styles.lockIcon} />
                    </span>
                    <span className={styles.fieldValue}>{profile?.email}</span>
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Teléfono</span>
                    {isEditingProfile ? (
                      <input
                        type="tel"
                        className={styles.editInput}
                        value={editedProfile.phone || ''}
                        onChange={(e) => updateEditedField('phone', e.target.value)}
                        placeholder="+56 9 1234 5678"
                      />
                    ) : (
                      <span className={styles.fieldValue}>{profile?.phone || 'No registrado'}</span>
                    )}
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Nombre de la pareja</span>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        className={styles.editInput}
                        value={editedProfile.coupleNames || ''}
                        onChange={(e) => updateEditedField('coupleNames', e.target.value)}
                        placeholder="Ej: Juan y María"
                      />
                    ) : (
                      <span className={styles.fieldValue}>{profile?.coupleNames || 'No registrado'}</span>
                    )}
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
                  {isEditingProfile ? (
                    <textarea
                      className={styles.editTextarea}
                      value={editedProfile.expectations || ''}
                      onChange={(e) => updateEditedField('expectations', e.target.value)}
                      placeholder="Describe lo que esperas de tu boda perfecta..."
                      rows={4}
                    />
                  ) : (
                    <p className={styles.expectationsText}>
                      {profile?.expectations || 'No has agregado expectativas aún.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalles del proveedor */}
      {selectedMatch && (
        <div className={styles.providerModal} onClick={handleCloseProviderDetails}>
          <div className={styles.providerModalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.providerModalClose} onClick={handleCloseProviderDetails}>
              <XCircle size={24} />
            </button>

            {loadingProviderDetails ? (
              <div className={styles.providerModalLoading}>
                <Loader2 size={32} className={styles.spinnerIcon} />
                <p>Cargando información del proveedor...</p>
              </div>
            ) : (
              <>
                {/* Header del modal */}
                <div className={styles.providerModalHeader}>
                  <div 
                    className={styles.providerModalBadge}
                    style={getMatchCategoryStylesLarge(selectedMatch.matchScore)}
                  >
                    {getMatchCategory(selectedMatch.matchScore).label}
                  </div>
                  <h2 className={styles.providerModalTitle}>
                    {selectedMatch.providerInfo.providerName}
                    {providers[selectedMatch.providerId]?.isVerified && (
                      <span className={styles.verifiedBadgeLarge} title="Proveedor verificado">
                        <BadgeCheck size={20} />
                      </span>
                    )}
                  </h2>
                  <p className={styles.providerModalCategory}>
                    {getCategoryLabel(selectedMatch.category)}
                  </p>
                </div>

                {/* Contenido del modal */}
                <div className={styles.providerModalBody}>
                  {/* Descripción - Arriba */}
                  {providers[selectedMatch.providerId]?.description && (
                    <div className={styles.providerModalSection}>
                      <h4>Sobre este proveedor</h4>
                      <p className={styles.providerModalDescription}>
                        {providers[selectedMatch.providerId]?.description}
                      </p>
                    </div>
                  )}

                  {/* Información básica - Arriba */}
                  <div className={styles.providerModalSection}>
                    <h4>Información</h4>
                    <div className={styles.providerModalInfoGrid}>
                      <div className={styles.providerModalInfoItem}>
                        <MapPin size={16} />
                        <div>
                          <span className={styles.providerModalInfoLabel}>Región principal</span>
                          <span className={styles.providerModalInfoValue}>
                            {getRegionLabel(providers[selectedMatch.providerId]?.workRegion || '')}
                          </span>
                        </div>
                      </div>
                      
                      {providers[selectedMatch.providerId]?.acceptsOutsideZone && (
                        <div className={styles.providerModalInfoItem}>
                          <MapPinned size={16} />
                          <div>
                            <span className={styles.providerModalInfoLabel}>Cobertura</span>
                            <span className={styles.providerModalInfoValue}>
                              Trabaja en otras regiones
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className={styles.providerModalInfoItem}>
                        <DollarSign size={16} />
                        <div>
                          <span className={styles.providerModalInfoLabel}>Rango de precios</span>
                          <span className={styles.providerModalInfoValue}>
                            {getPriceLabel(selectedMatch.providerInfo.priceRange)}
                          </span>
                        </div>
                      </div>
                      
                      {providers[selectedMatch.providerId]?.serviceStyle && (
                        <div className={styles.providerModalInfoItem}>
                          <Sparkles size={16} />
                          <div>
                            <span className={styles.providerModalInfoLabel}>Estilo</span>
                            <span className={styles.providerModalInfoValue}>
                              {getStyleLabel(providers[selectedMatch.providerId]?.serviceStyle || '')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Portafolio - Sección separada que usa todo el ancho */}
                  {(providers[selectedMatch.providerId]?.portfolioImages?.length ?? 0) > 0 && (
                    <div className={styles.providerModalPortfolioSection}>
                      <h4>Portafolio</h4>
                      <PortfolioGallery
                        images={providers[selectedMatch.providerId]?.portfolioImages || []}
                        providerName={selectedMatch.providerInfo.providerName}
                      />
                    </div>
                  )}

                  {/* Contacto - Solo visible si está aprobado */}
                  {selectedMatch.status === 'approved' && (
                    <div className={styles.providerModalSection}>
                      <h4>Contacto</h4>
                      <div className={styles.providerModalContactButtons}>
                        {providers[selectedMatch.providerId]?.email && (
                          <a 
                            href={`mailto:${providers[selectedMatch.providerId]?.email}`}
                            className={styles.providerModalContactButton}
                          >
                            <Mail size={18} />
                            <span>{providers[selectedMatch.providerId]?.email}</span>
                          </a>
                        )}
                        {providers[selectedMatch.providerId]?.phone && (
                          <a 
                            href={`tel:${providers[selectedMatch.providerId]?.phone}`}
                            className={styles.providerModalContactButton}
                          >
                            <Phone size={18} />
                            <span>{providers[selectedMatch.providerId]?.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Redes sociales y web */}
                  {(providers[selectedMatch.providerId]?.website || providers[selectedMatch.providerId]?.instagram) && (
                    <div className={styles.providerModalSection}>
                      <h4>Conoce más</h4>
                      <div className={styles.providerModalSocialLinks}>
                        {providers[selectedMatch.providerId]?.website && (
                          <a 
                            href={providers[selectedMatch.providerId]?.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.providerModalSocialLink}
                          >
                            <Globe size={18} />
                            <span>Sitio web</span>
                            <ExternalLink size={14} />
                          </a>
                        )}
                        {providers[selectedMatch.providerId]?.instagram && (
                          <a 
                            href={`https://instagram.com/${providers[selectedMatch.providerId]?.instagram?.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.providerModalSocialLink}
                          >
                            <Instagram size={18} />
                            <span>{providers[selectedMatch.providerId]?.instagram}</span>
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Aviso si no está aprobado */}
                  {selectedMatch.status !== 'approved' && (
                    <div className={styles.providerModalNotice}>
                      <Heart size={20} />
                      <p>
                        Marca este proveedor como &quot;Me interesa&quot; para ver su información de contacto completa.
                      </p>
                    </div>
                  )}
                </div>

                {/* Acciones del modal */}
                <div className={styles.providerModalActions}>
                  {selectedMatch.status === 'pending' && (
                    <>
                      <button 
                        className={styles.providerModalApproveButton}
                        onClick={() => {
                          handleApproveMatch(selectedMatch.id);
                          handleCloseProviderDetails();
                        }}
                        disabled={processingMatchId === selectedMatch.id}
                      >
                        <Heart size={18} />
                        <span>Me interesa</span>
                      </button>
                      <button 
                        className={styles.providerModalRejectButton}
                        onClick={() => {
                          handleCloseProviderDetails();
                          handleRejectClick(selectedMatch);
                        }}
                        disabled={processingMatchId === selectedMatch.id}
                      >
                        <X size={18} />
                        <span>Descartar</span>
                      </button>
                    </>
                  )}
                  {selectedMatch.status === 'approved' && (
                    <button 
                      className={styles.providerModalRevertButton}
                      onClick={() => {
                        handleRevertMatch(selectedMatch.id);
                        handleCloseProviderDetails();
                      }}
                      disabled={processingMatchId === selectedMatch.id}
                    >
                      <RotateCcw size={18} />
                      <span>Cambiar de opinión</span>
                    </button>
                  )}
                  {selectedMatch.status === 'rejected' && (
                    <button 
                      className={styles.providerModalRecoverButton}
                      onClick={() => {
                        handleRevertMatch(selectedMatch.id);
                        handleCloseProviderDetails();
                      }}
                      disabled={processingMatchId === selectedMatch.id}
                    >
                      <RotateCcw size={18} />
                      <span>Recuperar proveedor</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de rechazo con motivo */}
      <RejectReasonModal
        isOpen={rejectModalOpen}
        providerName={matchToReject?.providerInfo?.providerName || ''}
        onClose={handleCloseRejectModal}
        onConfirm={handleConfirmReject}
        isLoading={isRejecting}
      />
      
      {/* Galería de portafolio (abre al hacer click en imagen de tarjeta) */}
      {galleryProviderId && providers[galleryProviderId]?.portfolioImages && (
        <PortfolioGallery
          images={providers[galleryProviderId].portfolioImages}
          providerName={providers[galleryProviderId]?.providerName || 'Proveedor'}
          autoOpen={true}
          onClose={() => setGalleryProviderId(null)}
        />
      )}
    </DashboardLayout>
  );
}
