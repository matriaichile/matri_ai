/**
 * Encuestas de Centro de Eventos
 * Matri.AI - Sistema de Matchmaking por Categoría
 * 
 * Actualizado según especificaciones de AJUSTES_ENCUESTAS_Y_NUEVAS_CATEGORIAS.md
 */

import { SurveyQuestion } from './types';

// Preguntas para USUARIOS sobre centro de eventos
export const VENUE_USER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'venue_u_type',
    question: '¿Qué tipo de lugar prefieres?',
    type: 'multiple', // CAMBIO: era 'single'
    options: [
      { id: 'event_hall', label: 'Salón de eventos', description: 'Espacio dedicado a eventos' }, // NUEVO
      { id: 'hacienda', label: 'Hacienda / Campo', description: 'Naturaleza y tradición' },
      { id: 'hotel', label: 'Hotel', description: 'Comodidad y servicios' },
      { id: 'restaurant', label: 'Restaurant', description: 'Gastronomía destacada' },
      { id: 'garden', label: 'Jardín / Parque', description: 'Al aire libre' },
      { id: 'beach', label: 'Playa', description: 'Frente al mar' },
      { id: 'winery', label: 'Viña', description: 'Entre viñedos' },
      { id: 'loft', label: 'Loft / Industrial', description: 'Moderno y urbano' },
      { id: 'mansion', label: 'Casona / Mansión', description: 'Elegancia clásica' },
    ],
    required: true,
    weight: 20,
  },
  {
    id: 'venue_u_setting',
    question: '¿Interior o exterior?',
    type: 'single',
    options: [
      { id: 'indoor', label: 'Interior', description: 'Climatizado' },
      { id: 'outdoor', label: 'Exterior', description: 'Al aire libre' },
      { id: 'both', label: 'Ambos / Mixto', description: 'Ceremonia afuera, fiesta adentro' },
      // ELIMINADO: { id: 'flexible', label: 'Flexible según clima' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'venue_u_budget',
    question: '¿Cuál es tu presupuesto para el lugar?',
    type: 'single',
    options: [
      { id: 'under_1m', label: 'Menos de $1.000.000' },
      { id: '1m_2m', label: '$1.000.000 - $2.000.000' },
      { id: '2m_4m', label: '$2.000.000 - $4.000.000' },
      { id: '4m_7m', label: '$4.000.000 - $7.000.000' },
      { id: 'over_7m', label: 'Más de $7.000.000' },
    ],
    required: true,
    weight: 20,
  },
  // ELIMINADO: venue_u_capacity (ya se pregunta al crear usuario)
  {
    id: 'venue_u_exclusivity',
    question: '¿Necesitas exclusividad del lugar?',
    type: 'single',
    options: [
      { id: 'required', label: 'Indispensable', description: 'Solo mi evento ese día' },
      { id: 'preferred', label: 'Preferible' },
      { id: 'not_needed', label: 'No necesario' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'venue_u_ceremony_space',
    question: '¿Necesitas espacio para ceremonia?',
    type: 'boolean',
    required: true,
    weight: 5,
  },
  {
    id: 'venue_u_parking',
    question: '¿Necesitas estacionamiento?',
    type: 'single',
    options: [
      { id: 'required', label: 'Indispensable' },
      { id: 'preferred', label: 'Preferible' },
      { id: 'not_needed', label: 'No necesario' }, // CAMBIO: Eliminado "habrá valet"
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'venue_u_accommodation',
    question: '¿Necesitas alojamiento para invitados?',
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
    id: 'venue_u_catering_policy',
    question: '¿Preferencia de catering?',
    type: 'single',
    options: [
      { id: 'venue_only', label: 'Solo del lugar' },
      { id: 'external_ok', label: 'Puede ser externo' },
      { id: 'no_preference', label: 'Sin preferencia' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'venue_u_end_time',
    question: '¿Hasta qué hora necesitas el lugar?',
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
  {
    id: 'venue_u_accessibility',
    question: '¿Necesitas accesibilidad especial?',
    type: 'boolean',
    required: true,
    weight: 2,
  },
  {
    id: 'venue_u_dance_floor',
    question: '¿Tiene pista de baile?',
    type: 'boolean',
    required: true,
    weight: 5,
  },
  {
    id: 'venue_u_bridal_suite',
    question: '¿Tiene pieza para novia y novio?',
    type: 'single',
    options: [
      { id: 'yes', label: 'Sí' },
      { id: 'no', label: 'No' },
      { id: 'not_needed', label: 'No es necesario' },
    ],
    required: true,
    weight: 3,
  },
];

// Preguntas para PROVEEDORES de centro de eventos
export const VENUE_PROVIDER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'venue_p_type',
    question: '¿Qué tipo de lugar eres?',
    type: 'multiple', // CAMBIO: era 'single' - para coincidir con usuarios
    options: [
      { id: 'event_hall', label: 'Salón de eventos' }, // NUEVO
      { id: 'hacienda', label: 'Hacienda / Campo' },
      { id: 'hotel', label: 'Hotel' },
      { id: 'restaurant', label: 'Restaurant' },
      { id: 'garden', label: 'Jardín / Parque' },
      { id: 'beach', label: 'Playa' },
      { id: 'winery', label: 'Viña' },
      { id: 'loft', label: 'Loft / Industrial' },
      { id: 'mansion', label: 'Casona / Mansión' },
    ],
    required: true,
    weight: 20,
  },
  {
    id: 'venue_p_settings',
    question: '¿Qué espacios ofreces?',
    type: 'multiple',
    options: [
      { id: 'indoor', label: 'Interior' },
      { id: 'outdoor', label: 'Exterior' },
      { id: 'both', label: 'Ambos' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'venue_p_price_min',
    question: 'Precio mínimo de arriendo (CLP)',
    type: 'number',
    min: 100000,
    max: 20000000,
    step: 100000,
    required: true,
    weight: 20,
  },
  {
    id: 'venue_p_price_max',
    question: 'Precio máximo de arriendo (CLP)',
    type: 'number',
    min: 100000,
    max: 20000000,
    step: 100000,
    required: true,
    weight: 0,
  },
  {
    id: 'venue_p_capacity_min',
    question: 'Capacidad mínima',
    type: 'number',
    min: 10,
    max: 500,
    required: true,
    weight: 15,
  },
  {
    id: 'venue_p_capacity_max',
    question: 'Capacidad máxima',
    type: 'number',
    min: 50,
    max: 1000,
    required: true,
    weight: 0,
  },
  {
    id: 'venue_p_exclusivity',
    question: '¿Ofreces exclusividad?',
    type: 'boolean',
    required: true,
    weight: 5,
  },
  {
    id: 'venue_p_ceremony_space',
    question: '¿Tienes espacio para ceremonia?',
    type: 'boolean',
    required: true,
    weight: 5,
  },
  {
    id: 'venue_p_parking',
    question: '¿Tienes estacionamiento?',
    type: 'single',
    options: [
      { id: 'yes_free', label: 'Sí, gratis' },
      { id: 'yes_paid', label: 'Sí, con costo' },
      { id: 'valet', label: 'Servicio valet' },
      { id: 'no', label: 'No' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'venue_p_accommodation',
    question: '¿Ofreces alojamiento?',
    type: 'single',
    options: [
      { id: 'yes', label: 'Sí' },
      { id: 'nearby', label: 'Convenio cercano' },
      { id: 'no', label: 'No' },
    ],
    required: true,
    weight: 3,
  },
  {
    id: 'venue_p_catering_policy',
    question: '¿Política de catering?',
    type: 'single',
    options: [
      { id: 'exclusive', label: 'Solo nuestro catering' },
      { id: 'preferred', label: 'Preferimos el nuestro' },
      { id: 'external_ok', label: 'Externo permitido' },
      { id: 'no_catering', label: 'No ofrecemos catering' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'venue_p_end_time',
    question: '¿Hasta qué hora pueden estar?',
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
  {
    id: 'venue_p_accessibility',
    question: '¿Tienes accesibilidad?',
    type: 'boolean',
    required: true,
    weight: 2,
  },
  {
    id: 'venue_p_dance_floor',
    question: '¿Tienes pista de baile?',
    type: 'boolean',
    required: true,
    weight: 5,
  },
  {
    id: 'venue_p_bridal_suite',
    question: '¿Tienes pieza para novia y novio?',
    type: 'boolean',
    required: true,
    weight: 3,
  },
  {
    id: 'venue_p_included_services',
    question: '¿Qué servicios incluyes?',
    type: 'multiple',
    options: [
      { id: 'tables', label: 'Mesas' },
      { id: 'chairs', label: 'Sillas' },
      { id: 'linens', label: 'Mantelería' },
      { id: 'lighting', label: 'Iluminación básica' },
      { id: 'sound', label: 'Sonido básico' },
      { id: 'coordinator', label: 'Coordinador' },
      { id: 'security', label: 'Seguridad' },
      { id: 'cleaning', label: 'Limpieza' },
    ],
    required: true,
    weight: 5,
  },
];
