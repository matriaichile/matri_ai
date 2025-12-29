'use client';

import { useState } from 'react';
import { RefreshCw, Plus, AlertCircle, SearchX } from 'lucide-react';
import { MAX_ACTIVE_MATCHES_PER_CATEGORY } from '@/utils/matchLimits';
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
 * SIN LÍMITE de búsquedas - puede buscar las veces que quiera.
 * El único límite es tener máximo 3 matches activos al mismo tiempo.
 */
export default function ShowMoreButton({
  onRequestNewMatch,
  isLoading = false,
  activeMatchesCount = 0,
  maxActiveMatches = MAX_ACTIVE_MATCHES_PER_CATEGORY,
  isBlocked = false,
  availableProvidersCount,
  isLoadingAvailableCount = false,
}: ShowMoreButtonProps) {
  const [requesting, setRequesting] = useState(false);
  const [noMoreProviders, setNoMoreProviders] = useState(false);
  
  // Determinar si hay proveedores disponibles basado en el conteo externo
  // Si availableProvidersCount es undefined, aún no sabemos (compatibilidad hacia atrás)
  // Si es 0, definitivamente no hay más proveedores
  const hasAvailableProviders = availableProvidersCount === undefined || availableProvidersCount > 0;

  // Manejar click en el botón
  const handleClick = async () => {
    if (requesting || isLoading || noMoreProviders || isBlocked) return;
    
    setRequesting(true);
    try {
      const success = await onRequestNewMatch();
      if (success) {
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
  
  // Puede buscar si: no tiene máximo de activos Y no está bloqueado Y hay proveedores disponibles
  const canRequestNew = !hasReachedActiveLimit && !isBlocked && hasAvailableProviders;

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

  // Si no hay más proveedores disponibles
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

  return (
    <div className={styles.container}>
      {/* Botón para buscar nuevo proveedor - SIN LÍMITE de búsquedas */}
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





