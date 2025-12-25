/**
 * Encuestas de Maquillaje & Peinado
 * Matri.AI - Sistema de Matchmaking por Categoría
 */

import { SurveyQuestion } from './types';

// Preguntas para USUARIOS sobre maquillaje & peinado
export const MAKEUP_USER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'makeup_u_style',
    question: '¿Qué estilo de maquillaje prefieres?',
    type: 'single',
    options: [
      { id: 'natural', label: 'Natural / Fresco', description: 'Realza tu belleza natural' },
      { id: 'classic', label: 'Clásico / Elegante', description: 'Atemporal y sofisticado' },
      { id: 'glamorous', label: 'Glamoroso', description: 'Impactante y brillante' },
      { id: 'editorial', label: 'Editorial / Dramático', description: 'Estilo de revista' },
      { id: 'romantic', label: 'Romántico / Suave', description: 'Delicado y femenino' },
      { id: 'boho', label: 'Bohemio', description: 'Relajado y artístico' },
    ],
    required: true,
    weight: 25,
  },
  {
    id: 'makeup_u_budget',
    question: '¿Cuál es tu presupuesto?',
    type: 'single',
    options: [
      { id: 'under_100k', label: 'Menos de $100.000' },
      { id: '100k_200k', label: '$100.000 - $200.000' },
      { id: '200k_350k', label: '$200.000 - $350.000' },
      { id: 'over_350k', label: 'Más de $350.000' },
    ],
    required: true,
    weight: 20,
  },
  {
    id: 'makeup_u_trial',
    question: '¿Necesitas prueba de maquillaje?',
    type: 'single',
    options: [
      { id: 'required', label: 'Indispensable', description: 'Necesito probar antes' },
      { id: 'preferred', label: 'Preferible', description: 'Me gustaría pero no es obligatorio' },
      { id: 'not_needed', label: 'No necesario', description: 'Confío en el profesional' },
    ],
    required: true,
    weight: 10,
  },
  {
    id: 'makeup_u_hair',
    question: '¿Necesitas servicio de peinado?',
    type: 'boolean',
    required: true,
    weight: 15,
  },
  {
    id: 'makeup_u_hair_style',
    question: '¿Qué estilo de peinado prefieres?',
    type: 'single',
    options: [
      { id: 'updo', label: 'Recogido' },
      { id: 'half_up', label: 'Semi-recogido' },
      { id: 'down', label: 'Suelto' },
      { id: 'braids', label: 'Trenzas' },
      { id: 'undecided', label: 'Indecisa' },
    ],
    required: true,
    weight: 10,
  },
  {
    id: 'makeup_u_extensions',
    question: '¿Necesitas extensiones de cabello?',
    type: 'boolean',
    required: true,
    weight: 3,
  },
  {
    id: 'makeup_u_lashes',
    question: '¿Quieres pestañas postizas?',
    type: 'single',
    options: [
      { id: 'no', label: 'No' },
      { id: 'natural', label: 'Naturales', description: 'Sutiles' },
      { id: 'dramatic', label: 'Dramáticas', description: 'Impactantes' },
      { id: 'undecided', label: 'Indecisa' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'makeup_u_bridesmaids',
    question: '¿Necesitas servicio para cortejo?',
    type: 'single',
    options: [
      { id: 'no', label: 'No' },
      { id: 'some', label: 'Algunas personas' },
      { id: 'full', label: 'Cortejo completo' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'makeup_u_bridesmaids_count',
    question: '¿Cuántas personas del cortejo?',
    type: 'number',
    min: 0,
    max: 15,
    required: false,
    weight: 0,
  },
  {
    id: 'makeup_u_mothers',
    question: '¿Incluir madres?',
    type: 'boolean',
    required: true,
    weight: 3,
  },
  {
    id: 'makeup_u_touch_ups',
    question: '¿Necesitas retoques durante el evento?',
    type: 'single',
    options: [
      { id: 'no', label: 'No' },
      { id: 'kit', label: 'Solo kit de retoque', description: 'Me lo deja para usar' },
      { id: 'person', label: 'Persona presente', description: 'Alguien disponible en el evento' },
    ],
    required: true,
    weight: 4,
  },
];

// Preguntas para PROVEEDORES de maquillaje & peinado
export const MAKEUP_PROVIDER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'makeup_p_styles',
    question: '¿Qué estilos de maquillaje ofreces?',
    type: 'multiple',
    options: [
      { id: 'natural', label: 'Natural / Fresco' },
      { id: 'classic', label: 'Clásico / Elegante' },
      { id: 'glamorous', label: 'Glamoroso' },
      { id: 'editorial', label: 'Editorial / Dramático' },
      { id: 'romantic', label: 'Romántico / Suave' },
      { id: 'boho', label: 'Bohemio' },
    ],
    required: true,
    weight: 25,
  },
  {
    id: 'makeup_p_price_bride',
    question: 'Precio para novia (maquillaje + peinado) CLP',
    type: 'number',
    min: 50000,
    max: 500000,
    step: 10000,
    required: true,
    weight: 20,
  },
  {
    id: 'makeup_p_price_bridesmaid',
    question: 'Precio por persona del cortejo (CLP)',
    type: 'number',
    min: 20000,
    max: 200000,
    step: 5000,
    required: true,
    weight: 0,
  },
  {
    id: 'makeup_p_trial',
    question: '¿Ofreces prueba de maquillaje?',
    type: 'single',
    options: [
      { id: 'yes_free', label: 'Sí, gratis' },
      { id: 'yes_paid', label: 'Sí, con costo' },
      { id: 'no', label: 'No' },
    ],
    required: true,
    weight: 10,
  },
  {
    id: 'makeup_p_hair',
    question: '¿Ofreces servicio de peinado?',
    type: 'boolean',
    required: true,
    weight: 15,
  },
  {
    id: 'makeup_p_hair_styles',
    question: '¿Qué estilos de peinado ofreces?',
    type: 'multiple',
    options: [
      { id: 'updo', label: 'Recogido' },
      { id: 'half_up', label: 'Semi-recogido' },
      { id: 'down', label: 'Suelto' },
      { id: 'braids', label: 'Trenzas' },
    ],
    required: true,
    weight: 10,
  },
  {
    id: 'makeup_p_extensions',
    question: '¿Trabajas con extensiones?',
    type: 'boolean',
    required: true,
    weight: 3,
  },
  {
    id: 'makeup_p_lashes',
    question: '¿Ofreces pestañas postizas?',
    type: 'single',
    options: [
      { id: 'no', label: 'No' },
      { id: 'natural', label: 'Naturales' },
      { id: 'dramatic', label: 'Dramáticas' },
      { id: 'both', label: 'Ambas' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'makeup_p_team_size',
    question: '¿Cuántas personas en tu equipo?',
    type: 'single',
    options: [
      { id: '1', label: 'Solo yo' },
      { id: '2', label: '2 personas' },
      { id: '3_plus', label: '3 o más' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'makeup_p_max_clients',
    question: 'Máximo de personas que atiendes por evento',
    type: 'number',
    min: 1,
    max: 20,
    required: true,
    weight: 5,
  },
  {
    id: 'makeup_p_touch_ups',
    question: '¿Ofreces retoques durante el evento?',
    type: 'single',
    options: [
      { id: 'no', label: 'No' },
      { id: 'kit', label: 'Solo kit de retoque' },
      { id: 'person', label: 'Persona presente' },
    ],
    required: true,
    weight: 4,
  },
  {
    id: 'makeup_p_location',
    question: '¿Dónde ofreces el servicio?',
    type: 'multiple',
    options: [
      { id: 'home', label: 'A domicilio' },
      { id: 'salon', label: 'En salón' },
      { id: 'venue', label: 'En el lugar del evento' },
    ],
    required: true,
    weight: 3,
  },
  {
    id: 'makeup_p_travel',
    question: '¿Viajas fuera de tu zona?',
    type: 'boolean',
    required: true,
    weight: 0,
  },
];











