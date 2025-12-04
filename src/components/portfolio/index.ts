// Componentes de Portafolio
export { default as PortfolioUploader } from './PortfolioUploader';
export { default as PortfolioGallery } from './PortfolioGallery';
export { default as ProfileImageEditor } from './ProfileImageEditor';

// Constantes de dimensiones de tarjetas
export { CARD_IMAGE_DIMENSIONS } from './ProfileImageEditor';

// Re-exportar tipos útiles
export type { PortfolioImage, UploadProgress } from '@/lib/cloudflare/r2.client';

