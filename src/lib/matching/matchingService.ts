/**
 * Servicio de Matchmaking por Categoría - VERSIÓN AVANZADA
 * Matri.AI - Sistema de cálculo de compatibilidad entre usuarios y proveedores
 * 
 * Este servicio calcula el match score basándose en:
 * 1. Datos del wizard inicial (perfil general del usuario y proveedor)
 * 2. Respuestas de mini-encuestas por categoría
 * 3. Criterios de matching EXPLÍCITOS definidos para cada categoría
 * 4. Pesos asignados a cada criterio
 * 5. BONUS por especificidad del proveedor (proveedores nicho)
 * 6. COBERTURA - qué tan bien el proveedor cubre las necesidades
 * 
 * MEJORAS PRINCIPALES:
 * - Criterios de matching explícitos por categoría (no automáticos)
 * - Mejor comparación de rangos numéricos con strings
 * - Sistema de especificidad: proveedores nicho obtienen bonus
 * - Penalización suave para proveedores "hace todo" vs. especialistas
 * - Lógica de contains mejorada con coincidencia exacta
 * - Tipos de comparación "threshold" para preguntas de umbral
 */

import { CategoryId } from '@/store/authStore';
import { CATEGORY_SURVEYS } from '@/lib/surveys';
import { SurveyResponses, SurveyQuestion } from '@/lib/surveys/types';

// ============================================
// TIPOS PARA DATOS DEL WIZARD
// ============================================

// Datos del wizard del usuario (novios)
export interface UserWizardProfile {
  budget: string;
  guestCount: number | string; // Número exacto de invitados (o string legacy)
  region: string;
  eventStyle: string;
  ceremonyTypes: string[];
  priorityCategories: string[];
  involvementLevel: string;
}

// Datos del wizard del proveedor
export interface ProviderWizardProfile {
  serviceStyle: string;
  priceRange: string;
  workRegion: string;
  acceptsOutsideZone: boolean;
  categories: string[];
}

// ============================================
// TIPOS PARA EL MATCHING
// ============================================

// Tipos de match disponibles
type MatchType = 
  | 'exact'              // Coincidencia exacta
  | 'contains'           // Usuario multiple, proveedor multiple - % de cobertura
  | 'range_overlap'      // Superposición de rangos (presupuesto)
  | 'boolean_match'      // Si usuario necesita, proveedor debe ofrecer
  | 'single_in_multiple' // Usuario elige uno, proveedor ofrece varios
  | 'preference_match'   // Mapeo de preferencias a scores
  | 'threshold_at_least' // Proveedor debe ofrecer AL MENOS lo que usuario pide (ej: horas, fotos)
  | 'threshold_at_most'  // Proveedor debe poder entregar ANTES/MENOS de lo que usuario pide (ej: tiempo entrega)
  | 'threshold_can_accommodate'; // Proveedor debe poder acomodar lo que usuario necesita (ej: capacidad)

// Tipos para el resultado del matching
export interface MatchResult {
  providerId: string;
  userId: string;
  category: CategoryId;
  matchScore: number;
  matchDetails: MatchDetail[];
  wizardMatchDetails?: WizardMatchDetail[];
  specificityBonus: number; // Bonus por ser especialista
  coverageScore: number; // Qué tan bien cubre las necesidades
  createdAt: Date;
}

export interface MatchDetail {
  criterionId: string;
  userQuestionId: string;
  providerQuestionId: string;
  userValue: string | string[] | number | boolean | undefined;
  providerValue: string | string[] | number | boolean | undefined;
  score: number;
  weight: number;
  matchType: MatchType;
  explanation?: string; // Explicación legible del match
}

// Detalles del match basado en datos del wizard
export interface WizardMatchDetail {
  criterion: string;
  userValue: string | string[] | boolean;
  providerValue: string | string[] | boolean;
  score: number;
  weight: number;
}

// ============================================
// CRITERIOS DE MATCHING EXPLÍCITOS POR CATEGORÍA
// ============================================

interface ExplicitMatchCriterion {
  userQuestionId: string;
  providerQuestionId: string;
  providerQuestionIdMax?: string; // Para rangos con min/max
  weight: number;
  matchType: MatchType;
  // Para rangos numéricos, mapeo de opciones del usuario a valores
  userRangeMapping?: Record<string, { min: number; max: number }>;
  // Para mapeos ordenados (tiempo de entrega, horarios)
  orderedMapping?: Record<string, number>; // Mapea opciones a valores numéricos para comparar
  // Para preference_match (required/preferred/not_needed vs boolean/options)
  preferenceMapping?: Record<string, number>; // Mapea respuestas del proveedor a scores
}

// ============================================
// MAPEOS DE TIEMPO DE ENTREGA (ordenados de más rápido a más lento)
// ============================================
const DELIVERY_TIME_ORDER: Record<string, number> = {
  '2_weeks': 14,
  '1_month': 30,
  '2_months': 60,
  '3_months': 90,
  '6_months': 180,
  'flexible': 365, // Flexible significa que acepta cualquier tiempo
};

// Mapeo de horarios de término (ordenados de más temprano a más tarde)
const END_TIME_ORDER: Record<string, number> = {
  'midnight': 0,
  '2am': 2,
  '4am': 4,
  'sunrise': 6,
  'flexible': 24, // Flexible significa que puede ser cualquier hora
};

// ============================================
// CRITERIOS EXPLÍCITOS PARA FOTOGRAFÍA
// ============================================
const PHOTOGRAPHY_MATCHING_CRITERIA: ExplicitMatchCriterion[] = [
  {
    // Estilo: usuario elige uno, proveedor ofrece múltiples
    userQuestionId: 'photo_u_style',
    providerQuestionId: 'photo_p_styles',
    weight: 25,
    matchType: 'single_in_multiple',
  },
  {
    // Horas: usuario necesita X horas, proveedor debe poder ofrecer AL MENOS esas horas
    // Si usuario quiere 8h y proveedor ofrece hasta 12h → PERFECTO
    userQuestionId: 'photo_u_hours',
    providerQuestionId: 'photo_p_hours_min',
    providerQuestionIdMax: 'photo_p_hours_max',
    weight: 15,
    matchType: 'threshold_can_accommodate',
    userRangeMapping: {
      '4': { min: 4, max: 4 },
      '6': { min: 6, max: 6 },
      '8': { min: 8, max: 8 },
      '10': { min: 10, max: 10 },
      'full_day': { min: 12, max: 24 },
    },
  },
  {
    // Presupuesto: superposición de rangos
    userQuestionId: 'photo_u_budget',
    providerQuestionId: 'photo_p_price_min',
    providerQuestionIdMax: 'photo_p_price_max',
    weight: 20,
    matchType: 'range_overlap',
    userRangeMapping: {
      'under_500k': { min: 0, max: 500000 },
      '500k_800k': { min: 500000, max: 800000 },
      '800k_1200k': { min: 800000, max: 1200000 },
      '1200k_1800k': { min: 1200000, max: 1800000 },
      'over_1800k': { min: 1800000, max: 10000000 },
    },
  },
  {
    // Pre-boda: boolean match
    userQuestionId: 'photo_u_preboda',
    providerQuestionId: 'photo_p_preboda',
    weight: 5,
    matchType: 'boolean_match',
  },
  {
    // Post-boda: boolean match
    userQuestionId: 'photo_u_postboda',
    providerQuestionId: 'photo_p_postboda',
    weight: 5,
    matchType: 'boolean_match',
  },
  {
    // Segundo fotógrafo: preference match
    userQuestionId: 'photo_u_second_shooter',
    providerQuestionId: 'photo_p_second_shooter',
    weight: 5,
    matchType: 'preference_match',
    preferenceMapping: {
      'no': 1.0,
      'extra_cost': 0.8,
      'included': 1.0,
      'always': 1.0,
    },
  },
  {
    // Tiempo de entrega: proveedor debe entregar ANTES O IGUAL de cuando el usuario lo necesita
    // Si usuario quiere en 2 meses y proveedor entrega en 2 semanas → PERFECTO
    userQuestionId: 'photo_u_delivery_time',
    providerQuestionId: 'photo_p_delivery_time',
    weight: 5,
    matchType: 'threshold_at_most',
    orderedMapping: DELIVERY_TIME_ORDER,
  },
  {
    // Formato de entrega: múltiple vs múltiple
    userQuestionId: 'photo_u_delivery_format',
    providerQuestionId: 'photo_p_delivery_formats',
    weight: 5,
    matchType: 'contains',
  },
  {
    // Cantidad de fotos: proveedor debe poder entregar AL MENOS lo que el usuario quiere
    // Si usuario quiere 400 y proveedor entrega hasta 800 → PERFECTO
    userQuestionId: 'photo_u_photo_count',
    providerQuestionId: 'photo_p_photo_count_min',
    providerQuestionIdMax: 'photo_p_photo_count_max',
    weight: 5,
    matchType: 'threshold_at_least',
    userRangeMapping: {
      'under_200': { min: 100, max: 200 },
      '200_400': { min: 200, max: 400 },
      '400_600': { min: 400, max: 600 },
      'over_600': { min: 600, max: 2000 },
      'unlimited': { min: 500, max: 10000 }, // "Sin límite" = quiere muchas fotos
    },
  },
  {
    // Nivel de retoque
    userQuestionId: 'photo_u_retouching',
    providerQuestionId: 'photo_p_retouching_levels',
    weight: 5,
    matchType: 'single_in_multiple',
  },
];

// ============================================
// CRITERIOS EXPLÍCITOS PARA VIDEO
// ============================================
const VIDEO_MATCHING_CRITERIA: ExplicitMatchCriterion[] = [
  {
    userQuestionId: 'video_u_style',
    providerQuestionId: 'video_p_styles',
    weight: 25,
    matchType: 'single_in_multiple',
  },
  {
    userQuestionId: 'video_u_duration',
    providerQuestionId: 'video_p_durations',
    weight: 15,
    matchType: 'single_in_multiple',
  },
  {
    userQuestionId: 'video_u_budget',
    providerQuestionId: 'video_p_price_min',
    providerQuestionIdMax: 'video_p_price_max',
    weight: 20,
    matchType: 'range_overlap',
    userRangeMapping: {
      'under_600k': { min: 0, max: 600000 },
      '600k_1000k': { min: 600000, max: 1000000 },
      '1000k_1500k': { min: 1000000, max: 1500000 },
      '1500k_2500k': { min: 1500000, max: 2500000 },
      'over_2500k': { min: 2500000, max: 10000000 },
    },
  },
  {
    // Horas de cobertura: proveedor debe poder ofrecer AL MENOS las horas que el usuario necesita
    userQuestionId: 'video_u_hours',
    providerQuestionId: 'video_p_hours_min',
    providerQuestionIdMax: 'video_p_hours_max',
    weight: 10,
    matchType: 'threshold_can_accommodate',
    userRangeMapping: {
      '4': { min: 4, max: 4 },
      '6': { min: 6, max: 6 },
      '8': { min: 8, max: 8 },
      '10': { min: 10, max: 10 },
      'full_day': { min: 12, max: 24 },
    },
  },
  {
    userQuestionId: 'video_u_second_camera',
    providerQuestionId: 'video_p_second_camera',
    weight: 5,
    matchType: 'preference_match',
    preferenceMapping: {
      'no': 0.5,
      'extra_cost': 0.8,
      'included': 1.0,
      'always': 1.0,
    },
  },
  {
    userQuestionId: 'video_u_drone',
    providerQuestionId: 'video_p_drone',
    weight: 5,
    matchType: 'preference_match',
    preferenceMapping: {
      'no': 0.3,
      'extra_cost': 0.8,
      'included': 1.0,
    },
  },
  {
    userQuestionId: 'video_u_same_day_edit',
    providerQuestionId: 'video_p_same_day_edit',
    weight: 5,
    matchType: 'boolean_match',
  },
  {
    userQuestionId: 'video_u_raw_footage',
    providerQuestionId: 'video_p_raw_footage',
    weight: 3,
    matchType: 'preference_match',
    preferenceMapping: {
      'no': 0.5,
      'extra_cost': 0.8,
      'included': 1.0,
    },
  },
  {
    userQuestionId: 'video_u_social_reel',
    providerQuestionId: 'video_p_social_reel',
    weight: 5,
    matchType: 'preference_match',
    preferenceMapping: {
      'no': 0.3,
      'extra_cost': 0.8,
      'included': 1.0,
    },
  },
  {
    // Tiempo de entrega: proveedor debe entregar ANTES O IGUAL
    userQuestionId: 'video_u_delivery_time',
    providerQuestionId: 'video_p_delivery_time',
    weight: 5,
    matchType: 'threshold_at_most',
    orderedMapping: DELIVERY_TIME_ORDER,
  },
];

// ============================================
// CRITERIOS EXPLÍCITOS PARA DJ
// ============================================
const DJ_MATCHING_CRITERIA: ExplicitMatchCriterion[] = [
  {
    // Géneros musicales: múltiple vs múltiple
    userQuestionId: 'dj_u_genres',
    providerQuestionId: 'dj_p_genres',
    weight: 25,
    matchType: 'contains',
  },
  {
    // Estilo de fiesta
    userQuestionId: 'dj_u_style',
    providerQuestionId: 'dj_p_styles',
    weight: 15,
    matchType: 'single_in_multiple',
  },
  {
    // Presupuesto
    userQuestionId: 'dj_u_budget',
    providerQuestionId: 'dj_p_price_min',
    providerQuestionIdMax: 'dj_p_price_max',
    weight: 20,
    matchType: 'range_overlap',
    userRangeMapping: {
      'under_400k': { min: 0, max: 400000 },
      '400k_600k': { min: 400000, max: 600000 },
      '600k_900k': { min: 600000, max: 900000 },
      '900k_1400k': { min: 900000, max: 1400000 },
      'over_1400k': { min: 1400000, max: 5000000 },
    },
  },
  {
    // Horas de servicio: proveedor debe poder ofrecer AL MENOS las horas que el usuario necesita
    userQuestionId: 'dj_u_hours',
    providerQuestionId: 'dj_p_hours_min',
    providerQuestionIdMax: 'dj_p_hours_max',
    weight: 10,
    matchType: 'threshold_can_accommodate',
    userRangeMapping: {
      '3': { min: 3, max: 3 },
      '4': { min: 4, max: 4 },
      '5': { min: 5, max: 5 },
      '6': { min: 6, max: 6 },
      'unlimited': { min: 6, max: 12 },
    },
  },
  {
    // Música para ceremonia
    userQuestionId: 'dj_u_ceremony_music',
    providerQuestionId: 'dj_p_ceremony_music',
    weight: 5,
    matchType: 'boolean_match',
  },
  {
    // Música para cóctel
    userQuestionId: 'dj_u_cocktail_music',
    providerQuestionId: 'dj_p_cocktail_music',
    weight: 3,
    matchType: 'boolean_match',
  },
  {
    // Nivel de animación
    userQuestionId: 'dj_u_mc',
    providerQuestionId: 'dj_p_mc_levels',
    weight: 10,
    matchType: 'single_in_multiple',
  },
  {
    // Nivel de iluminación
    userQuestionId: 'dj_u_lighting',
    providerQuestionId: 'dj_p_lighting_levels',
    weight: 5,
    matchType: 'single_in_multiple',
  },
  {
    // Efectos especiales
    userQuestionId: 'dj_u_effects',
    providerQuestionId: 'dj_p_effects',
    weight: 3,
    matchType: 'contains',
  },
  {
    // Karaoke
    userQuestionId: 'dj_u_karaoke',
    providerQuestionId: 'dj_p_karaoke',
    weight: 2,
    matchType: 'boolean_match',
  },
];

// ============================================
// CRITERIOS EXPLÍCITOS PARA BANQUETERÍA
// ============================================
const CATERING_MATCHING_CRITERIA: ExplicitMatchCriterion[] = [
  {
    // Tipo de servicio
    userQuestionId: 'catering_u_service_type',
    providerQuestionId: 'catering_p_service_types',
    weight: 20,
    matchType: 'single_in_multiple',
  },
  {
    // Tipo de cocina
    userQuestionId: 'catering_u_cuisine',
    providerQuestionId: 'catering_p_cuisines',
    weight: 15,
    matchType: 'contains',
  },
  {
    // Presupuesto por persona
    userQuestionId: 'catering_u_budget_pp',
    providerQuestionId: 'catering_p_price_pp_min',
    providerQuestionIdMax: 'catering_p_price_pp_max',
    weight: 20,
    matchType: 'range_overlap',
    userRangeMapping: {
      'under_25k': { min: 0, max: 25000 },
      '25k_35k': { min: 25000, max: 35000 },
      '35k_50k': { min: 35000, max: 50000 },
      '50k_70k': { min: 50000, max: 70000 },
      'over_70k': { min: 70000, max: 200000 },
    },
  },
  {
    // Cantidad de invitados: proveedor debe poder ACOMODAR la cantidad que el usuario tiene
    // Si usuario tiene 150 invitados y proveedor atiende 50-500 → PERFECTO
    userQuestionId: 'catering_u_guest_count',
    providerQuestionId: 'catering_p_guests_min',
    providerQuestionIdMax: 'catering_p_guests_max',
    weight: 10,
    matchType: 'threshold_can_accommodate',
    userRangeMapping: {
      'under_50': { min: 30, max: 50 },
      '50_100': { min: 50, max: 100 },
      '100_150': { min: 100, max: 150 },
      '150_200': { min: 150, max: 200 },
      '200_300': { min: 200, max: 300 },
      'over_300': { min: 300, max: 1000 },
    },
  },
  {
    // Tiempos de comida
    userQuestionId: 'catering_u_courses',
    providerQuestionId: 'catering_p_courses',
    weight: 5,
    matchType: 'single_in_multiple',
  },
  {
    // Cóctel
    userQuestionId: 'catering_u_cocktail',
    providerQuestionId: 'catering_p_cocktail',
    weight: 5,
    matchType: 'boolean_match',
  },
  {
    // Opciones dietéticas
    userQuestionId: 'catering_u_dietary',
    providerQuestionId: 'catering_p_dietary',
    weight: 5,
    matchType: 'contains',
  },
  {
    // Bebestibles
    userQuestionId: 'catering_u_beverages',
    providerQuestionId: 'catering_p_beverages',
    weight: 5,
    matchType: 'contains',
  },
  {
    // Degustación
    userQuestionId: 'catering_u_tasting',
    providerQuestionId: 'catering_p_tasting',
    weight: 3,
    matchType: 'preference_match',
    preferenceMapping: {
      'yes_free': 1.0,
      'yes_paid': 0.7,
      'no': 0.3,
    },
  },
  {
    // Torta
    userQuestionId: 'catering_u_cake',
    providerQuestionId: 'catering_p_cake',
    weight: 5,
    matchType: 'exact',
  },
  {
    // Nivel de servicio
    userQuestionId: 'catering_u_staff',
    providerQuestionId: 'catering_p_staff_levels',
    weight: 5,
    matchType: 'single_in_multiple',
  },
  {
    // Montaje de mesas
    userQuestionId: 'catering_u_setup',
    providerQuestionId: 'catering_p_setup',
    weight: 2,
    matchType: 'boolean_match',
  },
];

// ============================================
// CRITERIOS EXPLÍCITOS PARA VENUE
// Pesos ajustados para sumar ~100%
// Zona/Ubicación: 60%, Tipo/Setting: 15%, Presupuesto: 12%, Features: 13%
// ============================================
const VENUE_MATCHING_CRITERIA: ExplicitMatchCriterion[] = [
  // ========== CRITERIOS DE ZONA Y UBICACIÓN (PRIORITARIOS - 60%) ==========
  {
    // Zona: Usuario elige múltiples zonas deseadas, proveedor tiene una zona
    // Si la zona del proveedor está en las opciones del usuario → MATCH
    // NOTA: "no_preference" del usuario se filtra automáticamente en contains match
    userQuestionId: 'venue_u_zone',
    providerQuestionId: 'venue_p_zone',
    weight: 25, // Peso muy alto - criterio principal de matchmaking
    matchType: 'contains', // Usuario puede elegir múltiples zonas
  },
  {
    // Tipo de entorno: Match exacto entre entorno deseado y ofrecido
    userQuestionId: 'venue_u_environment',
    providerQuestionId: 'venue_p_environment',
    weight: 20, // Peso alto
    matchType: 'exact',
  },
  {
    // Distancia: Validar que el proveedor esté dentro de la distancia máxima aceptada
    // El proveedor indica su distancia, el usuario indica cuánto está dispuesto a viajar
    userQuestionId: 'venue_u_travel_willingness',
    providerQuestionId: 'venue_p_distance_from_santiago',
    weight: 15, // Peso importante para validación
    matchType: 'threshold_at_most', // Proveedor debe estar DENTRO de la distancia máxima
    orderedMapping: {
      // Mapeo ordenado: valores más bajos = más cerca
      'within_santiago': 0,
      'santiago_only': 0, // Usuario solo quiere Santiago
      'up_to_1hr': 1,
      'up_to_2hr': 2,
      'over_2hr': 3,
      'no_limit': 4, // Usuario acepta cualquier distancia
    },
  },
  // ========== FIN CRITERIOS DE ZONA ==========
  
  // ========== TIPO Y CONFIGURACIÓN (15%) ==========
  {
    // Tipo de lugar
    userQuestionId: 'venue_u_type',
    providerQuestionId: 'venue_p_type',
    weight: 8, // Ajustado para balancear con zona
    matchType: 'contains', // Ambos son multiple ahora
  },
  {
    // Interior/Exterior
    userQuestionId: 'venue_u_setting',
    providerQuestionId: 'venue_p_settings',
    weight: 7,
    matchType: 'single_in_multiple',
  },
  
  // ========== PRESUPUESTO (12%) ==========
  {
    // Presupuesto
    userQuestionId: 'venue_u_budget',
    providerQuestionId: 'venue_p_price_min',
    providerQuestionIdMax: 'venue_p_price_max',
    weight: 12,
    matchType: 'range_overlap',
    userRangeMapping: {
      'under_1m': { min: 0, max: 1000000 },
      '1m_2m': { min: 1000000, max: 2000000 },
      '2m_4m': { min: 2000000, max: 4000000 },
      '4m_7m': { min: 4000000, max: 7000000 },
      'over_7m': { min: 7000000, max: 20000000 },
    },
  },
  // NOTA: venue_u_capacity fue eliminado porque se pregunta en el wizard de registro
  
  // ========== CARACTERÍSTICAS Y SERVICIOS (13%) ==========
  {
    // Exclusividad
    userQuestionId: 'venue_u_exclusivity',
    providerQuestionId: 'venue_p_exclusivity',
    weight: 2,
    matchType: 'preference_match',
    preferenceMapping: {
      'true': 1.0,
      'false': 0.0,
    },
  },
  {
    // Espacio para ceremonia
    userQuestionId: 'venue_u_ceremony_space',
    providerQuestionId: 'venue_p_ceremony_space',
    weight: 2,
    matchType: 'boolean_match',
  },
  {
    // Estacionamiento
    userQuestionId: 'venue_u_parking',
    providerQuestionId: 'venue_p_parking',
    weight: 2,
    matchType: 'preference_match',
    preferenceMapping: {
      'yes_free': 1.0,
      'yes_paid': 0.8,
      'valet': 0.9,
      'no': 0.0,
    },
  },
  {
    // Alojamiento
    userQuestionId: 'venue_u_accommodation',
    providerQuestionId: 'venue_p_accommodation',
    weight: 2,
    matchType: 'preference_match',
    preferenceMapping: {
      'yes': 1.0,
      'nearby': 0.7,
      'no': 0.0,
    },
  },
  {
    // Política de catering
    userQuestionId: 'venue_u_catering_policy',
    providerQuestionId: 'venue_p_catering_policy',
    weight: 2,
    matchType: 'exact',
  },
  {
    // Horario de término: venue debe permitir HASTA O MÁS TARDE de lo que el usuario necesita
    userQuestionId: 'venue_u_end_time',
    providerQuestionId: 'venue_p_end_time',
    weight: 2,
    matchType: 'threshold_at_least',
    orderedMapping: END_TIME_ORDER,
  },
  {
    // Accesibilidad
    userQuestionId: 'venue_u_accessibility',
    providerQuestionId: 'venue_p_accessibility',
    weight: 1,
    matchType: 'boolean_match',
  },
];
// TOTAL PESOS: 25+20+15+8+7+12+2+2+2+2+2+2+1 = 100%

// ============================================
// CRITERIOS EXPLÍCITOS PARA DECORACIÓN
// ============================================
const DECORATION_MATCHING_CRITERIA: ExplicitMatchCriterion[] = [
  {
    userQuestionId: 'deco_u_style',
    providerQuestionId: 'deco_p_styles',
    weight: 25,
    matchType: 'single_in_multiple',
  },
  {
    userQuestionId: 'deco_u_colors',
    providerQuestionId: 'deco_p_color_expertise',
    weight: 15,
    matchType: 'contains',
  },
  {
    userQuestionId: 'deco_u_budget',
    providerQuestionId: 'deco_p_price_min',
    providerQuestionIdMax: 'deco_p_price_max',
    weight: 20,
    matchType: 'range_overlap',
    userRangeMapping: {
      'under_500k': { min: 0, max: 500000 },
      '500k_1m': { min: 500000, max: 1000000 },
      '1m_2m': { min: 1000000, max: 2000000 },
      '2m_4m': { min: 2000000, max: 4000000 },
      'over_4m': { min: 4000000, max: 20000000 },
    },
  },
  {
    userQuestionId: 'deco_u_flowers',
    providerQuestionId: 'deco_p_flower_types',
    weight: 10,
    matchType: 'contains',
  },
  {
    userQuestionId: 'deco_u_bridal_bouquet',
    providerQuestionId: 'deco_p_bridal_bouquet',
    weight: 5,
    matchType: 'boolean_match',
  },
  {
    userQuestionId: 'deco_u_ceremony_deco',
    providerQuestionId: 'deco_p_ceremony_deco',
    weight: 5,
    matchType: 'boolean_match',
  },
  {
    userQuestionId: 'deco_u_table_centerpieces',
    providerQuestionId: 'deco_p_centerpiece_types',
    weight: 5,
    matchType: 'single_in_multiple',
  },
  {
    // Cantidad de mesas: proveedor debe poder decorar AL MENOS las mesas que el usuario tiene
    userQuestionId: 'deco_u_table_count',
    providerQuestionId: 'deco_p_table_capacity',
    weight: 5,
    matchType: 'threshold_at_least',
    userRangeMapping: {
      'under_10': { min: 5, max: 10 },
      '10_20': { min: 10, max: 20 },
      '20_30': { min: 20, max: 30 },
      'over_30': { min: 30, max: 100 },
    },
  },
  {
    userQuestionId: 'deco_u_extras',
    providerQuestionId: 'deco_p_extras',
    weight: 5,
    matchType: 'contains',
  },
  {
    userQuestionId: 'deco_u_rental',
    providerQuestionId: 'deco_p_rental',
    weight: 5,
    matchType: 'boolean_match',
  },
];

// ============================================
// CRITERIOS EXPLÍCITOS PARA WEDDING PLANNER
// ============================================
const WEDDING_PLANNER_MATCHING_CRITERIA: ExplicitMatchCriterion[] = [
  {
    userQuestionId: 'wp_u_service_level',
    providerQuestionId: 'wp_p_service_levels',
    weight: 25,
    matchType: 'single_in_multiple',
  },
  {
    userQuestionId: 'wp_u_budget',
    providerQuestionId: 'wp_p_price_min',
    providerQuestionIdMax: 'wp_p_price_max',
    weight: 20,
    matchType: 'range_overlap',
    userRangeMapping: {
      'under_500k': { min: 0, max: 500000 },
      '500k_1m': { min: 500000, max: 1000000 },
      '1m_2m': { min: 1000000, max: 2000000 },
      '2m_4m': { min: 2000000, max: 4000000 },
      'over_4m': { min: 4000000, max: 20000000 },
    },
  },
  {
    userQuestionId: 'wp_u_vendor_help',
    providerQuestionId: 'wp_p_vendor_network',
    weight: 15,
    matchType: 'preference_match',
    preferenceMapping: {
      'extensive': 1.0,
      'moderate': 0.7,
      'limited': 0.4,
    },
  },
  {
    userQuestionId: 'wp_u_design_help',
    providerQuestionId: 'wp_p_design_services',
    weight: 10,
    matchType: 'contains',
  },
  {
    userQuestionId: 'wp_u_budget_management',
    providerQuestionId: 'wp_p_budget_management',
    weight: 5,
    matchType: 'boolean_match',
  },
  {
    userQuestionId: 'wp_u_timeline_management',
    providerQuestionId: 'wp_p_timeline_management',
    weight: 5,
    matchType: 'boolean_match',
  },
  {
    userQuestionId: 'wp_u_guest_management',
    providerQuestionId: 'wp_p_guest_management',
    weight: 5,
    matchType: 'boolean_match',
  },
  {
    userQuestionId: 'wp_u_rehearsal',
    providerQuestionId: 'wp_p_rehearsal',
    weight: 3,
    matchType: 'boolean_match',
  },
];

// ============================================
// CRITERIOS EXPLÍCITOS PARA MAQUILLAJE
// ============================================
const MAKEUP_MATCHING_CRITERIA: ExplicitMatchCriterion[] = [
  {
    userQuestionId: 'makeup_u_style',
    providerQuestionId: 'makeup_p_styles',
    weight: 25,
    matchType: 'single_in_multiple',
  },
  {
    userQuestionId: 'makeup_u_budget',
    providerQuestionId: 'makeup_p_price_bride',
    weight: 20,
    matchType: 'range_overlap',
    userRangeMapping: {
      'under_100k': { min: 0, max: 100000 },
      '100k_200k': { min: 100000, max: 200000 },
      '200k_350k': { min: 200000, max: 350000 },
      'over_350k': { min: 350000, max: 1000000 },
    },
  },
  {
    userQuestionId: 'makeup_u_trial',
    providerQuestionId: 'makeup_p_trial',
    weight: 10,
    matchType: 'preference_match',
    preferenceMapping: {
      'yes_free': 1.0,
      'yes_paid': 0.7,
      'no': 0.2,
    },
  },
  {
    userQuestionId: 'makeup_u_hair',
    providerQuestionId: 'makeup_p_hair',
    weight: 15,
    matchType: 'boolean_match',
  },
  {
    userQuestionId: 'makeup_u_hair_style',
    providerQuestionId: 'makeup_p_hair_styles',
    weight: 10,
    matchType: 'single_in_multiple',
  },
  {
    userQuestionId: 'makeup_u_extensions',
    providerQuestionId: 'makeup_p_extensions',
    weight: 3,
    matchType: 'boolean_match',
  },
  {
    userQuestionId: 'makeup_u_lashes',
    providerQuestionId: 'makeup_p_lashes',
    weight: 5,
    matchType: 'preference_match',
    preferenceMapping: {
      'no': 0.5,
      'natural': 0.8,
      'dramatic': 0.8,
      'both': 1.0,
    },
  },
  {
    userQuestionId: 'makeup_u_touch_ups',
    providerQuestionId: 'makeup_p_touch_ups',
    weight: 4,
    matchType: 'exact',
  },
  {
    // Cantidad de personas: proveedor debe poder atender AL MENOS las personas que el usuario necesita
    userQuestionId: 'makeup_u_bridesmaids',
    providerQuestionId: 'makeup_p_max_clients',
    weight: 5,
    matchType: 'threshold_at_least',
    userRangeMapping: {
      'no': { min: 1, max: 1 },
      'some': { min: 2, max: 5 },
      'full': { min: 5, max: 15 },
    },
  },
];

// ============================================
// CRITERIOS EXPLÍCITOS PARA ENTRETENIMIENTO
// ============================================
const ENTERTAINMENT_MATCHING_CRITERIA: ExplicitMatchCriterion[] = [
  {
    // Tipo de entretenimiento: múltiple vs múltiple (usuario puede querer varios tipos)
    userQuestionId: 'ent_u_type',
    providerQuestionId: 'ent_p_types',
    weight: 30,
    matchType: 'contains',
  },
  {
    // Momento del evento: múltiple vs múltiple
    userQuestionId: 'ent_u_moment',
    providerQuestionId: 'ent_p_moments',
    weight: 15,
    matchType: 'contains',
  },
  {
    // Duración: usuario necesita X minutos, proveedor debe poder acomodar
    userQuestionId: 'ent_u_duration',
    providerQuestionId: 'ent_p_duration_min',
    providerQuestionIdMax: 'ent_p_duration_max',
    weight: 10,
    matchType: 'threshold_can_accommodate',
    userRangeMapping: {
      '30min': { min: 30, max: 30 },
      '1hr': { min: 60, max: 60 },
      '2hr': { min: 120, max: 120 },
      '3hr': { min: 180, max: 180 },
      'full_event': { min: 240, max: 480 },
      'flexible': { min: 30, max: 480 },
    },
  },
  {
    // Presupuesto
    userQuestionId: 'ent_u_budget',
    providerQuestionId: 'ent_p_price_min',
    providerQuestionIdMax: 'ent_p_price_max',
    weight: 20,
    matchType: 'range_overlap',
    userRangeMapping: {
      'under_300k': { min: 0, max: 300000 },
      '300k_500k': { min: 300000, max: 500000 },
      '500k_800k': { min: 500000, max: 800000 },
      '800k_1500k': { min: 800000, max: 1500000 },
      'over_1500k': { min: 1500000, max: 10000000 },
      'skip': { min: 0, max: 10000000 },
    },
  },
  {
    // Estilo de entretenimiento
    userQuestionId: 'ent_u_style',
    providerQuestionId: 'ent_p_styles',
    weight: 10,
    matchType: 'single_in_multiple',
  },
  {
    // Audiencia (adultos, familiar, mixto)
    userQuestionId: 'ent_u_audience',
    providerQuestionId: 'ent_p_audience',
    weight: 10,
    matchType: 'single_in_multiple',
  },
  {
    // Equipo de sonido necesario: si usuario necesita equipo, proveedor debe tenerlo
    userQuestionId: 'ent_u_equipment',
    providerQuestionId: 'ent_p_equipment',
    weight: 5,
    matchType: 'preference_match',
    preferenceMapping: {
      'sound': 1.0, // Si proveedor tiene sonido
      'lighting': 0.8,
      'props': 0.7,
      'stage': 0.9,
      'none': 0.3, // Si proveedor no trae equipo
    },
  },
];

// ============================================
// CRITERIOS EXPLÍCITOS PARA TORTAS & DULCES
// ============================================
const CAKES_MATCHING_CRITERIA: ExplicitMatchCriterion[] = [
  {
    // Tipo de torta/dulces: múltiple vs múltiple
    userQuestionId: 'cakes_u_type',
    providerQuestionId: 'cakes_p_types',
    weight: 25,
    matchType: 'contains',
  },
  {
    // Porciones: proveedor debe poder acomodar la cantidad de porciones
    userQuestionId: 'cakes_u_servings',
    providerQuestionId: 'cakes_p_servings_min',
    providerQuestionIdMax: 'cakes_p_servings_max',
    weight: 15,
    matchType: 'threshold_can_accommodate',
    userRangeMapping: {
      'under_50': { min: 30, max: 50 },
      '50_100': { min: 50, max: 100 },
      '100_150': { min: 100, max: 150 },
      '150_200': { min: 150, max: 200 },
      'over_200': { min: 200, max: 500 },
      'skip': { min: 30, max: 500 },
    },
  },
  {
    // Pisos: proveedor debe poder hacer AL MENOS los pisos que usuario quiere
    userQuestionId: 'cakes_u_tiers',
    providerQuestionId: 'cakes_p_tiers_max',
    weight: 10,
    matchType: 'threshold_at_least',
    userRangeMapping: {
      '1': { min: 1, max: 1 },
      '2': { min: 2, max: 2 },
      '3': { min: 3, max: 3 },
      '4_plus': { min: 4, max: 5 },
      'no_preference': { min: 1, max: 1 },
    },
    orderedMapping: {
      '1': 1,
      '2': 2,
      '3': 3,
      '4': 4,
      '5_plus': 5,
    },
  },
  {
    // Sabores: múltiple vs múltiple
    userQuestionId: 'cakes_u_flavor',
    providerQuestionId: 'cakes_p_flavors',
    weight: 15,
    matchType: 'contains',
  },
  {
    // Estilo de decoración
    userQuestionId: 'cakes_u_style',
    providerQuestionId: 'cakes_p_styles',
    weight: 15,
    matchType: 'single_in_multiple',
  },
  {
    // Presupuesto
    userQuestionId: 'cakes_u_budget',
    providerQuestionId: 'cakes_p_price_min',
    providerQuestionIdMax: 'cakes_p_price_max',
    weight: 15,
    matchType: 'range_overlap',
    userRangeMapping: {
      'under_100k': { min: 0, max: 100000 },
      '100k_200k': { min: 100000, max: 200000 },
      '200k_400k': { min: 200000, max: 400000 },
      '400k_600k': { min: 400000, max: 600000 },
      'over_600k': { min: 600000, max: 2000000 },
      'skip': { min: 0, max: 2000000 },
    },
  },
  {
    // Opciones dietéticas: múltiple vs múltiple
    userQuestionId: 'cakes_u_dietary',
    providerQuestionId: 'cakes_p_dietary',
    weight: 5,
    matchType: 'contains',
  },
  {
    // Degustación previa
    userQuestionId: 'cakes_u_tasting',
    providerQuestionId: 'cakes_p_tasting',
    weight: 5,
    matchType: 'preference_match',
    preferenceMapping: {
      'yes_free': 1.0,
      'yes_paid': 0.7,
      'no': 0.2,
    },
  },
  {
    // Entrega y montaje
    userQuestionId: 'cakes_u_delivery',
    providerQuestionId: 'cakes_p_delivery',
    weight: 5,
    matchType: 'preference_match',
    preferenceMapping: {
      'yes_included': 1.0,
      'yes_extra': 0.8,
      'delivery_only': 0.6,
      'no': 0.3,
    },
  },
];

// ============================================
// CRITERIOS EXPLÍCITOS PARA TRANSPORTE
// ============================================
const TRANSPORT_MATCHING_CRITERIA: ExplicitMatchCriterion[] = [
  {
    // Tipo de vehículo: usuario elige uno, proveedor ofrece varios
    userQuestionId: 'transport_u_vehicle_type',
    providerQuestionId: 'transport_p_vehicle_types',
    weight: 25,
    matchType: 'single_in_multiple',
  },
  {
    // Horas de servicio: proveedor debe poder acomodar las horas que usuario necesita
    userQuestionId: 'transport_u_hours',
    providerQuestionId: 'transport_p_hours_min',
    providerQuestionIdMax: 'transport_p_hours_max',
    weight: 20,
    matchType: 'threshold_can_accommodate',
    userRangeMapping: {
      '2': { min: 2, max: 2 },
      '4': { min: 4, max: 4 },
      '6': { min: 6, max: 6 },
      '8': { min: 8, max: 8 },
      'full_day': { min: 10, max: 24 },
    },
  },
  {
    // Presupuesto
    userQuestionId: 'transport_u_budget',
    providerQuestionId: 'transport_p_price_min',
    providerQuestionIdMax: 'transport_p_price_max',
    weight: 25,
    matchType: 'range_overlap',
    userRangeMapping: {
      'under_200k': { min: 0, max: 200000 },
      '200k_400k': { min: 200000, max: 400000 },
      '400k_700k': { min: 400000, max: 700000 },
      '700k_1200k': { min: 700000, max: 1200000 },
      'over_1200k': { min: 1200000, max: 5000000 },
      'skip': { min: 0, max: 5000000 },
    },
  },
  {
    // Decoración del vehículo
    userQuestionId: 'transport_u_decoration',
    providerQuestionId: 'transport_p_decoration',
    weight: 15,
    matchType: 'preference_match',
    preferenceMapping: {
      'yes_included': 1.0,
      'yes_extra': 0.8,
      'no': 0.3,
    },
  },
  {
    // Chofer profesional
    userQuestionId: 'transport_u_driver',
    providerQuestionId: 'transport_p_driver',
    weight: 15,
    matchType: 'preference_match',
    preferenceMapping: {
      'yes_formal': 1.0,
      'yes_casual': 0.9,
      'optional': 0.7,
      'no': 0.3,
    },
  },
];

// ============================================
// CRITERIOS EXPLÍCITOS PARA INVITACIONES
// ============================================
const INVITATIONS_MATCHING_CRITERIA: ExplicitMatchCriterion[] = [
  {
    // Tipo de invitaciones: múltiple vs múltiple (físicas, digitales, video)
    userQuestionId: 'inv_u_type',
    providerQuestionId: 'inv_p_types',
    weight: 25,
    matchType: 'contains',
  },
  {
    // Estilo de diseño
    userQuestionId: 'inv_u_style',
    providerQuestionId: 'inv_p_styles',
    weight: 20,
    matchType: 'single_in_multiple',
  },
  {
    // Elementos adicionales (save the date, RSVP, menú, etc.)
    userQuestionId: 'inv_u_extras',
    providerQuestionId: 'inv_p_extras',
    weight: 15,
    matchType: 'contains',
  },
  {
    // Presupuesto: necesitamos calcular total basado en cantidad y precio por unidad
    // El usuario da un rango total, el proveedor da precio por unidad
    // Usamos range_overlap con estimación basada en 100 invitaciones promedio
    userQuestionId: 'inv_u_budget',
    providerQuestionId: 'inv_p_price_min',
    providerQuestionIdMax: 'inv_p_price_max',
    weight: 15,
    matchType: 'range_overlap',
    // Convertimos presupuesto total a precio por unidad (asumiendo ~100 invitaciones)
    userRangeMapping: {
      'under_100k': { min: 0, max: 1000 }, // < $100k / 100 = < $1000/unidad
      '100k_200k': { min: 1000, max: 2000 },
      '200k_400k': { min: 2000, max: 4000 },
      '400k_600k': { min: 4000, max: 6000 },
      'over_600k': { min: 6000, max: 50000 },
      'skip': { min: 0, max: 50000 },
    },
  },
  {
    // Tipo de papel (para impresas)
    userQuestionId: 'inv_u_paper',
    providerQuestionId: 'inv_p_papers',
    weight: 5,
    matchType: 'single_in_multiple',
  },
  {
    // Técnica de impresión
    userQuestionId: 'inv_u_printing',
    providerQuestionId: 'inv_p_printing',
    weight: 5,
    matchType: 'single_in_multiple',
  },
  {
    // Timeline: proveedor debe entregar ANTES o igual de cuando el usuario lo necesita
    userQuestionId: 'inv_u_timeline',
    providerQuestionId: 'inv_p_lead_time',
    weight: 10,
    matchType: 'threshold_at_most',
    orderedMapping: {
      '1_week': 7,
      '2_weeks': 14,
      '3_weeks': 21,
      '1_month': 30,
      '2_months': 60,
      '3_months': 90,
      'over_1_month': 45,
      'flexible': 365,
    },
  },
  {
    // Muestras previas
    userQuestionId: 'inv_u_quantity', // Usamos cantidad para verificar mínimos del proveedor
    providerQuestionId: 'inv_p_min_quantity',
    weight: 5,
    matchType: 'threshold_at_least',
    userRangeMapping: {
      'under_50': { min: 30, max: 50 },
      '50_100': { min: 50, max: 100 },
      '100_150': { min: 100, max: 150 },
      '150_200': { min: 150, max: 200 },
      'over_200': { min: 200, max: 500 },
      'skip': { min: 50, max: 500 },
    },
  },
];

// ============================================
// CRITERIOS EXPLÍCITOS PARA VESTIDOS & TRAJES
// ============================================
const DRESS_MATCHING_CRITERIA: ExplicitMatchCriterion[] = [
  {
    // Qué necesita (vestido novia, traje novio, damas, etc.): múltiple vs múltiple
    userQuestionId: 'dress_u_need',
    providerQuestionId: 'dress_p_services',
    weight: 25,
    matchType: 'contains',
  },
  {
    // Estilo vestido de novia: múltiple vs múltiple
    userQuestionId: 'dress_u_bride_style',
    providerQuestionId: 'dress_p_bride_styles',
    weight: 15,
    matchType: 'contains',
  },
  {
    // Silueta vestido de novia: múltiple vs múltiple
    userQuestionId: 'dress_u_bride_silhouette',
    providerQuestionId: 'dress_p_silhouettes',
    weight: 10,
    matchType: 'contains',
  },
  {
    // Estilo traje de novio
    userQuestionId: 'dress_u_groom_style',
    providerQuestionId: 'dress_p_groom_styles',
    weight: 10,
    matchType: 'single_in_multiple',
  },
  {
    // Tipo de servicio (comprar, arriendo, a medida, etc.)
    userQuestionId: 'dress_u_service_type',
    providerQuestionId: 'dress_p_service_types',
    weight: 15,
    matchType: 'single_in_multiple',
  },
  {
    // Presupuesto vestido de novia
    userQuestionId: 'dress_u_budget_bride',
    providerQuestionId: 'dress_p_price_bride_min',
    providerQuestionIdMax: 'dress_p_price_bride_max',
    weight: 15,
    matchType: 'range_overlap',
    userRangeMapping: {
      'under_500k': { min: 0, max: 500000 },
      '500k_1m': { min: 500000, max: 1000000 },
      '1m_2m': { min: 1000000, max: 2000000 },
      '2m_3m': { min: 2000000, max: 3000000 },
      '3m_5m': { min: 3000000, max: 5000000 },
      'over_5m': { min: 5000000, max: 20000000 },
      'skip': { min: 0, max: 20000000 },
    },
  },
  {
    // Presupuesto traje de novio
    userQuestionId: 'dress_u_budget_groom',
    providerQuestionId: 'dress_p_price_groom_min',
    providerQuestionIdMax: 'dress_p_price_groom_max',
    weight: 5,
    matchType: 'range_overlap',
    userRangeMapping: {
      'under_200k': { min: 0, max: 200000 },
      '200k_400k': { min: 200000, max: 400000 },
      '400k_700k': { min: 400000, max: 700000 },
      '700k_1m': { min: 700000, max: 1000000 },
      'over_1m': { min: 1000000, max: 5000000 },
      'skip': { min: 0, max: 5000000 },
    },
  },
  {
    // Accesorios: múltiple vs múltiple
    userQuestionId: 'dress_u_accessories',
    providerQuestionId: 'dress_p_accessories',
    weight: 5,
    matchType: 'contains',
  },
  {
    // Pruebas y ajustes
    userQuestionId: 'dress_u_fitting',
    providerQuestionId: 'dress_p_fittings',
    weight: 5,
    matchType: 'preference_match',
    preferenceMapping: {
      '1': 0.5,
      '2': 0.7,
      '3': 0.9,
      'unlimited': 1.0,
      'extra_cost': 0.6,
    },
  },
];

// Mapa de criterios por categoría
// Todas las categorías ahora tienen criterios específicos de matchmaking
const CATEGORY_MATCHING_CRITERIA: Record<CategoryId, ExplicitMatchCriterion[]> = {
  photography: PHOTOGRAPHY_MATCHING_CRITERIA,
  video: VIDEO_MATCHING_CRITERIA,
  dj: DJ_MATCHING_CRITERIA,
  catering: CATERING_MATCHING_CRITERIA,
  venue: VENUE_MATCHING_CRITERIA,
  decoration: DECORATION_MATCHING_CRITERIA,
  wedding_planner: WEDDING_PLANNER_MATCHING_CRITERIA,
  makeup: MAKEUP_MATCHING_CRITERIA,
  entertainment: ENTERTAINMENT_MATCHING_CRITERIA,
  cakes: CAKES_MATCHING_CRITERIA,
  transport: TRANSPORT_MATCHING_CRITERIA,
  invitations: INVITATIONS_MATCHING_CRITERIA,
  dress: DRESS_MATCHING_CRITERIA,
};

// ============================================
// FUNCIONES DE CÁLCULO DE MATCH
// ============================================

/**
 * Calcula el score de matching entre un usuario y un proveedor para una categoría específica
 * VERSIÓN MEJORADA con criterios explícitos y sistema de especificidad
 */
export function calculateMatchScore(
  userResponses: SurveyResponses,
  providerResponses: SurveyResponses,
  category: CategoryId
): { score: number; details: MatchDetail[]; specificityBonus: number; coverageScore: number } {
  const criteria = CATEGORY_MATCHING_CRITERIA[category];
  
  if (!criteria || criteria.length === 0) {
    console.warn(`No se encontraron criterios de matching para: ${category}, usando fallback`);
    return calculateMatchScoreFallback(userResponses, providerResponses, category);
  }

  const details: MatchDetail[] = [];
  let totalWeight = 0;
  let weightedScore = 0;
  let matchedCriteria = 0;
  let totalCriteria = 0;

  // Calcular especificidad del proveedor (qué tan "nicho" es)
  const specificityScore = calculateProviderSpecificity(providerResponses, category);

  for (const criterion of criteria) {
    const userValue = userResponses[criterion.userQuestionId];
    const providerValue = providerResponses[criterion.providerQuestionId];
    
    // Obtener también el valor máximo si es un rango
    const providerMaxValue = criterion.providerQuestionIdMax 
      ? providerResponses[criterion.providerQuestionIdMax]
      : undefined;

    const { score, explanation } = calculateCriterionScoreAdvanced(
      userValue,
      providerValue,
      providerMaxValue,
      criterion
    );

    details.push({
      criterionId: `${criterion.userQuestionId}_${criterion.providerQuestionId}`,
      userQuestionId: criterion.userQuestionId,
      providerQuestionId: criterion.providerQuestionId,
      userValue,
      providerValue,
      score,
      weight: criterion.weight,
      matchType: criterion.matchType,
      explanation,
    });

    totalWeight += criterion.weight;
    weightedScore += score * criterion.weight;
    totalCriteria++;
    if (score >= 0.7) matchedCriteria++;
  }

  // Score base (0-100)
  const baseScore = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;
  
  // Cobertura: qué porcentaje de criterios importantes matchean bien
  const coverageScore = totalCriteria > 0 ? (matchedCriteria / totalCriteria) * 100 : 0;
  
  // Bonus por especificidad (máximo +10 puntos para proveedores muy especializados)
  const specificityBonus = Math.round(specificityScore * 10);
  
  // Score final: base + bonus de especificidad, máximo 100
  const finalScore = Math.min(100, Math.round(baseScore + specificityBonus));

  return { 
    score: finalScore, 
    details, 
    specificityBonus,
    coverageScore 
  };
}

/**
 * Calcula qué tan especializado/nicho es un proveedor
 */
function calculateProviderSpecificity(
  providerResponses: SurveyResponses,
  category: CategoryId
): number {
  const surveyConfig = CATEGORY_SURVEYS[category];
  if (!surveyConfig) return 0.5;

  let totalMultipleQuestions = 0;
  let totalSpecificityScore = 0;

  for (const question of surveyConfig.providerQuestions) {
    if (question.type === 'multiple' && question.options) {
      totalMultipleQuestions++;
      const response = providerResponses[question.id];
      
      if (Array.isArray(response)) {
        const totalOptions = question.options.length;
        const selectedOptions = response.length;
        
        const rawSpecificity = 1 - (selectedOptions / totalOptions);
        const adjustedSpecificity = Math.pow(rawSpecificity, 0.7);
        totalSpecificityScore += adjustedSpecificity;
      }
    }
  }

  if (totalMultipleQuestions === 0) return 0.5;
  
  return totalSpecificityScore / totalMultipleQuestions;
}

/**
 * Calcula el score para un criterio individual - VERSIÓN AVANZADA
 */
function calculateCriterionScoreAdvanced(
  userValue: string | string[] | number | boolean | undefined,
  providerValue: string | string[] | number | boolean | undefined,
  providerMaxValue: string | string[] | number | boolean | undefined,
  criterion: ExplicitMatchCriterion
): { score: number; explanation: string } {
  // Si falta el valor del usuario, score neutral
  if (userValue === undefined || userValue === null) {
    return { score: 0.5, explanation: 'Usuario no respondió esta pregunta' };
  }

  // Si falta el valor del proveedor, penalización
  if (providerValue === undefined || providerValue === null) {
    return { score: 0.3, explanation: 'Proveedor no respondió esta pregunta' };
  }

  switch (criterion.matchType) {
    case 'exact':
      return calculateExactMatchAdvanced(userValue, providerValue);
    
    case 'single_in_multiple':
      return calculateSingleInMultiple(userValue, providerValue);
    
    case 'contains':
      return calculateContainsMatchAdvanced(userValue, providerValue);
    
    case 'range_overlap':
      return calculateRangeOverlapAdvanced(
        userValue, 
        providerValue, 
        providerMaxValue,
        criterion.userRangeMapping
      );
    
    case 'boolean_match':
      return calculateBooleanMatchAdvanced(userValue, providerValue);
    
    case 'preference_match':
      return calculatePreferenceMatch(userValue, providerValue, criterion.preferenceMapping);
    
    case 'threshold_at_least':
      return calculateThresholdAtLeast(
        userValue,
        providerValue,
        providerMaxValue,
        criterion.userRangeMapping,
        criterion.orderedMapping
      );
    
    case 'threshold_at_most':
      return calculateThresholdAtMost(
        userValue,
        providerValue,
        criterion.orderedMapping
      );
    
    case 'threshold_can_accommodate':
      return calculateThresholdCanAccommodate(
        userValue,
        providerValue,
        providerMaxValue,
        criterion.userRangeMapping
      );
    
    default:
      return { score: 0.5, explanation: 'Tipo de match no reconocido' };
  }
}

/**
 * THRESHOLD_AT_LEAST: El proveedor debe ofrecer AL MENOS lo que el usuario necesita
 * Ejemplos: cantidad de fotos, capacidad de mesas, horario de término del venue
 * Si proveedor ofrece MÁS de lo que el usuario necesita → PERFECTO
 */
function calculateThresholdAtLeast(
  userValue: string | string[] | number | boolean,
  providerValue: string | string[] | number | boolean,
  providerMaxValue: string | string[] | number | boolean | undefined,
  userRangeMapping?: Record<string, { min: number; max: number }>,
  orderedMapping?: Record<string, number>
): { score: number; explanation: string } {
  
  // Si hay orderedMapping, usar ese (para horarios, etc.)
  if (orderedMapping) {
    const userOrder = orderedMapping[String(userValue)] ?? 0;
    const providerOrder = orderedMapping[String(providerValue)] ?? 0;
    
    // Si proveedor ofrece igual o más (ej: venue hasta 4am, usuario quiere hasta 2am)
    if (providerOrder >= userOrder) {
      return { score: 1.0, explanation: 'El proveedor cumple o supera tu requisito' };
    }
    
    // Si proveedor ofrece menos pero está cerca
    const diff = userOrder - providerOrder;
    const maxDiff = Math.max(...Object.values(orderedMapping));
    const score = Math.max(0, 1 - (diff / maxDiff));
    return { score, explanation: `El proveedor ofrece menos de lo que necesitas (${Math.round(score * 100)}% compatible)` };
  }
  
  // Obtener valor numérico del usuario
  let userNumericValue: number;
  if (userRangeMapping && typeof userValue === 'string' && userRangeMapping[userValue]) {
    // Usar el valor máximo del rango del usuario (lo que necesita como mínimo)
    userNumericValue = userRangeMapping[userValue].max;
  } else if (typeof userValue === 'number') {
    userNumericValue = userValue;
  } else {
    userNumericValue = parseFloat(String(userValue)) || 0;
  }
  
  // Obtener valor máximo del proveedor
  const providerMin = typeof providerValue === 'number' ? providerValue : parseFloat(String(providerValue)) || 0;
  const providerMax = providerMaxValue !== undefined
    ? (typeof providerMaxValue === 'number' ? providerMaxValue : parseFloat(String(providerMaxValue)) || providerMin)
    : providerMin;
  
  // Si el proveedor puede ofrecer al menos lo que el usuario necesita
  if (providerMax >= userNumericValue) {
    return { score: 1.0, explanation: 'El proveedor puede ofrecer lo que necesitas o más' };
  }
  
  // Si el proveedor no llega, calcular qué tan cerca está
  const ratio = providerMax / userNumericValue;
  const score = Math.max(0, ratio);
  return { score, explanation: `El proveedor puede ofrecer ${Math.round(ratio * 100)}% de lo que necesitas` };
}

/**
 * THRESHOLD_AT_MOST: El proveedor debe entregar/hacer ANTES o igual de cuando el usuario lo necesita
 * Ejemplos: tiempo de entrega de fotos/video
 * Si proveedor entrega en 2 semanas y usuario lo quiere en 2 meses → PERFECTO (entrega antes)
 */
function calculateThresholdAtMost(
  userValue: string | string[] | number | boolean,
  providerValue: string | string[] | number | boolean,
  orderedMapping?: Record<string, number>
): { score: number; explanation: string } {
  
  if (!orderedMapping) {
    // Sin mapeo, comparación directa
    return { score: 0.5, explanation: 'No se pudo comparar los tiempos' };
  }
  
  const userOrder = orderedMapping[String(userValue)] ?? 365;
  const providerOrder = orderedMapping[String(providerValue)] ?? 365;
  
  // "flexible" del usuario significa que acepta cualquier tiempo
  if (String(userValue) === 'flexible') {
    return { score: 1.0, explanation: 'Eres flexible con el tiempo de entrega' };
  }
  
  // Si proveedor entrega igual o ANTES de lo que el usuario necesita → PERFECTO
  if (providerOrder <= userOrder) {
    return { score: 1.0, explanation: 'El proveedor entrega a tiempo o antes de lo que necesitas' };
  }
  
  // Si proveedor tarda más, calcular penalización
  const diff = providerOrder - userOrder;
  const maxDiff = Math.max(...Object.values(orderedMapping));
  const score = Math.max(0, 1 - (diff / maxDiff) * 2); // Penalización más fuerte
  return { score, explanation: `El proveedor tarda más de lo que necesitas (${Math.round(score * 100)}% compatible)` };
}

/**
 * THRESHOLD_CAN_ACCOMMODATE: El proveedor debe poder acomodar lo que el usuario necesita
 * Ejemplos: horas de cobertura, capacidad de invitados
 * Usuario necesita 8 horas, proveedor ofrece 4-12 horas → PERFECTO (8 está en el rango)
 */
function calculateThresholdCanAccommodate(
  userValue: string | string[] | number | boolean,
  providerValue: string | string[] | number | boolean,
  providerMaxValue: string | string[] | number | boolean | undefined,
  userRangeMapping?: Record<string, { min: number; max: number }>
): { score: number; explanation: string } {
  
  // Obtener lo que el usuario necesita
  let userNeeds: number;
  if (userRangeMapping && typeof userValue === 'string' && userRangeMapping[userValue]) {
    // Usar el valor típico/medio del rango del usuario
    const range = userRangeMapping[userValue];
    userNeeds = (range.min + range.max) / 2;
  } else if (typeof userValue === 'number') {
    userNeeds = userValue;
  } else {
    userNeeds = parseFloat(String(userValue)) || 0;
  }
  
  // Obtener rango del proveedor
  const providerMin = typeof providerValue === 'number' ? providerValue : parseFloat(String(providerValue)) || 0;
  const providerMax = providerMaxValue !== undefined
    ? (typeof providerMaxValue === 'number' ? providerMaxValue : parseFloat(String(providerMaxValue)) || providerMin)
    : providerMin * 3; // Si no hay máximo, asumir flexibilidad
  
  // Si lo que el usuario necesita está dentro del rango del proveedor → PERFECTO
  if (userNeeds >= providerMin && userNeeds <= providerMax) {
    return { score: 1.0, explanation: 'El proveedor puede acomodar perfectamente lo que necesitas' };
  }
  
  // Si el usuario necesita menos del mínimo del proveedor
  if (userNeeds < providerMin) {
    const diff = providerMin - userNeeds;
    const ratio = diff / providerMin;
    // Penalización leve - el proveedor puede hacer más de lo necesario
    const score = Math.max(0.5, 1 - ratio * 0.5);
    return { score, explanation: `El proveedor normalmente hace más de lo que necesitas, pero podría adaptarse` };
  }
  
  // Si el usuario necesita más del máximo del proveedor
  if (userNeeds > providerMax) {
    const ratio = providerMax / userNeeds;
    const score = Math.max(0, ratio);
    return { score, explanation: `El proveedor puede cubrir ${Math.round(ratio * 100)}% de lo que necesitas` };
  }
  
  return { score: 0.5, explanation: 'Compatibilidad parcial' };
}

/**
 * Match exacto mejorado
 */
function calculateExactMatchAdvanced(
  userValue: string | string[] | number | boolean,
  providerValue: string | string[] | number | boolean
): { score: number; explanation: string } {
  const userStr = String(userValue).toLowerCase();
  const providerStr = String(providerValue).toLowerCase();
  
  if (userStr === providerStr) {
    return { score: 1.0, explanation: 'Coincidencia exacta' };
  }
  
  if (userStr.includes(providerStr) || providerStr.includes(userStr)) {
    return { score: 0.7, explanation: 'Coincidencia parcial' };
  }
  
  return { score: 0.0, explanation: 'Sin coincidencia' };
}

/**
 * Usuario elige UNA opción, proveedor ofrece MÚLTIPLES
 */
function calculateSingleInMultiple(
  userValue: string | string[] | number | boolean,
  providerValue: string | string[] | number | boolean
): { score: number; explanation: string } {
  const userOption = String(userValue).toLowerCase();
  
  let providerOptions: string[];
  if (Array.isArray(providerValue)) {
    providerOptions = providerValue.map(v => String(v).toLowerCase());
  } else {
    providerOptions = [String(providerValue).toLowerCase()];
  }
  
  if (providerOptions.includes(userOption)) {
    const specificityFactor = providerOptions.length <= 2 ? 1.0 : 
                              providerOptions.length <= 4 ? 0.95 : 0.9;
    return { 
      score: specificityFactor, 
      explanation: `El proveedor ofrece exactamente lo que buscas${providerOptions.length <= 2 ? ' (especialista)' : ''}`
    };
  }
  
  return { score: 0.0, explanation: 'El proveedor no ofrece este estilo/opción' };
}

/**
 * Match de contención mejorado - múltiple vs múltiple
 */
function calculateContainsMatchAdvanced(
  userValue: string | string[] | number | boolean,
  providerValue: string | string[] | number | boolean
): { score: number; explanation: string } {
  const userArray = Array.isArray(userValue) 
    ? userValue.map(v => String(v).toLowerCase())
    : [String(userValue).toLowerCase()];
  
  const providerArray = Array.isArray(providerValue)
    ? providerValue.map(v => String(v).toLowerCase())
    : [String(providerValue).toLowerCase()];
  
  const filteredUserArray = userArray.filter(v => v !== 'none' && v !== '' && v !== 'no_preference');
  
  if (filteredUserArray.length === 0) {
    return { score: 1.0, explanation: 'Usuario no tiene requisitos específicos' };
  }
  
  const matches = filteredUserArray.filter(uv => providerArray.includes(uv));
  const matchRatio = matches.length / filteredUserArray.length;
  
  if (matchRatio === 1) {
    return { score: 1.0, explanation: 'El proveedor cubre todas tus preferencias' };
  } else if (matchRatio >= 0.7) {
    return { score: matchRatio, explanation: `El proveedor cubre ${Math.round(matchRatio * 100)}% de tus preferencias` };
  } else if (matchRatio >= 0.5) {
    return { score: matchRatio * 0.9, explanation: `El proveedor cubre ${Math.round(matchRatio * 100)}% de tus preferencias` };
  } else if (matchRatio > 0) {
    return { score: matchRatio * 0.7, explanation: `El proveedor cubre solo ${Math.round(matchRatio * 100)}% de tus preferencias` };
  }
  
  return { score: 0.1, explanation: 'El proveedor no cubre tus preferencias' };
}

/**
 * Match de rango mejorado
 */
function calculateRangeOverlapAdvanced(
  userValue: string | string[] | number | boolean,
  providerMinValue: string | string[] | number | boolean,
  providerMaxValue: string | string[] | number | boolean | undefined,
  userRangeMapping?: Record<string, { min: number; max: number }>
): { score: number; explanation: string } {
  let userRange: { min: number; max: number };
  
  if (userRangeMapping && typeof userValue === 'string' && userRangeMapping[userValue]) {
    userRange = userRangeMapping[userValue];
  } else if (typeof userValue === 'number') {
    userRange = { min: userValue, max: userValue };
  } else {
    const parsed = parseFloat(String(userValue));
    if (!isNaN(parsed)) {
      userRange = { min: parsed, max: parsed };
    } else {
      return { score: 0.5, explanation: 'No se pudo interpretar el rango del usuario' };
    }
  }
  
  const providerMin = typeof providerMinValue === 'number' 
    ? providerMinValue 
    : parseFloat(String(providerMinValue)) || 0;
  
  const providerMax = providerMaxValue !== undefined
    ? (typeof providerMaxValue === 'number' ? providerMaxValue : parseFloat(String(providerMaxValue)) || providerMin)
    : providerMin * 2;
  
  const providerRange = { min: providerMin, max: providerMax };
  
  const overlapStart = Math.max(userRange.min, providerRange.min);
  const overlapEnd = Math.min(userRange.max, providerRange.max);
  
  if (overlapStart <= overlapEnd) {
    const overlapSize = overlapEnd - overlapStart;
    const userRangeSize = userRange.max - userRange.min;
    
    if (userRangeSize === 0) {
      return { score: 1.0, explanation: 'Tu presupuesto/requisito está dentro del rango del proveedor' };
    }
    
    const overlapRatio = overlapSize / userRangeSize;
    
    if (overlapRatio >= 0.8) {
      return { score: 1.0, explanation: 'Excelente coincidencia de rango' };
    } else if (overlapRatio >= 0.5) {
      return { score: 0.8, explanation: 'Buena coincidencia de rango' };
    } else {
      return { score: 0.6, explanation: 'Coincidencia parcial de rango' };
    }
  }
  
  const gap = overlapStart - overlapEnd;
  const userMidpoint = (userRange.min + userRange.max) / 2;
  const gapRatio = gap / userMidpoint;
  
  if (gapRatio <= 0.2) {
    return { score: 0.5, explanation: 'El proveedor está ligeramente fuera de tu rango' };
  } else if (gapRatio <= 0.5) {
    return { score: 0.3, explanation: 'El proveedor está fuera de tu rango' };
  }
  
  return { score: 0.1, explanation: 'El proveedor está muy fuera de tu rango' };
}

/**
 * Match booleano mejorado
 */
function calculateBooleanMatchAdvanced(
  userValue: string | string[] | number | boolean,
  providerValue: string | string[] | number | boolean
): { score: number; explanation: string } {
  const userBool = toBooleanValue(userValue);
  const providerBool = toBooleanValue(providerValue);
  
  if (!userBool) {
    return { score: 1.0, explanation: 'No es un requisito para ti' };
  }
  
  if (providerBool) {
    return { score: 1.0, explanation: 'El proveedor ofrece este servicio' };
  }
  
  return { score: 0.0, explanation: 'El proveedor no ofrece este servicio que necesitas' };
}

/**
 * Match de preferencia
 */
function calculatePreferenceMatch(
  userValue: string | string[] | number | boolean,
  providerValue: string | string[] | number | boolean,
  preferenceMapping?: Record<string, number>
): { score: number; explanation: string } {
  const userStr = String(userValue).toLowerCase();
  const providerStr = String(providerValue).toLowerCase();
  
  if (userStr === 'no' || userStr === 'not_needed' || userStr === 'false') {
    return { score: 1.0, explanation: 'No es un requisito para ti' };
  }
  
  if (preferenceMapping && preferenceMapping[providerStr] !== undefined) {
    const score = preferenceMapping[providerStr];
    
    if (userStr === 'required' || userStr === 'indispensable') {
      if (score >= 0.8) {
        return { score: 1.0, explanation: 'El proveedor cumple tu requisito indispensable' };
      } else if (score >= 0.5) {
        return { score: score * 0.8, explanation: 'El proveedor cumple parcialmente tu requisito' };
      } else {
        return { score: score * 0.5, explanation: 'El proveedor no cumple bien tu requisito indispensable' };
      }
    }
    
    if (userStr === 'preferred' || userStr === 'preferible') {
      return { score: score, explanation: score >= 0.7 ? 'El proveedor cumple tu preferencia' : 'El proveedor no cumple completamente tu preferencia' };
    }
    
    return { score: score, explanation: 'Evaluación basada en oferta del proveedor' };
  }
  
  if (userStr === providerStr) {
    return { score: 1.0, explanation: 'Coincidencia exacta' };
  }
  
  return { score: 0.5, explanation: 'Coincidencia parcial' };
}

/**
 * Convierte un valor a booleano
 */
function toBooleanValue(value: string | string[] | number | boolean): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return lower === 'true' || lower === 'yes' || lower === 'si' || lower === 'sí' || 
           lower === 'required' || lower === 'indispensable' || lower === 'preferred';
  }
  if (Array.isArray(value)) return value.length > 0;
  return false;
}

/**
 * Fallback para categorías sin criterios explícitos
 */
function calculateMatchScoreFallback(
  userResponses: SurveyResponses,
  providerResponses: SurveyResponses,
  category: CategoryId
): { score: number; details: MatchDetail[]; specificityBonus: number; coverageScore: number } {
  const surveyConfig = CATEGORY_SURVEYS[category];
  
  if (!surveyConfig) {
    return { score: 50, details: [], specificityBonus: 0, coverageScore: 50 };
  }

  const details: MatchDetail[] = [];
  let totalWeight = 0;
  let weightedScore = 0;

  for (const userQ of surveyConfig.userQuestions) {
    const providerQ = surveyConfig.providerQuestions.find(pQ => {
      const userBase = userQ.id.replace(/^.*_u_/, '');
      const providerBase = pQ.id.replace(/^.*_p_/, '');
      return userBase === providerBase;
    });

    if (providerQ) {
      const userValue = userResponses[userQ.id];
      const providerValue = providerResponses[providerQ.id];
      
      let score = 0.5;
      let matchType: MatchType = 'contains';
      
      if (userQ.type === 'boolean' || providerQ.type === 'boolean') {
        const result = calculateBooleanMatchAdvanced(userValue || false, providerValue || false);
        score = result.score;
        matchType = 'boolean_match';
      } else if (userQ.type === 'single' && providerQ.type === 'multiple') {
        const result = calculateSingleInMultiple(userValue || '', providerValue || []);
        score = result.score;
        matchType = 'single_in_multiple';
      } else if (userQ.type === 'multiple' && providerQ.type === 'multiple') {
        const result = calculateContainsMatchAdvanced(userValue || [], providerValue || []);
        score = result.score;
        matchType = 'contains';
      } else {
        const result = calculateExactMatchAdvanced(userValue || '', providerValue || '');
        score = result.score;
        matchType = 'exact';
      }

      details.push({
        criterionId: `${userQ.id}_${providerQ.id}`,
        userQuestionId: userQ.id,
        providerQuestionId: providerQ.id,
        userValue,
        providerValue,
        score,
        weight: userQ.weight || 50,
        matchType,
      });

      totalWeight += userQ.weight || 50;
      weightedScore += score * (userQ.weight || 50);
    }
  }

  const finalScore = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 50;

  return { 
    score: finalScore, 
    details, 
    specificityBonus: 0,
    coverageScore: finalScore 
  };
}

/**
 * Genera matches para un usuario en una categoría específica
 */
export function generateMatches(
  userId: string,
  category: CategoryId,
  userResponses: SurveyResponses,
  providers: Array<{
    id: string;
    responses: SurveyResponses;
    region?: string;
    priceRange?: string;
  }>,
  minScore: number = 40
): MatchResult[] {
  const matches: MatchResult[] = [];

  for (const provider of providers) {
    const { score, details, specificityBonus, coverageScore } = calculateMatchScore(
      userResponses,
      provider.responses,
      category
    );

    if (score >= minScore) {
      matches.push({
        providerId: provider.id,
        userId,
        category,
        matchScore: score,
        matchDetails: details,
        specificityBonus,
        coverageScore,
        createdAt: new Date(),
      });
    }
  }

  matches.sort((a, b) => b.matchScore - a.matchScore);

  return matches;
}

/**
 * Obtiene un resumen textual del match
 */
export function getMatchSummary(matchResult: MatchResult): string {
  const { matchScore, matchDetails, specificityBonus, coverageScore } = matchResult;
  
  const sortedDetails = [...matchDetails].sort((a, b) => b.score - a.score);
  const topMatches = sortedDetails.slice(0, 3).filter(d => d.score >= 0.7);
  const weakMatches = sortedDetails.filter(d => d.score < 0.3);

  let summary = `Compatibilidad: ${matchScore}%`;
  
  if (specificityBonus > 0) {
    summary += ` (incluye +${specificityBonus}% por ser especialista)`;
  }
  
  if (topMatches.length > 0) {
    summary += `. Fortalezas: ${topMatches.length} criterios con alta compatibilidad`;
  }
  
  if (weakMatches.length > 0) {
    summary += `. Áreas a considerar: ${weakMatches.length} criterios con baja coincidencia`;
  }

  return summary;
}

// ============================================
// MATCHING CON DATOS DEL WIZARD
// ============================================

const BUDGET_TO_PRICE_COMPATIBILITY: Record<string, string[]> = {
  'under_5m': ['budget'],
  '5m_10m': ['budget', 'mid'],
  '10m_15m': ['mid'],
  '15m_20m': ['mid', 'premium'],
  '20m_30m': ['premium'],
  '30m_50m': ['premium', 'luxury'],
  'over_50m': ['luxury'],
};

const EVENT_STYLE_TO_SERVICE_STYLE: Record<string, string[]> = {
  'classic': ['traditional', 'classic', 'editorial'],
  'rustic': ['documentary', 'artistic', 'natural'],
  'modern': ['modern', 'cinematic', 'editorial'],
  'romantic': ['artistic', 'romantic', 'documentary'],
  'glamorous': ['editorial', 'cinematic', 'glamorous'],
  'vintage': ['traditional', 'artistic', 'vintage'],
  'beach': ['documentary', 'artistic', 'natural'],
  'industrial': ['modern', 'cinematic', 'editorial'],
};

/**
 * Calcula el score de matching basado en datos del wizard
 */
export function calculateWizardMatchScore(
  userProfile: UserWizardProfile,
  providerProfile: ProviderWizardProfile,
  category: CategoryId
): { score: number; details: WizardMatchDetail[] } {
  const details: WizardMatchDetail[] = [];
  let totalWeight = 0;
  let weightedScore = 0;

  // 1. Match de ubicación (peso: 25)
  const locationWeight = 25;
  let locationScore = 0;
  
  if (userProfile.region === providerProfile.workRegion) {
    locationScore = 1;
  } else if (providerProfile.acceptsOutsideZone) {
    locationScore = 0.7;
  } else {
    locationScore = 0.2;
  }
  
  details.push({
    criterion: 'location',
    userValue: userProfile.region,
    providerValue: providerProfile.workRegion,
    score: locationScore,
    weight: locationWeight,
  });
  totalWeight += locationWeight;
  weightedScore += locationScore * locationWeight;

  // 2. Match de presupuesto (peso: 30)
  const budgetWeight = 30;
  let budgetScore = 0;
  
  const compatiblePriceRanges = BUDGET_TO_PRICE_COMPATIBILITY[userProfile.budget] || [];
  if (compatiblePriceRanges.includes(providerProfile.priceRange)) {
    budgetScore = 1;
  } else {
    const priceOrder = ['budget', 'mid', 'premium', 'luxury'];
    const userIndex = priceOrder.findIndex(p => compatiblePriceRanges.includes(p));
    const providerIndex = priceOrder.indexOf(providerProfile.priceRange);
    
    if (userIndex >= 0 && providerIndex >= 0) {
      const distance = Math.abs(userIndex - providerIndex);
      budgetScore = Math.max(0, 1 - (distance * 0.3));
    } else {
      budgetScore = 0.5;
    }
  }
  
  details.push({
    criterion: 'budget',
    userValue: userProfile.budget,
    providerValue: providerProfile.priceRange,
    score: budgetScore,
    weight: budgetWeight,
  });
  totalWeight += budgetWeight;
  weightedScore += budgetScore * budgetWeight;

  // 3. Match de estilo (peso: 25)
  const styleWeight = 25;
  let styleScore = 0;
  
  const compatibleStyles = EVENT_STYLE_TO_SERVICE_STYLE[userProfile.eventStyle] || [];
  if (compatibleStyles.includes(providerProfile.serviceStyle)) {
    styleScore = 1;
  } else {
    styleScore = 0.4;
  }
  
  details.push({
    criterion: 'style',
    userValue: userProfile.eventStyle,
    providerValue: providerProfile.serviceStyle,
    score: styleScore,
    weight: styleWeight,
  });
  totalWeight += styleWeight;
  weightedScore += styleScore * styleWeight;

  // 4. Categoría prioritaria (peso: 20)
  const priorityWeight = 20;
  let priorityScore = 0;
  
  if (userProfile.priorityCategories.includes(category)) {
    if (providerProfile.categories.includes(category)) {
      priorityScore = 1;
    } else {
      priorityScore = 0;
    }
  } else {
    priorityScore = providerProfile.categories.includes(category) ? 0.7 : 0;
  }
  
  details.push({
    criterion: 'priority',
    userValue: userProfile.priorityCategories,
    providerValue: providerProfile.categories,
    score: priorityScore,
    weight: priorityWeight,
  });
  totalWeight += priorityWeight;
  weightedScore += priorityScore * priorityWeight;

  const finalScore = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;

  return { score: finalScore, details };
}

/**
 * Calcula el score de matching COMBINADO (wizard + mini-encuesta)
 * IMPORTANTE: Esta función aplica el bonus de verificación al final
 * Proveedores verificados obtienen +10 puntos (máximo 100)
 */
export function calculateCombinedMatchScore(
  userSurveyResponses: SurveyResponses,
  providerSurveyResponses: SurveyResponses,
  userProfile: UserWizardProfile | null,
  providerProfile: ProviderWizardProfile | null,
  category: CategoryId,
  isVerified: boolean = false // NUEVO: Flag para bonus de verificación
): { 
  score: number; 
  surveyScore: number;
  wizardScore: number;
  surveyDetails: MatchDetail[];
  wizardDetails: WizardMatchDetail[];
  specificityBonus: number;
  coverageScore: number;
  verifiedBonus: number; // NUEVO: Bonus aplicado por verificación
} {
  const surveyResult = calculateMatchScore(
    userSurveyResponses,
    providerSurveyResponses,
    category
  );
  
  let wizardResult = { score: 0, details: [] as WizardMatchDetail[] };
  let wizardWeight = 0;
  
  if (userProfile && providerProfile) {
    wizardResult = calculateWizardMatchScore(userProfile, providerProfile, category);
    wizardWeight = 30;
  }
  
  const hasProviderSurvey = Object.keys(providerSurveyResponses).length > 0;
  
  let surveyWeight: number;
  if (hasProviderSurvey) {
    surveyWeight = 100 - wizardWeight;
  } else {
    surveyWeight = 40;
    wizardWeight = 60;
  }
  
  let combinedScore = Math.round(
    (surveyResult.score * (surveyWeight / 100)) + 
    (wizardResult.score * (wizardWeight / 100))
  );

  // NUEVO: Aplicar bonus de verificación (+10 puntos, máximo 100)
  // Los proveedores verificados tienen un pequeño privilegio en el ranking
  const verifiedBonus = isVerified ? 10 : 0;
  const finalScore = Math.min(100, combinedScore + verifiedBonus);

  return {
    score: finalScore,
    surveyScore: surveyResult.score,
    wizardScore: wizardResult.score,
    surveyDetails: surveyResult.details,
    wizardDetails: wizardResult.details,
    specificityBonus: surveyResult.specificityBonus,
    coverageScore: surveyResult.coverageScore,
    verifiedBonus, // Retornamos el bonus aplicado para debugging
  };
}

/**
 * Genera un resumen legible del match combinado
 */
export function getCombinedMatchSummary(
  score: number,
  surveyScore: number,
  wizardScore: number,
  surveyDetails: MatchDetail[],
  wizardDetails: WizardMatchDetail[],
  specificityBonus?: number
): string {
  let summary = `Compatibilidad total: ${score}%`;
  
  if (wizardScore > 0) {
    summary += ` (Perfil: ${wizardScore}%, Preferencias: ${surveyScore}%)`;
  }
  
  if (specificityBonus && specificityBonus > 0) {
    summary += ` [+${specificityBonus}% especialista]`;
  }
  
  const strongWizardMatches = wizardDetails.filter(d => d.score >= 0.8);
  if (strongWizardMatches.length > 0) {
    const strengths = strongWizardMatches.map(d => {
      switch (d.criterion) {
        case 'location': return 'ubicación';
        case 'budget': return 'presupuesto';
        case 'style': return 'estilo';
        case 'priority': return 'categoría prioritaria';
        default: return d.criterion;
      }
    });
    summary += `. Excelente match en: ${strengths.join(', ')}`;
  }
  
  const strongSurveyMatches = surveyDetails.filter(d => d.score >= 0.8).slice(0, 2);
  if (strongSurveyMatches.length > 0) {
    summary += `. ${strongSurveyMatches.length} criterios específicos con alta compatibilidad`;
  }
  
  const weakMatches = surveyDetails.filter(d => d.score < 0.3);
  if (weakMatches.length > 0) {
    summary += `. ⚠️ ${weakMatches.length} criterios con baja coincidencia`;
  }
  
  return summary;
}

// ============================================
// CONFIGURACIÓN DINÁMICA DE MATCHMAKING
// Cargada desde Firestore por Super Admin
// ============================================

/**
 * Interfaz para configuración de una pregunta en el matchmaking (desde admin panel)
 */
export interface QuestionMatchingConfig {
  questionId: string;
  questionLabel: string;
  weight: number; // 0-100
  isExcluding: boolean; // Si es true, no coincidencia = 0% automático
}

/**
 * Caché local de la configuración de matchmaking
 * Se actualiza periódicamente desde Firestore
 */
let matchingConfigCache: Record<CategoryId, QuestionMatchingConfig[]> | null = null;
let configCacheTimestamp: number = 0;
const CONFIG_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Carga la configuración de matchmaking desde Firestore
 * Usa caché para evitar llamadas repetidas
 */
export async function loadMatchingConfig(): Promise<Record<CategoryId, QuestionMatchingConfig[]> | null> {
  // Verificar si el caché es válido
  if (matchingConfigCache && Date.now() - configCacheTimestamp < CONFIG_CACHE_TTL) {
    return matchingConfigCache;
  }

  try {
    // Importación dinámica para evitar problemas de SSR
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase/config');
    
    const configRef = doc(db, 'matchmaking_config', 'weights');
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists()) {
      matchingConfigCache = configSnap.data() as Record<CategoryId, QuestionMatchingConfig[]>;
      configCacheTimestamp = Date.now();
      console.log('✅ Configuración de matchmaking cargada desde Firestore');
      return matchingConfigCache;
    }
  } catch (error) {
    console.error('Error cargando configuración de matchmaking:', error);
  }

  return null;
}

/**
 * Aplica la configuración dinámica a los criterios de matchmaking
 * Modifica los pesos y marca preguntas como excluyentes
 */
export function applyMatchingConfig(
  score: number,
  details: MatchDetail[],
  categoryId: CategoryId,
  config: Record<CategoryId, QuestionMatchingConfig[]>
): { adjustedScore: number; isExcluded: boolean; excludingCriteria: string[] } {
  const categoryConfig = config[categoryId];
  
  if (!categoryConfig || categoryConfig.length === 0) {
    return { adjustedScore: score, isExcluded: false, excludingCriteria: [] };
  }

  const excludingCriteria: string[] = [];
  let isExcluded = false;

  // Buscar criterios excluyentes que no coincidieron
  for (const configItem of categoryConfig) {
    if (configItem.isExcluding) {
      // Buscar el detalle correspondiente
      const detail = details.find(d => 
        d.userQuestionId === configItem.questionId || 
        d.criterionId.includes(configItem.questionId)
      );

      // Si hay un criterio excluyente con score 0, marcar como excluido
      if (detail && detail.score === 0) {
        isExcluded = true;
        excludingCriteria.push(configItem.questionLabel);
      }
    }
  }

  // Si hay exclusiones, el score es 0
  const adjustedScore = isExcluded ? 0 : score;

  return { adjustedScore, isExcluded, excludingCriteria };
}

/**
 * Versión mejorada de calculateMatchScore que usa configuración dinámica
 * Mantiene compatibilidad hacia atrás si no hay configuración
 */
export async function calculateMatchScoreWithConfig(
  userResponses: SurveyResponses,
  providerResponses: SurveyResponses,
  category: CategoryId
): Promise<{ 
  score: number; 
  details: MatchDetail[]; 
  specificityBonus: number; 
  coverageScore: number;
  isExcluded: boolean;
  excludingCriteria: string[];
}> {
  // Calcular score base
  const baseResult = calculateMatchScore(userResponses, providerResponses, category);
  
  // Cargar configuración dinámica
  const config = await loadMatchingConfig();
  
  if (!config) {
    // Sin configuración, usar score base
    return {
      ...baseResult,
      isExcluded: false,
      excludingCriteria: [],
    };
  }

  // Aplicar configuración dinámica (excluyentes, pesos ajustados)
  const { adjustedScore, isExcluded, excludingCriteria } = applyMatchingConfig(
    baseResult.score,
    baseResult.details,
    category,
    config
  );

  return {
    score: adjustedScore,
    details: baseResult.details,
    specificityBonus: baseResult.specificityBonus,
    coverageScore: baseResult.coverageScore,
    isExcluded,
    excludingCriteria,
  };
}

/**
 * Invalidar caché de configuración (llamar cuando se guarden cambios)
 */
export function invalidateMatchingConfigCache(): void {
  matchingConfigCache = null;
  configCacheTimestamp = 0;
  console.log('🔄 Caché de configuración de matchmaking invalidado');
}
