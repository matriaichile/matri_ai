'use client';

import { useEffect, useState, ReactNode } from 'react';
import styles from './SurveyContainer.module.css';
import { getCategoryInfo } from '@/lib/surveys';
import { CategoryId } from '@/store/authStore';

interface SurveyContainerProps {
  children: ReactNode;
  categoryId: CategoryId;
  showWelcome: boolean;
  onStartSurvey: () => void;
  userType: 'user' | 'provider';
}

/**
 * Contenedor principal de la encuesta por categoría.
 * Inspirado en el WizardContainer pero adaptado para encuestas específicas.
 */
export default function SurveyContainer({
  children,
  categoryId,
  showWelcome,
  onStartSurvey,
  userType,
}: SurveyContainerProps) {
  const [showContent, setShowContent] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const categoryInfo = getCategoryInfo(categoryId);

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
      onStartSurvey();
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 800);
  };

  const getWelcomeTitle = () => {
    if (userType === 'provider') {
      return `Configura tu servicio de ${categoryInfo?.name || 'esta categoría'}`;
    }
    return `Personaliza tu búsqueda de ${categoryInfo?.name || 'esta categoría'}`;
  };

  const getWelcomeSubtitle = () => {
    if (userType === 'provider') {
      return 'Responde estas preguntas para que podamos conectarte con las parejas ideales para tu servicio.';
    }
    return 'Responde estas preguntas para encontrar los mejores proveedores que se ajusten a tus necesidades.';
  };

  return (
    <div className={styles.container}>
      {/* Fondo elegante con gradientes dorados */}
      <div className={styles.backgroundGradient}>
        {/* Partículas flotantes minimalistas */}
        <div className={styles.particles}>
          {[...Array(12)].map((_, i) => (
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
              {/* Icono de categoría */}
              <div className={styles.categoryIcon}>
                <CategoryIcon categoryId={categoryId} />
              </div>

              {/* Título con efecto de aparición elegante */}
              <div className={styles.titleContainer}>
                <h1 className={styles.title}>{getWelcomeTitle()}</h1>
                <div
                  className={`${styles.titleUnderline} ${
                    showContent && !isTransitioning
                      ? styles.titleUnderlineVisible
                      : styles.titleUnderlineHidden
                  }`}
                />
              </div>

              <p className={styles.subtitle}>{getWelcomeSubtitle()}</p>

              {/* Info de la categoría */}
              <p className={styles.categoryDescription}>
                {categoryInfo?.description}
              </p>

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
                  <span className={styles.buttonText}>Comenzar</span>
                  <div className={styles.buttonUnderline} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contenido de la encuesta (pasos) */}
        {!showWelcome && (
          <div className={styles.surveyContent}>{children}</div>
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

// Componente de icono por categoría
function CategoryIcon({ categoryId }: { categoryId: CategoryId }) {
  const iconMap: Record<CategoryId, JSX.Element> = {
    photography: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
    video: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
    dj: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="5.5" cy="17.5" r="2.5" />
        <circle cx="17.5" cy="15.5" r="2.5" />
        <path d="M8 17V5l12-2v12" />
      </svg>
    ),
    catering: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
    venue: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4v18" />
        <path d="M19 21V11l-6-4" />
        <path d="M9 9v.01" />
        <path d="M9 12v.01" />
        <path d="M9 15v.01" />
        <path d="M9 18v.01" />
      </svg>
    ),
    decoration: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
        <path d="M8.5 8.5v.01" />
        <path d="M16 15.5v.01" />
        <path d="M12 12v.01" />
        <path d="M11 17v.01" />
        <path d="M7 14v.01" />
      </svg>
    ),
    wedding_planner: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    makeup: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3v18" />
        <rect x="8" y="8" width="8" height="5" rx="1" />
        <path d="M10 8V6a2 2 0 0 1 4 0v2" />
        <path d="M8 13v6a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-6" />
      </svg>
    ),
  };

  return iconMap[categoryId] || null;
}

