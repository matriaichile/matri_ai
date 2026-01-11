/**
 * Script para limpiar TODA la base de datos EXCEPTO:
 * - La cuenta admin (matriaichile@gmail.com)
 * - La colección matchmaking_config
 * 
 * USO:
 *   node scripts/clean-all-database.mjs
 * 
 * ⚠️ ADVERTENCIA: Este script es DESTRUCTIVO y eliminará:
 *   - Todos los usuarios (excepto admin)
 *   - Todos los proveedores
 *   - Todos los leads
 *   - Todas las encuestas de usuarios
 *   - Todas las encuestas de proveedores
 *   - Todas las cuentas de Firebase Auth (excepto admin)
 * 
 * IMPORTANTE:
 *   - Requiere las credenciales de Firebase Admin configuradas
 *   - La colección matchmaking_config NO será afectada
 *   - La cuenta admin (matriaichile@gmail.com) será preservada
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as readline from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

// ============================================
// CONFIGURACIÓN
// ============================================

// Email de la cuenta admin que NO debe ser eliminada
const ADMIN_EMAIL = 'matriaichile@gmail.com';

// Colecciones a limpiar (matchmaking_config NO está incluida)
const COLLECTIONS_TO_CLEAN = [
  'users',
  'providers',
  'leads',
  'userCategorySurveys',
  'providerCategorySurveys',
  // 'admins' - Se mantiene porque contiene el perfil admin
];

// ============================================
// UTILIDADES
// ============================================

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bgRed: '\x1b[41m',
  white: '\x1b[37m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.magenta}→${colors.reset} ${msg}`),
  danger: (msg) => console.log(`${colors.bgRed}${colors.white} ⚠ PELIGRO ${colors.reset} ${msg}`),
};

// Cargar variables de entorno
function loadEnvFile() {
  const envFiles = ['.env.local', '.env'];
  
  for (const envFile of envFiles) {
    const envPath = resolve(projectRoot, envFile);
    if (existsSync(envPath)) {
      const content = readFileSync(envPath, 'utf-8');
      const lines = content.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            let value = valueParts.join('=');
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            process.env[key.trim()] = value;
          }
        }
      }
      return envFile;
    }
  }
  return null;
}

// Obtener service account
function getServiceAccount() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKeyBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;

  if (projectId && clientEmail && privateKeyBase64) {
    try {
      const cleanBase64 = privateKeyBase64.trim().replace(/^["']|["']$/g, '');
      let privateKey = Buffer.from(cleanBase64, 'base64').toString('utf-8');
      privateKey = privateKey.replace(/\\n/g, '\n');
      
      return {
        type: 'service_account',
        project_id: projectId,
        private_key: privateKey,
        client_email: clientEmail,
      };
    } catch (error) {
      log.error(`Error al decodificar private key: ${error.message}`);
      return null;
    }
  }

  const filePath = resolve(projectRoot, 'service-account.json');
  if (existsSync(filePath)) {
    const jsonString = readFileSync(filePath, 'utf-8');
    return JSON.parse(jsonString);
  }

  return null;
}

// Función para confirmar acción peligrosa
async function confirmDangerousAction() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log();
    log.danger('ESTA ACCIÓN ELIMINARÁ TODOS LOS DATOS DE LA BASE DE DATOS');
    log.danger(`Solo se preservará: ${ADMIN_EMAIL} y matchmaking_config`);
    console.log();
    
    rl.question(`${colors.yellow}¿Estás SEGURO? Escribe "ELIMINAR TODO" para confirmar: ${colors.reset}`, (answer) => {
      rl.close();
      resolve(answer === 'ELIMINAR TODO');
    });
  });
}

// ============================================
// FUNCIONES DE LIMPIEZA
// ============================================

/**
 * Eliminar todos los documentos de una colección (con excepciones)
 * @param {FirebaseFirestore.Firestore} db - Instancia de Firestore
 * @param {string} collectionName - Nombre de la colección
 * @param {string[]|null} preserveDocIds - IDs de documentos a preservar (opcional)
 * @param {string[]|null} preserveEmails - Emails de documentos a preservar (opcional, busca en campo 'email')
 * @returns {Promise<number>} - Número de documentos eliminados
 */
async function cleanCollection(db, collectionName, preserveDocIds = null, preserveEmails = null) {
  log.step(`Limpiando colección: ${collectionName}...`);
  
  try {
    const snapshot = await db.collection(collectionName).get();
    let deletedCount = 0;
    let preservedCount = 0;
    const preservedDocs = [];
    
    // Convertir a Set para búsqueda más rápida
    const preserveIdSet = new Set(preserveDocIds || []);
    const preserveEmailSet = new Set((preserveEmails || []).map(e => e.toLowerCase()));
    
    // Primera pasada: identificar documentos a preservar
    const docsToDelete = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const docEmail = (data.email || '').toLowerCase();
      
      // Preservar documento si coincide con el ID o email especificado
      if (preserveIdSet.has(doc.id) || preserveEmailSet.has(docEmail)) {
        preservedCount++;
        preservedDocs.push({ id: doc.id, email: data.email });
        continue;
      }
      
      docsToDelete.push(doc.ref);
    }
    
    // Eliminar en batches
    const MAX_BATCH_SIZE = 500; // Firestore limita a 500 operaciones por batch
    
    for (let i = 0; i < docsToDelete.length; i += MAX_BATCH_SIZE) {
      const batch = db.batch();
      const chunk = docsToDelete.slice(i, i + MAX_BATCH_SIZE);
      
      for (const docRef of chunk) {
        batch.delete(docRef);
      }
      
      await batch.commit();
      deletedCount += chunk.length;
      
      // Mostrar progreso cada 500 documentos
      if (deletedCount % 500 === 0 && deletedCount > 0) {
        log.info(`${collectionName}: ${deletedCount} eliminados...`);
      }
    }
    
    if (preservedCount > 0) {
      log.success(`${collectionName}: ${deletedCount} eliminados, ${preservedCount} preservados`);
      for (const preserved of preservedDocs) {
        log.info(`  └─ Preservado: ${preserved.email || preserved.id}`);
      }
    } else {
      log.success(`${collectionName}: ${deletedCount} documentos eliminados`);
    }
    
    return deletedCount;
  } catch (error) {
    log.error(`Error limpiando ${collectionName}: ${error.message}`);
    return 0;
  }
}

/**
 * Obtener el UID del usuario admin por email
 * @param {Auth} auth - Instancia de Firebase Auth
 * @returns {Promise<string|null>} - UID del admin o null si no existe
 */
async function getAdminUid(auth) {
  try {
    const adminUser = await auth.getUserByEmail(ADMIN_EMAIL);
    return adminUser.uid;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      log.warn(`Usuario admin ${ADMIN_EMAIL} no encontrado en Auth`);
      return null;
    }
    throw error;
  }
}

/**
 * Eliminar todos los usuarios de Firebase Auth excepto el admin
 * @param {Auth} auth - Instancia de Firebase Auth
 * @param {string|null} adminUid - UID del admin a preservar
 * @returns {Promise<number>} - Número de usuarios eliminados
 */
async function cleanAuthUsers(auth, adminUid) {
  log.step('Limpiando usuarios de Firebase Auth...');
  
  try {
    let deletedCount = 0;
    let nextPageToken = undefined;
    
    do {
      // Obtener usuarios en lotes de 1000 (máximo permitido)
      const listResult = await auth.listUsers(1000, nextPageToken);
      
      for (const user of listResult.users) {
        // Preservar el usuario admin
        if (adminUid && user.uid === adminUid) {
          log.info(`Preservando usuario admin: ${user.email}`);
          continue;
        }
        
        try {
          await auth.deleteUser(user.uid);
          deletedCount++;
          
          // Log cada 10 usuarios para mostrar progreso
          if (deletedCount % 10 === 0) {
            log.info(`${deletedCount} usuarios eliminados...`);
          }
        } catch (deleteError) {
          log.warn(`No se pudo eliminar usuario ${user.email}: ${deleteError.message}`);
        }
      }
      
      nextPageToken = listResult.pageToken;
    } while (nextPageToken);
    
    log.success(`Firebase Auth: ${deletedCount} usuarios eliminados`);
    return deletedCount;
  } catch (error) {
    log.error(`Error limpiando Firebase Auth: ${error.message}`);
    return 0;
  }
}

// ============================================
// FUNCIÓN PRINCIPAL DE LIMPIEZA
// ============================================

async function cleanAllDatabase(auth, db) {
  console.log(`\n${colors.red}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.yellow}  ⚠️  LIMPIEZA TOTAL DE BASE DE DATOS ⚠️${colors.reset}`);
  console.log(`${colors.red}═══════════════════════════════════════════════════${colors.reset}\n`);

  const stats = {
    users: 0,
    providers: 0,
    leads: 0,
    userCategorySurveys: 0,
    providerCategorySurveys: 0,
    authUsers: 0,
  };

  // 1. Obtener UID del admin para preservar
  log.info(`Buscando cuenta admin: ${ADMIN_EMAIL}`);
  const adminUid = await getAdminUid(auth);
  
  if (adminUid) {
    log.success(`Admin encontrado con UID: ${adminUid}`);
  } else {
    log.warn('No se encontró cuenta admin - se eliminarán TODOS los usuarios de Auth');
  }

  // 2. Limpiar colección de usuarios (preservar documento del admin por UID y email)
  // IMPORTANTE: El admin tiene un documento en 'users' que NO debe eliminarse
  const preserveIds = adminUid ? [adminUid] : [];
  const preserveEmails = [ADMIN_EMAIL];
  
  stats.users = await cleanCollection(db, 'users', preserveIds, preserveEmails);

  // 3. Limpiar colección de proveedores (el admin no debería estar aquí, pero por seguridad verificamos)
  stats.providers = await cleanCollection(db, 'providers', preserveIds, preserveEmails);

  // 4. Limpiar colección de leads
  stats.leads = await cleanCollection(db, 'leads', null, null);

  // 5. Limpiar colección de encuestas de usuarios
  stats.userCategorySurveys = await cleanCollection(db, 'userCategorySurveys', null, null);

  // 6. Limpiar colección de encuestas de proveedores
  stats.providerCategorySurveys = await cleanCollection(db, 'providerCategorySurveys', null, null);

  // 7. Limpiar usuarios de Firebase Auth (preservar admin)
  stats.authUsers = await cleanAuthUsers(auth, adminUid);

  // NO se toca:
  // - matchmaking_config (configuración del sistema)
  // - admins (perfiles de administradores)
  
  log.info('Colección matchmaking_config: NO AFECTADA');
  log.info('Colección admins: NO AFECTADA');

  return stats;
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.yellow}  Matri.AI - Limpieza Total de Base de Datos${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);

  // Cargar variables de entorno
  const loadedEnv = loadEnvFile();
  if (loadedEnv) {
    log.info(`Variables cargadas desde ${loadedEnv}`);
  }

  // Inicializar Firebase
  const serviceAccount = getServiceAccount();
  if (!serviceAccount) {
    log.error('No se encontraron credenciales de Firebase.');
    log.info('Asegúrate de tener service-account.json o las variables de entorno configuradas.');
    process.exit(1);
  }

  if (getApps().length === 0) {
    initializeApp({ credential: cert(serviceAccount) });
  }

  const auth = getAuth();
  const db = getFirestore();

  // Confirmación de seguridad
  const confirmed = await confirmDangerousAction();
  
  if (!confirmed) {
    log.warn('Operación cancelada por el usuario.');
    process.exit(0);
  }

  console.log();
  log.info('Iniciando limpieza...');

  // Ejecutar limpieza
  const stats = await cleanAllDatabase(auth, db);

  // Calcular total
  const totalDeleted = stats.users + stats.providers + stats.leads + 
                       stats.userCategorySurveys + stats.providerCategorySurveys;

  // Resumen final
  console.log(`\n${colors.green}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}  ¡Limpieza completada!${colors.reset}`);
  console.log(`${colors.green}═══════════════════════════════════════════════════${colors.reset}\n`);

  console.log(`  ${colors.cyan}Documentos eliminados:${colors.reset}      ${totalDeleted}`);
  console.log(`  ${colors.cyan}├─ Usuarios:${colors.reset}                ${stats.users}`);
  console.log(`  ${colors.cyan}├─ Proveedores:${colors.reset}             ${stats.providers}`);
  console.log(`  ${colors.cyan}├─ Leads:${colors.reset}                   ${stats.leads}`);
  console.log(`  ${colors.cyan}├─ Encuestas usuarios:${colors.reset}      ${stats.userCategorySurveys}`);
  console.log(`  ${colors.cyan}└─ Encuestas proveed.:${colors.reset}      ${stats.providerCategorySurveys}`);
  console.log();
  console.log(`  ${colors.cyan}Auth usuarios eliminados:${colors.reset}   ${stats.authUsers}`);
  console.log();
  console.log(`  ${colors.green}PRESERVADO:${colors.reset}`);
  console.log(`  ${colors.cyan}├─ Admin:${colors.reset}                   ${ADMIN_EMAIL}`);
  console.log(`  ${colors.cyan}├─ matchmaking_config:${colors.reset}      ✓ Sin cambios`);
  console.log(`  ${colors.cyan}└─ admins:${colors.reset}                  ✓ Sin cambios`);
  console.log();
  console.log(`  ${colors.magenta}Para poblar de nuevo:${colors.reset} node scripts/seed-database.mjs`);
  console.log();

  process.exit(0);
}

main().catch((error) => {
  log.error(`Error: ${error.message}`);
  console.error(error);
  process.exit(1);
});

