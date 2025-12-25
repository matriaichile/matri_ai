/**
 * Servicio de notificaciones por email
 * 
 * Este servicio maneja el envío de emails a proveedores cuando
 * un usuario muestra interés en sus servicios.
 * 
 * IMPORTANTE: Solo se envía UN email por usuario/proveedor/categoría
 * para evitar spam cuando el usuario cambia de opinión.
 */
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { resend, EMAIL_FROM } from './resend';
import { 
  generateInterestEmailHTML, 
  generateInterestEmailText,
  generateInterestEmailSubject,
  InterestEmailData,
} from './interestEmailTemplate';
import { CategoryId, CATEGORY_INFO } from '@/store/authStore';
import { Lead } from '@/lib/firebase/firestore';

// Colección para rastrear emails enviados (evitar duplicados)
const EMAIL_NOTIFICATIONS_COLLECTION = 'emailNotifications';

/**
 * Interface para el registro de notificación enviada
 */
interface EmailNotificationRecord {
  id: string;
  leadId: string;
  userId: string;
  providerId: string;
  category: CategoryId;
  providerEmail: string;
  sentAt: Date;
  resendId?: string; // ID de Resend para tracking
  status: 'sent' | 'failed';
  error?: string;
}

/**
 * Verifica si ya se envió un email de notificación para este usuario/proveedor/categoría
 * 
 * CRÍTICO: Esta función previene el envío de múltiples emails cuando un usuario
 * cambia de opinión (descarta y vuelve a marcar "Me interesa")
 * 
 * @returns true si ya se envió, false si no
 */
export async function hasEmailBeenSent(
  userId: string,
  providerId: string,
  category: CategoryId
): Promise<boolean> {
  try {
    // Crear un ID único basado en la combinación usuario/proveedor/categoría
    const notificationId = `${userId}_${providerId}_${category}`;
    
    const notificationDoc = await getDoc(
      doc(db, EMAIL_NOTIFICATIONS_COLLECTION, notificationId)
    );
    
    if (notificationDoc.exists()) {
      const data = notificationDoc.data();
      // Solo consideramos que fue enviado si el status es 'sent'
      return data.status === 'sent';
    }
    
    return false;
  } catch (error) {
    console.error('Error verificando si email fue enviado:', error);
    // En caso de error, asumimos que no fue enviado para no bloquear
    // pero logueamos el error para debugging
    return false;
  }
}

/**
 * Registra que se envió un email de notificación
 */
async function recordEmailSent(
  leadId: string,
  userId: string,
  providerId: string,
  category: CategoryId,
  providerEmail: string,
  resendId?: string,
  status: 'sent' | 'failed' = 'sent',
  error?: string
): Promise<void> {
  try {
    const notificationId = `${userId}_${providerId}_${category}`;
    const now = Timestamp.now();
    
    await setDoc(doc(db, EMAIL_NOTIFICATIONS_COLLECTION, notificationId), {
      leadId,
      userId,
      providerId,
      category,
      providerEmail,
      sentAt: now,
      resendId: resendId || null,
      status,
      error: error || null,
    });
    
    console.log(`✅ Registro de email guardado: ${notificationId} (${status})`);
  } catch (err) {
    console.error('Error registrando email enviado:', err);
    // No lanzamos el error para no bloquear el flujo principal
  }
}

/**
 * Envía email de notificación a un proveedor cuando un usuario muestra interés
 * 
 * IMPORTANTE: Esta función verifica automáticamente si ya se envió un email
 * para esta combinación usuario/proveedor/categoría y NO envía duplicados.
 * 
 * @param lead - El lead que fue aprobado
 * @returns true si se envió el email, false si no (ya enviado o error)
 */
export async function sendInterestNotificationEmail(lead: Lead): Promise<boolean> {
  try {
    console.log(`\n📧 ========== ENVIANDO EMAIL DE INTERÉS ==========`);
    console.log(`📌 Lead ID: ${lead.id}`);
    console.log(`📌 Usuario: ${lead.userId}`);
    console.log(`📌 Proveedor: ${lead.providerId}`);
    console.log(`📌 Categoría: ${lead.category}`);
    
    // 1. Verificar si ya se envió un email para esta combinación
    const alreadySent = await hasEmailBeenSent(
      lead.userId,
      lead.providerId,
      lead.category
    );
    
    if (alreadySent) {
      console.log(`⚠️ Email ya enviado previamente para ${lead.userId}/${lead.providerId}/${lead.category}`);
      console.log(`   No se enviará otro email (prevención de duplicados)`);
      return false;
    }
    
    // 2. Obtener datos del proveedor (necesitamos su email)
    const providerDoc = await getDoc(doc(db, 'providers', lead.providerId));
    if (!providerDoc.exists()) {
      console.error(`❌ Proveedor ${lead.providerId} no encontrado`);
      return false;
    }
    
    const providerData = providerDoc.data();
    const providerEmail = providerData.email;
    const providerName = providerData.providerName || 'Proveedor';
    
    if (!providerEmail) {
      console.error(`❌ Proveedor ${lead.providerId} no tiene email configurado`);
      return false;
    }
    
    // 3. Obtener nombre de la categoría
    const categoryInfo = CATEGORY_INFO[lead.category];
    const categoryName = categoryInfo?.name || lead.category;
    
    // 4. Preparar datos para el email
    const emailData: InterestEmailData = {
      providerName,
      providerEmail,
      coupleNames: lead.userInfo.coupleNames,
      eventDate: lead.userInfo.eventDate,
      region: lead.userInfo.region,
      budget: lead.userInfo.budget,
      email: lead.userInfo.email,
      phone: lead.userInfo.phone,
      category: lead.category,
      categoryName,
      matchScore: lead.matchScore,
    };
    
    console.log(`📧 Enviando email a: ${providerEmail}`);
    console.log(`📧 Asunto: ${generateInterestEmailSubject(emailData)}`);
    
    // 5. Enviar el email usando Resend
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: providerEmail,
      subject: generateInterestEmailSubject(emailData),
      html: generateInterestEmailHTML(emailData),
      text: generateInterestEmailText(emailData),
      tags: [
        { name: 'category', value: lead.category },
        { name: 'type', value: 'interest_notification' },
      ],
    });
    
    if (error) {
      console.error(`❌ Error enviando email:`, error);
      
      // Registrar el fallo (para no reintentar infinitamente)
      await recordEmailSent(
        lead.id,
        lead.userId,
        lead.providerId,
        lead.category,
        providerEmail,
        undefined,
        'failed',
        error.message
      );
      
      return false;
    }
    
    console.log(`✅ Email enviado exitosamente!`);
    console.log(`   Resend ID: ${data?.id}`);
    
    // 6. Registrar que el email fue enviado
    await recordEmailSent(
      lead.id,
      lead.userId,
      lead.providerId,
      lead.category,
      providerEmail,
      data?.id,
      'sent'
    );
    
    return true;
    
  } catch (error) {
    console.error('Error en sendInterestNotificationEmail:', error);
    return false;
  }
}

/**
 * Obtiene el historial de notificaciones enviadas a un proveedor
 * Útil para el dashboard del proveedor o admin
 */
export async function getProviderEmailNotifications(
  providerId: string
): Promise<EmailNotificationRecord[]> {
  try {
    const notificationsQuery = query(
      collection(db, EMAIL_NOTIFICATIONS_COLLECTION),
      where('providerId', '==', providerId),
      where('status', '==', 'sent')
    );
    
    const snapshot = await getDocs(notificationsQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      sentAt: doc.data().sentAt?.toDate() || new Date(),
    })) as EmailNotificationRecord[];
    
  } catch (error) {
    console.error('Error obteniendo historial de notificaciones:', error);
    return [];
  }
}


