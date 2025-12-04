'use client';

// Funciones de utilidad para R2 desde el cliente
// Todas las operaciones de upload se realizan a través de la API
// Los medios del portafolio son PÚBLICOS (sin firma)

/**
 * Tipos de medio
 */
export type MediaType = 'image' | 'video';

/**
 * Tipos para el portafolio
 */
export interface PortfolioImage {
  key: string;
  url: string;
  order: number;
  uploadedAt: string;
  type?: MediaType;
  mimeType?: string;
  size?: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
  mediaType: MediaType;
}

// Tipos de archivo permitidos
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
export const ALLOWED_MEDIA_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

// Límite de tamaño máximo (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Determina si un archivo es un video
 */
export function isVideoFile(file: File): boolean {
  return ALLOWED_VIDEO_TYPES.includes(file.type);
}

/**
 * Determina si un archivo es una imagen
 */
export function isImageFile(file: File): boolean {
  return ALLOWED_IMAGE_TYPES.includes(file.type);
}

/**
 * Obtiene el tipo de medio de un archivo
 */
export function getMediaType(file: File): MediaType {
  return isVideoFile(file) ? 'video' : 'image';
}

/**
 * Obtiene el tipo de medio de una URL o mimeType
 */
export function getMediaTypeFromMime(mimeType?: string): MediaType {
  if (!mimeType) return 'image';
  return ALLOWED_VIDEO_TYPES.includes(mimeType) ? 'video' : 'image';
}

/**
 * Sube un medio (imagen o video) de portafolio a través de la API
 * @param file - Archivo a subir
 * @param providerId - ID del proveedor
 * @param onProgress - Callback opcional para progreso de carga
 * @returns Resultado de la carga con key y URL pública
 */
export async function uploadPortfolioMedia(
  file: File,
  providerId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // Validar tipo de archivo en cliente
  if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
    throw new Error(`Tipo de archivo no permitido: ${file.type}. Solo se permiten imágenes (JPG, PNG, WebP) y videos (MP4, WebM, MOV)`);
  }

  // Validar tamaño (máximo 10MB)
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`El archivo excede el tamaño máximo de 10MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
  }

  // Importar auth de Firebase para obtener el token
  const { auth } = await import('@/lib/firebase/config');
  
  if (!auth.currentUser) {
    throw new Error('No hay un usuario autenticado. Por favor, inicia sesión.');
  }

  // Obtener token fresco
  const authToken = await auth.currentUser.getIdToken(true);

  // Crear FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('providerId', providerId);

  // Usar XMLHttpRequest para obtener progreso de carga
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Evento de progreso
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          });
        }
      });
    }

    // Evento de carga completada
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch {
          reject(new Error('Error al procesar la respuesta del servidor'));
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.error || 'Error al subir el archivo'));
        } catch {
          reject(new Error(`Error ${xhr.status}: ${xhr.statusText}`));
        }
      }
    });

    // Evento de error
    xhr.addEventListener('error', () => {
      reject(new Error('Error de red al subir el archivo'));
    });

    // Evento de timeout
    xhr.addEventListener('timeout', () => {
      reject(new Error('Tiempo de espera agotado al subir el archivo'));
    });

    // Configurar y enviar - timeout más largo para videos
    xhr.open('POST', '/api/upload-portfolio');
    xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
    xhr.timeout = isVideoFile(file) ? 120000 : 60000; // 2 min para videos, 1 min para imágenes
    xhr.send(formData);
  });
}

// Alias para compatibilidad
export const uploadPortfolioImage = uploadPortfolioMedia;

/**
 * Elimina un medio de portafolio a través de la API
 * @param key - Clave del objeto a eliminar
 * @param providerId - ID del proveedor (para verificación)
 */
export async function deletePortfolioMedia(key: string, providerId: string): Promise<void> {
  const { auth } = await import('@/lib/firebase/config');
  
  if (!auth.currentUser) {
    throw new Error('No hay un usuario autenticado. Por favor, inicia sesión.');
  }

  const authToken = await auth.currentUser.getIdToken(true);

  const response = await fetch('/api/upload-portfolio', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key, providerId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al eliminar el archivo');
  }
}

// Alias para compatibilidad
export const deletePortfolioImage = deletePortfolioMedia;

/**
 * Comprime una imagen antes de subirla (opcional, para mejor rendimiento)
 * NOTA: Solo funciona con imágenes, no con videos
 * @param file - Archivo original
 * @param maxWidth - Ancho máximo (default: 1920)
 * @param quality - Calidad de compresión (0-1, default: 0.85)
 * @returns Archivo comprimido como Blob
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.85
): Promise<Blob> {
  // No comprimir videos
  if (isVideoFile(file)) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo aspect ratio
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error('No se pudo crear el contexto del canvas'));
        return;
      }

      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Error al comprimir la imagen'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Error al cargar la imagen para compresión'));
    };

    // Cargar imagen desde el archivo
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Convierte un Blob a File manteniendo el nombre original
 */
export function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type });
}

/**
 * Genera un thumbnail de un video
 * @param videoFile - Archivo de video
 * @param seekTime - Tiempo en segundos donde capturar el thumbnail (default: 1)
 * @returns Blob del thumbnail como imagen JPEG
 */
export async function generateVideoThumbnail(
  videoFile: File,
  seekTime: number = 1
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      // Ir al tiempo especificado
      video.currentTime = Math.min(seekTime, video.duration);
    };

    video.onseeked = () => {
      // Configurar canvas con dimensiones del video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (!ctx) {
        reject(new Error('No se pudo crear el contexto del canvas'));
        return;
      }

      // Dibujar frame actual
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convertir a blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Error al generar thumbnail del video'));
          }
        },
        'image/jpeg',
        0.8
      );

      // Limpiar
      URL.revokeObjectURL(video.src);
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Error al cargar el video para generar thumbnail'));
    };

    // Cargar video
    video.src = URL.createObjectURL(videoFile);
  });
}
