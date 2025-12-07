/**
 * Sistema de límites de matches por categoría cada 24 horas.
 * Implementación 100% local con localStorage.
 * 
 * Reglas:
 * - Máximo 5 proveedores visibles por categoría cada 24 horas
 * - Los matches aprobados ("Me interesa") NO cuentan contra el límite
 * - El reset es automático después de 24 horas
 * - El reset es por categoría, no global
 */

// Constantes del sistema
export const MATCH_LIMIT_PER_CATEGORY = 5;
export const RESET_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 horas

// Estructura de datos para límites por categoría
export interface CategoryMatchLimit {
  categoryId: string;
  providersShown: string[];  // IDs de proveedores mostrados (pendientes + rechazados)
  lastResetTimestamp: number; // Unix timestamp de última búsqueda/reset
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
    providersShown: [],
    lastResetTimestamp: Date.now(),
  };
  
  // Verificar si pasaron 24 horas - RESET automático
  const timeSinceReset = Date.now() - categoryLimit.lastResetTimestamp;
  if (timeSinceReset >= RESET_INTERVAL_MS) {
    categoryLimit = {
      categoryId,
      providersShown: [],
      lastResetTimestamp: Date.now(),
    };
    
    // Guardar el reset
    allLimits[categoryId] = categoryLimit;
    saveAllLimits(userId, allLimits);
    
    console.log(`✓ Reset automático de límites para categoría ${categoryId}`);
  }
  
  return categoryLimit;
}

/**
 * Verificar si se pueden mostrar más proveedores en una categoría
 */
export function canShowMoreProviders(userId: string, categoryId: string): boolean {
  const limits = getMatchLimits(userId, categoryId);
  return limits.providersShown.length < MATCH_LIMIT_PER_CATEGORY;
}

/**
 * Registrar que un proveedor fue mostrado al usuario.
 * Solo debe llamarse cuando el usuario VE al proveedor (pendiente o rechazado).
 * NO llamar cuando el proveedor es aprobado.
 */
export function registerProviderShown(userId: string, categoryId: string, providerId: string): void {
  const allLimits = getAllLimits(userId);
  const categoryLimit = getMatchLimits(userId, categoryId);
  
  // Solo agregar si no está ya en la lista
  if (!categoryLimit.providersShown.includes(providerId)) {
    categoryLimit.providersShown.push(providerId);
    allLimits[categoryId] = categoryLimit;
    saveAllLimits(userId, allLimits);
    
    console.log(`✓ Proveedor ${providerId} registrado para ${categoryId} (${categoryLimit.providersShown.length}/${MATCH_LIMIT_PER_CATEGORY})`);
  }
}

/**
 * Remover un proveedor de la lista de mostrados.
 * Útil cuando el usuario aprueba un match (no debería contar contra el límite).
 */
export function unregisterProviderShown(userId: string, categoryId: string, providerId: string): void {
  const allLimits = getAllLimits(userId);
  const categoryLimit = getMatchLimits(userId, categoryId);
  
  const index = categoryLimit.providersShown.indexOf(providerId);
  if (index > -1) {
    categoryLimit.providersShown.splice(index, 1);
    allLimits[categoryId] = categoryLimit;
    saveAllLimits(userId, allLimits);
    
    console.log(`✓ Proveedor ${providerId} removido del límite para ${categoryId}`);
  }
}

/**
 * Obtener cantidad de slots restantes para una categoría
 */
export function getRemainingSlots(userId: string, categoryId: string): number {
  const limits = getMatchLimits(userId, categoryId);
  return Math.max(0, MATCH_LIMIT_PER_CATEGORY - limits.providersShown.length);
}

/**
 * Obtener cantidad de proveedores ya mostrados
 */
export function getProvidersShownCount(userId: string, categoryId: string): number {
  const limits = getMatchLimits(userId, categoryId);
  return limits.providersShown.length;
}

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
 * Verificar si un proveedor específico ya fue mostrado
 */
export function wasProviderShown(userId: string, categoryId: string, providerId: string): boolean {
  const limits = getMatchLimits(userId, categoryId);
  return limits.providersShown.includes(providerId);
}

/**
 * Forzar reset de límites para una categoría (para testing/admin)
 */
export function forceResetCategory(userId: string, categoryId: string): void {
  const allLimits = getAllLimits(userId);
  
  allLimits[categoryId] = {
    categoryId,
    providersShown: [],
    lastResetTimestamp: Date.now(),
  };
  
  saveAllLimits(userId, allLimits);
  console.log(`✓ Reset forzado de límites para categoría ${categoryId}`);
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





