/**
 * Utilidades de Comparación para la UI
 * Matri.AI - Funciones para mostrar comparativas correctas en el detalle de leads
 * 
 * Este archivo exporta la lógica de matching para que la UI pueda determinar
 * correctamente si un proveedor "cumple" o "no cumple" con cada criterio.
 * 
 * IMPORTANTE: La lógica aquí debe ser consistente con matchingService.ts
 */

import { CategoryId } from '@/store/authStore';
import { SurveyQuestion } from '@/lib/surveys/types';

// ============================================
// TIPOS
// ============================================

export type MatchType = 
  | 'exact'
  | 'contains'
  | 'range_overlap'
  | 'boolean_match'
  | 'single_in_multiple'
  | 'preference_match'
  | 'threshold_at_least'
  | 'threshold_at_most'
  | 'threshold_can_accommodate';

export interface MatchCriterion {
  userQuestionId: string;
  providerQuestionId: string;
  providerQuestionIdMax?: string;
  weight: number;
  matchType: MatchType;
  userRangeMapping?: Record<string, { min: number; max: number }>;
  orderedMapping?: Record<string, number>;
  preferenceMapping?: Record<string, number>;
}

export interface ComparisonResult {
  matches: boolean;
  score: number;
  explanation: string;
}

// ============================================
// MAPEOS DE TIEMPO Y ORDEN
// ============================================

const DELIVERY_TIME_ORDER: Record<string, number> = {
  '2_weeks': 14,
  '1_month': 30,
  '2_months': 60,
  '3_months': 90,
  '6_months': 180,
  'flexible': 365,
};

const END_TIME_ORDER: Record<string, number> = {
  'midnight': 0,
  '2am': 2,
  '4am': 4,
  'sunrise': 6,
  'flexible': 24,
};

// ============================================
// CRITERIOS POR CATEGORÍA (exportados para la UI)
// ============================================

const PHOTOGRAPHY_CRITERIA: MatchCriterion[] = [
  { userQuestionId: 'photo_u_style', providerQuestionId: 'photo_p_styles', weight: 25, matchType: 'single_in_multiple' },
  { userQuestionId: 'photo_u_hours', providerQuestionId: 'photo_p_hours_min', providerQuestionIdMax: 'photo_p_hours_max', weight: 15, matchType: 'threshold_can_accommodate', userRangeMapping: { '4': { min: 4, max: 4 }, '6': { min: 6, max: 6 }, '8': { min: 8, max: 8 }, '10': { min: 10, max: 10 }, 'full_day': { min: 12, max: 24 } } },
  { userQuestionId: 'photo_u_budget', providerQuestionId: 'photo_p_price_min', providerQuestionIdMax: 'photo_p_price_max', weight: 20, matchType: 'range_overlap', userRangeMapping: { 'under_500k': { min: 0, max: 500000 }, '500k_800k': { min: 500000, max: 800000 }, '800k_1200k': { min: 800000, max: 1200000 }, '1200k_1800k': { min: 1200000, max: 1800000 }, 'over_1800k': { min: 1800000, max: 10000000 } } },
  { userQuestionId: 'photo_u_preboda', providerQuestionId: 'photo_p_preboda', weight: 5, matchType: 'boolean_match' },
  { userQuestionId: 'photo_u_postboda', providerQuestionId: 'photo_p_postboda', weight: 5, matchType: 'boolean_match' },
  { userQuestionId: 'photo_u_second_shooter', providerQuestionId: 'photo_p_second_shooter', weight: 5, matchType: 'preference_match', preferenceMapping: { 'no': 1.0, 'extra_cost': 0.8, 'included': 1.0, 'always': 1.0 } },
  { userQuestionId: 'photo_u_delivery_time', providerQuestionId: 'photo_p_delivery_time', weight: 5, matchType: 'threshold_at_most', orderedMapping: DELIVERY_TIME_ORDER },
  { userQuestionId: 'photo_u_delivery_format', providerQuestionId: 'photo_p_delivery_formats', weight: 5, matchType: 'contains' },
  { userQuestionId: 'photo_u_photo_count', providerQuestionId: 'photo_p_photo_count_min', providerQuestionIdMax: 'photo_p_photo_count_max', weight: 5, matchType: 'threshold_at_least', userRangeMapping: { 'under_200': { min: 100, max: 200 }, '200_400': { min: 200, max: 400 }, '400_600': { min: 400, max: 600 }, 'over_600': { min: 600, max: 2000 }, 'unlimited': { min: 500, max: 10000 } } },
  { userQuestionId: 'photo_u_retouching', providerQuestionId: 'photo_p_retouching_levels', weight: 5, matchType: 'single_in_multiple' },
];

const VIDEO_CRITERIA: MatchCriterion[] = [
  { userQuestionId: 'video_u_style', providerQuestionId: 'video_p_styles', weight: 25, matchType: 'single_in_multiple' },
  { userQuestionId: 'video_u_duration', providerQuestionId: 'video_p_durations', weight: 15, matchType: 'single_in_multiple' },
  { userQuestionId: 'video_u_budget', providerQuestionId: 'video_p_price_min', providerQuestionIdMax: 'video_p_price_max', weight: 20, matchType: 'range_overlap', userRangeMapping: { 'under_600k': { min: 0, max: 600000 }, '600k_1000k': { min: 600000, max: 1000000 }, '1000k_1500k': { min: 1000000, max: 1500000 }, '1500k_2500k': { min: 1500000, max: 2500000 }, 'over_2500k': { min: 2500000, max: 10000000 } } },
  { userQuestionId: 'video_u_hours', providerQuestionId: 'video_p_hours_min', providerQuestionIdMax: 'video_p_hours_max', weight: 10, matchType: 'threshold_can_accommodate', userRangeMapping: { '4': { min: 4, max: 4 }, '6': { min: 6, max: 6 }, '8': { min: 8, max: 8 }, '10': { min: 10, max: 10 }, 'full_day': { min: 12, max: 24 } } },
  { userQuestionId: 'video_u_second_camera', providerQuestionId: 'video_p_second_camera', weight: 5, matchType: 'preference_match', preferenceMapping: { 'no': 0.5, 'extra_cost': 0.8, 'included': 1.0, 'always': 1.0 } },
  { userQuestionId: 'video_u_drone', providerQuestionId: 'video_p_drone', weight: 5, matchType: 'preference_match', preferenceMapping: { 'no': 0.3, 'extra_cost': 0.8, 'included': 1.0 } },
  { userQuestionId: 'video_u_same_day_edit', providerQuestionId: 'video_p_same_day_edit', weight: 5, matchType: 'boolean_match' },
  { userQuestionId: 'video_u_raw_footage', providerQuestionId: 'video_p_raw_footage', weight: 3, matchType: 'preference_match', preferenceMapping: { 'no': 0.5, 'extra_cost': 0.8, 'included': 1.0 } },
  { userQuestionId: 'video_u_social_reel', providerQuestionId: 'video_p_social_reel', weight: 5, matchType: 'preference_match', preferenceMapping: { 'no': 0.3, 'extra_cost': 0.8, 'included': 1.0 } },
  { userQuestionId: 'video_u_delivery_time', providerQuestionId: 'video_p_delivery_time', weight: 5, matchType: 'threshold_at_most', orderedMapping: DELIVERY_TIME_ORDER },
];

const DJ_CRITERIA: MatchCriterion[] = [
  { userQuestionId: 'dj_u_genres', providerQuestionId: 'dj_p_genres', weight: 25, matchType: 'contains' },
  { userQuestionId: 'dj_u_style', providerQuestionId: 'dj_p_styles', weight: 15, matchType: 'single_in_multiple' },
  { userQuestionId: 'dj_u_budget', providerQuestionId: 'dj_p_price_min', providerQuestionIdMax: 'dj_p_price_max', weight: 20, matchType: 'range_overlap', userRangeMapping: { 'under_400k': { min: 0, max: 400000 }, '400k_600k': { min: 400000, max: 600000 }, '600k_900k': { min: 600000, max: 900000 }, '900k_1400k': { min: 900000, max: 1400000 }, 'over_1400k': { min: 1400000, max: 5000000 } } },
  { userQuestionId: 'dj_u_hours', providerQuestionId: 'dj_p_hours_min', providerQuestionIdMax: 'dj_p_hours_max', weight: 10, matchType: 'threshold_can_accommodate', userRangeMapping: { '3': { min: 3, max: 3 }, '4': { min: 4, max: 4 }, '5': { min: 5, max: 5 }, '6': { min: 6, max: 6 }, 'unlimited': { min: 6, max: 12 } } },
  { userQuestionId: 'dj_u_ceremony_music', providerQuestionId: 'dj_p_ceremony_music', weight: 5, matchType: 'boolean_match' },
  { userQuestionId: 'dj_u_cocktail_music', providerQuestionId: 'dj_p_cocktail_music', weight: 3, matchType: 'boolean_match' },
  { userQuestionId: 'dj_u_mc', providerQuestionId: 'dj_p_mc_levels', weight: 10, matchType: 'single_in_multiple' },
  { userQuestionId: 'dj_u_lighting', providerQuestionId: 'dj_p_lighting_levels', weight: 5, matchType: 'single_in_multiple' },
  { userQuestionId: 'dj_u_effects', providerQuestionId: 'dj_p_effects', weight: 3, matchType: 'contains' },
  { userQuestionId: 'dj_u_karaoke', providerQuestionId: 'dj_p_karaoke', weight: 2, matchType: 'boolean_match' },
];

const CATERING_CRITERIA: MatchCriterion[] = [
  { userQuestionId: 'catering_u_service_type', providerQuestionId: 'catering_p_service_types', weight: 20, matchType: 'single_in_multiple' },
  { userQuestionId: 'catering_u_cuisine', providerQuestionId: 'catering_p_cuisines', weight: 15, matchType: 'contains' },
  { userQuestionId: 'catering_u_budget_pp', providerQuestionId: 'catering_p_price_pp_min', providerQuestionIdMax: 'catering_p_price_pp_max', weight: 20, matchType: 'range_overlap', userRangeMapping: { 'under_25k': { min: 0, max: 25000 }, '25k_35k': { min: 25000, max: 35000 }, '35k_50k': { min: 35000, max: 50000 }, '50k_70k': { min: 50000, max: 70000 }, 'over_70k': { min: 70000, max: 200000 } } },
  { userQuestionId: 'catering_u_guest_count', providerQuestionId: 'catering_p_guests_min', providerQuestionIdMax: 'catering_p_guests_max', weight: 10, matchType: 'threshold_can_accommodate', userRangeMapping: { 'under_50': { min: 30, max: 50 }, '50_100': { min: 50, max: 100 }, '100_150': { min: 100, max: 150 }, '150_200': { min: 150, max: 200 }, '200_300': { min: 200, max: 300 }, 'over_300': { min: 300, max: 1000 } } },
  { userQuestionId: 'catering_u_courses', providerQuestionId: 'catering_p_courses', weight: 5, matchType: 'single_in_multiple' },
  { userQuestionId: 'catering_u_cocktail', providerQuestionId: 'catering_p_cocktail', weight: 5, matchType: 'boolean_match' },
  { userQuestionId: 'catering_u_dietary', providerQuestionId: 'catering_p_dietary', weight: 5, matchType: 'contains' },
  { userQuestionId: 'catering_u_beverages', providerQuestionId: 'catering_p_beverages', weight: 5, matchType: 'contains' },
  { userQuestionId: 'catering_u_tasting', providerQuestionId: 'catering_p_tasting', weight: 3, matchType: 'preference_match', preferenceMapping: { 'yes_free': 1.0, 'yes_paid': 0.7, 'no': 0.3 } },
  { userQuestionId: 'catering_u_cake', providerQuestionId: 'catering_p_cake', weight: 5, matchType: 'exact' },
  { userQuestionId: 'catering_u_staff', providerQuestionId: 'catering_p_staff_levels', weight: 5, matchType: 'single_in_multiple' },
  { userQuestionId: 'catering_u_setup', providerQuestionId: 'catering_p_setup', weight: 2, matchType: 'boolean_match' },
];

// Mapeo de distancia para matching de zona
const DISTANCE_ORDER: Record<string, number> = {
  'within_santiago': 0,
  'santiago_only': 0,
  'up_to_1hr': 1,
  'up_to_2hr': 2,
  'over_2hr': 3,
  'no_limit': 4,
};

const VENUE_CRITERIA: MatchCriterion[] = [
  // === CRITERIOS DE ZONA Y UBICACIÓN (PRIORITARIOS - 60%) ===
  { userQuestionId: 'venue_u_zone', providerQuestionId: 'venue_p_zone', weight: 25, matchType: 'contains' },
  { userQuestionId: 'venue_u_environment', providerQuestionId: 'venue_p_environment', weight: 20, matchType: 'exact' },
  { userQuestionId: 'venue_u_travel_willingness', providerQuestionId: 'venue_p_distance_from_santiago', weight: 15, matchType: 'threshold_at_most', orderedMapping: DISTANCE_ORDER },
  // === FIN CRITERIOS DE ZONA ===
  { userQuestionId: 'venue_u_type', providerQuestionId: 'venue_p_type', weight: 8, matchType: 'contains' },
  { userQuestionId: 'venue_u_setting', providerQuestionId: 'venue_p_settings', weight: 7, matchType: 'single_in_multiple' },
  { userQuestionId: 'venue_u_budget', providerQuestionId: 'venue_p_price_min', providerQuestionIdMax: 'venue_p_price_max', weight: 12, matchType: 'range_overlap', userRangeMapping: { 'under_1m': { min: 0, max: 1000000 }, '1m_2m': { min: 1000000, max: 2000000 }, '2m_4m': { min: 2000000, max: 4000000 }, '4m_7m': { min: 4000000, max: 7000000 }, 'over_7m': { min: 7000000, max: 20000000 } } },
  // NOTA: venue_u_capacity fue eliminado - se pregunta en el wizard de registro
  { userQuestionId: 'venue_u_exclusivity', providerQuestionId: 'venue_p_exclusivity', weight: 2, matchType: 'preference_match', preferenceMapping: { 'true': 1.0, 'false': 0.0 } },
  { userQuestionId: 'venue_u_ceremony_space', providerQuestionId: 'venue_p_ceremony_space', weight: 2, matchType: 'boolean_match' },
  { userQuestionId: 'venue_u_parking', providerQuestionId: 'venue_p_parking', weight: 2, matchType: 'preference_match', preferenceMapping: { 'yes_free': 1.0, 'yes_paid': 0.8, 'valet': 0.9, 'no': 0.0 } },
  { userQuestionId: 'venue_u_accommodation', providerQuestionId: 'venue_p_accommodation', weight: 2, matchType: 'preference_match', preferenceMapping: { 'yes': 1.0, 'nearby': 0.7, 'no': 0.0 } },
  { userQuestionId: 'venue_u_catering_policy', providerQuestionId: 'venue_p_catering_policy', weight: 2, matchType: 'exact' },
  { userQuestionId: 'venue_u_end_time', providerQuestionId: 'venue_p_end_time', weight: 2, matchType: 'threshold_at_least', orderedMapping: END_TIME_ORDER },
  { userQuestionId: 'venue_u_accessibility', providerQuestionId: 'venue_p_accessibility', weight: 1, matchType: 'boolean_match' },
];
// TOTAL PESOS: 25+20+15+8+7+12+2+2+2+2+2+2+1 = 100%

const DECORATION_CRITERIA: MatchCriterion[] = [
  { userQuestionId: 'deco_u_style', providerQuestionId: 'deco_p_styles', weight: 25, matchType: 'single_in_multiple' },
  { userQuestionId: 'deco_u_colors', providerQuestionId: 'deco_p_color_expertise', weight: 15, matchType: 'contains' },
  { userQuestionId: 'deco_u_budget', providerQuestionId: 'deco_p_price_min', providerQuestionIdMax: 'deco_p_price_max', weight: 20, matchType: 'range_overlap', userRangeMapping: { 'under_500k': { min: 0, max: 500000 }, '500k_1m': { min: 500000, max: 1000000 }, '1m_2m': { min: 1000000, max: 2000000 }, '2m_4m': { min: 2000000, max: 4000000 }, 'over_4m': { min: 4000000, max: 20000000 } } },
  { userQuestionId: 'deco_u_flowers', providerQuestionId: 'deco_p_flower_types', weight: 10, matchType: 'contains' },
  { userQuestionId: 'deco_u_bridal_bouquet', providerQuestionId: 'deco_p_bridal_bouquet', weight: 5, matchType: 'boolean_match' },
  { userQuestionId: 'deco_u_ceremony_deco', providerQuestionId: 'deco_p_ceremony_deco', weight: 5, matchType: 'boolean_match' },
  { userQuestionId: 'deco_u_table_centerpieces', providerQuestionId: 'deco_p_centerpiece_types', weight: 5, matchType: 'single_in_multiple' },
  { userQuestionId: 'deco_u_table_count', providerQuestionId: 'deco_p_table_capacity', weight: 5, matchType: 'threshold_at_least', userRangeMapping: { 'under_10': { min: 5, max: 10 }, '10_20': { min: 10, max: 20 }, '20_30': { min: 20, max: 30 }, 'over_30': { min: 30, max: 100 } } },
  { userQuestionId: 'deco_u_extras', providerQuestionId: 'deco_p_extras', weight: 5, matchType: 'contains' },
  { userQuestionId: 'deco_u_rental', providerQuestionId: 'deco_p_rental', weight: 5, matchType: 'boolean_match' },
];

const WEDDING_PLANNER_CRITERIA: MatchCriterion[] = [
  { userQuestionId: 'wp_u_service_level', providerQuestionId: 'wp_p_service_levels', weight: 25, matchType: 'single_in_multiple' },
  { userQuestionId: 'wp_u_budget', providerQuestionId: 'wp_p_price_min', providerQuestionIdMax: 'wp_p_price_max', weight: 20, matchType: 'range_overlap', userRangeMapping: { 'under_500k': { min: 0, max: 500000 }, '500k_1m': { min: 500000, max: 1000000 }, '1m_2m': { min: 1000000, max: 2000000 }, '2m_4m': { min: 2000000, max: 4000000 }, 'over_4m': { min: 4000000, max: 20000000 } } },
  { userQuestionId: 'wp_u_vendor_help', providerQuestionId: 'wp_p_vendor_network', weight: 15, matchType: 'preference_match', preferenceMapping: { 'extensive': 1.0, 'moderate': 0.7, 'limited': 0.4 } },
  { userQuestionId: 'wp_u_design_help', providerQuestionId: 'wp_p_design_services', weight: 10, matchType: 'contains' },
  { userQuestionId: 'wp_u_budget_management', providerQuestionId: 'wp_p_budget_management', weight: 5, matchType: 'boolean_match' },
  { userQuestionId: 'wp_u_timeline_management', providerQuestionId: 'wp_p_timeline_management', weight: 5, matchType: 'boolean_match' },
  { userQuestionId: 'wp_u_guest_management', providerQuestionId: 'wp_p_guest_management', weight: 5, matchType: 'boolean_match' },
  { userQuestionId: 'wp_u_rehearsal', providerQuestionId: 'wp_p_rehearsal', weight: 3, matchType: 'boolean_match' },
];

const MAKEUP_CRITERIA: MatchCriterion[] = [
  { userQuestionId: 'makeup_u_style', providerQuestionId: 'makeup_p_styles', weight: 25, matchType: 'single_in_multiple' },
  { userQuestionId: 'makeup_u_budget', providerQuestionId: 'makeup_p_price_bride', weight: 20, matchType: 'range_overlap', userRangeMapping: { 'under_100k': { min: 0, max: 100000 }, '100k_200k': { min: 100000, max: 200000 }, '200k_350k': { min: 200000, max: 350000 }, 'over_350k': { min: 350000, max: 1000000 } } },
  { userQuestionId: 'makeup_u_trial', providerQuestionId: 'makeup_p_trial', weight: 10, matchType: 'preference_match', preferenceMapping: { 'yes_free': 1.0, 'yes_paid': 0.7, 'no': 0.2 } },
  { userQuestionId: 'makeup_u_hair', providerQuestionId: 'makeup_p_hair', weight: 15, matchType: 'boolean_match' },
  { userQuestionId: 'makeup_u_hair_style', providerQuestionId: 'makeup_p_hair_styles', weight: 10, matchType: 'single_in_multiple' },
  { userQuestionId: 'makeup_u_extensions', providerQuestionId: 'makeup_p_extensions', weight: 3, matchType: 'boolean_match' },
  { userQuestionId: 'makeup_u_lashes', providerQuestionId: 'makeup_p_lashes', weight: 5, matchType: 'preference_match', preferenceMapping: { 'no': 0.5, 'natural': 0.8, 'dramatic': 0.8, 'both': 1.0 } },
  { userQuestionId: 'makeup_u_touch_ups', providerQuestionId: 'makeup_p_touch_ups', weight: 4, matchType: 'exact' },
  { userQuestionId: 'makeup_u_bridesmaids', providerQuestionId: 'makeup_p_max_clients', weight: 5, matchType: 'threshold_at_least', userRangeMapping: { 'no': { min: 1, max: 1 }, 'some': { min: 2, max: 5 }, 'full': { min: 5, max: 15 } } },
];

// Criterios para ENTRETENIMIENTO
const ENTERTAINMENT_CRITERIA: MatchCriterion[] = [
  { userQuestionId: 'ent_u_type', providerQuestionId: 'ent_p_types', weight: 30, matchType: 'contains' },
  { userQuestionId: 'ent_u_moment', providerQuestionId: 'ent_p_moments', weight: 15, matchType: 'contains' },
  { userQuestionId: 'ent_u_duration', providerQuestionId: 'ent_p_duration_min', providerQuestionIdMax: 'ent_p_duration_max', weight: 10, matchType: 'threshold_can_accommodate', userRangeMapping: { '30min': { min: 30, max: 30 }, '1hr': { min: 60, max: 60 }, '2hr': { min: 120, max: 120 }, '3hr': { min: 180, max: 180 }, 'full_event': { min: 240, max: 480 }, 'flexible': { min: 30, max: 480 } } },
  { userQuestionId: 'ent_u_budget', providerQuestionId: 'ent_p_price_min', providerQuestionIdMax: 'ent_p_price_max', weight: 20, matchType: 'range_overlap', userRangeMapping: { 'under_300k': { min: 0, max: 300000 }, '300k_500k': { min: 300000, max: 500000 }, '500k_800k': { min: 500000, max: 800000 }, '800k_1500k': { min: 800000, max: 1500000 }, 'over_1500k': { min: 1500000, max: 10000000 }, 'skip': { min: 0, max: 10000000 } } },
  { userQuestionId: 'ent_u_style', providerQuestionId: 'ent_p_styles', weight: 10, matchType: 'single_in_multiple' },
  { userQuestionId: 'ent_u_audience', providerQuestionId: 'ent_p_audience', weight: 10, matchType: 'single_in_multiple' },
  { userQuestionId: 'ent_u_equipment', providerQuestionId: 'ent_p_equipment', weight: 5, matchType: 'preference_match', preferenceMapping: { 'sound': 1.0, 'lighting': 0.8, 'props': 0.7, 'stage': 0.9, 'none': 0.3 } },
];

// Criterios para TORTAS & DULCES
const CAKES_CRITERIA: MatchCriterion[] = [
  { userQuestionId: 'cakes_u_type', providerQuestionId: 'cakes_p_types', weight: 25, matchType: 'contains' },
  { userQuestionId: 'cakes_u_servings', providerQuestionId: 'cakes_p_servings_min', providerQuestionIdMax: 'cakes_p_servings_max', weight: 15, matchType: 'threshold_can_accommodate', userRangeMapping: { 'under_50': { min: 30, max: 50 }, '50_100': { min: 50, max: 100 }, '100_150': { min: 100, max: 150 }, '150_200': { min: 150, max: 200 }, 'over_200': { min: 200, max: 500 }, 'skip': { min: 30, max: 500 } } },
  { userQuestionId: 'cakes_u_tiers', providerQuestionId: 'cakes_p_tiers_max', weight: 10, matchType: 'threshold_at_least', userRangeMapping: { '1': { min: 1, max: 1 }, '2': { min: 2, max: 2 }, '3': { min: 3, max: 3 }, '4_plus': { min: 4, max: 5 }, 'no_preference': { min: 1, max: 1 } }, orderedMapping: { '1': 1, '2': 2, '3': 3, '4': 4, '5_plus': 5 } },
  { userQuestionId: 'cakes_u_flavor', providerQuestionId: 'cakes_p_flavors', weight: 15, matchType: 'contains' },
  { userQuestionId: 'cakes_u_style', providerQuestionId: 'cakes_p_styles', weight: 15, matchType: 'single_in_multiple' },
  { userQuestionId: 'cakes_u_budget', providerQuestionId: 'cakes_p_price_min', providerQuestionIdMax: 'cakes_p_price_max', weight: 15, matchType: 'range_overlap', userRangeMapping: { 'under_100k': { min: 0, max: 100000 }, '100k_200k': { min: 100000, max: 200000 }, '200k_400k': { min: 200000, max: 400000 }, '400k_600k': { min: 400000, max: 600000 }, 'over_600k': { min: 600000, max: 2000000 }, 'skip': { min: 0, max: 2000000 } } },
  { userQuestionId: 'cakes_u_dietary', providerQuestionId: 'cakes_p_dietary', weight: 5, matchType: 'contains' },
  { userQuestionId: 'cakes_u_tasting', providerQuestionId: 'cakes_p_tasting', weight: 5, matchType: 'preference_match', preferenceMapping: { 'yes_free': 1.0, 'yes_paid': 0.7, 'no': 0.2 } },
  { userQuestionId: 'cakes_u_delivery', providerQuestionId: 'cakes_p_delivery', weight: 5, matchType: 'preference_match', preferenceMapping: { 'yes_included': 1.0, 'yes_extra': 0.8, 'delivery_only': 0.6, 'no': 0.3 } },
];

// Criterios para TRANSPORTE
const TRANSPORT_CRITERIA: MatchCriterion[] = [
  { userQuestionId: 'transport_u_vehicle_type', providerQuestionId: 'transport_p_vehicle_types', weight: 25, matchType: 'single_in_multiple' },
  { userQuestionId: 'transport_u_hours', providerQuestionId: 'transport_p_hours_min', providerQuestionIdMax: 'transport_p_hours_max', weight: 20, matchType: 'threshold_can_accommodate', userRangeMapping: { '2': { min: 2, max: 2 }, '4': { min: 4, max: 4 }, '6': { min: 6, max: 6 }, '8': { min: 8, max: 8 }, 'full_day': { min: 10, max: 24 } } },
  { userQuestionId: 'transport_u_budget', providerQuestionId: 'transport_p_price_min', providerQuestionIdMax: 'transport_p_price_max', weight: 25, matchType: 'range_overlap', userRangeMapping: { 'under_200k': { min: 0, max: 200000 }, '200k_400k': { min: 200000, max: 400000 }, '400k_700k': { min: 400000, max: 700000 }, '700k_1200k': { min: 700000, max: 1200000 }, 'over_1200k': { min: 1200000, max: 5000000 }, 'skip': { min: 0, max: 5000000 } } },
  { userQuestionId: 'transport_u_decoration', providerQuestionId: 'transport_p_decoration', weight: 15, matchType: 'preference_match', preferenceMapping: { 'yes_included': 1.0, 'yes_extra': 0.8, 'no': 0.3 } },
  { userQuestionId: 'transport_u_driver', providerQuestionId: 'transport_p_driver', weight: 15, matchType: 'preference_match', preferenceMapping: { 'yes_formal': 1.0, 'yes_casual': 0.9, 'optional': 0.7, 'no': 0.3 } },
];

// Criterios para INVITACIONES
const INVITATIONS_CRITERIA: MatchCriterion[] = [
  { userQuestionId: 'inv_u_type', providerQuestionId: 'inv_p_types', weight: 25, matchType: 'contains' },
  { userQuestionId: 'inv_u_style', providerQuestionId: 'inv_p_styles', weight: 20, matchType: 'single_in_multiple' },
  { userQuestionId: 'inv_u_extras', providerQuestionId: 'inv_p_extras', weight: 15, matchType: 'contains' },
  { userQuestionId: 'inv_u_budget', providerQuestionId: 'inv_p_price_min', providerQuestionIdMax: 'inv_p_price_max', weight: 15, matchType: 'range_overlap', userRangeMapping: { 'under_100k': { min: 0, max: 1000 }, '100k_200k': { min: 1000, max: 2000 }, '200k_400k': { min: 2000, max: 4000 }, '400k_600k': { min: 4000, max: 6000 }, 'over_600k': { min: 6000, max: 50000 }, 'skip': { min: 0, max: 50000 } } },
  { userQuestionId: 'inv_u_paper', providerQuestionId: 'inv_p_papers', weight: 5, matchType: 'single_in_multiple' },
  { userQuestionId: 'inv_u_printing', providerQuestionId: 'inv_p_printing', weight: 5, matchType: 'single_in_multiple' },
  { userQuestionId: 'inv_u_timeline', providerQuestionId: 'inv_p_lead_time', weight: 10, matchType: 'threshold_at_most', orderedMapping: { '1_week': 7, '2_weeks': 14, '3_weeks': 21, '1_month': 30, '2_months': 60, '3_months': 90, 'over_1_month': 45, 'flexible': 365 } },
  { userQuestionId: 'inv_u_quantity', providerQuestionId: 'inv_p_min_quantity', weight: 5, matchType: 'threshold_at_least', userRangeMapping: { 'under_50': { min: 30, max: 50 }, '50_100': { min: 50, max: 100 }, '100_150': { min: 100, max: 150 }, '150_200': { min: 150, max: 200 }, 'over_200': { min: 200, max: 500 }, 'skip': { min: 50, max: 500 } } },
];

// Criterios para VESTIDOS & TRAJES
const DRESS_CRITERIA: MatchCriterion[] = [
  { userQuestionId: 'dress_u_need', providerQuestionId: 'dress_p_services', weight: 25, matchType: 'contains' },
  { userQuestionId: 'dress_u_bride_style', providerQuestionId: 'dress_p_bride_styles', weight: 15, matchType: 'contains' },
  { userQuestionId: 'dress_u_bride_silhouette', providerQuestionId: 'dress_p_silhouettes', weight: 10, matchType: 'contains' },
  { userQuestionId: 'dress_u_groom_style', providerQuestionId: 'dress_p_groom_styles', weight: 10, matchType: 'single_in_multiple' },
  { userQuestionId: 'dress_u_service_type', providerQuestionId: 'dress_p_service_types', weight: 15, matchType: 'single_in_multiple' },
  { userQuestionId: 'dress_u_budget_bride', providerQuestionId: 'dress_p_price_bride_min', providerQuestionIdMax: 'dress_p_price_bride_max', weight: 15, matchType: 'range_overlap', userRangeMapping: { 'under_500k': { min: 0, max: 500000 }, '500k_1m': { min: 500000, max: 1000000 }, '1m_2m': { min: 1000000, max: 2000000 }, '2m_3m': { min: 2000000, max: 3000000 }, '3m_5m': { min: 3000000, max: 5000000 }, 'over_5m': { min: 5000000, max: 20000000 }, 'skip': { min: 0, max: 20000000 } } },
  { userQuestionId: 'dress_u_budget_groom', providerQuestionId: 'dress_p_price_groom_min', providerQuestionIdMax: 'dress_p_price_groom_max', weight: 5, matchType: 'range_overlap', userRangeMapping: { 'under_200k': { min: 0, max: 200000 }, '200k_400k': { min: 200000, max: 400000 }, '400k_700k': { min: 400000, max: 700000 }, '700k_1m': { min: 700000, max: 1000000 }, 'over_1m': { min: 1000000, max: 5000000 }, 'skip': { min: 0, max: 5000000 } } },
  { userQuestionId: 'dress_u_accessories', providerQuestionId: 'dress_p_accessories', weight: 5, matchType: 'contains' },
  { userQuestionId: 'dress_u_fitting', providerQuestionId: 'dress_p_fittings', weight: 5, matchType: 'preference_match', preferenceMapping: { '1': 0.5, '2': 0.7, '3': 0.9, 'unlimited': 1.0, 'extra_cost': 0.6 } },
];

// Mapa de criterios exportado
// Todas las categorías ahora tienen criterios específicos de matchmaking
export const CATEGORY_MATCHING_CRITERIA: Record<CategoryId, MatchCriterion[]> = {
  photography: PHOTOGRAPHY_CRITERIA,
  video: VIDEO_CRITERIA,
  dj: DJ_CRITERIA,
  catering: CATERING_CRITERIA,
  venue: VENUE_CRITERIA,
  decoration: DECORATION_CRITERIA,
  wedding_planner: WEDDING_PLANNER_CRITERIA,
  makeup: MAKEUP_CRITERIA,
  entertainment: ENTERTAINMENT_CRITERIA,
  cakes: CAKES_CRITERIA,
  transport: TRANSPORT_CRITERIA,
  invitations: INVITATIONS_CRITERIA,
  dress: DRESS_CRITERIA,
};

// ============================================
// FUNCIONES DE COMPARACIÓN
// ============================================

/**
 * Calcula si un criterio específico "cumple" o "no cumple" basándose en la lógica del matchmaking
 * Esta función es usada por la UI para mostrar correctamente la comparativa
 */
export function calculateCriterionMatch(
  userValue: string | string[] | number | boolean | undefined,
  providerValue: string | string[] | number | boolean | undefined,
  providerMaxValue: string | string[] | number | boolean | undefined,
  criterion: MatchCriterion
): ComparisonResult {
  // Si el usuario no respondió, es neutral
  if (userValue === undefined || userValue === null || userValue === '') {
    return { matches: true, score: 0.5, explanation: 'Sin requisito específico' };
  }

  // Si el proveedor no respondió, es un problema
  if (providerValue === undefined || providerValue === null || providerValue === '') {
    return { matches: false, score: 0.3, explanation: 'Proveedor no especificó' };
  }

  switch (criterion.matchType) {
    case 'exact':
      return calculateExact(userValue, providerValue);
    
    case 'single_in_multiple':
      return calculateSingleInMultiple(userValue, providerValue);
    
    case 'contains':
      return calculateContains(userValue, providerValue);
    
    case 'range_overlap':
      return calculateRangeOverlap(userValue, providerValue, providerMaxValue, criterion.userRangeMapping);
    
    case 'boolean_match':
      return calculateBooleanMatch(userValue, providerValue);
    
    case 'preference_match':
      return calculatePreferenceMatch(userValue, providerValue, criterion.preferenceMapping);
    
    case 'threshold_at_least':
      return calculateThresholdAtLeast(userValue, providerValue, providerMaxValue, criterion.userRangeMapping, criterion.orderedMapping);
    
    case 'threshold_at_most':
      return calculateThresholdAtMost(userValue, providerValue, criterion.orderedMapping);
    
    case 'threshold_can_accommodate':
      return calculateThresholdCanAccommodate(userValue, providerValue, providerMaxValue, criterion.userRangeMapping);
    
    default:
      return { matches: false, score: 0.5, explanation: 'Tipo no reconocido' };
  }
}

// Coincidencia exacta
function calculateExact(
  userValue: string | string[] | number | boolean,
  providerValue: string | string[] | number | boolean
): ComparisonResult {
  const userStr = String(userValue).toLowerCase();
  const providerStr = String(providerValue).toLowerCase();
  
  // Si el usuario no tiene preferencia, cualquier opción del proveedor es perfecta
  if (userStr === 'no_preference' || userStr === 'sin preferencia' || userStr === 'flexible') {
    return { matches: true, score: 1.0, explanation: 'Sin requisito específico' };
  }
  
  // Coincidencia exacta
  if (userStr === providerStr) {
    return { matches: true, score: 1.0, explanation: 'Coincidencia exacta' };
  }
  
  // Caso especial para catering: si usuario quiere externo y proveedor lo permite
  // "external_ok" del proveedor satisface "external_ok" del usuario
  // "preferred" del proveedor (prefiere el suyo pero permite externo) también puede servir
  if (userStr === 'external_ok' && (providerStr === 'external_ok' || providerStr === 'no_catering')) {
    return { matches: true, score: 1.0, explanation: 'El proveedor permite catering externo' };
  }
  
  // Si usuario quiere solo del lugar y proveedor tiene catering exclusivo o preferido
  if (userStr === 'venue_only' && (providerStr === 'exclusive' || providerStr === 'preferred')) {
    return { matches: true, score: 1.0, explanation: 'El proveedor ofrece su propio catering' };
  }
  
  if (userStr.includes(providerStr) || providerStr.includes(userStr)) {
    return { matches: true, score: 0.7, explanation: 'Coincidencia parcial' };
  }
  
  return { matches: false, score: 0.0, explanation: 'Sin coincidencia' };
}

// Usuario elige uno, proveedor ofrece varios
function calculateSingleInMultiple(
  userValue: string | string[] | number | boolean,
  providerValue: string | string[] | number | boolean
): ComparisonResult {
  const userOption = String(userValue).toLowerCase();
  
  let providerOptions: string[];
  if (Array.isArray(providerValue)) {
    providerOptions = providerValue.map(v => String(v).toLowerCase());
  } else {
    providerOptions = [String(providerValue).toLowerCase()];
  }
  
  // Coincidencia directa
  if (providerOptions.includes(userOption)) {
    return { 
      matches: true, 
      score: 1.0, 
      explanation: 'El proveedor ofrece lo que buscas' 
    };
  }
  
  // Caso especial: proveedor ofrece "both"/"ambos" que incluye "indoor"/"outdoor"
  // Si el proveedor ofrece "both" o "ambos", cubre cualquier opción individual
  if (providerOptions.includes('both') || providerOptions.includes('ambos')) {
    // "both" cubre indoor, outdoor, y cualquier combinación
    if (['indoor', 'outdoor', 'interior', 'exterior'].includes(userOption)) {
      return { 
        matches: true, 
        score: 1.0, 
        explanation: 'El proveedor ofrece ambas opciones' 
      };
    }
  }
  
  // Caso especial: si el usuario elige "both"/"ambos", el proveedor debe ofrecer ambos
  if (userOption === 'both' || userOption === 'ambos') {
    const hasIndoor = providerOptions.includes('indoor') || providerOptions.includes('interior');
    const hasOutdoor = providerOptions.includes('outdoor') || providerOptions.includes('exterior');
    const hasBoth = providerOptions.includes('both') || providerOptions.includes('ambos');
    
    if (hasBoth || (hasIndoor && hasOutdoor)) {
      return { 
        matches: true, 
        score: 1.0, 
        explanation: 'El proveedor ofrece ambas opciones' 
      };
    }
  }
  
  return { 
    matches: false, 
    score: 0.0, 
    explanation: 'El proveedor no ofrece esta opción' 
  };
}

// Usuario elige varios, proveedor ofrece varios - verificar cobertura
// IMPORTANTE: La lógica aquí es que el PROVEEDOR debe estar DENTRO de lo que el usuario busca
// Si el usuario busca "Hacienda, Viña, Casona" y el proveedor ES "Hacienda", es 100% match
// porque el proveedor ES uno de los tipos que el usuario quiere
function calculateContains(
  userValue: string | string[] | number | boolean,
  providerValue: string | string[] | number | boolean
): ComparisonResult {
  const userArray = Array.isArray(userValue) 
    ? userValue.map(v => String(v).toLowerCase())
    : [String(userValue).toLowerCase()];
  
  const providerArray = Array.isArray(providerValue)
    ? providerValue.map(v => String(v).toLowerCase())
    : [String(providerValue).toLowerCase()];
  
  // Filtrar opciones vacías o "none"
  const filteredUserArray = userArray.filter(v => v !== 'none' && v !== '' && v !== 'no_preference');
  const filteredProviderArray = providerArray.filter(v => v !== 'none' && v !== '' && v !== 'no_preference');
  
  if (filteredUserArray.length === 0) {
    return { matches: true, score: 1.0, explanation: 'Sin requisitos específicos' };
  }
  
  // Verificar si ALGUNO de lo que ofrece el proveedor está en lo que busca el usuario
  // Esto es lo correcto: si el usuario busca varios tipos y el proveedor ES uno de ellos, es match perfecto
  const providerMatchesUserPreference = filteredProviderArray.some(pv => filteredUserArray.includes(pv));
  
  if (providerMatchesUserPreference) {
    return { 
      matches: true, 
      score: 1.0, 
      explanation: 'El proveedor ofrece lo que buscas' 
    };
  }
  
  return { 
    matches: false, 
    score: 0.0, 
    explanation: 'No coincide con tus preferencias' 
  };
}

// Superposición de rangos de presupuesto
function calculateRangeOverlap(
  userValue: string | string[] | number | boolean,
  providerMinValue: string | string[] | number | boolean,
  providerMaxValue: string | string[] | number | boolean | undefined,
  userRangeMapping?: Record<string, { min: number; max: number }>
): ComparisonResult {
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
      return { matches: true, score: 0.5, explanation: 'No se pudo interpretar el rango' };
    }
  }
  
  const providerMin = typeof providerMinValue === 'number' 
    ? providerMinValue 
    : parseFloat(String(providerMinValue)) || 0;
  
  const providerMax = providerMaxValue !== undefined
    ? (typeof providerMaxValue === 'number' ? providerMaxValue : parseFloat(String(providerMaxValue)) || providerMin)
    : providerMin * 2;
  
  // Verificar si hay superposición
  const overlapStart = Math.max(userRange.min, providerMin);
  const overlapEnd = Math.min(userRange.max, providerMax);
  
  if (overlapStart <= overlapEnd) {
    return { 
      matches: true, 
      score: 1.0, 
      explanation: 'Dentro de tu presupuesto' 
    };
  }
  
  // Calcular qué tan lejos está
  const gap = overlapStart - overlapEnd;
  const userMidpoint = (userRange.min + userRange.max) / 2;
  const gapRatio = gap / userMidpoint;
  
  if (gapRatio <= 0.2) {
    return { 
      matches: true, 
      score: 0.7, 
      explanation: 'Ligeramente fuera de tu rango' 
    };
  }
  
  return { 
    matches: false, 
    score: 0.3, 
    explanation: 'Fuera de tu presupuesto' 
  };
}

// Match booleano - si usuario lo necesita, proveedor debe ofrecerlo
function calculateBooleanMatch(
  userValue: string | string[] | number | boolean,
  providerValue: string | string[] | number | boolean
): ComparisonResult {
  const userBool = toBooleanValue(userValue);
  const providerBool = toBooleanValue(providerValue);
  
  // Si el usuario NO lo necesita, siempre es match
  if (!userBool) {
    return { matches: true, score: 1.0, explanation: 'No es un requisito' };
  }
  
  // Si el usuario lo necesita y el proveedor lo ofrece
  if (providerBool) {
    return { matches: true, score: 1.0, explanation: 'El proveedor lo ofrece' };
  }
  
  // Usuario lo necesita pero proveedor no lo ofrece
  return { matches: false, score: 0.0, explanation: 'El proveedor no lo ofrece' };
}

// Match de preferencia con mapeo de valores
function calculatePreferenceMatch(
  userValue: string | string[] | number | boolean,
  providerValue: string | string[] | number | boolean,
  preferenceMapping?: Record<string, number>
): ComparisonResult {
  const userStr = String(userValue).toLowerCase();
  const providerStr = String(providerValue).toLowerCase();
  
  // Si usuario no lo necesita
  if (userStr === 'no' || userStr === 'not_needed' || userStr === 'false') {
    return { matches: true, score: 1.0, explanation: 'No es un requisito' };
  }
  
  if (preferenceMapping && preferenceMapping[providerStr] !== undefined) {
    const score = preferenceMapping[providerStr];
    
    if (score >= 0.7) {
      return { matches: true, score, explanation: 'Cumple tu preferencia' };
    } else if (score >= 0.5) {
      return { matches: true, score, explanation: 'Cumple parcialmente' };
    }
    return { matches: false, score, explanation: 'No cumple tu preferencia' };
  }
  
  if (userStr === providerStr) {
    return { matches: true, score: 1.0, explanation: 'Coincidencia exacta' };
  }
  
  return { matches: false, score: 0.5, explanation: 'Coincidencia parcial' };
}

// Threshold: proveedor debe ofrecer AL MENOS lo que usuario pide
function calculateThresholdAtLeast(
  userValue: string | string[] | number | boolean,
  providerValue: string | string[] | number | boolean,
  providerMaxValue: string | string[] | number | boolean | undefined,
  userRangeMapping?: Record<string, { min: number; max: number }>,
  orderedMapping?: Record<string, number>
): ComparisonResult {
  // Si hay mapeo ordenado (para horarios, etc.)
  if (orderedMapping) {
    const userOrder = orderedMapping[String(userValue)] ?? 0;
    const providerOrder = orderedMapping[String(providerValue)] ?? 0;
    
    if (providerOrder >= userOrder) {
      return { matches: true, score: 1.0, explanation: 'Cumple o supera tu requisito' };
    }
    
    const diff = userOrder - providerOrder;
    const maxDiff = Math.max(...Object.values(orderedMapping));
    const score = Math.max(0, 1 - (diff / maxDiff));
    
    return { 
      matches: score >= 0.5, 
      score, 
      explanation: score >= 0.5 ? 'Casi cumple tu requisito' : 'No cumple tu requisito' 
    };
  }
  
  // Obtener valor numérico del usuario
  let userNumericValue: number;
  if (userRangeMapping && typeof userValue === 'string' && userRangeMapping[userValue]) {
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
  
  if (providerMax >= userNumericValue) {
    return { matches: true, score: 1.0, explanation: 'Puede ofrecer lo que necesitas o más' };
  }
  
  const ratio = providerMax / userNumericValue;
  return { 
    matches: ratio >= 0.7, 
    score: ratio, 
    explanation: ratio >= 0.7 ? 'Casi cumple tu requisito' : 'No alcanza tu requisito' 
  };
}

// Threshold: proveedor debe entregar ANTES de cuando usuario lo necesita
function calculateThresholdAtMost(
  userValue: string | string[] | number | boolean,
  providerValue: string | string[] | number | boolean,
  orderedMapping?: Record<string, number>
): ComparisonResult {
  if (!orderedMapping) {
    return { matches: true, score: 0.5, explanation: 'No se pudo comparar' };
  }
  
  const userOrder = orderedMapping[String(userValue)] ?? 365;
  const providerOrder = orderedMapping[String(providerValue)] ?? 365;
  
  // "flexible" del usuario significa que acepta cualquier tiempo
  if (String(userValue) === 'flexible') {
    return { matches: true, score: 1.0, explanation: 'Eres flexible con el tiempo' };
  }
  
  // Si proveedor entrega igual o ANTES
  if (providerOrder <= userOrder) {
    return { matches: true, score: 1.0, explanation: 'Entrega a tiempo o antes' };
  }
  
  // Si proveedor tarda más
  const diff = providerOrder - userOrder;
  const maxDiff = Math.max(...Object.values(orderedMapping));
  const score = Math.max(0, 1 - (diff / maxDiff) * 2);
  
  return { 
    matches: score >= 0.5, 
    score, 
    explanation: score >= 0.5 ? 'Tarda un poco más' : 'Tarda más de lo que necesitas' 
  };
}

// Threshold: proveedor debe poder acomodar lo que usuario necesita
function calculateThresholdCanAccommodate(
  userValue: string | string[] | number | boolean,
  providerValue: string | string[] | number | boolean,
  providerMaxValue: string | string[] | number | boolean | undefined,
  userRangeMapping?: Record<string, { min: number; max: number }>
): ComparisonResult {
  // Obtener lo que el usuario necesita
  let userNeeds: number;
  if (userRangeMapping && typeof userValue === 'string' && userRangeMapping[userValue]) {
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
    : providerMin * 3;
  
  // Si lo que el usuario necesita está dentro del rango del proveedor
  if (userNeeds >= providerMin && userNeeds <= providerMax) {
    return { matches: true, score: 1.0, explanation: 'Puede acomodar perfectamente' };
  }
  
  // Si el usuario necesita menos del mínimo
  if (userNeeds < providerMin) {
    const diff = providerMin - userNeeds;
    const ratio = diff / providerMin;
    const score = Math.max(0.5, 1 - ratio * 0.5);
    return { 
      matches: true, 
      score, 
      explanation: 'El proveedor hace más de lo necesario, pero podría adaptarse' 
    };
  }
  
  // Si el usuario necesita más del máximo
  if (userNeeds > providerMax) {
    const ratio = providerMax / userNeeds;
    return { 
      matches: ratio >= 0.7, 
      score: ratio, 
      explanation: ratio >= 0.7 ? 'Cubre la mayor parte' : 'No puede cubrir todo lo que necesitas' 
    };
  }
  
  return { matches: true, score: 0.5, explanation: 'Compatibilidad parcial' };
}

// Utilidad para convertir valores a booleano
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
 * Obtiene el criterio de matching para una pregunta específica
 */
export function getCriterionForQuestion(
  category: CategoryId,
  userQuestionId: string
): MatchCriterion | undefined {
  const criteria = CATEGORY_MATCHING_CRITERIA[category];
  if (!criteria) return undefined;
  
  return criteria.find(c => c.userQuestionId === userQuestionId);
}

/**
 * Encuentra la pregunta del proveedor correspondiente a una pregunta del usuario
 */
export function findProviderQuestionForUser(
  category: CategoryId,
  userQuestionId: string
): { providerQuestionId: string; providerQuestionIdMax?: string; matchType: MatchType } | undefined {
  const criterion = getCriterionForQuestion(category, userQuestionId);
  if (!criterion) return undefined;
  
  return {
    providerQuestionId: criterion.providerQuestionId,
    providerQuestionIdMax: criterion.providerQuestionIdMax,
    matchType: criterion.matchType,
  };
}

