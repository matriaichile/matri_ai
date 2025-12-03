/**
 * Script para poblar la base de datos con datos de prueba
 * 
 * USO:
 *   node scripts/seed-database.mjs [opciones]
 * 
 * OPCIONES:
 *   --providers    Solo crear proveedores
 *   --users        Solo crear usuarios
 *   --leads        Solo crear leads (requiere usuarios y proveedores existentes)
 *   --all          Crear todo (default)
 *   --clean        Limpiar datos existentes antes de crear
 * 
 * REQUISITOS:
 *   - Variables de entorno de Firebase Admin configuradas
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

// ============================================
// CONFIGURACIÓN
// ============================================

const DEFAULT_PASSWORD = '123123';
const NUM_PROVIDERS = 15;
const NUM_USERS = 12;
const LEADS_PER_USER = 3;

// ⚠️ IDENTIFICADOR ÚNICO PARA DATOS DUMMY
// Este ID permite identificar y eliminar todos los datos de prueba fácilmente
const DUMMY_BATCH_ID = `dummy_${new Date().toISOString().split('T')[0]}_${Date.now()}`;

// ============================================
// DATOS DE PRUEBA - PROVEEDORES
// ============================================

const PROVIDER_NAMES = [
  { name: 'Fotografía Elegante', categories: ['photography'], style: 'artistic', price: 'premium' },
  { name: 'Momentos Studio', categories: ['photography', 'video'], style: 'documentary', price: 'mid' },
  { name: 'DJ Master Events', categories: ['dj'], style: 'modern', price: 'mid' },
  { name: 'Ritmo & Fiesta DJs', categories: ['dj'], style: 'traditional', price: 'budget' },
  { name: 'Banquetería Gourmet', categories: ['catering'], style: 'traditional', price: 'premium' },
  { name: 'Sabores del Sur', categories: ['catering'], style: 'modern', price: 'mid' },
  { name: 'Hacienda Los Robles', categories: ['venue'], style: 'traditional', price: 'luxury' },
  { name: 'Espacio Urbano Loft', categories: ['venue'], style: 'modern', price: 'premium' },
  { name: 'Jardín Secreto', categories: ['venue'], style: 'artistic', price: 'mid' },
  { name: 'Cinema Wedding Films', categories: ['video'], style: 'cinematic', price: 'premium' },
  { name: 'Flores & Sueños', categories: ['decoration'], style: 'artistic', price: 'mid' },
  { name: 'Dulce Tentación', categories: ['cake'], style: 'traditional', price: 'mid' },
  { name: 'Belleza Nupcial', categories: ['makeup'], style: 'editorial', price: 'premium' },
  { name: 'Wedding Dreams Planner', categories: ['wedding_planner'], style: 'modern', price: 'luxury' },
  { name: 'Transporte VIP Bodas', categories: ['transport'], style: 'traditional', price: 'premium' },
];

const PROVIDER_DESCRIPTIONS = [
  'Capturamos los momentos más especiales de tu día con un enfoque artístico y emocional. Más de 10 años de experiencia en bodas.',
  'Equipo profesional dedicado a crear recuerdos inolvidables. Estilo natural y espontáneo que refleja la esencia de cada pareja.',
  'La mejor música para tu celebración. Equipos de última generación y animación profesional para una fiesta inolvidable.',
  'Experiencias gastronómicas únicas. Menús personalizados con los mejores ingredientes locales y presentación impecable.',
  'Un espacio mágico para tu celebración. Jardines hermosos, salones elegantes y atención personalizada.',
  'Transformamos espacios en escenarios de ensueño. Decoración floral y ambientación para bodas únicas.',
  'Películas de boda cinematográficas que cuentan tu historia de amor de manera única y emocionante.',
  'Tortas y dulces artesanales que deleitan tanto la vista como el paladar. Diseños personalizados.',
  'Maquillaje y peinado profesional para novias. Resaltamos tu belleza natural en el día más importante.',
  'Planificamos cada detalle de tu boda para que solo te preocupes de disfrutar. Experiencia y dedicación.',
];

const REGIONS = ['rm', 'valparaiso', 'ohiggins', 'maule', 'biobio', 'araucania', 'los_lagos', 'coquimbo'];

// ============================================
// DATOS DE PRUEBA - USUARIOS (NOVIOS)
// ============================================

const COUPLE_NAMES = [
  'María & Juan',
  'Camila & Pedro',
  'Valentina & Diego',
  'Sofía & Sebastián',
  'Isidora & Matías',
  'Antonia & Felipe',
  'Catalina & Nicolás',
  'Fernanda & Andrés',
  'Javiera & Tomás',
  'Constanza & Ignacio',
  'Francisca & Cristóbal',
  'Martina & Vicente',
];

const BUDGET_OPTIONS = ['5m_10m', '10m_15m', '15m_20m', '20m_30m', '30m_50m', 'over_50m'];
const GUEST_OPTIONS = ['intimate', 'small', 'medium', 'large', 'xlarge'];
const CEREMONY_OPTIONS = ['civil', 'religious', 'symbolic'];
const EVENT_STYLES = ['classic', 'rustic', 'modern', 'romantic', 'glamorous', 'vintage'];
const PLANNING_PROGRESS = ['nothing', 'little', 'half', 'most'];
const INVOLVEMENT_LEVELS = ['100', '80', '60', '40'];
const PRIORITY_CATEGORIES = ['photography', 'video', 'dj', 'catering', 'venue', 'decoration', 'wedding_planner', 'makeup'];

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

// Funciones de utilidad
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomItems(arr, min = 1, max = 3) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomDate(startMonths = 3, endMonths = 18) {
  const now = new Date();
  const start = new Date(now.getTime() + startMonths * 30 * 24 * 60 * 60 * 1000);
  const end = new Date(now.getTime() + endMonths * 30 * 24 * 60 * 60 * 1000);
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

function generatePhone() {
  const prefix = '+56 9';
  const number = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix} ${number.toString().slice(0, 4)} ${number.toString().slice(4)}`;
}

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

async function createProviders(auth, db) {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.yellow}  Creando ${NUM_PROVIDERS} Proveedores${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  const createdProviders = [];

  for (let i = 0; i < NUM_PROVIDERS; i++) {
    const providerData = PROVIDER_NAMES[i % PROVIDER_NAMES.length];
    const email = `provider${i + 1}@test.matri.ai`;
    
    try {
      // Verificar si el usuario ya existe
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(email);
        log.warn(`Usuario ${email} ya existe, actualizando...`);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // Crear usuario en Firebase Auth
          userRecord = await auth.createUser({
            email,
            password: DEFAULT_PASSWORD,
            displayName: providerData.name,
          });
          log.success(`Auth creado: ${email}`);
        } else {
          throw error;
        }
      }

      // Crear/actualizar documento en Firestore
      const region = randomItem(REGIONS);
      const providerDoc = {
        id: userRecord.uid,
        type: 'provider',
        email,
        providerName: providerData.name,
        phone: generatePhone(),
        categories: providerData.categories,
        serviceStyle: providerData.style,
        priceRange: providerData.price,
        workRegion: region,
        acceptsOutsideZone: Math.random() > 0.3,
        description: PROVIDER_DESCRIPTIONS[i % PROVIDER_DESCRIPTIONS.length],
        website: `https://www.${providerData.name.toLowerCase().replace(/\s+/g, '')}.cl`,
        instagram: `@${providerData.name.toLowerCase().replace(/\s+/g, '_')}`,
        facebook: '',
        tiktok: '',
        portfolioImages: [],
        status: Math.random() > 0.2 ? 'active' : 'pending', // 80% activos
        leadLimit: 10,
        leadsUsed: 0,
        // ⚠️ CAMPOS PARA IDENTIFICAR DATOS DE PRUEBA - ELIMINAR EN PRODUCCIÓN
        isDummy: true,
        dummyBatch: DUMMY_BATCH_ID,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      await db.collection('providers').doc(userRecord.uid).set(providerDoc);
      log.success(`Proveedor creado: ${providerData.name} (${region})`);

      createdProviders.push({
        uid: userRecord.uid,
        ...providerDoc,
      });

    } catch (error) {
      log.error(`Error creando proveedor ${providerData.name}: ${error.message}`);
    }
  }

  return createdProviders;
}

async function createUsers(auth, db) {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.yellow}  Creando ${NUM_USERS} Usuarios (Novios)${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  const createdUsers = [];

  for (let i = 0; i < NUM_USERS; i++) {
    const coupleName = COUPLE_NAMES[i % COUPLE_NAMES.length];
    const email = `user${i + 1}@test.matri.ai`;
    
    try {
      // Verificar si el usuario ya existe
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(email);
        log.warn(`Usuario ${email} ya existe, actualizando...`);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // Crear usuario en Firebase Auth
          userRecord = await auth.createUser({
            email,
            password: DEFAULT_PASSWORD,
            displayName: coupleName,
          });
          log.success(`Auth creado: ${email}`);
        } else {
          throw error;
        }
      }

      // Crear/actualizar documento en Firestore
      const region = randomItem(REGIONS);
      const userDoc = {
        id: userRecord.uid,
        type: 'user',
        email,
        coupleNames: coupleName,
        phone: generatePhone(),
        eventDate: randomDate(),
        isDateTentative: Math.random() > 0.5,
        budget: randomItem(BUDGET_OPTIONS),
        guestCount: randomItem(GUEST_OPTIONS),
        region,
        ceremonyTypes: randomItems(CEREMONY_OPTIONS, 1, 2),
        eventStyle: randomItem(EVENT_STYLES),
        planningProgress: randomItem(PLANNING_PROGRESS),
        completedItems: randomItems(['dj', 'photography', 'video', 'venue', 'catering'], 0, 2),
        priorityCategories: randomItems(PRIORITY_CATEGORIES, 2, 5),
        involvementLevel: randomItem(INVOLVEMENT_LEVELS),
        expectations: 'Buscamos proveedores profesionales y confiables para hacer de nuestro día algo especial e inolvidable.',
        // ⚠️ CAMPOS PARA IDENTIFICAR DATOS DE PRUEBA - ELIMINAR EN PRODUCCIÓN
        isDummy: true,
        dummyBatch: DUMMY_BATCH_ID,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      await db.collection('users').doc(userRecord.uid).set(userDoc);
      log.success(`Usuario creado: ${coupleName} (${region})`);

      createdUsers.push({
        uid: userRecord.uid,
        ...userDoc,
      });

    } catch (error) {
      log.error(`Error creando usuario ${coupleName}: ${error.message}`);
    }
  }

  return createdUsers;
}

async function createLeads(db, users, providers) {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.yellow}  Creando Leads (Matches)${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  const activeProviders = providers.filter(p => p.status === 'active');
  
  if (activeProviders.length === 0) {
    log.warn('No hay proveedores activos para crear leads');
    return;
  }

  const leadStatuses = ['pending', 'approved', 'contacted'];

  for (const user of users) {
    // Seleccionar proveedores aleatorios para este usuario
    const shuffledProviders = [...activeProviders].sort(() => Math.random() - 0.5);
    const selectedProviders = shuffledProviders.slice(0, Math.min(LEADS_PER_USER, shuffledProviders.length));

    for (const provider of selectedProviders) {
      // Calcular match score basado en coincidencias
      let matchScore = 70 + Math.floor(Math.random() * 25); // 70-95%
      
      // Bonus si coincide la región
      if (user.region === provider.workRegion) {
        matchScore = Math.min(99, matchScore + 5);
      }

      const category = provider.categories[0];
      const status = randomItem(leadStatuses);

      const leadDoc = {
        userId: user.uid,
        providerId: provider.uid,
        category,
        matchScore,
        status,
        userInfo: {
          coupleNames: user.coupleNames,
          eventDate: user.eventDate,
          budget: user.budget,
          region: user.region,
          email: user.email,
          phone: user.phone,
        },
        providerInfo: {
          providerName: provider.providerName,
          categories: provider.categories,
          priceRange: provider.priceRange,
        },
        assignedByAdmin: false,
        // ⚠️ CAMPOS PARA IDENTIFICAR DATOS DE PRUEBA - ELIMINAR EN PRODUCCIÓN
        isDummy: true,
        dummyBatch: DUMMY_BATCH_ID,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      try {
        await db.collection('leads').add(leadDoc);
        
        // Actualizar leadsUsed del proveedor
        await db.collection('providers').doc(provider.uid).update({
          leadsUsed: FieldValue.increment(1),
        });

        log.success(`Lead: ${user.coupleNames} → ${provider.providerName} (${matchScore}%)`);
      } catch (error) {
        log.error(`Error creando lead: ${error.message}`);
      }
    }
  }
}

async function cleanDatabase(auth, db) {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.yellow}  Limpiando datos de prueba (isDummy: true)${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  // Eliminar leads dummy
  log.step('Eliminando leads dummy...');
  const leadsSnapshot = await db.collection('leads').where('isDummy', '==', true).get();
  for (const doc of leadsSnapshot.docs) {
    await doc.ref.delete();
  }
  log.success(`${leadsSnapshot.size} leads dummy eliminados`);

  // Eliminar usuarios dummy
  log.step('Eliminando usuarios dummy...');
  const usersSnapshot = await db.collection('users').where('isDummy', '==', true).get();
  let usersDeleted = 0;
  for (const doc of usersSnapshot.docs) {
    await doc.ref.delete();
    try {
      await auth.deleteUser(doc.id);
    } catch (e) { /* Usuario ya no existe en Auth */ }
    usersDeleted++;
  }
  log.success(`${usersDeleted} usuarios dummy eliminados`);

  // Eliminar proveedores dummy
  log.step('Eliminando proveedores dummy...');
  const providersSnapshot = await db.collection('providers').where('isDummy', '==', true).get();
  let providersDeleted = 0;
  for (const doc of providersSnapshot.docs) {
    await doc.ref.delete();
    try {
      await auth.deleteUser(doc.id);
    } catch (e) { /* Usuario ya no existe en Auth */ }
    providersDeleted++;
  }
  log.success(`${providersDeleted} proveedores dummy eliminados`);
}

// ============================================
// MAIN
// ============================================

async function main() {
  const args = process.argv.slice(2);
  
  const showHelp = args.includes('--help') || args.includes('-h');
  const createAll = args.includes('--all') || args.length === 0 || (args.length === 1 && args[0] === '--clean');
  const onlyProviders = args.includes('--providers');
  const onlyUsers = args.includes('--users');
  const onlyLeads = args.includes('--leads');
  const cleanFirst = args.includes('--clean');

  if (showHelp) {
    console.log(`
${colors.cyan}═══════════════════════════════════════════════════${colors.reset}
${colors.yellow}  Matri.AI - Seed Database${colors.reset}
${colors.cyan}═══════════════════════════════════════════════════${colors.reset}

${colors.green}Uso:${colors.reset}
  node scripts/seed-database.mjs [opciones]

${colors.green}Opciones:${colors.reset}
  --all          Crear todo (default)
  --providers    Solo crear proveedores
  --users        Solo crear usuarios
  --leads        Solo crear leads
  --clean        Limpiar datos de prueba antes
  --help, -h     Mostrar esta ayuda

${colors.green}Ejemplos:${colors.reset}
  node scripts/seed-database.mjs
  node scripts/seed-database.mjs --clean --all
  node scripts/seed-database.mjs --providers
`);
    process.exit(0);
  }

  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.yellow}  Matri.AI - Seed Database${colors.reset}`);
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
    process.exit(1);
  }

  if (getApps().length === 0) {
    initializeApp({ credential: cert(serviceAccount) });
  }

  const auth = getAuth();
  const db = getFirestore();

  // Limpiar si se solicita
  if (cleanFirst) {
    await cleanDatabase(auth, db);
  }

  let providers = [];
  let users = [];

  // Crear proveedores
  if (createAll || onlyProviders) {
    providers = await createProviders(auth, db);
  }

  // Crear usuarios
  if (createAll || onlyUsers) {
    users = await createUsers(auth, db);
  }

  // Crear leads
  if (createAll || onlyLeads) {
    // Si no tenemos los datos en memoria, cargarlos de Firestore
    if (providers.length === 0) {
      const snapshot = await db.collection('providers').get();
      providers = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    }
    if (users.length === 0) {
      const snapshot = await db.collection('users').get();
      users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    }
    
    await createLeads(db, users, providers);
  }

  // Resumen final
  console.log(`\n${colors.green}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}  ¡Base de datos poblada exitosamente!${colors.reset}`);
  console.log(`${colors.green}═══════════════════════════════════════════════════${colors.reset}\n`);

  console.log(`  ${colors.cyan}Proveedores:${colors.reset}  ${providers.length}`);
  console.log(`  ${colors.cyan}Usuarios:${colors.reset}     ${users.length}`);
  console.log(`  ${colors.cyan}Contraseña:${colors.reset}   ${DEFAULT_PASSWORD}`);
  console.log(`  ${colors.cyan}Emails:${colors.reset}       user1@test.matri.ai, provider1@test.matri.ai, etc.`);
  console.log();
  console.log(`  ${colors.yellow}⚠️  DATOS DUMMY - Para eliminar en producción:${colors.reset}`);
  console.log(`  ${colors.cyan}isDummy:${colors.reset}      true`);
  console.log(`  ${colors.cyan}dummyBatch:${colors.reset}   ${DUMMY_BATCH_ID}`);
  console.log();
  console.log(`  ${colors.magenta}Para limpiar:${colors.reset} node scripts/seed-database.mjs --clean`);
  console.log();

  process.exit(0);
}

main().catch((error) => {
  log.error(`Error: ${error.message}`);
  console.error(error);
  process.exit(1);
});

