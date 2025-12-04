/**
 * Cloudflare Worker - Proxy público para R2 (MatriMatch)
 * 
 * Este worker sirve los medios (imágenes y videos) del bucket R2 de forma pública.
 * Todos los medios bajo /portfolios/ son públicos y no requieren autenticación.
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
 * 
 * VIDEO STREAMING:
 * Soporta Range requests para streaming de video eficiente
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Remover el slash inicial para obtener la key del objeto
    const key = path.startsWith('/') ? path.slice(1) : path;
    
    // Rutas públicas permitidas (todos los medios de portafolio)
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
    
    // Tipos MIME de video soportados
    const videoMimeTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    
    // Función helper para crear respuestas con CORS
    const corsResponse = (status = 200, body = null, extra = {}) => {
      const headers = {
        // CORS headers
        'Access-Control-Allow-Origin': isAllowedOrigin ? (origin || '*') : allowedOrigins[0],
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Range',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Expose-Headers': 'Content-Length, Content-Type, ETag, Last-Modified, Accept-Ranges, Content-Range',
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
      return corsResponse(403, 'Forbidden - Only portfolio media is accessible', { 
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
        
        const contentType = head.httpMetadata?.contentType || 'application/octet-stream';
        const isVideo = videoMimeTypes.includes(contentType);
        
        return corsResponse(200, null, {
          'Content-Type': contentType,
          'Content-Length': String(head.size),
          'ETag': head.etag || '',
          'Last-Modified': head.uploaded?.toUTCString() || '',
          'Accept-Ranges': 'bytes',
          // Videos tienen cache más corto para permitir actualizaciones
          'Cache-Control': isVideo ? 'public, max-age=3600' : 'public, max-age=31536000, immutable',
        });
      }

      // Verificar si hay Range header (para streaming de video)
      const rangeHeader = request.headers.get('Range');
      
      // Si hay Range header, manejar como streaming parcial
      if (rangeHeader) {
        // Primero obtener metadata del objeto
        const head = await env.MATRIMATCH_BUCKET.head(key);
        
        if (!head) {
          return corsResponse(404, 'Media not found', { 'Content-Type': 'text/plain' });
        }
        
        const totalSize = head.size;
        const contentType = head.httpMetadata?.contentType || 'application/octet-stream';
        const isVideo = videoMimeTypes.includes(contentType);
        
        // Parsear Range header (formato: bytes=start-end)
        const rangeMatch = rangeHeader.match(/bytes=(\d*)-(\d*)/);
        
        if (!rangeMatch) {
          return corsResponse(416, 'Invalid Range', { 
            'Content-Type': 'text/plain',
            'Content-Range': `bytes */${totalSize}`
          });
        }
        
        let start = rangeMatch[1] ? parseInt(rangeMatch[1], 10) : 0;
        let end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : totalSize - 1;
        
        // Validar rango
        if (start >= totalSize || end >= totalSize || start > end) {
          return corsResponse(416, 'Range Not Satisfiable', { 
            'Content-Type': 'text/plain',
            'Content-Range': `bytes */${totalSize}`
          });
        }
        
        // Limitar el tamaño del chunk para videos (máximo 2MB por request)
        const maxChunkSize = 2 * 1024 * 1024; // 2MB
        if (isVideo && (end - start + 1) > maxChunkSize) {
          end = start + maxChunkSize - 1;
        }
        
        const contentLength = end - start + 1;
        
        // Obtener el rango específico del objeto
        const object = await env.MATRIMATCH_BUCKET.get(key, {
          range: { offset: start, length: contentLength }
        });
        
        if (!object || !object.body) {
          return corsResponse(404, 'Media not found', { 'Content-Type': 'text/plain' });
        }
        
        // Retornar respuesta parcial (206)
        return corsResponse(206, object.body, {
          'Content-Type': contentType,
          'Content-Length': String(contentLength),
          'Content-Range': `bytes ${start}-${end}/${totalSize}`,
          'Accept-Ranges': 'bytes',
          'ETag': head.etag || '',
          'Last-Modified': head.uploaded?.toUTCString() || '',
          'Cache-Control': isVideo ? 'public, max-age=3600' : 'public, max-age=31536000, immutable',
        });
      }

      // Sin Range header - retornar objeto completo
      const object = await env.MATRIMATCH_BUCKET.get(key);
      
      if (!object || !object.body) {
        return corsResponse(404, 'Media not found', { 'Content-Type': 'text/plain' });
      }
      
      const contentType = object.httpMetadata?.contentType || 'application/octet-stream';
      const isVideo = videoMimeTypes.includes(contentType);

      // Retornar el medio con headers apropiados
      return corsResponse(200, object.body, {
        'Content-Type': contentType,
        'Content-Length': String(object.size),
        'ETag': object.etag || '',
        'Last-Modified': object.uploaded?.toUTCString() || '',
        'Accept-Ranges': 'bytes',
        // Videos tienen cache más corto, imágenes cache agresivo
        'Cache-Control': isVideo ? 'public, max-age=3600' : 'public, max-age=31536000, immutable',
      });

    } catch (err) {
      console.error('Error accessing R2 object:', err);
      return corsResponse(500, `Error: ${err?.message || 'Unknown error'}`, { 
        'Content-Type': 'text/plain' 
      });
    }
  }
};
