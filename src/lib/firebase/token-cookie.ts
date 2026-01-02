/**
 * Utilidades para manejar el token de Firebase en cookies
 * Esto permite que el middleware lea los claims sin Firebase Admin SDK
 */

const COOKIE_NAME = 'firebase-token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

/**
 * Guardar el token de Firebase en una cookie
 */
export function setTokenCookie(token: string): void {
  if (typeof document === 'undefined') return;
  
  // Configurar cookie con opciones de seguridad
  const secure = window.location.protocol === 'https:';
  const sameSite = 'Lax';
  
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=${sameSite}${secure ? '; Secure' : ''}`;
}

/**
 * Eliminar el token de la cookie (logout)
 */
export function removeTokenCookie(): void {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

/**
 * Obtener el token de la cookie (cliente)
 */
export function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === COOKIE_NAME) {
      return value || null;
    }
  }
  return null;
}













