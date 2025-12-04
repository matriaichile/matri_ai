'use client';

// Funciones de utilidad para R2 desde el cliente
// Todas las operaciones de upload se realizan a través de la API
// Las imágenes del portafolio son PÚBLICAS (sin firma)

/**
 * Tipos para el portafolio
 */
export interface PortfolioImage {
  key: string;
  url: string;
  order: number;
  uploadedAt: string;
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
}

/**
 * Sube una imagen de portafolio a través de la API
 * @param file - Archivo a subir
 * @param providerId - ID del proveedor
 * @param onProgress - Callback opcional para progreso de carga
 * @returns Resultado de la carga con key y URL pública
 */
export async function uploadPortfolioImage(
  file: File,
  providerId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // Validar tipo de archivo en cliente
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Tipo de archivo no permitido: ${file.type}. Solo se permiten: JPG, PNG, WebP`);
  }

  // Validar tamaño (máximo 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(`El archivo excede el tamaño máximo de 5MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
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
          reject(new Error(errorData.error || 'Error al subir la imagen'));
        } catch {
          reject(new Error(`Error ${xhr.status}: ${xhr.statusText}`));
        }
      }
    });

    // Evento de error
    xhr.addEventListener('error', () => {
      reject(new Error('Error de red al subir la imagen'));
    });

    // Evento de timeout
    xhr.addEventListener('timeout', () => {
      reject(new Error('Tiempo de espera agotado al subir la imagen'));
    });

    // Configurar y enviar
    xhr.open('POST', '/api/upload-portfolio');
    xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
    xhr.timeout = 60000; // 60 segundos de timeout
    xhr.send(formData);
  });
}

/**
 * Elimina una imagen de portafolio a través de la API
 * @param key - Clave del objeto a eliminar
 * @param providerId - ID del proveedor (para verificación)
 */
export async function deletePortfolioImage(key: string, providerId: string): Promise<void> {
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
    throw new Error(errorData.error || 'Error al eliminar la imagen');
  }
}

/**
 * Comprime una imagen antes de subirla (opcional, para mejor rendimiento)
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

