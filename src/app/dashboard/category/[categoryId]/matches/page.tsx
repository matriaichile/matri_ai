'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Check, 
  X, 
  Star, 
  MapPin, 
  DollarSign, 
  ExternalLink,
  ChevronLeft,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useAuthStore, CategoryId, UserProfile } from '@/store/authStore';
import { CATEGORY_INFO, getCategoryInfo } from '@/lib/surveys';
import { getUserLeadsByCategory, Lead, updateLeadStatus } from '@/lib/firebase/firestore';
import { REGIONS, PRICE_RANGES_PROVIDER } from '@/store/wizardStore';
import styles from './page.module.css';

/**
 * Página de matches por categoría para usuarios.
 * Muestra los proveedores recomendados después de completar la encuesta.
 */
export default function CategoryMatchesPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.categoryId as CategoryId;
  
  const { isAuthenticated, userProfile, userType, isLoading, firebaseUser } = useAuthStore();
  const [matches, setMatches] = useState<Lead[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  // Helpers
  const getRegionLabel = (id: string) => REGIONS.find((r) => r.id === id)?.label || id;
  const getPriceLabel = (id: string) => PRICE_RANGES_PROVIDER.find((p) => p.id === id)?.label || id;

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
  const processedMatches = matches.filter(m => m.status !== 'pending');

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.backButton}>
          <ChevronLeft size={20} />
          <span>Volver</span>
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
                  <span>Nuevos matches</span>
                  <span className={styles.badge}>{pendingMatches.length}</span>
                </h2>
                
                <div className={styles.matchesGrid}>
                  {pendingMatches.map((match, index) => (
                    <div 
                      key={match.id} 
                      className={styles.matchCard}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className={styles.matchHeader}>
                        <div className={styles.matchScore}>
                          <Star size={16} />
                          <span>{match.matchScore}%</span>
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
                          className={styles.rejectButton}
                          onClick={() => handleReject(match.id)}
                          disabled={processingId === match.id}
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
                        >
                          {processingId === match.id ? (
                            <Loader2 size={16} className={styles.buttonSpinner} />
                          ) : (
                            <>
                              <Check size={16} />
                              <span>Aprobar</span>
                            </>
                          )}
                        </button>
                        <button className={styles.detailsButton}>
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Matches procesados */}
            {processedMatches.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <span>Matches procesados</span>
                </h2>
                
                <div className={styles.matchesGrid}>
                  {processedMatches.map((match) => (
                    <div 
                      key={match.id} 
                      className={`${styles.matchCard} ${styles.matchCardProcessed}`}
                    >
                      <div className={styles.matchHeader}>
                        <div className={styles.matchScore}>
                          <Star size={16} />
                          <span>{match.matchScore}%</span>
                        </div>
                        <span className={`${styles.statusBadge} ${styles[`status${match.status.charAt(0).toUpperCase() + match.status.slice(1)}`]}`}>
                          {match.status === 'approved' && <Check size={12} />}
                          {match.status === 'rejected' && <X size={12} />}
                          <span>
                            {match.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                          </span>
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
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

