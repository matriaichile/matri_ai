/**
 * Encuestas de Entretenimiento
 * Matri.AI - Sistema de Matchmaking por Categoría
 * 
 * Creado según especificaciones de AJUSTES_ENCUESTAS_Y_NUEVAS_CATEGORIAS.md
 * Cubre shows, animación, juegos y actividades de entretenimiento para el evento.
 */

import { SurveyQuestion } from './types';

// Preguntas para USUARIOS sobre entretenimiento
export const ENTERTAINMENT_USER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'ent_u_type',
    question: '¿Qué tipo de entretenimiento buscas?',
    type: 'multiple',
    options: [
      { id: 'live_band', label: 'Banda en vivo', description: 'Música en vivo' },
      { id: 'solo_artist', label: 'Artista solista', description: 'Cantante o músico' },
      { id: 'dancers', label: 'Show de baile', description: 'Bailarines profesionales' },
      { id: 'magician', label: 'Mago / Ilusionista', description: 'Magia y trucos' },
      { id: 'comedian', label: 'Comediante / Stand-up', description: 'Humor en vivo' },
      { id: 'photo_booth', label: 'Cabina de fotos', description: 'Photo booth con props' },
      { id: 'caricaturist', label: 'Caricaturista', description: 'Dibujos en vivo' },
      { id: 'fireworks', label: 'Fuegos artificiales', description: 'Show pirotécnico' },
      { id: 'casino', label: 'Casino / Juegos', description: 'Mesas de casino' },
      { id: 'karaoke_pro', label: 'Karaoke profesional', description: 'Sistema de karaoke' },
      { id: 'mariachi', label: 'Mariachi', description: 'Música mexicana' },
      { id: 'other', label: 'Otro', description: 'Especificar' },
    ],
    required: true,
    weight: 30,
  },
  {
    id: 'ent_u_moment',
    question: '¿En qué momento del evento necesitas el entretenimiento?',
    type: 'multiple',
    options: [
      { id: 'ceremony', label: 'Durante la ceremonia' },
      { id: 'cocktail', label: 'Durante el cóctel' },
      { id: 'dinner', label: 'Durante la cena' },
      { id: 'party', label: 'Durante la fiesta' },
      { id: 'special_moment', label: 'Momento especial', description: 'Entrada, primer baile, etc.' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'ent_u_duration',
    question: '¿Cuánto tiempo de show necesitas?',
    type: 'single',
    options: [
      { id: '30min', label: '30 minutos' },
      { id: '1hr', label: '1 hora' },
      { id: '2hr', label: '2 horas' },
      { id: '3hr', label: '3 horas' },
      { id: 'full_event', label: 'Todo el evento' },
      { id: 'flexible', label: 'Flexible' },
    ],
    required: true,
    weight: 10,
  },
  {
    id: 'ent_u_budget',
    question: '¿Cuál es tu presupuesto para entretenimiento?',
    type: 'single',
    options: [
      { id: 'under_300k', label: 'Menos de $300.000' },
      { id: '300k_500k', label: '$300.000 - $500.000' },
      { id: '500k_800k', label: '$500.000 - $800.000' },
      { id: '800k_1500k', label: '$800.000 - $1.500.000' },
      { id: 'over_1500k', label: 'Más de $1.500.000' },
      { id: 'skip', label: 'Omitir' },
    ],
    required: true,
    weight: 20,
  },
  {
    id: 'ent_u_style',
    question: '¿Qué estilo de entretenimiento prefieres?',
    type: 'single',
    options: [
      { id: 'elegant', label: 'Elegante / Sofisticado', description: 'Ambiente refinado' },
      { id: 'fun', label: 'Divertido / Animado', description: 'Mucha energía' },
      { id: 'romantic', label: 'Romántico', description: 'Ambiente íntimo' },
      { id: 'interactive', label: 'Interactivo', description: 'Participación de invitados' },
      { id: 'surprise', label: 'Sorpresa', description: 'Algo inesperado' },
    ],
    required: true,
    weight: 10,
  },
  {
    id: 'ent_u_audience',
    question: '¿Para qué tipo de audiencia es el entretenimiento?',
    type: 'single',
    options: [
      { id: 'adults_only', label: 'Solo adultos' },
      { id: 'family', label: 'Familiar', description: 'Incluye niños' },
      { id: 'mixed', label: 'Mixto', description: 'Diferentes edades' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'ent_u_space',
    question: '¿Tienes espacio adecuado para el show?',
    type: 'single',
    options: [
      { id: 'yes_stage', label: 'Sí, con escenario' },
      { id: 'yes_space', label: 'Sí, espacio amplio sin escenario' },
      { id: 'limited', label: 'Espacio limitado' },
      { id: 'need_advice', label: 'Necesito asesoría' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'ent_u_equipment',
    question: '¿Necesitas que el proveedor traiga su equipo de sonido?',
    type: 'single',
    options: [
      { id: 'yes', label: 'Sí, necesito todo el equipo' },
      { id: 'partial', label: 'Solo algunos elementos' },
      { id: 'no', label: 'No, ya tengo sonido' },
    ],
    required: true,
    weight: 5,
  },
];

// Preguntas para PROVEEDORES de entretenimiento
export const ENTERTAINMENT_PROVIDER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'ent_p_types',
    question: '¿Qué tipo de entretenimiento ofreces?',
    type: 'multiple',
    options: [
      { id: 'live_band', label: 'Banda en vivo' },
      { id: 'solo_artist', label: 'Artista solista' },
      { id: 'dancers', label: 'Show de baile' },
      { id: 'magician', label: 'Mago / Ilusionista' },
      { id: 'comedian', label: 'Comediante / Stand-up' },
      { id: 'photo_booth', label: 'Cabina de fotos' },
      { id: 'caricaturist', label: 'Caricaturista' },
      { id: 'fireworks', label: 'Fuegos artificiales' },
      { id: 'casino', label: 'Casino / Juegos' },
      { id: 'karaoke_pro', label: 'Karaoke profesional' },
      { id: 'mariachi', label: 'Mariachi' },
    ],
    required: true,
    weight: 30,
  },
  {
    id: 'ent_p_moments',
    question: '¿En qué momentos del evento puedes actuar?',
    type: 'multiple',
    options: [
      { id: 'ceremony', label: 'Durante la ceremonia' },
      { id: 'cocktail', label: 'Durante el cóctel' },
      { id: 'dinner', label: 'Durante la cena' },
      { id: 'party', label: 'Durante la fiesta' },
      { id: 'special_moment', label: 'Momentos especiales' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'ent_p_duration_min',
    question: 'Duración mínima de tu show (minutos)',
    type: 'number',
    min: 15,
    max: 240,
    required: true,
    weight: 10,
  },
  {
    id: 'ent_p_duration_max',
    question: 'Duración máxima de tu show (minutos)',
    type: 'number',
    min: 30,
    max: 480,
    required: true,
    weight: 0,
  },
  {
    id: 'ent_p_price_min',
    question: 'Precio mínimo de tu servicio (CLP)',
    type: 'number',
    min: 50000,
    max: 5000000,
    step: 25000,
    required: true,
    weight: 20,
  },
  {
    id: 'ent_p_price_max',
    question: 'Precio máximo de tu servicio (CLP)',
    type: 'number',
    min: 50000,
    max: 10000000,
    step: 25000,
    required: true,
    weight: 0,
  },
  {
    id: 'ent_p_styles',
    question: '¿Qué estilos de entretenimiento manejas?',
    type: 'multiple',
    options: [
      { id: 'elegant', label: 'Elegante / Sofisticado' },
      { id: 'fun', label: 'Divertido / Animado' },
      { id: 'romantic', label: 'Romántico' },
      { id: 'interactive', label: 'Interactivo' },
      { id: 'surprise', label: 'Sorpresa' },
    ],
    required: true,
    weight: 10,
  },
  {
    id: 'ent_p_audience',
    question: '¿Para qué audiencias trabajas?',
    type: 'multiple',
    options: [
      { id: 'adults_only', label: 'Solo adultos' },
      { id: 'family', label: 'Familiar' },
      { id: 'mixed', label: 'Mixto' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'ent_p_equipment',
    question: '¿Qué equipo incluyes?',
    type: 'multiple',
    options: [
      { id: 'sound', label: 'Equipo de sonido' },
      { id: 'lighting', label: 'Iluminación' },
      { id: 'props', label: 'Props / Accesorios' },
      { id: 'stage', label: 'Escenario portátil' },
      { id: 'none', label: 'Solo el show, sin equipo' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'ent_p_team_size',
    question: '¿Cuántas personas conforman tu show?',
    type: 'single',
    options: [
      { id: '1', label: 'Solo yo' },
      { id: '2_3', label: '2-3 personas' },
      { id: '4_6', label: '4-6 personas' },
      { id: 'over_6', label: 'Más de 6 personas' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'ent_p_travel',
    question: '¿Viajas fuera de tu región?',
    type: 'boolean',
    required: true,
    weight: 0,
  },
];












