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
} from 'firebase/firestore';
import { db } from './config';
import { UserProfile, ProviderProfile, UserProfileData } from '@/store/authStore';
import { UserWizardData, ProviderWizardData } from '@/store/wizardStore';

// ============================================
// COLECCIONES
// ============================================

const COLLECTIONS = {
  USERS: 'users',
  PROVIDERS: 'providers',
  LEADS: 'leads',
} as const;

// ============================================
// TIPOS PARA LEADS/MATCHES
// ============================================

export type LeadStatus = 'pending' | 'approved' | 'rejected' | 'contacted';

export interface Lead {
  id: string;
  userId: string;
  providerId: string;
  category: string;
  matchScore: number; // Porcentaje de match
  status: LeadStatus;
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
  createdAt: Date;
  updatedAt: Date;
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
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as UserProfile;
    }
    
    // Buscar en colección de proveedores
    const providerDoc = await getDoc(doc(db, COLLECTIONS.PROVIDERS, userId));
    
    if (providerDoc.exists()) {
      const data = providerDoc.data();
      return {
        id: providerDoc.id,
        type: 'provider',
        ...data,
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

/**
 * Crear perfil de usuario (novios)
 */
export const createUserProfile = async (
  userId: string,
  userData: UserWizardData
): Promise<UserProfile> => {
  try {
    const now = Timestamp.now();
    
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
export const DEFAULT_LEAD_LIMIT = 10; // Límite por defecto de leads para nuevos proveedores

/**
 * Crear perfil de proveedor
 */
export const createProviderProfile = async (
  userId: string,
  providerData: ProviderWizardData
): Promise<ProviderProfile> => {
  try {
    const now = Timestamp.now();
    
    const profileData = {
      email: providerData.email,
      providerName: providerData.providerName,
      phone: providerData.phone,
      categories: providerData.categories,
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
      leadLimit: DEFAULT_LEAD_LIMIT, // Límite de leads por defecto
      leadsUsed: 0, // Sin leads consumidos al inicio
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
// FUNCIONES PARA LEADS/MATCHES
// ============================================

/**
 * Crear un nuevo lead
 */
export const createLead = async (
  userId: string,
  providerId: string,
  category: string,
  matchScore: number,
  userInfo: Lead['userInfo'],
  providerInfo: Lead['providerInfo']
): Promise<Lead> => {
  try {
    const now = Timestamp.now();
    
    const leadData = {
      userId,
      providerId,
      category,
      matchScore,
      status: 'pending' as LeadStatus,
      userInfo,
      providerInfo,
      createdAt: now,
      updatedAt: now,
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.LEADS), leadData);
    
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

