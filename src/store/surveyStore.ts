/**
 * Store de Zustand para el manejo de encuestas por categoría
 * Matri.AI - Sistema de Matchmaking por Categoría
 */

import { create } from 'zustand';
import { CategoryId } from './authStore';
import { SurveyResponses, SurveyQuestion } from '@/lib/surveys/types';
import { getSurveyQuestions } from '@/lib/surveys';

// Estado de la encuesta
interface SurveyState {
  // Categoría actual
  currentCategory: CategoryId | null;
  
  // Tipo de usuario (user o provider)
  userType: 'user' | 'provider';
  
  // Paso actual (índice de la pregunta)
  currentStep: number;
  
  // Total de pasos
  totalSteps: number;
  
  // Preguntas de la encuesta actual
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
  setResponse: (questionId: string, value: string | string[] | number | boolean) => void;
  setShowWelcome: (show: boolean) => void;
  setIsTransitioning: (transitioning: boolean) => void;
  setIsSubmitting: (submitting: boolean) => void;
  setError: (error: string | null) => void;
  resetSurvey: () => void;
  
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
    const questions = getSurveyQuestions(categoryId, userType);
    
    set({
      currentCategory: categoryId,
      userType,
      currentStep: 0,
      totalSteps: questions.length,
      questions,
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
  
  // Guardar respuesta
  setResponse: (questionId: string, value: string | string[] | number | boolean) => {
    set((state) => ({
      responses: {
        ...state.responses,
        [questionId]: value,
      },
    }));
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





