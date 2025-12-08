/**
 * Encuestas de Fotografía
 * Matri.AI - Sistema de Matchmaking por Categoría
 * 
 * Actualizado según especificaciones de AJUSTES_ENCUESTAS_Y_NUEVAS_CATEGORIAS.md
 */

import { SurveyQuestion } from './types';

// Preguntas para USUARIOS sobre fotografía
export const PHOTOGRAPHY_USER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'photo_u_style',
    question: '¿Qué estilo fotográfico prefieres?',
    type: 'multiple', // CAMBIO: era 'single'
    options: [
      { id: 'documentary', label: 'Documental / Natural', description: 'Momentos espontáneos y reales' },
      { id: 'artistic', label: 'Artístico / Creativo', description: 'Composiciones únicas y originales' },
      { id: 'classic', label: 'Clásico / Tradicional', description: 'Elegancia atemporal' },
      { id: 'editorial', label: 'Editorial / Revista', description: 'Estilo de alta moda' },
      { id: 'candid', label: 'Espontáneo / Candid', description: 'Sin poses, 100% natural' },
      { id: 'cinematic', label: 'Cinemático', description: 'Estilo de película' },
    ],
    required: true,
    weight: 15, // CAMBIO: bajado de 25 a 15
  },
  {
    id: 'photo_u_hours',
    question: '¿Cuántas horas de cobertura necesitas?',
    type: 'single',
    options: [
      { id: '4', label: '4 horas', description: 'Ceremonia y cóctel' },
      { id: '6', label: '6 horas', description: 'Ceremonia, cóctel y parte de la fiesta' },
      { id: '8', label: '8 horas', description: 'Cobertura completa estándar' },
      { id: '10', label: '10 horas', description: 'Cobertura extendida' },
      { id: 'full_day', label: 'Día completo (+12h)', description: 'Desde preparativos hasta el final' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'photo_u_budget',
    question: '¿Cuál es tu presupuesto para fotografía?',
    type: 'single',
    options: [
      { id: 'under_500k', label: 'Menos de $500.000' },
      { id: '500k_800k', label: '$500.000 - $800.000' },
      { id: '800k_1200k', label: '$800.000 - $1.200.000' },
      { id: '1200k_1800k', label: '$1.200.000 - $1.800.000' },
      { id: 'over_1800k', label: 'Más de $1.800.000' },
    ],
    required: true,
    weight: 20,
  },
  {
    id: 'photo_u_preboda',
    question: '¿Necesitas sesión pre-boda?',
    type: 'boolean',
    required: true,
    weight: 5,
  },
  {
    id: 'photo_u_postboda',
    question: '¿Te interesa sesión post-boda (trash the dress, etc.)?',
    type: 'boolean',
    required: true,
    weight: 5,
  },
  {
    id: 'photo_u_second_shooter',
    question: '¿Necesitas segundo fotógrafo?',
    type: 'single',
    options: [
      { id: 'no', label: 'No necesario' },
      { id: 'preferred', label: 'Preferible', description: 'Me gustaría pero no es indispensable' },
      { id: 'required', label: 'Indispensable', description: 'Lo considero necesario' },
    ],
    required: true,
    weight: 10, // CAMBIO: subido de 5 a 10 (+5%)
  },
  {
    id: 'photo_u_delivery_time',
    question: '¿En cuánto tiempo necesitas las fotos?',
    type: 'single',
    options: [
      { id: '2_weeks', label: '2 semanas' },
      { id: '1_month', label: '1 mes' },
      { id: 'over_1_month', label: '+1 mes' }, // CAMBIO
      { id: 'indifferent', label: 'Me es indiferente' }, // CAMBIO
    ],
    required: true,
    weight: 10, // CAMBIO: subido de 5 a 10 (+5%)
  },
  {
    id: 'photo_u_delivery_format',
    question: '¿Qué formato de entrega prefieres?',
    type: 'multiple',
    options: [
      { id: 'digital_hd', label: 'Digital HD', description: 'Archivos de alta resolución' },
      { id: 'digital_raw', label: 'Digital RAW', description: 'Archivos sin procesar' },
      { id: 'printed_album', label: 'Álbum impreso', description: 'Álbum físico de calidad' },
      { id: 'usb_box', label: 'USB en caja especial', description: 'Presentación elegante' },
      { id: 'online_gallery', label: 'Galería online', description: 'Para compartir con invitados' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'photo_u_photo_count',
    question: '¿Cuántas fotos editadas esperas recibir?',
    type: 'single',
    options: [
      { id: 'under_200', label: 'Menos de 200' },
      { id: '200_400', label: '200 - 400' },
      { id: '400_600', label: '400 - 600' },
      { id: 'over_600', label: 'Más de 600' },
      { id: 'unlimited', label: 'Sin límite' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'photo_u_retouching',
    question: '¿Qué nivel de retoque prefieres?',
    type: 'single',
    options: [
      { id: 'natural', label: 'Natural / Mínimo', description: 'Solo correcciones básicas' },
      { id: 'moderate', label: 'Moderado', description: 'Retoque equilibrado' },
      { id: 'editorial', label: 'Tipo revista / Alto', description: 'Retoque profesional completo' },
    ],
    required: true,
    weight: 5,
  },
  // ELIMINADO: photo_u_priorities
];

// Preguntas para PROVEEDORES de fotografía
export const PHOTOGRAPHY_PROVIDER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'photo_p_styles',
    question: '¿Qué estilos fotográficos ofreces?',
    type: 'multiple',
    options: [
      { id: 'documentary', label: 'Documental / Natural' },
      { id: 'artistic', label: 'Artístico / Creativo' },
      { id: 'classic', label: 'Clásico / Tradicional' },
      { id: 'editorial', label: 'Editorial / Revista' },
      { id: 'candid', label: 'Espontáneo / Candid' },
      { id: 'cinematic', label: 'Cinemático' },
    ],
    required: true,
    weight: 15, // CAMBIO: bajado de 25 a 15
  },
  {
    id: 'photo_p_hours_min',
    question: '¿Cuál es tu cobertura mínima (horas)?',
    type: 'number',
    min: 1,
    max: 12,
    required: true,
    weight: 15,
  },
  {
    id: 'photo_p_hours_max',
    question: '¿Cuál es tu cobertura máxima (horas)?',
    type: 'number',
    min: 1,
    max: 24,
    required: true,
    weight: 0,
  },
  {
    id: 'photo_p_price_min',
    question: 'Precio mínimo de tu servicio (CLP)',
    type: 'number',
    min: 100000,
    max: 10000000,
    step: 50000,
    required: true,
    weight: 20,
  },
  {
    id: 'photo_p_price_max',
    question: 'Precio máximo de tu servicio (CLP)',
    type: 'number',
    min: 100000,
    max: 10000000,
    step: 50000,
    required: true,
    weight: 0,
  },
  {
    id: 'photo_p_preboda',
    question: '¿Ofreces sesión pre-boda?',
    type: 'boolean',
    required: true,
    weight: 5,
  },
  {
    id: 'photo_p_postboda',
    question: '¿Ofreces sesión post-boda?',
    type: 'boolean',
    required: true,
    weight: 5,
  },
  {
    id: 'photo_p_second_shooter',
    question: '¿Ofreces segundo fotógrafo?',
    type: 'single',
    options: [
      { id: 'no', label: 'No' },
      { id: 'extra_cost', label: 'Sí, con costo adicional' },
      { id: 'included', label: 'Incluido en algunos paquetes' },
      { id: 'always', label: 'Siempre incluido' },
    ],
    required: true,
    weight: 10, // CAMBIO: subido de 5 a 10 (+5%)
  },
  {
    id: 'photo_p_delivery_time',
    question: '¿Cuál es tu tiempo de entrega habitual?',
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
    id: 'photo_p_delivery_formats',
    question: '¿Qué formatos de entrega ofreces?',
    type: 'multiple',
    options: [
      { id: 'digital_hd', label: 'Digital HD' },
      { id: 'digital_raw', label: 'Digital RAW' },
      { id: 'printed_album', label: 'Álbum impreso' },
      { id: 'usb_box', label: 'USB en caja especial' },
      { id: 'online_gallery', label: 'Galería online' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'photo_p_photo_count_min',
    question: 'Mínimo de fotos editadas que entregas',
    type: 'number',
    min: 50,
    max: 1000,
    required: true,
    weight: 5,
  },
  {
    id: 'photo_p_photo_count_max',
    question: 'Máximo de fotos editadas que entregas',
    type: 'number',
    min: 100,
    max: 2000,
    required: true,
    weight: 0,
  },
  {
    id: 'photo_p_retouching_levels',
    question: '¿Qué niveles de retoque ofreces?',
    type: 'multiple',
    options: [
      { id: 'natural', label: 'Natural / Mínimo' },
      { id: 'moderate', label: 'Moderado' },
      { id: 'editorial', label: 'Tipo revista / Alto' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'photo_p_travel',
    question: '¿Viajas fuera de tu región?',
    type: 'boolean',
    required: true,
    weight: 3,
  },
  {
    id: 'photo_p_experience_years',
    question: 'Años de experiencia en bodas',
    type: 'number',
    min: 0,
    max: 30,
    required: true,
    weight: 2,
  },
];
