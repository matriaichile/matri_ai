'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './CustomDropdown.module.css';

interface DropdownOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  icon?: React.ReactNode;
}

/**
 * Dropdown personalizado ultra elegante.
 * Reemplaza el select nativo del navegador.
 */
export default function CustomDropdown({
  options,
  value,
  onChange,
  label,
  placeholder = 'Selecciona una opción',
  icon,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Obtener la opción seleccionada
  const selectedOption = options.find((opt) => opt.id === value);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex((prev) => 
            prev < options.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex((prev) => 
            prev > 0 ? prev - 1 : options.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0) {
            onChange(options[highlightedIndex].id);
            setIsOpen(false);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, options, onChange]);

  // Scroll al elemento resaltado
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Resetear highlight cuando se abre
  useEffect(() => {
    if (isOpen) {
      const selectedIndex = options.findIndex((opt) => opt.id === value);
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [isOpen, options, value]);

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      {label && <label className={styles.label}>{label}</label>}
      
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerActive : ''} ${value ? styles.triggerFilled : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {icon && (
          <div className={styles.triggerIcon}>
            {icon}
          </div>
        )}
        <span className={styles.triggerText}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className={`${styles.triggerArrow} ${isOpen ? styles.triggerArrowOpen : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="listbox" ref={listRef}>
          {options.map((option, index) => (
            <button
              key={option.id}
              type="button"
              className={`${styles.option} ${
                option.id === value ? styles.optionSelected : ''
              } ${index === highlightedIndex ? styles.optionHighlighted : ''}`}
              onClick={() => handleSelect(option.id)}
              onMouseEnter={() => setHighlightedIndex(index)}
              role="option"
              aria-selected={option.id === value}
            >
              {option.icon && (
                <div className={styles.optionIcon}>
                  {option.icon}
                </div>
              )}
              <span className={styles.optionLabel}>{option.label}</span>
              {option.id === value && (
                <div className={styles.checkmark}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

