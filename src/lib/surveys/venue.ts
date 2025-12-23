/**
 * Encuestas de Centro de Eventos
 * Matri.AI - Sistema de Matchmaking por Categoría
 * 
 * Actualizado según especificaciones de preguntas por provincias (Región Metropolitana)
 * Versión: Provincias de la RM + preguntas separadas para pieza novia/novio
 */

import { SurveyQuestion } from './types';

// ============================================
// CONSTANTES DE PROVINCIAS DE LA REGIÓN METROPOLITANA
// ============================================

/**
 * Provincias de la Región Metropolitana de Santiago
 * Solo se habilita RM por ahora según especificaciones
 */
export const RM_PROVINCES = [
  { id: 'santiago', label: 'Provincia de Santiago', description: 'Capital: Santiago (Gran Santiago)' },
  { id: 'chacabuco', label: 'Provincia de Chacabuco', description: 'Capital: Colina (Lampa, Tiltil)' },
  { id: 'cordillera', label: 'Provincia de Cordillera', description: 'Capital: Puente Alto (Pirque, San José de Maipo)' },
  { id: 'maipo', label: 'Provincia de Maipo', description: 'Capital: San Bernardo (Buin, Calera de Tango, Paine)' },
  { id: 'melipilla', label: 'Provincia de Melipilla', description: 'Capital: Melipilla (Alhué, Curacaví, María Pinto, San Pedro)' },
  { id: 'talagante', label: 'Provincia de Talagante', description: 'Capital: Talagante (El Monte, Isla de Maipo, Padre Hurtado, Peñaflor)' },
];

// ============================================
// PREGUNTAS PARA USUARIOS (NOVIOS) - CENTRO DE EVENTOS
// ============================================

// Total de pesos: 100% (5+25+12+8+15+4+4+4+3+4+4+2+4+3+3)
export const VENUE_USER_QUESTIONS: SurveyQuestion[] = [
  // ========== PREGUNTA 1: REGIÓN DEL MATRIMONIO ==========
  {
    id: 'venue_u_region',
    question: '¿En qué región será tu matrimonio?',
    type: 'single',
    options: [
      { id: 'rm', label: 'Región Metropolitana', description: 'Por ahora solo se habilita Región Metropolitana' },
      // Otras regiones deshabilitadas por ahora
    ],
    required: true,
    weight: 5, // Peso bajo porque por ahora solo hay una opción
  },

  // ========== PREGUNTA 2: PROVINCIA PREFERIDA ==========
  {
    id: 'venue_u_province',
    question: '¿En qué provincia te gustaría realizar tu matrimonio?',
    type: 'multiple', // Selección múltiple
    options: [
      { id: 'santiago', label: 'Provincia de Santiago', description: 'Capital: Santiago (Gran Santiago)' },
      { id: 'chacabuco', label: 'Provincia de Chacabuco', description: 'Capital: Colina (Lampa, Tiltil)' },
      { id: 'cordillera', label: 'Provincia de Cordillera', description: 'Capital: Puente Alto (Pirque, San José de Maipo)' },
      { id: 'maipo', label: 'Provincia de Maipo', description: 'Capital: San Bernardo (Buin, Calera de Tango, Paine)' },
      { id: 'melipilla', label: 'Provincia de Melipilla', description: 'Capital: Melipilla (Alhué, Curacaví, María Pinto, San Pedro)' },
      { id: 'talagante', label: 'Provincia de Talagante', description: 'Capital: Talagante (El Monte, Isla de Maipo, Padre Hurtado, Peñaflor)' },
      { id: 'no_preference', label: 'No tengo preferencia', description: 'Estoy abierto/a a cualquier provincia' },
    ],
    required: true,
    weight: 25, // Peso alto - criterio principal de matchmaking de ubicación
  },

  // ========== PREGUNTA 3: TIPO DE LUGAR PREFERIDO ==========
  {
    id: 'venue_u_type',
    question: '¿Qué tipo de lugar prefieres?',
    type: 'multiple', // Selección múltiple
    options: [
      { id: 'event_hall', label: 'Salón de eventos', description: 'Espacio dedicado a eventos' },
      { id: 'hacienda', label: 'Hacienda / campo', description: 'Naturaleza y tradición' },
      { id: 'hotel', label: 'Hotel', description: 'Comodidad y servicios' },
      { id: 'restaurant', label: 'Restaurante', description: 'Gastronomía destacada' },
      { id: 'garden', label: 'Jardín / parque', description: 'Al aire libre' },
      { id: 'winery', label: 'Viña', description: 'Entre viñedos' },
      { id: 'loft', label: 'Loft / industrial', description: 'Moderno y urbano' },
      { id: 'mansion', label: 'Casona / mansión', description: 'Elegancia clásica' },
    ],
    required: true,
    weight: 12,
  },

  // ========== PREGUNTA 4: TIPO DE ESPACIO ==========
  {
    id: 'venue_u_setting',
    question: '¿Prefieres un espacio interior o exterior?',
    type: 'single', // Selección única
    options: [
      { id: 'indoor', label: 'Interior', description: 'Climatizado' },
      { id: 'outdoor', label: 'Exterior', description: 'Al aire libre' },
      { id: 'both', label: 'Ambos / mixto', description: 'Ceremonia afuera, fiesta adentro' },
    ],
    required: true,
    weight: 8,
  },

  // ========== PREGUNTA 5: PRESUPUESTO PARA EL LUGAR ==========
  {
    id: 'venue_u_budget',
    question: '¿Cuál es tu presupuesto aproximado para el lugar?',
    type: 'single',
    options: [
      { id: 'under_1m', label: 'Menos de $1.000.000' },
      { id: '1m_2m', label: '$1.000.000 - $2.000.000' },
      { id: '2m_4m', label: '$2.000.000 - $4.000.000' },
      { id: '4m_7m', label: '$4.000.000 - $7.000.000' },
      { id: 'over_7m', label: 'Más de $7.000.000' },
    ],
    required: true,
    weight: 15,
  },

  // ========== PREGUNTA 6: EXCLUSIVIDAD DEL LUGAR ==========
  {
    id: 'venue_u_exclusivity',
    question: '¿Necesitas exclusividad del espacio?',
    type: 'single',
    options: [
      { id: 'required', label: 'Indispensable', description: 'Solo mi evento ese día' },
      { id: 'preferred', label: 'Preferible' },
      { id: 'not_needed', label: 'No necesario' },
    ],
    required: true,
    weight: 4,
  },

  // ========== PREGUNTA 7: ESPACIO PARA CEREMONIA ==========
  {
    id: 'venue_u_ceremony_space',
    question: '¿Necesitas espacio para realizar la ceremonia?',
    type: 'boolean',
    required: true,
    weight: 4,
  },

  // ========== PREGUNTA 8: ESTACIONAMIENTO ==========
  {
    id: 'venue_u_parking',
    question: '¿Necesitas estacionamiento para invitados?',
    type: 'single',
    options: [
      { id: 'required', label: 'Indispensable' },
      { id: 'preferred', label: 'Preferible' },
      { id: 'not_needed', label: 'No necesario' },
    ],
    required: true,
    weight: 4,
  },

  // ========== PREGUNTA 9: ALOJAMIENTO ==========
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

  // ========== PREGUNTA 10: CATERING ==========
  {
    id: 'venue_u_catering_policy',
    question: '¿Tienes alguna preferencia de catering?',
    type: 'single',
    options: [
      { id: 'venue_only', label: 'Solo del lugar' },
      { id: 'external_ok', label: 'Puede ser externo' },
      { id: 'no_preference', label: 'Sin preferencia' },
    ],
    required: true,
    weight: 4,
  },

  // ========== PREGUNTA 11: HORARIO DEL EVENTO ==========
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
    weight: 4,
  },

  // ========== PREGUNTA 12: ACCESIBILIDAD ==========
  {
    id: 'venue_u_accessibility',
    question: '¿Requieres condiciones especiales de accesibilidad?',
    type: 'boolean',
    required: true,
    weight: 2,
  },

  // ========== PREGUNTA 13: PISTA DE BAILE ==========
  {
    id: 'venue_u_dance_floor',
    question: '¿Necesitas pista de baile?',
    type: 'boolean',
    required: true,
    weight: 4,
  },

  // ========== PREGUNTA 14: PIEZA DE LA NOVIA ==========
  {
    id: 'venue_u_bridal_room',
    question: '¿Necesitas pieza para la novia?',
    type: 'single',
    options: [
      { id: 'yes', label: 'Sí' },
      { id: 'no', label: 'No / Preferible' },
    ],
    required: true,
    weight: 3,
  },

  // ========== PREGUNTA 15: PIEZA DEL NOVIO ==========
  {
    id: 'venue_u_groom_room',
    question: '¿Necesitas pieza para el novio?',
    type: 'single',
    options: [
      { id: 'yes', label: 'Sí' },
      { id: 'no', label: 'No / Preferible' },
    ],
    required: true,
    weight: 3,
  },
];

// ============================================
// PREGUNTAS PARA PROVEEDORES - CENTRO DE EVENTOS
// ============================================

export const VENUE_PROVIDER_QUESTIONS: SurveyQuestion[] = [
  // ========== PREGUNTA 1: REGIÓN DEL CENTRO DE EVENTOS ==========
  {
    id: 'venue_p_region',
    question: '¿En qué región se encuentra tu centro de eventos?',
    type: 'single',
    options: [
      { id: 'rm', label: 'Región Metropolitana' },
      // Otras regiones deshabilitadas por ahora
    ],
    required: true,
    weight: 10,
  },

  // ========== PREGUNTA 2: PROVINCIA DEL CENTRO DE EVENTOS ==========
  {
    id: 'venue_p_province',
    question: '¿En qué provincia se encuentra tu centro de eventos?',
    type: 'single', // Selección única - el proveedor está en UNA provincia
    options: [
      { id: 'santiago', label: 'Provincia de Santiago', description: 'Capital: Santiago (Gran Santiago)' },
      { id: 'chacabuco', label: 'Provincia de Chacabuco', description: 'Capital: Colina (Lampa, Tiltil)' },
      { id: 'cordillera', label: 'Provincia de Cordillera', description: 'Capital: Puente Alto (Pirque, San José de Maipo)' },
      { id: 'maipo', label: 'Provincia de Maipo', description: 'Capital: San Bernardo (Buin, Calera de Tango, Paine)' },
      { id: 'melipilla', label: 'Provincia de Melipilla', description: 'Capital: Melipilla (Alhué, Curacaví, María Pinto, San Pedro)' },
      { id: 'talagante', label: 'Provincia de Talagante', description: 'Capital: Talagante (El Monte, Isla de Maipo, Padre Hurtado, Peñaflor)' },
    ],
    required: true,
    weight: 25, // Peso alto - criterio principal de matchmaking de ubicación
  },

  // ========== PREGUNTA 3: TIPO DE LUGAR ==========
  {
    id: 'venue_p_type',
    question: '¿Qué tipo de lugar eres?',
    type: 'multiple', // Puede ser varios tipos
    options: [
      { id: 'event_hall', label: 'Salón de eventos' },
      { id: 'hacienda', label: 'Hacienda / campo' },
      { id: 'hotel', label: 'Hotel' },
      { id: 'restaurant', label: 'Restaurante' },
      { id: 'garden', label: 'Jardín / parque' },
      { id: 'winery', label: 'Viña' },
      { id: 'loft', label: 'Loft / industrial' },
      { id: 'mansion', label: 'Casona / mansión' },
    ],
    required: true,
    weight: 15,
  },

  // ========== PREGUNTA 4: TIPO DE ESPACIO ==========
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
    weight: 10,
  },

  // ========== PREGUNTAS DE PRECIO ==========
  {
    id: 'venue_p_price_min',
    question: 'Precio mínimo de arriendo (CLP)',
    type: 'number',
    min: 100000,
    max: 20000000,
    step: 100000,
    required: true,
    weight: 15,
  },
  {
    id: 'venue_p_price_max',
    question: 'Precio máximo de arriendo (CLP)',
    type: 'number',
    min: 100000,
    max: 20000000,
    step: 100000,
    required: true,
    weight: 0, // El peso está en el mínimo para evitar duplicar
  },

  // ========== PREGUNTAS DE CAPACIDAD ==========
  {
    id: 'venue_p_capacity_min',
    question: 'Capacidad mínima',
    type: 'number',
    min: 10,
    max: 500,
    required: true,
    weight: 10,
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

  // ========== PREGUNTA 6: EXCLUSIVIDAD ==========
  {
    id: 'venue_p_exclusivity',
    question: '¿Ofreces exclusividad?',
    type: 'boolean',
    required: true,
    weight: 5,
  },

  // ========== PREGUNTA 7: ESPACIO PARA CEREMONIA ==========
  {
    id: 'venue_p_ceremony_space',
    question: '¿Tienes espacio para ceremonia?',
    type: 'boolean',
    required: true,
    weight: 5,
  },

  // ========== PREGUNTA 8: ESTACIONAMIENTO ==========
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

  // ========== PREGUNTA 9: ALOJAMIENTO ==========
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

  // ========== PREGUNTA 10: POLÍTICA DE CATERING ==========
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

  // ========== PREGUNTA 11: HORARIO DE TÉRMINO ==========
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

  // ========== PREGUNTA 12: ACCESIBILIDAD ==========
  {
    id: 'venue_p_accessibility',
    question: '¿Tienes accesibilidad?',
    type: 'boolean',
    required: true,
    weight: 2,
  },

  // ========== PREGUNTA 13: PISTA DE BAILE ==========
  {
    id: 'venue_p_dance_floor',
    question: '¿Tienes pista de baile?',
    type: 'boolean',
    required: true,
    weight: 5,
  },

  // ========== PREGUNTA 14: PIEZA PARA NOVIA ==========
  {
    id: 'venue_p_bridal_room',
    question: '¿Tienes pieza para la novia?',
    type: 'boolean',
    required: true,
    weight: 2,
  },

  // ========== PREGUNTA 15: PIEZA PARA NOVIO ==========
  {
    id: 'venue_p_groom_room',
    question: '¿Tienes pieza para el novio?',
    type: 'boolean',
    required: true,
    weight: 2,
  },

  // ========== SERVICIOS INCLUIDOS ==========
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
