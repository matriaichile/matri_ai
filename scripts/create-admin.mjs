/**
 * Script para crear usuarios admin
 * 
 * USO:
 *   node scripts/create-admin.mjs <email> [--super]
 * 
 * EJEMPLOS:
 *   node scripts/create-admin.mjs admin@matri.ai --super    # Super Admin
 *   node scripts/create-admin.mjs mod@matri.ai              # Admin normal
 * 
 * REQUISITOS:
 *   - Variable de entorno FIREBASE_SERVICE_ACCOUNT_KEY_BASE64
 *   - O archivo service-account.json en la raíz del proyecto
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

// Cargar variables de entorno desde .env.local
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
            // Remover comillas si existen
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

// Cargar .env.local al inicio
const loadedEnv = loadEnvFile();

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
};

// Obtener credenciales de Firebase
function getServiceAccount() {
  // Opción 1: Variables de entorno separadas (private_key en Base64)
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKeyBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;

  if (projectId && clientEmail && privateKeyBase64) {
    log.info('Usando credenciales desde variables de entorno');
    
    try {
      // Decodificar solo la private key desde Base64
      const cleanBase64 = privateKeyBase64.trim().replace(/^["']|["']$/g, '');
      let privateKey = Buffer.from(cleanBase64, 'base64').toString('utf-8');
      
      // Convertir \n literales a saltos de línea reales
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

  // Opción 2: Archivo service-account.json
  const filePath = resolve(projectRoot, 'service-account.json');
  if (existsSync(filePath)) {
    log.info('Usando credenciales desde service-account.json');
    const jsonString = readFileSync(filePath, 'utf-8');
    return JSON.parse(jsonString);
  }

  return null;
}

// Inicializar Firebase Admin
function initFirebase() {
  const serviceAccount = getServiceAccount();
  
  if (!serviceAccount) {
  log.error('No se encontraron credenciales de Firebase.');
  log.info('Opciones:');
  log.info('  1. Configura estas variables en tu .env.local:');
  log.info('     FIREBASE_ADMIN_PROJECT_ID=tu-proyecto');
  log.info('     FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxx@tu-proyecto.iam.gserviceaccount.com');
  log.info('     FIREBASE_SERVICE_ACCOUNT_KEY_BASE64=<private_key en base64>');
  log.info('  2. O coloca service-account.json en la raíz del proyecto');
  process.exit(1);
  }

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

// Buscar usuario por email
async function findUserByEmail(auth, email) {
  try {
    return await auth.getUserByEmail(email);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
${colors.cyan}═══════════════════════════════════════════════════${colors.reset}
${colors.yellow}  Matri.AI - Crear Usuario Admin${colors.reset}
${colors.cyan}═══════════════════════════════════════════════════${colors.reset}

${colors.green}Uso:${colors.reset}
  node scripts/create-admin.mjs <email> [opciones]

${colors.green}Opciones:${colors.reset}
  --super, -s    Crear como Super Admin (todos los permisos)
  --help, -h     Mostrar esta ayuda

${colors.green}Ejemplos:${colors.reset}
  node scripts/create-admin.mjs admin@matri.ai --super
  node scripts/create-admin.mjs moderador@matri.ai

${colors.green}Notas:${colors.reset}
  - El usuario debe existir en Firebase Auth
  - Primero crea el usuario desde la app o Firebase Console
`);
    process.exit(0);
  }

  const email = args.find(arg => !arg.startsWith('-'));
  const isSuperAdmin = args.includes('--super') || args.includes('-s');

  if (!email) {
    log.error('Debes proporcionar un email');
    process.exit(1);
  }

  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.yellow}  Matri.AI - Crear Usuario Admin${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);

  if (loadedEnv) {
    log.info(`Variables cargadas desde ${loadedEnv}`);
  }

  // Inicializar Firebase
  initFirebase();
  const auth = getAuth();

  // Buscar usuario
  log.info(`Buscando usuario: ${email}`);
  const user = await findUserByEmail(auth, email);

  if (!user) {
    log.error(`Usuario no encontrado: ${email}`);
    log.info('Primero crea el usuario en Firebase Auth');
    process.exit(1);
  }

  log.success(`Usuario encontrado: ${user.uid}`);

  // Definir claims
  const claims = {
    admin: true,
    ...(isSuperAdmin && { super_admin: true }),
  };

  // Establecer claims
  log.info(`Estableciendo claims: ${JSON.stringify(claims)}`);
  await auth.setCustomUserClaims(user.uid, claims);

  // Verificar
  const updatedUser = await auth.getUser(user.uid);
  
  console.log(`\n${colors.green}═══════════════════════════════════════════════════${colors.reset}`);
  log.success('¡Admin creado exitosamente!');
  console.log(`${colors.green}═══════════════════════════════════════════════════${colors.reset}\n`);
  
  console.log(`  ${colors.cyan}Email:${colors.reset}       ${updatedUser.email}`);
  console.log(`  ${colors.cyan}UID:${colors.reset}         ${updatedUser.uid}`);
  console.log(`  ${colors.cyan}Tipo:${colors.reset}        ${isSuperAdmin ? 'Super Admin' : 'Admin'}`);
  console.log(`  ${colors.cyan}Claims:${colors.reset}      ${JSON.stringify(updatedUser.customClaims)}`);
  console.log();

  log.info('El usuario debe cerrar sesión y volver a entrar para que los claims se apliquen.');
  console.log();

  process.exit(0);
}

main().catch((error) => {
  log.error(`Error: ${error.message}`);
  process.exit(1);
});

