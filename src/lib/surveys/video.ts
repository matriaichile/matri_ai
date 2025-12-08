/**
 * Encuestas de Videografía
 * Matri.AI - Sistema de Matchmaking por Categoría
 * 
 * Actualizado según especificaciones de AJUSTES_ENCUESTAS_Y_NUEVAS_CATEGORIAS.md
 */

import { SurveyQuestion } from './types';

// Preguntas para USUARIOS sobre videografía
export const VIDEO_USER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'video_u_style',
    question: '¿Qué estilo de video prefieres?',
    type: 'multiple', // CAMBIO: era 'single'
    options: [
      // CAMBIO: Mismas opciones que fotografía
      { id: 'documentary', label: 'Documental / Natural', description: 'Momentos espontáneos y reales' },
      { id: 'artistic', label: 'Artístico / Creativo', description: 'Composiciones únicas y originales' },
      { id: 'classic', label: 'Clásico / Tradicional', description: 'Elegancia atemporal' },
      { id: 'editorial', label: 'Editorial / Revista', description: 'Estilo de alta moda' },
      { id: 'candid', label: 'Espontáneo / Candid', description: 'Sin poses, 100% natural' },
      { id: 'cinematic', label: 'Cinemático', description: 'Estilo de película' },
    ],
    required: true,
    weight: 10, // CAMBIO: bajado de 25 a 10
  },
  {
    id: 'video_u_duration',
    question: '¿Qué duración de video final prefieres?',
    type: 'multiple', // Debe ser múltiple según especificación
    options: [
      { id: 'highlight_3', label: 'Highlight 3-5 min', description: 'Resumen corto para redes' },
      { id: 'highlight_10', label: 'Highlight 8-12 min', description: 'Resumen completo' },
      { id: 'medium_20', label: 'Medio 15-25 min', description: 'Video detallado' },
      { id: 'full_45', label: 'Completo 30-45 min', description: 'Cobertura extensa' },
      { id: 'full_extended', label: 'Extendido +60 min', description: 'Documental completo' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'video_u_budget',
    question: '¿Cuál es tu presupuesto para video?',
    type: 'single',
    options: [
      { id: 'under_600k', label: 'Menos de $600.000' },
      { id: '600k_1000k', label: '$600.000 - $1.000.000' },
      { id: '1000k_1500k', label: '$1.000.000 - $1.500.000' },
      { id: '1500k_2500k', label: '$1.500.000 - $2.500.000' },
      { id: 'over_2500k', label: 'Más de $2.500.000' },
    ],
    required: true,
    weight: 20,
  },
  {
    id: 'video_u_hours',
    question: '¿Cuántas horas de cobertura necesitas?',
    type: 'single',
    options: [
      { id: '4', label: '4 horas' },
      { id: '6', label: '6 horas' },
      { id: '8', label: '8 horas' },
      { id: '10', label: '10 horas' },
      { id: 'full_day', label: 'Día completo' },
    ],
    required: true,
    weight: 10,
  },
  {
    id: 'video_u_second_camera',
    question: '¿Necesitas segundo camarógrafo?',
    type: 'single',
    options: [
      { id: 'no', label: 'No necesario' },
      { id: 'preferred', label: 'Preferible' },
      { id: 'required', label: 'Indispensable' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'video_u_drone',
    question: '¿Te gustaría incluir tomas con drone?',
    type: 'single',
    options: [
      { id: 'no', label: 'No' },
      { id: 'nice_to_have', label: 'Sería bueno', description: 'Me gustaría pero no es esencial' },
      { id: 'required', label: 'Indispensable', description: 'Lo considero necesario' },
    ],
    required: true,
    weight: 10, // CAMBIO: subido de 5 a 10 (+5%)
  },
  {
    id: 'video_u_same_day_edit',
    question: '¿Te interesa un video editado el mismo día?',
    type: 'boolean',
    required: true,
    weight: 10, // CAMBIO: subido de 5 a 10 (+5%)
  },
  // ELIMINADO: video_u_raw_footage
  // ELIMINADO: video_u_social_reel
  {
    id: 'video_u_delivery_time',
    question: '¿En cuánto tiempo necesitas el video?',
    type: 'single',
    options: [
      { id: '2_weeks', label: '2 semanas' },
      { id: '1_month', label: '1 mes' },
      { id: 'over_1_month', label: '+1 mes' },
      { id: 'indifferent', label: 'Me es indiferente' },
    ],
    required: true,
    weight: 10, // CAMBIO: subido de 5 a 10 (+5%)
  },
  // ELIMINADO: video_u_music_preference
];

// Preguntas para PROVEEDORES de videografía
export const VIDEO_PROVIDER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'video_p_styles',
    question: '¿Qué estilos de video ofreces?',
    type: 'multiple',
    options: [
      // Mismas opciones que fotografía para consistencia
      { id: 'documentary', label: 'Documental / Natural' },
      { id: 'artistic', label: 'Artístico / Creativo' },
      { id: 'classic', label: 'Clásico / Tradicional' },
      { id: 'editorial', label: 'Editorial / Revista' },
      { id: 'candid', label: 'Espontáneo / Candid' },
      { id: 'cinematic', label: 'Cinemático' },
    ],
    required: true,
    weight: 10, // CAMBIO: bajado de 25 a 10
  },
  {
    id: 'video_p_durations',
    question: '¿Qué duraciones de video ofreces?',
    type: 'multiple',
    options: [
      { id: 'highlight_3', label: 'Highlight 3-5 min' },
      { id: 'highlight_10', label: 'Highlight 8-12 min' },
      { id: 'medium_20', label: 'Medio 15-25 min' },
      { id: 'full_45', label: 'Completo 30-45 min' },
      { id: 'full_extended', label: 'Extendido +60 min' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'video_p_price_min',
    question: 'Precio mínimo de tu servicio (CLP)',
    type: 'number',
    min: 100000,
    max: 10000000,
    step: 50000,
    required: true,
    weight: 20,
  },
  {
    id: 'video_p_price_max',
    question: 'Precio máximo de tu servicio (CLP)',
    type: 'number',
    min: 100000,
    max: 10000000,
    step: 50000,
    required: true,
    weight: 0,
  },
  {
    id: 'video_p_hours_min',
    question: 'Cobertura mínima (horas)',
    type: 'number',
    min: 1,
    max: 12,
    required: true,
    weight: 10,
  },
  {
    id: 'video_p_hours_max',
    question: 'Cobertura máxima (horas)',
    type: 'number',
    min: 1,
    max: 24,
    required: true,
    weight: 0,
  },
  {
    id: 'video_p_second_camera',
    question: '¿Ofreces segundo camarógrafo?',
    type: 'single',
    options: [
      { id: 'no', label: 'No' },
      { id: 'extra_cost', label: 'Sí, con costo adicional' },
      { id: 'included', label: 'Incluido en algunos paquetes' },
      { id: 'always', label: 'Siempre incluido' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'video_p_drone',
    question: '¿Ofreces tomas con drone?',
    type: 'single',
    options: [
      { id: 'no', label: 'No' },
      { id: 'extra_cost', label: 'Sí, con costo adicional' },
      { id: 'included', label: 'Incluido' },
    ],
    required: true,
    weight: 10, // CAMBIO: subido de 5 a 10 (+5%)
  },
  {
    id: 'video_p_same_day_edit',
    question: '¿Ofreces edición el mismo día?',
    type: 'boolean',
    required: true,
    weight: 10, // CAMBIO: subido de 5 a 10 (+5%)
  },
  {
    id: 'video_p_delivery_time',
    question: 'Tiempo de entrega habitual',
    type: 'single',
    options: [
      { id: '2_weeks', label: '2 semanas' },
      { id: '1_month', label: '1 mes' },
      { id: 'over_1_month', label: '+1 mes' },
    ],
    required: true,
    weight: 10, // CAMBIO: subido de 5 a 10 (+5%)
  },
  {
    id: 'video_p_equipment',
    question: '¿Qué equipo utilizas?',
    type: 'multiple',
    options: [
      { id: '4k', label: 'Cámaras 4K' },
      { id: 'cinema_camera', label: 'Cámaras de cine' },
      { id: 'gimbal', label: 'Estabilizador / Gimbal' },
      { id: 'slider', label: 'Slider' },
      { id: 'crane', label: 'Grúa' },
      { id: 'lighting', label: 'Iluminación profesional' },
    ],
    required: true,
    weight: 2,
  },
];
