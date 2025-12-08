/**
 * Store de Zustand para el manejo de encuestas por categoría
 * Matri.AI - Sistema de Matchmaking por Categoría
 */

import { create } from 'zustand';
import { CategoryId } from './authStore';
import { SurveyResponses, SurveyQuestion, QuestionCondition } from '@/lib/surveys/types';
import { getSurveyQuestions } from '@/lib/surveys';

/**
 * Helper para evaluar si una pregunta debe mostrarse basándose en su condición dependsOn
 */
function shouldShowQuestion(question: SurveyQuestion, responses: SurveyResponses): boolean {
  // Si no tiene condición, siempre se muestra
  if (!question.dependsOn) return true;
  
  const { questionId, values, negate } = question.dependsOn;
  const response = responses[questionId];
  
  // Si no hay respuesta para la pregunta de la cual depende, no mostrar
  if (response === undefined || response === null) return false;
  
  // Verificar si alguno de los valores requeridos está en la respuesta
  let hasMatch = false;
  
  if (Array.isArray(response)) {
    // Si la respuesta es un array, verificar si contiene alguno de los valores
    hasMatch = values.some(v => response.includes(v));
  } else if (typeof response === 'string') {
    // Si es string, verificar si coincide con alguno de los valores
    hasMatch = values.includes(response);
  }
  
  // Si negate es true, invertir la lógica
  return negate ? !hasMatch : hasMatch;
}

// Estado de la encuesta
interface SurveyState {
  // Categoría actual
  currentCategory: CategoryId | null;
  
  // Tipo de usuario (user o provider)
  userType: 'user' | 'provider';
  
  // Paso actual (índice de la pregunta visible)
  currentStep: number;
  
  // Total de pasos (preguntas visibles)
  totalSteps: number;
  
  // Todas las preguntas de la encuesta (incluyendo las condicionales)
  allQuestions: SurveyQuestion[];
  
  // Preguntas visibles basadas en las respuestas actuales
  questions: SurveyQuestion[];
  
  // Respuestas del usuario
  responses: SurveyResponses;
  
  // Estados de UI
  isLoading: boolean;
  isSubmitting: boolean;
  showWelcome: boolean;
  isTransitioning: boolean;
  
  // Error
  error: string | null;
  
  // Acciones
  initSurvey: (categoryId: CategoryId, userType: 'user' | 'provider') => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setResponse: (questionId: string, value: string | string[] | number | boolean | undefined) => void;
  setShowWelcome: (show: boolean) => void;
  setIsTransitioning: (transitioning: boolean) => void;
  setIsSubmitting: (submitting: boolean) => void;
  setError: (error: string | null) => void;
  resetSurvey: () => void;
  updateVisibleQuestions: () => void;
  
  // Helpers
  getCurrentQuestion: () => SurveyQuestion | null;
  isCurrentQuestionAnswered: () => boolean;
  getProgress: () => number;
  canGoNext: () => boolean;
  canGoBack: () => boolean;
  isLastStep: () => boolean;
}

// Estado inicial
const initialState = {
  currentCategory: null as CategoryId | null,
  userType: 'user' as 'user' | 'provider',
  currentStep: 0,
  totalSteps: 0,
  allQuestions: [] as SurveyQuestion[],
  questions: [] as SurveyQuestion[],
  responses: {} as SurveyResponses,
  isLoading: false,
  isSubmitting: false,
  showWelcome: true,
  isTransitioning: false,
  error: null as string | null,
};

export const useSurveyStore = create<SurveyState>((set, get) => ({
  ...initialState,
  
  // Inicializar encuesta para una categoría
  initSurvey: (categoryId: CategoryId, userType: 'user' | 'provider') => {
    const allQuestions = getSurveyQuestions(categoryId, userType);
    // Inicialmente, filtrar solo las preguntas sin condiciones o con condiciones ya cumplidas
    const visibleQuestions = allQuestions.filter(q => shouldShowQuestion(q, {}));
    
    set({
      currentCategory: categoryId,
      userType,
      currentStep: 0,
      totalSteps: visibleQuestions.length,
      allQuestions,
      questions: visibleQuestions,
      responses: {},
      showWelcome: true,
      isTransitioning: false,
      error: null,
    });
  },
  
  // Establecer paso actual
  setCurrentStep: (step: number) => {
    const { totalSteps } = get();
    if (step >= 0 && step < totalSteps) {
      set({ currentStep: step });
    }
  },
  
  // Siguiente paso
  nextStep: () => {
    const { currentStep, totalSteps } = get();
    if (currentStep < totalSteps - 1) {
      set({ currentStep: currentStep + 1 });
    }
  },
  
  // Paso anterior
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },
  
  // Guardar respuesta y actualizar preguntas visibles
  setResponse: (questionId: string, value: string | string[] | number | boolean | undefined) => {
    const { allQuestions, currentStep } = get();
    const newResponses = {
      ...get().responses,
      [questionId]: value,
    };
    
    // Recalcular preguntas visibles basándose en las nuevas respuestas
    const visibleQuestions = allQuestions.filter(q => shouldShowQuestion(q, newResponses));
    
    // Obtener la pregunta actual para mantener la posición
    const currentQuestion = get().questions[currentStep];
    let newStep = currentStep;
    
    if (currentQuestion) {
      // Encontrar el nuevo índice de la pregunta actual en las preguntas visibles
      const newIndex = visibleQuestions.findIndex(q => q.id === currentQuestion.id);
      if (newIndex >= 0) {
        newStep = newIndex;
      }
    }
    
    set({
      responses: newResponses,
      questions: visibleQuestions,
      totalSteps: visibleQuestions.length,
      currentStep: newStep,
    });
  },
  
  // Actualizar preguntas visibles manualmente
  updateVisibleQuestions: () => {
    const { allQuestions, responses, currentStep } = get();
    const visibleQuestions = allQuestions.filter(q => shouldShowQuestion(q, responses));
    
    // Obtener la pregunta actual para mantener la posición
    const currentQuestion = get().questions[currentStep];
    let newStep = currentStep;
    
    if (currentQuestion) {
      const newIndex = visibleQuestions.findIndex(q => q.id === currentQuestion.id);
      if (newIndex >= 0) {
        newStep = newIndex;
      }
    }
    
    set({
      questions: visibleQuestions,
      totalSteps: visibleQuestions.length,
      currentStep: Math.min(newStep, visibleQuestions.length - 1),
    });
  },
  
  // UI states
  setShowWelcome: (show: boolean) => set({ showWelcome: show }),
  setIsTransitioning: (transitioning: boolean) => set({ isTransitioning: transitioning }),
  setIsSubmitting: (submitting: boolean) => set({ isSubmitting: submitting }),
  setError: (error: string | null) => set({ error }),
  
  // Reset
  resetSurvey: () => set(initialState),
  
  // Obtener pregunta actual
  getCurrentQuestion: () => {
    const { questions, currentStep } = get();
    return questions[currentStep] || null;
  },
  
  // Verificar si la pregunta actual está respondida
  isCurrentQuestionAnswered: () => {
    const { questions, currentStep, responses } = get();
    const question = questions[currentStep];
    
    if (!question) return false;
    
    const response = responses[question.id];
    
    // Si no es requerida, siempre está "respondida"
    if (!question.required) return true;
    
    // Verificar según el tipo
    if (response === undefined || response === null) return false;
    
    switch (question.type) {
      case 'single':
      case 'text':
        return typeof response === 'string' && response.trim() !== '';
      case 'multiple':
        return Array.isArray(response) && response.length > 0;
      case 'number':
      case 'range':
        return typeof response === 'number';
      case 'boolean':
        return typeof response === 'boolean';
      default:
        return false;
    }
  },
  
  // Obtener progreso (0-100)
  getProgress: () => {
    const { currentStep, totalSteps } = get();
    if (totalSteps === 0) return 0;
    return Math.round(((currentStep + 1) / totalSteps) * 100);
  },
  
  // Verificar si puede avanzar
  canGoNext: () => {
    const { isCurrentQuestionAnswered, currentStep, totalSteps } = get();
    return isCurrentQuestionAnswered() && currentStep < totalSteps - 1;
  },
  
  // Verificar si puede retroceder
  canGoBack: () => {
    const { currentStep } = get();
    return currentStep > 0;
  },
  
  // Verificar si es el último paso
  isLastStep: () => {
    const { currentStep, totalSteps } = get();
    return currentStep === totalSteps - 1;
  },
}));





