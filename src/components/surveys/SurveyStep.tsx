'use client';

import { ReactNode, useEffect, useState } from 'react';
import styles from './SurveyStep.module.css';

interface SurveyStepProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  currentStep: number;
  totalSteps: number;
  isVisible: boolean;
  onNext?: () => void;
  onBack?: () => void;
  onSubmit?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  showBack?: boolean;
  isLastStep?: boolean;
  isSubmitting?: boolean;
}

/**
 * Componente de paso individual de la encuesta con animaciones elegantes.
 * Adaptado del WizardStep.
 */
export default function SurveyStep({
  children,
  title,
  subtitle,
  currentStep,
  totalSteps,
  isVisible,
  onNext,
  onBack,
  onSubmit,
  nextDisabled = false,
  nextLabel = 'Siguiente',
  showBack = true,
  isLastStep = false,
  isSubmitting = false,
}: SurveyStepProps) {
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

  const handleAction = () => {
    if (isLastStep && onSubmit) {
      onSubmit();
    } else if (onNext) {
      onNext();
    }
  };

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
                  disabled={isSubmitting}
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
                Pregunta {currentStep + 1} de {totalSteps}
              </div>
            </div>

            {/* Botón Siguiente/Finalizar a la derecha */}
            <div className={styles.rightNav}>
              <button
                type="button"
                onClick={handleAction}
                disabled={nextDisabled || isSubmitting}
                className={`${styles.nextButton} ${
                  nextDisabled || isSubmitting ? styles.nextButtonDisabled : ''
                } ${isLastStep ? styles.submitButton : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <span className={styles.spinner} />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    {isLastStep ? 'Finalizar' : nextLabel}
                    {!isLastStep && (
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
                    )}
                    {isLastStep && (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}











