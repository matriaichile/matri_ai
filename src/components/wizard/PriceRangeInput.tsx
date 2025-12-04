'use client';

import { useState, useCallback } from 'react';
import styles from './PriceRangeInput.module.css';

interface PriceRangeInputProps {
  priceMin: number;
  priceMax: number;
  onChangeMin: (value: number) => void;
  onChangeMax: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

/**
 * Componente para ingresar rango de precios en CLP.
 * Dos inputs numéricos con formato de moneda.
 */
export default function PriceRangeInput({
  priceMin,
  priceMax,
  onChangeMin,
  onChangeMax,
  min = 0,
  max = 100_000_000,
  label = 'Rango de precios',
}: PriceRangeInputProps) {
  const [minInput, setMinInput] = useState(priceMin > 0 ? formatNumber(priceMin) : '');
  const [maxInput, setMaxInput] = useState(priceMax > 0 ? formatNumber(priceMax) : '');
  const [error, setError] = useState<string | null>(null);

  // Formatear número con separador de miles
  function formatNumber(num: number): string {
    return new Intl.NumberFormat('es-CL').format(num);
  }

  // Parsear string a número (remover puntos de miles)
  function parseNumber(str: string): number {
    const cleaned = str.replace(/\./g, '').replace(/\D/g, '');
    return parseInt(cleaned, 10) || 0;
  }

  // Formatear input mientras se escribe
  const handleMinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseNumber(value);
    
    if (numericValue > max) return;
    
    setMinInput(numericValue > 0 ? formatNumber(numericValue) : '');
    onChangeMin(numericValue);
    
    // Validar que min < max
    if (priceMax > 0 && numericValue >= priceMax) {
      setError('El precio mínimo debe ser menor al máximo');
    } else {
      setError(null);
    }
  }, [max, onChangeMin, priceMax]);

  const handleMaxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseNumber(value);
    
    if (numericValue > max) return;
    
    setMaxInput(numericValue > 0 ? formatNumber(numericValue) : '');
    onChangeMax(numericValue);
    
    // Validar que max > min
    if (priceMin > 0 && numericValue <= priceMin) {
      setError('El precio máximo debe ser mayor al mínimo');
    } else {
      setError(null);
    }
  }, [max, onChangeMax, priceMin]);

  // Formatear CLP completo para el preview
  const formatCLP = (num: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      
      <div className={styles.inputsRow}>
        <div className={styles.inputGroup}>
          <span className={styles.inputLabel}>Desde</span>
          <div className={styles.inputWrapper}>
            <span className={styles.currency}>$</span>
            <input
              type="text"
              inputMode="numeric"
              value={minInput}
              onChange={handleMinChange}
              placeholder="0"
              className={styles.input}
            />
          </div>
        </div>
        
        <div className={styles.separator}>
          <span>—</span>
        </div>
        
        <div className={styles.inputGroup}>
          <span className={styles.inputLabel}>Hasta</span>
          <div className={styles.inputWrapper}>
            <span className={styles.currency}>$</span>
            <input
              type="text"
              inputMode="numeric"
              value={maxInput}
              onChange={handleMaxChange}
              placeholder="0"
              className={styles.input}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Preview del rango */}
      {priceMin > 0 && priceMax > 0 && priceMax > priceMin && (
        <div className={styles.preview}>
          <span className={styles.previewLabel}>Tu rango de precios:</span>
          <span className={styles.previewValue}>
            {formatCLP(priceMin)} - {formatCLP(priceMax)}
          </span>
        </div>
      )}

      {/* Sugerencias de rangos comunes */}
      <div className={styles.suggestions}>
        <span className={styles.suggestionsLabel}>Rangos sugeridos:</span>
        <div className={styles.suggestionButtons}>
          <button
            type="button"
            className={styles.suggestionBtn}
            onClick={() => {
              setMinInput(formatNumber(500_000));
              setMaxInput(formatNumber(2_000_000));
              onChangeMin(500_000);
              onChangeMax(2_000_000);
              setError(null);
            }}
          >
            Económico
          </button>
          <button
            type="button"
            className={styles.suggestionBtn}
            onClick={() => {
              setMinInput(formatNumber(2_000_000));
              setMaxInput(formatNumber(5_000_000));
              onChangeMin(2_000_000);
              onChangeMax(5_000_000);
              setError(null);
            }}
          >
            Medio
          </button>
          <button
            type="button"
            className={styles.suggestionBtn}
            onClick={() => {
              setMinInput(formatNumber(5_000_000));
              setMaxInput(formatNumber(15_000_000));
              onChangeMin(5_000_000);
              onChangeMax(15_000_000);
              setError(null);
            }}
          >
            Premium
          </button>
          <button
            type="button"
            className={styles.suggestionBtn}
            onClick={() => {
              setMinInput(formatNumber(15_000_000));
              setMaxInput(formatNumber(50_000_000));
              onChangeMin(15_000_000);
              onChangeMax(50_000_000);
              setError(null);
            }}
          >
            Lujo
          </button>
        </div>
      </div>
    </div>
  );
}

