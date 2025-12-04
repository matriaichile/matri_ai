'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Image as ImageIcon, Play, Pause, Volume2, VolumeX, Maximize, Film } from 'lucide-react';
import styles from './PortfolioGallery.module.css';

// Tipos de medio
type MediaType = 'image' | 'video';

interface PortfolioMedia {
  key: string;
  url: string;
  order: number;
  uploadedAt?: string;
  type?: MediaType;
  mimeType?: string;
  size?: number;
}

interface PortfolioGalleryProps {
  images: PortfolioMedia[];
  providerName?: string;
  compact?: boolean;
  maxPreviewImages?: number;
}

// Determinar si un item es video
function isItemVideo(item: PortfolioMedia): boolean {
  if (item.type === 'video') return true;
  if (item.mimeType?.startsWith('video/')) return true;
  // Verificar por extensión de URL
  const videoExtensions = ['.mp4', '.webm', '.mov'];
  return videoExtensions.some(ext => item.url.toLowerCase().includes(ext));
}

export default function PortfolioGallery({
  images,
  providerName = 'Proveedor',
  compact = false,
  maxPreviewImages = 4,
}: PortfolioGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Ordenar medios
  const sortedMedia = [...images].sort((a, b) => a.order - b.order);

  // Medios a mostrar en preview
  const previewMedia = compact ? sortedMedia.slice(0, maxPreviewImages) : sortedMedia;
  const remainingCount = sortedMedia.length - maxPreviewImages;

  // Resetear estado del video cuando cambia el índice
  useEffect(() => {
    if (selectedIndex !== null) {
      setIsPlaying(false);
      setProgress(0);
    }
  }, [selectedIndex]);

  // Abrir modal con medio seleccionado
  const openModal = useCallback((index: number) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  // Cerrar modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedIndex(null);
    setIsPlaying(false);
    setProgress(0);
    document.body.style.overflow = '';
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  // Navegar a medio anterior
  const goToPrevious = useCallback(() => {
    if (selectedIndex === null) return;
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsPlaying(false);
    setProgress(0);
    setSelectedIndex((selectedIndex - 1 + sortedMedia.length) % sortedMedia.length);
  }, [selectedIndex, sortedMedia.length]);

  // Navegar a medio siguiente
  const goToNext = useCallback(() => {
    if (selectedIndex === null) return;
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsPlaying(false);
    setProgress(0);
    setSelectedIndex((selectedIndex + 1) % sortedMedia.length);
  }, [selectedIndex, sortedMedia.length]);

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
      case ' ':
        e.preventDefault();
        if (selectedIndex !== null && isItemVideo(sortedMedia[selectedIndex])) {
          togglePlay();
        }
        break;
    }
  }, [isModalOpen, closeModal, goToPrevious, goToNext, selectedIndex, sortedMedia]);

  // Control de video
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(progress);
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    videoRef.current.currentTime = percentage * videoRef.current.duration;
  }, []);

  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false);
    setProgress(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!videoRef.current) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  }, []);

  // Si no hay medios, mostrar placeholder
  if (sortedMedia.length === 0) {
    return (
      <div className={styles.emptyState}>
        <ImageIcon size={32} />
        <p>Sin fotos en el portafolio</p>
      </div>
    );
  }

  const currentItem = selectedIndex !== null ? sortedMedia[selectedIndex] : null;
  const isCurrentVideo = currentItem ? isItemVideo(currentItem) : false;

  return (
    <div className={styles.container} onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Grid de preview */}
      <div className={`${styles.grid} ${compact ? styles.compact : ''}`}>
        {previewMedia.map((item, index) => {
          const isVideo = isItemVideo(item);
          return (
            <button
              key={item.key}
              type="button"
              className={`${styles.imageButton} ${isVideo ? styles.videoButton : ''}`}
              onClick={() => openModal(index)}
              aria-label={`Ver ${isVideo ? 'video' : 'imagen'} ${index + 1} del portafolio de ${providerName}`}
            >
              {isVideo ? (
                <>
                  <video
                    src={item.url}
                    className={styles.thumbnail}
                    muted
                    preload="metadata"
                  />
                  <div className={styles.videoIndicator}>
                    <Play size={20} />
                  </div>
                </>
              ) : (
                <img
                  src={item.url}
                  alt={`Portafolio ${index + 1}`}
                  className={styles.thumbnail}
                  loading="lazy"
                />
              )}
              <div className={styles.imageOverlay}>
                {isVideo ? <Play size={20} /> : <ZoomIn size={20} />}
              </div>
            </button>
          );
        })}

        {/* Indicador de más medios */}
        {compact && remainingCount > 0 && (
          <button
            type="button"
            className={styles.moreButton}
            onClick={() => openModal(maxPreviewImages)}
            aria-label={`Ver ${remainingCount} elementos más`}
          >
            <span className={styles.moreCount}>+{remainingCount}</span>
            <span className={styles.moreText}>más</span>
          </button>
        )}
      </div>

      {/* Modal de galería */}
      {isModalOpen && selectedIndex !== null && currentItem && (
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
                {isCurrentVideo && <Film size={16} />}
                {providerName} - {isCurrentVideo ? 'Video' : 'Foto'} {selectedIndex + 1} de {sortedMedia.length}
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

            {/* Contenido principal */}
            <div className={styles.modalImageContainer}>
              {isCurrentVideo ? (
                <div className={styles.videoContainer}>
                  <video
                    ref={videoRef}
                    src={currentItem.url}
                    className={styles.modalVideo}
                    onClick={togglePlay}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleVideoEnded}
                    muted={isMuted}
                    playsInline
                  />
                  
                  {/* Overlay de play cuando está pausado */}
                  {!isPlaying && (
                    <div className={styles.videoPlayOverlay} onClick={togglePlay}>
                      <div className={styles.playButtonLarge}>
                        <Play size={48} />
                      </div>
                    </div>
                  )}

                  {/* Controles del video */}
                  <div className={styles.videoControls}>
                    <button
                      type="button"
                      className={styles.videoControlBtn}
                      onClick={togglePlay}
                      aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>

                    <div 
                      className={styles.progressBar}
                      onClick={handleProgressClick}
                    >
                      <div 
                        className={styles.progressFill}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <button
                      type="button"
                      className={styles.videoControlBtn}
                      onClick={toggleMute}
                      aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>

                    <button
                      type="button"
                      className={styles.videoControlBtn}
                      onClick={toggleFullscreen}
                      aria-label="Pantalla completa"
                    >
                      <Maximize size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <img
                  src={currentItem.url}
                  alt={`Portafolio ${selectedIndex + 1}`}
                  className={styles.modalImage}
                />
              )}
            </div>

            {/* Controles de navegación */}
            {sortedMedia.length > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.navButton} ${styles.navPrev}`}
                  onClick={goToPrevious}
                  aria-label="Anterior"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  type="button"
                  className={`${styles.navButton} ${styles.navNext}`}
                  onClick={goToNext}
                  aria-label="Siguiente"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            {/* Thumbnails de navegación */}
            {sortedMedia.length > 1 && (
              <div className={styles.thumbnailStrip}>
                {sortedMedia.map((item, index) => {
                  const isVideo = isItemVideo(item);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      className={`${styles.stripThumbnail} ${index === selectedIndex ? styles.active : ''} ${isVideo ? styles.stripVideoThumbnail : ''}`}
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.pause();
                        }
                        setIsPlaying(false);
                        setProgress(0);
                        setSelectedIndex(index);
                      }}
                      aria-label={`Ir a ${isVideo ? 'video' : 'imagen'} ${index + 1}`}
                    >
                      {isVideo ? (
                        <>
                          <video
                            src={item.url}
                            muted
                            preload="metadata"
                          />
                          <div className={styles.stripVideoIcon}>
                            <Play size={12} />
                          </div>
                        </>
                      ) : (
                        <img
                          src={item.url}
                          alt={`Miniatura ${index + 1}`}
                          loading="lazy"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
