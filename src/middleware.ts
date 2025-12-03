import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware para proteger rutas y redirigir según tipo de usuario
 * 
 * Lee el token JWT de Firebase desde una cookie y decodifica los claims
 * sin necesidad de Firebase Admin SDK (solo lectura del payload JWT)
 */

// Decodificar JWT sin verificar firma (solo para leer claims)
// La verificación real la hace Firebase en el cliente y Firestore Rules
function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // El payload es la segunda parte del JWT
    const payload = parts[1];
    // Decodificar base64url
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonString = atob(base64);
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Obtener token de la cookie
  const token = request.cookies.get('firebase-token')?.value;
  const claims = token ? decodeJWT(token) : null;
  
  const isAdmin = claims?.admin === true || claims?.super_admin === true;
  const isAuthenticated = !!claims;

  // ============================================
  // RUTAS DE ADMIN
  // ============================================
  
  // /admin/login - Si ya es admin, redirigir al dashboard
  if (pathname === '/admin/login') {
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }
  
  // /admin/* - Solo admins pueden acceder
  if (pathname.startsWith('/admin')) {
    if (!isAdmin) {
      // No es admin, redirigir al login de admin
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // ============================================
  // RUTAS DE DASHBOARD (usuarios normales)
  // ============================================
  
  // /dashboard/* - Redirigir admins a su dashboard
  if (pathname.startsWith('/dashboard')) {
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // ============================================
  // RUTAS DE LOGIN
  // ============================================
  
  // /login - Si es admin, redirigir a /admin
  if (pathname === '/login') {
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/login',
  ],
};

