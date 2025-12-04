'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  dropUp?: boolean; // Si true, el dropdown se abre hacia arriba
}

/**
 * Dropdown personalizado ultra elegante.
 * Reemplaza el select nativo del navegador.
 * Usa portal para renderizar el menú fuera del contenedor padre.
 */
export default function CustomDropdown({
  options,
  value,
  onChange,
  label,
  placeholder = 'Selecciona una opción',
  icon,
  dropUp = false,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0, bottom: 'auto' as number | 'auto' });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Obtener la opción seleccionada
  const selectedOption = options.find((opt) => opt.id === value);

  // Calcular posición del dropdown cuando se abre
  const updateDropdownPosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      
      if (dropUp) {
        // Abrir hacia arriba - calcular desde el bottom de la ventana
        const bottomPosition = window.innerHeight - rect.top + 4;
        setDropdownPosition({
          top: 0, // No se usa en dropUp
          bottom: bottomPosition,
          left: rect.left,
          width: rect.width,
        });
      } else {
        setDropdownPosition({
          top: rect.bottom + 4, // 4px de gap
          bottom: 'auto',
          left: rect.left,
          width: rect.width,
        });
      }
    }
  }, [dropUp]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Verificar si el click fue fuera del container Y fuera del dropdown
      const dropdownElement = document.getElementById('custom-dropdown-menu');
      if (
        containerRef.current && 
        !containerRef.current.contains(target) &&
        (!dropdownElement || !dropdownElement.contains(target))
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Actualizar posición cuando se abre o cambia el tamaño de ventana
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener('resize', updateDropdownPosition);
      window.addEventListener('scroll', updateDropdownPosition, true);
    }
    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
  }, [isOpen, updateDropdownPosition]);

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
        ref={triggerRef}
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

      {/* Dropdown renderizado en portal para escapar del overflow del padre */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          id="custom-dropdown-menu"
          className={`${styles.dropdown} ${dropUp ? styles.dropdownUp : ''}`} 
          role="listbox" 
          ref={listRef}
          style={{
            position: 'fixed',
            ...(dropUp 
              ? { bottom: dropdownPosition.bottom, top: 'auto' }
              : { top: dropdownPosition.top, bottom: 'auto' }
            ),
            left: dropdownPosition.left,
            width: dropdownPosition.width,
          }}
        >
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
        </div>,
        document.body
      )}
    </div>
  );
}

