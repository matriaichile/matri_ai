'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Clock, Plus, AlertCircle } from 'lucide-react';
import { 
  canShowMoreProviders, 
  getRemainingSlots, 
  formatTimeUntilReset,
  getProvidersShownCount,
  MATCH_LIMIT_PER_CATEGORY
} from '@/utils/matchLimits';
import styles from './ShowMoreButton.module.css';

interface ShowMoreButtonProps {
  userId: string;
  categoryId: string;
  onRequestNewMatch: () => Promise<boolean>; // Retorna true si se generó un nuevo match
  isLoading?: boolean;
}

/**
 * Botón para solicitar un nuevo match dentro del límite de 5 por categoría cada 24 horas.
 * Muestra el estado actual del límite y tiempo restante si se alcanzó.
 */
export default function ShowMoreButton({
  userId,
  categoryId,
  onRequestNewMatch,
  isLoading = false,
}: ShowMoreButtonProps) {
  const [canShowMore, setCanShowMore] = useState(false);
  const [remainingSlots, setRemainingSlots] = useState(0);
  const [timeUntilReset, setTimeUntilReset] = useState('');
  const [providersShown, setProvidersShown] = useState(0);
  const [requesting, setRequesting] = useState(false);

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
    if (!canShowMore || requesting || isLoading) return;
    
    setRequesting(true);
    try {
      const success = await onRequestNewMatch();
      if (success) {
        // Actualizar estado después de generar nuevo match
        updateLimitsState();
      }
    } catch (error) {
      console.error('Error solicitando nuevo match:', error);
    } finally {
      setRequesting(false);
    }
  };

  // Si ya se alcanzó el límite
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

  return (
    <div className={styles.container}>
      <div className={styles.slotsInfo}>
        <span className={styles.slotsCount}>
          {providersShown} de {MATCH_LIMIT_PER_CATEGORY}
        </span>
        <span className={styles.slotsText}>proveedores vistos hoy</span>
      </div>
      
      <button
        type="button"
        className={styles.button}
        onClick={handleClick}
        disabled={requesting || isLoading}
      >
        {requesting || isLoading ? (
          <>
            <RefreshCw size={18} className={styles.spinning} />
            <span>Buscando...</span>
          </>
        ) : (
          <>
            <Plus size={18} />
            <span>Mostrar nuevo proveedor</span>
          </>
        )}
      </button>
      
      {remainingSlots <= 2 && remainingSlots > 0 && (
        <p className={styles.warning}>
          <AlertCircle size={14} />
          <span>Te quedan {remainingSlots} {remainingSlots === 1 ? 'slot' : 'slots'} disponibles</span>
        </p>
      )}
    </div>
  );
}





