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
  };
  assignedByAdmin?: boolean;
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
  responses: Record<string, string | string[] | number | boolean>;
  completedAt: Date;
  matchesGenerated: boolean;
}

export interface ProviderCategorySurvey {
  id: string;
  providerId: string;
  category: CategoryId;
  responses: Record<string, string | string[] | number | boolean>;
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
      budget: userData.budget,
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
      priceRange: providerData.priceRange,
      workRegion: providerData.workRegion,
      acceptsOutsideZone: providerData.acceptsOutsideZone,
      description: providerData.description,
      website: providerData.website,
      instagram: providerData.instagram,
      facebook: providerData.facebook,
      tiktok: providerData.tiktok,
      portfolioImages: providerData.portfolioImages,
      status: 'pending' as const, // Los proveedores empiezan como pendientes
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

// ============================================
// FUNCIONES PARA ENCUESTAS POR CATEGORÍA
// ============================================

/**
 * Guardar encuesta de usuario por categoría
 */
export const saveUserCategorySurvey = async (
  userId: string,
  category: CategoryId,
  responses: Record<string, string | string[] | number | boolean>
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
    
    // Actualizar estado de encuesta del usuario
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
      [`categorySurveyStatus.${category}`]: 'completed' as CategorySurveyStatus,
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
  responses: Record<string, string | string[] | number | boolean>
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
    
    if (!existingSnapshot.empty) {
      // Actualizar encuesta existente
      const existingDoc = existingSnapshot.docs[0];
      await updateDoc(existingDoc.ref, {
        responses,
        completedAt: now,
      });
      
      return {
        id: existingDoc.id,
        providerId,
        category,
        responses,
        completedAt: now.toDate(),
      };
    }
    
    // Crear nueva encuesta
    const surveyData = {
      providerId,
      category,
      responses,
      completedAt: now,
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.PROVIDER_CATEGORY_SURVEYS), surveyData);
    
    // Actualizar estado de encuesta del proveedor
    await updateDoc(doc(db, COLLECTIONS.PROVIDERS, providerId), {
      [`categorySurveyStatus.${category}`]: 'completed' as CategorySurveyStatus,
      updatedAt: now,
    });
    
    return {
      id: docRef.id,
      ...surveyData,
      completedAt: now.toDate(),
    };
  } catch (error) {
    console.error('Error al guardar encuesta de proveedor:', error);
    throw error;
  }
};

/**
 * Obtener encuesta de usuario por categoría
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
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
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
  try {
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
    
    // Actualizar leadsUsed del proveedor para esta categoría
    await updateDoc(doc(db, COLLECTIONS.PROVIDERS, providerId), {
      [`categoryLeadsUsed.${category}`]: (await getProviderCategoryLeadsUsed(providerId, category)) + 1,
      leadsUsed: (await getProviderTotalLeadsUsed(providerId)) + 1, // Legacy
      updatedAt: now,
    });
    
    return {
      id: docRef.id,
      ...leadData,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    };
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
 */
export const updateLeadStatus = async (
  leadId: string,
  status: LeadStatus
): Promise<void> => {
  try {
    await updateDoc(doc(db, COLLECTIONS.LEADS, leadId), {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error al actualizar estado del lead:', error);
    throw error;
  }
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
 * Obtener proveedores disponibles para matchmaking en una categoría específica
 * Solo retorna proveedores que:
 * 1. Ofrecen esa categoría
 * 2. Están activos
 * 3. Tienen leads disponibles para esa categoría
 * 4. Han completado su encuesta para esa categoría
 */
export const getAvailableProvidersForCategory = async (
  category: CategoryId,
  region: string,
  limitCount: number = 10
): Promise<ProviderProfile[]> => {
  try {
    const providersQuery = query(
      collection(db, COLLECTIONS.PROVIDERS),
      where('categories', 'array-contains', category),
      where('status', '==', 'active'),
      limit(limitCount * 2) // Pedimos más porque filtraremos después
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
    
    // Filtrar proveedores
    providers = providers.filter((p) => {
      // Verificar región
      const regionMatch = p.workRegion === region || p.acceptsOutsideZone;
      
      // Verificar leads disponibles para esta categoría
      const leadLimit = p.categoryLeadLimits?.[category] || DEFAULT_LEAD_LIMIT;
      const leadsUsed = p.categoryLeadsUsed?.[category] || 0;
      const hasLeadsAvailable = leadsUsed < leadLimit;
      
      // Verificar que completó encuesta para esta categoría
      const surveyCompleted = p.categorySurveyStatus?.[category] === 'completed';
      
      return regionMatch && hasLeadsAvailable && surveyCompleted;
    });
    
    return providers.slice(0, limitCount);
  } catch (error) {
    console.error('Error al obtener proveedores disponibles:', error);
    throw error;
  }
};

/**
 * Generar matches para un usuario después de completar una encuesta de categoría
 * Este proceso:
 * 1. Obtiene la encuesta del usuario
 * 2. Busca proveedores disponibles que hayan completado su encuesta
 * 3. Calcula el match score usando el servicio de matching
 * 4. Crea leads para los mejores matches
 */
export const generateMatchesForUserSurvey = async (
  userId: string,
  category: CategoryId,
  region: string,
  maxMatches: number = 5
): Promise<Lead[]> => {
  try {
    // 1. Obtener la encuesta del usuario (mini-encuesta de categoría)
    const userSurvey = await getUserCategorySurvey(userId, category);
    if (!userSurvey) {
      console.warn('No se encontró encuesta del usuario para generar matches');
      return [];
    }

    // 2. Obtener el perfil completo del usuario (datos del wizard)
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      throw new Error('No se pudo obtener el perfil del usuario');
    }

    // 3. Obtener proveedores disponibles
    const providers = await getAvailableProvidersForCategory(category, region, maxMatches * 3);
    
    // Si no hay proveedores con encuesta completada, buscar todos los activos de la categoría
    if (providers.length === 0) {
      console.log('No hay proveedores con encuestas completadas, buscando todos los activos...');
      // Intentar obtener proveedores sin filtro de encuesta
      const allProvidersQuery = query(
        collection(db, COLLECTIONS.PROVIDERS),
        where('categories', 'array-contains', category),
        where('status', '==', 'active'),
        limit(maxMatches * 3)
      );
      const snapshot = await getDocs(allProvidersQuery);
      
      if (snapshot.empty) {
        console.log('No hay proveedores activos para esta categoría');
        return [];
      }
      
      // Usar estos proveedores aunque no tengan encuesta
      const fallbackProviders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ProviderProfile[];
      
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

      // Calcular score combinado
      const result = calculateCombinedMatchScore(
        userSurvey.responses,
        survey?.responses || {},
        userWizardProfile,
        providerWizardProfile,
        category
      );

      matchResults.push({
        provider,
        score: result.score,
        surveyScore: result.surveyScore,
        wizardScore: result.wizardScore,
      });
    }

    // 8. Ordenar por score y tomar los mejores
    matchResults.sort((a, b) => b.score - a.score);
    const topMatches = matchResults.slice(0, maxMatches);

    // 9. Crear leads para cada match
    const createdLeads: Lead[] = [];

    for (const { provider, score } of topMatches) {
      // Siempre crear leads para los mejores matches
      // Mostramos al menos los 3 mejores aunque el score sea bajo
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
        }
      );

      createdLeads.push(lead);
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

  // Ordenar y tomar los mejores
  matchResults.sort((a, b) => b.score - a.score);
  const topMatches = matchResults.slice(0, maxMatches);

  // Crear leads
  const createdLeads: Lead[] = [];

  for (const { provider, score } of topMatches) {
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
      }
    );

    createdLeads.push(lead);
  }

  // Marcar encuesta
  await markUserSurveyMatchesGenerated(userId, category);

  console.log(`✓ Generados ${createdLeads.length} matches (solo wizard) para ${category}`);
  return createdLeads;
}