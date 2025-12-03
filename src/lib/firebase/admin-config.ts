/**
 * Configuración de Firebase Admin SDK
 * Este archivo se usa SOLO en el servidor (API routes)
 * 
 * IMPORTANTE: Configura estas variables de entorno:
 * - FIREBASE_ADMIN_PROJECT_ID
 * - FIREBASE_ADMIN_CLIENT_EMAIL
 * - FIREBASE_ADMIN_PRIVATE_KEY_BASE64 (solo la private_key en base64)
 */

import { initializeApp, getApps, cert, App, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App;

// Obtener service account desde variables de entorno
const getServiceAccount = (): ServiceAccount | null => {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKeyBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;

  if (!projectId || !clientEmail || !privateKeyBase64) {
    console.warn('Variables de Firebase Admin no configuradas');
    return null;
  }
  
  try {
    // Decodificar solo la private key desde Base64
    let privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf-8');
    
    // Convertir \n literales a saltos de línea reales
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    return {
      projectId,
      clientEmail,
      privateKey,
    } as ServiceAccount;
  } catch (error) {
    console.error('Error al decodificar private key:', error);
    return null;
  }
};

// Inicializar Firebase Admin solo si no está inicializado
const initializeFirebaseAdmin = (): App => {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = getServiceAccount();

  if (serviceAccount) {
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    // Fallback: intentar usar credenciales por defecto (Google Cloud)
    adminApp = initializeApp();
  }

  return adminApp;
};

// Exportar instancias
export const getAdminApp = () => {
  if (!adminApp) {
    adminApp = initializeFirebaseAdmin();
  }
  return adminApp;
};

export const getAdminAuth = () => {
  return getAuth(getAdminApp());
};

export const getAdminFirestore = () => {
  return getFirestore(getAdminApp());
};

