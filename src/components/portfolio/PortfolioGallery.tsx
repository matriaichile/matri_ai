'use client';

import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Image as ImageIcon } from 'lucide-react';
import styles from './PortfolioGallery.module.css';

interface PortfolioImage {
  key: string;
  url: string;
  order: number;
  uploadedAt?: string;
}

interface PortfolioGalleryProps {
  images: PortfolioImage[];
  providerName?: string;
  compact?: boolean;
  maxPreviewImages?: number;
}

export default function PortfolioGallery({
  images,
  providerName = 'Proveedor',
  compact = false,
  maxPreviewImages = 4,
}: PortfolioGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ordenar imágenes
  const sortedImages = [...images].sort((a, b) => a.order - b.order);

  // Imágenes a mostrar en preview
  const previewImages = compact ? sortedImages.slice(0, maxPreviewImages) : sortedImages;
  const remainingCount = sortedImages.length - maxPreviewImages;

  // Abrir modal con imagen seleccionada
  const openModal = useCallback((index: number) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  // Cerrar modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedIndex(null);
    document.body.style.overflow = '';
  }, []);

  // Navegar a imagen anterior
  const goToPrevious = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + sortedImages.length) % sortedImages.length);
  }, [selectedIndex, sortedImages.length]);

  // Navegar a imagen siguiente
  const goToNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % sortedImages.length);
  }, [selectedIndex, sortedImages.length]);

  // Manejar teclas
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isModalOpen) return;
    
    switch (e.key) {
      case 'Escape':
        closeModal();
        break;
      case 'ArrowLeft':
        goToPrevious();
        break;
      case 'ArrowRight':
        goToNext();
        break;
    }
  }, [isModalOpen, closeModal, goToPrevious, goToNext]);

  // Si no hay imágenes, mostrar placeholder
  if (sortedImages.length === 0) {
    return (
      <div className={styles.emptyState}>
        <ImageIcon size={32} />
        <p>Sin fotos en el portafolio</p>
      </div>
    );
  }

  return (
    <div className={styles.container} onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Grid de preview */}
      <div className={`${styles.grid} ${compact ? styles.compact : ''}`}>
        {previewImages.map((image, index) => (
          <button
            key={image.key}
            type="button"
            className={styles.imageButton}
            onClick={() => openModal(index)}
            aria-label={`Ver imagen ${index + 1} del portafolio de ${providerName}`}
          >
            <img
              src={image.url}
              alt={`Portafolio ${index + 1}`}
              className={styles.thumbnail}
              loading="lazy"
            />
            <div className={styles.imageOverlay}>
              <ZoomIn size={20} />
            </div>
          </button>
        ))}

        {/* Indicador de más imágenes */}
        {compact && remainingCount > 0 && (
          <button
            type="button"
            className={styles.moreButton}
            onClick={() => openModal(maxPreviewImages)}
            aria-label={`Ver ${remainingCount} imágenes más`}
          >
            <span className={styles.moreCount}>+{remainingCount}</span>
            <span className={styles.moreText}>más</span>
          </button>
        )}
      </div>

      {/* Modal de galería */}
      {isModalOpen && selectedIndex !== null && (
        <div 
          className={styles.modal}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label={`Galería de ${providerName}`}
        >
          <div 
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>
                {providerName} - Foto {selectedIndex + 1} de {sortedImages.length}
              </span>
              <button
                type="button"
                className={styles.closeButton}
                onClick={closeModal}
                aria-label="Cerrar galería"
              >
                <X size={24} />
              </button>
            </div>

            {/* Imagen principal */}
            <div className={styles.modalImageContainer}>
              <img
                src={sortedImages[selectedIndex].url}
                alt={`Portafolio ${selectedIndex + 1}`}
                className={styles.modalImage}
              />
            </div>

            {/* Controles de navegación */}
            {sortedImages.length > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.navButton} ${styles.navPrev}`}
                  onClick={goToPrevious}
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  type="button"
                  className={`${styles.navButton} ${styles.navNext}`}
                  onClick={goToNext}
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            {/* Thumbnails de navegación */}
            {sortedImages.length > 1 && (
              <div className={styles.thumbnailStrip}>
                {sortedImages.map((image, index) => (
                  <button
                    key={image.key}
                    type="button"
                    className={`${styles.stripThumbnail} ${index === selectedIndex ? styles.active : ''}`}
                    onClick={() => setSelectedIndex(index)}
                    aria-label={`Ir a imagen ${index + 1}`}
                  >
                    <img
                      src={image.url}
                      alt={`Miniatura ${index + 1}`}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

