'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './BudgetSlider.module.css';

interface BudgetSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

/**
 * Componente slider para selección de presupuesto en CLP.
 * Muestra el valor formateado con separador de miles.
 */
export default function BudgetSlider({
  value,
  onChange,
  min = 0,
  max = 100_000_000,
  step = 500_000, // Incrementos de 500k
  label = 'Presupuesto aproximado',
}: BudgetSliderProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sincronizar valor local con prop
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Formatear número a CLP
  const formatCLP = useCallback((num: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  }, []);

  // Calcular porcentaje para el gradiente
  const percentage = ((localValue - min) / (max - min)) * 100;

  // Manejar cambio del slider
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setLocalValue(newValue);
    onChange(newValue);
  };

  // Obtener etiqueta descriptiva del rango
  const getRangeLabel = (val: number): string => {
    if (val === 0) return 'Sin definir';
    if (val < 5_000_000) return 'Económico';
    if (val < 10_000_000) return 'Moderado';
    if (val < 20_000_000) return 'Intermedio';
    if (val < 35_000_000) return 'Premium';
    if (val < 50_000_000) return 'Alto';
    return 'Lujo';
  };

  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      
      <div className={styles.valueDisplay}>
        <span className={styles.value}>{formatCLP(localValue)}</span>
        <span className={styles.rangeLabel}>{getRangeLabel(localValue)}</span>
      </div>

      <div className={styles.sliderContainer}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          className={styles.slider}
          style={{
            background: `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${percentage}%, var(--slider-track) ${percentage}%, var(--slider-track) 100%)`,
          }}
        />
      </div>

      <div className={styles.rangeLabels}>
        <span>{formatCLP(min)}</span>
        <span>{formatCLP(max)}</span>
      </div>

      {/* Marcadores de referencia */}
      <div className={styles.markers}>
        <div className={styles.marker} style={{ left: '5%' }}>
          <span className={styles.markerDot} />
          <span className={styles.markerLabel}>$5M</span>
        </div>
        <div className={styles.marker} style={{ left: '20%' }}>
          <span className={styles.markerDot} />
          <span className={styles.markerLabel}>$20M</span>
        </div>
        <div className={styles.marker} style={{ left: '50%' }}>
          <span className={styles.markerDot} />
          <span className={styles.markerLabel}>$50M</span>
        </div>
      </div>
    </div>
  );
}













