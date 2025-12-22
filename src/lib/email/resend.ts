/**
 * Configuración y cliente de Resend para envío de emails
 * 
 * IMPORTANTE: La API key debe estar configurada en las variables de entorno
 * como RESEND_KEY
 * 
 * Este módulo SOLO debe ser importado desde el servidor (API routes)
 * NO importar desde código cliente (componentes, hooks, etc.)
 */
import { Resend } from 'resend';

// Variable para almacenar la instancia de Resend (lazy initialization)
let resendInstance: Resend | null = null;

/**
 * Obtiene la instancia de Resend (lazy initialization)
 * Esto asegura que la API key se lea en el momento de uso, no al cargar el módulo
 */
export function getResendClient(): Resend {
  if (!resendInstance) {
    const resendApiKey = process.env.RESEND_KEY;
    
    if (!resendApiKey) {
      console.error('❌ RESEND_KEY no está configurada en las variables de entorno');
      throw new Error('Missing API key. RESEND_KEY environment variable is not set.');
    }
    
    console.log('✅ Inicializando cliente de Resend');
    resendInstance = new Resend(resendApiKey);
  }
  
  return resendInstance;
}

// Exportamos también como 'resend' para compatibilidad, pero usando getter
// NOTA: Esto crea la instancia en el primer acceso
export const resend = {
  emails: {
    send: async (...args: Parameters<Resend['emails']['send']>) => {
      const client = getResendClient();
      return client.emails.send(...args);
    },
  },
};

// Configuración del remitente
// Usamos el subdominio de notificaciones configurado en Cloudflare
export const EMAIL_FROM = 'MatriMatch <notificaciones@notificaciones.matrimatch.cl>';

// Configuración alternativa para desarrollo/testing
export const EMAIL_FROM_DEV = 'MatriMatch <onboarding@resend.dev>';
