// SOLO PARA SERVIDOR - NO IMPORTAR EN COMPONENTES CLIENTE
// Configuración y operaciones de Cloudflare R2 para almacenamiento de imágenes del portafolio
// Todas las imágenes del portafolio son PÚBLICAS (sin firma)

import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

// ===========================
// Configuración de R2
// ===========================

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'matrimatch-media';

// URL pública del proxy de Cloudflare Workers para servir imágenes
// Esta URL se usa para acceder a las imágenes públicamente sin firma
export const PUBLIC_MEDIA_URL = process.env.R2_PUBLIC_URL || 'https://r2-public-proxy.matriaichile.workers.dev';

// Verificar credenciales en desarrollo
if (process.env.NODE_ENV === 'development') {
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.warn('⚠️ Advertencia: Las credenciales de R2 no están configuradas. Las funciones de portafolio no funcionarán.');
  }
}

// Construir endpoint de R2
const endpoint = R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : '';

// Cliente R2 (S3-compatible)
export const r2Client = R2_ACCOUNT_ID ? new S3Client({
  region: 'auto',
  endpoint,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
  retryMode: 'standard',
  maxAttempts: 3,
}) : null;

// ===========================
// Tipos
// ===========================

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

export interface PortfolioImage {
  key: string;
  url: string;
  order: number;
  uploadedAt: string;
}

// ===========================
// Funciones de utilidad
// ===========================

/**
 * Construye la ruta de almacenamiento para una imagen de portafolio
 * Todas las imágenes de portafolio son públicas y se almacenan bajo /portfolios/
 * @param providerId - ID del proveedor
 * @param fileName - Nombre original del archivo
 * @returns Ruta completa en el bucket
 */
export function buildPortfolioPath(providerId: string, fileName: string): string {
  const timestamp = Date.now();
  const sanitizedFileName = fileName
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '');
  
  // Estructura: portfolios/{providerId}/{timestamp}_{filename}
  return `portfolios/${providerId}/${timestamp}_${sanitizedFileName}`;
}

/**
 * Construye la URL pública para acceder a una imagen
 * @param key - Clave del objeto en R2
 * @returns URL pública completa
 */
export function getPublicUrl(key: string): string {
  return `${PUBLIC_MEDIA_URL}/${key}`;
}

/**
 * Sube una imagen de portafolio a R2
 * @param providerId - ID del proveedor
 * @param file - Buffer del archivo
 * @param fileName - Nombre original del archivo
 * @param contentType - Tipo MIME del archivo
 * @returns Resultado de la carga con key y URL pública
 */
export async function uploadPortfolioImage(
  providerId: string,
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<UploadResult> {
  if (!r2Client) {
    throw new Error('R2 no está configurado. Verifica las variables de entorno.');
  }

  // Validar tipo de archivo
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(contentType)) {
    throw new Error(`Tipo de archivo no permitido: ${contentType}. Solo se permiten: ${allowedTypes.join(', ')}`);
  }

  // Validar tamaño (máximo 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.length > maxSize) {
    throw new Error(`El archivo excede el tamaño máximo de 5MB. Tamaño actual: ${(file.length / 1024 / 1024).toFixed(2)}MB`);
  }

  const key = buildPortfolioPath(providerId, fileName);

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    // Metadata para identificar el archivo
    Metadata: {
      'provider-id': providerId,
      'original-name': fileName,
      'uploaded-at': new Date().toISOString(),
    },
    // Cache headers para mejor rendimiento
    CacheControl: 'public, max-age=31536000, immutable',
  });

  await r2Client.send(command);

  return {
    key,
    url: getPublicUrl(key),
    size: file.length,
    contentType,
  };
}

/**
 * Elimina una imagen de portafolio de R2
 * @param key - Clave del objeto a eliminar
 */
export async function deletePortfolioImage(key: string): Promise<void> {
  if (!r2Client) {
    throw new Error('R2 no está configurado. Verifica las variables de entorno.');
  }

  // Validar que la key pertenece a portfolios (seguridad)
  if (!key.startsWith('portfolios/')) {
    throw new Error('Solo se pueden eliminar imágenes de portafolio.');
  }

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
}

/**
 * Verifica si una imagen existe en R2
 * @param key - Clave del objeto
 * @returns true si existe, false si no
 */
export async function portfolioImageExists(key: string): Promise<boolean> {
  if (!r2Client) {
    return false;
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    await r2Client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Elimina múltiples imágenes de portafolio
 * @param keys - Array de claves a eliminar
 */
export async function deleteMultiplePortfolioImages(keys: string[]): Promise<void> {
  if (!r2Client || keys.length === 0) {
    return;
  }

  // Eliminar en paralelo con límite de concurrencia
  const batchSize = 10;
  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize);
    await Promise.all(batch.map(key => deletePortfolioImage(key)));
  }
}

