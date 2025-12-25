'use client';

import { useState } from 'react';
import { X, AlertCircle, Send } from 'lucide-react';
import styles from './RejectReasonModal.module.css';

// Opciones predefinidas de rechazo
const REJECTION_REASONS = [
  { id: 'price', label: 'Precio fuera de presupuesto' },
  { id: 'style', label: 'Estilo no coincide' },
  { id: 'location', label: 'Ubicación no conveniente' },
  { id: 'already_have', label: 'Ya tengo proveedor para esto' },
  { id: 'availability', label: 'No tiene disponibilidad' },
  { id: 'other', label: 'Otro motivo' },
];

interface RejectReasonModalProps {
  isOpen: boolean;
  providerName: string;
  onClose: () => void;
  onConfirm: (reason: string, reasonId: string) => void;
  isLoading?: boolean;
}

/**
 * Modal para solicitar el motivo de rechazo de un match.
 * Permite seleccionar una opción predefinida o escribir un motivo personalizado.
 */
export default function RejectReasonModal({
  isOpen,
  providerName,
  onClose,
  onConfirm,
  isLoading = false,
}: RejectReasonModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedReason) return;
    
    // Si es "otro", usar el texto personalizado
    const reasonText = selectedReason === 'other' 
      ? customReason.trim() || 'Otro motivo' 
      : REJECTION_REASONS.find(r => r.id === selectedReason)?.label || selectedReason;
    
    onConfirm(reasonText, selectedReason);
    
    // Limpiar estado
    setSelectedReason('');
    setCustomReason('');
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    onClose();
  };

  const isValid = selectedReason && (selectedReason !== 'other' || customReason.trim().length > 0);

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <AlertCircle size={24} />
          </div>
          <h2 className={styles.title}>¿Por qué no te interesa?</h2>
          <p className={styles.subtitle}>
            Tu feedback nos ayuda a mejorar las recomendaciones
          </p>
          <button className={styles.closeButton} onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Nombre del proveedor */}
        <div className={styles.providerInfo}>
          <span>Rechazando a:</span>
          <strong>{providerName}</strong>
        </div>

        {/* Opciones de rechazo */}
        <div className={styles.options}>
          {REJECTION_REASONS.map((reason) => (
            <button
              key={reason.id}
              type="button"
              className={`${styles.optionButton} ${selectedReason === reason.id ? styles.optionSelected : ''}`}
              onClick={() => setSelectedReason(reason.id)}
            >
              <span className={styles.optionRadio}>
                {selectedReason === reason.id && <span className={styles.optionRadioFill} />}
              </span>
              <span>{reason.label}</span>
            </button>
          ))}
        </div>

        {/* Campo de texto para "Otro" */}
        {selectedReason === 'other' && (
          <div className={styles.customReasonContainer}>
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Cuéntanos el motivo..."
              className={styles.customReasonInput}
              rows={3}
              maxLength={500}
            />
            <span className={styles.charCount}>{customReason.length}/500</span>
          </div>
        )}

        {/* Acciones */}
        <div className={styles.actions}>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            type="button" 
            className={styles.confirmButton}
            onClick={handleConfirm}
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <span className={styles.spinner} />
            ) : (
              <>
                <Send size={16} />
                <span>Confirmar rechazo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}











