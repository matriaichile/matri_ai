/**
 * Servicio de Matchmaking por Categoría
 * Matri.AI - Sistema de cálculo de compatibilidad entre usuarios y proveedores
 * 
 * Este servicio calcula el match score basándose en:
 * 1. Datos del wizard inicial (perfil general del usuario y proveedor)
 * 2. Respuestas de mini-encuestas por categoría
 * 3. Criterios de matching definidos para cada categoría
 * 4. Pesos asignados a cada criterio
 * 
 * El sistema combina información de ambas fuentes para generar un score más preciso.
 */

import { CategoryId } from '@/store/authStore';
import { CATEGORY_SURVEYS } from '@/lib/surveys';
import { MatchingCriterion, SurveyResponses, SurveyQuestion } from '@/lib/surveys/types';

// ============================================
// TIPOS PARA DATOS DEL WIZARD
// ============================================

// Datos del wizard del usuario (novios)
export interface UserWizardProfile {
  budget: string;
  guestCount: string;
  region: string;
  eventStyle: string;
  ceremonyTypes: string[];
  priorityCategories: string[];
  involvementLevel: string;
}

// Datos del wizard del proveedor
export interface ProviderWizardProfile {
  serviceStyle: string;
  priceRange: string;
  workRegion: string;
  acceptsOutsideZone: boolean;
  categories: string[];
}

// ============================================
// TIPOS PARA EL MATCHING
// ============================================

// Tipos para el resultado del matching
export interface MatchResult {
  providerId: string;
  userId: string;
  category: CategoryId;
  matchScore: number;
  matchDetails: MatchDetail[];
  wizardMatchDetails?: WizardMatchDetail[]; // Detalles del match basado en wizard
  createdAt: Date;
}

export interface MatchDetail {
  criterionId: string;
  userQuestionId: string;
  providerQuestionId: string;
  userValue: string | string[] | number | boolean | undefined;
  providerValue: string | string[] | number | boolean | undefined;
  score: number;
  weight: number;
  matchType: 'exact' | 'contains' | 'range_overlap' | 'boolean_match';
}

// Detalles del match basado en datos del wizard
export interface WizardMatchDetail {
  criterion: string;
  userValue: string | string[] | boolean;
  providerValue: string | string[] | boolean;
  score: number;
  weight: number;
}

/**
 * Calcula el score de matching entre un usuario y un proveedor para una categoría específica
 * 
 * @param userResponses - Respuestas de la encuesta del usuario
 * @param providerResponses - Respuestas de la encuesta del proveedor
 * @param category - Categoría del servicio
 * @returns Score de matching (0-100) y detalles del cálculo
 */
export function calculateMatchScore(
  userResponses: SurveyResponses,
  providerResponses: SurveyResponses,
  category: CategoryId
): { score: number; details: MatchDetail[] } {
  const surveyConfig = CATEGORY_SURVEYS[category];
  
  if (!surveyConfig) {
    console.warn(`No se encontró configuración de encuesta para la categoría: ${category}`);
    return { score: 0, details: [] };
  }

  // Si hay criterios de matching definidos, usarlos
  // Si no, generar criterios automáticos basados en las preguntas
  const matchingCriteria = surveyConfig.matchingCriteria || 
    generateDefaultMatchingCriteria(surveyConfig.userQuestions, surveyConfig.providerQuestions);

  const details: MatchDetail[] = [];
  let totalWeight = 0;
  let weightedScore = 0;

  for (const criterion of matchingCriteria) {
    const userValue = userResponses[criterion.userQuestionId];
    const providerValue = providerResponses[criterion.providerQuestionId];
    
    const criterionScore = calculateCriterionScore(
      userValue,
      providerValue,
      criterion.matchingLogic
    );

    details.push({
      criterionId: `${criterion.userQuestionId}_${criterion.providerQuestionId}`,
      userQuestionId: criterion.userQuestionId,
      providerQuestionId: criterion.providerQuestionId,
      userValue,
      providerValue,
      score: criterionScore,
      weight: criterion.weight,
      matchType: criterion.matchingLogic,
    });

    totalWeight += criterion.weight;
    weightedScore += criterionScore * criterion.weight;
  }

  // Calcular score final (0-100)
  const finalScore = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;

  return { score: finalScore, details };
}

/**
 * Genera criterios de matching automáticos basados en las preguntas
 * Intenta emparejar preguntas de usuario con preguntas de proveedor que tengan IDs similares
 */
function generateDefaultMatchingCriteria(
  userQuestions: SurveyQuestion[],
  providerQuestions: SurveyQuestion[]
): MatchingCriterion[] {
  const criteria: MatchingCriterion[] = [];
  
  for (const userQ of userQuestions) {
    // Buscar pregunta de proveedor con ID similar o relacionado
    const providerQ = providerQuestions.find(pQ => {
      // Intentar match por ID similar (ej: user_style -> provider_style)
      const userBase = userQ.id.replace(/^user_/, '').replace(/^u_/, '');
      const providerBase = pQ.id.replace(/^provider_/, '').replace(/^p_/, '');
      return userBase === providerBase || 
             userQ.id.includes(providerBase) || 
             pQ.id.includes(userBase);
    });

    if (providerQ) {
      // Determinar lógica de matching basada en el tipo de pregunta
      let matchingLogic: 'exact' | 'contains' | 'range_overlap' | 'boolean_match' = 'contains';
      
      if (userQ.type === 'boolean' || providerQ.type === 'boolean') {
        matchingLogic = 'boolean_match';
      } else if (userQ.type === 'range' || userQ.type === 'number' || 
                 providerQ.type === 'range' || providerQ.type === 'number') {
        matchingLogic = 'range_overlap';
      } else if (userQ.type === 'single' && providerQ.type === 'single') {
        matchingLogic = 'exact';
      }

      criteria.push({
        userQuestionId: userQ.id,
        providerQuestionId: providerQ.id,
        weight: userQ.weight || 50,
        matchingLogic,
      });
    }
  }

  // Si no se encontraron matches, crear criterios básicos
  if (criteria.length === 0) {
    // Emparejar por índice
    const minLength = Math.min(userQuestions.length, providerQuestions.length);
    for (let i = 0; i < minLength; i++) {
      criteria.push({
        userQuestionId: userQuestions[i].id,
        providerQuestionId: providerQuestions[i].id,
        weight: userQuestions[i].weight || 50,
        matchingLogic: 'contains',
      });
    }
  }

  return criteria;
}

/**
 * Calcula el score para un criterio individual
 * 
 * @param userValue - Valor de la respuesta del usuario
 * @param providerValue - Valor de la respuesta del proveedor
 * @param matchingLogic - Tipo de lógica de matching a aplicar
 * @returns Score del criterio (0-1)
 */
function calculateCriterionScore(
  userValue: string | string[] | number | boolean | undefined,
  providerValue: string | string[] | number | boolean | undefined,
  matchingLogic: 'exact' | 'contains' | 'range_overlap' | 'boolean_match'
): number {
  // Si alguno de los valores no existe, score parcial
  if (userValue === undefined || providerValue === undefined) {
    return 0.5; // Score neutral si falta información
  }

  switch (matchingLogic) {
    case 'exact':
      return calculateExactMatch(userValue, providerValue);
    
    case 'contains':
      return calculateContainsMatch(userValue, providerValue);
    
    case 'range_overlap':
      return calculateRangeOverlap(userValue, providerValue);
    
    case 'boolean_match':
      return calculateBooleanMatch(userValue, providerValue);
    
    default:
      return 0.5;
  }
}

/**
 * Match exacto - ambos valores deben ser iguales
 */
function calculateExactMatch(
  userValue: string | string[] | number | boolean,
  providerValue: string | string[] | number | boolean
): number {
  // Si ambos son arrays, verificar si hay coincidencia
  if (Array.isArray(userValue) && Array.isArray(providerValue)) {
    const intersection = userValue.filter(v => providerValue.includes(v));
    const union = [...new Set([...userValue, ...providerValue])];
    return union.length > 0 ? intersection.length / union.length : 0;
  }
  
  // Si uno es array y otro no
  if (Array.isArray(userValue)) {
    return userValue.includes(String(providerValue)) ? 1 : 0;
  }
  if (Array.isArray(providerValue)) {
    return providerValue.includes(String(userValue)) ? 1 : 0;
  }
  
  // Comparación directa
  return userValue === providerValue ? 1 : 0;
}

/**
 * Match de contención - el proveedor debe ofrecer lo que el usuario busca
 */
function calculateContainsMatch(
  userValue: string | string[] | number | boolean,
  providerValue: string | string[] | number | boolean
): number {
  // Convertir a arrays para facilitar la comparación
  const userArray = Array.isArray(userValue) ? userValue : [String(userValue)];
  const providerArray = Array.isArray(providerValue) ? providerValue : [String(providerValue)];
  
  // Contar cuántos elementos del usuario están en el proveedor
  const matchCount = userArray.filter(uv => 
    providerArray.some(pv => 
      String(pv).toLowerCase().includes(String(uv).toLowerCase()) ||
      String(uv).toLowerCase().includes(String(pv).toLowerCase())
    )
  ).length;
  
  return userArray.length > 0 ? matchCount / userArray.length : 0;
}

/**
 * Match de rango - verificar si los rangos se superponen
 * Útil para presupuestos, número de invitados, etc.
 */
function calculateRangeOverlap(
  userValue: string | string[] | number | boolean,
  providerValue: string | string[] | number | boolean
): number {
  // Para rangos numéricos directos
  if (typeof userValue === 'number' && typeof providerValue === 'number') {
    // Asumimos que son valores puntuales y calculamos proximidad
    const diff = Math.abs(userValue - providerValue);
    const maxDiff = Math.max(userValue, providerValue);
    return maxDiff > 0 ? Math.max(0, 1 - (diff / maxDiff)) : 1;
  }
  
  // Para strings que representan rangos (ej: "5m_10m", "budget")
  const userRangeValue = getRangeValue(String(userValue));
  const providerRangeValue = getRangeValue(String(providerValue));
  
  // Calcular superposición de rangos
  const overlap = calculateRangeOverlapValue(userRangeValue, providerRangeValue);
  return overlap;
}

/**
 * Match booleano - ambos deben coincidir o ser compatibles
 */
function calculateBooleanMatch(
  userValue: string | string[] | number | boolean,
  providerValue: string | string[] | number | boolean
): number {
  const userBool = toBooleanValue(userValue);
  const providerBool = toBooleanValue(providerValue);
  
  // Si el usuario quiere algo y el proveedor lo ofrece = match perfecto
  // Si el usuario no lo quiere, cualquier valor del proveedor está bien
  if (!userBool) return 1; // Usuario no lo necesita, cualquier valor está bien
  return providerBool ? 1 : 0; // Usuario lo necesita, proveedor debe ofrecerlo
}

/**
 * Convierte un valor de rango (string) a un objeto con min y max
 */
function getRangeValue(value: string): { min: number; max: number } {
  // Mapeo de rangos comunes de presupuesto
  const budgetRanges: Record<string, { min: number; max: number }> = {
    'under_5m': { min: 0, max: 5000000 },
    '5m_10m': { min: 5000000, max: 10000000 },
    '10m_15m': { min: 10000000, max: 15000000 },
    '15m_20m': { min: 15000000, max: 20000000 },
    '20m_30m': { min: 20000000, max: 30000000 },
    '30m_50m': { min: 30000000, max: 50000000 },
    'over_50m': { min: 50000000, max: 100000000 },
    'budget': { min: 0, max: 2000000 },
    'mid': { min: 2000000, max: 5000000 },
    'premium': { min: 5000000, max: 10000000 },
    'luxury': { min: 10000000, max: 100000000 },
  };

  // Mapeo de rangos de invitados
  const guestRanges: Record<string, { min: number; max: number }> = {
    'less_50': { min: 0, max: 50 },
    '50_100': { min: 50, max: 100 },
    '100_150': { min: 100, max: 150 },
    '150_200': { min: 150, max: 200 },
    '200_300': { min: 200, max: 300 },
    'more_300': { min: 300, max: 500 },
  };

  // Buscar en ambos mapeos
  if (budgetRanges[value]) return budgetRanges[value];
  if (guestRanges[value]) return guestRanges[value];

  // Intentar parsear como número
  const num = parseFloat(value);
  if (!isNaN(num)) {
    return { min: num, max: num };
  }

  // Valor por defecto
  return { min: 0, max: 100 };
}

/**
 * Calcula la superposición entre dos rangos
 */
function calculateRangeOverlapValue(
  range1: { min: number; max: number },
  range2: { min: number; max: number }
): number {
  const overlapStart = Math.max(range1.min, range2.min);
  const overlapEnd = Math.min(range1.max, range2.max);
  
  if (overlapStart > overlapEnd) {
    // No hay superposición - calcular qué tan lejos están
    const gap = overlapStart - overlapEnd;
    const totalRange = Math.max(range1.max, range2.max) - Math.min(range1.min, range2.min);
    return Math.max(0, 1 - (gap / totalRange));
  }
  
  // Hay superposición - calcular porcentaje
  const overlapSize = overlapEnd - overlapStart;
  const smallerRange = Math.min(range1.max - range1.min, range2.max - range2.min);
  
  if (smallerRange === 0) return 1; // Ambos son puntos
  
  return Math.min(1, overlapSize / smallerRange);
}

/**
 * Convierte un valor a booleano
 */
function toBooleanValue(value: string | string[] | number | boolean): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return lower === 'true' || lower === 'yes' || lower === 'si' || lower === 'sí';
  }
  if (Array.isArray(value)) return value.length > 0;
  return false;
}

/**
 * Genera matches para un usuario en una categoría específica
 * 
 * @param userId - ID del usuario
 * @param category - Categoría del servicio
 * @param userResponses - Respuestas del usuario
 * @param providers - Lista de proveedores con sus respuestas
 * @param minScore - Score mínimo para considerar un match (default: 50)
 * @returns Lista de matches ordenados por score
 */
export function generateMatches(
  userId: string,
  category: CategoryId,
  userResponses: SurveyResponses,
  providers: Array<{
    id: string;
    responses: SurveyResponses;
    region?: string;
    priceRange?: string;
  }>,
  minScore: number = 50
): MatchResult[] {
  const matches: MatchResult[] = [];

  for (const provider of providers) {
    const { score, details } = calculateMatchScore(
      userResponses,
      provider.responses,
      category
    );

    if (score >= minScore) {
      matches.push({
        providerId: provider.id,
        userId,
        category,
        matchScore: score,
        matchDetails: details,
        createdAt: new Date(),
      });
    }
  }

  // Ordenar por score descendente
  matches.sort((a, b) => b.matchScore - a.matchScore);

  return matches;
}

/**
 * Obtiene un resumen textual del match
 */
export function getMatchSummary(matchResult: MatchResult): string {
  const { matchScore, matchDetails } = matchResult;
  
  // Encontrar los mejores y peores criterios
  const sortedDetails = [...matchDetails].sort((a, b) => b.score - a.score);
  const topMatches = sortedDetails.slice(0, 3).filter(d => d.score >= 0.7);
  const weakMatches = sortedDetails.slice(-2).filter(d => d.score < 0.5);

  let summary = `Compatibilidad: ${matchScore}%`;
  
  if (topMatches.length > 0) {
    summary += `. Fortalezas: ${topMatches.length} criterios con alta compatibilidad`;
  }
  
  if (weakMatches.length > 0) {
    summary += `. Áreas a considerar: ${weakMatches.length} criterios con menor coincidencia`;
  }

  return summary;
}

// ============================================
// MATCHING MEJORADO CON DATOS DEL WIZARD
// ============================================

/**
 * Mapeo de presupuesto del usuario a rango de precio del proveedor
 * Basado en los rangos definidos en wizardStore.ts
 */
const BUDGET_TO_PRICE_COMPATIBILITY: Record<string, string[]> = {
  'under_5m': ['budget'],
  '5m_10m': ['budget', 'mid'],
  '10m_15m': ['mid'],
  '15m_20m': ['mid', 'premium'],
  '20m_30m': ['premium'],
  '30m_50m': ['premium', 'luxury'],
  'over_50m': ['luxury'],
};

/**
 * Mapeo de estilo del evento del usuario a estilo de servicio del proveedor
 */
const EVENT_STYLE_TO_SERVICE_STYLE: Record<string, string[]> = {
  'classic': ['traditional', 'classic', 'editorial'],
  'rustic': ['documentary', 'artistic', 'natural'],
  'modern': ['modern', 'cinematic', 'editorial'],
  'romantic': ['artistic', 'romantic', 'documentary'],
  'glamorous': ['editorial', 'cinematic', 'glamorous'],
  'vintage': ['traditional', 'artistic', 'vintage'],
  'beach': ['documentary', 'artistic', 'natural'],
  'industrial': ['modern', 'cinematic', 'editorial'],
};

/**
 * Calcula el score de matching basado en datos del wizard (perfil general)
 * Este score complementa el score de la mini-encuesta
 * 
 * @param userProfile - Datos del wizard del usuario
 * @param providerProfile - Datos del wizard del proveedor
 * @param category - Categoría del servicio (para contexto)
 * @returns Score (0-100) y detalles del match
 */
export function calculateWizardMatchScore(
  userProfile: UserWizardProfile,
  providerProfile: ProviderWizardProfile,
  category: CategoryId
): { score: number; details: WizardMatchDetail[] } {
  const details: WizardMatchDetail[] = [];
  let totalWeight = 0;
  let weightedScore = 0;

  // 1. Match de ubicación (peso: 25)
  const locationWeight = 25;
  let locationScore = 0;
  
  if (userProfile.region === providerProfile.workRegion) {
    locationScore = 1; // Match perfecto de región
  } else if (providerProfile.acceptsOutsideZone) {
    locationScore = 0.7; // Proveedor acepta trabajar fuera de su zona
  } else {
    locationScore = 0.2; // No hay match de ubicación
  }
  
  details.push({
    criterion: 'location',
    userValue: userProfile.region,
    providerValue: providerProfile.workRegion,
    score: locationScore,
    weight: locationWeight,
  });
  totalWeight += locationWeight;
  weightedScore += locationScore * locationWeight;

  // 2. Match de presupuesto vs rango de precio (peso: 30)
  const budgetWeight = 30;
  let budgetScore = 0;
  
  const compatiblePriceRanges = BUDGET_TO_PRICE_COMPATIBILITY[userProfile.budget] || [];
  if (compatiblePriceRanges.includes(providerProfile.priceRange)) {
    budgetScore = 1; // Presupuesto compatible
  } else {
    // Calcular proximidad del rango
    const priceOrder = ['budget', 'mid', 'premium', 'luxury'];
    const userIndex = priceOrder.findIndex(p => compatiblePriceRanges.includes(p));
    const providerIndex = priceOrder.indexOf(providerProfile.priceRange);
    
    if (userIndex >= 0 && providerIndex >= 0) {
      const distance = Math.abs(userIndex - providerIndex);
      budgetScore = Math.max(0, 1 - (distance * 0.3)); // Penalización por distancia
    } else {
      budgetScore = 0.5; // Score neutral si no hay datos
    }
  }
  
  details.push({
    criterion: 'budget',
    userValue: userProfile.budget,
    providerValue: providerProfile.priceRange,
    score: budgetScore,
    weight: budgetWeight,
  });
  totalWeight += budgetWeight;
  weightedScore += budgetScore * budgetWeight;

  // 3. Match de estilo (peso: 25)
  const styleWeight = 25;
  let styleScore = 0;
  
  const compatibleStyles = EVENT_STYLE_TO_SERVICE_STYLE[userProfile.eventStyle] || [];
  if (compatibleStyles.includes(providerProfile.serviceStyle)) {
    styleScore = 1; // Estilo compatible
  } else {
    // Verificar si hay alguna coincidencia parcial
    styleScore = 0.4; // Score base para estilos no compatibles pero profesionales
  }
  
  details.push({
    criterion: 'style',
    userValue: userProfile.eventStyle,
    providerValue: providerProfile.serviceStyle,
    score: styleScore,
    weight: styleWeight,
  });
  totalWeight += styleWeight;
  weightedScore += styleScore * styleWeight;

  // 4. Categoría es prioritaria para el usuario (peso: 20)
  const priorityWeight = 20;
  let priorityScore = 0;
  
  if (userProfile.priorityCategories.includes(category)) {
    // La categoría es prioritaria, verificar que el proveedor la ofrece
    if (providerProfile.categories.includes(category)) {
      priorityScore = 1;
    } else {
      priorityScore = 0; // El proveedor no ofrece esta categoría
    }
  } else {
    // No es prioritaria pero el proveedor la ofrece
    priorityScore = providerProfile.categories.includes(category) ? 0.7 : 0;
  }
  
  details.push({
    criterion: 'priority',
    userValue: userProfile.priorityCategories,
    providerValue: providerProfile.categories,
    score: priorityScore,
    weight: priorityWeight,
  });
  totalWeight += priorityWeight;
  weightedScore += priorityScore * priorityWeight;

  // Calcular score final
  const finalScore = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;

  return { score: finalScore, details };
}

/**
 * Calcula el score de matching COMBINADO (wizard + mini-encuesta)
 * Este es el método principal que debe usarse para el matching completo
 * 
 * @param userSurveyResponses - Respuestas de la mini-encuesta del usuario
 * @param providerSurveyResponses - Respuestas de la mini-encuesta del proveedor
 * @param userProfile - Datos del wizard del usuario (opcional)
 * @param providerProfile - Datos del wizard del proveedor (opcional)
 * @param category - Categoría del servicio
 * @returns Score combinado (0-100) y detalles
 */
export function calculateCombinedMatchScore(
  userSurveyResponses: SurveyResponses,
  providerSurveyResponses: SurveyResponses,
  userProfile: UserWizardProfile | null,
  providerProfile: ProviderWizardProfile | null,
  category: CategoryId
): { 
  score: number; 
  surveyScore: number;
  wizardScore: number;
  surveyDetails: MatchDetail[];
  wizardDetails: WizardMatchDetail[];
} {
  // 1. Calcular score de la mini-encuesta (peso: 60%)
  const surveyResult = calculateMatchScore(
    userSurveyResponses,
    providerSurveyResponses,
    category
  );
  
  // 2. Calcular score del wizard si hay datos disponibles (peso: 40%)
  let wizardResult = { score: 0, details: [] as WizardMatchDetail[] };
  let wizardWeight = 0;
  
  if (userProfile && providerProfile) {
    wizardResult = calculateWizardMatchScore(userProfile, providerProfile, category);
    wizardWeight = 40; // El wizard contribuye 40% al score total
  }
  
  // 3. Combinar scores
  const surveyWeight = 100 - wizardWeight; // 60% si hay wizard, 100% si no hay
  
  const combinedScore = Math.round(
    (surveyResult.score * (surveyWeight / 100)) + 
    (wizardResult.score * (wizardWeight / 100))
  );

  return {
    score: combinedScore,
    surveyScore: surveyResult.score,
    wizardScore: wizardResult.score,
    surveyDetails: surveyResult.details,
    wizardDetails: wizardResult.details,
  };
}

/**
 * Genera un resumen legible del match combinado
 */
export function getCombinedMatchSummary(
  score: number,
  surveyScore: number,
  wizardScore: number,
  surveyDetails: MatchDetail[],
  wizardDetails: WizardMatchDetail[]
): string {
  let summary = `Compatibilidad total: ${score}%`;
  
  if (wizardScore > 0) {
    summary += ` (Perfil: ${wizardScore}%, Preferencias: ${surveyScore}%)`;
  }
  
  // Encontrar fortalezas del wizard
  const strongWizardMatches = wizardDetails.filter(d => d.score >= 0.8);
  if (strongWizardMatches.length > 0) {
    const strengths = strongWizardMatches.map(d => {
      switch (d.criterion) {
        case 'location': return 'ubicación';
        case 'budget': return 'presupuesto';
        case 'style': return 'estilo';
        case 'priority': return 'categoría prioritaria';
        default: return d.criterion;
      }
    });
    summary += `. Excelente match en: ${strengths.join(', ')}`;
  }
  
  // Encontrar fortalezas de la encuesta
  const strongSurveyMatches = surveyDetails.filter(d => d.score >= 0.8).slice(0, 2);
  if (strongSurveyMatches.length > 0) {
    summary += `. ${strongSurveyMatches.length} criterios específicos con alta compatibilidad`;
  }
  
  return summary;
}

