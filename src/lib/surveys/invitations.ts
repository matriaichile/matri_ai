/**
 * Encuestas de Papelería
 * Matri.AI - Sistema de Matchmaking por Categoría
 * 
 * Creado según especificaciones de AJUSTES_ENCUESTAS_Y_NUEVAS_CATEGORIAS.md
 * Cubre invitaciones físicas, digitales y papelería de boda.
 */

import { SurveyQuestion } from './types';

// Preguntas para USUARIOS sobre invitaciones
export const INVITATIONS_USER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'inv_u_type',
    question: '¿Qué tipo de invitaciones prefieres?',
    type: 'multiple', // CAMBIO: era 'single', ahora es múltiple
    options: [
      { id: 'printed', label: 'Impresas / Físicas', description: 'Invitaciones tradicionales' },
      { id: 'digital', label: 'Digitales', description: 'Para enviar por WhatsApp/Email' },
      { id: 'video', label: 'Video invitación', description: 'Invitación animada en video' },
    ],
    required: true,
    weight: 25,
  },
  {
    id: 'inv_u_quantity',
    question: '¿Cuántas invitaciones necesitas?',
    type: 'single',
    options: [
      { id: 'under_50', label: 'Menos de 50' },
      { id: '50_100', label: '50 - 100' },
      { id: '100_150', label: '100 - 150' },
      { id: '150_200', label: '150 - 200' },
      { id: 'over_200', label: 'Más de 200' },
      { id: 'skip', label: 'Omitir' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'inv_u_style',
    question: '¿Qué estilo de diseño prefieres?',
    type: 'single',
    options: [
      { id: 'classic', label: 'Clásico / Elegante', description: 'Tradicional y sofisticado' },
      { id: 'modern', label: 'Moderno / Minimalista', description: 'Líneas limpias' },
      { id: 'rustic', label: 'Rústico', description: 'Natural y campestre' },
      { id: 'romantic', label: 'Romántico', description: 'Delicado y femenino' },
      { id: 'bohemian', label: 'Bohemio', description: 'Artístico y libre' },
      { id: 'glamorous', label: 'Glamoroso', description: 'Lujoso con detalles' },
      { id: 'vintage', label: 'Vintage', description: 'Estilo retro' },
      { id: 'custom', label: 'Personalizado', description: 'Diseño único' },
    ],
    required: true,
    weight: 20,
  },
  {
    id: 'inv_u_extras',
    question: '¿Qué elementos adicionales necesitas?',
    type: 'multiple',
    options: [
      { id: 'save_the_date', label: 'Save the Date' },
      { id: 'rsvp', label: 'Tarjetas RSVP' },
      { id: 'menu', label: 'Menú' },
      { id: 'place_cards', label: 'Tarjetas de ubicación' },
      { id: 'thank_you', label: 'Tarjetas de agradecimiento' },
      { id: 'programs', label: 'Programas de ceremonia' },
      { id: 'envelope', label: 'Sobres personalizados' },
      { id: 'sealing_wax', label: 'Lacre / Sello de cera' },
      { id: 'none', label: 'Solo invitaciones' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'inv_u_budget',
    question: '¿Cuál es tu presupuesto para invitaciones?',
    type: 'single',
    options: [
      { id: 'under_100k', label: 'Menos de $100.000' },
      { id: '100k_200k', label: '$100.000 - $200.000' },
      { id: '200k_400k', label: '$200.000 - $400.000' },
      { id: '400k_600k', label: '$400.000 - $600.000' },
      { id: 'over_600k', label: 'Más de $600.000' },
      { id: 'skip', label: 'Omitir' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'inv_u_paper',
    question: '¿Qué tipo de papel prefieres? (solo para impresas)',
    type: 'single',
    options: [
      { id: 'standard', label: 'Estándar', description: 'Papel couché o similar' },
      { id: 'cotton', label: 'Algodón', description: 'Textura premium' },
      { id: 'recycled', label: 'Reciclado', description: 'Ecológico' },
      { id: 'textured', label: 'Texturizado', description: 'Con relieve' },
      { id: 'transparent', label: 'Acrílico / Transparente' },
      { id: 'no_preference', label: 'Sin preferencia' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'inv_u_printing',
    question: '¿Qué técnica de impresión prefieres?',
    type: 'single',
    options: [
      { id: 'digital', label: 'Digital', description: 'Económica y versátil' },
      { id: 'letterpress', label: 'Letterpress', description: 'Relieve tradicional' },
      { id: 'foil', label: 'Hot stamping / Foil', description: 'Detalles metalizados' },
      { id: 'embossed', label: 'Embossing', description: 'Relieve sin tinta' },
      { id: 'laser_cut', label: 'Corte láser', description: 'Diseños calados' },
      { id: 'no_preference', label: 'Sin preferencia' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'inv_u_timeline',
    question: '¿Cuándo necesitas las invitaciones?',
    type: 'single',
    options: [
      { id: '2_weeks', label: '2 semanas' },
      { id: '1_month', label: '1 mes' },
      { id: '2_months', label: '2 meses' },
      { id: '3_months', label: '3 meses o más' },
      { id: 'flexible', label: 'Flexible' },
    ],
    required: true,
    weight: 5,
  },
];

// Preguntas para PROVEEDORES de invitaciones
export const INVITATIONS_PROVIDER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'inv_p_types',
    question: '¿Qué tipos de invitaciones ofreces?',
    type: 'multiple',
    options: [
      { id: 'printed', label: 'Impresas / Físicas' },
      { id: 'digital', label: 'Digitales' },
      { id: 'video', label: 'Video invitación' },
    ],
    required: true,
    weight: 25,
  },
  {
    id: 'inv_p_styles',
    question: '¿Qué estilos de diseño manejas?',
    type: 'multiple',
    options: [
      { id: 'classic', label: 'Clásico / Elegante' },
      { id: 'modern', label: 'Moderno / Minimalista' },
      { id: 'rustic', label: 'Rústico' },
      { id: 'romantic', label: 'Romántico' },
      { id: 'bohemian', label: 'Bohemio' },
      { id: 'glamorous', label: 'Glamoroso' },
      { id: 'vintage', label: 'Vintage' },
      { id: 'custom', label: 'Personalizado' },
    ],
    required: true,
    weight: 20,
  },
  {
    id: 'inv_p_extras',
    question: '¿Qué papelería adicional ofreces?',
    type: 'multiple',
    options: [
      { id: 'save_the_date', label: 'Save the Date' },
      { id: 'rsvp', label: 'Tarjetas RSVP' },
      { id: 'menu', label: 'Menú' },
      { id: 'place_cards', label: 'Tarjetas de ubicación' },
      { id: 'thank_you', label: 'Tarjetas de agradecimiento' },
      { id: 'programs', label: 'Programas de ceremonia' },
      { id: 'envelope', label: 'Sobres personalizados' },
      { id: 'sealing_wax', label: 'Lacre / Sello de cera' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'inv_p_price_min',
    question: 'Precio mínimo por invitación (CLP)',
    type: 'number',
    min: 500,
    max: 20000,
    step: 500,
    required: true,
    weight: 15,
  },
  {
    id: 'inv_p_price_max',
    question: 'Precio máximo por invitación (CLP)',
    type: 'number',
    min: 1000,
    max: 50000,
    step: 500,
    required: true,
    weight: 0,
  },
  {
    id: 'inv_p_min_quantity',
    question: 'Cantidad mínima de pedido',
    type: 'number',
    min: 10,
    max: 100,
    required: true,
    weight: 15,
  },
  {
    id: 'inv_p_papers',
    question: '¿Qué tipos de papel trabajas?',
    type: 'multiple',
    options: [
      { id: 'standard', label: 'Estándar' },
      { id: 'cotton', label: 'Algodón' },
      { id: 'recycled', label: 'Reciclado' },
      { id: 'textured', label: 'Texturizado' },
      { id: 'transparent', label: 'Acrílico / Transparente' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'inv_p_printing',
    question: '¿Qué técnicas de impresión ofreces?',
    type: 'multiple',
    options: [
      { id: 'digital', label: 'Digital' },
      { id: 'letterpress', label: 'Letterpress' },
      { id: 'foil', label: 'Hot stamping / Foil' },
      { id: 'embossed', label: 'Embossing' },
      { id: 'laser_cut', label: 'Corte láser' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'inv_p_lead_time',
    question: '¿Cuál es tu tiempo de entrega habitual?',
    type: 'single',
    options: [
      { id: '1_week', label: '1 semana' },
      { id: '2_weeks', label: '2 semanas' },
      { id: '3_weeks', label: '3 semanas' },
      { id: '1_month', label: '1 mes' },
      { id: 'over_1_month', label: 'Más de 1 mes' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'inv_p_samples',
    question: '¿Ofreces muestras previas?',
    type: 'single',
    options: [
      { id: 'yes_free', label: 'Sí, gratis' },
      { id: 'yes_paid', label: 'Sí, con costo' },
      { id: 'digital_only', label: 'Solo prueba digital' },
      { id: 'no', label: 'No' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'inv_p_shipping',
    question: '¿Ofreces envío?',
    type: 'single',
    options: [
      { id: 'yes_included', label: 'Sí, incluido' },
      { id: 'yes_extra', label: 'Sí, con costo adicional' },
      { id: 'pickup_only', label: 'Solo retiro' },
    ],
    required: true,
    weight: 0,
  },
];





