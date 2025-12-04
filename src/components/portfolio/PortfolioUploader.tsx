'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { uploadPortfolioImage, compressImage, blobToFile, type UploadProgress, type PortfolioImage } from '@/lib/cloudflare/r2.client';
import styles from './PortfolioUploader.module.css';

// Constantes de configuración
const MAX_IMAGES = 10;
const MIN_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

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
}

export default function PortfolioUploader({
  providerId,
  currentImages,
  onImageUploaded,
  onImageDeleted,
  onImagesReordered,
  disabled = false,
}: PortfolioUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remainingSlots = MAX_IMAGES - currentImages.length;
  const hasMinimumImages = currentImages.length >= MIN_IMAGES;

  // Validar archivo
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Tipo de archivo no permitido. Solo JPG, PNG y WebP.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `El archivo es muy grande (máx. 5MB). Tamaño: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
    }
    return null;
  };

  // Procesar archivos seleccionados
  const processFiles = useCallback(async (files: FileList | File[]) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    const availableSlots = remainingSlots - uploadingFiles.filter(f => f.status === 'uploading').length;

    if (availableSlots <= 0) {
      alert(`Has alcanzado el límite de ${MAX_IMAGES} imágenes.`);
      return;
    }

    // Limitar archivos a los slots disponibles
    const filesToProcess = fileArray.slice(0, availableSlots);

    // Crear entradas de carga
    const newUploads: UploadingFile[] = filesToProcess.map((file) => {
      const error = validateFile(file);
      return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: error ? 'error' : 'pending',
        error: error || undefined,
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

        // Comprimir imagen antes de subir
        let fileToUpload = upload.file;
        try {
          const compressed = await compressImage(upload.file, 1920, 0.85);
          if (compressed.size < upload.file.size) {
            fileToUpload = blobToFile(compressed, upload.file.name);
          }
        } catch {
          // Si falla la compresión, usar archivo original
          console.warn('No se pudo comprimir la imagen, usando original');
        }

        // Subir a R2
        const result = await uploadPortfolioImage(
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

        // Crear objeto de imagen
        const newImage: PortfolioImage = {
          key: result.key,
          url: result.url,
          order: currentImages.length,
          uploadedAt: new Date().toISOString(),
        };

        // Notificar éxito
        onImageUploaded(newImage);

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

  // Eliminar imagen
  const handleDelete = useCallback(async (key: string) => {
    if (deletingKey) return;

    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar esta imagen?');
    if (!confirmDelete) return;

    setDeletingKey(key);
    try {
      const { deletePortfolioImage } = await import('@/lib/cloudflare/r2.client');
      await deletePortfolioImage(key, providerId);
      onImageDeleted(key);
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      alert('Error al eliminar la imagen. Intenta de nuevo.');
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
  const handleImageDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleImageDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // Reordenar temporalmente para mostrar preview
    const newImages = [...currentImages];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    
    // Actualizar orden
    const reorderedImages = newImages.map((img, i) => ({ ...img, order: i }));
    onImagesReordered(reorderedImages);
    setDraggedIndex(index);
  }, [draggedIndex, currentImages, onImagesReordered]);

  const handleImageDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  return (
    <div className={styles.container}>
      {/* Header con contador */}
      <div className={styles.header}>
        <h3 className={styles.title}>
          <ImageIcon size={20} />
          Portafolio de Fotos
        </h3>
        <div className={styles.counter}>
          <span className={currentImages.length >= MIN_IMAGES ? styles.counterOk : styles.counterWarning}>
            {currentImages.length}/{MAX_IMAGES}
          </span>
          {!hasMinimumImages && (
            <span className={styles.minWarning}>
              (mínimo {MIN_IMAGES} fotos)
            </span>
          )}
        </div>
      </div>

      {/* Grid de imágenes existentes */}
      {currentImages.length > 0 && (
        <div className={styles.imageGrid}>
          {currentImages
            .sort((a, b) => a.order - b.order)
            .map((image, index) => (
              <div
                key={image.key}
                className={`${styles.imageCard} ${draggedIndex === index ? styles.dragging : ''}`}
                draggable
                onDragStart={(e) => handleImageDragStart(e, index)}
                onDragOver={(e) => handleImageDragOver(e, index)}
                onDragEnd={handleImageDragEnd}
              >
                <img
                  src={image.url}
                  alt={`Portafolio ${index + 1}`}
                  className={styles.image}
                />
                <div className={styles.imageOverlay}>
                  <span className={styles.imageOrder}>{index + 1}</span>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => handleDelete(image.key)}
                    disabled={deletingKey === image.key}
                    aria-label="Eliminar imagen"
                  >
                    {deletingKey === image.key ? (
                      <Loader2 size={16} className={styles.spinner} />
                    ) : (
                      <X size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Archivos en proceso de carga */}
      {uploadingFiles.length > 0 && (
        <div className={styles.uploadingGrid}>
          {uploadingFiles.map((upload) => (
            <div key={upload.id} className={styles.uploadingCard}>
              <img
                src={upload.preview}
                alt="Subiendo..."
                className={styles.uploadingImage}
              />
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
            accept={ALLOWED_TYPES.join(',')}
            multiple
            onChange={handleFileChange}
            className={styles.fileInput}
            disabled={disabled}
          />
          <Upload size={32} className={styles.uploadIcon} />
          <p className={styles.dropText}>
            {isDragging ? 'Suelta las imágenes aquí' : 'Arrastra imágenes o haz clic para seleccionar'}
          </p>
          <p className={styles.dropHint}>
            JPG, PNG o WebP • Máximo 5MB por imagen • {remainingSlots} {remainingSlots === 1 ? 'espacio disponible' : 'espacios disponibles'}
          </p>
        </div>
      )}

      {/* Mensaje cuando está lleno */}
      {remainingSlots <= 0 && (
        <div className={styles.fullMessage}>
          <CheckCircle size={20} />
          Has alcanzado el límite de {MAX_IMAGES} imágenes
        </div>
      )}

      {/* Tip para reordenar */}
      {currentImages.length > 1 && (
        <p className={styles.reorderTip}>
          💡 Arrastra las imágenes para reordenarlas. La primera imagen será la principal.
        </p>
      )}
    </div>
  );
}

