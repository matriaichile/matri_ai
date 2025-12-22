/**
 * API Route para enviar emails de notificación de interés
 * 
 * Este endpoint es llamado cuando un usuario marca "Me interesa" en un proveedor.
 * Solo envía UN email por combinación usuario/proveedor/categoría.
 * 
 * POST /api/send-interest-email
 * Body: { leadId: string }
 * 
 * IMPORTANTE: Usa Firebase Admin SDK porque se ejecuta en el servidor
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin-config';
import { Resend } from 'resend';
import { 
  generateInterestEmailHTML, 
  generateInterestEmailText,
  generateInterestEmailSubject,
  InterestEmailData,
} from '@/lib/email/interestEmailTemplate';
import { CategoryId, CATEGORY_INFO } from '@/store/authStore';

// Configuración del remitente
const EMAIL_FROM = 'MatriMatch <notificaciones@notificaciones.matrimatch.cl>';

export async function POST(request: NextRequest) {
  console.log('\n📧 ========== API /send-interest-email ==========');
  
  // Verificar que la API key esté configurada
  const resendKey = process.env.RESEND_KEY;
  console.log(`📧 RESEND_KEY configurada: ${resendKey ? 'SÍ' : 'NO'}`);
  
  if (!resendKey) {
    console.error('❌ RESEND_KEY no está configurada en el servidor');
    return NextResponse.json(
      { 
        success: false, 
        error: 'Email service not configured. RESEND_KEY is missing.' 
      },
      { status: 500 }
    );
  }
  
  // Inicializar Resend con la API key
  const resend = new Resend(resendKey);
  
  try {
    // 1. Obtener el leadId del body
    const body = await request.json();
    const { leadId } = body;
    
    console.log(`📧 Lead ID recibido: ${leadId}`);
    
    if (!leadId) {
      return NextResponse.json(
        { success: false, error: 'leadId is required' },
        { status: 400 }
      );
    }
    
    // 2. Obtener Firestore Admin (tiene acceso total, no necesita auth de usuario)
    const adminDb = getAdminFirestore();
    
    // 3. Obtener el lead de Firestore
    console.log(`📧 Buscando lead en Firestore (Admin SDK)...`);
    const leadDoc = await adminDb.collection('leads').doc(leadId).get();
    
    if (!leadDoc.exists) {
      console.error(`❌ Lead ${leadId} no encontrado`);
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }
    
    const leadData = leadDoc.data()!;
    console.log(`📧 Lead encontrado - Status: ${leadData.status}`);
    
    // Verificar que el lead esté aprobado
    if (leadData.status !== 'approved') {
      console.log(`⚠️ Lead no está aprobado (status: ${leadData.status})`);
      return NextResponse.json(
        { success: false, error: 'Lead is not approved', status: leadData.status },
        { status: 400 }
      );
    }
    
    // 4. Verificar si ya se envió un email para esta combinación
    const notificationId = `${leadData.userId}_${leadData.providerId}_${leadData.category}`;
    console.log(`📧 Verificando duplicados: ${notificationId}`);
    
    const existingNotification = await adminDb
      .collection('emailNotifications')
      .doc(notificationId)
      .get();
    
    if (existingNotification.exists && existingNotification.data()?.status === 'sent') {
      console.log(`⚠️ Email ya enviado previamente para ${notificationId}`);
      return NextResponse.json({
        success: true,
        message: 'Email already sent previously',
        leadId,
        alreadySent: true,
      });
    }
    
    // 5. Obtener datos del proveedor
    console.log(`📧 Obteniendo datos del proveedor...`);
    const providerDoc = await adminDb.collection('providers').doc(leadData.providerId).get();
    
    if (!providerDoc.exists) {
      console.error(`❌ Proveedor ${leadData.providerId} no encontrado`);
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }
    
    const providerData = providerDoc.data()!;
    const providerEmail = providerData.email;
    const providerName = providerData.providerName || 'Proveedor';
    
    if (!providerEmail) {
      console.error(`❌ Proveedor no tiene email configurado`);
      return NextResponse.json(
        { success: false, error: 'Provider has no email configured' },
        { status: 400 }
      );
    }
    
    // 6. Preparar datos para el email
    const categoryInfo = CATEGORY_INFO[leadData.category as CategoryId];
    const categoryName = categoryInfo?.name || leadData.category;
    
    const emailData: InterestEmailData = {
      providerName,
      providerEmail,
      coupleNames: leadData.userInfo.coupleNames,
      eventDate: leadData.userInfo.eventDate,
      region: leadData.userInfo.region,
      budget: leadData.userInfo.budget,
      email: leadData.userInfo.email,
      phone: leadData.userInfo.phone,
      category: leadData.category,
      categoryName,
      matchScore: leadData.matchScore,
    };
    
    console.log(`📧 Enviando email a: ${providerEmail}`);
    console.log(`📧 Asunto: ${generateInterestEmailSubject(emailData)}`);
    
    // 7. Enviar el email usando Resend
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: providerEmail,
      subject: generateInterestEmailSubject(emailData),
      html: generateInterestEmailHTML(emailData),
      text: generateInterestEmailText(emailData),
      tags: [
        { name: 'category', value: leadData.category },
        { name: 'type', value: 'interest_notification' },
      ],
    });
    
    if (emailError) {
      console.error(`❌ Error enviando email:`, emailError);
      
      // Registrar el fallo
      await adminDb.collection('emailNotifications').doc(notificationId).set({
        leadId,
        userId: leadData.userId,
        providerId: leadData.providerId,
        category: leadData.category,
        providerEmail,
        sentAt: new Date(),
        status: 'failed',
        error: emailError.message,
      });
      
      return NextResponse.json(
        { success: false, error: emailError.message },
        { status: 500 }
      );
    }
    
    console.log(`✅ Email enviado exitosamente!`);
    console.log(`   Resend ID: ${emailResult?.id}`);
    
    // 8. Registrar que el email fue enviado
    await adminDb.collection('emailNotifications').doc(notificationId).set({
      leadId,
      userId: leadData.userId,
      providerId: leadData.providerId,
      category: leadData.category,
      providerEmail,
      sentAt: new Date(),
      resendId: emailResult?.id || null,
      status: 'sent',
    });
    
    console.log(`✅ Registro guardado en emailNotifications`);
    
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      leadId,
      resendId: emailResult?.id,
    });
    
  } catch (error) {
    console.error('❌ Error in send-interest-email API:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// No permitimos GET para este endpoint
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
