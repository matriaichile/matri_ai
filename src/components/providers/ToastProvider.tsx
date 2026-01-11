'use client';

import { ToastContainer, useToast } from '@/components/ui/Toast';

/**
 * Provider global para el sistema de toasts
 * Debe estar dentro del árbol de componentes cliente
 */
export default function ToastProvider() {
  const { toasts, removeToast } = useToast();

  return <ToastContainer toasts={toasts} onRemove={removeToast} />;
}















