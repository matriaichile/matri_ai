import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin-config';
import { 
  uploadPortfolioImage, 
  deletePortfolioImage,
} from '@/lib/cloudflare/r2.server';
import { FieldValue } from 'firebase-admin/firestore';

// Obtener instancias de Firebase Admin
const adminAuth = getAdminAuth();
const adminDb = getAdminFirestore();

// Configuración de límites
const MAX_PORTFOLIO_IMAGES = 10;
const MIN_PORTFOLIO_IMAGES = 5; // Mínimo recomendado, no bloqueante

/**
 * POST /api/upload-portfolio
 * Sube una imagen al portafolio del proveedor
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado - Token requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verificar token de Firebase
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // Obtener FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const providerId = formData.get('providerId') as string | null;

    // Validar campos requeridos
    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    if (!providerId) {
      return NextResponse.json(
        { error: 'ID del proveedor requerido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario es el dueño del perfil de proveedor
    // NOTA: En la colección providers, el document ID ES el userId
    if (providerId !== userId) {
      return NextResponse.json(
        { error: 'No tienes permiso para modificar este portafolio' },
        { status: 403 }
      );
    }

    const providerDoc = await adminDb.collection('providers').doc(providerId).get();
    
    if (!providerDoc.exists) {
      return NextResponse.json(
        { error: 'Proveedor no encontrado' },
        { status: 404 }
      );
    }

    const providerData = providerDoc.data();

    // Verificar límite de imágenes
    const currentImages = providerData?.portfolioImages || [];
    if (currentImages.length >= MAX_PORTFOLIO_IMAGES) {
      return NextResponse.json(
        { error: `Has alcanzado el límite de ${MAX_PORTFOLIO_IMAGES} imágenes en tu portafolio` },
        { status: 400 }
      );
    }

    // Convertir File a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Subir a R2
    const result = await uploadPortfolioImage(
      providerId,
      buffer,
      file.name,
      file.type
    );

    // Crear objeto de imagen para guardar en Firestore
    const newImage = {
      key: result.key,
      url: result.url,
      order: currentImages.length, // Agregar al final
      uploadedAt: new Date().toISOString(),
    };

    // Actualizar Firestore con la nueva imagen
    await adminDb.collection('providers').doc(providerId).update({
      portfolioImages: FieldValue.arrayUnion(newImage),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Retornar resultado exitoso
    return NextResponse.json({
      success: true,
      key: result.key,
      url: result.url,
      size: result.size,
      contentType: result.contentType,
      image: newImage,
      totalImages: currentImages.length + 1,
      remainingSlots: MAX_PORTFOLIO_IMAGES - currentImages.length - 1,
    });

  } catch (error) {
    console.error('Error al subir imagen de portafolio:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload-portfolio
 * Elimina una imagen del portafolio del proveedor
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado - Token requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verificar token de Firebase
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // Obtener body
    const body = await request.json();
    const { key, providerId } = body;

    // Validar campos requeridos
    if (!key || !providerId) {
      return NextResponse.json(
        { error: 'Se requiere key y providerId' },
        { status: 400 }
      );
    }

    // Verificar que el usuario es el dueño del perfil de proveedor
    // NOTA: En la colección providers, el document ID ES el userId
    if (providerId !== userId) {
      return NextResponse.json(
        { error: 'No tienes permiso para modificar este portafolio' },
        { status: 403 }
      );
    }

    const providerDoc = await adminDb.collection('providers').doc(providerId).get();
    
    if (!providerDoc.exists) {
      return NextResponse.json(
        { error: 'Proveedor no encontrado' },
        { status: 404 }
      );
    }

    const providerData = providerDoc.data();

    // Buscar la imagen en el array de portfolioImages
    const currentImages = providerData?.portfolioImages || [];
    const imageToDelete = currentImages.find((img: { key: string }) => img.key === key);
    
    if (!imageToDelete) {
      return NextResponse.json(
        { error: 'Imagen no encontrada en el portafolio' },
        { status: 404 }
      );
    }

    // Eliminar de R2
    await deletePortfolioImage(key);

    // Actualizar Firestore - remover la imagen y reordenar
    const updatedImages = currentImages
      .filter((img: { key: string }) => img.key !== key)
      .map((img: { key: string; url: string; uploadedAt: string }, index: number) => ({
        ...img,
        order: index, // Reordenar
      }));

    await adminDb.collection('providers').doc(providerId).update({
      portfolioImages: updatedImages,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Imagen eliminada correctamente',
      totalImages: updatedImages.length,
      remainingSlots: MAX_PORTFOLIO_IMAGES - updatedImages.length,
    });

  } catch (error) {
    console.error('Error al eliminar imagen de portafolio:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/upload-portfolio
 * Reordena las imágenes del portafolio
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado - Token requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verificar token de Firebase
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // Obtener body
    const body = await request.json();
    const { providerId, images } = body;

    // Validar campos requeridos
    if (!providerId || !images || !Array.isArray(images)) {
      return NextResponse.json(
        { error: 'Se requiere providerId e images (array)' },
        { status: 400 }
      );
    }

    // Verificar que el usuario es el dueño del perfil de proveedor
    // NOTA: En la colección providers, el document ID ES el userId
    if (providerId !== userId) {
      return NextResponse.json(
        { error: 'No tienes permiso para modificar este portafolio' },
        { status: 403 }
      );
    }

    const providerDoc = await adminDb.collection('providers').doc(providerId).get();
    
    if (!providerDoc.exists) {
      return NextResponse.json(
        { error: 'Proveedor no encontrado' },
        { status: 404 }
      );
    }

    const providerData = providerDoc.data();

    // Verificar que todas las keys existen en el portafolio actual
    const currentImages = providerData?.portfolioImages || [];
    const currentKeys = new Set(currentImages.map((img: { key: string }) => img.key));
    const newKeys = images.map((img: { key: string }) => img.key);
    
    for (const key of newKeys) {
      if (!currentKeys.has(key)) {
        return NextResponse.json(
          { error: `Imagen con key ${key} no encontrada en el portafolio` },
          { status: 400 }
        );
      }
    }

    // Actualizar el orden
    const reorderedImages = images.map((img: { key: string }, index: number) => {
      const originalImage = currentImages.find((orig: { key: string }) => orig.key === img.key);
      return {
        ...originalImage,
        order: index,
      };
    });

    await adminDb.collection('providers').doc(providerId).update({
      portfolioImages: reorderedImages,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Orden actualizado correctamente',
      images: reorderedImages,
    });

  } catch (error) {
    console.error('Error al reordenar portafolio:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Exportar constantes útiles
export const config = {
  api: {
    bodyParser: false, // Necesario para manejar FormData
  },
};

// Exportar info sobre límites para usar en el cliente
export { MAX_PORTFOLIO_IMAGES, MIN_PORTFOLIO_IMAGES };

