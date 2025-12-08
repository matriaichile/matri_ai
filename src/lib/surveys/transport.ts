/**
 * Encuestas de Transporte
 * Matri.AI - Sistema de Matchmaking por Categoría
 * 
 * Creado según especificaciones de AJUSTES_ENCUESTAS_Y_NUEVAS_CATEGORIAS.md
 * Cubre transporte para novios, invitados y servicios relacionados.
 */

import { SurveyQuestion } from './types';

// Preguntas para USUARIOS sobre transporte (Auto de Novios)
// CAMBIO: Simplificado según correcciones - eliminar preguntas innecesarias
export const TRANSPORT_USER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'transport_u_vehicle_type',
    question: '¿Qué tipo de vehículo prefieres para los novios?',
    type: 'single',
    options: [
      { id: 'classic_car', label: 'Auto clásico / Vintage', description: 'Autos antiguos elegantes' },
      { id: 'luxury_car', label: 'Auto de lujo', description: 'Mercedes, BMW, Audi, etc.' },
      { id: 'limousine', label: 'Limusina', description: 'Limusina tradicional' },
      { id: 'convertible', label: 'Convertible', description: 'Auto descapotable' },
      { id: 'carriage', label: 'Carruaje', description: 'Carruaje con caballos' },
      { id: 'sports_car', label: 'Auto deportivo', description: 'Ferrari, Porsche, etc.' },
      { id: 'motorcycle', label: 'Motocicleta', description: 'Harley, Vespa, etc.' },
      { id: 'no_preference', label: 'Sin preferencia' },
    ],
    required: true,
    weight: 25,
  },
  {
    id: 'transport_u_route',
    question: '¿Qué ruta necesitas?',
    type: 'single',
    options: [
      { id: 'church_venue', label: 'Iglesia → Evento' },
      { id: 'home_church', label: 'Casa → Iglesia' },
      { id: 'full_route', label: 'Ruta completa', description: 'Casa → Iglesia → Evento' },
    ],
    required: true,
    weight: 20,
  },
  {
    id: 'transport_u_hours',
    question: '¿Por cuántas horas necesitas el servicio?',
    type: 'single',
    options: [
      { id: '2', label: '2 horas' },
      { id: '4', label: '4 horas' },
      { id: '6', label: '6 horas' },
      { id: '8', label: '8 horas' },
      { id: 'full_day', label: 'Día completo' },
    ],
    required: true,
    weight: 20,
  },
  {
    id: 'transport_u_budget',
    question: '¿Cuál es tu presupuesto para transporte?',
    type: 'single',
    options: [
      { id: 'under_200k', label: 'Menos de $200.000' },
      { id: '200k_400k', label: '$200.000 - $400.000' },
      { id: '400k_700k', label: '$400.000 - $700.000' },
      { id: '700k_1200k', label: '$700.000 - $1.200.000' },
      { id: 'over_1200k', label: 'Más de $1.200.000' },
      { id: 'skip', label: 'Omitir' },
    ],
    required: true,
    weight: 20,
  },
  {
    id: 'transport_u_decoration',
    question: '¿Quieres decoración en el vehículo de novios?',
    type: 'single',
    options: [
      { id: 'yes', label: 'Sí, con decoración' },
      { id: 'simple', label: 'Decoración simple', description: 'Cintas, flores básicas' },
      { id: 'no', label: 'No, sin decoración' },
    ],
    required: true,
    weight: 10,
  },
  {
    id: 'transport_u_driver',
    question: '¿Necesitas chofer profesional?',
    type: 'single',
    options: [
      { id: 'yes_formal', label: 'Sí, con uniforme formal' },
      { id: 'yes_casual', label: 'Sí, vestimenta casual' },
      { id: 'no', label: 'No, manejaré yo' },
    ],
    required: true,
    weight: 5,
  },
];

// Preguntas para PROVEEDORES de transporte (Auto de Novios)
// CAMBIO: Simplificado según correcciones
export const TRANSPORT_PROVIDER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'transport_p_vehicle_types',
    question: '¿Qué tipos de vehículos tienes disponibles?',
    type: 'multiple',
    options: [
      { id: 'classic_car', label: 'Auto clásico / Vintage' },
      { id: 'luxury_car', label: 'Auto de lujo' },
      { id: 'limousine', label: 'Limusina' },
      { id: 'convertible', label: 'Convertible' },
      { id: 'carriage', label: 'Carruaje' },
      { id: 'sports_car', label: 'Auto deportivo' },
      { id: 'motorcycle', label: 'Motocicleta' },
    ],
    required: true,
    weight: 25,
  },
  {
    id: 'transport_p_price_min',
    question: 'Precio mínimo del servicio (CLP)',
    type: 'number',
    min: 50000,
    max: 2000000,
    step: 25000,
    required: true,
    weight: 15,
  },
  {
    id: 'transport_p_price_max',
    question: 'Precio máximo del servicio (CLP)',
    type: 'number',
    min: 100000,
    max: 5000000,
    step: 25000,
    required: true,
    weight: 0,
  },
  {
    id: 'transport_p_decoration',
    question: '¿Ofreces decoración del vehículo?',
    type: 'single',
    options: [
      { id: 'yes_included', label: 'Sí, incluida' },
      { id: 'yes_extra', label: 'Sí, con costo adicional' },
      { id: 'no', label: 'No' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'transport_p_driver',
    question: '¿Incluyes chofer profesional?',
    type: 'single',
    options: [
      { id: 'yes_formal', label: 'Sí, con uniforme formal' },
      { id: 'yes_casual', label: 'Sí, vestimenta casual' },
      { id: 'optional', label: 'Opcional' },
      { id: 'no', label: 'No, solo arriendo vehículo' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'transport_p_hours_min',
    question: 'Mínimo de horas de servicio',
    type: 'number',
    min: 1,
    max: 12,
    required: true,
    weight: 5,
  },
  {
    id: 'transport_p_hours_max',
    question: 'Máximo de horas de servicio',
    type: 'number',
    min: 2,
    max: 24,
    required: true,
    weight: 0,
  },
  {
    id: 'transport_p_extras',
    question: '¿Qué extras ofreces?',
    type: 'multiple',
    options: [
      { id: 'champagne', label: 'Champagne / Bebidas' },
      { id: 'music', label: 'Sistema de música' },
      { id: 'red_carpet', label: 'Alfombra roja' },
      { id: 'photos', label: 'Sesión de fotos con vehículo' },
      { id: 'none', label: 'Sin extras' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'transport_p_travel',
    question: '¿Viajas fuera de tu zona?',
    type: 'boolean',
    required: true,
    weight: 0,
  },
];





