/**
 * Encuestas de Tortas & Dulces
 * Matri.AI - Sistema de Matchmaking por Categoría
 * 
 * Creado según especificaciones de AJUSTES_ENCUESTAS_Y_NUEVAS_CATEGORIAS.md
 * Cubre tortas de novios, mesas de dulces y postres especiales.
 */

import { SurveyQuestion } from './types';

// Preguntas para USUARIOS sobre tortas y dulces
export const CAKES_USER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'cakes_u_type',
    question: '¿Qué tipo de torta o dulces necesitas?',
    type: 'multiple',
    options: [
      { id: 'wedding_cake', label: 'Torta de novios tradicional' },
      { id: 'naked_cake', label: 'Naked cake', description: 'Sin cobertura externa' },
      { id: 'fondant', label: 'Torta con fondant', description: 'Decoración elaborada' },
      { id: 'buttercream', label: 'Torta con buttercream', description: 'Crema de mantequilla' },
      { id: 'dessert_table', label: 'Mesa de dulces completa' },
      { id: 'cupcakes', label: 'Cupcakes' },
      { id: 'macarons', label: 'Macarons' },
      { id: 'donuts', label: 'Donuts' },
      { id: 'mini_desserts', label: 'Mini postres variados' },
    ],
    required: true,
    weight: 25,
  },
  {
    id: 'cakes_u_servings',
    question: '¿Para cuántas porciones necesitas la torta?',
    type: 'single',
    options: [
      { id: 'under_50', label: 'Menos de 50 porciones' },
      { id: '50_100', label: '50 - 100 porciones' },
      { id: '100_150', label: '100 - 150 porciones' },
      { id: '150_200', label: '150 - 200 porciones' },
      { id: 'over_200', label: 'Más de 200 porciones' },
      { id: 'skip', label: 'Omitir' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'cakes_u_tiers',
    question: '¿Cuántos pisos te gustaría que tenga la torta?',
    type: 'single',
    options: [
      { id: '1', label: '1 piso' },
      { id: '2', label: '2 pisos' },
      { id: '3', label: '3 pisos' },
      { id: '4_plus', label: '4 o más pisos' },
      { id: 'no_preference', label: 'Sin preferencia' },
    ],
    required: true,
    weight: 10,
  },
  {
    id: 'cakes_u_flavor',
    question: '¿Qué sabores prefieres?',
    type: 'multiple',
    options: [
      { id: 'vanilla', label: 'Vainilla' },
      { id: 'chocolate', label: 'Chocolate' },
      { id: 'red_velvet', label: 'Red velvet' },
      { id: 'lemon', label: 'Limón' },
      { id: 'carrot', label: 'Zanahoria' },
      { id: 'fruit', label: 'Frutas' },
      { id: 'dulce_leche', label: 'Dulce de leche' },
      { id: 'coffee', label: 'Café / Moka' },
      { id: 'mixed', label: 'Diferentes sabores por piso' },
      { id: 'other', label: 'Otro' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'cakes_u_style',
    question: '¿Qué estilo de decoración prefieres?',
    type: 'single',
    options: [
      { id: 'classic', label: 'Clásico / Elegante', description: 'Tradicional y sofisticado' },
      { id: 'modern', label: 'Moderno / Minimalista', description: 'Líneas limpias' },
      { id: 'rustic', label: 'Rústico', description: 'Natural y campestre' },
      { id: 'romantic', label: 'Romántico', description: 'Flores y detalles delicados' },
      { id: 'glamorous', label: 'Glamoroso', description: 'Dorado, brillos' },
      { id: 'whimsical', label: 'Fantasía', description: 'Creativo y único' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'cakes_u_budget',
    question: '¿Cuál es tu presupuesto para torta/dulces?',
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
    id: 'cakes_u_dietary',
    question: '¿Necesitas opciones especiales?',
    type: 'multiple',
    options: [
      { id: 'gluten_free', label: 'Sin gluten' },
      { id: 'vegan', label: 'Vegana' },
      { id: 'sugar_free', label: 'Sin azúcar' },
      { id: 'lactose_free', label: 'Sin lactosa' },
      { id: 'none', label: 'Ninguna' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'cakes_u_tasting',
    question: '¿Quieres degustación previa?',
    type: 'single',
    options: [
      { id: 'required', label: 'Indispensable' },
      { id: 'preferred', label: 'Preferible' },
      { id: 'not_needed', label: 'No necesario' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'cakes_u_delivery',
    question: '¿Necesitas entrega y montaje en el lugar?',
    type: 'single',
    options: [
      { id: 'yes', label: 'Sí, entrega y montaje' },
      { id: 'delivery_only', label: 'Solo entrega' },
      { id: 'pickup', label: 'Yo la retiro' },
    ],
    required: true,
    weight: 5,
  },
];

// Preguntas para PROVEEDORES de tortas y dulces
export const CAKES_PROVIDER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'cakes_p_types',
    question: '¿Qué tipo de tortas y dulces ofreces?',
    type: 'multiple',
    options: [
      { id: 'wedding_cake', label: 'Torta de novios tradicional' },
      { id: 'naked_cake', label: 'Naked cake' },
      { id: 'fondant', label: 'Torta con fondant' },
      { id: 'buttercream', label: 'Torta con buttercream' },
      { id: 'dessert_table', label: 'Mesa de dulces completa' },
      { id: 'cupcakes', label: 'Cupcakes' },
      { id: 'macarons', label: 'Macarons' },
      { id: 'donuts', label: 'Donuts' },
      { id: 'mini_desserts', label: 'Mini postres variados' },
    ],
    required: true,
    weight: 25,
  },
  {
    id: 'cakes_p_servings_min',
    question: 'Mínimo de porciones que preparas',
    type: 'number',
    min: 10,
    max: 200,
    required: true,
    weight: 15,
  },
  {
    id: 'cakes_p_servings_max',
    question: 'Máximo de porciones que preparas',
    type: 'number',
    min: 50,
    max: 500,
    required: true,
    weight: 0,
  },
  {
    id: 'cakes_p_tiers_max',
    question: '¿Hasta cuántos pisos puedes hacer?',
    type: 'single',
    options: [
      { id: '1', label: '1 piso' },
      { id: '2', label: '2 pisos' },
      { id: '3', label: '3 pisos' },
      { id: '4', label: '4 pisos' },
      { id: '5_plus', label: '5 o más pisos' },
    ],
    required: true,
    weight: 10,
  },
  {
    id: 'cakes_p_flavors',
    question: '¿Qué sabores ofreces?',
    type: 'multiple',
    options: [
      { id: 'vanilla', label: 'Vainilla' },
      { id: 'chocolate', label: 'Chocolate' },
      { id: 'red_velvet', label: 'Red velvet' },
      { id: 'lemon', label: 'Limón' },
      { id: 'carrot', label: 'Zanahoria' },
      { id: 'fruit', label: 'Frutas' },
      { id: 'dulce_leche', label: 'Dulce de leche' },
      { id: 'coffee', label: 'Café / Moka' },
      { id: 'custom', label: 'Sabores personalizados' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'cakes_p_styles',
    question: '¿Qué estilos de decoración manejas?',
    type: 'multiple',
    options: [
      { id: 'classic', label: 'Clásico / Elegante' },
      { id: 'modern', label: 'Moderno / Minimalista' },
      { id: 'rustic', label: 'Rústico' },
      { id: 'romantic', label: 'Romántico' },
      { id: 'glamorous', label: 'Glamoroso' },
      { id: 'whimsical', label: 'Fantasía' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'cakes_p_price_min',
    question: 'Precio mínimo de torta de novios (CLP)',
    type: 'number',
    min: 30000,
    max: 1000000,
    step: 10000,
    required: true,
    weight: 15,
  },
  {
    id: 'cakes_p_price_max',
    question: 'Precio máximo de torta de novios (CLP)',
    type: 'number',
    min: 50000,
    max: 2000000,
    step: 10000,
    required: true,
    weight: 0,
  },
  {
    id: 'cakes_p_dietary',
    question: '¿Qué opciones especiales ofreces?',
    type: 'multiple',
    options: [
      { id: 'gluten_free', label: 'Sin gluten' },
      { id: 'vegan', label: 'Vegana' },
      { id: 'sugar_free', label: 'Sin azúcar' },
      { id: 'lactose_free', label: 'Sin lactosa' },
      { id: 'none', label: 'Ninguna' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'cakes_p_tasting',
    question: '¿Ofreces degustación previa?',
    type: 'single',
    options: [
      { id: 'yes_free', label: 'Sí, gratis' },
      { id: 'yes_paid', label: 'Sí, con costo' },
      { id: 'no', label: 'No' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'cakes_p_delivery',
    question: '¿Ofreces entrega y montaje?',
    type: 'single',
    options: [
      { id: 'yes_included', label: 'Sí, incluido' },
      { id: 'yes_extra', label: 'Sí, con costo adicional' },
      { id: 'delivery_only', label: 'Solo entrega' },
      { id: 'no', label: 'No, solo retiro' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'cakes_p_lead_time',
    question: '¿Con cuánta anticipación necesitas el pedido?',
    type: 'single',
    options: [
      { id: '1_week', label: '1 semana' },
      { id: '2_weeks', label: '2 semanas' },
      { id: '1_month', label: '1 mes' },
      { id: '2_months', label: '2 meses o más' },
    ],
    required: true,
    weight: 0,
  },
];












