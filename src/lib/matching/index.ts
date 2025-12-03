/**
 * Exportación del módulo de Matching
 * Matri.AI - Sistema de Matchmaking por Categoría
 * 
 * VERSIÓN AVANZADA con:
 * - Criterios de matching explícitos por categoría
 * - Sistema de especificidad para proveedores nicho
 * - Mejor manejo de rangos numéricos vs strings
 * - Bonus para especialistas y cobertura de necesidades
 * - Tipos de comparación "threshold" para preguntas de umbral:
 *   - threshold_at_least: proveedor debe ofrecer AL MENOS lo que usuario pide
 *   - threshold_at_most: proveedor debe entregar ANTES de cuando usuario lo necesita
 *   - threshold_can_accommodate: proveedor debe poder acomodar lo que usuario necesita
 */

export {
  // Funciones principales
  calculateMatchScore,
  calculateCombinedMatchScore,
  calculateWizardMatchScore,
  generateMatches,
  getMatchSummary,
  getCombinedMatchSummary,
  
  // Tipos principales
  type MatchResult,
  type MatchDetail,
  type WizardMatchDetail,
  type UserWizardProfile,
  type ProviderWizardProfile,
} from './matchingService';

