/**
 * Sistema de límites de "buscar nuevo proveedor" por categoría.
 * Implementación 100% local con localStorage.
 * 
 * Reglas:
 * - Al completar encuesta: se generan 3 leads iniciales
 * - SIN LÍMITE de búsquedas "mostrar nuevo proveedor" (puede buscar las veces que quiera)
 * - Máximo 3 matches ACTIVOS al mismo tiempo (approved + pending)
 * - Si tiene 3 activos, debe descartar al menos 1 para poder buscar otro
 */

// Constantes del sistema
export const INITIAL_MATCHES_COUNT = 3; // Matches iniciales al completar encuesta
export const EXTRA_SEARCH_LIMIT = Infinity; // SIN LÍMITE de búsquedas extra

// Máximo de matches ACTIVOS (approved + pending) que puede tener un usuario por categoría
// Los rejected NO cuentan. Si tiene 3 activos, NO puede agregar más ni recuperar descartados.
export const MAX_ACTIVE_MATCHES_PER_CATEGORY = 3;

// DEPRECADO: Mantener para compatibilidad hacia atrás
export const DAILY_SEARCH_LIMIT = EXTRA_SEARCH_LIMIT;
export const MATCH_LIMIT_PER_CATEGORY = EXTRA_SEARCH_LIMIT;
export const EXTRA_MATCHES_ALLOWED = EXTRA_SEARCH_LIMIT;
export const RESET_INTERVAL_MS = 0; // Ya no se usa - mantener para compatibilidad

// Estructura de datos para límites por categoría
export interface CategoryMatchLimit {
  categoryId: string;
  searchesUsed: number;  // Cantidad de "buscar nuevo proveedor" usados (PERMANENTE)
}

// Estructura completa de límites por usuario
interface UserMatchLimits {
  [categoryId: string]: CategoryMatchLimit;
}

/**
 * Obtener la key de localStorage para un usuario
 */
function getStorageKey(userId: string): string {
  return `matri_match_limits_${userId}`;
}

/**
 * Obtener todos los límites de un usuario desde localStorage
 */
function getAllLimits(userId: string): UserMatchLimits {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(getStorageKey(userId));
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Guardar todos los límites de un usuario en localStorage
 */
function saveAllLimits(userId: string, limits: UserMatchLimits): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(limits));
  } catch (error) {
    console.error('Error guardando límites en localStorage:', error);
  }
}

/**
 * Obtener límites de una categoría específica.
 * NO hay reset automático por tiempo - solo se resetea al rehacer encuesta.
 */
export function getMatchLimits(userId: string, categoryId: string): CategoryMatchLimit {
  const allLimits = getAllLimits(userId);
  
  let categoryLimit = allLimits[categoryId] || {
    categoryId,
    searchesUsed: 0,
  };
  
  // Migración: si tiene el formato viejo (providersShown o lastResetTimestamp), convertir al nuevo
  // IMPORTANTE: Mantener searchesUsed actual, solo limpiar campos obsoletos
  if ('providersShown' in categoryLimit || 'lastResetTimestamp' in categoryLimit) {
    const currentSearchesUsed = (categoryLimit as { searchesUsed?: number }).searchesUsed ?? 0;
    categoryLimit = {
      categoryId,
      searchesUsed: currentSearchesUsed,
    };
    // Guardar la migración
    allLimits[categoryId] = categoryLimit;
    saveAllLimits(userId, allLimits);
  }
  
  return categoryLimit;
}

/**
 * Verificar si puede buscar más proveedores en una categoría.
 * Ya no hay límite de búsquedas - siempre retorna true.
 * El único límite es tener máximo 3 matches activos al mismo tiempo.
 */
export function canSearchMoreProviders(_userId: string, _categoryId: string): boolean {
  // Sin límite de búsquedas - siempre puede buscar más
  return true;
}

// Alias para compatibilidad
export const canShowMoreProviders = canSearchMoreProviders;

/**
 * Registrar que el usuario usó una búsqueda de "nuevo proveedor".
 * Ya no hay límite, pero mantenemos el registro para estadísticas.
 */
export function registerSearchUsed(userId: string, categoryId: string): void {
  const allLimits = getAllLimits(userId);
  const categoryLimit = getMatchLimits(userId, categoryId);
  
  categoryLimit.searchesUsed += 1;
  allLimits[categoryId] = categoryLimit;
  saveAllLimits(userId, allLimits);
  
  console.log(`✓ Búsqueda registrada para ${categoryId} (total: ${categoryLimit.searchesUsed}) - SIN LÍMITE`);
}

// Alias para compatibilidad (aunque ya no guarda providerId)
export function registerProviderShown(userId: string, categoryId: string, _providerId: string): void {
  registerSearchUsed(userId, categoryId);
}

/**
 * Ya no necesitamos remover proveedores - las búsquedas no se "devuelven"
 * Mantener función vacía para compatibilidad
 */
export function unregisterProviderShown(_userId: string, _categoryId: string, _providerId: string): void {
  // No hacer nada - las búsquedas usadas no se devuelven
}

/**
 * Obtener cantidad de búsquedas restantes para esta categoría.
 * Ya no hay límite - siempre retorna Infinity.
 */
export function getRemainingSearches(_userId: string, _categoryId: string): number {
  // Sin límite de búsquedas
  return Infinity;
}

// Alias para compatibilidad
export const getRemainingSlots = getRemainingSearches;

/**
 * Obtener cantidad de búsquedas usadas en esta categoría
 */
export function getSearchesUsedCount(userId: string, categoryId: string): number {
  const limits = getMatchLimits(userId, categoryId);
  return limits.searchesUsed;
}

// Alias para compatibilidad
export const getProvidersShownCount = getSearchesUsedCount;

/**
 * DEPRECADO: Ya no hay reset por tiempo.
 * Mantener para compatibilidad - siempre retorna 0.
 */
export function getTimeUntilReset(_userId: string, _categoryId: string): number {
  return 0; // Ya no hay reset por tiempo
}

/**
 * DEPRECADO: Ya no hay reset por tiempo.
 * Mantener para compatibilidad - siempre retorna mensaje indicando que debe rehacer encuesta.
 */
export function formatTimeUntilReset(_userId: string, _categoryId: string): string {
  return 'Rehaz la encuesta para obtener más búsquedas';
}

/**
 * Ya no rastreamos proveedores individuales - mantener para compatibilidad
 */
export function wasProviderShown(_userId: string, _categoryId: string, _providerId: string): boolean {
  return false; // Ya no rastreamos esto
}

/**
 * Forzar reset de búsquedas para una categoría.
 * Se llama cuando el usuario rehace la encuesta.
 * Esta es la ÚNICA forma de recuperar las búsquedas extra.
 */
export function forceResetCategory(userId: string, categoryId: string): void {
  const allLimits = getAllLimits(userId);
  
  allLimits[categoryId] = {
    categoryId,
    searchesUsed: 0,
  };
  
  saveAllLimits(userId, allLimits);
  console.log(`✓ Reset de búsquedas para categoría ${categoryId} (usuario rehizo encuesta)`);
}

/**
 * Limpiar todos los límites de un usuario (para testing/logout)
 */
export function clearAllLimits(userId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(getStorageKey(userId));
    console.log(`✓ Límites eliminados para usuario ${userId}`);
  } catch (error) {
    console.error('Error eliminando límites:', error);
  }
}
