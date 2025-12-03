/**
 * Sistema de Categorías de Compatibilidad
 * Matri.AI - Convierte porcentajes de match en etiquetas elegantes
 * 
 * Categorías con diseño premium:
 * - PERFECTO: 90%+ (Dorado premium - el mejor match posible)
 * - MUY ALTA: 80-89% (Esmeralda - excelente compatibilidad)
 * - ALTA: 70-79% (Azul royal - buena compatibilidad)
 * - MEDIA: 50-69% (Ámbar - compatibilidad aceptable)
 * - BAJA: <50% (Gris - baja compatibilidad)
 */

export type MatchCategory = 'perfect' | 'very_high' | 'high' | 'medium' | 'low';

export interface MatchCategoryInfo {
  id: MatchCategory;
  label: string;
  shortLabel: string;
  description: string;
  // Colores para el texto
  textColor: string;
  // Gradiente de fondo (de izquierda a derecha)
  gradientFrom: string;
  gradientTo: string;
  // Color sólido de fondo alternativo
  bgColor: string;
  // Borde con brillo
  borderColor: string;
  // Sombra con color
  shadowColor: string;
  // Rangos
  minScore: number;
  maxScore: number;
}

// Definición de las categorías con diseño premium y colores distintivos
export const MATCH_CATEGORIES: Record<MatchCategory, MatchCategoryInfo> = {
  perfect: {
    id: 'perfect',
    label: 'Perfecto',
    shortLabel: 'Perfecto',
    description: 'Este proveedor cumple prácticamente todos tus requisitos',
    textColor: '#FFFFFF',
    gradientFrom: '#D4AF37', // Dorado
    gradientTo: '#B8860B', // Dorado oscuro
    bgColor: '#D4AF37',
    borderColor: '#FFD700',
    shadowColor: 'rgba(212, 175, 55, 0.5)',
    minScore: 90,
    maxScore: 100,
  },
  very_high: {
    id: 'very_high',
    label: 'Muy Alta',
    shortLabel: 'Muy Alta',
    description: 'Excelente compatibilidad con tus preferencias',
    textColor: '#FFFFFF',
    gradientFrom: '#059669', // Esmeralda
    gradientTo: '#047857', // Esmeralda oscuro
    bgColor: '#059669',
    borderColor: '#10B981',
    shadowColor: 'rgba(5, 150, 105, 0.4)',
    minScore: 80,
    maxScore: 89,
  },
  high: {
    id: 'high',
    label: 'Alta',
    shortLabel: 'Alta',
    description: 'Buena compatibilidad con la mayoría de tus requisitos',
    textColor: '#FFFFFF',
    gradientFrom: '#2563EB', // Azul royal
    gradientTo: '#1D4ED8', // Azul oscuro
    bgColor: '#2563EB',
    borderColor: '#3B82F6',
    shadowColor: 'rgba(37, 99, 235, 0.4)',
    minScore: 70,
    maxScore: 79,
  },
  medium: {
    id: 'medium',
    label: 'Media',
    shortLabel: 'Media',
    description: 'Compatibilidad parcial, revisa los detalles',
    textColor: '#FFFFFF',
    gradientFrom: '#D97706', // Ámbar
    gradientTo: '#B45309', // Ámbar oscuro
    bgColor: '#D97706',
    borderColor: '#F59E0B',
    shadowColor: 'rgba(217, 119, 6, 0.4)',
    minScore: 50,
    maxScore: 69,
  },
  low: {
    id: 'low',
    label: 'Baja',
    shortLabel: 'Baja',
    description: 'Poca compatibilidad con tus requisitos',
    textColor: '#FFFFFF',
    gradientFrom: '#6B7280', // Gris
    gradientTo: '#4B5563', // Gris oscuro
    bgColor: '#6B7280',
    borderColor: '#9CA3AF',
    shadowColor: 'rgba(107, 114, 128, 0.3)',
    minScore: 0,
    maxScore: 49,
  },
};

/**
 * Obtiene la categoría de compatibilidad basada en el porcentaje
 */
export function getMatchCategory(score: number): MatchCategoryInfo {
  if (score >= 90) return MATCH_CATEGORIES.perfect;
  if (score >= 80) return MATCH_CATEGORIES.very_high;
  if (score >= 70) return MATCH_CATEGORIES.high;
  if (score >= 50) return MATCH_CATEGORIES.medium;
  return MATCH_CATEGORIES.low;
}

/**
 * Obtiene solo la etiqueta de la categoría
 */
export function getMatchCategoryLabel(score: number): string {
  return getMatchCategory(score).label;
}

/**
 * Obtiene el color del texto de la categoría
 */
export function getMatchCategoryTextColor(score: number): string {
  return getMatchCategory(score).textColor;
}

/**
 * Obtiene el color de fondo de la categoría
 */
export function getMatchCategoryBgColor(score: number): string {
  return getMatchCategory(score).bgColor;
}

/**
 * Genera estilos CSS inline para un badge de compatibilidad PREMIUM
 * Diseño elegante con gradiente y sombra
 */
export function getMatchCategoryStyles(score: number): React.CSSProperties {
  const category = getMatchCategory(score);
  return {
    color: category.textColor,
    background: `linear-gradient(135deg, ${category.gradientFrom} 0%, ${category.gradientTo} 100%)`,
    borderColor: category.borderColor,
    boxShadow: `0 4px 12px ${category.shadowColor}`,
  };
}

/**
 * Genera estilos CSS para badge compacto (sin sombra grande)
 */
export function getMatchCategoryStylesCompact(score: number): React.CSSProperties {
  const category = getMatchCategory(score);
  return {
    color: category.textColor,
    background: `linear-gradient(135deg, ${category.gradientFrom} 0%, ${category.gradientTo} 100%)`,
    borderColor: category.borderColor,
    boxShadow: `0 2px 6px ${category.shadowColor}`,
  };
}

/**
 * Genera estilos CSS para badge en modal/detalle (más prominente)
 */
export function getMatchCategoryStylesLarge(score: number): React.CSSProperties {
  const category = getMatchCategory(score);
  return {
    color: category.textColor,
    background: `linear-gradient(135deg, ${category.gradientFrom} 0%, ${category.gradientTo} 100%)`,
    borderColor: category.borderColor,
    boxShadow: `0 6px 20px ${category.shadowColor}`,
  };
}

/**
 * Genera clases CSS para un badge de compatibilidad
 * Retorna un nombre de clase basado en la categoría
 */
export function getMatchCategoryClassName(score: number): string {
  const category = getMatchCategory(score);
  return `matchCategory-${category.id}`;
}

/**
 * Verifica si un score es considerado "bueno" (70%+)
 */
export function isGoodMatch(score: number): boolean {
  return score >= 70;
}

/**
 * Verifica si un score es considerado "excelente" (80%+)
 */
export function isExcellentMatch(score: number): boolean {
  return score >= 80;
}

/**
 * Verifica si un score es considerado "perfecto" (90%+)
 */
export function isPerfectMatch(score: number): boolean {
  return score >= 90;
}

