/**
 * Cloudflare Worker - Proxy público para R2 (MatriMatch)
 * 
 * Este worker sirve las imágenes del bucket R2 de forma pública.
 * Todas las imágenes bajo /portfolios/ son públicas y no requieren autenticación.
 * 
 * CONFIGURACIÓN:
 * 1. Crear un nuevo Worker en Cloudflare Dashboard
 * 2. Copiar este código en el editor del Worker
 * 3. Configurar el binding R2:
 *    - Variable name: MATRIMATCH_BUCKET
 *    - Bucket: matrimatch-media
 * 4. Configurar custom domain o route (ej: media.matrimatch.cl)
 * 
 * CORS Policy:
 * Permite requests desde los orígenes configurados en allowedOrigins
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Remover el slash inicial para obtener la key del objeto
    const key = path.startsWith('/') ? path.slice(1) : path;
    
    // Rutas públicas permitidas (todas las imágenes de portafolio)
    const publicPaths = ['/portfolios/'];
    const isPublicPath = publicPaths.some(p => path.startsWith(p));
    
    // Orígenes permitidos para CORS
    const allowedOrigins = [
      'http://localhost:3000',
      'http://192.168.1.82:3000',
      'https://matrimatch.cl',
      'https://www.matrimatch.cl',
      'https://app.matrimatch.cl',
      'https://matri-ai.vercel.app', // Vercel preview/production
    ];
    
    // Obtener el origen de la request
    const origin = request.headers.get('Origin') || '';
    const isAllowedOrigin = allowedOrigins.includes(origin) || origin === '';
    
    // Función helper para crear respuestas con CORS
    const corsResponse = (status = 200, body = null, extra = {}) => {
      const headers = {
        // CORS headers
        'Access-Control-Allow-Origin': isAllowedOrigin ? (origin || '*') : allowedOrigins[0],
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Expose-Headers': 'Content-Length, Content-Type, ETag, Last-Modified',
        // Security headers
        'Content-Disposition': 'inline',
        'Vary': 'Origin',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        // Extra headers
        ...extra
      };
      
      return new Response(body, { status, headers });
    };

    // Manejar preflight requests (OPTIONS)
    if (request.method === 'OPTIONS') {
      return corsResponse(204);
    }

    // Solo permitir GET y HEAD
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return corsResponse(405, 'Method Not Allowed', { 'Content-Type': 'text/plain' });
    }

    // Verificar que la ruta sea pública
    if (!isPublicPath) {
      return corsResponse(403, 'Forbidden - Only portfolio images are accessible', { 
        'Content-Type': 'text/plain' 
      });
    }

    // Si no hay key, retornar 404
    if (!key) {
      return corsResponse(404, 'Not Found', { 'Content-Type': 'text/plain' });
    }

    try {
      // Manejar HEAD requests
      if (request.method === 'HEAD') {
        const head = await env.MATRIMATCH_BUCKET.head(key);
        
        if (!head) {
          return corsResponse(404, null, { 'Content-Type': 'text/plain' });
        }
        
        return corsResponse(200, null, {
          'Content-Type': head.httpMetadata?.contentType || 'application/octet-stream',
          'Content-Length': String(head.size),
          'ETag': head.etag || '',
          'Last-Modified': head.uploaded?.toUTCString() || '',
          'Cache-Control': 'public, max-age=31536000, immutable',
        });
      }

      // Obtener el objeto de R2
      const object = await env.MATRIMATCH_BUCKET.get(key);
      
      if (!object || !object.body) {
        return corsResponse(404, 'Image not found', { 'Content-Type': 'text/plain' });
      }

      // Retornar la imagen con headers de cache agresivos
      return corsResponse(200, object.body, {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Content-Length': String(object.size),
        'ETag': object.etag || '',
        'Last-Modified': object.uploaded?.toUTCString() || '',
        // Cache por 1 año (imágenes inmutables - el nombre incluye timestamp)
        'Cache-Control': 'public, max-age=31536000, immutable',
      });

    } catch (err) {
      console.error('Error accessing R2 object:', err);
      return corsResponse(500, `Error: ${err?.message || 'Unknown error'}`, { 
        'Content-Type': 'text/plain' 
      });
    }
  }
};

