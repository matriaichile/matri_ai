'use client';

import { ReactNode } from 'react';
import styles from './SelectionCard.module.css';
import {
  IconDocument,
  IconChurch,
  IconStar,
  IconMusic,
  IconCamera,
  IconVideo,
  IconBuilding,
  IconUtensils,
  IconFlower,
  IconClipboard,
  IconSparkles,
  IconDress,
  IconCake,
  IconCar,
  IconMail,
  IconUsers,
} from './Icons';

// Mapa de iconos por tipo
const ICON_MAP: Record<string, React.FC> = {
  document: IconDocument,
  church: IconChurch,
  star: IconStar,
  music: IconMusic,
  camera: IconCamera,
  video: IconVideo,
  building: IconBuilding,
  utensils: IconUtensils,
  flower: IconFlower,
  clipboard: IconClipboard,
  sparkles: IconSparkles,
  dress: IconDress,
  cake: IconCake,
  car: IconCar,
  mail: IconMail,
  users: IconUsers,
};

interface SelectionCardProps {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode | string;
  iconType?: string;
  isSelected: boolean;
  onClick: (id: string) => void;
  animationDelay?: number;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Tarjeta de selección elegante para opciones del wizard.
 * Soporta iconos SVG mediante iconType o iconos personalizados mediante icon.
 */
export default function SelectionCard({
  id,
  label,
  description,
  icon,
  iconType,
  isSelected,
  onClick,
  animationDelay = 0,
  size = 'medium',
}: SelectionCardProps) {
  // Renderizar icono basado en iconType o icon prop
  const renderIcon = () => {
    if (iconType && ICON_MAP[iconType]) {
      const IconComponent = ICON_MAP[iconType];
      return <IconComponent />;
    }
    if (icon) {
      if (typeof icon === 'string') {
        // Si es un string (emoji), no renderizarlo - usamos iconos SVG
        return null;
      }
      return icon;
    }
    return null;
  };

  const iconContent = renderIcon();

  return (
    <button
      type="button"
      className={`${styles.card} ${styles[`card${size.charAt(0).toUpperCase() + size.slice(1)}`]} ${
        isSelected ? styles.cardSelected : ''
      }`}
      onClick={() => onClick(id)}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {iconContent && (
        <div className={styles.iconContainer}>
          {iconContent}
        </div>
      )}
      <div className={styles.textContainer}>
        <span className={styles.label}>{label}</span>
        {description && <span className={styles.description}>{description}</span>}
      </div>
      {/* Siempre reservar espacio para el checkmark para evitar layout shift */}
      <div className={`${styles.checkmark} ${isSelected ? styles.checkmarkVisible : styles.checkmarkHidden}`}>
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
    </button>
  );
}
