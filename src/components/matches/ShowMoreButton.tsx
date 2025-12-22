'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Clock, Plus, AlertCircle, SearchX } from 'lucide-react';
import { 
  canSearchMoreProviders, 
  getRemainingSearches, 
  formatTimeUntilReset,
  getSearchesUsedCount,
  DAILY_SEARCH_LIMIT,
  MAX_ACTIVE_MATCHES_PER_CATEGORY
} from '@/utils/matchLimits';
import styles from './ShowMoreButton.module.css';

interface ShowMoreButtonProps {
  userId: string;
  categoryId: string;
  onRequestNewMatch: () => Promise<boolean>; // Retorna true si se generó un nuevo match
  isLoading?: boolean;
  activeMatchesCount?: number; // Cantidad de matches activos (approved + pending)
  maxActiveMatches?: number; // Máximo de matches activos permitidos
  isBlocked?: boolean; // Bloquear cuando hay otra acción de recuperación en curso
  availableProvidersCount?: number; // Cantidad de proveedores disponibles que aún no se han mostrado
  isLoadingAvailableCount?: boolean; // Si está cargando el conteo de proveedores disponibles
}

/**
 * Botón para solicitar un nuevo proveedor.
 * Límite: 2 búsquedas por día por categoría.
 * Los 3 leads iniciales de la encuesta NO cuentan contra este límite.
 */
export default function ShowMoreButton({
  userId,
  categoryId,
  onRequestNewMatch,
  isLoading = false,
  activeMatchesCount = 0,
  maxActiveMatches = MAX_ACTIVE_MATCHES_PER_CATEGORY,
  isBlocked = false,
  availableProvidersCount,
  isLoadingAvailableCount = false,
}: ShowMoreButtonProps) {
  const [canSearch, setCanSearch] = useState(false);
  const [remainingSearches, setRemainingSearches] = useState(0);
  const [searchesUsed, setSearchesUsed] = useState(0);
  const [timeUntilReset, setTimeUntilReset] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [noMoreProviders, setNoMoreProviders] = useState(false);
  
  // NUEVO: Determinar si hay proveedores disponibles basado en el conteo externo
  // Si availableProvidersCount es undefined, aún no sabemos (compatibilidad hacia atrás)
  // Si es 0, definitivamente no hay más proveedores
  const hasAvailableProviders = availableProvidersCount === undefined || availableProvidersCount > 0;

  // Actualizar estado de límites
  const updateLimitsState = () => {
    if (!userId || !categoryId) return;
    
    const canDo = canSearchMoreProviders(userId, categoryId);
    const remaining = getRemainingSearches(userId, categoryId);
    const used = getSearchesUsedCount(userId, categoryId);
    const timeLeft = formatTimeUntilReset(userId, categoryId);
    
    setCanSearch(canDo);
    setRemainingSearches(remaining);
    setSearchesUsed(used);
    setTimeUntilReset(timeLeft);
  };

  // Actualizar al montar y cuando cambian las props
  useEffect(() => {
    updateLimitsState();
    
    // Actualizar cada minuto para el contador de tiempo
    const interval = setInterval(updateLimitsState, 60000);
    return () => clearInterval(interval);
  }, [userId, categoryId]);

  // Manejar click en el botón
  const handleClick = async () => {
    if (!canSearch || requesting || isLoading || noMoreProviders || isBlocked) return;
    
    setRequesting(true);
    try {
      const success = await onRequestNewMatch();
      if (success) {
        // Actualizar estado después de generar nuevo match
        updateLimitsState();
        setNoMoreProviders(false);
      } else {
        // No se encontraron más proveedores disponibles
        setNoMoreProviders(true);
      }
    } catch (error) {
      console.error('Error solicitando nuevo match:', error);
    } finally {
      setRequesting(false);
    }
  };

  // Verificar si tiene el máximo de matches activos
  const hasReachedActiveLimit = activeMatchesCount >= maxActiveMatches;
  
  // Puede buscar si: tiene búsquedas disponibles Y no tiene máximo de activos Y no está bloqueado Y hay proveedores disponibles
  const canRequestNew = canSearch && !hasReachedActiveLimit && !isBlocked && hasAvailableProviders;

  // NUEVO: Si está cargando el conteo de proveedores disponibles, mostrar loading
  if (isLoadingAvailableCount) {
    return (
      <div className={styles.container}>
        <div className={styles.slotsInfo}>
          <RefreshCw size={16} className={styles.spinning} />
          <span className={styles.slotsText}>Verificando proveedores disponibles...</span>
        </div>
      </div>
    );
  }

  // NUEVO: Si sabemos que no hay más proveedores disponibles (conteo = 0), no mostrar el botón
  // Esto evita que el usuario gaste búsquedas innecesariamente
  if (availableProvidersCount === 0 || noMoreProviders) {
    return (
      <div className={styles.limitReached}>
        <div className={styles.limitIcon}>
          <SearchX size={20} />
        </div>
        <div className={styles.limitContent}>
          <p className={styles.limitTitle}>No hay más proveedores disponibles</p>
          <p className={styles.limitText}>
            Ya has visto todos los proveedores que coinciden con tus preferencias en esta categoría.
          </p>
        </div>
      </div>
    );
  }

  // Si ya usó las 2 búsquedas del día
  if (!canSearch) {
    return (
      <div className={styles.limitReached}>
        <div className={styles.limitIcon}>
          <Clock size={20} />
        </div>
        <div className={styles.limitContent}>
          <p className={styles.limitTitle}>Búsquedas agotadas por hoy</p>
          <p className={styles.limitText}>
            Has usado tus {DAILY_SEARCH_LIMIT} búsquedas de hoy en esta categoría.
          </p>
          <p className={styles.limitTime}>
            <Clock size={14} />
            <span>Podrás buscar más en {timeUntilReset}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Mostrar búsquedas disponibles */}
      <div className={styles.slotsInfo}>
        <span className={styles.slotsCount}>
          {remainingSearches} / {DAILY_SEARCH_LIMIT}
        </span>
        <span className={styles.slotsText}>búsquedas disponibles hoy</span>
      </div>
      
      {/* Botón para buscar nuevo proveedor */}
      {canRequestNew && (
        <button
          type="button"
          className={styles.button}
          onClick={handleClick}
          disabled={requesting || isLoading || isBlocked}
          title={isBlocked ? 'Espera a que termine la acción actual' : undefined}
        >
          {requesting || isLoading ? (
            <>
              <RefreshCw size={18} className={styles.spinning} />
              <span>Buscando...</span>
            </>
          ) : isBlocked ? (
            <>
              <RefreshCw size={18} className={styles.spinning} />
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <Plus size={18} />
              <span>Mostrar nuevo proveedor</span>
            </>
          )}
        </button>
      )}
      
      {/* Mensaje cuando alcanzó el límite de matches activos (3) */}
      {hasReachedActiveLimit && (
        <p className={styles.warning}>
          <AlertCircle size={14} />
          <span>Tienes {maxActiveMatches} proveedores activos. Descarta uno para ver más opciones.</span>
        </p>
      )}
    </div>
  );
}





