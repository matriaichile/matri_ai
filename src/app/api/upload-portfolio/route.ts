import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin-config';
import { 
  uploadPortfolioMedia, 
  deletePortfolioMedia,
  getMediaType,
  ALLOWED_MEDIA_TYPES,
  MAX_FILE_SIZE,
} from '@/lib/cloudflare/r2.server';
import { FieldValue } from 'firebase-admin/firestore';

// Obtener instancias de Firebase Admin
const adminAuth = getAdminAuth();
const adminDb = getAdminFirestore();

// Configuración de límites
const MAX_PORTFOLIO_ITEMS = 10;
const MIN_PORTFOLIO_ITEMS = 5; // Mínimo recomendado, no bloqueante

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

    // Verificar límite de medios
    const currentMedia = providerData?.portfolioImages || [];
    if (currentMedia.length >= MAX_PORTFOLIO_ITEMS) {
      return NextResponse.json(
        { error: `Has alcanzado el límite de ${MAX_PORTFOLIO_ITEMS} elementos en tu portafolio` },
        { status: 400 }
      );
    }

    // Convertir File a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Subir a R2
    const result = await uploadPortfolioMedia(
      providerId,
      buffer,
      file.name,
      file.type
    );

    // Crear objeto de medio para guardar en Firestore
    const newMedia = {
      key: result.key,
      url: result.url,
      order: currentMedia.length, // Agregar al final
      uploadedAt: new Date().toISOString(),
      type: result.mediaType, // 'image' o 'video'
      mimeType: result.contentType,
      size: result.size,
    };

    // Actualizar Firestore con el nuevo medio
    await adminDb.collection('providers').doc(providerId).update({
      portfolioImages: FieldValue.arrayUnion(newMedia),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Retornar resultado exitoso
    return NextResponse.json({
      success: true,
      key: result.key,
      url: result.url,
      size: result.size,
      contentType: result.contentType,
      mediaType: result.mediaType,
      media: newMedia,
      totalItems: currentMedia.length + 1,
      remainingSlots: MAX_PORTFOLIO_ITEMS - currentMedia.length - 1,
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

    // Buscar el medio en el array de portfolioImages
    const currentMedia = providerData?.portfolioImages || [];
    const mediaToDelete = currentMedia.find((item: { key: string }) => item.key === key);
    
    if (!mediaToDelete) {
      return NextResponse.json(
        { error: 'Elemento no encontrado en el portafolio' },
        { status: 404 }
      );
    }

    // Eliminar de R2
    await deletePortfolioMedia(key);

    // Actualizar Firestore - remover el medio y reordenar
    const updatedMedia = currentMedia
      .filter((item: { key: string }) => item.key !== key)
      .map((item: { key: string; url: string; uploadedAt: string; type?: string; mimeType?: string; size?: number }, index: number) => ({
        ...item,
        order: index, // Reordenar
      }));

    await adminDb.collection('providers').doc(providerId).update({
      portfolioImages: updatedMedia,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Elemento eliminado correctamente',
      totalItems: updatedMedia.length,
      remainingSlots: MAX_PORTFOLIO_ITEMS - updatedMedia.length,
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
export { MAX_PORTFOLIO_ITEMS, MIN_PORTFOLIO_ITEMS };

