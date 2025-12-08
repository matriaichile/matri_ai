'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Loader2, CheckCircle } from 'lucide-react';
import { useAuthStore, CategoryId, ProviderProfile } from '@/store/authStore';
import { useSurveyStore } from '@/store/surveyStore';
import { CATEGORY_INFO, getCategoryInfo } from '@/lib/surveys';
import { SurveyContainer, SurveyStep, QuestionRenderer } from '@/components/surveys';
import { saveProviderCategorySurvey } from '@/lib/firebase/firestore';
import styles from './page.module.css';

/**
 * Página de encuesta de categoría para proveedores.
 * Permite a los proveedores completar encuestas específicas por categoría.
 */
export default function ProviderCategorySurveyPage() {
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
  const [showSuccess, setShowSuccess] = useState(false);

  // Verificar autenticación
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated()) {
        router.push('/login');
      } else if (userType === 'user') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, userType, isLoading, router]);

  // Verificar que el proveedor tenga esta categoría
  useEffect(() => {
    if (!isLoading && userProfile) {
      const providerProfile = userProfile as ProviderProfile;
      if (!providerProfile.categories?.includes(categoryId)) {
        router.push('/dashboard/provider');
      }
    }
  }, [isLoading, userProfile, categoryId, router]);

  // Inicializar encuesta cuando se carga la página
  useEffect(() => {
    if (categoryId && CATEGORY_INFO[categoryId]) {
      initSurvey(categoryId, 'provider');
    } else {
      // Categoría inválida
      router.push('/dashboard/provider');
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

      // Guardar respuestas en Firestore (también actualiza el estado en el perfil)
      await saveProviderCategorySurvey(firebaseUser.uid, categoryId, responses);

      // Mostrar éxito
      setShowSuccess(true);
      
      // Redirigir después de mostrar el éxito
      setTimeout(() => {
        router.push('/dashboard/provider');
      }, 2000);
    } catch (err) {
      console.error('Error al guardar encuesta:', err);
      setError('Hubo un error al guardar tus respuestas. Por favor, intenta de nuevo.');
      setIsSubmitting(false);
    }
  };

  // Manejar cambio de respuesta
  const handleResponseChange = (value: string | string[] | number | boolean | undefined) => {
    const currentQuestion = questions[currentStep];
    if (currentQuestion) {
      setResponse(currentQuestion.id, value);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={40} />
        <p>Cargando...</p>
      </div>
    );
  }

  // Verificar categoría válida
  const categoryInfo = getCategoryInfo(categoryId);
  if (!categoryInfo) {
    return (
      <div className={styles.errorContainer}>
        <h2>Categoría no encontrada</h2>
        <Link href="/dashboard/provider" className={styles.backLink}>
          Volver al inicio
        </Link>
      </div>
    );
  }

  // Success state
  if (showSuccess) {
    return (
      <SurveyContainer
        categoryId={categoryId}
        showWelcome={false}
        onStartSurvey={() => {}}
        userType="provider"
      >
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>
            <CheckCircle size={64} />
          </div>
          <h2>¡Encuesta completada!</h2>
          <p>
            Tu información ha sido guardada. Ahora recibirás leads más relevantes
            para tus servicios de {categoryInfo.name.toLowerCase()}.
          </p>
        </div>
      </SurveyContainer>
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
      userType="provider"
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
