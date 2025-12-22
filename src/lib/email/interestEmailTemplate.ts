/**
 * Template de email para notificar a proveedores cuando un usuario
 * muestra interés en sus servicios.
 * 
 * Diseño: Negro y dorado elegante, consistente con la marca MatriMatch
 */

export interface InterestEmailData {
  // Datos del proveedor (destinatario)
  providerName: string;
  providerEmail: string;
  
  // Datos del usuario (novios interesados)
  coupleNames: string;
  eventDate: string;
  region: string;
  budget: string;
  email: string;
  phone: string;
  
  // Datos del match
  category: string;
  categoryName: string;
  matchScore: number;
}

/**
 * Genera el HTML del email de notificación de interés
 * Diseño elegante negro y dorado, responsive y compatible con clientes de email
 */
export function generateInterestEmailHTML(data: InterestEmailData): string {
  const {
    providerName,
    coupleNames,
    eventDate,
    region,
    budget,
    email,
    phone,
    categoryName,
    matchScore,
  } = data;

  // Formatear la fecha del evento
  const formattedDate = eventDate && eventDate !== 'Por definir' 
    ? new Date(eventDate).toLocaleDateString('es-CL', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Por definir';

  // Formatear el presupuesto
  const formattedBudget = formatBudget(budget);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>¡Nueva pareja interesada en tus servicios!</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset básico para clientes de email */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
    }
    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        padding: 16px !important;
      }
      .content-cell {
        padding: 24px 20px !important;
      }
      .header-title {
        font-size: 24px !important;
      }
      .info-card {
        padding: 16px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <!-- Wrapper principal -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        
        <!-- Contenedor principal -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" class="container" style="max-width: 600px; background-color: #141414; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);">
          
          <!-- Header con gradiente dorado -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); padding: 32px 40px; border-bottom: 1px solid rgba(212, 175, 55, 0.2);">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <!-- Logo MatriMatch -->
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 16px;">
                          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #D4AF37, #B8941E); border-radius: 12px; display: inline-block; text-align: center; line-height: 48px;">
                            <span style="font-size: 24px;">💍</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                    <h1 class="header-title" style="margin: 0; font-size: 28px; font-weight: 700; color: #D4AF37; font-family: 'Georgia', serif; letter-spacing: 0.5px;">
                      MatriMatch
                    </h1>
                    <p style="margin: 8px 0 0 0; font-size: 14px; color: #808080; letter-spacing: 1px; text-transform: uppercase;">
                      Conexiones que hacen historia
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Contenido principal -->
          <tr>
            <td class="content-cell" style="padding: 40px;">
              
              <!-- Saludo -->
              <p style="margin: 0 0 24px 0; font-size: 18px; color: #F5F5F5; line-height: 1.5;">
                ¡Hola <strong style="color: #D4AF37;">${escapeHtml(providerName)}</strong>! 👋
              </p>
              
              <!-- Mensaje principal -->
              <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05)); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                <p style="margin: 0; font-size: 16px; color: #F5F5F5; line-height: 1.6;">
                  🎉 <strong>¡Excelentes noticias!</strong> Una pareja ha mostrado interés en tus servicios de <strong style="color: #D4AF37;">${escapeHtml(categoryName)}</strong>.
                </p>
                <p style="margin: 16px 0 0 0; font-size: 14px; color: #C0C0C0; line-height: 1.5;">
                  Compatibilidad del match: <strong style="color: #D4AF37;">${matchScore}%</strong>
                </p>
              </div>
              
              <!-- Tarjeta de información de la pareja -->
              <div class="info-card" style="background-color: #1c1c1c; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #D4AF37; font-weight: 600; border-bottom: 1px solid rgba(212, 175, 55, 0.2); padding-bottom: 12px;">
                  💒 Información de la Pareja
                </h2>
                
                <!-- Nombre de la pareja -->
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px;">
                  <tr>
                    <td width="32" valign="top" style="padding-right: 12px;">
                      <span style="font-size: 18px;">👫</span>
                    </td>
                    <td>
                      <p style="margin: 0; font-size: 12px; color: #808080; text-transform: uppercase; letter-spacing: 0.5px;">Nombres</p>
                      <p style="margin: 4px 0 0 0; font-size: 16px; color: #F5F5F5; font-weight: 500;">${escapeHtml(coupleNames)}</p>
                    </td>
                  </tr>
                </table>
                
                <!-- Fecha del evento -->
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px;">
                  <tr>
                    <td width="32" valign="top" style="padding-right: 12px;">
                      <span style="font-size: 18px;">📅</span>
                    </td>
                    <td>
                      <p style="margin: 0; font-size: 12px; color: #808080; text-transform: uppercase; letter-spacing: 0.5px;">Fecha del Evento</p>
                      <p style="margin: 4px 0 0 0; font-size: 16px; color: #F5F5F5; font-weight: 500;">${escapeHtml(formattedDate)}</p>
                    </td>
                  </tr>
                </table>
                
                <!-- Región -->
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td width="32" valign="top" style="padding-right: 12px;">
                      <span style="font-size: 18px;">📍</span>
                    </td>
                    <td>
                      <p style="margin: 0; font-size: 12px; color: #808080; text-transform: uppercase; letter-spacing: 0.5px;">Región</p>
                      <p style="margin: 4px 0 0 0; font-size: 16px; color: #F5F5F5; font-weight: 500;">${escapeHtml(formatRegion(region))}</p>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Tarjeta de contacto -->
              <div class="info-card" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05)); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #22c55e; font-weight: 600; border-bottom: 1px solid rgba(34, 197, 94, 0.2); padding-bottom: 12px;">
                  📞 Datos de Contacto
                </h2>
                
                <!-- Email -->
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px;">
                  <tr>
                    <td width="32" valign="top" style="padding-right: 12px;">
                      <span style="font-size: 18px;">✉️</span>
                    </td>
                    <td>
                      <p style="margin: 0; font-size: 12px; color: #808080; text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
                      <a href="mailto:${escapeHtml(email)}" style="display: inline-block; margin: 4px 0 0 0; font-size: 16px; color: #22c55e; font-weight: 500; text-decoration: none;">
                        ${escapeHtml(email)}
                      </a>
                    </td>
                  </tr>
                </table>
                
                <!-- Teléfono -->
                ${phone ? `
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td width="32" valign="top" style="padding-right: 12px;">
                      <span style="font-size: 18px;">📱</span>
                    </td>
                    <td>
                      <p style="margin: 0; font-size: 12px; color: #808080; text-transform: uppercase; letter-spacing: 0.5px;">Teléfono</p>
                      <a href="tel:${escapeHtml(phone)}" style="display: inline-block; margin: 4px 0 0 0; font-size: 16px; color: #22c55e; font-weight: 500; text-decoration: none;">
                        ${escapeHtml(phone)}
                      </a>
                    </td>
                  </tr>
                </table>
                ` : ''}
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 8px 0 32px 0;">
                    <a href="https://matrimatch.cl/login" style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #B8941E); color: #000000; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 8px; box-shadow: 0 4px 16px rgba(212, 175, 55, 0.3);">
                      Ver en mi Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Consejo -->
              <div style="background-color: rgba(255, 255, 255, 0.03); border-radius: 8px; padding: 16px; border-left: 3px solid #D4AF37;">
                <p style="margin: 0; font-size: 14px; color: #C0C0C0; line-height: 1.5;">
                  💡 <strong style="color: #F5F5F5;">Consejo:</strong> Contacta a la pareja lo antes posible. Las parejas que reciben una respuesta rápida tienen mayor probabilidad de cerrar contrato.
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0d0d0d; padding: 24px 40px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #808080;">
                      Este email fue enviado por <span style="color: #D4AF37;">MatriMatch</span>
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #606060;">
                      © ${new Date().getFullYear()} MatriMatch. Todos los derechos reservados.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Genera la versión de texto plano del email (para clientes que no soportan HTML)
 */
export function generateInterestEmailText(data: InterestEmailData): string {
  const {
    providerName,
    coupleNames,
    eventDate,
    region,
    budget,
    email,
    phone,
    categoryName,
    matchScore,
  } = data;

  const formattedDate = eventDate && eventDate !== 'Por definir' 
    ? new Date(eventDate).toLocaleDateString('es-CL', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Por definir';

  return `
¡Hola ${providerName}!

🎉 ¡Excelentes noticias! Una pareja ha mostrado interés en tus servicios de ${categoryName}.

Compatibilidad del match: ${matchScore}%

═══════════════════════════════════════
💒 INFORMACIÓN DE LA PAREJA
═══════════════════════════════════════

👫 Nombres: ${coupleNames}
📅 Fecha del Evento: ${formattedDate}
📍 Región: ${formatRegion(region)}

═══════════════════════════════════════
📞 DATOS DE CONTACTO
═══════════════════════════════════════

✉️ Email: ${email}
${phone ? `📱 Teléfono: ${phone}` : ''}

═══════════════════════════════════════

💡 Consejo: Contacta a la pareja lo antes posible. Las parejas que reciben una respuesta rápida tienen mayor probabilidad de cerrar contrato.

Ingresa a tu dashboard para ver más detalles:
https://matrimatch.cl/login

---
Este email fue enviado por MatriMatch
© ${new Date().getFullYear()} MatriMatch. Todos los derechos reservados.
  `.trim();
}

/**
 * Genera el asunto del email
 */
export function generateInterestEmailSubject(data: InterestEmailData): string {
  return `🎉 ¡${data.coupleNames} está interesado en tus servicios de ${data.categoryName}!`;
}

// ============================================
// HELPERS
// ============================================

/**
 * Escapa caracteres HTML para prevenir XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m] || m);
}

/**
 * Formatea el presupuesto para mostrar
 */
function formatBudget(budget: string): string {
  const budgetLabels: Record<string, string> = {
    'budget_1': 'Hasta $5.000.000',
    'budget_2': '$5.000.000 - $10.000.000',
    'budget_3': '$10.000.000 - $20.000.000',
    'budget_4': '$20.000.000 - $40.000.000',
    'budget_5': 'Más de $40.000.000',
    'undecided': 'Por definir',
  };
  return budgetLabels[budget] || budget || 'No especificado';
}

/**
 * Formatea la región para mostrar
 */
function formatRegion(region: string): string {
  const regionLabels: Record<string, string> = {
    'metropolitana': 'Región Metropolitana',
    'valparaiso': 'Valparaíso',
    'biobio': 'Biobío',
    'araucania': 'La Araucanía',
    'los_lagos': 'Los Lagos',
    'ohiggins': "O'Higgins",
    'maule': 'Maule',
    'coquimbo': 'Coquimbo',
    'antofagasta': 'Antofagasta',
    'los_rios': 'Los Ríos',
    'tarapaca': 'Tarapacá',
    'atacama': 'Atacama',
    'arica': 'Arica y Parinacota',
    'nuble': 'Ñuble',
    'magallanes': 'Magallanes',
    'aysen': 'Aysén',
  };
  return regionLabels[region] || region || 'No especificada';
}

