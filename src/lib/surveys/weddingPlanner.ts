/**
 * Encuestas de Wedding Planner
 * Matri.AI - Sistema de Matchmaking por Categoría
 */

import { SurveyQuestion } from './types';

// Preguntas para USUARIOS sobre wedding planner
export const WEDDING_PLANNER_USER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'wp_u_service_level',
    question: '¿Qué nivel de servicio necesitas?',
    type: 'single',
    options: [
      { id: 'full', label: 'Planificación completa', description: 'Desde el inicio hasta el final' },
      { id: 'partial', label: 'Planificación parcial', description: 'Ayuda en aspectos específicos' },
      { id: 'day_of', label: 'Solo coordinación del día', description: 'Coordinación el día del evento' },
      { id: 'consultation', label: 'Solo asesoría', description: 'Consultas puntuales' },
    ],
    required: true,
    weight: 25,
  },
  {
    id: 'wp_u_budget',
    question: '¿Cuál es tu presupuesto para wedding planner?',
    type: 'single',
    options: [
      { id: 'under_500k', label: 'Menos de $500.000' },
      { id: '500k_1m', label: '$500.000 - $1.000.000' },
      { id: '1m_2m', label: '$1.000.000 - $2.000.000' },
      { id: '2m_4m', label: '$2.000.000 - $4.000.000' },
      { id: 'over_4m', label: 'Más de $4.000.000' },
    ],
    required: true,
    weight: 20,
  },
  {
    id: 'wp_u_months_until',
    question: '¿Cuántos meses faltan para tu boda?',
    type: 'single',
    options: [
      { id: 'under_3', label: 'Menos de 3 meses' },
      { id: '3_6', label: '3 - 6 meses' },
      { id: '6_12', label: '6 - 12 meses' },
      { id: 'over_12', label: 'Más de 12 meses' },
    ],
    required: true,
    weight: 10,
  },
  {
    id: 'wp_u_vendor_help',
    question: '¿Necesitas ayuda para encontrar proveedores?',
    type: 'single',
    options: [
      { id: 'all', label: 'Todos los proveedores', description: 'Necesito ayuda con todo' },
      { id: 'some', label: 'Algunos proveedores', description: 'Ya tengo algunos' },
      { id: 'none', label: 'Ya tengo mis proveedores', description: 'Solo necesito coordinación' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'wp_u_design_help',
    question: '¿Necesitas ayuda con el diseño/estética?',
    type: 'single',
    options: [
      { id: 'full', label: 'Diseño completo', description: 'Crear todo el concepto' },
      { id: 'guidance', label: 'Solo orientación', description: 'Tengo ideas pero necesito guía' },
      { id: 'none', label: 'Ya tengo definido', description: 'Solo ejecución' },
    ],
    required: true,
    weight: 10,
  },
  {
    id: 'wp_u_budget_management',
    question: '¿Necesitas gestión de presupuesto?',
    type: 'boolean',
    required: true,
    weight: 5,
  },
  {
    id: 'wp_u_timeline_management',
    question: '¿Necesitas gestión de cronograma?',
    type: 'boolean',
    required: true,
    weight: 5,
  },
  {
    id: 'wp_u_guest_management',
    question: '¿Necesitas gestión de invitados?',
    type: 'boolean',
    required: true,
    weight: 5,
  },
  {
    id: 'wp_u_rehearsal',
    question: '¿Necesitas coordinación del ensayo?',
    type: 'boolean',
    required: true,
    weight: 3,
  },
  {
    id: 'wp_u_communication_style',
    question: '¿Cómo prefieres comunicarte?',
    type: 'single',
    options: [
      { id: 'whatsapp', label: 'WhatsApp' },
      { id: 'email', label: 'Email' },
      { id: 'calls', label: 'Llamadas' },
      { id: 'meetings', label: 'Reuniones presenciales' },
      { id: 'flexible', label: 'Flexible' },
    ],
    required: true,
    weight: 2,
  },
];

// Preguntas para PROVEEDORES de wedding planner
export const WEDDING_PLANNER_PROVIDER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'wp_p_service_levels',
    question: '¿Qué niveles de servicio ofreces?',
    type: 'multiple',
    options: [
      { id: 'full', label: 'Planificación completa' },
      { id: 'partial', label: 'Planificación parcial' },
      { id: 'day_of', label: 'Solo coordinación del día' },
      { id: 'consultation', label: 'Solo asesoría' },
    ],
    required: true,
    weight: 25,
  },
  {
    id: 'wp_p_price_min',
    question: 'Precio mínimo de servicio (CLP)',
    type: 'number',
    min: 100000,
    max: 10000000,
    step: 50000,
    required: true,
    weight: 20,
  },
  {
    id: 'wp_p_price_max',
    question: 'Precio máximo de servicio (CLP)',
    type: 'number',
    min: 100000,
    max: 10000000,
    step: 50000,
    required: true,
    weight: 0,
  },
  {
    id: 'wp_p_lead_time_min',
    question: 'Tiempo mínimo de anticipación',
    type: 'single',
    options: [
      { id: 'under_3', label: 'Menos de 3 meses' },
      { id: '3_6', label: '3 - 6 meses' },
      { id: '6_12', label: '6 - 12 meses' },
    ],
    required: true,
    weight: 10,
  },
  {
    id: 'wp_p_vendor_network',
    question: '¿Tienes red de proveedores?',
    type: 'single',
    options: [
      { id: 'extensive', label: 'Extensa', description: 'Amplia red en todas las categorías' },
      { id: 'moderate', label: 'Moderada', description: 'Buenos contactos principales' },
      { id: 'limited', label: 'Limitada', description: 'Algunos contactos' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'wp_p_design_services',
    question: '¿Ofreces servicios de diseño?',
    type: 'multiple',
    options: [
      { id: 'full', label: 'Diseño completo' },
      { id: 'guidance', label: 'Orientación' },
      { id: 'moodboards', label: 'Moodboards' },
      { id: 'none', label: 'No ofrezco diseño' },
    ],
    required: true,
    weight: 10,
  },
  {
    id: 'wp_p_budget_management',
    question: '¿Ofreces gestión de presupuesto?',
    type: 'boolean',
    required: true,
    weight: 5,
  },
  {
    id: 'wp_p_timeline_management',
    question: '¿Ofreces gestión de cronograma?',
    type: 'boolean',
    required: true,
    weight: 5,
  },
  {
    id: 'wp_p_guest_management',
    question: '¿Ofreces gestión de invitados?',
    type: 'boolean',
    required: true,
    weight: 5,
  },
  {
    id: 'wp_p_rehearsal',
    question: '¿Ofreces coordinación del ensayo?',
    type: 'boolean',
    required: true,
    weight: 3,
  },
  {
    id: 'wp_p_team_size',
    question: '¿Cuántas personas en tu equipo el día del evento?',
    type: 'single',
    options: [
      { id: '1', label: 'Solo yo' },
      { id: '2', label: '2 personas' },
      { id: '3_plus', label: '3 o más' },
    ],
    required: true,
    weight: 2,
  },
  {
    id: 'wp_p_experience_years',
    question: 'Años de experiencia',
    type: 'number',
    min: 0,
    max: 20,
    required: true,
    weight: 0,
  },
];












