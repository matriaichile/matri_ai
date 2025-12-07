'use client';

import { SurveyQuestion } from '@/lib/surveys/types';
import { playUiClick } from '@/utils/sound';
import styles from './QuestionTypes.module.css';

// Props base para todos los tipos de pregunta
interface BaseQuestionProps {
  question: SurveyQuestion;
  value: string | string[] | number | boolean | undefined;
  onChange: (value: string | string[] | number | boolean | undefined) => void;
}

/**
 * Pregunta de selección única (single)
 */
export function SingleSelectQuestion({ question, value, onChange }: BaseQuestionProps) {
  const selectedValue = typeof value === 'string' ? value : '';

  // Manejar selección con sonido
  const handleSelect = (optionId: string) => {
    playUiClick();
    onChange(optionId);
  };

  return (
    <div className={styles.optionsGrid}>
      {question.options?.map((option, index) => {
        const isSelected = selectedValue === option.id;
        return (
          <button
            key={option.id}
            type="button"
            className={`${styles.optionCard} ${isSelected ? styles.optionCardSelected : ''}`}
            onClick={() => handleSelect(option.id)}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={styles.optionContent}>
              <span className={styles.optionLabel}>{option.label}</span>
              {option.description && (
                <span className={styles.optionDescription}>{option.description}</span>
              )}
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
      })}
    </div>
  );
}

/**
 * Pregunta de selección múltiple (multiple)
 */
export function MultiSelectQuestion({ question, value, onChange }: BaseQuestionProps) {
  const selectedValues = Array.isArray(value) ? value : [];

  // Manejar toggle con sonido
  const handleToggle = (optionId: string) => {
    playUiClick();
    if (selectedValues.includes(optionId)) {
      onChange(selectedValues.filter((v) => v !== optionId));
    } else {
      onChange([...selectedValues, optionId]);
    }
  };

  return (
    <div className={styles.optionsGrid}>
      {question.options?.map((option, index) => {
        const isSelected = selectedValues.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            className={`${styles.optionCard} ${isSelected ? styles.optionCardSelected : ''}`}
            onClick={() => handleToggle(option.id)}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={styles.optionContent}>
              <span className={styles.optionLabel}>{option.label}</span>
              {option.description && (
                <span className={styles.optionDescription}>{option.description}</span>
              )}
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
      })}
      <p className={styles.multiSelectHint}>Puedes seleccionar varias opciones</p>
    </div>
  );
}

/**
 * Pregunta booleana (boolean)
 */
export function BooleanQuestion({ question, value, onChange }: BaseQuestionProps) {
  const selectedValue = typeof value === 'boolean' ? value : undefined;

  // Manejar selección booleana con sonido
  const handleBooleanSelect = (val: boolean) => {
    playUiClick();
    onChange(val);
  };

  return (
    <div className={styles.booleanContainer}>
      <button
        type="button"
        className={`${styles.booleanButton} ${
          selectedValue === true ? styles.booleanButtonSelected : ''
        }`}
        onClick={() => handleBooleanSelect(true)}
      >
        <div className={styles.booleanIcon}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span>Sí</span>
      </button>

      <button
        type="button"
        className={`${styles.booleanButton} ${
          selectedValue === false ? styles.booleanButtonSelected : ''
        }`}
        onClick={() => handleBooleanSelect(false)}
      >
        <div className={styles.booleanIcon}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <span>No</span>
      </button>
    </div>
  );
}

/**
 * Pregunta numérica (number)
 * NOTA: NO forzamos límites mientras el usuario escribe para mejor UX
 * La validación del rango se hace al presionar "Siguiente"
 */
export function NumberQuestion({ question, value, onChange }: BaseQuestionProps) {
  const numValue = typeof value === 'number' && value !== 0 ? value : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      // Campo vacío - usar undefined o 0 según contexto
      onChange(undefined);
    } else {
      const num = parseInt(val, 10);
      if (!isNaN(num)) {
        // Permitir cualquier número - la validación del rango se hace en submit
        onChange(num);
      }
    }
  };

  // Verificar si el valor actual está fuera de rango (para mostrar alerta visual)
  const isOutOfRange = typeof value === 'number' && value !== 0 && (
    (question.min !== undefined && value < question.min) ||
    (question.max !== undefined && value > question.max)
  );

  return (
    <div className={styles.numberContainer}>
      <div className={styles.numberInputWrapper}>
        <input
          type="number"
          className={`${styles.numberInput} ${isOutOfRange ? styles.numberInputError : ''}`}
          value={numValue}
          onChange={handleChange}
          step={question.step || 1}
          placeholder={question.placeholder || 'Ingresa un número'}
        />
      </div>
      {(question.min !== undefined || question.max !== undefined) && (
        <p className={`${styles.numberHint} ${isOutOfRange ? styles.numberHintError : ''}`}>
          {question.min !== undefined && question.max !== undefined
            ? `Rango: ${question.min.toLocaleString()} - ${question.max.toLocaleString()}`
            : question.min !== undefined
            ? `Mínimo: ${question.min.toLocaleString()}`
            : `Máximo: ${question.max?.toLocaleString()}`}
        </p>
      )}
    </div>
  );
}

/**
 * Pregunta de texto (text)
 */
export function TextQuestion({ question, value, onChange }: BaseQuestionProps) {
  const textValue = typeof value === 'string' ? value : '';

  return (
    <div className={styles.textContainer}>
      <textarea
        className={styles.textInput}
        value={textValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder || 'Escribe tu respuesta...'}
        rows={4}
      />
    </div>
  );
}

/**
 * Componente principal que renderiza el tipo de pregunta correcto
 */
export function QuestionRenderer({ question, value, onChange }: BaseQuestionProps) {
  switch (question.type) {
    case 'single':
      return <SingleSelectQuestion question={question} value={value} onChange={onChange} />;
    case 'multiple':
      return <MultiSelectQuestion question={question} value={value} onChange={onChange} />;
    case 'boolean':
      return <BooleanQuestion question={question} value={value} onChange={onChange} />;
    case 'number':
    case 'range':
      return <NumberQuestion question={question} value={value} onChange={onChange} />;
    case 'text':
      return <TextQuestion question={question} value={value} onChange={onChange} />;
    default:
      return <p>Tipo de pregunta no soportado</p>;
  }
}

