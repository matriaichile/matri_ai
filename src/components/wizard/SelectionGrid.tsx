'use client';

import { ReactNode } from 'react';
import SelectionCard from './SelectionCard';
import styles from './SelectionGrid.module.css';

interface Option {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode | string;
}

interface SelectionGridProps {
  options: Option[];
  selected: string | string[];
  onSelect: (id: string) => void;
  multiple?: boolean;
  columns?: 1 | 2 | 3 | 4;
  cardSize?: 'small' | 'medium' | 'large';
}

/**
 * Grid de selección con tarjetas elegantes.
 * Soporta selección única o múltiple.
 */
export default function SelectionGrid({
  options,
  selected,
  onSelect,
  multiple = false,
  columns = 2,
  cardSize = 'medium',
}: SelectionGridProps) {
  const isSelected = (id: string) => {
    if (multiple && Array.isArray(selected)) {
      return selected.includes(id);
    }
    return selected === id;
  };

  return (
    <div
      className={styles.grid}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {options.map((option, index) => (
        <SelectionCard
          key={option.id}
          id={option.id}
          label={option.label}
          description={option.description}
          icon={option.icon}
          isSelected={isSelected(option.id)}
          onClick={onSelect}
          animationDelay={index * 50}
          size={cardSize}
        />
      ))}
    </div>
  );
}

