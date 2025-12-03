'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore, CategoryId, UserProfile } from '@/store/authStore';
import { useSurveyStore } from '@/store/surveyStore';
import { SurveyContainer, SurveyStep, QuestionRenderer } from '@/components/surveys';
import { getSurveyConfig, CATEGORY_INFO } from '@/lib/surveys';
import { saveUserCategorySurvey, generateMatchesForUserSurvey } from '@/lib/firebase/firestore';
import styles from './page.module.css';

/**
 * Página de encuesta por categoría para usuarios (novios).
 * Permite completar preguntas específicas de cada categoría para el matchmaking.
 */
export default function UserCategorySurveyPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.categoryId as CategoryId;
  
  const { isAuthenticated, userProfile, userType, isLoading, firebaseUser } = useAuthStore();
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

  // Manejar envío de encuesta
  const handleSubmit = async () => {
    if (!firebaseUser?.uid || !categoryId) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Guardar respuestas en Firestore
      await saveUserCategorySurvey(firebaseUser.uid, categoryId, responses);

      // Obtener la región del usuario del perfil
      const profile = userProfile as { region?: string };
      const userRegion = profile?.region || 'metropolitana';

      // Generar matches basados en las respuestas
      try {
        await generateMatchesForUserSurvey(firebaseUser.uid, categoryId, userRegion, 5);
      } catch (matchError) {
        console.warn('Error generando matches (continuando):', matchError);
        // No bloqueamos si falla la generación de matches
      }

      // Redirigir a la página de matches
      router.push(`/dashboard/category/${categoryId}/matches`);
    } catch (err) {
      console.error('Error al guardar encuesta:', err);
      setError('Hubo un error al guardar tus respuestas. Por favor, intenta de nuevo.');
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

