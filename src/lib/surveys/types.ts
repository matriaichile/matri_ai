/**
 * Tipos para el sistema de encuestas por categoría
 * Matri.AI - Sistema de Matchmaking por Categoría
 */

import { CategoryId } from '@/store/authStore';

// Tipo de pregunta
export type QuestionType = 'single' | 'multiple' | 'range' | 'boolean' | 'text' | 'number';

// Opción de respuesta
export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
}

// Definición de condición para mostrar una pregunta
export interface QuestionCondition {
  questionId: string; // ID de la pregunta de la cual depende
  values: string[]; // Valores que deben estar seleccionados para mostrar esta pregunta
  negate?: boolean; // Si es true, se muestra cuando NO están seleccionados los valores
}

// Definición de pregunta
export interface SurveyQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: QuestionOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  required: boolean;
  weight: number; // Peso en el matchmaking (0-100)
  dependsOn?: QuestionCondition; // NUEVO: Condición para mostrar esta pregunta
}

// Criterio de matching entre preguntas de usuario y proveedor
export interface MatchingCriterion {
  userQuestionId: string;
  providerQuestionId: string;
  weight: number; // Peso en el cálculo de match (0-100)
  matchingLogic: 'exact' | 'contains' | 'range_overlap' | 'boolean_match';
}

// Configuración de encuesta por categoría
export interface CategorySurveyConfig {
  categoryId: CategoryId;
  categoryName: string;
  description: string;
  userQuestions: SurveyQuestion[];
  providerQuestions: SurveyQuestion[];
  matchingCriteria?: MatchingCriterion[];
}

// Respuestas de encuesta
export type SurveyResponses = Record<string, string | string[] | number | boolean | undefined>;

// Estado de la encuesta en el store
export interface SurveyState {
  currentCategory: CategoryId | null;
  currentStep: number;
  totalSteps: number;
  responses: SurveyResponses;
  isSubmitting: boolean;
  isComplete: boolean;
}

