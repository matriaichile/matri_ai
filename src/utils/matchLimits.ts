/**
 * Sistema de límites de "buscar nuevo proveedor" por categoría cada 24 horas.
 * Implementación 100% local con localStorage.
 * 
 * Reglas:
 * - Al completar encuesta: se generan 3 leads iniciales (NO cuentan contra el límite)
 * - Máximo 2 "buscar nuevo proveedor" por día por categoría
 * - Máximo 3 matches ACTIVOS al mismo tiempo (approved + pending)
 * - Al rehacer encuesta: se reinicia el contador de búsquedas para esa categoría
 * - El reset automático es después de 24 horas
 */

// Constantes del sistema
export const INITIAL_MATCHES_COUNT = 3; // Matches iniciales al completar encuesta (NO cuentan contra límite)
export const DAILY_SEARCH_LIMIT = 2; // Máximo "buscar nuevo proveedor" por día por categoría
export const RESET_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 horas

// Máximo de matches ACTIVOS (approved + pending) que puede tener un usuario por categoría
// Los rejected NO cuentan. Si tiene 3 activos, NO puede agregar más ni recuperar descartados.
export const MAX_ACTIVE_MATCHES_PER_CATEGORY = 3;

// DEPRECADO: Mantener para compatibilidad, pero ya no se usa
export const MATCH_LIMIT_PER_CATEGORY = DAILY_SEARCH_LIMIT;
export const EXTRA_MATCHES_ALLOWED = DAILY_SEARCH_LIMIT;

// Estructura de datos para límites por categoría
export interface CategoryMatchLimit {
  categoryId: string;
  searchesUsed: number;  // Cantidad de "buscar nuevo proveedor" usados hoy
  lastResetTimestamp: number; // Unix timestamp del último reset
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
 * Si pasaron 24 horas, hace reset automático.
 */
export function getMatchLimits(userId: string, categoryId: string): CategoryMatchLimit {
  const allLimits = getAllLimits(userId);
  
  let categoryLimit = allLimits[categoryId] || {
    categoryId,
    searchesUsed: 0,
    lastResetTimestamp: Date.now(),
  };
  
  // Migración: si tiene el formato viejo (providersShown), convertir al nuevo
  if ('providersShown' in categoryLimit && !('searchesUsed' in categoryLimit)) {
    categoryLimit = {
      categoryId,
      searchesUsed: 0, // Reiniciar al migrar
      lastResetTimestamp: Date.now(),
    };
  }
  
  // Verificar si pasaron 24 horas - RESET automático
  const timeSinceReset = Date.now() - categoryLimit.lastResetTimestamp;
  if (timeSinceReset >= RESET_INTERVAL_MS) {
    categoryLimit = {
      categoryId,
      searchesUsed: 0,
      lastResetTimestamp: Date.now(),
    };
    
    // Guardar el reset
    allLimits[categoryId] = categoryLimit;
    saveAllLimits(userId, allLimits);
    
    console.log(`✓ Reset automático de búsquedas para categoría ${categoryId}`);
  }
  
  return categoryLimit;
}

/**
 * Verificar si puede buscar más proveedores hoy en una categoría
 */
export function canSearchMoreProviders(userId: string, categoryId: string): boolean {
  const limits = getMatchLimits(userId, categoryId);
  return limits.searchesUsed < DAILY_SEARCH_LIMIT;
}

// Alias para compatibilidad
export const canShowMoreProviders = canSearchMoreProviders;

/**
 * Registrar que el usuario usó una búsqueda de "nuevo proveedor".
 * Solo llamar cuando el usuario hace clic en "Mostrar nuevo proveedor".
 * NO llamar para los 3 leads iniciales de la encuesta.
 */
export function registerSearchUsed(userId: string, categoryId: string): void {
  const allLimits = getAllLimits(userId);
  const categoryLimit = getMatchLimits(userId, categoryId);
  
  categoryLimit.searchesUsed += 1;
  allLimits[categoryId] = categoryLimit;
  saveAllLimits(userId, allLimits);
  
  console.log(`✓ Búsqueda registrada para ${categoryId} (${categoryLimit.searchesUsed}/${DAILY_SEARCH_LIMIT})`);
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
 * Obtener cantidad de búsquedas restantes para hoy
 */
export function getRemainingSearches(userId: string, categoryId: string): number {
  const limits = getMatchLimits(userId, categoryId);
  return Math.max(0, DAILY_SEARCH_LIMIT - limits.searchesUsed);
}

// Alias para compatibilidad
export const getRemainingSlots = getRemainingSearches;

/**
 * Obtener cantidad de búsquedas usadas hoy
 */
export function getSearchesUsedCount(userId: string, categoryId: string): number {
  const limits = getMatchLimits(userId, categoryId);
  return limits.searchesUsed;
}

// Alias para compatibilidad
export const getProvidersShownCount = getSearchesUsedCount;

/**
 * Obtener tiempo restante hasta el próximo reset (en milisegundos)
 */
export function getTimeUntilReset(userId: string, categoryId: string): number {
  const limits = getMatchLimits(userId, categoryId);
  const elapsed = Date.now() - limits.lastResetTimestamp;
  return Math.max(0, RESET_INTERVAL_MS - elapsed);
}

/**
 * Formatear tiempo restante a string legible
 */
export function formatTimeUntilReset(userId: string, categoryId: string): string {
  const ms = getTimeUntilReset(userId, categoryId);
  
  if (ms <= 0) return 'Disponible ahora';
  
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} minutos`;
}

/**
 * Ya no rastreamos proveedores individuales - mantener para compatibilidad
 */
export function wasProviderShown(_userId: string, _categoryId: string, _providerId: string): boolean {
  return false; // Ya no rastreamos esto
}

/**
 * Forzar reset de búsquedas para una categoría.
 * Útil cuando el usuario rehace la encuesta.
 */
export function forceResetCategory(userId: string, categoryId: string): void {
  const allLimits = getAllLimits(userId);
  
  allLimits[categoryId] = {
    categoryId,
    searchesUsed: 0,
    lastResetTimestamp: Date.now(),
  };
  
  saveAllLimits(userId, allLimits);
  console.log(`✓ Reset de búsquedas para categoría ${categoryId}`);
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





