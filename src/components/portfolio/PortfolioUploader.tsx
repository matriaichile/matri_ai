'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, CheckCircle, Film, Play, GripVertical } from 'lucide-react';
import { 
  uploadPortfolioMedia, 
  compressImage, 
  blobToFile, 
  isVideoFile,
  isImageFile,
  getMediaTypeFromMime,
  type UploadProgress, 
  type PortfolioImage,
  ALLOWED_MEDIA_TYPES,
  MAX_FILE_SIZE,
} from '@/lib/cloudflare/r2.client';
import { useToast } from '@/components/ui/Toast';
import styles from './PortfolioUploader.module.css';

// Constantes de configuración
const MAX_ITEMS = 10;
const MIN_ITEMS = 5;

interface PortfolioUploaderProps {
  providerId: string;
  currentImages: PortfolioImage[];
  onImageUploaded: (image: PortfolioImage) => void;
  onImageDeleted: (key: string) => void;
  onImagesReordered: (images: PortfolioImage[]) => void;
  disabled?: boolean;
}

interface UploadingFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  isVideo: boolean;
}

// Estado para el video preview modal
interface VideoPreviewState {
  isOpen: boolean;
  url: string;
  title: string;
}

export default function PortfolioUploader({
  providerId,
  currentImages,
  onImageUploaded,
  onImageDeleted,
  onImagesReordered,
  disabled = false,
}: PortfolioUploaderProps) {
  const toast = useToast();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [videoPreview, setVideoPreview] = useState<VideoPreviewState>({ isOpen: false, url: '', title: '' });
  const [isDragging, setIsDragging] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remainingSlots = MAX_ITEMS - currentImages.length;
  const hasMinimumItems = currentImages.length >= MIN_ITEMS;

  // Validar archivo
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
      return 'Tipo de archivo no permitido. Solo imágenes (JPG, PNG, WebP) y videos (MP4, WebM, MOV).';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `El archivo es muy grande (máx. 10MB). Tamaño: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
    }
    return null;
  };

  // Crear preview para video
  const createVideoPreview = (file: File): string => {
    return URL.createObjectURL(file);
  };

  // Procesar archivos seleccionados
  const processFiles = useCallback(async (files: FileList | File[]) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    const availableSlots = remainingSlots - uploadingFiles.filter(f => f.status === 'uploading').length;

    if (availableSlots <= 0) {
      toast.warning('Límite alcanzado', `Has alcanzado el límite de ${MAX_ITEMS} elementos en tu portafolio.`);
      return;
    }

    // Limitar archivos a los slots disponibles
    const filesToProcess = fileArray.slice(0, availableSlots);

    // Crear entradas de carga
    const newUploads: UploadingFile[] = filesToProcess.map((file) => {
      const error = validateFile(file);
      const isVideo = isVideoFile(file);
      return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: isVideo ? createVideoPreview(file) : URL.createObjectURL(file),
        progress: 0,
        status: error ? 'error' : 'pending',
        error: error || undefined,
        isVideo,
      };
    });

    setUploadingFiles((prev) => [...prev, ...newUploads]);

    // Procesar cada archivo válido
    for (const upload of newUploads) {
      if (upload.status === 'error') continue;

      try {
        // Actualizar estado a uploading
        setUploadingFiles((prev) =>
          prev.map((u) => (u.id === upload.id ? { ...u, status: 'uploading' } : u))
        );

        // Comprimir imagen antes de subir (solo imágenes, no videos)
        let fileToUpload = upload.file;
        if (!upload.isVideo) {
          try {
            const compressed = await compressImage(upload.file, 1920, 0.85);
            if (compressed.size < upload.file.size) {
              fileToUpload = blobToFile(compressed, upload.file.name);
            }
          } catch {
            // Si falla la compresión, usar archivo original
            console.warn('No se pudo comprimir la imagen, usando original');
          }
        }

        // Subir a R2
        const result = await uploadPortfolioMedia(
          fileToUpload,
          providerId,
          (progress: UploadProgress) => {
            setUploadingFiles((prev) =>
              prev.map((u) =>
                u.id === upload.id ? { ...u, progress: progress.percentage } : u
              )
            );
          }
        );

        // Crear objeto de medio
        const newMedia: PortfolioImage = {
          key: result.key,
          url: result.url,
          order: currentImages.length,
          uploadedAt: new Date().toISOString(),
          type: result.mediaType,
          mimeType: result.contentType,
          size: result.size,
        };

        // Notificar éxito
        onImageUploaded(newMedia);

        // Actualizar estado a success
        setUploadingFiles((prev) =>
          prev.map((u) => (u.id === upload.id ? { ...u, status: 'success', progress: 100 } : u))
        );

        // Remover de la lista después de un momento
        setTimeout(() => {
          setUploadingFiles((prev) => prev.filter((u) => u.id !== upload.id));
          URL.revokeObjectURL(upload.preview);
        }, 2000);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setUploadingFiles((prev) =>
          prev.map((u) =>
            u.id === upload.id ? { ...u, status: 'error', error: errorMessage } : u
          )
        );
      }
    }
  }, [disabled, remainingSlots, uploadingFiles, providerId, currentImages.length, onImageUploaded]);

  // Manejar drag & drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  // Manejar click en zona de upload
  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Manejar selección de archivo
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Limpiar input para permitir seleccionar el mismo archivo
    e.target.value = '';
  }, [processFiles]);

  // Eliminar medio
  const handleDelete = useCallback(async (key: string) => {
    if (deletingKey) return;

    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar este elemento?');
    if (!confirmDelete) return;

    setDeletingKey(key);
    try {
      const { deletePortfolioMedia } = await import('@/lib/cloudflare/r2.client');
      await deletePortfolioMedia(key, providerId);
      onImageDeleted(key);
    } catch (error) {
      console.error('Error al eliminar elemento:', error);
      toast.error('Error al eliminar', 'No se pudo eliminar el elemento. Intenta de nuevo.');
    } finally {
      setDeletingKey(null);
    }
  }, [deletingKey, providerId, onImageDeleted]);

  // Cancelar upload pendiente o con error
  const handleCancelUpload = useCallback((id: string) => {
    setUploadingFiles((prev) => {
      const upload = prev.find((u) => u.id === id);
      if (upload) {
        URL.revokeObjectURL(upload.preview);
      }
      return prev.filter((u) => u.id !== id);
    });
  }, []);

  // Drag & Drop para reordenar
  const handleItemDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleItemDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // Reordenar temporalmente para mostrar preview
    const newItems = [...currentImages];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    
    // Actualizar orden
    const reorderedItems = newItems.map((item, i) => ({ ...item, order: i }));
    onImagesReordered(reorderedItems);
    setDraggedIndex(index);
  }, [draggedIndex, currentImages, onImagesReordered]);

  const handleItemDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  // Determinar si un item es video
  const isItemVideo = (item: PortfolioImage): boolean => {
    if (item.type === 'video') return true;
    if (item.mimeType?.startsWith('video/')) return true;
    return getMediaTypeFromMime(item.mimeType) === 'video';
  };

  // Abrir preview de video
  const openVideoPreview = useCallback((url: string, index: number) => {
    setVideoPreview({ isOpen: true, url, title: `Video ${index + 1}` });
    document.body.style.overflow = 'hidden';
  }, []);

  // Cerrar preview de video
  const closeVideoPreview = useCallback(() => {
    setVideoPreview({ isOpen: false, url: '', title: '' });
    document.body.style.overflow = '';
  }, []);

  return (
    <div className={styles.container}>
      {/* Header con contador */}
      <div className={styles.header}>
        <h3 className={styles.title}>
          <ImageIcon size={20} />
          Portafolio
        </h3>
        <div className={styles.counter}>
          <span className={currentImages.length >= MIN_ITEMS ? styles.counterOk : styles.counterWarning}>
            {currentImages.length}/{MAX_ITEMS}
          </span>
          {!hasMinimumItems && (
            <span className={styles.minWarning}>
              (mínimo {MIN_ITEMS})
            </span>
          )}
        </div>
      </div>

      {/* Grid de medios existentes */}
      {currentImages.length > 0 && (
        <div className={styles.imageGrid}>
          {currentImages
            .sort((a, b) => a.order - b.order)
            .map((item, index) => {
              const isVideo = isItemVideo(item);
              return (
                <div
                  key={item.key}
                  className={`${styles.imageCard} ${draggedIndex === index ? styles.dragging : ''} ${isVideo ? styles.videoCard : ''}`}
                  onDragOver={(e) => handleItemDragOver(e, index)}
                >
                  {isVideo ? (
                    <div className={styles.videoThumbnail}>
                      <video
                        src={item.url}
                        className={styles.video}
                        muted
                        preload="metadata"
                      />
                      {/* Botón de reproducir video */}
                      <button
                        type="button"
                        className={styles.videoPlayIcon}
                        onClick={() => openVideoPreview(item.url, index)}
                        aria-label="Reproducir video"
                      >
                        <Play size={24} />
                      </button>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={`Portafolio ${index + 1}`}
                      className={styles.image}
                    />
                  )}
                  <div className={styles.imageOverlay}>
                    <span className={styles.imageOrder}>
                      {isVideo && <Film size={12} />}
                      {index + 1}
                    </span>
                    <div className={styles.cardActions}>
                      {/* Handle para arrastrar */}
                      <div
                        className={styles.dragHandle}
                        draggable
                        onDragStart={(e) => handleItemDragStart(e, index)}
                        onDragEnd={handleItemDragEnd}
                        aria-label="Arrastrar para reordenar"
                      >
                        <GripVertical size={16} />
                      </div>
                      {/* Botón eliminar */}
                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => handleDelete(item.key)}
                        disabled={deletingKey === item.key}
                        aria-label="Eliminar elemento"
                      >
                        {deletingKey === item.key ? (
                          <Loader2 size={16} className={styles.spinner} />
                        ) : (
                          <X size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Archivos en proceso de carga */}
      {uploadingFiles.length > 0 && (
        <div className={styles.uploadingGrid}>
          {uploadingFiles.map((upload) => (
            <div key={upload.id} className={`${styles.uploadingCard} ${upload.isVideo ? styles.videoCard : ''}`}>
              {upload.isVideo ? (
                <video
                  src={upload.preview}
                  className={styles.uploadingImage}
                  muted
                />
              ) : (
                <img
                  src={upload.preview}
                  alt="Subiendo..."
                  className={styles.uploadingImage}
                />
              )}
              <div className={styles.uploadingOverlay}>
                {upload.status === 'uploading' && (
                  <>
                    <Loader2 size={24} className={styles.spinner} />
                    <span className={styles.uploadProgress}>{upload.progress}%</span>
                  </>
                )}
                {upload.status === 'success' && (
                  <CheckCircle size={24} className={styles.successIcon} />
                )}
                {upload.status === 'error' && (
                  <>
                    <AlertCircle size={24} className={styles.errorIcon} />
                    <span className={styles.errorText}>{upload.error}</span>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={() => handleCancelUpload(upload.id)}
                    >
                      Cerrar
                    </button>
                  </>
                )}
                {upload.status === 'pending' && (
                  <Loader2 size={24} className={styles.spinner} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zona de drop */}
      {remainingSlots > 0 && (
        <div
          className={`${styles.dropZone} ${isDragging ? styles.draggingOver : ''} ${disabled ? styles.disabled : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_MEDIA_TYPES.join(',')}
            multiple
            onChange={handleFileChange}
            className={styles.fileInput}
            disabled={disabled}
          />
          <div className={styles.uploadIcons}>
            <Upload size={28} className={styles.uploadIcon} />
            <Film size={24} className={styles.uploadIconVideo} />
          </div>
          <p className={styles.dropText}>
            {isDragging ? 'Suelta los archivos aquí' : 'Arrastra imágenes o videos, o haz clic para seleccionar'}
          </p>
          <p className={styles.dropHint}>
            Imágenes: JPG, PNG, WebP • Videos: MP4, WebM, MOV • Máximo 10MB • {remainingSlots} {remainingSlots === 1 ? 'espacio disponible' : 'espacios disponibles'}
          </p>
        </div>
      )}

      {/* Mensaje cuando está lleno */}
      {remainingSlots <= 0 && (
        <div className={styles.fullMessage}>
          <CheckCircle size={20} />
          Has alcanzado el límite de {MAX_ITEMS} elementos
        </div>
      )}

      {/* Tip para reordenar */}
      {currentImages.length > 1 && (
        <p className={styles.reorderTip}>
          💡 Usa el ícono ⋮⋮ para arrastrar y reordenar. El primero será el principal.
        </p>
      )}

      {/* Modal de preview de video */}
      {videoPreview.isOpen && (
        <div 
          className={styles.videoModal}
          onClick={closeVideoPreview}
        >
          <div 
            className={styles.videoModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.videoModalHeader}>
              <span>{videoPreview.title}</span>
              <button
                type="button"
                className={styles.videoModalClose}
                onClick={closeVideoPreview}
                aria-label="Cerrar"
              >
                <X size={24} />
              </button>
            </div>
            <video
              src={videoPreview.url}
              className={styles.videoModalPlayer}
              controls
              autoPlay
            />
          </div>
        </div>
      )}
    </div>
  );
}
