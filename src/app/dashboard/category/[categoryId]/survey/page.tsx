'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore, CategoryId, UserProfile } from '@/store/authStore';
import { useSurveyStore } from '@/store/surveyStore';
import { SurveyContainer, SurveyStep, QuestionRenderer } from '@/components/surveys';
import { getSurveyConfig, CATEGORY_INFO, getCategoryInfo } from '@/lib/surveys';
import { saveUserCategorySurvey, generateMatchesForUserSurvey, getUserProfile } from '@/lib/firebase/firestore';
import styles from './page.module.css';

/**
 * Página de encuesta por categoría para usuarios (novios).
 * Permite completar preguntas específicas de cada categoría para el matchmaking.
 */
export default function UserCategorySurveyPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.categoryId as CategoryId;
  
  const { isAuthenticated, userProfile, userType, isLoading, firebaseUser, setUserProfile } = useAuthStore();
  const {
    currentStep,
    totalSteps,
    questions,
    responses,
    showWelcome,
    isSubmitting,
    initSurvey,
    setShowWelcome,
    nextStep,
    prevStep,
    setResponse,
    setIsSubmitting,
    isCurrentQuestionAnswered,
    isLastStep,
    resetSurvey,
  } = useSurveyStore();

  const [error, setError] = useState<string | null>(null);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Guardando tus respuestas...');
  const [matchesGenerated, setMatchesGenerated] = useState(0);

  // Mensajes de carga según la categoría
  const getLoadingMessages = () => {
    const categoryInfo = getCategoryInfo(categoryId);
    const categoryName = categoryInfo?.name || 'servicio';
    return [
      'Guardando tus respuestas...',
      `Analizando tus preferencias de ${categoryName}...`,
      'Buscando proveedores compatibles...',
      'Calculando compatibilidad...',
      'Preparando tus recomendaciones...',
    ];
  };

  // Verificar autenticación y tipo de usuario
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated()) {
        router.push('/login');
      } else if (userType === 'provider') {
        router.push('/dashboard/provider');
      }
    }
  }, [isAuthenticated, userType, isLoading, router]);

  // Inicializar encuesta cuando se carga la página
  useEffect(() => {
    if (categoryId && CATEGORY_INFO[categoryId]) {
      initSurvey(categoryId, 'user');
    } else {
      // Categoría inválida
      router.push('/dashboard');
    }

    // Cleanup al desmontar
    return () => {
      resetSurvey();
    };
  }, [categoryId, initSurvey, resetSurvey, router]);

  // Manejar inicio de encuesta
  const handleStartSurvey = () => {
    setShowWelcome(false);
  };

  // Manejar siguiente paso
  const handleNext = () => {
    if (isCurrentQuestionAnswered()) {
      nextStep();
    }
  };

  // Manejar paso anterior
  const handleBack = () => {
    prevStep();
  };

  // Manejar envío de encuesta con pantalla de carga
  const handleSubmit = async () => {
    if (!firebaseUser?.uid || !categoryId) return;

    try {
      setIsSubmitting(true);
      setError(null);
      setShowLoadingScreen(true);
      setLoadingProgress(0);

      const loadingMessages = getLoadingMessages();
      let messageIndex = 0;

      // Simular progreso mientras se procesa
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) return prev; // Detenerse en 90% hasta que termine el proceso real
          return prev + 5;
        });
        
        // Cambiar mensajes periódicamente
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 400);

      // 1. Guardar respuestas en Firestore
      setLoadingMessage('Guardando tus respuestas...');
      await saveUserCategorySurvey(firebaseUser.uid, categoryId, responses);
      setLoadingProgress(30);

      // 2. Obtener la región del usuario del perfil
      const profile = userProfile as UserProfile;
      const userRegion = profile?.region || 'rm';

      // 3. Generar matches basados en las respuestas
      setLoadingMessage('Buscando proveedores compatibles...');
      let generatedLeads = [];
      try {
        generatedLeads = await generateMatchesForUserSurvey(firebaseUser.uid, categoryId, userRegion, 5);
        setMatchesGenerated(generatedLeads.length);
        setLoadingProgress(80);
      } catch (matchError) {
        console.warn('Error generando matches (continuando):', matchError);
        // No bloqueamos si falla la generación de matches
      }

      // 4. Actualizar el perfil del usuario en el store
      try {
        const updatedProfile = await getUserProfile(firebaseUser.uid);
        if (updatedProfile) {
          setUserProfile(updatedProfile);
        }
      } catch (profileError) {
        console.warn('Error actualizando perfil:', profileError);
      }

      // Detener el intervalo y completar
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setLoadingMessage(
        generatedLeads.length > 0 
          ? `¡Encontramos ${generatedLeads.length} proveedores para ti!` 
          : 'Encuesta completada'
      );

      // Esperar un momento para mostrar el mensaje final
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Redirigir a la página de matches
      router.push(`/dashboard/category/${categoryId}/matches`);
    } catch (err) {
      console.error('Error al guardar encuesta:', err);
      setError('Hubo un error al guardar tus respuestas. Por favor, intenta de nuevo.');
      setShowLoadingScreen(false);
      setIsSubmitting(false);
    }
  };

  // Manejar cambio de respuesta
  const handleResponseChange = (value: string | string[] | number | boolean) => {
    const currentQuestion = questions[currentStep];
    if (currentQuestion) {
      setResponse(currentQuestion.id, value);
    }
  };

  // Mostrar loading mientras se verifica autenticación
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Cargando...</p>
      </div>
    );
  }

  // Pantalla de carga mientras se genera el matching
  if (showLoadingScreen) {
    const categoryInfo = getCategoryInfo(categoryId);
    return (
      <main className={styles.matchingLoadingScreen}>
        {/* Fondo decorativo */}
        <div className={styles.backgroundPattern} />
        <div className={styles.gradientOverlay} />
        
        {/* Partículas flotantes */}
        <div className={styles.particles}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className={styles.particle} style={{ animationDelay: `${i * 0.5}s` }} />
          ))}
        </div>

        <div className={styles.matchingContent}>
          {/* Logo */}
          <div className={styles.logoContainer}>
            <Image 
              src="/logo.png" 
              alt="Matri.AI Logo" 
              width={180} 
              height={65}
              className={styles.logo}
            />
          </div>

          {/* Icono animado */}
          <div className={styles.iconContainer}>
            <div className={styles.iconRing} />
            <div className={styles.iconRing2} />
            <div className={styles.iconInner}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
          </div>

          {/* Título */}
          <h1 className={styles.matchingTitle}>
            Buscando tu <span className={styles.highlight}>match perfecto</span>
          </h1>
          <p className={styles.matchingSubtitle}>
            {categoryInfo?.name || 'Servicio'}
          </p>

          {/* Mensaje actual */}
          <p className={styles.matchingMessage}>
            {loadingMessage}
          </p>

          {/* Barra de progreso */}
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <span className={styles.progressText}>{loadingProgress}%</span>
          </div>

          {/* Texto inferior */}
          <p className={styles.matchingFooterText}>
            Nuestro algoritmo está analizando proveedores para encontrar los mejores para ti
          </p>
        </div>
      </main>
    );
  }

  // Verificar que la categoría existe
  const surveyConfig = getSurveyConfig(categoryId);
  if (!surveyConfig) {
    return (
      <div className={styles.errorContainer}>
        <h2>Categoría no encontrada</h2>
        <p>La categoría que buscas no existe.</p>
        <button onClick={() => router.push('/dashboard')} className={styles.backButton}>
          Volver al dashboard
        </button>
      </div>
    );
  }

  // Obtener pregunta actual
  const currentQuestion = questions[currentStep];
  const currentValue = currentQuestion ? responses[currentQuestion.id] : undefined;

  return (
    <SurveyContainer
      categoryId={categoryId}
      showWelcome={showWelcome}
      onStartSurvey={handleStartSurvey}
      userType="user"
    >
      {currentQuestion && (
        <SurveyStep
          title={currentQuestion.question}
          subtitle={currentQuestion.required ? '' : '(Opcional)'}
          currentStep={currentStep}
          totalSteps={totalSteps}
          isVisible={!showWelcome}
          onNext={handleNext}
          onBack={handleBack}
          onSubmit={handleSubmit}
          nextDisabled={!isCurrentQuestionAnswered()}
          showBack={currentStep > 0}
          isLastStep={isLastStep()}
          isSubmitting={isSubmitting}
        >
          <QuestionRenderer
            question={currentQuestion}
            value={currentValue}
            onChange={handleResponseChange}
          />

          {error && (
            <div className={styles.errorMessage}>
              <p>{error}</p>
            </div>
          )}
        </SurveyStep>
      )}
    </SurveyContainer>
  );
}

