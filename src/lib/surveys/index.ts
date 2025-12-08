/**
 * Sistema de Encuestas por Categoría
 * Matri.AI - Índice principal
 * 
 * Actualizado según especificaciones de AJUSTES_ENCUESTAS_Y_NUEVAS_CATEGORIAS.md
 */

import { CategoryId } from '@/store/authStore';
import { CategorySurveyConfig, SurveyQuestion } from './types';
import { PHOTOGRAPHY_USER_QUESTIONS, PHOTOGRAPHY_PROVIDER_QUESTIONS } from './photography';
import { VIDEO_USER_QUESTIONS, VIDEO_PROVIDER_QUESTIONS } from './video';
import { DJ_USER_QUESTIONS, DJ_PROVIDER_QUESTIONS } from './dj';
import { CATERING_USER_QUESTIONS, CATERING_PROVIDER_QUESTIONS } from './catering';
import { VENUE_USER_QUESTIONS, VENUE_PROVIDER_QUESTIONS } from './venue';
import { DECORATION_USER_QUESTIONS, DECORATION_PROVIDER_QUESTIONS } from './decoration';
import { WEDDING_PLANNER_USER_QUESTIONS, WEDDING_PLANNER_PROVIDER_QUESTIONS } from './weddingPlanner';
import { MAKEUP_USER_QUESTIONS, MAKEUP_PROVIDER_QUESTIONS } from './makeup';
// Nuevas categorías
import { ENTERTAINMENT_USER_QUESTIONS, ENTERTAINMENT_PROVIDER_QUESTIONS } from './entertainment';
import { CAKES_USER_QUESTIONS, CAKES_PROVIDER_QUESTIONS } from './cakes';
import { TRANSPORT_USER_QUESTIONS, TRANSPORT_PROVIDER_QUESTIONS } from './transport';
import { INVITATIONS_USER_QUESTIONS, INVITATIONS_PROVIDER_QUESTIONS } from './invitations';
import { DRESS_USER_QUESTIONS, DRESS_PROVIDER_QUESTIONS } from './dress';

// Re-exportar tipos
export * from './types';

// Información de categorías
export const CATEGORY_INFO: Record<CategoryId, { name: string; description: string; icon: string }> = {
  catering: {
    name: 'Banquetería',
    description: 'Delicias gastronómicas para tus invitados',
    icon: 'utensils',
  },
  venue: {
    name: 'Centro de Eventos',
    description: 'El lugar ideal para tu celebración',
    icon: 'building',
  },
  photography: {
    name: 'Fotografía',
    description: 'Captura los mejores momentos de tu día especial',
    icon: 'camera',
  },
  video: {
    name: 'Videografía',
    description: 'Revive tu boda una y otra vez',
    icon: 'video',
  },
  dj: {
    name: 'DJ / VJ',
    description: 'La música perfecta para tu celebración',
    icon: 'music',
  },
  decoration: {
    name: 'Decoración & Florería',
    description: 'Transforma el espacio en un sueño',
    icon: 'flower',
  },
  entertainment: {
    name: 'Entretenimiento',
    description: 'Shows y actividades para tu evento',
    icon: 'party',
  },
  makeup: {
    name: 'Maquillaje & Peinado',
    description: 'Luce radiante en tu día especial',
    icon: 'sparkles',
  },
  cakes: {
    name: 'Tortas & Dulces',
    description: 'Tortas de novios y mesas de dulces',
    icon: 'cake',
  },
  transport: {
    name: 'Auto de Novios',
    description: 'El auto para tu llegada especial',
    icon: 'car',
  },
  invitations: {
    name: 'Invitaciones',
    description: 'Invitaciones y papelería de boda',
    icon: 'mail',
  },
  dress: {
    name: 'Vestidos & Trajes',
    description: 'El atuendo perfecto para tu día especial',
    icon: 'dress',
  },
  wedding_planner: {
    name: 'Wedding Planner',
    description: 'Coordinación profesional de tu evento',
    icon: 'clipboard',
  },
};

// Configuración completa de encuestas por categoría
export const CATEGORY_SURVEYS: Record<CategoryId, CategorySurveyConfig> = {
  catering: {
    categoryId: 'catering',
    categoryName: 'Banquetería',
    description: 'Cuéntanos sobre tus preferencias gastronómicas',
    userQuestions: CATERING_USER_QUESTIONS,
    providerQuestions: CATERING_PROVIDER_QUESTIONS,
  },
  venue: {
    categoryId: 'venue',
    categoryName: 'Centro de Eventos',
    description: 'Cuéntanos sobre el lugar ideal para tu evento',
    userQuestions: VENUE_USER_QUESTIONS,
    providerQuestions: VENUE_PROVIDER_QUESTIONS,
  },
  photography: {
    categoryId: 'photography',
    categoryName: 'Fotografía',
    description: 'Cuéntanos sobre tus preferencias fotográficas',
    userQuestions: PHOTOGRAPHY_USER_QUESTIONS,
    providerQuestions: PHOTOGRAPHY_PROVIDER_QUESTIONS,
  },
  video: {
    categoryId: 'video',
    categoryName: 'Videografía',
    description: 'Cuéntanos sobre tus preferencias de video',
    userQuestions: VIDEO_USER_QUESTIONS,
    providerQuestions: VIDEO_PROVIDER_QUESTIONS,
  },
  dj: {
    categoryId: 'dj',
    categoryName: 'DJ / VJ',
    description: 'Cuéntanos sobre tus preferencias musicales',
    userQuestions: DJ_USER_QUESTIONS,
    providerQuestions: DJ_PROVIDER_QUESTIONS,
  },
  decoration: {
    categoryId: 'decoration',
    categoryName: 'Decoración & Florería',
    description: 'Cuéntanos sobre tus preferencias de decoración',
    userQuestions: DECORATION_USER_QUESTIONS,
    providerQuestions: DECORATION_PROVIDER_QUESTIONS,
  },
  entertainment: {
    categoryId: 'entertainment',
    categoryName: 'Entretenimiento',
    description: 'Cuéntanos sobre el entretenimiento que buscas',
    userQuestions: ENTERTAINMENT_USER_QUESTIONS,
    providerQuestions: ENTERTAINMENT_PROVIDER_QUESTIONS,
  },
  makeup: {
    categoryId: 'makeup',
    categoryName: 'Maquillaje & Peinado',
    description: 'Cuéntanos sobre tus preferencias de belleza',
    userQuestions: MAKEUP_USER_QUESTIONS,
    providerQuestions: MAKEUP_PROVIDER_QUESTIONS,
  },
  cakes: {
    categoryId: 'cakes',
    categoryName: 'Tortas & Dulces',
    description: 'Cuéntanos sobre tus preferencias de torta y dulces',
    userQuestions: CAKES_USER_QUESTIONS,
    providerQuestions: CAKES_PROVIDER_QUESTIONS,
  },
  transport: {
    categoryId: 'transport',
    categoryName: 'Auto de Novios',
    description: 'Cuéntanos sobre el auto para tu día especial',
    userQuestions: TRANSPORT_USER_QUESTIONS,
    providerQuestions: TRANSPORT_PROVIDER_QUESTIONS,
  },
  invitations: {
    categoryId: 'invitations',
    categoryName: 'Invitaciones',
    description: 'Cuéntanos sobre tus preferencias de invitaciones',
    userQuestions: INVITATIONS_USER_QUESTIONS,
    providerQuestions: INVITATIONS_PROVIDER_QUESTIONS,
  },
  dress: {
    categoryId: 'dress',
    categoryName: 'Vestidos & Trajes',
    description: 'Cuéntanos sobre tus preferencias de vestuario',
    userQuestions: DRESS_USER_QUESTIONS,
    providerQuestions: DRESS_PROVIDER_QUESTIONS,
  },
  wedding_planner: {
    categoryId: 'wedding_planner',
    categoryName: 'Wedding Planner',
    description: 'Cuéntanos sobre tus necesidades de planificación',
    userQuestions: WEDDING_PLANNER_USER_QUESTIONS,
    providerQuestions: WEDDING_PLANNER_PROVIDER_QUESTIONS,
  },
};

/**
 * Obtener preguntas de encuesta para una categoría
 */
export function getSurveyQuestions(
  categoryId: CategoryId,
  userType: 'user' | 'provider'
): SurveyQuestion[] {
  const survey = CATEGORY_SURVEYS[categoryId];
  if (!survey) return [];
  return userType === 'user' ? survey.userQuestions : survey.providerQuestions;
}

/**
 * Obtener configuración de encuesta para una categoría
 */
export function getSurveyConfig(categoryId: CategoryId): CategorySurveyConfig | null {
  return CATEGORY_SURVEYS[categoryId] || null;
}

/**
 * Obtener información de una categoría
 */
export function getCategoryInfo(categoryId: CategoryId) {
  return CATEGORY_INFO[categoryId] || null;
}

/**
 * Obtener todas las categorías disponibles
 */
export function getAllCategories(): CategoryId[] {
  return Object.keys(CATEGORY_SURVEYS) as CategoryId[];
}
