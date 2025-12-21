'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import styles from './Toast.module.css';

// Tipos de toast disponibles
export type ToastType = 'success' | 'error' | 'info' | 'warning';

// Interface para el toast
export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // en ms, 0 = no auto-cerrar
}

// Props del componente Toast individual
interface ToastItemProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

// Iconos por tipo
const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

/**
 * Componente Toast individual
 * Muestra una notificación elegante con animación
 */
function ToastItem({ toast, onClose }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const Icon = ICONS[toast.type];
  const duration = toast.duration ?? 4000;

  const handleClose = useCallback(() => {
    setIsExiting(true);
    // Esperar a que termine la animación de salida
    setTimeout(() => onClose(toast.id), 300);
  }, [toast.id, onClose]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  return (
    <div 
      className={`${styles.toast} ${styles[toast.type]} ${isExiting ? styles.exiting : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.iconContainer}>
        <Icon size={20} />
      </div>
      <div className={styles.content}>
        <p className={styles.title}>{toast.title}</p>
        {toast.message && <p className={styles.message}>{toast.message}</p>}
      </div>
      <button 
        className={styles.closeButton} 
        onClick={handleClose}
        aria-label="Cerrar notificación"
      >
        <X size={16} />
      </button>
      {duration > 0 && (
        <div 
          className={styles.progressBar} 
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
    </div>
  );
}

// Container de toasts - Props
interface ToastContainerProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

/**
 * Container que renderiza todos los toasts activos
 */
export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.container} aria-label="Notificaciones">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onRemove} />
      ))}
    </div>
  );
}

// ============================================
// Hook para manejar toasts globalmente
// ============================================

// Estado global simple para toasts
let globalToasts: ToastData[] = [];
let listeners: Array<(toasts: ToastData[]) => void> = [];

const notifyListeners = () => {
  listeners.forEach((listener) => listener([...globalToasts]));
};

/**
 * Hook para usar el sistema de toasts
 * Permite mostrar y gestionar notificaciones elegantes
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>(globalToasts);

  useEffect(() => {
    const listener = (newToasts: ToastData[]) => setToasts(newToasts);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastData = { ...toast, id };
    globalToasts = [...globalToasts, newToast];
    notifyListeners();
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    globalToasts = globalToasts.filter((t) => t.id !== id);
    notifyListeners();
  }, []);

  const clearAll = useCallback(() => {
    globalToasts = [];
    notifyListeners();
  }, []);

  // Helpers de conveniencia
  const success = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'success', title, message, duration });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'error', title, message, duration: duration ?? 6000 });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'info', title, message, duration });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'warning', title, message, duration: duration ?? 5000 });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    info,
    warning,
  };
}

export default ToastContainer;










