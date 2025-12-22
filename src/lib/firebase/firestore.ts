import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  orderBy,
  limit,
  deleteDoc,
  arrayUnion,
} from 'firebase/firestore';
import { db } from './config';
import { 
  UserProfile, 
  ProviderProfile, 
  UserProfileData, 
  CategoryId, 
  CategorySurveyStatus,
  CategorySurveyStatusMap,
  CategoryLeadLimitsMap,
  ALL_CATEGORIES,
  PortfolioImage,
} from '@/store/authStore';
import { UserWizardData, ProviderWizardData } from '@/store/wizardStore';

// ============================================
// COLECCIONES
// ============================================

const COLLECTIONS = {
  USERS: 'users',
  PROVIDERS: 'providers',
  LEADS: 'leads',
  USER_CATEGORY_SURVEYS: 'userCategorySurveys',
  PROVIDER_CATEGORY_SURVEYS: 'providerCategorySurveys',
} as const;

// ============================================
// TIPOS PARA LEADS/MATCHES
// ============================================

export type LeadStatus = 'pending' | 'approved' | 'rejected' | 'contacted';

// Criterios de match desglosados
export interface MatchCriteria {
  styleMatch: number;
  budgetMatch: number;
  locationMatch: number;
  availabilityMatch: number;
  specificCriteriaMatch: number;
}

export interface Lead {
  id: string;
  userId: string;
  providerId: string;
  category: CategoryId; // Categoría específica del match
  matchScore: number; // Porcentaje de match
  status: LeadStatus;
  userSurveyId?: string; // Referencia a la encuesta del usuario
  providerSurveyId?: string; // Referencia a la encuesta del proveedor
  matchCriteria?: MatchCriteria; // Desglose del score
  userInfo: {
    coupleNames: string;
    eventDate: string;
    budget: string;
    region: string;
    email: string;
    phone: string;
  };
  providerInfo: {
    providerName: string;
    categories: string[];
    priceRange: string;
    isVerified?: boolean;
  };
  assignedByAdmin?: boolean;
  // Campos para rechazo con justificación
  rejectionReason?: string; // Motivo del rechazo (texto)
  rejectionReasonId?: string; // ID del motivo predefinido
  rejectedAt?: Date; // Fecha de rechazo
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// TIPOS PARA ENCUESTAS POR CATEGORÍA
// ============================================

export interface UserCategorySurvey {
  id: string;
  userId: string;
  category: CategoryId;
  responses: Record<string, string | string[] | number | boolean | undefined>;
  completedAt: Date;
  matchesGenerated: boolean;
}

export interface ProviderCategorySurvey {
  id: string;
  providerId: string;
  category: CategoryId;
  responses: Record<string, string | string[] | number | boolean | undefined>;
  completedAt: Date;
}

// ============================================
// FUNCIONES PARA USUARIOS
// ============================================

/**
 * Obtener perfil de usuario por ID
 * Busca primero en users, luego en providers
 */
export const getUserProfile = async (userId: string): Promise<UserProfileData | null> => {
  try {
    // Buscar en colección de usuarios
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        id: userDoc.id,
        type: 'user',
        ...data,
        // Asegurar que categorySurveyStatus existe
        categorySurveyStatus: data.categorySurveyStatus || initializeCategorySurveyStatus(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as UserProfile;
    }
    
    // Buscar en colección de proveedores
    const providerDoc = await getDoc(doc(db, COLLECTIONS.PROVIDERS, userId));
    
    if (providerDoc.exists()) {
      const data = providerDoc.data();
      const categories = data.categories || [];
      return {
        id: providerDoc.id,
        type: 'provider',
        ...data,
        // Asegurar que los campos de categoría existen
        categorySurveyStatus: data.categorySurveyStatus || initializeProviderCategorySurveyStatus(categories),
        categoryLeadLimits: data.categoryLeadLimits || initializeCategoryLeadLimits(categories),
        categoryLeadsUsed: data.categoryLeadsUsed || initializeCategoryLeadsUsed(categories),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as ProviderProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    throw error;
  }
};

// Inicializar estado de encuestas para todas las categorías (usuarios)
function initializeCategorySurveyStatus(): CategorySurveyStatusMap {
  const status: CategorySurveyStatusMap = {};
  for (const cat of ALL_CATEGORIES) {
    status[cat] = 'not_started';
  }
  return status;
}

// Inicializar estado de encuestas para categorías del proveedor
function initializeProviderCategorySurveyStatus(categories: string[]): CategorySurveyStatusMap {
  const status: CategorySurveyStatusMap = {};
  for (const cat of categories) {
    status[cat as CategoryId] = 'not_started';
  }
  return status;
}

// Inicializar límites de leads por categoría
function initializeCategoryLeadLimits(categories: string[]): CategoryLeadLimitsMap {
  const limits: CategoryLeadLimitsMap = {};
  for (const cat of categories) {
    limits[cat as CategoryId] = DEFAULT_LEAD_LIMIT;
  }
  return limits;
}

// Inicializar leads usados por categoría
function initializeCategoryLeadsUsed(categories: string[]): CategoryLeadLimitsMap {
  const used: CategoryLeadLimitsMap = {};
  for (const cat of categories) {
    used[cat as CategoryId] = 0;
  }
  return used;
}

/**
 * Crear perfil de usuario (novios)
 */
export const createUserProfile = async (
  userId: string,
  userData: UserWizardData
): Promise<UserProfile> => {
  try {
    const now = Timestamp.now();
    
    // Inicializar estado de encuestas por categoría
    const categorySurveyStatus = initializeCategorySurveyStatus();
    
    const profileData = {
      email: userData.email,
      coupleNames: userData.coupleNames,
      phone: userData.phone,
      eventDate: userData.eventDate,
      isDateTentative: userData.isDateTentative,
      budget: userData.budget, // Campo legacy
      budgetAmount: userData.budgetAmount || 0, // Nuevo campo numérico en CLP
      guestCount: userData.guestCount,
      region: userData.region,
      ceremonyTypes: userData.ceremonyTypes,
      eventStyle: userData.eventStyle,
      planningProgress: userData.planningProgress,
      completedItems: userData.completedItems,
      priorityCategories: userData.priorityCategories,
      involvementLevel: userData.involvementLevel,
      expectations: userData.expectations,
      categorySurveyStatus, // Estado de encuestas por categoría
      createdAt: now,
      updatedAt: now,
    };
    
    await setDoc(doc(db, COLLECTIONS.USERS, userId), profileData);
    
    return {
      id: userId,
      type: 'user',
      ...profileData,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    };
  } catch (error) {
    console.error('Error al crear perfil de usuario:', error);
    throw error;
  }
};

// Constantes del sistema de leads
export const DEFAULT_LEAD_LIMIT = 10; // Límite por defecto de leads por categoría

/**
 * Crear perfil de proveedor
 */
export const createProviderProfile = async (
  userId: string,
  providerData: ProviderWizardData
): Promise<ProviderProfile> => {
  try {
    const now = Timestamp.now();
    const categories = providerData.categories as CategoryId[];
    
    // Inicializar campos por categoría
    const categoryLeadLimits = initializeCategoryLeadLimits(categories);
    const categoryLeadsUsed = initializeCategoryLeadsUsed(categories);
    const categorySurveyStatus = initializeProviderCategorySurveyStatus(categories);
    
    const profileData = {
      email: providerData.email,
      providerName: providerData.providerName,
      phone: providerData.phone,
      categories: categories, // Usar la variable ya casteada a CategoryId[]
      serviceStyle: providerData.serviceStyle,
      priceRange: providerData.priceRange, // Campo legacy
      priceMin: providerData.priceMin || 0, // Nuevo: precio mínimo en CLP
      priceMax: providerData.priceMax || 0, // Nuevo: precio máximo en CLP
      workRegion: providerData.workRegion,
      acceptsOutsideZone: providerData.acceptsOutsideZone,
      description: providerData.description,
      website: providerData.website,
      instagram: providerData.instagram,
      facebook: providerData.facebook,
      tiktok: providerData.tiktok,
      portfolioImages: [] as PortfolioImage[], // Portafolio vacío, se gestiona desde el dashboard
      status: 'active' as const, // Los proveedores empiezan como activos por defecto
      isVerified: false, // Los proveedores nuevos no están verificados (solo super admin puede cambiar)
      // Sistema de leads POR CATEGORÍA
      categoryLeadLimits,
      categoryLeadsUsed,
      categorySurveyStatus,
      // Campos legacy para compatibilidad
      leadLimit: DEFAULT_LEAD_LIMIT,
      leadsUsed: 0,
      createdAt: now,
      updatedAt: now,
    };
    
    await setDoc(doc(db, COLLECTIONS.PROVIDERS, userId), profileData);
    
    return {
      id: userId,
      type: 'provider',
      ...profileData,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    };
  } catch (error) {
    console.error('Error al crear perfil de proveedor:', error);
    throw error;
  }
};

/**
 * Obtener perfil de proveedor por ID
 * Función específica para obtener solo perfiles de proveedor
 */
export const getProviderProfile = async (providerId: string): Promise<ProviderProfile | null> => {
  try {
    const providerDoc = await getDoc(doc(db, COLLECTIONS.PROVIDERS, providerId));
    
    if (providerDoc.exists()) {
      const data = providerDoc.data();
      const categories = data.categories || [];
      return {
        id: providerDoc.id,
        type: 'provider',
        ...data,
        // Asegurar que los campos de categoría existen
        categorySurveyStatus: data.categorySurveyStatus || initializeProviderCategorySurveyStatus(categories),
        categoryLeadLimits: data.categoryLeadLimits || initializeCategoryLeadLimits(categories),
        categoryLeadsUsed: data.categoryLeadsUsed || initializeCategoryLeadsUsed(categories),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as ProviderProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener perfil de proveedor:', error);
    throw error;
  }
};

/**
 * Actualizar perfil de usuario
 */
export const updateUserProfile = async (
  userId: string,
  data: Partial<UserProfile>
): Promise<void> => {
  try {
    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
    };
    
    // Eliminar campos que no deben actualizarse
    delete updateData.id;
    delete updateData.type;
    delete updateData.createdAt;
    
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), updateData);
  } catch (error) {
    console.error('Error al actualizar perfil de usuario:', error);
    throw error;
  }
};

/**
 * Actualizar perfil de proveedor
 */
export const updateProviderProfile = async (
  userId: string,
  data: Partial<ProviderProfile>
): Promise<void> => {
  try {
    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
    };
    
    // Eliminar campos que no deben actualizarse
    delete updateData.id;
    delete updateData.type;
    delete updateData.createdAt;
    
    await updateDoc(doc(db, COLLECTIONS.PROVIDERS, userId), updateData);
  } catch (error) {
    console.error('Error al actualizar perfil de proveedor:', error);
    throw error;
  }
};

/**
 * Actualizar las imágenes del portafolio del proveedor
 * Se usa principalmente para reordenar las imágenes
 */
export const updateProviderPortfolioImages = async (
  userId: string,
  images: PortfolioImage[]
): Promise<void> => {
  try {
    await updateDoc(doc(db, COLLECTIONS.PROVIDERS, userId), {
      portfolioImages: images,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error al actualizar portafolio del proveedor:', error);
    throw error;
  }
};

// ============================================
// FUNCIONES PARA ENCUESTAS POR CATEGORÍA
// ============================================

/**
 * Guardar encuesta de usuario por categoría
 */
export const saveUserCategorySurvey = async (
  userId: string,
  category: CategoryId,
  responses: Record<string, string | string[] | number | boolean | undefined>
): Promise<UserCategorySurvey> => {
  try {
    const now = Timestamp.now();
    
    // Verificar si ya existe una encuesta para esta categoría
    const existingQuery = query(
      collection(db, COLLECTIONS.USER_CATEGORY_SURVEYS),
      where('userId', '==', userId),
      where('category', '==', category)
    );
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      // Actualizar encuesta existente
      const existingDoc = existingSnapshot.docs[0];
      await updateDoc(existingDoc.ref, {
        responses,
        completedAt: now,
        matchesGenerated: false, // Reset para regenerar matches
      });
      
      return {
        id: existingDoc.id,
        userId,
        category,
        responses,
        completedAt: now.toDate(),
        matchesGenerated: false,
      };
    }
    
    // Crear nueva encuesta
    const surveyData = {
      userId,
      category,
      responses,
      completedAt: now,
      matchesGenerated: false,
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.USER_CATEGORY_SURVEYS), surveyData);
    
    // Actualizar estado de encuesta del usuario Y agregar la categoría a priorityCategories
    // Esto asegura que el contador de encuestas X/Y esté siempre correcto
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
      [`categorySurveyStatus.${category}`]: 'completed' as CategorySurveyStatus,
      // Agregar categoría a priorityCategories si no existe (usando arrayUnion para evitar duplicados)
      priorityCategories: arrayUnion(category),
      updatedAt: now,
    });
    
    return {
      id: docRef.id,
      ...surveyData,
      completedAt: now.toDate(),
    };
  } catch (error) {
    console.error('Error al guardar encuesta de usuario:', error);
    throw error;
  }
};

/**
 * Guardar encuesta de proveedor por categoría
 */
export const saveProviderCategorySurvey = async (
  providerId: string,
  category: CategoryId,
  responses: Record<string, string | string[] | number | boolean | undefined>
): Promise<ProviderCategorySurvey> => {
  try {
    const now = Timestamp.now();
    
    // Verificar si ya existe una encuesta para esta categoría
    const existingQuery = query(
      collection(db, COLLECTIONS.PROVIDER_CATEGORY_SURVEYS),
      where('providerId', '==', providerId),
      where('category', '==', category)
    );
    const existingSnapshot = await getDocs(existingQuery);
    
    let surveyId: string;
    
    if (!existingSnapshot.empty) {
      // Actualizar encuesta existente
      const existingDoc = existingSnapshot.docs[0];
      await updateDoc(existingDoc.ref, {
        responses,
        completedAt: now,
      });
      surveyId = existingDoc.id;
    } else {
      // Crear nueva encuesta
      const surveyData = {
        providerId,
        category,
        responses,
        completedAt: now,
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.PROVIDER_CATEGORY_SURVEYS), surveyData);
      surveyId = docRef.id;
    }
    
    // SIEMPRE actualizar estado de encuesta del proveedor (tanto para nueva como actualizada)
    // Esto asegura que el status esté correcto incluso si hubo inconsistencias previas
    await updateDoc(doc(db, COLLECTIONS.PROVIDERS, providerId), {
      [`categorySurveyStatus.${category}`]: 'completed' as CategorySurveyStatus,
      updatedAt: now,
    });
    
    console.log(`✓ Encuesta de proveedor guardada: ${providerId} - ${category} (status: completed)`);
    
    return {
      id: surveyId,
      providerId,
      category,
      responses,
      completedAt: now.toDate(),
    };
  } catch (error) {
    console.error('Error al guardar encuesta de proveedor:', error);
    throw error;
  }
};

/**
 * Obtener encuesta de usuario por categoría
 * NOTA: Esta función hace una query, solo puede ser usada por el propio usuario o admins
 */
export const getUserCategorySurvey = async (
  userId: string,
  category: CategoryId
): Promise<UserCategorySurvey | null> => {
  try {
    const surveyQuery = query(
      collection(db, COLLECTIONS.USER_CATEGORY_SURVEYS),
      where('userId', '==', userId),
      where('category', '==', category)
    );
    
    const snapshot = await getDocs(surveyQuery);
    
    if (snapshot.empty) return null;
    
    const docSnap = snapshot.docs[0];
    const data = docSnap.data();
    
    return {
      id: docSnap.id,
      userId: data.userId,
      category: data.category,
      responses: data.responses,
      completedAt: data.completedAt?.toDate() || new Date(),
      matchesGenerated: data.matchesGenerated || false,
    };
  } catch (error) {
    console.error('Error al obtener encuesta de usuario:', error);
    throw error;
  }
};

/**
 * Obtener encuesta de usuario por ID directo
 * Esta función es segura para proveedores que tienen el ID de la encuesta desde el lead
 * No hace queries, solo accede al documento específico
 */
export const getUserCategorySurveyById = async (
  surveyId: string
): Promise<UserCategorySurvey | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.USER_CATEGORY_SURVEYS, surveyId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    const data = docSnap.data();
    
    return {
      id: docSnap.id,
      userId: data.userId,
      category: data.category,
      responses: data.responses,
      completedAt: data.completedAt?.toDate() || new Date(),
      matchesGenerated: data.matchesGenerated || false,
    };
  } catch (error) {
    console.error('Error al obtener encuesta de usuario por ID:', error);
    throw error;
  }
};

/**
 * Obtener encuesta de proveedor por categoría
 */
export const getProviderCategorySurvey = async (
  providerId: string,
  category: CategoryId
): Promise<ProviderCategorySurvey | null> => {
  try {
    const surveyQuery = query(
      collection(db, COLLECTIONS.PROVIDER_CATEGORY_SURVEYS),
      where('providerId', '==', providerId),
      where('category', '==', category)
    );
    
    const snapshot = await getDocs(surveyQuery);
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      providerId: data.providerId,
      category: data.category,
      responses: data.responses,
      completedAt: data.completedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error al obtener encuesta de proveedor:', error);
    throw error;
  }
};

/**
 * Obtener todas las encuestas completadas de un usuario
 */
export const getAllUserCategorySurveys = async (userId: string): Promise<UserCategorySurvey[]> => {
  try {
    const surveyQuery = query(
      collection(db, COLLECTIONS.USER_CATEGORY_SURVEYS),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(surveyQuery);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        category: data.category,
        responses: data.responses,
        completedAt: data.completedAt?.toDate() || new Date(),
        matchesGenerated: data.matchesGenerated || false,
      };
    });
  } catch (error) {
    console.error('Error al obtener encuestas de usuario:', error);
    throw error;
  }
};

/**
 * Obtener todas las encuestas completadas de un proveedor
 */
export const getAllProviderCategorySurveys = async (providerId: string): Promise<ProviderCategorySurvey[]> => {
  try {
    const surveyQuery = query(
      collection(db, COLLECTIONS.PROVIDER_CATEGORY_SURVEYS),
      where('providerId', '==', providerId)
    );
    
    const snapshot = await getDocs(surveyQuery);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        providerId: data.providerId,
        category: data.category,
        responses: data.responses,
        completedAt: data.completedAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error('Error al obtener encuestas de proveedor:', error);
    throw error;
  }
};

// ============================================
// FUNCIONES PARA LEADS/MATCHES
// ============================================

/**
 * Crear un nuevo lead para una categoría específica
 * CRÍTICO: Esta función valida créditos y previene créditos negativos
 * IMPORTANTE: Siempre re-valida los créditos con datos frescos de Firestore
 */
export const createCategoryLead = async (
  userId: string,
  providerId: string,
  category: CategoryId,
  matchScore: number,
  userInfo: Lead['userInfo'],
  providerInfo: Lead['providerInfo'],
  matchCriteria?: MatchCriteria,
  userSurveyId?: string,
  providerSurveyId?: string
): Promise<Lead> => {
  console.log(`\n📝 ========== CREANDO LEAD ==========`);
  console.log(`📌 Usuario: ${userId}`);
  console.log(`📌 Proveedor: ${providerId}`);
  console.log(`📌 Categoría: ${category}`);
  
  try {
    // VALIDACIÓN CRÍTICA: Siempre obtener datos FRESCOS del proveedor
    const providerDoc = await getDoc(doc(db, COLLECTIONS.PROVIDERS, providerId));
    if (!providerDoc.exists()) {
      throw new Error(`Proveedor ${providerId} no encontrado`);
    }
    
    const providerData = providerDoc.data();
    const providerName = providerData.providerName || providerId;
    
    // Obtener límites y uso actual - usar campos GLOBALES (no por categoría)
    const leadLimit = providerData.leadLimit ?? DEFAULT_LEAD_LIMIT;
    const leadsUsed = providerData.leadsUsed ?? 0;
    
    // Calcular créditos disponibles
    const creditsAvailable = leadLimit - leadsUsed;
    
    console.log(`📊 Estado de créditos de ${providerName}:`);
    console.log(`   - Límite para ${category}: ${leadLimit}`);
    console.log(`   - Usados en ${category}: ${leadsUsed}`);
    console.log(`   - Disponibles: ${creditsAvailable}`);
    
    // BLOQUEO ABSOLUTO: Si no hay créditos, NO crear el lead bajo ninguna circunstancia
    if (creditsAvailable <= 0) {
      console.error(`\n🚫🚫🚫 BLOQUEO ABSOLUTO 🚫🚫🚫`);
      console.error(`Proveedor: ${providerName} (${providerId})`);
      console.error(`Categoría: ${category}`);
      console.error(`Créditos disponibles: ${creditsAvailable} (${leadsUsed}/${leadLimit})`);
      console.error(`NO SE PUEDE CREAR EL LEAD`);
      throw new Error(`BLOQUEO: ${providerName} no tiene créditos disponibles para ${category} (${leadsUsed}/${leadLimit})`);
    }
    
    // Segunda verificación por si acaso
    if (leadsUsed >= leadLimit) {
      console.error(`\n🚫🚫🚫 BLOQUEO POR LÍMITE ALCANZADO 🚫🚫🚫`);
      console.error(`Proveedor: ${providerName} (${providerId})`);
      console.error(`leadsUsed (${leadsUsed}) >= leadLimit (${leadLimit})`);
      throw new Error(`BLOQUEO: ${providerName} ha alcanzado su límite de leads (${leadsUsed}/${leadLimit})`);
    }
    
    console.log(`✅ Créditos OK para ${providerName}: ${creditsAvailable} disponibles`);
    
    const now = Timestamp.now();
    
    // Construir objeto base sin campos undefined (Firebase no acepta undefined)
    const leadData: Record<string, unknown> = {
      userId,
      providerId,
      category,
      matchScore,
      status: 'pending' as LeadStatus,
      userInfo,
      providerInfo,
      matchCriteria: matchCriteria || {
        styleMatch: 0,
        budgetMatch: 0,
        locationMatch: 0,
        availabilityMatch: 0,
        specificCriteriaMatch: 0,
      },
      assignedByAdmin: false,
      createdAt: now,
      updatedAt: now,
    };
    
    // Solo agregar campos opcionales si tienen valor
    if (userSurveyId) {
      leadData.userSurveyId = userSurveyId;
    }
    if (providerSurveyId) {
      leadData.providerSurveyId = providerSurveyId;
    }
    
    const docRef = await addDoc(collection(db, COLLECTIONS.LEADS), leadData);
    
    // Actualizar leadsUsed del proveedor (campo global)
    const newLeadsUsed = leadsUsed + 1;
    
    await updateDoc(doc(db, COLLECTIONS.PROVIDERS, providerId), {
      leadsUsed: newLeadsUsed,
      updatedAt: now,
    });
    
    console.log(`📊 Actualizado créditos proveedor ${providerId}: ${newLeadsUsed}/${leadLimit}`);
    
    return {
      id: docRef.id,
      ...leadData,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    } as Lead;
  } catch (error) {
    console.error('Error al crear lead:', error);
    throw error;
  }
};

// Helper para obtener leads usados por categoría
async function getProviderCategoryLeadsUsed(providerId: string, category: CategoryId): Promise<number> {
  const providerDoc = await getDoc(doc(db, COLLECTIONS.PROVIDERS, providerId));
  if (!providerDoc.exists()) return 0;
  return providerDoc.data().categoryLeadsUsed?.[category] || 0;
}

// Helper para obtener total de leads usados
async function getProviderTotalLeadsUsed(providerId: string): Promise<number> {
  const providerDoc = await getDoc(doc(db, COLLECTIONS.PROVIDERS, providerId));
  if (!providerDoc.exists()) return 0;
  return providerDoc.data().leadsUsed || 0;
}

/**
 * Crear un nuevo lead (función legacy para compatibilidad)
 */
export const createLead = async (
  userId: string,
  providerId: string,
  category: string,
  matchScore: number,
  userInfo: Lead['userInfo'],
  providerInfo: Lead['providerInfo']
): Promise<Lead> => {
  return createCategoryLead(
    userId, 
    providerId, 
    category as CategoryId, 
    matchScore, 
    userInfo, 
    providerInfo
  );
};

/**
 * Obtener leads de un usuario
 */
export const getUserLeads = async (userId: string): Promise<Lead[]> => {
  try {
    const leadsQuery = query(
      collection(db, COLLECTIONS.LEADS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(leadsQuery);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Lead;
    });
  } catch (error) {
    console.error('Error al obtener leads del usuario:', error);
    throw error;
  }
};

/**
 * Obtener leads de un usuario por categoría específica
 */
export const getUserLeadsByCategory = async (userId: string, category: CategoryId): Promise<Lead[]> => {
  try {
    const leadsQuery = query(
      collection(db, COLLECTIONS.LEADS),
      where('userId', '==', userId),
      where('category', '==', category),
      orderBy('matchScore', 'desc')
    );
    
    const snapshot = await getDocs(leadsQuery);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Lead;
    });
  } catch (error) {
    console.error('Error al obtener leads del usuario por categoría:', error);
    throw error;
  }
};

/**
 * Obtener leads de un proveedor
 */
export const getProviderLeads = async (providerId: string): Promise<Lead[]> => {
  try {
    const leadsQuery = query(
      collection(db, COLLECTIONS.LEADS),
      where('providerId', '==', providerId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(leadsQuery);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Lead;
    });
  } catch (error) {
    console.error('Error al obtener leads del proveedor:', error);
    throw error;
  }
};

/**
 * Obtener leads de un proveedor por categoría específica
 */
export const getProviderLeadsByCategory = async (providerId: string, category: CategoryId): Promise<Lead[]> => {
  try {
    const leadsQuery = query(
      collection(db, COLLECTIONS.LEADS),
      where('providerId', '==', providerId),
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(leadsQuery);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Lead;
    });
  } catch (error) {
    console.error('Error al obtener leads del proveedor por categoría:', error);
    throw error;
  }
};

/**
 * Actualizar estado de un lead
 * CRÍTICO: Maneja créditos correctamente cuando se recupera un lead rechazado
 * - rejected → pending: Volver a consumir crédito (fue restaurado al rechazar)
 * - approved → pending: No cambiar créditos (nunca se restauraron)
 */
export const updateLeadStatus = async (
  leadId: string,
  status: LeadStatus
): Promise<void> => {
  try {
    const now = Timestamp.now();
    
    // Obtener el lead para saber el estado anterior, providerId y categoría
    const leadDoc = await getDoc(doc(db, COLLECTIONS.LEADS, leadId));
    if (!leadDoc.exists()) {
      throw new Error('Lead no encontrado');
    }
    
    const leadData = leadDoc.data();
    const previousStatus = leadData.status as LeadStatus;
    const providerId = leadData.providerId;
    const category = leadData.category as CategoryId;
    
    // Actualizar el lead
    await updateDoc(doc(db, COLLECTIONS.LEADS, leadId), {
      status,
      updatedAt: now,
    });
    
    // CRÍTICO: Si se recupera un lead rechazado (rejected → pending),
    // debemos volver a consumir el crédito porque fue restaurado al rechazar
    if (previousStatus === 'rejected' && status === 'pending') {
      const providerRef = doc(db, COLLECTIONS.PROVIDERS, providerId);
      const providerSnap = await getDoc(providerRef);
      
      if (providerSnap.exists()) {
        const providerData = providerSnap.data();
        const currentLeadsUsed = providerData.leadsUsed ?? 0;
        const leadLimit = providerData.leadLimit ?? DEFAULT_LEAD_LIMIT;
        
        // Verificar que hay créditos disponibles antes de consumir
        const creditsAvailable = leadLimit - currentLeadsUsed;
        
        if (creditsAvailable > 0) {
          // Consumir el crédito de nuevo
          const newLeadsUsed = currentLeadsUsed + 1;
          
          await updateDoc(providerRef, {
            leadsUsed: newLeadsUsed,
            updatedAt: now,
          });
          
          console.log(`💰 Crédito consumido al recuperar lead (${currentLeadsUsed} → ${newLeadsUsed})`);
        } else {
          console.log(`⚠️ Proveedor ${providerId} sin créditos disponibles al recuperar lead, pero lead recuperado igual`);
        }
      }
    }
    // Para otros cambios de estado (approved → pending), no modificamos créditos
    
  } catch (error) {
    console.error('Error al actualizar estado del lead:', error);
    throw error;
  }
};

/**
 * Rechazar un lead con justificación
 * CAMBIO: Solo actualiza métricas si es la primera decisión del usuario para este lead
 * Si el usuario cambia de opinión (aprobado -> rechazado), decrementamos "me interesa" e incrementamos "no me interesa"
 * CRÍTICO: Cuando se rechaza desde 'pending', se restauran los créditos del proveedor
 */
export const rejectLeadWithReason = async (
  leadId: string,
  reason: string,
  reasonId: string
): Promise<void> => {
  try {
    const now = Timestamp.now();
    
    // Obtener el lead para saber el providerId, categoría y estado anterior
    const leadDoc = await getDoc(doc(db, COLLECTIONS.LEADS, leadId));
    if (!leadDoc.exists()) {
      throw new Error('Lead no encontrado');
    }
    
    const leadData = leadDoc.data();
    const providerId = leadData.providerId;
    const category = leadData.category as CategoryId;
    const previousStatus = leadData.status as LeadStatus;
    
    // Actualizar el lead con el motivo de rechazo
    await updateDoc(doc(db, COLLECTIONS.LEADS, leadId), {
      status: 'rejected' as LeadStatus,
      rejectionReason: reason,
      rejectionReasonId: reasonId,
      rejectedAt: now,
      updatedAt: now,
    });
    
    // CRÍTICO: Si se rechaza desde 'pending', restaurar el crédito del proveedor
    // El usuario no mostró interés, así que el proveedor no debería "pagar" por este lead
    if (previousStatus === 'pending') {
      // Obtener datos actuales del proveedor para restaurar créditos
      const providerRef = doc(db, COLLECTIONS.PROVIDERS, providerId);
      const providerSnap = await getDoc(providerRef);
      
      if (providerSnap.exists()) {
        const providerData = providerSnap.data();
        const currentLeadsUsed = providerData.leadsUsed ?? 0;
        
        // Decrementar (restaurar crédito), pero nunca ir a negativo
        const newLeadsUsed = Math.max(0, currentLeadsUsed - 1);
        
        await updateDoc(providerRef, {
          leadsUsed: newLeadsUsed,
          updatedAt: now,
        });
        
        console.log(`💰 Crédito restaurado a proveedor ${providerId} (${currentLeadsUsed} → ${newLeadsUsed})`);
      }
      
      // Incrementar métrica de "no me interesa"
      await incrementProviderMetric(providerId, 'timesNotInterested');
      console.log(`✓ Lead ${leadId} rechazado (primera decisión) con motivo: ${reason}`);
    } else if (previousStatus === 'approved') {
      // Si estaba aprobado y ahora se rechaza:
      // - NO restauramos créditos (el lead ya fue "consumido" cuando el usuario mostró interés)
      // - Ajustamos métricas
      await decrementProviderMetric(providerId, 'timesInterested');
      await incrementProviderMetric(providerId, 'timesNotInterested');
      console.log(`✓ Lead ${leadId} cambió de aprobado a rechazado - métricas ajustadas (créditos NO restaurados)`);
    }
    // Si ya estaba rechazado, no hacemos nada
  } catch (error) {
    console.error('Error al rechazar lead:', error);
    throw error;
  }
};

/**
 * Aprobar un lead (marcar como interesado)
 * CAMBIO: Solo actualiza métricas si es la primera decisión del usuario para este lead
 * Si el usuario cambia de opinión (rechazado -> aprobado), decrementamos "no me interesa" e incrementamos "me interesa"
 * CRÍTICO: Si se aprueba desde 'rejected', se vuelve a consumir el crédito (fue restaurado al rechazar)
 * 
 * NUEVO: Envía email de notificación al proveedor (solo 1 por usuario/proveedor/categoría)
 */
export const approveLeadWithMetrics = async (leadId: string): Promise<void> => {
  try {
    const now = Timestamp.now();
    
    // Obtener el lead para saber el providerId, categoría y estado anterior
    const leadDoc = await getDoc(doc(db, COLLECTIONS.LEADS, leadId));
    if (!leadDoc.exists()) {
      throw new Error('Lead no encontrado');
    }
    
    const leadData = leadDoc.data();
    const providerId = leadData.providerId;
    const category = leadData.category as CategoryId;
    const previousStatus = leadData.status as LeadStatus;
    
    // Actualizar el lead
    await updateDoc(doc(db, COLLECTIONS.LEADS, leadId), {
      status: 'approved' as LeadStatus,
      updatedAt: now,
    });
    
    // CRÍTICO: Si se aprueba desde 'rejected', volver a consumir el crédito
    // porque el crédito fue restaurado cuando se rechazó
    if (previousStatus === 'rejected') {
      // Obtener datos del proveedor para verificar límites
      const providerRef = doc(db, COLLECTIONS.PROVIDERS, providerId);
      const providerSnap = await getDoc(providerRef);
      
      if (providerSnap.exists()) {
        const providerData = providerSnap.data();
        const currentLeadsUsed = providerData.leadsUsed ?? 0;
        const leadLimit = providerData.leadLimit ?? DEFAULT_LEAD_LIMIT;
        
        // Verificar que aún hay créditos disponibles
        const creditsAvailable = leadLimit - currentLeadsUsed;
        
        if (creditsAvailable > 0) {
          // Consumir el crédito de nuevo
          const newLeadsUsed = currentLeadsUsed + 1;
          
          await updateDoc(providerRef, {
            leadsUsed: newLeadsUsed,
            updatedAt: now,
          });
          
          console.log(`💰 Crédito consumido para proveedor ${providerId} (${currentLeadsUsed} → ${newLeadsUsed})`);
        } else {
          console.log(`⚠️ Proveedor ${providerId} sin créditos disponibles, pero lead aprobado igual`);
        }
      }
      
      // Ajustar métricas
      await decrementProviderMetric(providerId, 'timesNotInterested');
      await incrementProviderMetric(providerId, 'timesInterested');
      console.log(`✓ Lead ${leadId} cambió de rechazado a aprobado - métricas ajustadas`);
    } else if (previousStatus === 'pending') {
      // Primera decisión - el crédito ya fue consumido al crear el lead, solo ajustar métricas
      await incrementProviderMetric(providerId, 'timesInterested');
      console.log(`✓ Lead ${leadId} aprobado (primera decisión)`);
    }
    // Si ya estaba aprobado, no hacemos nada
    
    // NUEVO: Enviar email de notificación al proveedor via API (en background, no bloquea)
    // Solo se envía UN email por usuario/proveedor/categoría (la API maneja la lógica de duplicados)
    // IMPORTANTE: Usamos fetch a la API porque el email se envía desde el servidor (necesita RESEND_KEY)
    try {
      // Llamar a la API de envío de email de forma asíncrona
      // No esperamos el resultado para no bloquear la UI
      fetch('/api/send-interest-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leadId }),
      }).then(async (response) => {
        const result = await response.json();
        if (result.success) {
          if (result.alreadySent) {
            console.log(`📧 Email no enviado (ya enviado previamente)`);
          } else {
            console.log(`📧 Email de notificación enviado al proveedor ${providerId}`);
          }
        } else {
          console.error('Error en API de email:', result.error);
        }
      }).catch((fetchError) => {
        // No bloqueamos el flujo principal si falla el email
        console.error('Error llamando API de email:', fetchError);
      });
      
    } catch (emailError) {
      // No bloqueamos el flujo principal si falla el email
      console.error('Error preparando llamada a API de email:', emailError);
    }
  } catch (error) {
    console.error('Error al aprobar lead:', error);
    throw error;
  }
};

// ============================================
// MÉTRICAS DE PROVEEDORES
// ============================================

export interface ProviderMetrics {
  timesOffered: number;      // Veces que apareció como match
  timesInterested: number;   // Veces que marcaron "Me interesa"
  timesNotInterested: number; // Veces que marcaron "No me interesa"
}

/**
 * Incrementar una métrica específica del proveedor
 */
export const incrementProviderMetric = async (
  providerId: string,
  metric: keyof ProviderMetrics
): Promise<void> => {
  try {
    const providerRef = doc(db, COLLECTIONS.PROVIDERS, providerId);
    const providerDoc = await getDoc(providerRef);
    
    if (!providerDoc.exists()) {
      console.warn(`Proveedor ${providerId} no encontrado para actualizar métricas`);
      return;
    }
    
    const data = providerDoc.data();
    const currentMetrics: ProviderMetrics = data.metrics || {
      timesOffered: 0,
      timesInterested: 0,
      timesNotInterested: 0,
    };
    
    // Incrementar la métrica específica
    currentMetrics[metric] = (currentMetrics[metric] || 0) + 1;
    
    await updateDoc(providerRef, {
      metrics: currentMetrics,
      updatedAt: Timestamp.now(),
    });
    
    console.log(`✓ Métrica ${metric} incrementada para proveedor ${providerId}`);
  } catch (error) {
    console.error('Error al incrementar métrica:', error);
    // No lanzamos el error para no bloquear la operación principal
  }
};

/**
 * Decrementar una métrica específica del proveedor
 * NUEVO: Necesario para ajustar métricas cuando el usuario cambia de opinión
 */
export const decrementProviderMetric = async (
  providerId: string,
  metric: keyof ProviderMetrics
): Promise<void> => {
  try {
    const providerRef = doc(db, COLLECTIONS.PROVIDERS, providerId);
    const providerDoc = await getDoc(providerRef);
    
    if (!providerDoc.exists()) {
      console.warn(`Proveedor ${providerId} no encontrado para actualizar métricas`);
      return;
    }
    
    const data = providerDoc.data();
    const currentMetrics: ProviderMetrics = data.metrics || {
      timesOffered: 0,
      timesInterested: 0,
      timesNotInterested: 0,
    };
    
    // Decrementar la métrica específica (mínimo 0)
    currentMetrics[metric] = Math.max(0, (currentMetrics[metric] || 0) - 1);
    
    await updateDoc(providerRef, {
      metrics: currentMetrics,
      updatedAt: Timestamp.now(),
    });
    
    console.log(`✓ Métrica ${metric} decrementada para proveedor ${providerId}`);
  } catch (error) {
    console.error('Error al decrementar métrica:', error);
    // No lanzamos el error para no bloquear la operación principal
  }
};

/**
 * Incrementar timesOffered para un proveedor cuando aparece como match
 */
export const incrementTimesOffered = async (providerId: string): Promise<void> => {
  await incrementProviderMetric(providerId, 'timesOffered');
};

/**
 * Marcar encuesta de usuario como con matches generados
 */
export const markUserSurveyMatchesGenerated = async (
  userId: string,
  category: CategoryId
): Promise<void> => {
  try {
    // Encontrar la encuesta
    const surveyQuery = query(
      collection(db, COLLECTIONS.USER_CATEGORY_SURVEYS),
      where('userId', '==', userId),
      where('category', '==', category)
    );
    
    const snapshot = await getDocs(surveyQuery);
    
    if (!snapshot.empty) {
      await updateDoc(snapshot.docs[0].ref, {
        matchesGenerated: true,
      });
    }
    
    // Actualizar estado en el perfil del usuario
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
      [`categorySurveyStatus.${category}`]: 'matches_generated' as CategorySurveyStatus,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error al marcar encuesta con matches generados:', error);
    throw error;
  }
};

/**
 * Obtener proveedores por categoría y región (para matchmaking)
 */
export const getProvidersByFilters = async (
  categories: string[],
  region: string,
  limitCount: number = 10
): Promise<ProviderProfile[]> => {
  try {
    // Nota: Firestore no soporta array-contains con múltiples valores
    // Por ahora, buscamos por la primera categoría
    const firstCategory = categories[0];
    
    if (!firstCategory) {
      return [];
    }
    
    const providersQuery = query(
      collection(db, COLLECTIONS.PROVIDERS),
      where('categories', 'array-contains', firstCategory),
      where('status', '==', 'active'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(providersQuery);
    
    let providers = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        type: 'provider' as const,
        ...data,
        categorySurveyStatus: data.categorySurveyStatus || {},
        categoryLeadLimits: data.categoryLeadLimits || {},
        categoryLeadsUsed: data.categoryLeadsUsed || {},
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as ProviderProfile;
    });
    
    // Filtrar por región (o que acepten fuera de zona)
    providers = providers.filter(
      (p) => p.workRegion === region || p.acceptsOutsideZone
    );
    
    return providers;
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    throw error;
  }
};

/**
 * Verificar si un proveedor está disponible para una fecha específica
 * NUEVO: Función auxiliar para validar disponibilidad del proveedor
 */
const isProviderAvailableOnDate = (
  provider: ProviderProfile,
  eventDate: string | null,
  isDateTentative: boolean
): boolean => {
  // Si la fecha es tentativa, NO validamos disponibilidad (no es criterio de exclusión)
  if (isDateTentative || !eventDate) {
    return true;
  }
  
  // Si el proveedor no tiene fechas bloqueadas, está disponible
  if (!provider.blockedDates || provider.blockedDates.length === 0) {
    return true;
  }
  
  // Convertir la fecha del evento al formato YYYY-MM-DD para comparar
  try {
    const eventDateFormatted = new Date(eventDate).toISOString().split('T')[0];
    
    // Verificar si la fecha del evento está bloqueada
    const isBlocked = provider.blockedDates.includes(eventDateFormatted);
    
    if (isBlocked) {
      console.log(`  ⚠️ Proveedor ${provider.providerName} no disponible en fecha ${eventDateFormatted}`);
    }
    
    return !isBlocked;
  } catch (error) {
    // Si hay error parseando la fecha, permitimos el match
    console.warn('Error parseando fecha del evento:', error);
    return true;
  }
};

/**
 * Obtener proveedores disponibles para matchmaking en una categoría específica
 * Solo retorna proveedores que:
 * 1. Ofrecen esa categoría (en su array 'categories')
 * 2. Están activos
 * 3. Tienen leads disponibles para esa categoría
 * 4. Han completado su encuesta para esa categoría
 * 5. NUEVO: Están disponibles en la fecha del evento (si no es tentativa)
 */
export const getAvailableProvidersForCategory = async (
  category: CategoryId,
  region: string,
  limitCount: number = 10,
  eventDate: string | null = null,
  isDateTentative: boolean = true
): Promise<ProviderProfile[]> => {
  try {
    console.log(`🔍 Buscando proveedores para categoría: ${category}, región: ${region}`);
    
    const providersQuery = query(
      collection(db, COLLECTIONS.PROVIDERS),
      where('categories', 'array-contains', category),
      where('status', '==', 'active'),
      limit(limitCount * 3) // Pedimos más porque filtraremos después
    );
    
    const snapshot = await getDocs(providersQuery);
    console.log(`📊 Proveedores encontrados con categoría ${category} y status active: ${snapshot.docs.length}`);
    
    const allProviders = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        type: 'provider' as const,
        ...data,
        categorySurveyStatus: data.categorySurveyStatus || {},
        categoryLeadLimits: data.categoryLeadLimits || {},
        categoryLeadsUsed: data.categoryLeadsUsed || {},
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as ProviderProfile;
    });
    
    // Log detallado de cada proveedor para diagnóstico
    allProviders.forEach((p) => {
      const regionMatch = p.workRegion === region || p.acceptsOutsideZone;
      // Usar campos globales (leadLimit y leadsUsed) - NO hay límites por categoría
      const leadLimit = p.leadLimit ?? DEFAULT_LEAD_LIMIT;
      const leadsUsed = p.leadsUsed ?? 0;
      const hasLeadsAvailable = leadsUsed < leadLimit;
      const surveyStatus = p.categorySurveyStatus?.[category];
      const surveyCompleted = surveyStatus === 'completed';
      
      console.log(`  📋 ${p.providerName}:`, {
        categories: p.categories,
        region: p.workRegion,
        regionMatch,
        surveyStatus,
        surveyCompleted,
        leadLimit,
        leadsUsed,
        hasLeadsAvailable,
        willMatch: regionMatch && hasLeadsAvailable && surveyCompleted
      });
    });
    
    // Filtrar proveedores
    const filteredProviders = allProviders.filter((p) => {
      // Verificar región
      const regionMatch = p.workRegion === region || p.acceptsOutsideZone;
      
      // VALIDACIÓN ESTRICTA: Verificar créditos disponibles
      // Usar campos GLOBALES (leadLimit y leadsUsed) - NO hay límites por categoría
      const leadLimit = p.leadLimit ?? DEFAULT_LEAD_LIMIT;
      const leadsUsed = p.leadsUsed ?? 0;
      
      const creditsAvailable = leadLimit - leadsUsed;
      const hasCreditsAvailable = creditsAvailable > 0 && leadsUsed < leadLimit;
      
      // Log para diagnóstico de problemas de créditos
      if (!hasCreditsAvailable) {
        console.log(`  🚫 ${p.providerName} EXCLUIDO: sin créditos (usado: ${leadsUsed}, límite: ${leadLimit}, disponibles: ${creditsAvailable})`);
      }
      
      // Verificar que completó encuesta para esta categoría
      const surveyCompleted = p.categorySurveyStatus?.[category] === 'completed';
      
      // Verificar disponibilidad en la fecha del evento (solo si fecha no es tentativa)
      const isAvailable = isProviderAvailableOnDate(p, eventDate, isDateTentative);
      
      return regionMatch && hasCreditsAvailable && surveyCompleted && isAvailable;
    });
    
    console.log(`✅ Proveedores que pasan todos los filtros: ${filteredProviders.length}`);
    
    return filteredProviders.slice(0, limitCount);
  } catch (error) {
    console.error('Error al obtener proveedores disponibles:', error);
    throw error;
  }
};

// Constante para el máximo de leads por usuario/categoría
export const MAX_LEADS_PER_CATEGORY = 3;

/**
 * Generar matches para un usuario después de completar una encuesta de categoría
 * Este proceso:
 * 1. Obtiene la encuesta del usuario
 * 2. Busca proveedores disponibles que hayan completado su encuesta
 * 3. Calcula el match score usando el servicio de matching
 * 4. Crea leads para los mejores matches (MÁXIMO 3)
 * 
 * IMPORTANTE: Siempre generamos máximo 3 leads por categoría
 */
export const generateMatchesForUserSurvey = async (
  userId: string,
  category: CategoryId,
  region: string,
  maxMatches: number = MAX_LEADS_PER_CATEGORY // Por defecto máximo 3
): Promise<Lead[]> => {
  try {
    console.log(`\n🚀 ========== GENERANDO MATCHES ==========`);
    console.log(`📌 Usuario: ${userId}`);
    console.log(`📌 Categoría: ${category}`);
    console.log(`📌 Región: ${region}`);
    console.log(`📌 Max matches: ${maxMatches}`);
    
    // 1. Obtener la encuesta del usuario (mini-encuesta de categoría)
    const userSurvey = await getUserCategorySurvey(userId, category);
    if (!userSurvey) {
      console.warn('❌ No se encontró encuesta del usuario para generar matches');
      return [];
    }
    console.log(`✅ Encuesta del usuario encontrada: ${userSurvey.id}`);

    // 2. Obtener el perfil completo del usuario (datos del wizard)
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      throw new Error('No se pudo obtener el perfil del usuario');
    }
    
    // NUEVO: Extraer fecha del evento y si es tentativa para filtrar por disponibilidad
    // Verificamos que sea un perfil de usuario (no de proveedor)
    let eventDate: string | null = null;
    let isDateTentative = true; // Por defecto es true (no filtrar por disponibilidad)
    
    if (userProfile.type === 'user') {
      eventDate = (userProfile as UserProfile).eventDate || null;
      isDateTentative = (userProfile as UserProfile).isDateTentative !== false;
    }
    
    console.log(`📅 Fecha del evento: ${eventDate || 'No especificada'}`);
    console.log(`📅 ¿Es fecha tentativa?: ${isDateTentative ? 'Sí (NO se filtra por disponibilidad)' : 'No (SE FILTRA por disponibilidad)'}`);

    // 3. Obtener proveedores disponibles (con filtro de disponibilidad si fecha no es tentativa)
    const providers = await getAvailableProvidersForCategory(category, region, maxMatches * 3, eventDate, isDateTentative);
    
    // Si no hay proveedores con encuesta completada, buscar todos los activos de la categoría
    if (providers.length === 0) {
      console.log('No hay proveedores con encuestas completadas, buscando todos los activos...');
      // Intentar obtener proveedores sin filtro de encuesta
      const allProvidersQuery = query(
        collection(db, COLLECTIONS.PROVIDERS),
        where('categories', 'array-contains', category),
        where('status', '==', 'active'),
        limit(maxMatches * 5) // Pedimos más porque filtraremos por límite de leads
      );
      const snapshot = await getDocs(allProvidersQuery);
      
      if (snapshot.empty) {
        console.log('No hay proveedores activos para esta categoría');
        return [];
      }
      
      // Usar estos proveedores aunque no tengan encuesta, PERO filtrar por límite de leads
      const allProviders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ProviderProfile[];
      
      // FILTRO ESTRICTO: Solo incluir proveedores que tengan créditos disponibles y estén disponibles en la fecha
      const fallbackProviders = allProviders.filter(p => {
        // Usar campos GLOBALES (no por categoría)
        const leadLimit = p.leadLimit ?? DEFAULT_LEAD_LIMIT;
        const leadsUsed = p.leadsUsed ?? 0;
        
        const creditsAvailable = leadLimit - leadsUsed;
        const hasCreditsAvailable = creditsAvailable > 0 && leadsUsed < leadLimit;
        
        // También verificar disponibilidad en la fecha del evento
        const isAvailable = isProviderAvailableOnDate(p, eventDate, isDateTentative);
        
        if (!hasCreditsAvailable) {
          console.log(`🚫 Proveedor ${p.providerName} excluido del fallback: sin créditos (usado: ${leadsUsed}, límite: ${leadLimit}, disponibles: ${creditsAvailable})`);
        }
        
        if (!isAvailable) {
          console.log(`⚠️ Proveedor ${p.providerName} excluido del fallback: no disponible en fecha ${eventDate}`);
        }
        
        return hasCreditsAvailable && isAvailable;
      });
      
      if (fallbackProviders.length === 0) {
        console.log('No hay proveedores con leads disponibles para esta categoría');
        return [];
      }
      
      // Generar matches solo con datos del wizard
      return await generateMatchesWithWizardOnly(
        userId,
        userProfile as UserProfile,
        fallbackProviders,
        category,
        maxMatches
      );
    }

    // 4. Obtener encuestas de los proveedores
    const providerSurveys: Array<{
      provider: ProviderProfile;
      survey: ProviderCategorySurvey | null;
    }> = [];

    for (const provider of providers) {
      const survey = await getProviderCategorySurvey(provider.id, category);
      // Incluir proveedores aunque no tengan encuesta (usaremos solo wizard data)
      providerSurveys.push({ provider, survey });
    }

    // 5. Importar el servicio de matching
    const { calculateCombinedMatchScore } = await import('@/lib/matching/matchingService');

    // 6. Preparar datos del wizard del usuario
    const userWizardProfile = {
      budget: (userProfile as UserProfile).budget || '',
      guestCount: (userProfile as UserProfile).guestCount || '',
      region: (userProfile as UserProfile).region || region,
      eventStyle: (userProfile as UserProfile).eventStyle || '',
      ceremonyTypes: (userProfile as UserProfile).ceremonyTypes || [],
      priorityCategories: (userProfile as UserProfile).priorityCategories || [],
      involvementLevel: (userProfile as UserProfile).involvementLevel || '',
    };

    // 7. Calcular scores combinados (wizard + mini-encuesta)
    const matchResults: Array<{
      provider: ProviderProfile;
      score: number;
      surveyScore: number;
      wizardScore: number;
    }> = [];

    for (const { provider, survey } of providerSurveys) {
      // Preparar datos del wizard del proveedor
      const providerWizardProfile = {
        serviceStyle: provider.serviceStyle || '',
        priceRange: provider.priceRange || '',
        workRegion: provider.workRegion || '',
        acceptsOutsideZone: provider.acceptsOutsideZone || false,
        categories: provider.categories || [],
      };

      // Calcular score combinado (incluye bonus de verificación +10 puntos, máximo 100)
      const result = calculateCombinedMatchScore(
        userSurvey.responses,
        survey?.responses || {},
        userWizardProfile,
        providerWizardProfile,
        category,
        provider.isVerified || false // Pasar flag de verificación para bonus
      );

      matchResults.push({
        provider,
        score: result.score,
        surveyScore: result.surveyScore,
        wizardScore: result.wizardScore,
      });
    }

    // 8. Ordenar por score y tomar los mejores (MÁXIMO 3)
    matchResults.sort((a, b) => b.score - a.score);
    // Asegurar que nunca generamos más de MAX_LEADS_PER_CATEGORY leads
    const effectiveMaxMatches = Math.min(maxMatches, MAX_LEADS_PER_CATEGORY);
    const topMatches = matchResults.slice(0, effectiveMaxMatches);
    
    console.log(`📊 Seleccionados ${topMatches.length} mejores matches (máximo permitido: ${effectiveMaxMatches})`);

    // 9. Crear leads para cada match
    // IMPORTANTE: Cada createCategoryLead valida créditos con datos frescos
    // Si un proveedor no tiene créditos, lo saltamos y continuamos con el siguiente
    const createdLeads: Lead[] = [];

    for (const { provider, score } of topMatches) {
      try {
        // Obtener el ID de la encuesta del proveedor si existe
        const providerSurveyData = providerSurveys.find(ps => ps.provider.id === provider.id);
        const providerSurveyId = providerSurveyData?.survey?.id;
        
        // Crear lead - la función valida créditos con datos frescos
        const lead = await createCategoryLead(
          userId,
          provider.id,
          category,
          score,
          {
            coupleNames: (userProfile as UserProfile).coupleNames || 'Pareja',
            eventDate: (userProfile as UserProfile).eventDate || 'Por definir',
            budget: (userProfile as UserProfile).budget || '',
            region: (userProfile as UserProfile).region || region,
            email: userProfile.email,
            phone: (userProfile as UserProfile).phone || '',
          },
          {
            providerName: provider.providerName,
            categories: provider.categories || [],
            priceRange: provider.priceRange || '',
            isVerified: provider.isVerified || false,
          },
          undefined, // matchCriteria
          userSurvey.id, // userSurveyId
          providerSurveyId
        );

        createdLeads.push(lead);
      } catch (leadError) {
        // Si falla la creación del lead (ej: sin créditos), continuamos con el siguiente
        console.warn(`⚠️ No se pudo crear lead para ${provider.providerName}: ${leadError}`);
        continue;
      }
    }

    // 10. Marcar la encuesta como con matches generados
    await markUserSurveyMatchesGenerated(userId, category);

    console.log(`✓ Generados ${createdLeads.length} matches para ${category}`);
    return createdLeads;
  } catch (error) {
    console.error('Error al generar matches:', error);
    throw error;
  }
};

/**
 * Genera matches usando solo datos del wizard cuando no hay encuestas de proveedores
 * Esto asegura que siempre mostremos opciones al usuario
 */
async function generateMatchesWithWizardOnly(
  userId: string,
  userProfile: UserProfile,
  providers: ProviderProfile[],
  category: CategoryId,
  maxMatches: number
): Promise<Lead[]> {
  const { calculateWizardMatchScore } = await import('@/lib/matching/matchingService');

  const userWizardProfile = {
    budget: userProfile.budget || '',
    guestCount: userProfile.guestCount || '',
    region: userProfile.region || '',
    eventStyle: userProfile.eventStyle || '',
    ceremonyTypes: userProfile.ceremonyTypes || [],
    priorityCategories: userProfile.priorityCategories || [],
    involvementLevel: userProfile.involvementLevel || '',
  };

  const matchResults: Array<{
    provider: ProviderProfile;
    score: number;
  }> = [];

  for (const provider of providers) {
    const providerWizardProfile = {
      serviceStyle: provider.serviceStyle || '',
      priceRange: provider.priceRange || '',
      workRegion: provider.workRegion || '',
      acceptsOutsideZone: provider.acceptsOutsideZone || false,
      categories: provider.categories || [],
    };

    const { score } = calculateWizardMatchScore(
      userWizardProfile,
      providerWizardProfile,
      category
    );

    matchResults.push({ provider, score });
  }

  // Ordenar y tomar los mejores (MÁXIMO 3)
  matchResults.sort((a, b) => b.score - a.score);
  // Asegurar que nunca generamos más de MAX_LEADS_PER_CATEGORY leads
  const effectiveMaxMatches = Math.min(maxMatches, MAX_LEADS_PER_CATEGORY);
  const topMatches = matchResults.slice(0, effectiveMaxMatches);

  // Crear leads - cada uno valida créditos con datos frescos
  const createdLeads: Lead[] = [];

  for (const { provider, score } of topMatches) {
    try {
      const lead = await createCategoryLead(
        userId,
        provider.id,
        category,
        score,
        {
          coupleNames: userProfile.coupleNames || 'Pareja',
          eventDate: userProfile.eventDate || 'Por definir',
          budget: userProfile.budget || '',
          region: userProfile.region || '',
          email: userProfile.email,
          phone: userProfile.phone || '',
        },
        {
          providerName: provider.providerName,
          categories: provider.categories || [],
          priceRange: provider.priceRange || '',
          isVerified: provider.isVerified || false,
        }
      );

      createdLeads.push(lead);
    } catch (leadError) {
      // Si falla la creación del lead (ej: sin créditos), continuamos con el siguiente
      console.warn(`⚠️ No se pudo crear lead para ${provider.providerName}: ${leadError}`);
      continue;
    }
  }

  // Marcar encuesta
  await markUserSurveyMatchesGenerated(userId, category);

  console.log(`✓ Generados ${createdLeads.length} matches (solo wizard) para ${category}`);
  return createdLeads;
}

/**
 * Genera UN NUEVO match adicional para un usuario en una categoría.
 * Busca proveedores que no hayan sido mostrados aún al usuario.
 * IMPORTANTE: Usa el mismo sistema de matching que generateMatchesForUserSurvey
 * para garantizar que SIEMPRE se muestre el mejor match disponible (por score).
 * 
 * MEJORAS APLICADAS:
 * - Usa calculateCombinedMatchScore para calcular el score real (no básico)
 * - Aplica bonus de verificación (+10 puntos, máximo 100)
 * - NO usa variación aleatoria - SIEMPRE el mejor match primero
 * - Ordena estrictamente por matchScore descendente
 * 
 * @returns El nuevo lead creado, o null si no hay más proveedores disponibles
 */
export const generateNewMatchForUser = async (
  userId: string,
  category: CategoryId
): Promise<Lead | null> => {
  try {
    // 1. Obtener el perfil del usuario
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    if (!userDoc.exists()) {
      throw new Error('Usuario no encontrado');
    }
    const userProfile = userDoc.data() as UserProfile;

    // 2. Obtener la encuesta del usuario para esta categoría (necesaria para calcular match real)
    const userSurvey = await getUserCategorySurvey(userId, category);

    // 3. Obtener los leads existentes del usuario para esta categoría
    const existingLeadsQuery = query(
      collection(db, COLLECTIONS.LEADS),
      where('userId', '==', userId),
      where('category', '==', category)
    );
    const existingLeadsSnap = await getDocs(existingLeadsQuery);
    const existingProviderIds = new Set(
      existingLeadsSnap.docs.map(doc => doc.data().providerId)
    );

    // 4. Obtener proveedores activos de esta categoría que no hayan sido mostrados
    const providersQuery = query(
      collection(db, COLLECTIONS.PROVIDERS),
      where('status', '==', 'active'),
      where('categories', 'array-contains', category)
    );
    const providersSnap = await getDocs(providersQuery);

    // 5. Importar el servicio de matching para calcular scores reales
    const { calculateCombinedMatchScore } = await import('@/lib/matching/matchingService');

    // 6. Preparar datos del wizard del usuario
    const userWizardProfile = {
      budget: userProfile.budget || '',
      guestCount: userProfile.guestCount || '',
      region: userProfile.region || '',
      eventStyle: userProfile.eventStyle || '',
      ceremonyTypes: userProfile.ceremonyTypes || [],
      priorityCategories: userProfile.priorityCategories || [],
      involvementLevel: userProfile.involvementLevel || '',
    };

    // 7. Filtrar proveedores y calcular score REAL
    const availableProviders: Array<{
      id: string;
      data: ProviderProfile;
      score: number;
      isVerified: boolean;
    }> = [];

    console.log(`\n🔍 ========== GENERANDO NUEVO MATCH (OPTIMIZADO) ==========`);
    console.log(`📌 Usuario: ${userId}, Categoría: ${category}`);
    console.log(`📊 Proveedores ya mostrados: ${existingProviderIds.size}`);
    console.log(`📊 Proveedores activos en categoría: ${providersSnap.docs.length}`);
    
    let excludedByCredits = 0;
    let excludedByAlreadyShown = 0;

    for (const providerDoc of providersSnap.docs) {
      const providerId = providerDoc.id;
      const providerData = providerDoc.data() as ProviderProfile;
      const providerName = providerData.providerName || providerId;
      
      // Saltar si ya fue mostrado
      if (existingProviderIds.has(providerId)) {
        excludedByAlreadyShown++;
        continue;
      }

      // VALIDACIÓN ESTRICTA: Usar campos GLOBALES (no por categoría)
      const leadLimit = providerData.leadLimit ?? DEFAULT_LEAD_LIMIT;
      const leadsUsed = providerData.leadsUsed ?? 0;
      const creditsAvailable = leadLimit - leadsUsed;
      
      // CRÍTICO: Excluir si no hay créditos disponibles
      if (creditsAvailable <= 0 || leadsUsed >= leadLimit || leadsUsed < 0) {
        console.log(`   🚫 ${providerName} EXCLUIDO: sin créditos (usado: ${leadsUsed}, límite: ${leadLimit})`);
        excludedByCredits++;
        continue;
      }

      // Preparar datos del wizard del proveedor
      const providerWizardProfile = {
        serviceStyle: providerData.serviceStyle || '',
        priceRange: providerData.priceRange || '',
        workRegion: providerData.workRegion || '',
        acceptsOutsideZone: providerData.acceptsOutsideZone || false,
        categories: providerData.categories || [],
      };

      // Obtener encuesta del proveedor (si existe)
      const providerSurvey = await getProviderCategorySurvey(providerId, category);

      // Calcular score REAL usando el servicio de matching completo
      // Incluye bonus de verificación (+10 puntos, máximo 100)
      const matchResult = calculateCombinedMatchScore(
        userSurvey?.responses || {},
        providerSurvey?.responses || {},
        userWizardProfile,
        providerWizardProfile,
        category,
        providerData.isVerified || false // Pasar flag de verificación
      );

      const isVerified = providerData.isVerified || false;
      console.log(`   📋 ${providerName}: score=${matchResult.score}${isVerified ? ' ⭐ VERIFICADO (+10)' : ''} (créditos: ${creditsAvailable})`);

      availableProviders.push({
        id: providerId,
        data: providerData,
        score: matchResult.score,
        isVerified,
      });
    }

    // 8. Si no hay proveedores disponibles, retornar null
    console.log(`\n📊 Resumen de filtrado:`);
    console.log(`   - Total proveedores en categoría: ${providersSnap.docs.length}`);
    console.log(`   - Excluidos por ya mostrados: ${excludedByAlreadyShown}`);
    console.log(`   - Excluidos por sin créditos: ${excludedByCredits}`);
    console.log(`   - Disponibles para mostrar: ${availableProviders.length}`);
    
    if (availableProviders.length === 0) {
      console.log(`❌ No hay más proveedores disponibles para ${category}`);
      return null;
    }

    // 9. Ordenar ESTRICTAMENTE por score descendente (SIN variación aleatoria)
    // Esto garantiza que SIEMPRE se muestre el mejor match disponible
    availableProviders.sort((a, b) => b.score - a.score);
    
    // Log de los top 3 para debugging
    console.log(`\n📊 Top 3 proveedores disponibles (por score):`);
    availableProviders.slice(0, 3).forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.data.providerName}: ${p.score}%${p.isVerified ? ' ⭐' : ''}`);
    });
    
    const selectedProvider = availableProviders[0];
    
    console.log(`\n✅ Proveedor seleccionado: ${selectedProvider.data.providerName} (score: ${selectedProvider.score}${selectedProvider.isVerified ? ' ⭐ VERIFICADO' : ''})`);

    // 10. Crear el nuevo lead - createCategoryLead re-valida los créditos con datos frescos
    const newLead = await createCategoryLead(
      userId,
      selectedProvider.id,
      category,
      selectedProvider.score, // Usar score ya calculado (incluye bonus verificación)
      {
        coupleNames: userProfile.coupleNames || 'Pareja',
        eventDate: userProfile.eventDate || 'Por definir',
        budget: userProfile.budget || '',
        region: userProfile.region || '',
        email: userProfile.email,
        phone: userProfile.phone || '',
      },
      {
        providerName: selectedProvider.data.providerName,
        categories: selectedProvider.data.categories || [],
        priceRange: selectedProvider.data.priceRange || '',
        isVerified: selectedProvider.isVerified,
      }
    );

    // 11. Incrementar métrica de timesOffered del proveedor
    await incrementProviderMetric(selectedProvider.id, 'timesOffered');

    console.log(`✓ Nuevo match generado: ${selectedProvider.data.providerName} (score: ${selectedProvider.score})`);
    return newLead;
  } catch (error) {
    console.error('Error generando nuevo match:', error);
    throw error;
  }
};

// ============================================
// REHACER ENCUESTA - ELIMINAR LEADS Y RESTAURAR CRÉDITOS
// ============================================

/**
 * Permite al usuario rehacer una encuesta de categoría.
 * Esta función:
 * 1. Elimina todos los leads del usuario para esa categoría
 * 2. Restaura los créditos (leadsUsed) de cada proveedor afectado
 * 3. Elimina la encuesta del usuario
 * 4. Resetea el estado de la categoría en el perfil del usuario
 * 
 * IMPORTANTE: Esta función "devuelve" los créditos a los proveedores
 * como si los leads nunca hubieran existido.
 */
export const resetCategorySurveyAndLeads = async (
  userId: string,
  category: CategoryId
): Promise<{ deletedLeadsCount: number; restoredCreditsToProviders: string[] }> => {
  try {
    console.log(`🔄 Iniciando reset de categoría ${category} para usuario ${userId}`);
    
    const now = Timestamp.now();
    const result = {
      deletedLeadsCount: 0,
      restoredCreditsToProviders: [] as string[],
    };
    
    // 1. Obtener todos los leads del usuario para esta categoría
    const leadsQuery = query(
      collection(db, COLLECTIONS.LEADS),
      where('userId', '==', userId),
      where('category', '==', category)
    );
    
    const leadsSnapshot = await getDocs(leadsQuery);
    console.log(`📋 Encontrados ${leadsSnapshot.size} leads para eliminar`);
    
    // 2. Para cada lead, restaurar crédito al proveedor y eliminar el lead
    for (const leadDoc of leadsSnapshot.docs) {
      const leadData = leadDoc.data();
      const providerId = leadData.providerId;
      
      try {
        // Obtener datos actuales del proveedor
        const providerRef = doc(db, COLLECTIONS.PROVIDERS, providerId);
        const providerSnap = await getDoc(providerRef);
        
        if (providerSnap.exists()) {
          const providerData = providerSnap.data();
          
          // Calcular nuevo valor (decrementar)
          const currentLeadsUsed = providerData.leadsUsed ?? 0;
          
          // Solo decrementar si hay leads usados (evitar negativos)
          const newLeadsUsed = Math.max(0, currentLeadsUsed - 1);
          
          // Actualizar proveedor - restaurar crédito
          await updateDoc(providerRef, {
            leadsUsed: newLeadsUsed,
            updatedAt: now,
          });
          
          console.log(`✅ Crédito restaurado a proveedor ${providerId} (${currentLeadsUsed} → ${newLeadsUsed})`);
          
          if (!result.restoredCreditsToProviders.includes(providerId)) {
            result.restoredCreditsToProviders.push(providerId);
          }
        }
        
        // Eliminar el lead
        await deleteDoc(leadDoc.ref);
        result.deletedLeadsCount++;
        
      } catch (providerError) {
        console.warn(`⚠️ Error restaurando crédito a proveedor ${providerId}:`, providerError);
        // Continuar con el siguiente lead aunque falle uno
      }
    }
    
    // 3. Eliminar la encuesta del usuario para esta categoría
    const surveyQuery = query(
      collection(db, COLLECTIONS.USER_CATEGORY_SURVEYS),
      where('userId', '==', userId),
      where('category', '==', category)
    );
    
    const surveySnapshot = await getDocs(surveyQuery);
    for (const surveyDoc of surveySnapshot.docs) {
      await deleteDoc(surveyDoc.ref);
      console.log(`🗑️ Encuesta eliminada: ${surveyDoc.id}`);
    }
    
    // 4. Actualizar el estado de categoría en el perfil del usuario
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      [`categorySurveyStatus.${category}`]: 'not_started',
      updatedAt: now,
    });
    
    console.log(`✅ Reset completo para ${category}: ${result.deletedLeadsCount} leads eliminados, ${result.restoredCreditsToProviders.length} proveedores con créditos restaurados`);
    
    return result;
    
  } catch (error) {
    console.error('Error en resetCategorySurveyAndLeads:', error);
    throw error;
  }
};