'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Clock, Plus, AlertCircle, SearchX } from 'lucide-react';
import { 
  canShowMoreProviders, 
  getRemainingSlots, 
  formatTimeUntilReset,
  getProvidersShownCount,
  MATCH_LIMIT_PER_CATEGORY,
  INITIAL_MATCHES_COUNT,
  EXTRA_MATCHES_ALLOWED,
  MAX_ACTIVE_MATCHES_PER_CATEGORY
} from '@/utils/matchLimits';
import styles from './ShowMoreButton.module.css';

interface ShowMoreButtonProps {
  userId: string;
  categoryId: string;
  onRequestNewMatch: () => Promise<boolean>; // Retorna true si se generó un nuevo match
  isLoading?: boolean;
  currentMatchesCount?: number; // Cantidad actual de matches (leads) en esta categoría
  activeMatchesCount?: number; // NUEVO: cantidad de matches activos (approved + pending)
  maxActiveMatches?: number; // NUEVO: máximo de matches activos permitidos
  isBlocked?: boolean; // NUEVO: bloquear cuando hay otra acción de recuperación en curso
}

/**
 * Botón para solicitar un nuevo match dentro del límite de 5 por categoría cada 24 horas.
 * Muestra el estado actual del límite y tiempo restante si se alcanzó.
 * CAMBIO: Ahora muestra x/5 donde x es la cantidad de matches (leads) reales, no proveedores vistos.
 */
export default function ShowMoreButton({
  userId,
  categoryId,
  onRequestNewMatch,
  isLoading = false,
  currentMatchesCount = 0,
  activeMatchesCount = 0,
  maxActiveMatches = MAX_ACTIVE_MATCHES_PER_CATEGORY,
  isBlocked = false,
}: ShowMoreButtonProps) {
  const [canShowMore, setCanShowMore] = useState(false);
  const [remainingSlots, setRemainingSlots] = useState(0);
  const [timeUntilReset, setTimeUntilReset] = useState('');
  const [providersShown, setProvidersShown] = useState(0);
  const [requesting, setRequesting] = useState(false);
  const [noMoreProviders, setNoMoreProviders] = useState(false); // Estado para cuando no hay más proveedores

  // Actualizar estado de límites
  const updateLimitsState = () => {
    if (!userId || !categoryId) return;
    
    const canShow = canShowMoreProviders(userId, categoryId);
    const remaining = getRemainingSlots(userId, categoryId);
    const shown = getProvidersShownCount(userId, categoryId);
    const timeLeft = formatTimeUntilReset(userId, categoryId);
    
    setCanShowMore(canShow);
    setRemainingSlots(remaining);
    setProvidersShown(shown);
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
    // NUEVO: También verificar isBlocked para evitar acciones simultáneas
    if (!canShowMore || requesting || isLoading || noMoreProviders || isBlocked) return;
    
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

  // Si no hay más proveedores disponibles
  if (noMoreProviders) {
    return (
      <div className={styles.limitReached}>
        <div className={styles.limitIcon}>
          <SearchX size={20} />
        </div>
        <div className={styles.limitContent}>
          <p className={styles.limitTitle}>No se encontraron más proveedores disponibles</p>
          <p className={styles.limitText}>
            Ya has visto todos los proveedores que coinciden con tus preferencias en esta categoría.
          </p>
        </div>
      </div>
    );
  }

  // Si ya se alcanzó el límite diario
  if (!canShowMore) {
    return (
      <div className={styles.limitReached}>
        <div className={styles.limitIcon}>
          <Clock size={20} />
        </div>
        <div className={styles.limitContent}>
          <p className={styles.limitTitle}>Límite alcanzado</p>
          <p className={styles.limitText}>
            Has visto {MATCH_LIMIT_PER_CATEGORY} proveedores hoy en esta categoría.
          </p>
          <p className={styles.limitTime}>
            <Clock size={14} />
            <span>Podrás ver más en {timeUntilReset}</span>
          </p>
        </div>
      </div>
    );
  }

  // CAMBIO: Mostrar cantidad de matches reales (x/5) donde x es la cantidad de leads/matches
  // Solo muestra 0/5 cuando se reinician los matches (cada 24 horas)
  const displayCount = currentMatchesCount > 0 ? currentMatchesCount : providersShown;
  
  // CAMBIO: Calcular cuántos extras ya se han usado (matches actuales - 3 iniciales)
  const extrasUsed = Math.max(0, currentMatchesCount - INITIAL_MATCHES_COUNT);
  const extrasRemaining = EXTRA_MATCHES_ALLOWED - extrasUsed;
  
  // NUEVO: También verificar que no se exceda el límite de matches activos (3)
  const hasReachedActiveLimit = activeMatchesCount >= maxActiveMatches;
  // NUEVO: También bloquear si hay otra acción en curso (ej: recuperando un match)
  const canRequestExtra = extrasRemaining > 0 && canShowMore && !hasReachedActiveLimit && !isBlocked;
  
  return (
    <div className={styles.container}>
      <div className={styles.slotsInfo}>
        <span className={styles.slotsCount}>
          {displayCount} / {MATCH_LIMIT_PER_CATEGORY}
        </span>
        <span className={styles.slotsText}>matches en esta categoría</span>
      </div>
      
      {/* Solo mostrar botón si puede solicitar extras (máximo 2) */}
      {canRequestExtra && (
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
              <span>Mostrar nuevo proveedor ({extrasRemaining} disponible{extrasRemaining !== 1 ? 's' : ''})</span>
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
      
      {/* Mensaje cuando no puede solicitar más extras por límite diario */}
      {!canRequestExtra && !hasReachedActiveLimit && currentMatchesCount >= INITIAL_MATCHES_COUNT && (
        <p className={styles.warning}>
          <AlertCircle size={14} />
          <span>Has alcanzado el máximo de {MATCH_LIMIT_PER_CATEGORY} proveedores en esta categoría</span>
        </p>
      )}
    </div>
  );
}





