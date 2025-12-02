'use client';

import { ReactNode } from 'react';
import styles from './SelectionCard.module.css';

interface SelectionCardProps {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode | string;
  isSelected: boolean;
  onClick: (id: string) => void;
  animationDelay?: number;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Tarjeta de selección elegante para opciones del wizard.
 */
export default function SelectionCard({
  id,
  label,
  description,
  icon,
  isSelected,
  onClick,
  animationDelay = 0,
  size = 'medium',
}: SelectionCardProps) {
  return (
    <button
      type="button"
      className={`${styles.card} ${styles[`card${size.charAt(0).toUpperCase() + size.slice(1)}`]} ${
        isSelected ? styles.cardSelected : ''
      }`}
      onClick={() => onClick(id)}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {icon && (
        <div className={styles.iconContainer}>
          {typeof icon === 'string' ? (
            <span className={styles.emoji}>{icon}</span>
          ) : (
            icon
          )}
        </div>
      )}
      <div className={styles.textContainer}>
        <span className={styles.label}>{label}</span>
        {description && <span className={styles.description}>{description}</span>}
      </div>
      {isSelected && (
        <div className={styles.checkmark}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
    </button>
  );
}

