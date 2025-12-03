/**
 * Script para limpiar datos de prueba (dummy) de la base de datos
 * 
 * USO:
 *   node scripts/clean-database.mjs
 * 
 * DESCRIPCIÓN:
 *   Este script elimina todos los datos marcados con isDummy: true
 *   Incluye: usuarios, proveedores, encuestas y leads de prueba
 * 
 * IMPORTANTE:
 *   - Solo elimina datos con isDummy: true
 *   - Los datos reales no se ven afectados
 *   - Se eliminan también los usuarios de Firebase Auth correspondientes
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

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
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.magenta}→${colors.reset} ${msg}`),
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

// ============================================
// FUNCIÓN PRINCIPAL DE LIMPIEZA
// ============================================

async function cleanDatabase(auth, db) {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.yellow}  Limpiando datos de prueba (isDummy: true)${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  const stats = {
    leads: 0,
    userSurveys: 0,
    providerSurveys: 0,
    users: 0,
    providers: 0,
  };

  // 1. Eliminar leads dummy
  log.step('Eliminando leads dummy...');
  try {
    const leadsSnapshot = await db.collection('leads').where('isDummy', '==', true).get();
    for (const doc of leadsSnapshot.docs) {
      await doc.ref.delete();
      stats.leads++;
    }
    log.success(`${stats.leads} leads dummy eliminados`);
  } catch (error) {
    log.error(`Error eliminando leads: ${error.message}`);
  }

  // 2. Eliminar encuestas de usuarios dummy
  log.step('Eliminando encuestas de usuarios dummy...');
  try {
    const userSurveysSnapshot = await db.collection('userCategorySurveys').where('isDummy', '==', true).get();
    for (const doc of userSurveysSnapshot.docs) {
      await doc.ref.delete();
      stats.userSurveys++;
    }
    log.success(`${stats.userSurveys} encuestas de usuarios eliminadas`);
  } catch (error) {
    log.error(`Error eliminando encuestas de usuarios: ${error.message}`);
  }

  // 3. Eliminar encuestas de proveedores dummy
  log.step('Eliminando encuestas de proveedores dummy...');
  try {
    const providerSurveysSnapshot = await db.collection('providerCategorySurveys').where('isDummy', '==', true).get();
    for (const doc of providerSurveysSnapshot.docs) {
      await doc.ref.delete();
      stats.providerSurveys++;
    }
    log.success(`${stats.providerSurveys} encuestas de proveedores eliminadas`);
  } catch (error) {
    log.error(`Error eliminando encuestas de proveedores: ${error.message}`);
  }

  // 4. Eliminar usuarios dummy
  log.step('Eliminando usuarios dummy...');
  try {
    const usersSnapshot = await db.collection('users').where('isDummy', '==', true).get();
    for (const doc of usersSnapshot.docs) {
      await doc.ref.delete();
      try {
        await auth.deleteUser(doc.id);
      } catch (e) { 
        // Usuario ya no existe en Auth o error de permisos
      }
      stats.users++;
    }
    log.success(`${stats.users} usuarios dummy eliminados`);
  } catch (error) {
    log.error(`Error eliminando usuarios: ${error.message}`);
  }

  // 5. Eliminar proveedores dummy
  log.step('Eliminando proveedores dummy...');
  try {
    const providersSnapshot = await db.collection('providers').where('isDummy', '==', true).get();
    for (const doc of providersSnapshot.docs) {
      await doc.ref.delete();
      try {
        await auth.deleteUser(doc.id);
      } catch (e) { 
        // Usuario ya no existe en Auth o error de permisos
      }
      stats.providers++;
    }
    log.success(`${stats.providers} proveedores dummy eliminados`);
  } catch (error) {
    log.error(`Error eliminando proveedores: ${error.message}`);
  }

  return stats;
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.yellow}  Matri.AI - Limpiar Base de Datos de Prueba${colors.reset}`);
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

  // Ejecutar limpieza
  const stats = await cleanDatabase(auth, db);

  // Resumen final
  const totalDeleted = stats.leads + stats.userSurveys + stats.providerSurveys + stats.users + stats.providers;

  console.log(`\n${colors.green}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}  ¡Limpieza completada!${colors.reset}`);
  console.log(`${colors.green}═══════════════════════════════════════════════════${colors.reset}\n`);

  console.log(`  ${colors.cyan}Total eliminado:${colors.reset}      ${totalDeleted} documentos`);
  console.log(`  ${colors.cyan}Leads:${colors.reset}                ${stats.leads}`);
  console.log(`  ${colors.cyan}Encuestas usuarios:${colors.reset}   ${stats.userSurveys}`);
  console.log(`  ${colors.cyan}Encuestas proveed.:${colors.reset}   ${stats.providerSurveys}`);
  console.log(`  ${colors.cyan}Usuarios:${colors.reset}             ${stats.users}`);
  console.log(`  ${colors.cyan}Proveedores:${colors.reset}          ${stats.providers}`);
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

