import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  getCountFromServer,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { UserProfile, ProviderProfile, ProviderStatus, AdminProfile } from '@/store/authStore';
import { Lead, LeadStatus } from './firestore';
import { AdminStats } from '@/store/adminStore';

// ============================================
// COLECCIONES
// ============================================

const COLLECTIONS = {
  USERS: 'users',
  PROVIDERS: 'providers',
  LEADS: 'leads',
  ADMINS: 'admins',
} as const;

// ============================================
// FUNCIONES PARA ADMINISTRADORES
// ============================================

/**
 * Obtener perfil de administrador por ID
 */
export const getAdminProfile = async (adminId: string): Promise<AdminProfile | null> => {
  try {
    const adminDoc = await getDoc(doc(db, COLLECTIONS.ADMINS, adminId));
    
    if (adminDoc.exists()) {
      const data = adminDoc.data();
      return {
        id: adminDoc.id,
        type: 'admin',
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as AdminProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener perfil de admin:', error);
    throw error;
  }
};

/**
 * Crear perfil de administrador
 */
export const createAdminProfile = async (
  adminId: string,
  data: {
    email: string;
    name: string;
    role: 'super_admin' | 'admin' | 'moderator';
    permissions?: string[];
  }
): Promise<AdminProfile> => {
  try {
    const now = Timestamp.now();
    
    const profileData = {
      email: data.email,
      name: data.name,
      role: data.role,
      permissions: data.permissions || getDefaultPermissions(data.role),
      createdAt: now,
      updatedAt: now,
    };
    
    await setDoc(doc(db, COLLECTIONS.ADMINS, adminId), profileData);
    
    return {
      id: adminId,
      type: 'admin',
      ...profileData,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    };
  } catch (error) {
    console.error('Error al crear perfil de admin:', error);
    throw error;
  }
};

/**
 * Obtener permisos por defecto según el rol
 */
const getDefaultPermissions = (role: 'super_admin' | 'admin' | 'moderator'): string[] => {
  const permissions: Record<string, string[]> = {
    super_admin: [
      'users:read', 'users:write', 'users:delete',
      'providers:read', 'providers:write', 'providers:delete', 'providers:approve',
      'leads:read', 'leads:write', 'leads:delete', 'leads:assign',
      'admins:read', 'admins:write', 'admins:delete',
      'stats:read',
    ],
    admin: [
      'users:read', 'users:write',
      'providers:read', 'providers:write', 'providers:approve',
      'leads:read', 'leads:write', 'leads:assign',
      'stats:read',
    ],
    moderator: [
      'users:read',
      'providers:read', 'providers:approve',
      'leads:read',
      'stats:read',
    ],
  };
  
  return permissions[role] || [];
};

// ============================================
// FUNCIONES PARA OBTENER LISTAS (ADMIN)
// ============================================

/**
 * Obtener todos los usuarios con paginación
 */
export const getAllUsers = async (
  pageSize: number = 10,
  lastDoc?: DocumentSnapshot | null,
  searchTerm?: string
): Promise<{ users: UserProfile[]; lastDoc: DocumentSnapshot | null; total: number }> => {
  try {
    // Obtener total
    const countSnapshot = await getCountFromServer(collection(db, COLLECTIONS.USERS));
    const total = countSnapshot.data().count;
    
    // Query con paginación
    let usersQuery = query(
      collection(db, COLLECTIONS.USERS),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    
    if (lastDoc) {
      usersQuery = query(
        collection(db, COLLECTIONS.USERS),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      );
    }
    
    const snapshot = await getDocs(usersQuery);
    
    let users = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        type: 'user' as const,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as UserProfile;
    });
    
    // Filtrar por búsqueda si existe
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      users = users.filter(
        (u) =>
          u.coupleNames.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
      );
    }
    
    const newLastDoc = snapshot.docs.length > 0 
      ? snapshot.docs[snapshot.docs.length - 1] 
      : null;
    
    return { users, lastDoc: newLastDoc, total };
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

/**
 * Obtener todos los proveedores con paginación y filtros
 */
export const getAllProviders = async (
  pageSize: number = 10,
  lastDoc?: DocumentSnapshot | null,
  filters?: {
    status?: ProviderStatus;
    category?: string;
    searchTerm?: string;
  }
): Promise<{ providers: ProviderProfile[]; lastDoc: DocumentSnapshot | null; total: number }> => {
  try {
    // Obtener total
    let countQuery = collection(db, COLLECTIONS.PROVIDERS);
    const countSnapshot = await getCountFromServer(countQuery);
    const total = countSnapshot.data().count;
    
    // Query base
    let providersQuery = query(
      collection(db, COLLECTIONS.PROVIDERS),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    
    // Aplicar filtro de status si existe
    if (filters?.status) {
      providersQuery = query(
        collection(db, COLLECTIONS.PROVIDERS),
        where('status', '==', filters.status),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
    }
    
    if (lastDoc) {
      if (filters?.status) {
        providersQuery = query(
          collection(db, COLLECTIONS.PROVIDERS),
          where('status', '==', filters.status),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(pageSize)
        );
      } else {
        providersQuery = query(
          collection(db, COLLECTIONS.PROVIDERS),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(pageSize)
        );
      }
    }
    
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
    
    // Filtrar por categoría si existe
    if (filters?.category) {
      providers = providers.filter((p) => p.categories.includes(filters.category!));
    }
    
    // Filtrar por búsqueda si existe
    if (filters?.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      providers = providers.filter(
        (p) =>
          p.providerName.toLowerCase().includes(search) ||
          p.email.toLowerCase().includes(search)
      );
    }
    
    const newLastDoc = snapshot.docs.length > 0 
      ? snapshot.docs[snapshot.docs.length - 1] 
      : null;
    
    return { providers, lastDoc: newLastDoc, total };
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    throw error;
  }
};

/**
 * Obtener todos los leads con paginación y filtros
 */
export const getAllLeads = async (
  pageSize: number = 10,
  lastDoc?: DocumentSnapshot | null,
  filters?: {
    status?: LeadStatus;
    providerId?: string;
    userId?: string;
  }
): Promise<{ leads: Lead[]; lastDoc: DocumentSnapshot | null; total: number }> => {
  try {
    // Obtener total
    const countSnapshot = await getCountFromServer(collection(db, COLLECTIONS.LEADS));
    const total = countSnapshot.data().count;
    
    // Query base
    let leadsQuery = query(
      collection(db, COLLECTIONS.LEADS),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    
    // Aplicar filtros
    if (filters?.status) {
      leadsQuery = query(
        collection(db, COLLECTIONS.LEADS),
        where('status', '==', filters.status),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
    } else if (filters?.providerId) {
      leadsQuery = query(
        collection(db, COLLECTIONS.LEADS),
        where('providerId', '==', filters.providerId),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
    } else if (filters?.userId) {
      leadsQuery = query(
        collection(db, COLLECTIONS.LEADS),
        where('userId', '==', filters.userId),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
    }
    
    if (lastDoc) {
      leadsQuery = query(
        collection(db, COLLECTIONS.LEADS),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      );
    }
    
    const snapshot = await getDocs(leadsQuery);
    
    const leads = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Lead;
    });
    
    const newLastDoc = snapshot.docs.length > 0 
      ? snapshot.docs[snapshot.docs.length - 1] 
      : null;
    
    return { leads, lastDoc: newLastDoc, total };
  } catch (error) {
    console.error('Error al obtener leads:', error);
    throw error;
  }
};

// ============================================
// FUNCIONES PARA ESTADÍSTICAS
// ============================================

/**
 * Obtener estadísticas generales del sistema
 */
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    // Contar usuarios
    const usersCount = await getCountFromServer(collection(db, COLLECTIONS.USERS));
    
    // Contar proveedores por estado
    const providersSnapshot = await getDocs(collection(db, COLLECTIONS.PROVIDERS));
    let pendingProviders = 0;
    let activeProviders = 0;
    let closedProviders = 0;
    
    providersSnapshot.docs.forEach((doc) => {
      const status = doc.data().status;
      if (status === 'pending') pendingProviders++;
      else if (status === 'active') activeProviders++;
      else if (status === 'closed') closedProviders++;
    });
    
    // Contar leads por estado
    const leadsSnapshot = await getDocs(collection(db, COLLECTIONS.LEADS));
    let leadsApproved = 0;
    let leadsRejected = 0;
    let leadsPending = 0;
    
    leadsSnapshot.docs.forEach((doc) => {
      const status = doc.data().status;
      if (status === 'approved') leadsApproved++;
      else if (status === 'rejected') leadsRejected++;
      else if (status === 'pending') leadsPending++;
    });
    
    return {
      totalUsers: usersCount.data().count,
      totalProviders: providersSnapshot.size,
      totalLeads: leadsSnapshot.size,
      pendingProviders,
      activeProviders,
      closedProviders,
      leadsApproved,
      leadsRejected,
      leadsPending,
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};

// ============================================
// FUNCIONES DE GESTIÓN DE PROVEEDORES (ADMIN)
// ============================================

/**
 * Cambiar estado de un proveedor
 */
export const updateProviderStatus = async (
  providerId: string,
  status: ProviderStatus
): Promise<void> => {
  try {
    await updateDoc(doc(db, COLLECTIONS.PROVIDERS, providerId), {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error al actualizar estado del proveedor:', error);
    throw error;
  }
};

/**
 * Aprobar proveedor (cambiar de pending a active)
 */
export const approveProvider = async (providerId: string): Promise<void> => {
  return updateProviderStatus(providerId, 'active');
};

/**
 * Rechazar/Cerrar proveedor
 */
export const closeProvider = async (providerId: string): Promise<void> => {
  return updateProviderStatus(providerId, 'closed');
};

/**
 * Actualizar perfil de proveedor (admin)
 */
export const adminUpdateProvider = async (
  providerId: string,
  data: Partial<ProviderProfile>
): Promise<void> => {
  try {
    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: Timestamp.now(),
    };
    
    // Eliminar campos que no deben actualizarse
    delete updateData.id;
    delete updateData.type;
    delete updateData.createdAt;
    
    await updateDoc(doc(db, COLLECTIONS.PROVIDERS, providerId), updateData);
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    throw error;
  }
};

// ============================================
// FUNCIONES DE GESTIÓN DE LEADS (ADMIN)
// ============================================

/**
 * Asignar leads adicionales a un proveedor
 * Esto crea nuevos leads vinculando usuarios con el proveedor
 */
export const assignLeadsToProvider = async (
  providerId: string,
  userIds: string[],
  category: string
): Promise<Lead[]> => {
  try {
    const batch = writeBatch(db);
    const now = Timestamp.now();
    const createdLeads: Lead[] = [];
    
    // Obtener info del proveedor
    const providerDoc = await getDoc(doc(db, COLLECTIONS.PROVIDERS, providerId));
    if (!providerDoc.exists()) {
      throw new Error('Proveedor no encontrado');
    }
    const providerData = providerDoc.data();
    
    // Crear leads para cada usuario
    for (const userId of userIds) {
      // Obtener info del usuario
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
      if (!userDoc.exists()) continue;
      
      const userData = userDoc.data();
      
      const leadRef = doc(collection(db, COLLECTIONS.LEADS));
      const leadData = {
        userId,
        providerId,
        category,
        matchScore: 85, // Score por defecto para leads asignados manualmente
        status: 'pending' as LeadStatus,
        userInfo: {
          coupleNames: userData.coupleNames || '',
          eventDate: userData.eventDate || '',
          budget: userData.budget || '',
          region: userData.region || '',
          email: userData.email || '',
          phone: userData.phone || '',
        },
        providerInfo: {
          providerName: providerData.providerName || '',
          categories: providerData.categories || [],
          priceRange: providerData.priceRange || '',
        },
        assignedByAdmin: true, // Marcar como asignado por admin
        createdAt: now,
        updatedAt: now,
      };
      
      batch.set(leadRef, leadData);
      
      createdLeads.push({
        id: leadRef.id,
        ...leadData,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      });
    }
    
    await batch.commit();
    
    return createdLeads;
  } catch (error) {
    console.error('Error al asignar leads:', error);
    throw error;
  }
};

/**
 * Eliminar un lead
 */
export const deleteLead = async (leadId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.LEADS, leadId));
  } catch (error) {
    console.error('Error al eliminar lead:', error);
    throw error;
  }
};

/**
 * Actualizar lead (admin)
 */
export const adminUpdateLead = async (
  leadId: string,
  data: Partial<Lead>
): Promise<void> => {
  try {
    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: Timestamp.now(),
    };
    
    delete updateData.id;
    delete updateData.createdAt;
    
    await updateDoc(doc(db, COLLECTIONS.LEADS, leadId), updateData);
  } catch (error) {
    console.error('Error al actualizar lead:', error);
    throw error;
  }
};

/**
 * Obtener leads de un proveedor específico (para gestión de leads)
 */
export const getProviderLeadsForAdmin = async (providerId: string): Promise<Lead[]> => {
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

// ============================================
// FUNCIONES DE GESTIÓN DE USUARIOS (ADMIN)
// ============================================

/**
 * Actualizar usuario (admin)
 */
export const adminUpdateUser = async (
  userId: string,
  data: Partial<UserProfile>
): Promise<void> => {
  try {
    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: Timestamp.now(),
    };
    
    delete updateData.id;
    delete updateData.type;
    delete updateData.createdAt;
    
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), updateData);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
};

/**
 * Obtener un usuario específico
 */
export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  try {
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
    
    return null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
};

/**
 * Obtener un proveedor específico
 */
export const getProviderById = async (providerId: string): Promise<ProviderProfile | null> => {
  try {
    const providerDoc = await getDoc(doc(db, COLLECTIONS.PROVIDERS, providerId));
    
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
    console.error('Error al obtener proveedor:', error);
    throw error;
  }
};

