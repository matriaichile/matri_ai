/**
 * Script para poblar la base de datos con datos de prueba
 * 
 * USO:
 *   node scripts/seed-database.mjs [opciones]
 * 
 * OPCIONES:
 *   --providers    Solo crear proveedores
 *   --users        Solo crear usuarios
 *   --surveys      Solo crear encuestas (requiere usuarios y proveedores existentes)
 *   --leads        Solo crear leads (requiere encuestas completadas)
 *   --all          Crear todo (default)
 *   --clean        Limpiar datos existentes antes de crear
 * 
 * REQUISITOS:
 *   - Variables de entorno de Firebase Admin configuradas
 * 
 * SISTEMA DE MATCHMAKING POR CATEGORÍA:
 *   Este script genera datos para el sistema de matchmaking por categoría:
 *   1. Usuarios con información general del evento
 *   2. Proveedores con sus categorías y límites de leads por categoría
 *   3. Encuestas de usuarios por categoría (userCategorySurveys)
 *   4. Encuestas de proveedores por categoría (providerCategorySurveys)
 *   5. Leads/Matches por categoría específica
 * 
 * PARA LIMPIAR Y POBLAR DE NUEVO:
 *   node scripts/seed-database.mjs --clean --all
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

// ============================================
// CONFIGURACIÓN
// ============================================

const DEFAULT_PASSWORD = '123123';
const NUM_PROVIDERS = 24; // Debe ser >= PROVIDER_TEMPLATES.length para cubrir todas las categorías (3 por categoría)
const NUM_USERS = 12;
const LEADS_PER_CATEGORY = 3; // 3 matches por categoría por usuario

// ⚠️ IDENTIFICADOR ÚNICO PARA DATOS DUMMY
const DUMMY_BATCH_ID = `dummy_${new Date().toISOString().split('T')[0]}_${Date.now()}`;

// ============================================
// CATEGORÍAS DEL SISTEMA
// ============================================

const CATEGORIES = {
  photography: { id: 'photography', name: 'Fotografía' },
  video: { id: 'video', name: 'Videografía' },
  dj: { id: 'dj', name: 'DJ/VJ' },
  catering: { id: 'catering', name: 'Banquetería' },
  venue: { id: 'venue', name: 'Centro de Eventos' },
  decoration: { id: 'decoration', name: 'Decoración' },
  wedding_planner: { id: 'wedding_planner', name: 'Wedding Planner' },
  makeup: { id: 'makeup', name: 'Maquillaje & Peinado' },
};

const CATEGORY_IDS = Object.keys(CATEGORIES);

// ============================================
// DATOS DE PRUEBA - PROVEEDORES
// ============================================

const PROVIDER_TEMPLATES = [
  // Fotografía (3)
  { name: 'Fotografía Elegante', categories: ['photography'], style: 'artistic', price: 'premium' },
  { name: 'Momentos Studio', categories: ['photography', 'video'], style: 'documentary', price: 'mid' },
  { name: 'Captura Perfecta', categories: ['photography'], style: 'classic', price: 'mid' },
  // Video (3)
  { name: 'Cinema Wedding Films', categories: ['video'], style: 'cinematic', price: 'premium' },
  { name: 'Recuerdos en Video', categories: ['video'], style: 'documentary', price: 'budget' },
  { name: 'Filmarte Bodas', categories: ['video'], style: 'artistic', price: 'mid' },
  // DJ (3)
  { name: 'DJ Master Events', categories: ['dj'], style: 'modern', price: 'mid' },
  { name: 'Ritmo & Fiesta DJs', categories: ['dj'], style: 'traditional', price: 'budget' },
  { name: 'Sound Premium', categories: ['dj'], style: 'modern', price: 'premium' },
  // Banquetería (3)
  { name: 'Banquetería Gourmet', categories: ['catering'], style: 'traditional', price: 'premium' },
  { name: 'Sabores del Sur', categories: ['catering'], style: 'modern', price: 'mid' },
  { name: 'Chef Eventos', categories: ['catering'], style: 'modern', price: 'budget' },
  // Venues (3)
  { name: 'Hacienda Los Robles', categories: ['venue'], style: 'traditional', price: 'luxury' },
  { name: 'Espacio Urbano Loft', categories: ['venue'], style: 'modern', price: 'premium' },
  { name: 'Jardín Secreto', categories: ['venue'], style: 'artistic', price: 'mid' },
  // Decoración (3)
  { name: 'Flores & Sueños', categories: ['decoration'], style: 'artistic', price: 'mid' },
  { name: 'Deco Elegance', categories: ['decoration'], style: 'classic', price: 'premium' },
  { name: 'Ambientes Mágicos', categories: ['decoration'], style: 'modern', price: 'budget' },
  // Wedding Planner (3)
  { name: 'Wedding Dreams Planner', categories: ['wedding_planner'], style: 'modern', price: 'luxury' },
  { name: 'Tu Boda Perfecta', categories: ['wedding_planner'], style: 'traditional', price: 'mid' },
  { name: 'Organiza Tu Día', categories: ['wedding_planner'], style: 'modern', price: 'budget' },
  // Maquillaje (3)
  { name: 'Belleza Nupcial', categories: ['makeup'], style: 'editorial', price: 'premium' },
  { name: 'Glam Studio', categories: ['makeup'], style: 'glamorous', price: 'mid' },
  { name: 'Natural Beauty', categories: ['makeup'], style: 'natural', price: 'budget' },
];

const PROVIDER_DESCRIPTIONS = [
  'Capturamos los momentos más especiales de tu día con un enfoque artístico y emocional. Más de 10 años de experiencia en bodas.',
  'Equipo profesional dedicado a crear recuerdos inolvidables. Estilo natural y espontáneo que refleja la esencia de cada pareja.',
  'La mejor música para tu celebración. Equipos de última generación y animación profesional para una fiesta inolvidable.',
  'Experiencias gastronómicas únicas. Menús personalizados con los mejores ingredientes locales y presentación impecable.',
  'Un espacio mágico para tu celebración. Jardines hermosos, salones elegantes y atención personalizada.',
  'Transformamos espacios en escenarios de ensueño. Decoración floral y ambientación para bodas únicas.',
  'Películas de boda cinematográficas que cuentan tu historia de amor de manera única y emocionante.',
  'Planificamos cada detalle de tu boda para que solo te preocupes de disfrutar. Experiencia y dedicación.',
  'Maquillaje y peinado profesional para novias. Resaltamos tu belleza natural en el día más importante.',
  'Servicio premium con atención personalizada. Nos adaptamos a tu visión y la hacemos realidad.',
];

const REGIONS = ['rm', 'valparaiso', 'ohiggins', 'maule', 'biobio', 'araucania', 'los_lagos', 'coquimbo'];

// ============================================
// DATOS DE PRUEBA - USUARIOS (NOVIOS)
// ============================================

const COUPLE_NAMES = [
  'María & Juan',
  'Camila & Pedro',
  'Valentina & Diego',
  'Sofía & Sebastián',
  'Isidora & Matías',
  'Antonia & Felipe',
  'Catalina & Nicolás',
  'Fernanda & Andrés',
  'Javiera & Tomás',
  'Constanza & Ignacio',
  'Francisca & Cristóbal',
  'Martina & Vicente',
];

const BUDGET_OPTIONS = ['5m_10m', '10m_15m', '15m_20m', '20m_30m', '30m_50m', 'over_50m'];
const GUEST_OPTIONS = ['intimate', 'small', 'medium', 'large', 'xlarge'];
const CEREMONY_OPTIONS = ['civil', 'religious', 'symbolic'];
const EVENT_STYLES = ['classic', 'rustic', 'modern', 'romantic', 'glamorous', 'vintage'];
const PLANNING_PROGRESS = ['nothing', 'little', 'half', 'most'];
const INVOLVEMENT_LEVELS = ['100', '80', '60', '40'];

// ============================================
// RESPUESTAS DE ENCUESTAS POR CATEGORÍA
// ============================================

// Respuestas posibles para usuarios por categoría
const USER_SURVEY_RESPONSES = {
  photography: {
    photo_u_style: ['documentary', 'artistic', 'classic', 'editorial', 'candid', 'cinematic'],
    photo_u_hours: ['4', '6', '8', '10', 'full_day'],
    photo_u_budget: ['under_500k', '500k_800k', '800k_1200k', '1200k_1800k', 'over_1800k'],
    photo_u_preboda: [true, false],
    photo_u_postboda: [true, false],
    photo_u_second_shooter: ['no', 'preferred', 'required'],
    photo_u_delivery_time: ['2_weeks', '1_month', '2_months', '3_months', 'flexible'],
    photo_u_delivery_format: [['digital_hd'], ['digital_hd', 'printed_album'], ['digital_hd', 'online_gallery']],
    photo_u_photo_count: ['under_200', '200_400', '400_600', 'over_600', 'unlimited'],
    photo_u_retouching: ['natural', 'moderate', 'editorial'],
  },
  video: {
    video_u_style: ['documentary', 'cinematic', 'narrative', 'traditional', 'artistic'],
    video_u_duration: ['highlight_3', 'highlight_10', 'medium_20', 'full_45', 'full_extended'],
    video_u_budget: ['under_600k', '600k_1000k', '1000k_1500k', '1500k_2500k', 'over_2500k'],
    video_u_hours: ['4', '6', '8', '10', 'full_day'],
    video_u_second_camera: ['no', 'preferred', 'required'],
    video_u_drone: ['no', 'nice_to_have', 'required'],
    video_u_same_day_edit: [true, false],
    video_u_social_reel: [true, false],
  },
  dj: {
    dj_u_genres: [['reggaeton', 'pop'], ['cumbia', 'salsa', 'bachata'], ['rock', '80s_90s'], ['electronic', 'pop'], ['romantic', 'jazz']],
    dj_u_style: ['elegant', 'party', 'mixed', 'chill'],
    dj_u_budget: ['under_400k', '400k_600k', '600k_900k', '900k_1400k', 'over_1400k'],
    dj_u_hours: ['3', '4', '5', '6', 'unlimited'],
    dj_u_ceremony_music: [true, false],
    dj_u_mc: ['no', 'minimal', 'moderate', 'full'],
    dj_u_lighting: ['basic', 'standard', 'premium', 'custom'],
    dj_u_effects: [['fog'], ['cold_sparks', 'laser'], ['none'], ['fog', 'confetti']],
  },
  catering: {
    catering_u_service_type: ['plated', 'buffet', 'stations', 'cocktail', 'family_style'],
    catering_u_cuisine: [['chilean'], ['international', 'gourmet'], ['mediterranean'], ['asian', 'international']],
    catering_u_budget_pp: ['under_25k', '25k_35k', '35k_50k', '50k_70k', 'over_70k'],
    catering_u_guest_count: ['under_50', '50_100', '100_150', '150_200', '200_300', 'over_300'],
    catering_u_courses: ['2', '3', '4', '5_plus'],
    catering_u_cocktail: [true, false],
    catering_u_dietary: [['none'], ['vegetarian'], ['vegetarian', 'gluten_free'], ['vegan']],
    catering_u_beverages: [['soft_drinks', 'wine'], ['wine', 'beer', 'cocktails'], ['open_bar'], ['premium_liquor', 'open_bar']],
    catering_u_tasting: ['required', 'preferred', 'not_needed'],
  },
  venue: {
    venue_u_type: ['hacienda', 'hotel', 'restaurant', 'garden', 'beach', 'winery', 'loft', 'mansion'],
    venue_u_setting: ['indoor', 'outdoor', 'both', 'flexible'],
    venue_u_budget: ['under_1m', '1m_2m', '2m_4m', '4m_7m', 'over_7m'],
    venue_u_capacity: ['under_50', '50_100', '100_150', '150_200', '200_300', 'over_300'],
    venue_u_exclusivity: ['required', 'preferred', 'not_needed'],
    venue_u_ceremony_space: [true, false],
    venue_u_parking: ['required', 'preferred', 'not_needed'],
    venue_u_end_time: ['midnight', '2am', '4am', 'sunrise', 'flexible'],
  },
  decoration: {
    deco_u_style: ['romantic', 'rustic', 'modern', 'classic', 'bohemian', 'tropical', 'vintage', 'glamorous'],
    deco_u_colors: [['white_green'], ['pastels'], ['bold'], ['earth'], ['jewel'], ['custom']],
    deco_u_budget: ['under_500k', '500k_1m', '1m_2m', '2m_4m', 'over_4m'],
    deco_u_flowers: [['roses'], ['peonies', 'hydrangeas'], ['eucalyptus', 'wildflowers'], ['tropical'], ['dried']],
    deco_u_bridal_bouquet: [true, false],
    deco_u_ceremony_deco: [true, false],
    deco_u_table_centerpieces: ['low', 'tall', 'mixed', 'non_floral', 'no_preference'],
    deco_u_extras: [['arch'], ['backdrop', 'candles'], ['hanging'], ['neon'], ['none']],
  },
  wedding_planner: {
    wp_u_service_level: ['full', 'partial', 'day_of', 'consultation'],
    wp_u_budget: ['under_500k', '500k_1m', '1m_2m', '2m_4m', 'over_4m'],
    wp_u_months_until: ['under_3', '3_6', '6_12', 'over_12'],
    wp_u_vendor_help: ['all', 'some', 'none'],
    wp_u_design_help: ['full', 'guidance', 'none'],
    wp_u_budget_management: [true, false],
    wp_u_timeline_management: [true, false],
    wp_u_guest_management: [true, false],
  },
  makeup: {
    makeup_u_style: ['natural', 'classic', 'glamorous', 'editorial', 'romantic', 'boho'],
    makeup_u_budget: ['under_100k', '100k_200k', '200k_350k', 'over_350k'],
    makeup_u_trial: ['required', 'preferred', 'not_needed'],
    makeup_u_hair: [true, false],
    makeup_u_hair_style: ['updo', 'half_up', 'down', 'braids', 'undecided'],
    makeup_u_lashes: ['no', 'natural', 'dramatic', 'undecided'],
    makeup_u_bridesmaids: ['no', 'some', 'full'],
    makeup_u_touch_ups: ['no', 'kit', 'person'],
  },
};

// Respuestas posibles para proveedores por categoría
// IMPORTANTE: Estas respuestas deben coincidir con los IDs de las preguntas en src/lib/surveys/
const PROVIDER_SURVEY_RESPONSES = {
  photography: {
    // Estilos que ofrece (multiple) - debe coincidir con photo_u_style opciones
    photo_p_styles: [
      ['documentary', 'artistic', 'candid'], 
      ['classic', 'editorial', 'cinematic'], 
      ['candid', 'documentary', 'artistic'], 
      ['cinematic', 'artistic', 'editorial'],
      ['documentary', 'classic', 'candid'],
      ['artistic', 'classic', 'editorial']
    ],
    photo_p_hours_min: [4, 6, 8],
    photo_p_hours_max: [8, 10, 12, 24],
    // Precios en rangos que coincidan con las opciones del usuario
    photo_p_price_min: [300000, 450000, 700000, 1000000, 1500000],
    photo_p_price_max: [700000, 1000000, 1500000, 2200000, 3500000],
    photo_p_preboda: [true, true, true, false], // Mayoría ofrece
    photo_p_postboda: [true, true, false, false],
    photo_p_second_shooter: ['extra_cost', 'included', 'always', 'no'],
    photo_p_delivery_time: ['2_weeks', '1_month', '2_months', '3_months'],
    photo_p_delivery_formats: [
      ['digital_hd', 'online_gallery'], 
      ['digital_hd', 'printed_album', 'usb_box', 'online_gallery'], 
      ['digital_hd', 'digital_raw', 'online_gallery'],
      ['digital_hd', 'printed_album', 'online_gallery']
    ],
    photo_p_photo_count_min: [150, 200, 300, 400, 500],
    photo_p_photo_count_max: [400, 600, 800, 1000, 1500],
    photo_p_retouching_levels: [
      ['natural', 'moderate'], 
      ['natural', 'moderate', 'editorial'], 
      ['moderate', 'editorial'], 
      ['natural', 'moderate', 'editorial']
    ],
    photo_p_travel: [true, true, true, false],
    photo_p_experience_years: [3, 5, 7, 10, 12, 15],
  },
  video: {
    // Estilos de video (multiple) - debe coincidir con video_u_style opciones
    video_p_styles: [
      ['documentary', 'cinematic', 'narrative'], 
      ['narrative', 'artistic', 'cinematic'], 
      ['traditional', 'documentary', 'cinematic'], 
      ['cinematic', 'artistic', 'documentary'],
      ['documentary', 'traditional', 'narrative']
    ],
    // Duraciones (multiple) - debe coincidir con video_u_duration opciones
    video_p_durations: [
      ['highlight_3', 'highlight_10', 'medium_20'], 
      ['highlight_10', 'medium_20', 'full_45'], 
      ['medium_20', 'full_45', 'full_extended'], 
      ['highlight_3', 'highlight_10', 'medium_20', 'full_45']
    ],
    video_p_price_min: [400000, 550000, 800000, 1200000, 1800000],
    video_p_price_max: [900000, 1300000, 2000000, 3000000, 5000000],
    video_p_hours_min: [4, 6, 6, 8],
    video_p_hours_max: [8, 10, 12, 24],
    video_p_second_camera: ['extra_cost', 'included', 'always', 'no'],
    video_p_drone: ['extra_cost', 'included', 'included', 'no'],
    video_p_same_day_edit: [true, true, false, false],
    video_p_raw_footage: ['extra_cost', 'included', 'no', 'extra_cost'],
    video_p_social_reel: ['included', 'extra_cost', 'included', 'no'],
    video_p_delivery_time: ['1_month', '2_months', '2_months', '3_months'],
    video_p_equipment: [
      ['4k', 'gimbal', 'slider'],
      ['4k', 'cinema_camera', 'gimbal', 'slider', 'lighting'],
      ['cinema_camera', 'gimbal', 'crane', 'lighting'],
      ['4k', 'gimbal', 'slider', 'lighting']
    ],
  },
  dj: {
    // Géneros que domina (multiple) - debe coincidir con dj_u_genres opciones
    dj_p_genres: [
      ['reggaeton', 'pop', 'pop_latino', 'cumbia', 'salsa', 'bachata'], 
      ['salsa', 'bachata', 'romantic', 'jazz', 'cumbia'], 
      ['rock', '80s_90s', 'electronic', 'pop', 'disco'], 
      ['pop', 'pop_latino', 'disco', 'jazz', 'romantic'],
      ['reggaeton', 'cumbia', 'salsa', 'bachata', '80s_90s'],
      ['electronic', 'pop', 'disco', 'reggaeton', 'pop_latino']
    ],
    // Estilos que maneja (multiple) - debe coincidir con dj_u_style opciones
    dj_p_styles: [
      ['elegant', 'mixed', 'party'], 
      ['party', 'mixed'], 
      ['elegant', 'chill', 'mixed'], 
      ['party', 'mixed', 'elegant'],
      ['mixed', 'party'],
      ['elegant', 'mixed', 'chill']
    ],
    dj_p_price_min: [250000, 350000, 500000, 700000, 1000000],
    dj_p_price_max: [550000, 800000, 1200000, 1600000, 2500000],
    dj_p_hours_min: [3, 4, 4, 5],
    dj_p_hours_max: [6, 8, 10, 12],
    dj_p_ceremony_music: [true, true, true, false],
    dj_p_cocktail_music: [true, true, true, false],
    // MC levels (multiple) - debe coincidir con dj_u_mc opciones
    dj_p_mc_levels: [
      ['no', 'minimal', 'moderate'], 
      ['minimal', 'moderate', 'full'], 
      ['moderate', 'full'], 
      ['no', 'minimal', 'moderate', 'full']
    ],
    // Lighting levels (multiple) - debe coincidir con dj_u_lighting opciones
    dj_p_lighting_levels: [
      ['basic', 'standard', 'premium'], 
      ['standard', 'premium', 'custom'], 
      ['premium', 'custom'], 
      ['basic', 'standard', 'premium', 'custom']
    ],
    // Effects (multiple) - debe coincidir con dj_u_effects opciones
    dj_p_effects: [
      ['fog', 'confetti'], 
      ['fog', 'laser', 'cold_sparks'], 
      ['cold_sparks', 'confetti', 'bubbles'], 
      ['fog', 'cold_sparks', 'laser', 'confetti', 'bubbles']
    ],
    dj_p_karaoke: [true, true, false, false],
    dj_p_screens: ['no', 'one', 'multiple', 'multiple'],
    dj_p_equipment_sound: [
      ['small_100', 'medium_200', 'wireless_mic'],
      ['medium_200', 'large_400', 'subwoofer', 'wireless_mic'],
      ['large_400', 'xlarge', 'subwoofer', 'wireless_mic'],
      ['medium_200', 'large_400', 'wireless_mic']
    ],
  },
  catering: {
    catering_p_service_types: [['plated', 'buffet'], ['stations', 'cocktail'], ['plated', 'buffet', 'stations'], ['family_style', 'buffet']],
    catering_p_cuisines: [['chilean', 'international'], ['gourmet', 'mediterranean'], ['asian', 'international'], ['chilean', 'comfort']],
    catering_p_price_pp_min: [15000, 25000, 35000, 50000],
    catering_p_price_pp_max: [35000, 50000, 70000, 100000],
    catering_p_guests_min: [30, 50, 80, 100],
    catering_p_guests_max: [150, 200, 300, 500],
    catering_p_courses: [['2', '3'], ['3', '4'], ['4', '5_plus'], ['2', '3', '4']],
    catering_p_cocktail: [true, false],
    catering_p_dietary: [['vegetarian'], ['vegetarian', 'vegan'], ['vegetarian', 'gluten_free'], ['vegetarian', 'vegan', 'gluten_free']],
    catering_p_beverages: [['soft_drinks', 'wine'], ['wine', 'beer', 'cocktails'], ['open_bar'], ['soft_drinks', 'wine', 'beer', 'cocktails', 'open_bar']],
    catering_p_tasting: ['yes_free', 'yes_paid', 'no'],
  },
  venue: {
    venue_p_type: ['hacienda', 'hotel', 'restaurant', 'garden', 'beach', 'winery', 'loft', 'mansion'],
    venue_p_settings: [['indoor'], ['outdoor'], ['indoor', 'outdoor'], ['both']],
    venue_p_price_min: [500000, 1000000, 2000000, 4000000],
    venue_p_price_max: [2000000, 4000000, 7000000, 15000000],
    venue_p_capacity_min: [30, 50, 80, 100],
    venue_p_capacity_max: [150, 200, 300, 500],
    venue_p_exclusivity: [true, false],
    venue_p_ceremony_space: [true, false],
    venue_p_parking: ['yes_free', 'yes_paid', 'valet', 'no'],
    venue_p_end_time: ['midnight', '2am', '4am', 'sunrise', 'flexible'],
    venue_p_catering_policy: ['exclusive', 'preferred', 'external_ok', 'no_catering'],
  },
  decoration: {
    deco_p_styles: [['romantic', 'classic'], ['rustic', 'bohemian'], ['modern', 'glamorous'], ['vintage', 'romantic']],
    deco_p_color_expertise: [['white_green', 'pastels'], ['earth', 'rustic'], ['bold', 'jewel'], ['custom']],
    deco_p_price_min: [300000, 500000, 1000000, 2000000],
    deco_p_price_max: [1000000, 2000000, 4000000, 8000000],
    deco_p_flower_types: [['roses', 'peonies'], ['eucalyptus', 'wildflowers'], ['hydrangeas', 'roses'], ['tropical', 'dried']],
    deco_p_bridal_bouquet: [true, false],
    deco_p_ceremony_deco: [true, false],
    deco_p_centerpiece_types: [['low', 'tall'], ['mixed'], ['non_floral', 'low'], ['low', 'tall', 'mixed']],
    deco_p_extras: [['arch', 'backdrop'], ['candles', 'neon'], ['hanging'], ['arch', 'backdrop', 'candles']],
    deco_p_rental: [true, false],
  },
  wedding_planner: {
    wp_p_service_levels: [['full', 'partial'], ['day_of', 'consultation'], ['full', 'partial', 'day_of'], ['partial', 'day_of']],
    wp_p_price_min: [300000, 500000, 1000000, 2000000],
    wp_p_price_max: [1000000, 2000000, 4000000, 8000000],
    wp_p_lead_time_min: ['under_3', '3_6', '6_12'],
    wp_p_vendor_network: ['extensive', 'moderate', 'limited'],
    wp_p_design_services: [['full', 'guidance'], ['moodboards'], ['full', 'guidance', 'moodboards'], ['none']],
    wp_p_budget_management: [true, false],
    wp_p_timeline_management: [true, false],
    wp_p_guest_management: [true, false],
    wp_p_team_size: ['1', '2', '3_plus'],
  },
  makeup: {
    makeup_p_styles: [['natural', 'classic'], ['glamorous', 'editorial'], ['romantic', 'boho'], ['natural', 'classic', 'glamorous']],
    makeup_p_price_bride: [80000, 150000, 250000, 350000],
    makeup_p_price_bridesmaid: [40000, 60000, 80000, 100000],
    makeup_p_trial: ['yes_free', 'yes_paid', 'no'],
    makeup_p_hair: [true, false],
    makeup_p_hair_styles: [['updo', 'half_up'], ['down', 'braids'], ['updo', 'half_up', 'down'], ['half_up', 'braids']],
    makeup_p_lashes: ['no', 'natural', 'dramatic', 'both'],
    makeup_p_team_size: ['1', '2', '3_plus'],
    makeup_p_max_clients: [3, 5, 8, 10],
    makeup_p_touch_ups: ['no', 'kit', 'person'],
    makeup_p_location: [['home', 'venue'], ['salon'], ['home', 'salon', 'venue']],
  },
};

// ============================================
// UTILIDADES
// ============================================

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.magenta}→${colors.reset} ${msg}`),
};

// Cargar variables de entorno
function loadEnvFile() {
  const envFiles = ['.env.local', '.env'];
  
  for (const envFile of envFiles) {
    const envPath = resolve(projectRoot, envFile);
    if (existsSync(envPath)) {
      const content = readFileSync(envPath, 'utf-8');
      const lines = content.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            let value = valueParts.join('=');
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            process.env[key.trim()] = value;
          }
        }
      }
      return envFile;
    }
  }
  return null;
}

// Obtener service account
function getServiceAccount() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKeyBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;

  if (projectId && clientEmail && privateKeyBase64) {
    try {
      const cleanBase64 = privateKeyBase64.trim().replace(/^["']|["']$/g, '');
      let privateKey = Buffer.from(cleanBase64, 'base64').toString('utf-8');
      privateKey = privateKey.replace(/\\n/g, '\n');
      
      return {
        type: 'service_account',
        project_id: projectId,
        private_key: privateKey,
        client_email: clientEmail,
      };
    } catch (error) {
      log.error(`Error al decodificar private key: ${error.message}`);
      return null;
    }
  }

  const filePath = resolve(projectRoot, 'service-account.json');
  if (existsSync(filePath)) {
    const jsonString = readFileSync(filePath, 'utf-8');
    return JSON.parse(jsonString);
  }

  return null;
}

// Funciones de utilidad
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomItems(arr, min = 1, max = 3) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomDate(startMonths = 3, endMonths = 18) {
  const now = new Date();
  const start = new Date(now.getTime() + startMonths * 30 * 24 * 60 * 60 * 1000);
  const end = new Date(now.getTime() + endMonths * 30 * 24 * 60 * 60 * 1000);
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

function generatePhone() {
  const prefix = '+56 9';
  const number = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix} ${number.toString().slice(0, 4)} ${number.toString().slice(4)}`;
}

// Generar respuestas de encuesta aleatorias
function generateUserSurveyResponses(category) {
  const template = USER_SURVEY_RESPONSES[category];
  if (!template) return {};
  
  const responses = {};
  for (const [key, options] of Object.entries(template)) {
    responses[key] = randomItem(options);
  }
  return responses;
}

function generateProviderSurveyResponses(category) {
  const template = PROVIDER_SURVEY_RESPONSES[category];
  if (!template) return {};
  
  const responses = {};
  for (const [key, options] of Object.entries(template)) {
    responses[key] = randomItem(options);
  }
  return responses;
}

// Calcular match score basado en respuestas
function calculateMatchScore(userResponses, providerResponses, category) {
  // Simulación simplificada del cálculo de match
  // En producción, esto sería más complejo basado en los criterios de CATEGORY_SURVEYS.md
  let baseScore = 70 + Math.floor(Math.random() * 25); // 70-95
  
  // Bonus por coincidencias específicas (simplificado)
  if (category === 'photography') {
    if (userResponses.photo_u_style && providerResponses.photo_p_styles?.includes(userResponses.photo_u_style)) {
      baseScore = Math.min(99, baseScore + 5);
    }
  }
  
  return baseScore;
}

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

async function createProviders(auth, db) {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.yellow}  Creando ${NUM_PROVIDERS} Proveedores${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  const createdProviders = [];

  for (let i = 0; i < NUM_PROVIDERS; i++) {
    const providerData = PROVIDER_TEMPLATES[i % PROVIDER_TEMPLATES.length];
    const email = `provider${i + 1}@test.matri.ai`;
    
    try {
      // Verificar si el usuario ya existe
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(email);
        log.warn(`Usuario ${email} ya existe, actualizando...`);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          userRecord = await auth.createUser({
            email,
            password: DEFAULT_PASSWORD,
            displayName: providerData.name,
          });
          log.success(`Auth creado: ${email}`);
        } else {
          throw error;
        }
      }

      const region = randomItem(REGIONS);
      
      // Crear límites y contadores de leads por categoría
      const categoryLeadLimits = {};
      const categoryLeadsUsed = {};
      const categorySurveyStatus = {};
      
      for (const cat of providerData.categories) {
        categoryLeadLimits[cat] = 10; // 10 leads por categoría
        categoryLeadsUsed[cat] = 0;
        categorySurveyStatus[cat] = 'not_started';
      }

      const providerDoc = {
        id: userRecord.uid,
        type: 'provider',
        email,
        providerName: providerData.name,
        phone: generatePhone(),
        categories: providerData.categories,
        serviceStyle: providerData.style,
        priceRange: providerData.price,
        workRegion: region,
        acceptsOutsideZone: Math.random() > 0.3,
        description: PROVIDER_DESCRIPTIONS[i % PROVIDER_DESCRIPTIONS.length],
        website: `https://www.${providerData.name.toLowerCase().replace(/\s+/g, '')}.cl`,
        instagram: `@${providerData.name.toLowerCase().replace(/\s+/g, '_')}`,
        facebook: '',
        tiktok: '',
        portfolioImages: [],
        status: 'active', // Todos activos para testing
        // Sistema de leads POR CATEGORÍA
        categoryLeadLimits,
        categoryLeadsUsed,
        categorySurveyStatus,
        // Campos legacy para compatibilidad
        leadLimit: 10,
        leadsUsed: 0,
        // Campos de prueba
        isDummy: true,
        dummyBatch: DUMMY_BATCH_ID,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      await db.collection('providers').doc(userRecord.uid).set(providerDoc);
      log.success(`Proveedor creado: ${providerData.name} (${providerData.categories.join(', ')}) - ${region}`);

      createdProviders.push({
        uid: userRecord.uid,
        ...providerDoc,
      });

    } catch (error) {
      log.error(`Error creando proveedor ${providerData.name}: ${error.message}`);
    }
  }

  return createdProviders;
}

async function createUsers(auth, db) {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.yellow}  Creando ${NUM_USERS} Usuarios (Novios)${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  const createdUsers = [];

  for (let i = 0; i < NUM_USERS; i++) {
    const coupleName = COUPLE_NAMES[i % COUPLE_NAMES.length];
    const email = `user${i + 1}@test.matri.ai`;
    
    try {
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(email);
        log.warn(`Usuario ${email} ya existe, actualizando...`);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          userRecord = await auth.createUser({
            email,
            password: DEFAULT_PASSWORD,
            displayName: coupleName,
          });
          log.success(`Auth creado: ${email}`);
        } else {
          throw error;
        }
      }

      const region = randomItem(REGIONS);
      
      // Estado de encuestas por categoría (todas empiezan en not_started)
      const categorySurveyStatus = {};
      for (const cat of CATEGORY_IDS) {
        categorySurveyStatus[cat] = 'not_started';
      }

      const userDoc = {
        id: userRecord.uid,
        type: 'user',
        email,
        coupleNames: coupleName,
        phone: generatePhone(),
        eventDate: randomDate(),
        isDateTentative: Math.random() > 0.5,
        budget: randomItem(BUDGET_OPTIONS),
        guestCount: randomItem(GUEST_OPTIONS),
        region,
        ceremonyTypes: randomItems(CEREMONY_OPTIONS, 1, 2),
        eventStyle: randomItem(EVENT_STYLES),
        planningProgress: randomItem(PLANNING_PROGRESS),
        completedItems: randomItems(['dj', 'photography', 'video', 'venue', 'catering'], 0, 2),
        priorityCategories: randomItems(CATEGORY_IDS, 3, 6),
        involvementLevel: randomItem(INVOLVEMENT_LEVELS),
        expectations: 'Buscamos proveedores profesionales y confiables para hacer de nuestro día algo especial e inolvidable.',
        // Estado de encuestas por categoría
        categorySurveyStatus,
        // Campos de prueba
        isDummy: true,
        dummyBatch: DUMMY_BATCH_ID,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      await db.collection('users').doc(userRecord.uid).set(userDoc);
      log.success(`Usuario creado: ${coupleName} (${region}) - ${userDoc.priorityCategories.length} categorías prioritarias`);

      createdUsers.push({
        uid: userRecord.uid,
        ...userDoc,
      });

    } catch (error) {
      log.error(`Error creando usuario ${coupleName}: ${error.message}`);
    }
  }

  return createdUsers;
}

async function createProviderSurveys(db, providers) {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.yellow}  Creando Encuestas de Proveedores${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  const createdSurveys = [];

  for (const provider of providers) {
    for (const category of provider.categories) {
      try {
        const responses = generateProviderSurveyResponses(category);
        
        const surveyDoc = {
          providerId: provider.uid,
          category,
          responses,
          completedAt: FieldValue.serverTimestamp(),
          isDummy: true,
          dummyBatch: DUMMY_BATCH_ID,
        };

        const docRef = await db.collection('providerCategorySurveys').add(surveyDoc);
        
        // Actualizar estado de encuesta del proveedor
        await db.collection('providers').doc(provider.uid).update({
          [`categorySurveyStatus.${category}`]: 'completed',
          updatedAt: FieldValue.serverTimestamp(),
        });

        log.success(`Encuesta proveedor: ${provider.providerName} - ${CATEGORIES[category]?.name || category}`);

        createdSurveys.push({
          id: docRef.id,
          providerId: provider.uid,
          category,
          ...surveyDoc,
        });

      } catch (error) {
        log.error(`Error creando encuesta proveedor ${provider.providerName} - ${category}: ${error.message}`);
      }
    }
  }

  return createdSurveys;
}

async function createUserSurveys(db, users) {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.yellow}  Creando Encuestas de Usuarios${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  const createdSurveys = [];

  for (const user of users) {
    // Crear encuestas solo para las categorías prioritarias del usuario
    const categoriesToSurvey = user.priorityCategories.slice(0, 4); // Máximo 4 categorías con encuesta

    for (const category of categoriesToSurvey) {
      try {
        const responses = generateUserSurveyResponses(category);
        
        const surveyDoc = {
          userId: user.uid,
          category,
          responses,
          completedAt: FieldValue.serverTimestamp(),
          matchesGenerated: false,
          isDummy: true,
          dummyBatch: DUMMY_BATCH_ID,
        };

        const docRef = await db.collection('userCategorySurveys').add(surveyDoc);
        
        // Actualizar estado de encuesta del usuario
        await db.collection('users').doc(user.uid).update({
          [`categorySurveyStatus.${category}`]: 'completed',
          updatedAt: FieldValue.serverTimestamp(),
        });

        log.success(`Encuesta usuario: ${user.coupleNames} - ${CATEGORIES[category]?.name || category}`);

        createdSurveys.push({
          id: docRef.id,
          oderId: user.uid,
          category,
          responses,
          ...surveyDoc,
        });

      } catch (error) {
        log.error(`Error creando encuesta usuario ${user.coupleNames} - ${category}: ${error.message}`);
      }
    }
  }

  return createdSurveys;
}

async function createLeads(db, users, providers, userSurveys, providerSurveys) {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.yellow}  Creando Leads/Matches por Categoría${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  const activeProviders = providers.filter(p => p.status === 'active');
  
  if (activeProviders.length === 0) {
    log.warn('No hay proveedores activos para crear leads');
    return;
  }

  const leadStatuses = ['pending', 'approved', 'contacted'];

  for (const user of users) {
    // Obtener encuestas completadas del usuario
    const userCompletedSurveys = userSurveys.filter(s => s.userId === user.uid);

    for (const userSurvey of userCompletedSurveys) {
      const category = userSurvey.category;
      
      // Encontrar proveedores que ofrecen esta categoría
      const categoryProviders = activeProviders.filter(p => 
        p.categories.includes(category) && 
        (p.categoryLeadsUsed?.[category] || 0) < (p.categoryLeadLimits?.[category] || 10)
      );

      if (categoryProviders.length === 0) {
        log.warn(`No hay proveedores disponibles para ${category}`);
        continue;
      }

      // Seleccionar hasta 3 proveedores para esta categoría
      const shuffledProviders = [...categoryProviders].sort(() => Math.random() - 0.5);
      const selectedProviders = shuffledProviders.slice(0, Math.min(LEADS_PER_CATEGORY, shuffledProviders.length));

      for (const provider of selectedProviders) {
        // Buscar encuesta del proveedor para esta categoría
        const providerSurvey = providerSurveys.find(s => 
          s.providerId === provider.uid && s.category === category
        );

        // Calcular match score
        const matchScore = calculateMatchScore(
          userSurvey.responses,
          providerSurvey?.responses || {},
          category
        );

        // Bonus si coincide la región
        let finalScore = matchScore;
        if (user.region === provider.workRegion) {
          finalScore = Math.min(99, matchScore + 5);
        }

        const status = randomItem(leadStatuses);

        const leadDoc = {
          userId: user.uid,
          providerId: provider.uid,
          category,
          matchScore: finalScore,
          status,
          userSurveyId: userSurvey.id,
          providerSurveyId: providerSurvey?.id || null,
          matchCriteria: {
            styleMatch: 70 + Math.floor(Math.random() * 30),
            budgetMatch: 60 + Math.floor(Math.random() * 40),
            locationMatch: user.region === provider.workRegion ? 100 : (provider.acceptsOutsideZone ? 70 : 30),
            availabilityMatch: 80 + Math.floor(Math.random() * 20),
            specificCriteriaMatch: 65 + Math.floor(Math.random() * 35),
          },
          userInfo: {
            coupleNames: user.coupleNames,
            eventDate: user.eventDate,
            budget: user.budget,
            region: user.region,
            email: user.email,
            phone: user.phone,
          },
          providerInfo: {
            providerName: provider.providerName,
            categories: provider.categories,
            priceRange: provider.priceRange,
          },
          assignedByAdmin: false,
          isDummy: true,
          dummyBatch: DUMMY_BATCH_ID,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };

        try {
          await db.collection('leads').add(leadDoc);
          
          // Actualizar leadsUsed del proveedor para esta categoría
          await db.collection('providers').doc(provider.uid).update({
            [`categoryLeadsUsed.${category}`]: FieldValue.increment(1),
            leadsUsed: FieldValue.increment(1), // Legacy
            updatedAt: FieldValue.serverTimestamp(),
          });

          // Actualizar estado de encuesta del usuario
          await db.collection('users').doc(user.uid).update({
            [`categorySurveyStatus.${category}`]: 'matches_generated',
            updatedAt: FieldValue.serverTimestamp(),
          });

          // Marcar encuesta como con matches generados
          await db.collection('userCategorySurveys').doc(userSurvey.id).update({
            matchesGenerated: true,
          });

          log.success(`Lead: ${user.coupleNames} → ${provider.providerName} [${CATEGORIES[category]?.name}] (${finalScore}%)`);
        } catch (error) {
          log.error(`Error creando lead: ${error.message}`);
        }
      }
    }
  }
}

async function cleanDatabase(auth, db) {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.yellow}  Limpiando datos de prueba (isDummy: true)${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  // Eliminar leads dummy
  log.step('Eliminando leads dummy...');
  const leadsSnapshot = await db.collection('leads').where('isDummy', '==', true).get();
  for (const doc of leadsSnapshot.docs) {
    await doc.ref.delete();
  }
  log.success(`${leadsSnapshot.size} leads dummy eliminados`);

  // Eliminar encuestas de usuarios dummy
  log.step('Eliminando encuestas de usuarios dummy...');
  const userSurveysSnapshot = await db.collection('userCategorySurveys').where('isDummy', '==', true).get();
  for (const doc of userSurveysSnapshot.docs) {
    await doc.ref.delete();
  }
  log.success(`${userSurveysSnapshot.size} encuestas de usuarios eliminadas`);

  // Eliminar encuestas de proveedores dummy
  log.step('Eliminando encuestas de proveedores dummy...');
  const providerSurveysSnapshot = await db.collection('providerCategorySurveys').where('isDummy', '==', true).get();
  for (const doc of providerSurveysSnapshot.docs) {
    await doc.ref.delete();
  }
  log.success(`${providerSurveysSnapshot.size} encuestas de proveedores eliminadas`);

  // Eliminar usuarios dummy
  log.step('Eliminando usuarios dummy...');
  const usersSnapshot = await db.collection('users').where('isDummy', '==', true).get();
  let usersDeleted = 0;
  for (const doc of usersSnapshot.docs) {
    await doc.ref.delete();
    try {
      await auth.deleteUser(doc.id);
    } catch (e) { /* Usuario ya no existe en Auth */ }
    usersDeleted++;
  }
  log.success(`${usersDeleted} usuarios dummy eliminados`);

  // Eliminar proveedores dummy
  log.step('Eliminando proveedores dummy...');
  const providersSnapshot = await db.collection('providers').where('isDummy', '==', true).get();
  let providersDeleted = 0;
  for (const doc of providersSnapshot.docs) {
    await doc.ref.delete();
    try {
      await auth.deleteUser(doc.id);
    } catch (e) { /* Usuario ya no existe en Auth */ }
    providersDeleted++;
  }
  log.success(`${providersDeleted} proveedores dummy eliminados`);
}

// ============================================
// MAIN
// ============================================

async function main() {
  const args = process.argv.slice(2);
  
  const showHelp = args.includes('--help') || args.includes('-h');
  const createAll = args.includes('--all') || args.length === 0 || (args.length === 1 && args[0] === '--clean');
  const onlyProviders = args.includes('--providers');
  const onlyUsers = args.includes('--users');
  const onlySurveys = args.includes('--surveys');
  const onlyLeads = args.includes('--leads');
  const cleanFirst = args.includes('--clean');

  if (showHelp) {
    console.log(`
${colors.cyan}═══════════════════════════════════════════════════${colors.reset}
${colors.yellow}  Matri.AI - Seed Database (Sistema por Categoría)${colors.reset}
${colors.cyan}═══════════════════════════════════════════════════${colors.reset}

${colors.green}Uso:${colors.reset}
  node scripts/seed-database.mjs [opciones]

${colors.green}Opciones:${colors.reset}
  --all          Crear todo (default)
  --providers    Solo crear proveedores
  --users        Solo crear usuarios
  --surveys      Solo crear encuestas
  --leads        Solo crear leads
  --clean        Limpiar datos de prueba antes
  --help, -h     Mostrar esta ayuda

${colors.green}Ejemplos:${colors.reset}
  node scripts/seed-database.mjs
  node scripts/seed-database.mjs --clean --all
  node scripts/seed-database.mjs --providers

${colors.green}Sistema de Matchmaking por Categoría:${colors.reset}
  Este script genera datos para las 8 categorías:
  - Fotografía, Video, DJ/VJ, Banquetería
  - Centro de Eventos, Decoración, Wedding Planner, Maquillaje

  Cada usuario puede tener hasta 3 matches POR CATEGORÍA.
`);
    process.exit(0);
  }

  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.yellow}  Matri.AI - Seed Database (Sistema por Categoría)${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);

  // Cargar variables de entorno
  const loadedEnv = loadEnvFile();
  if (loadedEnv) {
    log.info(`Variables cargadas desde ${loadedEnv}`);
  }

  // Inicializar Firebase
  const serviceAccount = getServiceAccount();
  if (!serviceAccount) {
    log.error('No se encontraron credenciales de Firebase.');
    process.exit(1);
  }

  if (getApps().length === 0) {
    initializeApp({ credential: cert(serviceAccount) });
  }

  const auth = getAuth();
  const db = getFirestore();

  // Limpiar si se solicita
  if (cleanFirst) {
    await cleanDatabase(auth, db);
  }

  let providers = [];
  let users = [];
  let providerSurveys = [];
  let userSurveys = [];

  // Crear proveedores
  if (createAll || onlyProviders) {
    providers = await createProviders(auth, db);
  }

  // Crear usuarios
  if (createAll || onlyUsers) {
    users = await createUsers(auth, db);
  }

  // Crear encuestas
  if (createAll || onlySurveys) {
    // Cargar datos si no están en memoria
    if (providers.length === 0) {
      const snapshot = await db.collection('providers').get();
      providers = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    }
    if (users.length === 0) {
      const snapshot = await db.collection('users').get();
      users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    }

    providerSurveys = await createProviderSurveys(db, providers);
    userSurveys = await createUserSurveys(db, users);
  }

  // Crear leads
  if (createAll || onlyLeads) {
    // Cargar datos si no están en memoria
    if (providers.length === 0) {
      const snapshot = await db.collection('providers').get();
      providers = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    }
    if (users.length === 0) {
      const snapshot = await db.collection('users').get();
      users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    }
    if (userSurveys.length === 0) {
      const snapshot = await db.collection('userCategorySurveys').get();
      userSurveys = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    if (providerSurveys.length === 0) {
      const snapshot = await db.collection('providerCategorySurveys').get();
      providerSurveys = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    await createLeads(db, users, providers, userSurveys, providerSurveys);
  }

  // Resumen final
  console.log(`\n${colors.green}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}  ¡Base de datos poblada exitosamente!${colors.reset}`);
  console.log(`${colors.green}═══════════════════════════════════════════════════${colors.reset}\n`);

  console.log(`  ${colors.cyan}Proveedores:${colors.reset}          ${providers.length}`);
  console.log(`  ${colors.cyan}Usuarios:${colors.reset}             ${users.length}`);
  console.log(`  ${colors.cyan}Encuestas proveed.:${colors.reset}   ${providerSurveys.length}`);
  console.log(`  ${colors.cyan}Encuestas usuarios:${colors.reset}   ${userSurveys.length}`);
  console.log(`  ${colors.cyan}Contraseña:${colors.reset}           ${DEFAULT_PASSWORD}`);
  console.log(`  ${colors.cyan}Emails:${colors.reset}               user1@test.matri.ai, provider1@test.matri.ai, etc.`);
  console.log();
  console.log(`  ${colors.yellow}⚠️  DATOS DUMMY - Para eliminar en producción:${colors.reset}`);
  console.log(`  ${colors.cyan}isDummy:${colors.reset}              true`);
  console.log(`  ${colors.cyan}dummyBatch:${colors.reset}           ${DUMMY_BATCH_ID}`);
  console.log();
  console.log(`  ${colors.magenta}Para limpiar:${colors.reset} node scripts/seed-database.mjs --clean`);
  console.log();
  console.log(`  ${colors.blue}Sistema de Matchmaking por Categoría:${colors.reset}`);
  console.log(`  - Cada usuario tiene encuestas por categoría`);
  console.log(`  - Cada proveedor tiene encuestas por categoría`);
  console.log(`  - Los leads se generan POR CATEGORÍA (máx. 3 por categoría)`);
  console.log();

  process.exit(0);
}

main().catch((error) => {
  log.error(`Error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
