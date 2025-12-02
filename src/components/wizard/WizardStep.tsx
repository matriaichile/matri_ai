'use client';

import { ReactNode, useEffect, useState } from 'react';
import styles from './WizardStep.module.css';

interface WizardStepProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  currentStep: number;
  totalSteps: number;
  isVisible: boolean;
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  showBack?: boolean;
  showSkip?: boolean;
}

/**
 * Componente de paso individual del wizard con animaciones elegantes.
 */
export default function WizardStep({
  children,
  title,
  subtitle,
  currentStep,
  totalSteps,
  isVisible,
  onNext,
  onBack,
  onSkip,
  nextDisabled = false,
  nextLabel = 'Siguiente',
  showBack = true,
  showSkip = false,
}: WizardStepProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className={`${styles.stepContainer} ${
        showContent ? styles.stepContainerVisible : styles.stepContainerHidden
      }`}
    >
      <div className={styles.contentWrapper}>
        {/* Encabezado del paso */}
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        {/* Contenido del paso */}
        <div className={styles.content}>{children}</div>

        {/* Barra de progreso y navegación */}
        <div className={styles.bottomBar}>
          {/* Contenedor principal centrado: Atrás - Progreso - Siguiente */}
          <div className={styles.mainNav}>
            {/* Botón Atrás a la izquierda */}
            <div className={styles.leftNav}>
              {showBack && currentStep > 0 && (
                <button
                  type="button"
                  onClick={onBack}
                  className={styles.backButton}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Atrás
                </button>
              )}
            </div>

            {/* Indicadores de progreso en el centro */}
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${((currentStep + 1) / totalSteps) * 100}%`,
                  }}
                />
              </div>
              <div className={styles.progressText}>
                Paso {currentStep + 1} de {totalSteps}
              </div>
            </div>

            {/* Botón Siguiente a la derecha */}
            <div className={styles.rightNav}>
              {onNext && (
                <button
                  type="button"
                  onClick={onNext}
                  disabled={nextDisabled}
                  className={`${styles.nextButton} ${
                    nextDisabled ? styles.nextButtonDisabled : ''
                  }`}
                >
                  {nextLabel}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Botón Omitir separado, a la derecha absoluta */}
          {showSkip && onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className={styles.skipButton}
            >
              Omitir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

