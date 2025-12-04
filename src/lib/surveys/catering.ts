/**
 * Encuestas de Banquetería
 * Matri.AI - Sistema de Matchmaking por Categoría
 * 
 * Actualizado según especificaciones de AJUSTES_ENCUESTAS_Y_NUEVAS_CATEGORIAS.md
 */

import { SurveyQuestion } from './types';

// Preguntas para USUARIOS sobre banquetería
export const CATERING_USER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'catering_u_service_type',
    question: '¿Qué tipo de servicio prefieres?',
    type: 'multiple', // CAMBIO: era 'single'
    options: [
      { id: 'cocktail', label: 'Coctel / Finger Food' },
      { id: 'dinner', label: 'Cena (Entrada, fondo y postre)' },
      { id: 'buffet', label: 'Buffet' },
      { id: 'stations', label: 'Estaciones temáticas' },
      { id: 'extra', label: 'Extra (Mesón de postres y trasnoches)' },
    ],
    required: true,
    weight: 20,
  },
  {
    id: 'catering_u_cuisine',
    question: '¿Qué tipo de cocina prefieres?',
    type: 'multiple',
    options: [
      { id: 'chilean', label: 'Chilena tradicional' },
      { id: 'international', label: 'Internacional' },
      { id: 'mediterranean', label: 'Mediterránea' },
      { id: 'asian', label: 'Asiática / Fusión' },
      { id: 'gourmet', label: 'Gourmet / Alta cocina' },
      { id: 'comfort', label: 'Comfort food' },
      { id: 'bbq', label: 'Asados o parrilla' }, // NUEVO
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'catering_u_budget_pp',
    question: '¿Cuál es tu presupuesto por persona?',
    type: 'single',
    options: [
      { id: 'under_25k', label: 'Menos de $25.000' },
      { id: '25k_35k', label: '$25.000 - $35.000' },
      { id: '35k_50k', label: '$35.000 - $50.000' },
      { id: '50k_70k', label: '$50.000 - $70.000' },
      { id: 'over_70k', label: 'Más de $70.000' },
      { id: 'skip', label: 'Omitir' }, // NUEVO
    ],
    required: true,
    weight: 20,
  },
  // ELIMINADO: catering_u_guest_count (ya se pregunta al crear usuario)
  {
    id: 'catering_u_courses',
    question: '¿De cuántos tiempos quieres que sea tu cena?', // CAMBIO en texto
    type: 'single',
    options: [
      { id: '2', label: '2 tiempos' },
      { id: '3', label: '3 tiempos' },
      { id: '4', label: '4 tiempos' },
      { id: '5_plus', label: '5 o más tiempos' },
    ],
    required: true,
    weight: 5,
  },
  // ELIMINADO: catering_u_cocktail
  {
    id: 'catering_u_dietary',
    question: '¿Necesitas opciones especiales?',
    type: 'multiple',
    options: [
      { id: 'vegetarian', label: 'Vegetariana' },
      { id: 'vegan', label: 'Vegana' },
      { id: 'gluten_free', label: 'Sin gluten' },
      { id: 'kosher', label: 'Kosher' },
      { id: 'halal', label: 'Halal' },
      { id: 'none', label: 'Ninguna' },
      { id: 'other', label: 'Otra: ¿Cuál?' }, // NUEVO
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'catering_u_beverages',
    question: '¿Qué bebestibles necesitas?',
    type: 'multiple',
    options: [
      { id: 'soft_drinks', label: 'Bebidas' },
      { id: 'juices', label: 'Jugos / Aguas saborizadas' }, // NUEVO
      { id: 'wine', label: 'Vinos' },
      { id: 'beer', label: 'Cerveza' },
      { id: 'cocktails', label: 'Cócteles' },
      { id: 'open_bar', label: 'Barra libre' },
      { id: 'premium_liquor', label: 'Licores premium' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'catering_u_tasting',
    question: '¿Quieres degustación previa?',
    type: 'single',
    options: [
      { id: 'required', label: 'Indispensable' },
      { id: 'preferred', label: 'Preferible' },
      { id: 'not_needed', label: 'No necesario' },
    ],
    required: true,
    weight: 3,
  },
  {
    id: 'catering_u_cake',
    question: '¿Incluir torta de novios?',
    type: 'single',
    options: [
      { id: 'yes', label: 'Sí' },
      { id: 'no', label: 'No' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'catering_u_staff',
    question: '¿Qué nivel de servicio esperas?',
    type: 'single',
    options: [
      { id: 'basic', label: 'Básico' },
      { id: 'standard', label: 'Estándar' },
      { id: 'premium', label: 'Premium' }, // CAMBIO: Eliminado "Garzones dedicados"
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'catering_u_setup',
    question: '¿Necesitas montaje de mesas?',
    type: 'boolean',
    required: true,
    weight: 2,
  },
  {
    id: 'catering_u_end_time',
    question: '¿Hasta qué hora debe estar la banquetera en el evento?',
    type: 'single',
    options: [
      { id: '0_1am', label: '00:00 – 1:00 am' },
      { id: '2_3am', label: '2:00 – 3:00 am' },
      { id: '4_5am', label: '4:00 – 5:00 am' },
      { id: 'over_5am', label: '+5:00 am' },
    ],
    required: true,
    weight: 5,
  },
];

// Preguntas para PROVEEDORES de banquetería
export const CATERING_PROVIDER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'catering_p_service_types',
    question: '¿Qué tipos de servicio ofreces?',
    type: 'multiple',
    options: [
      { id: 'cocktail', label: 'Coctel / Finger Food' },
      { id: 'dinner', label: 'Cena (Entrada, fondo y postre)' },
      { id: 'buffet', label: 'Buffet' },
      { id: 'stations', label: 'Estaciones temáticas' },
      { id: 'extra', label: 'Extra (Mesón de postres y trasnoches)' },
    ],
    required: true,
    weight: 20,
  },
  {
    id: 'catering_p_cuisines',
    question: '¿Qué tipos de cocina ofreces?',
    type: 'multiple',
    options: [
      { id: 'chilean', label: 'Chilena tradicional' },
      { id: 'international', label: 'Internacional' },
      { id: 'mediterranean', label: 'Mediterránea' },
      { id: 'asian', label: 'Asiática / Fusión' },
      { id: 'gourmet', label: 'Gourmet / Alta cocina' },
      { id: 'comfort', label: 'Comfort food' },
      { id: 'bbq', label: 'Asados o parrilla' }, // NUEVO
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'catering_p_price_pp_min',
    question: 'Precio mínimo por persona (CLP)',
    type: 'number',
    min: 10000,
    max: 200000,
    step: 5000,
    required: true,
    weight: 20,
  },
  {
    id: 'catering_p_price_pp_max',
    question: 'Precio máximo por persona (CLP)',
    type: 'number',
    min: 10000,
    max: 200000,
    step: 5000,
    required: true,
    weight: 0,
  },
  {
    id: 'catering_p_guests_min',
    question: 'Mínimo de invitados que atiendes',
    type: 'number',
    min: 10,
    max: 500,
    required: true,
    weight: 10,
  },
  {
    id: 'catering_p_guests_max',
    question: 'Máximo de invitados que atiendes',
    type: 'number',
    min: 50,
    max: 1000,
    required: true,
    weight: 0,
  },
  {
    id: 'catering_p_courses',
    question: '¿Cuántos tiempos ofreces?',
    type: 'multiple',
    options: [
      { id: '2', label: '2 tiempos' },
      { id: '3', label: '3 tiempos' },
      { id: '4', label: '4 tiempos' },
      { id: '5_plus', label: '5 o más tiempos' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'catering_p_dietary',
    question: '¿Qué opciones especiales manejas?',
    type: 'multiple',
    options: [
      { id: 'vegetarian', label: 'Vegetariana' },
      { id: 'vegan', label: 'Vegana' },
      { id: 'gluten_free', label: 'Sin gluten' },
      { id: 'kosher', label: 'Kosher' },
      { id: 'halal', label: 'Halal' },
      { id: 'other', label: 'Otras opciones especiales' }, // NUEVO
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'catering_p_beverages',
    question: '¿Qué bebestibles ofreces?',
    type: 'multiple',
    options: [
      { id: 'soft_drinks', label: 'Bebidas' },
      { id: 'juices', label: 'Jugos / Aguas saborizadas' }, // NUEVO
      { id: 'wine', label: 'Vinos' },
      { id: 'beer', label: 'Cerveza' },
      { id: 'cocktails', label: 'Cócteles' },
      { id: 'open_bar', label: 'Barra libre' },
      { id: 'premium_liquor', label: 'Licores premium' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'catering_p_tasting',
    question: '¿Ofreces degustación previa?',
    type: 'single',
    options: [
      { id: 'yes_free', label: 'Sí, gratis' },
      { id: 'yes_paid', label: 'Sí, con costo' },
      { id: 'no', label: 'No' },
    ],
    required: true,
    weight: 3,
  },
  {
    id: 'catering_p_cake',
    question: '¿Ofreces torta de novios?',
    type: 'single',
    options: [
      { id: 'yes', label: 'Sí' },
      { id: 'no', label: 'No' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'catering_p_staff_levels',
    question: '¿Qué niveles de servicio ofreces?',
    type: 'multiple',
    options: [
      { id: 'basic', label: 'Básico' },
      { id: 'standard', label: 'Estándar' },
      { id: 'premium', label: 'Premium' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'catering_p_setup',
    question: '¿Ofreces montaje de mesas?',
    type: 'boolean',
    required: true,
    weight: 2,
  },
  {
    id: 'catering_p_equipment',
    question: '¿Qué equipamiento incluyes?',
    type: 'multiple',
    options: [
      { id: 'tables', label: 'Mesas' },
      { id: 'chairs', label: 'Sillas' },
      { id: 'tableware', label: 'Vajilla' },
      { id: 'glassware', label: 'Cristalería' },
      { id: 'linens', label: 'Mantelería' },
      { id: 'heating', label: 'Calefacción' },
      { id: 'tents', label: 'Carpas' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'catering_p_end_time',
    question: '¿Hasta qué hora puedes quedarte en el evento?',
    type: 'single',
    options: [
      { id: '0_1am', label: '00:00 – 1:00 am' },
      { id: '2_3am', label: '2:00 – 3:00 am' },
      { id: '4_5am', label: '4:00 – 5:00 am' },
      { id: 'over_5am', label: '+5:00 am' },
    ],
    required: true,
    weight: 5,
  },
];
