/**
 * Utilidades para el manejo de imágenes de perfil con crop
 * 
 * Este archivo contiene las funciones necesarias para calcular correctamente
 * los estilos de background para mostrar una imagen recortada.
 */

export interface CropData {
  x: number;      // Posición X del recorte (%)
  y: number;      // Posición Y del recorte (%)
  width: number;  // Ancho del recorte (%)
  height: number; // Alto del recorte (%)
  zoom: number;   // Nivel de zoom (legacy, ya incluido en width/height)
}

export interface BackgroundStyles {
  backgroundSize: string;
  backgroundPosition: string;
}

/**
 * Calcula los estilos de background-size y background-position correctos
 * para mostrar el área de crop definida en una imagen.
 * 
 * El sistema de crop funciona así:
 * - x, y: posición de la esquina superior izquierda del área visible (en % de la imagen original)
 * - width, height: tamaño del área visible (en % de la imagen original)
 * 
 * Para mostrar correctamente esta área usando background:
 * 1. background-size debe escalar la imagen para que el área de crop llene el contenedor
 * 2. background-position debe posicionar la imagen para mostrar el área correcta
 * 
 * @param cropData - Los datos del recorte
 * @returns Los estilos CSS para el background
 */
export const calculateBackgroundStyles = (cropData: CropData): BackgroundStyles => {
  // Calcular background-size: la imagen debe escalarse para que el área de crop llene el contenedor
  // Si width=50%, necesitamos que la imagen sea 200% del contenedor (100/50 * 100 = 200)
  const bgSizeX = cropData.width < 100 && cropData.width > 0 
    ? (10000 / cropData.width) 
    : 100;
  const bgSizeY = cropData.height < 100 && cropData.height > 0 
    ? (10000 / cropData.height) 
    : 100;
  
  // Calcular background-position para mostrar el área de crop
  // La fórmula convierte la posición del crop a porcentaje de background-position
  // background-position: x% significa que el punto x% de la imagen se alinea con el punto x% del contenedor
  // Para mostrar desde cropData.x%, necesitamos: bgPos = (x * 100) / (100 - width)
  const bgPosX = cropData.width < 100 && cropData.width > 0 
    ? (cropData.x * 100 / (100 - cropData.width)) 
    : 50;
  const bgPosY = cropData.height < 100 && cropData.height > 0 
    ? (cropData.y * 100 / (100 - cropData.height)) 
    : 50;
  
  return {
    backgroundSize: `${bgSizeX}% ${bgSizeY}%`,
    backgroundPosition: `${bgPosX}% ${bgPosY}%`,
  };
};

/**
 * Genera los estilos inline completos para mostrar una imagen de perfil con crop
 * 
 * @param imageUrl - URL de la imagen
 * @param cropData - Datos del recorte
 * @returns Objeto de estilos para usar en style={{...}}
 */
export const getProfileImageStyles = (imageUrl: string, cropData: CropData) => {
  const bgStyles = calculateBackgroundStyles(cropData);
  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundRepeat: 'no-repeat' as const,
    ...bgStyles,
  };
};







