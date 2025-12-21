'use client';

import styles from './LoadingState.module.css';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * Estado de carga reutilizable.
 */
export default function LoadingState({ 
  message = 'Cargando...', 
  fullScreen = false 
}: LoadingStateProps) {
  return (
    <div className={`${styles.loadingContainer} ${fullScreen ? styles.fullScreen : ''}`}>
      <div className={styles.loadingSpinner} />
      <p className={styles.loadingText}>{message}</p>
    </div>
  );
}










