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
  XCircle
} from 'lucide-react';
import { useAuthStore, CategoryId, UserProfile, ProviderProfile } from '@/store/authStore';
import { CATEGORY_INFO, getCategoryInfo } from '@/lib/surveys';
import { getUserLeadsByCategory, Lead, updateLeadStatus } from '@/lib/firebase/firestore';
import { REGIONS, PRICE_RANGES_PROVIDER, SERVICE_STYLES } from '@/store/wizardStore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import styles from './page.module.css';

/**
 * Página de matches por categoría para usuarios.
 * Muestra los proveedores recomendados después de completar la encuesta.
 */
// Interfaz extendida para incluir datos completos del proveedor
interface ExtendedLead extends Lead {
  providerDetails?: ProviderProfile;
}

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

  // Cargar matches de esta categoría
  useEffect(() => {
    const loadMatches = async () => {
      if (!firebaseUser?.uid || !categoryId) return;

      try {
        setLoadingMatches(true);
        const categoryMatches = await getUserLeadsByCategory(firebaseUser.uid, categoryId);
        setMatches(categoryMatches);
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

  // Aprobar match
  const handleApprove = async (leadId: string) => {
    try {
      setProcessingId(leadId);
      await updateLeadStatus(leadId, 'approved');
      setMatches(prev => prev.map(m => 
        m.id === leadId ? { ...m, status: 'approved' as const } : m
      ));
    } catch (error) {
      console.error('Error aprobando match:', error);
    } finally {
      setProcessingId(null);
    }
  };

  // Rechazar match
  const handleReject = async (leadId: string) => {
    try {
      setProcessingId(leadId);
      await updateLeadStatus(leadId, 'rejected');
      setMatches(prev => prev.map(m => 
        m.id === leadId ? { ...m, status: 'rejected' as const } : m
      ));
    } catch (error) {
      console.error('Error rechazando match:', error);
    } finally {
      setProcessingId(null);
    }
  };

  // Revertir estado a pendiente
  const handleRevert = async (leadId: string) => {
    try {
      setProcessingId(leadId);
      await updateLeadStatus(leadId, 'pending');
      setMatches(prev => prev.map(m => 
        m.id === leadId ? { ...m, status: 'pending' as const } : m
      ));
    } catch (error) {
      console.error('Error revirtiendo estado:', error);
    } finally {
      setProcessingId(null);
    }
  };

  // Abrir panel de detalles del proveedor
  const handleViewDetails = async (match: ExtendedLead) => {
    setSelectedMatch(match);
    
    // Cargar detalles completos del proveedor si no los tenemos
    if (!match.providerDetails) {
      setLoadingProviderDetails(true);
      try {
        const providerDoc = await getDoc(doc(db, 'providers', match.providerId));
        if (providerDoc.exists()) {
          const providerData = {
            id: providerDoc.id,
            type: 'provider' as const,
            ...providerDoc.data(),
          } as ProviderProfile;
          
          // Actualizar el match con los detalles del proveedor
          setMatches(prev => prev.map(m => 
            m.id === match.id ? { ...m, providerDetails: providerData } : m
          ));
          setSelectedMatch({ ...match, providerDetails: providerData });
        }
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
      {/* Header */}
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.backButton}>
          <ChevronLeft size={20} />
          <span>Volver al dashboard</span>
        </Link>
        
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            Matches de {categoryInfo.name}
          </h1>
          <p className={styles.subtitle}>
            Proveedores recomendados basados en tus preferencias
          </p>
        </div>
      </header>

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
              Volver al dashboard
            </Link>
          </div>
        ) : (
          <>
            {/* Matches pendientes */}
            {pendingMatches.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <Sparkles size={18} />
                  <span>Nuevos matches</span>
                  <span className={styles.badge}>{pendingMatches.length}</span>
                </h2>
                <p className={styles.sectionDescription}>
                  Revisa estos proveedores y decide si quieres contactarlos
                </p>
                
                <div className={styles.matchesGrid}>
                  {pendingMatches.map((match, index) => (
                    <div 
                      key={match.id} 
                      className={styles.matchCard}
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div className={styles.matchHeader}>
                        <div className={styles.matchScore}>
                          <Star size={14} />
                          <span>{match.matchScore}% compatible</span>
                        </div>
                      </div>

                      <div className={styles.matchBody}>
                        <h3 className={styles.providerName}>
                          {match.providerInfo.providerName}
                        </h3>

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
                            onClick={() => handleReject(match.id)}
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
                  ))}
                </div>
              </section>
            )}

            {/* Matches aprobados - con info de contacto */}
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
                  {approvedMatches.map((match) => (
                    <div 
                      key={match.id} 
                      className={`${styles.matchCard} ${styles.matchCardApproved}`}
                    >
                      <div className={styles.matchHeader}>
                        <div className={styles.matchScore}>
                          <Star size={14} />
                          <span>{match.matchScore}%</span>
                        </div>
                        <span className={styles.statusBadgeApproved}>
                          <Heart size={12} />
                          <span>Te interesa</span>
                        </span>
                      </div>

                      <div className={styles.matchBody}>
                        <h3 className={styles.providerName}>
                          {match.providerInfo.providerName}
                        </h3>

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
                          <span>Ver contacto</span>
                          <ChevronRight size={14} />
                        </button>
                        <button 
                          className={styles.revertButton}
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
                      </div>
                    </div>
                  ))}
                </div>
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
                  Proveedores que has descartado. Puedes cambiar de opinión cuando quieras.
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
                        <span className={styles.matchScoreCompact}>
                          {match.matchScore}%
                        </span>
                      </div>
                      <button 
                        className={styles.revertButtonCompact}
                        onClick={() => handleRevert(match.id)}
                        disabled={processingId === match.id}
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

      {/* Panel de detalles del proveedor */}
      {selectedMatch && (
        <div className={styles.detailsOverlay} onClick={handleCloseDetails}>
          <div className={styles.detailsPanel} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={handleCloseDetails}>
              <XCircle size={24} />
            </button>

            {loadingProviderDetails ? (
              <div className={styles.detailsLoading}>
                <Loader2 size={32} className={styles.buttonSpinner} />
                <p>Cargando información del proveedor...</p>
              </div>
            ) : (
              <>
                {/* Header del panel */}
                <div className={styles.detailsHeader}>
                  <div className={styles.detailsScore}>
                    <Star size={20} />
                    <span>{selectedMatch.matchScore}%</span>
                    <span className={styles.detailsScoreLabel}>compatible</span>
                  </div>
                  <h2 className={styles.detailsTitle}>
                    {selectedMatch.providerInfo.providerName}
                  </h2>
                  <p className={styles.detailsSubtitle}>
                    {categoryInfo?.name}
                  </p>
                </div>

                {/* Información del proveedor */}
                <div className={styles.detailsContent}>
                  {/* Descripción */}
                  {selectedMatch.providerDetails?.description && (
                    <div className={styles.detailsSection}>
                      <h3>Sobre este proveedor</h3>
                      <p className={styles.detailsDescription}>
                        {selectedMatch.providerDetails.description}
                      </p>
                    </div>
                  )}

                  {/* Información básica */}
                  <div className={styles.detailsSection}>
                    <h3>Información</h3>
                    <div className={styles.detailsGrid}>
                      <div className={styles.detailsItem}>
                        <MapPin size={16} />
                        <div>
                          <span className={styles.detailsLabel}>Región principal</span>
                          <span className={styles.detailsValue}>
                            {getRegionLabel(selectedMatch.providerDetails?.workRegion || selectedMatch.userInfo.region)}
                          </span>
                        </div>
                      </div>
                      {selectedMatch.providerDetails?.acceptsOutsideZone && (
                        <div className={styles.detailsItem}>
                          <MapPinned size={16} />
                          <div>
                            <span className={styles.detailsLabel}>Cobertura</span>
                            <span className={styles.detailsValue}>
                              Disponible en otras regiones
                            </span>
                          </div>
                        </div>
                      )}
                      <div className={styles.detailsItem}>
                        <DollarSign size={16} />
                        <div>
                          <span className={styles.detailsLabel}>Rango de precios</span>
                          <span className={styles.detailsValue}>
                            {getPriceLabel(selectedMatch.providerInfo.priceRange)}
                          </span>
                        </div>
                      </div>
                      {selectedMatch.providerDetails?.serviceStyle && (
                        <div className={styles.detailsItem}>
                          <Sparkles size={16} />
                          <div>
                            <span className={styles.detailsLabel}>Estilo</span>
                            <span className={styles.detailsValue}>
                              {getStyleLabel(selectedMatch.providerDetails.serviceStyle)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contacto - Solo visible si está aprobado */}
                  {selectedMatch.status === 'approved' && (
                    <div className={styles.detailsSection}>
                      <h3>Contacto</h3>
                      <div className={styles.contactButtons}>
                        {selectedMatch.providerDetails?.email && (
                          <a 
                            href={`mailto:${selectedMatch.providerDetails.email}`}
                            className={styles.contactButton}
                          >
                            <Mail size={18} />
                            <span>{selectedMatch.providerDetails.email}</span>
                          </a>
                        )}
                        {selectedMatch.providerDetails?.phone && (
                          <a 
                            href={`tel:${selectedMatch.providerDetails.phone}`}
                            className={styles.contactButton}
                          >
                            <Phone size={18} />
                            <span>{selectedMatch.providerDetails.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Redes sociales y web */}
                  {(selectedMatch.providerDetails?.website || selectedMatch.providerDetails?.instagram) && (
                    <div className={styles.detailsSection}>
                      <h3>Conoce más</h3>
                      <div className={styles.socialLinks}>
                        {selectedMatch.providerDetails?.website && (
                          <a 
                            href={selectedMatch.providerDetails.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialLink}
                          >
                            <Globe size={18} />
                            <span>Sitio web</span>
                            <ExternalLink size={14} />
                          </a>
                        )}
                        {selectedMatch.providerDetails?.instagram && (
                          <a 
                            href={`https://instagram.com/${selectedMatch.providerDetails.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialLink}
                          >
                            <Instagram size={18} />
                            <span>{selectedMatch.providerDetails.instagram}</span>
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mensaje si no está aprobado */}
                  {selectedMatch.status !== 'approved' && (
                    <div className={styles.detailsNotice}>
                      <Heart size={20} />
                      <p>
                        Marca este proveedor como &quot;Me interesa&quot; para ver su información de contacto completa.
                      </p>
                    </div>
                  )}
                </div>

                {/* Acciones del panel */}
                <div className={styles.detailsActions}>
                  {selectedMatch.status === 'pending' && (
                    <>
                      <button 
                        className={styles.detailsRejectButton}
                        onClick={() => {
                          handleReject(selectedMatch.id);
                          handleCloseDetails();
                        }}
                        disabled={processingId === selectedMatch.id}
                      >
                        <X size={16} />
                        <span>Descartar</span>
                      </button>
                      <button 
                        className={styles.detailsApproveButton}
                        onClick={() => {
                          handleApprove(selectedMatch.id);
                          handleCloseDetails();
                        }}
                        disabled={processingId === selectedMatch.id}
                      >
                        <Heart size={16} />
                        <span>Me interesa</span>
                      </button>
                    </>
                  )}
                  {selectedMatch.status === 'approved' && (
                    <button 
                      className={styles.detailsRevertButton}
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
                      className={styles.detailsRecoverButton}
                      onClick={() => {
                        handleRevert(selectedMatch.id);
                        handleCloseDetails();
                      }}
                      disabled={processingId === selectedMatch.id}
                    >
                      <RotateCcw size={16} />
                      <span>Recuperar proveedor</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

