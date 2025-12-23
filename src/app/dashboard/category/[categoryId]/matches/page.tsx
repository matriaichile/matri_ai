'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Check, 
  X, 
  Star,
  MapPin, 
  MapPinned,
  DollarSign, 
  ExternalLink,
  ChevronLeft,
  Sparkles,
  Loader2,
  Mail,
  Phone,
  Globe,
  Instagram,
  Eye,
  RotateCcw,
  ChevronRight,
  Heart,
  XCircle,
  BadgeCheck,
  RefreshCcw,
  AlertTriangle,
  Users
} from 'lucide-react';
import { useAuthStore, CategoryId, UserProfile, ProviderProfile, ProfileImageData } from '@/store/authStore';
import { CATEGORY_INFO, getCategoryInfo } from '@/lib/surveys';
import { getUserLeadsByCategory, Lead, updateLeadStatus, rejectLeadWithReason, approveLeadWithMetrics, generateNewMatchForUser, resetCategorySurveyAndLeads, getAvailableProvidersCountForUser, getProviderCategorySurvey, ProviderCategorySurvey } from '@/lib/firebase/firestore';
import { RejectReasonModal, ShowMoreButton } from '@/components/matches';
import { PortfolioGallery } from '@/components/portfolio';
import { registerSearchUsed, forceResetCategory, MAX_ACTIVE_MATCHES_PER_CATEGORY } from '@/utils/matchLimits';
import { calculateBackgroundStyles } from '@/utils/profileImage';
import { REGIONS, PRICE_RANGES_PROVIDER, SERVICE_STYLES, PROVIDER_CATEGORIES } from '@/store/wizardStore';
import { getMatchCategory, getMatchCategoryStyles, getMatchCategoryStylesCompact, getMatchCategoryStylesLarge } from '@/lib/matching/matchCategories';

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
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import styles from './page.module.css';

/**
 * Página de matches por categoría para usuarios.
 * Muestra los proveedores recomendados después de completar la encuesta.
 */
// Interfaz extendida para incluir datos completos del proveedor y su encuesta
interface ExtendedLead extends Lead {
  providerDetails?: ProviderProfile;
  providerSurveyData?: ProviderCategorySurvey; // Datos de la encuesta del proveedor para esta categoría
}

// Función helper para formatear precios en CLP
const formatPrice = (price: number): string => {
  if (price >= 1000000) {
    const millions = price / 1000000;
    return `$${millions.toLocaleString('es-CL', { maximumFractionDigits: 1 })}M`;
  }
  return `$${price.toLocaleString('es-CL')}`;
};

// Función para obtener los campos de precio según la categoría
const getPriceFieldsForCategory = (categoryId: CategoryId): { min: string; max: string; label: string } => {
  const priceFields: Record<string, { min: string; max: string; label: string }> = {
    venue: { min: 'venue_p_price_min', max: 'venue_p_price_max', label: 'Arriendo' },
    catering: { min: 'catering_p_price_pp_min', max: 'catering_p_price_pp_max', label: 'Por persona' },
    photography: { min: 'photo_p_price_min', max: 'photo_p_price_max', label: 'Servicio' },
    video: { min: 'video_p_price_min', max: 'video_p_price_max', label: 'Servicio' },
    dj: { min: 'dj_p_price_min', max: 'dj_p_price_max', label: 'Servicio' },
    decoration: { min: 'deco_p_price_min', max: 'deco_p_price_max', label: 'Servicio' },
    entertainment: { min: 'ent_p_price_min', max: 'ent_p_price_max', label: 'Servicio' },
    makeup: { min: 'makeup_p_price_bride', max: 'makeup_p_price_bride', label: 'Novia' },
    cakes: { min: 'cakes_p_price_min', max: 'cakes_p_price_max', label: 'Torta' },
    transport: { min: 'transport_p_price_min', max: 'transport_p_price_max', label: 'Servicio' },
    invitations: { min: 'inv_p_price_min', max: 'inv_p_price_max', label: 'Por invitación' },
    dress: { min: 'dress_p_price_bride_min', max: 'dress_p_price_bride_max', label: 'Vestido novia' },
    wedding_planner: { min: 'wp_p_price_min', max: 'wp_p_price_max', label: 'Servicio' },
  };
  return priceFields[categoryId] || { min: '', max: '', label: 'Precio' };
};

export default function CategoryMatchesPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.categoryId as CategoryId;
  
  const { isAuthenticated, userProfile, userType, isLoading, firebaseUser } = useAuthStore();
  const [matches, setMatches] = useState<ExtendedLead[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<ExtendedLead | null>(null);
  const [loadingProviderDetails, setLoadingProviderDetails] = useState(false);
  
  // Estado para el modal de rechazo
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [matchToReject, setMatchToReject] = useState<ExtendedLead | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);
  
  // Estado para generar nuevos matches
  const [isGeneratingNew, setIsGeneratingNew] = useState(false);
  
  // NUEVO: Estado global para bloquear todas las acciones que modifican matches activos
  // Esto evita que el usuario haga "trampa" ejecutando múltiples acciones simultáneas
  const [isModifyingActiveMatches, setIsModifyingActiveMatches] = useState(false);
  
  // Estado para la galería de portafolio (al hacer click en imagen de tarjeta)
  const [galleryMatch, setGalleryMatch] = useState<ExtendedLead | null>(null);
  
  // Estado para rehacer encuesta
  const [showRedoConfirm, setShowRedoConfirm] = useState(false);
  const [isRedoing, setIsRedoing] = useState(false);
  
  // NUEVO: Estado para modal de límite de matches activos alcanzado
  const [showLimitModal, setShowLimitModal] = useState(false);
  
  // NUEVO: Estado para conteo de proveedores disponibles
  const [availableProvidersCount, setAvailableProvidersCount] = useState<number | undefined>(undefined);
  const [isLoadingAvailableCount, setIsLoadingAvailableCount] = useState(false);

  // Verificar autenticación
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated()) {
        router.push('/login');
      } else if (userType === 'provider') {
        router.push('/dashboard/provider');
      }
    }
  }, [isAuthenticated, userType, isLoading, router]);

  // Cargar matches de esta categoría Y los detalles de los proveedores
  // CAMBIO: Cargamos los detalles del proveedor al mismo tiempo que los leads
  // para que la info de verificación esté disponible desde el inicio
  useEffect(() => {
    const loadMatches = async () => {
      if (!firebaseUser?.uid || !categoryId) return;

      try {
        setLoadingMatches(true);
        const categoryMatches = await getUserLeadsByCategory(firebaseUser.uid, categoryId);
        
        // Cargar detalles de todos los proveedores en paralelo
        // Esto permite mostrar el badge de verificación desde el inicio
        const providerIds = [...new Set(categoryMatches.map(m => m.providerId))];
        
        const providerDetailsPromises = providerIds.map(async (providerId) => {
          try {
            const providerDoc = await getDoc(doc(db, 'providers', providerId));
            if (providerDoc.exists()) {
              return {
                id: providerId,
                data: {
                  id: providerDoc.id,
                  type: 'provider' as const,
                  ...providerDoc.data(),
                } as ProviderProfile,
              };
            }
          } catch (error) {
            console.error(`Error cargando proveedor ${providerId}:`, error);
          }
          return null;
        });
        
        const providerResults = await Promise.all(providerDetailsPromises);
        
        // Crear mapa de proveedores
        const providersMap: Record<string, ProviderProfile> = {};
        providerResults.forEach(result => {
          if (result) {
            providersMap[result.id] = result.data;
          }
        });
        
        // Enriquecer los matches con los detalles del proveedor
        const enrichedMatches: ExtendedLead[] = categoryMatches.map(match => ({
          ...match,
          providerDetails: providersMap[match.providerId],
        }));
        
        setMatches(enrichedMatches);
      } catch (error) {
        console.error('Error cargando matches:', error);
      } finally {
        setLoadingMatches(false);
      }
    };

    if (firebaseUser?.uid && categoryId) {
      loadMatches();
    }
  }, [firebaseUser?.uid, categoryId]);

  // NUEVO: Cargar conteo de proveedores disponibles
  // Se ejecuta después de cargar los matches y cada vez que cambian
  useEffect(() => {
    const loadAvailableCount = async () => {
      if (!firebaseUser?.uid || !categoryId || loadingMatches) return;
      
      try {
        setIsLoadingAvailableCount(true);
        const count = await getAvailableProvidersCountForUser(firebaseUser.uid, categoryId);
        setAvailableProvidersCount(count);
      } catch (error) {
        console.error('Error cargando conteo de proveedores disponibles:', error);
        setAvailableProvidersCount(undefined); // En caso de error, no sabemos cuántos hay
      } finally {
        setIsLoadingAvailableCount(false);
      }
    };
    
    loadAvailableCount();
  }, [firebaseUser?.uid, categoryId, loadingMatches, matches.length]); // Se recarga cuando cambian los matches

  // Rehacer encuesta - elimina leads, restaura créditos y resetea búsquedas
  const handleRedoSurvey = async () => {
    if (!firebaseUser?.uid) return;
    
    try {
      setIsRedoing(true);
      
      // Llamar a la función que elimina leads y restaura créditos
      const result = await resetCategorySurveyAndLeads(firebaseUser.uid, categoryId);
      
      // Resetear el contador de búsquedas diarias para esta categoría
      forceResetCategory(firebaseUser.uid, categoryId);
      
      console.log(`✅ Encuesta reiniciada: ${result.deletedLeadsCount} leads eliminados, ${result.restoredCreditsToProviders.length} proveedores con créditos restaurados, búsquedas reseteadas`);
      
      // Redirigir a la encuesta
      router.push(`/dashboard/category/${categoryId}/survey`);
      
    } catch (error) {
      console.error('Error al rehacer encuesta:', error);
      setIsRedoing(false);
      setShowRedoConfirm(false);
    }
  };

  // Aprobar match - usa la función con métricas
  const handleApprove = async (leadId: string) => {
    try {
      setProcessingId(leadId);
      await approveLeadWithMetrics(leadId);
      // Actualizar el estado en la lista de matches
      setMatches(prev => prev.map(m => 
        m.id === leadId ? { ...m, status: 'approved' as const } : m
      ));
      // IMPORTANTE: También actualizar el selectedMatch si está abierto el modal
      // para que se muestre la info de contacto inmediatamente
      if (selectedMatch?.id === leadId) {
        setSelectedMatch(prev => prev ? { ...prev, status: 'approved' as const } : null);
      }
    } catch (error) {
      console.error('Error aprobando match:', error);
    } finally {
      setProcessingId(null);
    }
  };

  // Abrir modal de rechazo - NO rechaza directamente
  const handleRejectClick = (match: ExtendedLead) => {
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

  // Generar un nuevo match para esta categoría - CAMBIO: Verificar límite de matches activos
  const handleRequestNewMatch = async (): Promise<boolean> => {
    if (!firebaseUser?.uid || !categoryId) return false;
    
    // NUEVO: Bloquear si ya hay una acción en proceso que modifica matches activos
    if (isModifyingActiveMatches) {
      return false; // Silenciosamente ignorar - ya hay una acción en curso
    }
    
    // CAMBIO: Verificar si ya tiene el máximo de matches activos
    // Recalcular con el estado actual (puede haber cambiado)
    const currentActiveCount = matches.filter(m => m.status === 'approved' || m.status === 'pending').length;
    if (currentActiveCount >= MAX_ACTIVE_MATCHES_PER_CATEGORY) {
      setShowLimitModal(true);
      return false;
    }
    
    try {
      setIsGeneratingNew(true);
      setIsModifyingActiveMatches(true); // NUEVO: Bloquear otras acciones
      const newLead = await generateNewMatchForUser(firebaseUser.uid, categoryId);
      
      if (newLead) {
        // Registrar que se usó una búsqueda (máximo 2 por día)
        registerSearchUsed(firebaseUser.uid, categoryId);
        
        // Agregar el nuevo lead a la lista
        setMatches(prev => [newLead, ...prev]);
        
        // NUEVO: Decrementar el conteo de proveedores disponibles
        // (el useEffect también lo recargará, pero esto da feedback inmediato)
        setAvailableProvidersCount(prev => prev !== undefined ? Math.max(0, prev - 1) : undefined);
        
        return true;
      }
      // NUEVO: Si no se encontró un nuevo match, significa que no hay más proveedores
      setAvailableProvidersCount(0);
      return false;
    } catch (error) {
      console.error('Error generando nuevo match:', error);
      return false;
    } finally {
      setIsGeneratingNew(false);
      setIsModifyingActiveMatches(false); // NUEVO: Desbloquear
    }
  };

  // CAMBIO: Calcular cantidad de matches activos (approved + pending, NO rejected)
  const activeMatchesCount = matches.filter(m => m.status === 'approved' || m.status === 'pending').length;
  const canAddMoreMatches = activeMatchesCount < MAX_ACTIVE_MATCHES_PER_CATEGORY;

  // Revertir estado a pendiente - CAMBIO: Verificar límite de matches activos
  const handleRevert = async (leadId: string, isFromRejected: boolean = false) => {
    // NUEVO: Bloquear si ya hay una acción en proceso que modifica matches activos
    if (isFromRejected && isModifyingActiveMatches) {
      return; // Silenciosamente ignorar - ya hay una acción en curso
    }
    
    // Si es desde rechazado (recuperar), verificar el límite de matches activos
    if (isFromRejected && !canAddMoreMatches) {
      setShowLimitModal(true);
      return;
    }
    
    try {
      setProcessingId(leadId);
      // NUEVO: Si es recuperación, marcar que estamos modificando matches activos
      if (isFromRejected) {
        setIsModifyingActiveMatches(true);
      }
      await updateLeadStatus(leadId, 'pending');
      setMatches(prev => prev.map(m => 
        m.id === leadId ? { ...m, status: 'pending' as const } : m
      ));
    } catch (error) {
      console.error('Error revirtiendo estado:', error);
    } finally {
      setProcessingId(null);
      if (isFromRejected) {
        setIsModifyingActiveMatches(false);
      }
    }
  };

  // Abrir panel de detalles del proveedor
  const handleViewDetails = async (match: ExtendedLead) => {
    setSelectedMatch(match);
    
    // Cargar detalles completos del proveedor y su encuesta si no los tenemos
    if (!match.providerDetails || !match.providerSurveyData) {
      setLoadingProviderDetails(true);
      try {
        let providerData = match.providerDetails;
        let surveyData = match.providerSurveyData;
        
        // Cargar datos del proveedor si no los tenemos
        if (!providerData) {
          const providerDoc = await getDoc(doc(db, 'providers', match.providerId));
          if (providerDoc.exists()) {
            providerData = {
              id: providerDoc.id,
              type: 'provider' as const,
              ...providerDoc.data(),
            } as ProviderProfile;
          }
        }
        
        // Cargar encuesta del proveedor para esta categoría
        if (!surveyData) {
          surveyData = await getProviderCategorySurvey(match.providerId, categoryId) || undefined;
        }
        
        // Actualizar el match con los detalles del proveedor y la encuesta
        const updatedMatch = { 
          ...match, 
          providerDetails: providerData,
          providerSurveyData: surveyData 
        };
        
        setMatches(prev => prev.map(m => 
          m.id === match.id ? updatedMatch : m
        ));
        setSelectedMatch(updatedMatch);
      } catch (error) {
        console.error('Error cargando detalles del proveedor:', error);
      } finally {
        setLoadingProviderDetails(false);
      }
    }
  };

  // Cerrar panel de detalles
  const handleCloseDetails = () => {
    setSelectedMatch(null);
  };

  // Helpers
  const getRegionLabel = (id: string) => REGIONS.find((r) => r.id === id)?.label || id;
  const getPriceLabel = (id: string) => PRICE_RANGES_PROVIDER.find((p) => p.id === id)?.label || id;
  const getStyleLabel = (id: string) => SERVICE_STYLES.find((s) => s.id === id)?.label || id;

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={40} />
        <p>Cargando...</p>
      </div>
    );
  }

  // Verificar categoría válida
  const categoryInfo = getCategoryInfo(categoryId);
  if (!categoryInfo) {
    return (
      <div className={styles.errorContainer}>
        <h2>Categoría no encontrada</h2>
        <Link href="/dashboard" className={styles.backLink}>
          Volver al dashboard
        </Link>
      </div>
    );
  }

  const pendingMatches = matches.filter(m => m.status === 'pending');
  const approvedMatches = matches.filter(m => m.status === 'approved');
  const rejectedMatches = matches.filter(m => m.status === 'rejected');

  return (
    <div className={styles.container}>
      {/* Fondo decorativo galáctico */}
      <div className={styles.backgroundPattern} />
      
      {/* Partículas flotantes */}
      <div className={styles.particles}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className={styles.particle} />
        ))}
      </div>
      
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <Link href="/dashboard" className={styles.backButton}>
            <ChevronLeft size={20} />
            <span>Volver al inicio</span>
          </Link>
          
          <div className={styles.headerContent}>
            <h1 className={styles.title}>
              Matches de {categoryInfo.name}
            </h1>
            <p className={styles.subtitle}>
              Proveedores recomendados basados en tus preferencias
            </p>
          </div>
          
          {/* Botón para rehacer encuesta */}
          <button 
            className={styles.redoButton}
            onClick={() => setShowRedoConfirm(true)}
            disabled={isRedoing}
          >
            <RefreshCcw size={16} />
            <span>Rehacer encuesta</span>
          </button>
        </div>
      </header>
      
      {/* Modal de confirmación para rehacer encuesta */}
      {showRedoConfirm && (
        <div className={styles.confirmOverlay} onClick={() => !isRedoing && setShowRedoConfirm(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmIcon}>
              <AlertTriangle size={32} />
            </div>
            <h3 className={styles.confirmTitle}>¿Rehacer encuesta?</h3>
            <p className={styles.confirmText}>
              Al rehacer la encuesta, <strong>todos los matches actuales de {categoryInfo.name} serán eliminados</strong>. 
              Tendrás que completar la encuesta nuevamente para recibir nuevos matches.
            </p>
            <div className={styles.confirmActions}>
              <button 
                className={styles.confirmCancel}
                onClick={() => setShowRedoConfirm(false)}
                disabled={isRedoing}
              >
                Cancelar
              </button>
              <button 
                className={styles.confirmProceed}
                onClick={handleRedoSurvey}
                disabled={isRedoing}
              >
                {isRedoing ? (
                  <>
                    <Loader2 size={16} className={styles.spinnerIcon} />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <RefreshCcw size={16} />
                    <span>Sí, rehacer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className={styles.main}>
        {loadingMatches ? (
          <div className={styles.loadingMatches}>
            <Sparkles className={styles.loadingIcon} size={48} />
            <h2>Buscando los mejores proveedores...</h2>
            <p>Estamos analizando tus preferencias para encontrar los matches perfectos</p>
            <div className={styles.loadingBar}>
              <div className={styles.loadingBarFill} />
            </div>
          </div>
        ) : matches.length === 0 ? (
          <div className={styles.emptyState}>
            <Sparkles size={48} className={styles.emptyIcon} />
            <h2>Aún no hay matches disponibles</h2>
            <p>
              Estamos procesando tu encuesta. Los matches aparecerán pronto.
            </p>
            <Link href="/dashboard" className={styles.primaryButton}>
              Volver al inicio
            </Link>
          </div>
        ) : (
          <>
            {/* CAMBIO: Matches aprobados PRIMERO - son los más importantes (te interesan) */}
            {approvedMatches.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <Heart size={18} />
                  <span>Proveedores de interés</span>
                  <span className={styles.badgeSuccess}>{approvedMatches.length}</span>
                </h2>
                <p className={styles.sectionDescription}>
                  Has mostrado interés en estos proveedores. ¡Contáctalos!
                </p>
                
                <div className={styles.matchesGrid}>
                  {approvedMatches.map((match) => {
                    const categoryImage = CATEGORY_IMAGES[categoryId] || CATEGORY_IMAGES.photography;
                    const hasProfileImage = match.providerDetails?.profileImage?.url;
                    const hasPortfolio = match.providerDetails?.portfolioImages && match.providerDetails.portfolioImages.length > 0;
                    
                    return (
                      <div 
                        key={match.id} 
                        className={`${styles.matchCard} ${styles.matchCardApproved}`}
                      >
                        {/* Imagen del proveedor */}
                        <div 
                          className={styles.matchImage}
                          onClick={() => {
                            // Si tiene portafolio, abrir galería; si no, abrir detalles
                            if (hasPortfolio) {
                              setGalleryMatch(match);
                            } else {
                              handleViewDetails(match);
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className={styles.matchImageWrapper}>
                            {hasProfileImage ? (
                              <div 
                                className={styles.matchProfileImage}
                                style={{
                                  backgroundImage: `url(${match.providerDetails!.profileImage!.url})`,
                                  ...calculateBackgroundStyles(match.providerDetails!.profileImage!.cropData),
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
                            className={styles.matchBadgeSmall}
                            style={getMatchCategoryStylesCompact(match.matchScore)}
                          >
                            {getMatchCategory(match.matchScore).shortLabel}
                          </div>
                          <div className={styles.matchCategory}>
                            <span>{categoryInfo?.name}</span>
                          </div>
                          <div className={styles.approvedBadge}>
                            <Heart size={10} />
                            <span>Te interesa</span>
                          </div>
                        </div>

                        <div className={styles.matchBody}>
                          <h3 className={styles.providerName}>
                            {match.providerInfo.providerName}
                          </h3>
                          {/* CAMBIO: Badge de verificación - usa providerDetails o providerInfo como fallback */}
                          {(match.providerDetails?.isVerified || match.providerInfo?.isVerified) && (
                            <span className={styles.verifiedBadgeText}>
                              <BadgeCheck size={12} />
                              <span>Proveedor verificado</span>
                            </span>
                          )}

                          <div className={styles.matchMeta}>
                            <span className={styles.metaItem}>
                              <MapPin size={14} />
                              <span>{getRegionLabel(match.userInfo.region)}</span>
                            </span>
                            <span className={styles.metaItem}>
                              <DollarSign size={14} />
                              <span>{getPriceLabel(match.providerInfo.priceRange)}</span>
                            </span>
                          </div>
                        </div>

                        <div className={styles.matchActionsApproved}>
                          <button 
                            className={styles.revertButtonSmall}
                            onClick={() => handleRevert(match.id)}
                            disabled={processingId === match.id}
                            title="Cambiar de opinión"
                          >
                            {processingId === match.id ? (
                              <Loader2 size={14} className={styles.buttonSpinner} />
                            ) : (
                              <RotateCcw size={14} />
                            )}
                          </button>
                          <button 
                            className={styles.viewContactButton}
                            onClick={() => handleViewDetails(match)}
                          >
                            <Eye size={16} />
                            <span>Ver contacto</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Matches pendientes - DESPUÉS de los aprobados */}
            {pendingMatches.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <Sparkles size={18} />
                  <span>Posibles matches</span>
                  <span className={styles.badge}>{pendingMatches.length}</span>
                </h2>
                <p className={styles.sectionDescription}>
                  Revisa estos proveedores y decide si quieres contactarlos
                </p>
                
                <div className={styles.matchesGridCentered}>
                  {pendingMatches.map((match, index) => {
                    const categoryImage = CATEGORY_IMAGES[categoryId] || CATEGORY_IMAGES.photography;
                    const hasProfileImage = match.providerDetails?.profileImage?.url;
                    
                    return (
                      <div 
                        key={match.id} 
                        className={styles.matchCardWithScore}
                        style={{ animationDelay: `${index * 80}ms` }}
                      >
                        {/* Badge de compatibilidad flotante */}
                        <div 
                          className={styles.matchBadgeFloating}
                          style={getMatchCategoryStyles(match.matchScore)}
                        >
                          {getMatchCategory(match.matchScore).label}
                        </div>
                        
                        <div className={styles.matchCard}>
                          {/* Imagen del proveedor */}
                          <div 
                            className={styles.matchImage}
                            onClick={() => {
                              // Si tiene portafolio, abrir galería; si no, abrir detalles
                              const hasPortfolio = match.providerDetails?.portfolioImages && match.providerDetails.portfolioImages.length > 0;
                              if (hasPortfolio) {
                                setGalleryMatch(match);
                              } else {
                                handleViewDetails(match);
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className={styles.matchImageWrapper}>
                              {hasProfileImage ? (
                                <div 
                                  className={styles.matchProfileImage}
                                  style={{
                                    backgroundImage: `url(${match.providerDetails!.profileImage!.url})`,
                                    ...calculateBackgroundStyles(match.providerDetails!.profileImage!.cropData),
                                  }}
                                />
                              ) : (
                                <img 
                                  src={categoryImage} 
                                  alt={match.providerInfo.providerName}
                                />
                              )}
                            </div>
                            <div className={styles.matchCategory}>
                              <span>{categoryInfo?.name}</span>
                            </div>
                          </div>

                        <div className={styles.matchBody}>
                          <h3 className={styles.providerName}>
                            {match.providerInfo.providerName}
                          </h3>
                          {/* CAMBIO: Badge de verificación - usa providerDetails o providerInfo como fallback */}
                          {(match.providerDetails?.isVerified || match.providerInfo?.isVerified) && (
                            <span className={styles.verifiedBadgeText}>
                              <BadgeCheck size={12} />
                              <span>Proveedor verificado</span>
                            </span>
                          )}

                          <div className={styles.matchMeta}>
                            <span className={styles.metaItem}>
                              <MapPin size={14} />
                              <span>{getRegionLabel(match.userInfo.region)}</span>
                            </span>
                            <span className={styles.metaItem}>
                              <DollarSign size={14} />
                              <span>{getPriceLabel(match.providerInfo.priceRange)}</span>
                            </span>
                          </div>
                        </div>

                          <div className={styles.matchActions}>
                            <button 
                              className={styles.viewDetailsButton}
                              onClick={() => handleViewDetails(match)}
                            >
                              <Eye size={16} />
                              <span>Ver detalles</span>
                            </button>
                            <div className={styles.actionButtons}>
                              <button 
                                className={styles.rejectButton}
                                onClick={() => handleRejectClick(match)}
                                disabled={processingId === match.id}
                                title="Descartar"
                              >
                                {processingId === match.id ? (
                                  <Loader2 size={16} className={styles.buttonSpinner} />
                                ) : (
                                  <X size={16} />
                                )}
                              </button>
                              <button 
                                className={styles.approveButton}
                                onClick={() => handleApprove(match.id)}
                                disabled={processingId === match.id}
                                title="Me interesa"
                              >
                                {processingId === match.id ? (
                                  <Loader2 size={16} className={styles.buttonSpinner} />
                                ) : (
                                  <>
                                    <Heart size={16} />
                                    <span>Me interesa</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
            
            {/* Botón para buscar nuevo proveedor (máximo 2 por día) */}
            {firebaseUser?.uid && (
              <section className={styles.section}>
                <ShowMoreButton
                  userId={firebaseUser.uid}
                  categoryId={categoryId}
                  onRequestNewMatch={handleRequestNewMatch}
                  isLoading={isGeneratingNew}
                  activeMatchesCount={activeMatchesCount}
                  maxActiveMatches={MAX_ACTIVE_MATCHES_PER_CATEGORY}
                  isBlocked={isModifyingActiveMatches}
                  availableProvidersCount={availableProvidersCount}
                  isLoadingAvailableCount={isLoadingAvailableCount}
                />
              </section>
            )}

            {/* Matches rechazados */}
            {rejectedMatches.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <X size={18} />
                  <span>Descartados</span>
                </h2>
                <p className={styles.sectionDescription}>
                  Proveedores que has descartado. {canAddMoreMatches 
                    ? 'Puedes cambiar de opinión cuando quieras.' 
                    : `Ya tienes ${MAX_ACTIVE_MATCHES_PER_CATEGORY} proveedores activos. Descarta uno para poder recuperar otro.`}
                </p>
                
                <div className={styles.matchesGridCompact}>
                  {rejectedMatches.map((match) => (
                    <div 
                      key={match.id} 
                      className={`${styles.matchCardCompact} ${styles.matchCardRejected}`}
                    >
                      <div className={styles.matchCardCompactContent}>
                        <h4 className={styles.providerNameCompact}>
                          {match.providerInfo.providerName}
                        </h4>
                        <span 
                          className={styles.matchBadgeCompact}
                          style={getMatchCategoryStylesCompact(match.matchScore)}
                        >
                          {getMatchCategory(match.matchScore).shortLabel}
                        </span>
                      </div>
                      <button 
                        className={`${styles.revertButtonCompact} ${(!canAddMoreMatches || isModifyingActiveMatches) ? styles.revertButtonDisabledLimit : ''}`}
                        onClick={() => handleRevert(match.id, true)}
                        disabled={processingId === match.id || isModifyingActiveMatches}
                        title={!canAddMoreMatches ? `Máximo ${MAX_ACTIVE_MATCHES_PER_CATEGORY} proveedores activos` : isModifyingActiveMatches ? 'Espera a que termine la acción actual' : 'Recuperar proveedor'}
                      >
                        {processingId === match.id ? (
                          <Loader2 size={14} className={styles.buttonSpinner} />
                        ) : (
                          <>
                            <RotateCcw size={14} />
                            <span>Recuperar</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Panel de detalles del proveedor - REDISEÑADO estilo matrimonios.cl */}
      {selectedMatch && (
        <div className={styles.providerModalOverlay} onClick={handleCloseDetails}>
          <div className={styles.providerModal} onClick={(e) => e.stopPropagation()}>
            {/* Botón cerrar - fijo */}
            <button className={styles.providerModalClose} onClick={handleCloseDetails}>
              <XCircle size={28} />
            </button>

            {loadingProviderDetails ? (
              <div className={styles.providerModalLoading}>
                <Loader2 size={40} className={styles.buttonSpinner} />
                <p>Cargando información del proveedor...</p>
              </div>
            ) : (
              /* Todo el contenido es scrolleable */
              <div className={styles.providerModalScrollContainer}>
                {/* Layout de dos columnas */}
                <div className={styles.providerModalLayout}>
                  {/* Columna izquierda - Galería de imágenes */}
                  <div className={styles.providerModalGallery}>
                    {/* Imagen principal */}
                    <div 
                      className={styles.providerModalMainImage}
                      onClick={() => {
                        const hasPortfolio = selectedMatch.providerDetails?.portfolioImages && selectedMatch.providerDetails.portfolioImages.length > 0;
                        if (hasPortfolio) {
                          setGalleryMatch(selectedMatch);
                        }
                      }}
                    >
                      {selectedMatch.providerDetails?.profileImage?.url ? (
                        <div 
                          className={styles.providerModalProfileImage}
                          style={{
                            backgroundImage: `url(${selectedMatch.providerDetails.profileImage.url})`,
                            ...calculateBackgroundStyles(selectedMatch.providerDetails.profileImage.cropData),
                          }}
                        />
                      ) : selectedMatch.providerDetails?.portfolioImages?.[0]?.url ? (
                        <img 
                          src={selectedMatch.providerDetails.portfolioImages[0].url} 
                          alt={selectedMatch.providerInfo.providerName}
                        />
                      ) : (
                        <img 
                          src={CATEGORY_IMAGES[categoryId] || CATEGORY_IMAGES.photography} 
                          alt={selectedMatch.providerInfo.providerName}
                        />
                      )}
                      {/* Badge de compatibilidad sobre la imagen */}
                      <div 
                        className={styles.providerModalMatchBadge}
                        style={getMatchCategoryStylesLarge(selectedMatch.matchScore)}
                      >
                        <Star size={14} />
                        <span>{getMatchCategory(selectedMatch.matchScore).label}</span>
                      </div>
                      {/* Botón ver todas */}
                      {(selectedMatch.providerDetails?.portfolioImages?.length ?? 0) > 1 && (
                        <button className={styles.providerModalViewAll}>
                          Ver todas
                        </button>
                      )}
                    </div>
                    {/* Miniaturas */}
                    {(selectedMatch.providerDetails?.portfolioImages?.length ?? 0) > 1 && (
                      <div className={styles.providerModalThumbnails}>
                        {selectedMatch.providerDetails?.portfolioImages?.slice(0, 4).map((img, idx) => (
                          <div 
                            key={img.key || idx} 
                            className={styles.providerModalThumb}
                            onClick={() => setGalleryMatch(selectedMatch)}
                          >
                            <img src={img.url} alt={`${selectedMatch.providerInfo.providerName} ${idx + 1}`} />
                            {idx === 3 && (selectedMatch.providerDetails?.portfolioImages?.length ?? 0) > 4 && (
                              <div className={styles.providerModalThumbMore}>
                                +{(selectedMatch.providerDetails?.portfolioImages?.length ?? 0) - 4}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Columna derecha - Información */}
                  <div className={styles.providerModalInfo}>
                    {/* Header con nombre y verificación */}
                    <div className={styles.providerModalHeader}>
                      <h2 className={styles.providerModalName}>
                        {selectedMatch.providerInfo.providerName}
                      </h2>
                      {(selectedMatch.providerDetails?.isVerified || selectedMatch.providerInfo?.isVerified) && (
                        <span className={styles.providerModalVerified}>
                          <BadgeCheck size={16} />
                          <span>Verificado</span>
                        </span>
                      )}
                    </div>

                    {/* Categoría */}
                    <p className={styles.providerModalCategory}>
                      {categoryInfo?.name}
                    </p>

                    {/* Ubicación */}
                    <div className={styles.providerModalLocation}>
                      <MapPin size={16} />
                      <span>{getRegionLabel(selectedMatch.providerDetails?.workRegion || selectedMatch.userInfo.region)}</span>
                      {selectedMatch.providerDetails?.acceptsOutsideZone && (
                        <span className={styles.providerModalLocationExtra}>
                          · También en otras regiones
                        </span>
                      )}
                    </div>

                    {/* Tarjetas de información rápida */}
                    <div className={styles.providerModalQuickInfo}>
                      {/* Precio - mostrar rango exacto de la encuesta si está disponible */}
                      {(() => {
                        const priceFields = getPriceFieldsForCategory(categoryId);
                        const surveyResponses = selectedMatch.providerSurveyData?.responses;
                        const priceMin = surveyResponses?.[priceFields.min] as number | undefined;
                        const priceMax = surveyResponses?.[priceFields.max] as number | undefined;
                        
                        // Si tenemos precios de la encuesta, mostrar el rango exacto
                        if (priceMin && priceMax && priceMin !== priceMax) {
                          return (
                            <div className={styles.providerModalInfoCard}>
                              <DollarSign size={20} />
                              <div>
                                <span className={styles.providerModalInfoLabel}>{priceFields.label}</span>
                                <span className={styles.providerModalInfoValue}>
                                  {formatPrice(priceMin)} - {formatPrice(priceMax)}
                                </span>
                              </div>
                            </div>
                          );
                        } else if (priceMin) {
                          return (
                            <div className={styles.providerModalInfoCard}>
                              <DollarSign size={20} />
                              <div>
                                <span className={styles.providerModalInfoLabel}>{priceFields.label}</span>
                                <span className={styles.providerModalInfoValue}>
                                  Desde {formatPrice(priceMin)}
                                </span>
                              </div>
                            </div>
                          );
                        } else {
                          // Fallback al rango descriptivo del perfil
                          return (
                            <div className={styles.providerModalInfoCard}>
                              <DollarSign size={20} />
                              <div>
                                <span className={styles.providerModalInfoLabel}>Rango de precio</span>
                                <span className={styles.providerModalInfoValue}>
                                  {getPriceLabel(selectedMatch.providerInfo.priceRange)}
                                </span>
                              </div>
                            </div>
                          );
                        }
                      })()}
                      {/* Capacidad del venue - si está disponible en la encuesta */}
                      {categoryId === 'venue' && (() => {
                        const surveyResponses = selectedMatch.providerSurveyData?.responses;
                        const capacityMin = surveyResponses?.['venue_p_capacity_min'] as number | undefined;
                        const capacityMax = surveyResponses?.['venue_p_capacity_max'] as number | undefined;
                        
                        if (capacityMin && capacityMax) {
                          return (
                            <div className={styles.providerModalInfoCard}>
                              <Users size={20} />
                              <div>
                                <span className={styles.providerModalInfoLabel}>Capacidad</span>
                                <span className={styles.providerModalInfoValue}>
                                  {capacityMin} a {capacityMax} personas
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      {/* Estilo */}
                      {selectedMatch.providerDetails?.serviceStyle && (
                        <div className={styles.providerModalInfoCard}>
                          <Sparkles size={20} />
                          <div>
                            <span className={styles.providerModalInfoLabel}>Estilo</span>
                            <span className={styles.providerModalInfoValue}>
                              {getStyleLabel(selectedMatch.providerDetails.serviceStyle)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botón principal de acción - NO cierra el modal */}
                    {selectedMatch.status === 'pending' && (
                      <button 
                        className={styles.providerModalCTA}
                        onClick={() => {
                          handleApprove(selectedMatch.id);
                          // NO cerrar el modal - actualizar el estado in-place
                        }}
                        disabled={processingId === selectedMatch.id}
                      >
                        {processingId === selectedMatch.id ? (
                          <>
                            <Loader2 size={18} className={styles.buttonSpinner} />
                            <span>Procesando...</span>
                          </>
                        ) : (
                          <>
                            <Heart size={18} />
                            <span>Solicitar presupuesto</span>
                          </>
                        )}
                      </button>
                    )}
                    {selectedMatch.status === 'approved' && (
                      <div className={styles.providerModalApprovedBadge}>
                        <Heart size={16} />
                        <span>¡Ya mostraste interés!</span>
                      </div>
                    )}

                    {/* Redes sociales */}
                    {(selectedMatch.providerDetails?.website || selectedMatch.providerDetails?.instagram) && (
                      <div className={styles.providerModalSocial}>
                        {selectedMatch.providerDetails?.website && (
                          <a 
                            href={selectedMatch.providerDetails.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.providerModalSocialLink}
                          >
                            <Globe size={18} />
                          </a>
                        )}
                        {selectedMatch.providerDetails?.instagram && (
                          <a 
                            href={`https://instagram.com/${selectedMatch.providerDetails.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.providerModalSocialLink}
                          >
                            <Instagram size={18} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Descripción debajo de las columnas */}
                {selectedMatch.providerDetails?.description && (
                  <div className={styles.providerModalDescriptionSection}>
                    <p className={styles.providerModalDescription}>
                      {selectedMatch.providerDetails.description}
                    </p>
                  </div>
                )}

                {/* Servicios que ofrece */}
                {selectedMatch.providerInfo.categories && selectedMatch.providerInfo.categories.length > 0 && (
                  <div className={styles.providerModalSection}>
                    <h3 className={styles.providerModalSectionTitle}>Servicios que ofrece</h3>
                    <div className={styles.providerModalServices}>
                      {selectedMatch.providerInfo.categories.map((cat) => {
                        const catInfo = getCategoryInfo(cat as CategoryId);
                        return catInfo ? (
                          <span key={cat} className={styles.providerModalServiceTag}>
                            {catInfo.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Contacto - Solo visible si está aprobado */}
                {selectedMatch.status === 'approved' && (
                  <div className={styles.providerModalContactSection}>
                    <h3 className={styles.providerModalSectionTitle}>Contacto</h3>
                    <div className={styles.providerModalContactGrid}>
                      {selectedMatch.providerDetails?.email && (
                        <a 
                          href={`mailto:${selectedMatch.providerDetails.email}`}
                          className={styles.providerModalContactItem}
                        >
                          <Mail size={18} />
                          <span>{selectedMatch.providerDetails.email}</span>
                        </a>
                      )}
                      {selectedMatch.providerDetails?.phone && (
                        <a 
                          href={`tel:${selectedMatch.providerDetails.phone}`}
                          className={styles.providerModalContactItem}
                        >
                          <Phone size={18} />
                          <span>{selectedMatch.providerDetails.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Mensaje si no está aprobado */}
                {selectedMatch.status !== 'approved' && (
                  <div className={styles.providerModalNotice}>
                    <Heart size={18} />
                    <p>
                      Solicita presupuesto para ver la información de contacto completa de este proveedor.
                    </p>
                  </div>
                )}

                {/* Footer con acciones secundarias */}
                <div className={styles.providerModalFooter}>
                  {selectedMatch.status === 'pending' && (
                    <button 
                      className={styles.providerModalSecondaryBtn}
                      onClick={() => {
                        handleCloseDetails();
                        handleRejectClick(selectedMatch);
                      }}
                      disabled={processingId === selectedMatch.id}
                    >
                      <X size={16} />
                      <span>No me interesa</span>
                    </button>
                  )}
                  {selectedMatch.status === 'approved' && (
                    <button 
                      className={styles.providerModalSecondaryBtn}
                      onClick={() => {
                        handleRevert(selectedMatch.id);
                        handleCloseDetails();
                      }}
                      disabled={processingId === selectedMatch.id}
                    >
                      <RotateCcw size={16} />
                      <span>Cambiar de opinión</span>
                    </button>
                  )}
                  {selectedMatch.status === 'rejected' && (
                    <button 
                      className={`${styles.providerModalRecoverBtn} ${(!canAddMoreMatches || isModifyingActiveMatches) ? styles.providerModalRecoverBtnDisabled : ''}`}
                      onClick={() => {
                        if (isModifyingActiveMatches) return;
                        if (!canAddMoreMatches) {
                          setShowLimitModal(true);
                          handleCloseDetails();
                        } else {
                          handleRevert(selectedMatch.id, true);
                          handleCloseDetails();
                        }
                      }}
                      disabled={processingId === selectedMatch.id || isModifyingActiveMatches}
                    >
                      <RotateCcw size={16} />
                      <span>{isModifyingActiveMatches ? 'Procesando...' : canAddMoreMatches ? 'Recuperar proveedor' : `Límite alcanzado`}</span>
                    </button>
                  )}
                </div>
              </div>
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
      {galleryMatch && galleryMatch.providerDetails?.portfolioImages && (
        <PortfolioGallery
          images={galleryMatch.providerDetails.portfolioImages}
          providerName={galleryMatch.providerInfo.providerName}
          autoOpen={true}
          onClose={() => setGalleryMatch(null)}
        />
      )}
      
      {/* NUEVO: Modal de límite de matches activos alcanzado */}
      {showLimitModal && (
        <div className={styles.confirmOverlay} onClick={() => setShowLimitModal(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.limitModalIcon}>
              <AlertTriangle size={32} />
            </div>
            <h3 className={styles.confirmTitle}>Límite de proveedores alcanzado</h3>
            <p className={styles.confirmText}>
              Ya tienes <strong>{MAX_ACTIVE_MATCHES_PER_CATEGORY} proveedores activos</strong> en esta categoría. 
              Este es el máximo permitido para que puedas enfocarte en las mejores opciones.
            </p>
            <p className={styles.limitModalHint}>
              Para agregar otro proveedor, primero descarta uno de los que tienes pendientes o que ya te interesan.
            </p>
            <div className={styles.confirmActions}>
              <button 
                className={styles.limitModalButton}
                onClick={() => setShowLimitModal(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

