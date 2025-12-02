"use client";

import { useThemeStore } from '@/store/themeStore';
import { Sun, Moon } from 'lucide-react';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button 
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
    >
      <span className={styles.iconWrapper}>
        <Sun 
          size={18} 
          strokeWidth={1.5} 
          className={`${styles.icon} ${styles.sunIcon} ${theme === 'light' ? styles.active : ''}`}
        />
        <Moon 
          size={18} 
          strokeWidth={1.5} 
          className={`${styles.icon} ${styles.moonIcon} ${theme === 'dark' ? styles.active : ''}`}
        />
      </span>
    </button>
  );
}

