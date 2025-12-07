'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  X, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Image as ImageIcon, 
  Eye,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ProfileImageData, PortfolioImage } from '@/store/authStore';
import { calculateBackgroundStyles } from '@/utils/profileImage';
import styles from './ProfileImageEditor.module.css';

// Dimensiones de la tarjeta de match (parametrizadas para fácil ajuste)
// Estas son las dimensiones del área visible de la imagen en la tarjeta
export const CARD_IMAGE_DIMENSIONS = {
  width: 200,    // Ancho de la tarjeta en px (minmax del grid)
  height: 80,    // Altura de la imagen en la tarjeta en px
  aspectRatio: 200 / 80, // Ratio de aspecto (2.5:1 aproximadamente)
};

interface ProfileImageEditorProps {
  providerId: string;
  currentImage?: ProfileImageData;
  portfolioImages: PortfolioImage[]; // Imágenes del portafolio para seleccionar
  onImageSaved: (imageData: ProfileImageData) => void;
  disabled?: boolean;
}

interface CropData {
  x: number;      // Posición X del recorte (%)
  y: number;      // Posición Y del recorte (%)
  width: number;  // Ancho del recorte (%)
  height: number; // Alto del recorte (%)
  zoom: number;   // Nivel de zoom
}

export default function ProfileImageEditor({
  currentImage,
  portfolioImages,
  onImageSaved,
  disabled = false,
}: ProfileImageEditorProps) {
  // Estados principales
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  // Estado del recorte
  const [cropData, setCropData] = useState<CropData>({
    x: 50,
    y: 50,
    width: 100,
    height: 100,
    zoom: 1,
  });
  
  // Estado para arrastrar
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Referencias
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtrar solo imágenes (no videos) del portafolio
  const availableImages = portfolioImages.filter(img => 
    !img.type || img.type === 'image'
  ).sort((a, b) => a.order - b.order);

  // Imagen seleccionada actualmente
  const selectedImage = availableImages[selectedImageIndex];

  // Inicializar con imagen existente
  useEffect(() => {
    if (currentImage && !isEditing) {
      // Buscar el índice de la imagen actual en el portafolio
      const index = availableImages.findIndex(img => img.key === currentImage.key);
      if (index >= 0) {
        setSelectedImageIndex(index);
      }
      setCropData(currentImage.cropData);
    }
  }, [currentImage, isEditing, availableImages]);

  // Manejar carga de imagen para calcular crop inicial
  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      
      // Calcular crop inicial centrado con el aspect ratio correcto
      const imageAspect = naturalWidth / naturalHeight;
      const targetAspect = CARD_IMAGE_DIMENSIONS.aspectRatio;
      
      let cropWidth: number;
      let cropHeight: number;
      
      if (imageAspect > targetAspect) {
        // Imagen más ancha que el target - limitar por altura
        cropHeight = 100;
        cropWidth = (targetAspect / imageAspect) * 100;
      } else {
        // Imagen más alta que el target - limitar por ancho
        cropWidth = 100;
        cropHeight = (imageAspect / targetAspect) * 100;
      }
      
      setCropData({
        x: (100 - cropWidth) / 2,
        y: (100 - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight,
        zoom: 1,
      });
    }
  }, []);

  // Manejar zoom
  const handleZoom = useCallback((delta: number) => {
    setCropData(prev => {
      const newZoom = Math.max(1, Math.min(3, prev.zoom + delta));
      const zoomFactor = newZoom / prev.zoom;
      
      // Ajustar tamaño del crop al hacer zoom
      const newWidth = prev.width / zoomFactor;
      const newHeight = prev.height / zoomFactor;
      
      // Ajustar posición para mantener el centro
      const newX = prev.x + (prev.width - newWidth) / 2;
      const newY = prev.y + (prev.height - newHeight) / 2;
      
      return {
        ...prev,
        zoom: newZoom,
        width: Math.min(100, Math.max(10, newWidth)),
        height: Math.min(100, Math.max(10, newHeight)),
        x: Math.max(0, Math.min(100 - newWidth, newX)),
        y: Math.max(0, Math.min(100 - newHeight, newY)),
      };
    });
  }, []);

  // Manejar inicio de arrastre
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isEditing) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isEditing]);

  // Manejar movimiento
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;
    
    // Corregido: al arrastrar hacia abajo/derecha, el crop area debe moverse en esa dirección
    setCropData(prev => ({
      ...prev,
      x: Math.max(0, Math.min(100 - prev.width, prev.x + deltaX)),
      y: Math.max(0, Math.min(100 - prev.height, prev.y + deltaY)),
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart]);

  // Manejar fin de arrastre
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Manejar touch events para móvil
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isEditing) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
  }, [isEditing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((touch.clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((touch.clientY - dragStart.y) / rect.height) * 100;
    
    // Corregido: al arrastrar hacia abajo/derecha, el crop area debe moverse en esa dirección
    setCropData(prev => ({
      ...prev,
      x: Math.max(0, Math.min(100 - prev.width, prev.x + deltaX)),
      y: Math.max(0, Math.min(100 - prev.height, prev.y + deltaY)),
    }));
    
    setDragStart({ x: touch.clientX, y: touch.clientY });
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Resetear posición
  const handleReset = useCallback(() => {
    if (imageRef.current) {
      handleImageLoad();
    }
  }, [handleImageLoad]);

  // Cancelar edición
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setError(null);
    
    // Restaurar valores originales
    if (currentImage) {
      const index = availableImages.findIndex(img => img.key === currentImage.key);
      if (index >= 0) {
        setSelectedImageIndex(index);
      }
      setCropData(currentImage.cropData);
    } else {
      setSelectedImageIndex(0);
      setCropData({
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        zoom: 1,
      });
    }
  }, [currentImage, availableImages]);

  // Guardar configuración
  const handleSave = useCallback(() => {
    if (!selectedImage) {
      setError('Debes seleccionar una imagen del portafolio');
      return;
    }
    
    setError(null);
    
    // Crear objeto de imagen de perfil (solo referencia + datos de crop)
    const profileImageData: ProfileImageData = {
      key: selectedImage.key,
      url: selectedImage.url,
      cropData: cropData,
      uploadedAt: new Date().toISOString(),
    };
    
    // Notificar al componente padre
    onImageSaved(profileImageData);
    
    // Salir del modo edición
    setIsEditing(false);
  }, [selectedImage, cropData, onImageSaved]);

  // Iniciar edición
  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
    // Si hay imagen actual, cargar sus datos
    if (currentImage) {
      const index = availableImages.findIndex(img => img.key === currentImage.key);
      if (index >= 0) {
        setSelectedImageIndex(index);
      }
      setCropData(currentImage.cropData);
    } else if (availableImages.length > 0) {
      // Seleccionar la primera imagen y calcular crop inicial
      setSelectedImageIndex(0);
    }
  }, [currentImage, availableImages]);

  // Navegar entre imágenes del portafolio
  const handlePrevImage = useCallback(() => {
    setSelectedImageIndex(prev => 
      prev > 0 ? prev - 1 : availableImages.length - 1
    );
    // Resetear crop al cambiar de imagen
    setTimeout(() => handleReset(), 100);
  }, [availableImages.length, handleReset]);

  const handleNextImage = useCallback(() => {
    setSelectedImageIndex(prev => 
      prev < availableImages.length - 1 ? prev + 1 : 0
    );
    // Resetear crop al cambiar de imagen
    setTimeout(() => handleReset(), 100);
  }, [availableImages.length, handleReset]);

  // Si no hay imágenes en el portafolio
  if (availableImages.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            <ImageIcon size={20} />
            Foto de Perfil
          </h3>
          <p className={styles.subtitle}>
            Esta imagen se mostrará en las tarjetas de matches
          </p>
        </div>
        <div className={styles.emptyState}>
          <ImageIcon size={32} />
          <p>Primero sube imágenes a tu portafolio</p>
          <span>La foto de perfil se selecciona de tu portafolio existente</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <ImageIcon size={20} />
          Foto de Perfil
        </h3>
        <p className={styles.subtitle}>
          Selecciona una imagen de tu portafolio y ajusta el encuadre para las tarjetas
        </p>
      </div>

      {error && (
        <div className={styles.error}>
          <X size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Vista de edición */}
      {isEditing && selectedImage ? (
        <div className={styles.editorContainer}>
          {/* Selector de imagen del portafolio */}
          <div className={styles.imageSelectorSection}>
            <h4 className={styles.sectionTitle}>
              <ImageIcon size={16} />
              Selecciona una imagen ({selectedImageIndex + 1}/{availableImages.length})
            </h4>
            <div className={styles.imageSelector}>
              <button
                type="button"
                className={styles.navButton}
                onClick={handlePrevImage}
                disabled={availableImages.length <= 1}
              >
                <ChevronLeft size={20} />
              </button>
              <div className={styles.thumbnailsContainer}>
                {availableImages.map((img, index) => (
                  <button
                    key={img.key}
                    type="button"
                    className={`${styles.thumbnailButton} ${index === selectedImageIndex ? styles.thumbnailActive : ''}`}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setTimeout(() => handleReset(), 100);
                    }}
                  >
                    <img src={img.url} alt={`Imagen ${index + 1}`} />
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={styles.navButton}
                onClick={handleNextImage}
                disabled={availableImages.length <= 1}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Preview de la tarjeta */}
          <div className={styles.cardPreviewSection}>
            <h4 className={styles.sectionTitle}>
              <Eye size={16} />
              Vista previa de la tarjeta
            </h4>
            <div className={styles.cardPreview}>
              <div 
                className={styles.cardPreviewImage}
                style={{
                  backgroundImage: `url(${selectedImage.url})`,
                  ...calculateBackgroundStyles(cropData),
                }}
              />
              <div className={styles.cardPreviewOverlay}>
                <span className={styles.cardPreviewBadge}>Match Perfecto</span>
                <span className={styles.cardPreviewCategory}>Tu categoría</span>
              </div>
            </div>
            <p className={styles.previewHint}>
              Así se verá tu foto en las tarjetas de recomendaciones
            </p>
          </div>

          {/* Editor de recorte */}
          <div className={styles.cropSection}>
            <h4 className={styles.sectionTitle}>
              <Move size={16} />
              Ajustar encuadre
            </h4>
            <div 
              ref={containerRef}
              className={styles.cropContainer}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                ref={imageRef}
                src={selectedImage.url}
                alt="Preview"
                className={styles.cropImage}
                onLoad={handleImageLoad}
                draggable={false}
              />
              {/* Overlay con área de recorte */}
              <div className={styles.cropOverlay}>
                <div 
                  className={styles.cropArea}
                  style={{
                    left: `${cropData.x}%`,
                    top: `${cropData.y}%`,
                    width: `${cropData.width}%`,
                    height: `${cropData.height}%`,
                  }}
                >
                  <div className={styles.cropAreaInner} />
                </div>
              </div>
              <div className={styles.dragHint}>
                <Move size={16} />
                <span>Arrastra para ajustar</span>
              </div>
            </div>

            {/* Controles de zoom */}
            <div className={styles.zoomControls}>
              <button
                type="button"
                className={styles.zoomButton}
                onClick={() => handleZoom(-0.25)}
                disabled={cropData.zoom <= 1}
                title="Alejar"
              >
                <ZoomOut size={18} />
              </button>
              <div className={styles.zoomIndicator}>
                <span>{Math.round(cropData.zoom * 100)}%</span>
              </div>
              <button
                type="button"
                className={styles.zoomButton}
                onClick={() => handleZoom(0.25)}
                disabled={cropData.zoom >= 3}
                title="Acercar"
              >
                <ZoomIn size={18} />
              </button>
              <button
                type="button"
                className={styles.resetButton}
                onClick={handleReset}
                title="Resetear"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Acciones */}
          <div className={styles.editorActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancel}
            >
              <X size={16} />
              <span>Cancelar</span>
            </button>
            <button
              type="button"
              className={styles.saveButton}
              onClick={handleSave}
            >
              <Check size={16} />
              <span>Guardar</span>
            </button>
          </div>
        </div>
      ) : (
        /* Vista normal (sin edición) */
        <div className={styles.normalView}>
          {currentImage ? (
            /* Imagen existente */
            <div className={styles.currentImageContainer}>
              <div className={styles.currentImagePreview}>
                <div 
                  className={styles.currentImage}
                  style={{
                    backgroundImage: `url(${currentImage.url})`,
                    ...calculateBackgroundStyles(currentImage.cropData),
                  }}
                />
              </div>
              <div className={styles.currentImageActions}>
                <button
                  type="button"
                  className={styles.editButton}
                  onClick={handleStartEdit}
                  disabled={disabled}
                >
                  <Move size={16} />
                  <span>Cambiar o ajustar</span>
                </button>
              </div>
            </div>
          ) : (
            /* Sin imagen configurada */
            <div 
              className={`${styles.selectZone} ${disabled ? styles.disabled : ''}`}
              onClick={!disabled ? handleStartEdit : undefined}
            >
              <div className={styles.selectContent}>
                <ImageIcon size={32} className={styles.selectIcon} />
                <p className={styles.selectText}>
                  Configura tu foto de perfil
                </p>
                <p className={styles.selectHint}>
                  Selecciona una imagen de tu portafolio
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
