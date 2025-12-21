'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore, initializeTheme } from '@/store/themeStore';
import styles from './ThemeToggle.module.css';

interface ThemeToggleProps {
  /** Si debe mostrarse en formato compacto (solo icono) */
  compact?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Componente para alternar entre modo claro y oscuro.
 * Incluye animación suave y persistencia en localStorage.
 */
export default function ThemeToggle({ compact = false, className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // Inicializar el tema al montar el componente
  useEffect(() => {
    initializeTheme();
    setMounted(true);
  }, []);

  // Evitar hidratación incorrecta - no renderizar hasta que esté montado
  if (!mounted) {
    return (
      <button 
        className={`${styles.toggle} ${compact ? styles.compact : ''} ${className}`}
        aria-label="Cambiar tema"
        disabled
      >
        <div className={styles.iconContainer}>
          <Moon size={compact ? 16 : 18} className={styles.icon} />
        </div>
        {!compact && <span className={styles.label}>Tema</span>}
      </button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button 
      className={`${styles.toggle} ${compact ? styles.compact : ''} ${className}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      <div className={`${styles.iconContainer} ${isDark ? styles.dark : styles.light}`}>
        {isDark ? (
          <Moon size={compact ? 16 : 18} className={styles.icon} />
        ) : (
          <Sun size={compact ? 16 : 18} className={styles.icon} />
        )}
      </div>
      {!compact && (
        <span className={styles.label}>
          {isDark ? 'Oscuro' : 'Claro'}
        </span>
      )}
    </button>
  );
}





