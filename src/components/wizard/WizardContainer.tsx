'use client';

import { useEffect, useState, ReactNode } from 'react';
import styles from './WizardContainer.module.css';

interface WizardContainerProps {
  children: ReactNode;
  showWelcome: boolean;
  welcomeTitle: string;
  welcomeSubtitle?: string;
  onStartWizard: () => void;
  startButtonText?: string;
}

/**
 * Contenedor principal del wizard con animación de bienvenida elegante.
 * Inspirado en el onboarding del proyecto software.
 */
export default function WizardContainer({
  children,
  showWelcome,
  welcomeTitle,
  welcomeSubtitle,
  onStartWizard,
  startButtonText = 'Comenzar',
}: WizardContainerProps) {
  const [showContent, setShowContent] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Animación inicial elegante del contenido de bienvenida
  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowContent(true), 300);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  const handleStart = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowContent(false);
    }, 300);
    setTimeout(() => {
      onStartWizard();
      // Ocultar el overlay de transición después de que el wizard se muestre
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 800);
  };

  return (
    <div className={styles.container}>
      {/* Fondo elegante con gradientes dorados */}
      <div className={styles.backgroundGradient}>
        {/* Partículas flotantes minimalistas */}
        <div className={styles.particles}>
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className={`${styles.particle} ${
                showContent ? styles.particleVisible : styles.particleHidden
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>

        {/* Contenido de bienvenida */}
        {showWelcome && (
          <div
            className={`${styles.welcomeContent} ${
              showContent && !isTransitioning
                ? styles.welcomeContentVisible
                : styles.welcomeContentHidden
            }`}
          >
            <div className={styles.contentContainer}>
              {/* Título con efecto de aparición elegante */}
              <div className={styles.titleContainer}>
                <h1 className={styles.title}>{welcomeTitle}</h1>
                <div
                  className={`${styles.titleUnderline} ${
                    showContent && !isTransitioning
                      ? styles.titleUnderlineVisible
                      : styles.titleUnderlineHidden
                  }`}
                />
              </div>

              {welcomeSubtitle && (
                <p className={styles.subtitle}>{welcomeSubtitle}</p>
              )}

              {/* Botón elegante */}
              <div
                className={`${styles.buttonContainer} ${
                  showContent && !isTransitioning
                    ? styles.buttonContainerVisible
                    : styles.buttonContainerHidden
                }`}
              >
                <button onClick={handleStart} className={styles.startButton}>
                  <div className={styles.buttonBackground} />
                  <span className={styles.buttonText}>{startButtonText}</span>
                  <div className={styles.buttonUnderline} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contenido del wizard (pasos) */}
        {!showWelcome && (
          <div className={styles.wizardContent}>{children}</div>
        )}
      </div>

      {/* Overlay de transición */}
      <div
        className={`${styles.transitionOverlay} ${
          isTransitioning
            ? styles.transitionOverlayVisible
            : styles.transitionOverlayHidden
        }`}
      />
    </div>
  );
}

