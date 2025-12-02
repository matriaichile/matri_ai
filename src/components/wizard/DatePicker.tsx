'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './DatePicker.module.css';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  minDate?: Date;
}

// Nombres de meses en español
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Días de la semana abreviados
const WEEKDAYS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

/**
 * DatePicker personalizado ultra elegante.
 * Diseño premium con animaciones suaves.
 */
export default function DatePicker({
  value,
  onChange,
  label,
  placeholder = 'Selecciona una fecha',
  minDate = new Date(),
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Parsear el valor actual
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;

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

  // Inicializar el mes actual basado en el valor seleccionado
  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [value]);

  // Obtener días del mes
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  // Navegar meses
  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Seleccionar día
  const handleDayClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const formattedDate = date.toISOString().split('T')[0];
    onChange(formattedDate);
    setIsOpen(false);
  };

  // Verificar si un día está deshabilitado
  const isDayDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < minDate;
  };

  // Verificar si es el día seleccionado
  const isSelectedDay = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  // Verificar si es hoy
  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  // Formatear fecha para mostrar
  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return `${date.getDate()} de ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Verificar si se puede ir al mes anterior
  const canGoPrev = () => {
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    return prevMonth >= minMonth;
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className={styles.container} ref={containerRef}>
      {label && <label className={styles.label}>{label}</label>}
      
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerActive : ''} ${value ? styles.triggerFilled : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.triggerIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <span className={styles.triggerText}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <div className={`${styles.triggerArrow} ${isOpen ? styles.triggerArrowOpen : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className={styles.calendar}>
          {/* Cabecera del calendario */}
          <div className={styles.calendarHeader}>
            <button
              type="button"
              className={`${styles.navButton} ${!canGoPrev() ? styles.navButtonDisabled : ''}`}
              onClick={goToPrevMonth}
              disabled={!canGoPrev()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            
            <div className={styles.monthYear}>
              <span className={styles.month}>{MONTHS[currentMonth.getMonth()]}</span>
              <span className={styles.year}>{currentMonth.getFullYear()}</span>
            </div>
            
            <button
              type="button"
              className={styles.navButton}
              onClick={goToNextMonth}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Días de la semana */}
          <div className={styles.weekdays}>
            {WEEKDAYS.map((day) => (
              <span key={day} className={styles.weekday}>{day}</span>
            ))}
          </div>

          {/* Grid de días */}
          <div className={styles.daysGrid}>
            {days.map((day, index) => (
              <div key={index} className={styles.dayCell}>
                {day !== null && (
                  <button
                    type="button"
                    className={`${styles.day} ${
                      isSelectedDay(day) ? styles.daySelected : ''
                    } ${isToday(day) ? styles.dayToday : ''} ${
                      isDayDisabled(day) ? styles.dayDisabled : ''
                    }`}
                    onClick={() => !isDayDisabled(day) && handleDayClick(day)}
                    disabled={isDayDisabled(day)}
                  >
                    {day}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Footer con acciones rápidas */}
          <div className={styles.calendarFooter}>
            <button
              type="button"
              className={styles.quickAction}
              onClick={() => {
                const today = new Date();
                const formattedDate = today.toISOString().split('T')[0];
                onChange(formattedDate);
                setIsOpen(false);
              }}
            >
              Hoy
            </button>
            {value && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

