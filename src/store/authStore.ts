import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User as FirebaseUser } from 'firebase/auth';

// ============================================
// TIPOS PARA CATEGORÍAS
// ============================================

// Las 8 categorías del sistema
export type CategoryId = 
  | 'photography' 
  | 'video' 
  | 'dj' 
  | 'catering' 
  | 'venue' 
  | 'decoration' 
  | 'wedding_planner' 
  | 'makeup';

// Estado de encuesta por categoría
export type CategorySurveyStatus = 'not_started' | 'completed' | 'matches_generated';

// Mapa de estado de encuestas por categoría
export type CategorySurveyStatusMap = {
  [key in CategoryId]?: CategorySurveyStatus;
};

// Mapa de límites/uso de leads por categoría (para proveedores)
export type CategoryLeadLimitsMap = {
  [key in CategoryId]?: number;
};

// ============================================
// TIPOS PARA USUARIOS
// ============================================

export type UserType = 'user' | 'provider' | 'admin';
export type ProviderStatus = 'active' | 'pending' | 'closed';

// Perfil de administrador
export interface AdminProfile {
  id: string;
  type: 'admin';
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Datos del perfil de usuario (novios)
export interface UserProfile {
  id: string;
  type: 'user';
  email: string;
  coupleNames: string;
  phone: string;
  eventDate: string;
  isDateTentative: boolean;
  budget: string;
  guestCount: string;
  region: string;
  ceremonyTypes: string[];
  eventStyle: string;
  planningProgress: string;
  completedItems: string[];
  priorityCategories: string[];
  involvementLevel: string;
  expectations: string;
  // Estado de encuestas por categoría - NUEVO
  categorySurveyStatus: CategorySurveyStatusMap;
  createdAt: Date;
  updatedAt: Date;
}

// Datos del perfil de proveedor
export interface ProviderProfile {
  id: string;
  type: 'provider';
  email: string;
  providerName: string;
  phone: string;
  categories: CategoryId[]; // Categorías que ofrece
  serviceStyle: string;
  priceRange: string;
  workRegion: string;
  acceptsOutsideZone: boolean;
  description: string;
  website: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  portfolioImages: string[];
  status: ProviderStatus;
  // Sistema de leads POR CATEGORÍA - NUEVO
  categoryLeadLimits: CategoryLeadLimitsMap; // Límite máximo de leads por categoría
  categoryLeadsUsed: CategoryLeadLimitsMap; // Leads consumidos por categoría
  categorySurveyStatus: CategorySurveyStatusMap; // Estado de encuestas por categoría
  // Campos legacy para compatibilidad
  leadLimit: number;
  leadsUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

export type UserProfileData = UserProfile | ProviderProfile | AdminProfile;

// ============================================
// ESTADO DE AUTENTICACIÓN
// ============================================

interface AuthState {
  // Estado del usuario de Firebase
  firebaseUser: FirebaseUser | null;
  
  // Datos del perfil del usuario (de Firestore)
  userProfile: UserProfileData | null;
  
  // Tipo de usuario
  userType: UserType | null;
  
  // Estados de carga
  isLoading: boolean;
  isInitialized: boolean;
  
  // Errores
  error: string | null;
  
  // Acciones
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setUserProfile: (profile: UserProfileData | null) => void;
  setUserType: (type: UserType | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsInitialized: (initialized: boolean) => void;
  setError: (error: string | null) => void;
  
  // Limpiar estado (logout)
  clearAuth: () => void;
  
  // Helpers
  isAuthenticated: () => boolean;
  isUser: () => boolean;
  isProvider: () => boolean;
  isAdmin: () => boolean;
  
  // Helpers para categorías - NUEVO
  getCategorySurveyStatus: (category: CategoryId) => CategorySurveyStatus;
  getCategoryLeadsRemaining: (category: CategoryId) => number;
}

// ============================================
// STORE
// ============================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      firebaseUser: null,
      userProfile: null,
      userType: null,
      isLoading: true,
      isInitialized: false,
      error: null,
      
      setFirebaseUser: (user) => set({ firebaseUser: user }),
      
      setUserProfile: (profile) => set({ 
        userProfile: profile,
        userType: profile?.type || null 
      }),
      
      setUserType: (type) => set({ userType: type }),
      
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      setIsInitialized: (initialized) => set({ isInitialized: initialized }),
      
      setError: (error) => set({ error }),
      
      clearAuth: () => set({
        firebaseUser: null,
        userProfile: null,
        userType: null,
        error: null,
      }),
      
      isAuthenticated: () => {
        const { firebaseUser } = get();
        return firebaseUser !== null;
      },
      
      isUser: () => {
        const { userType } = get();
        return userType === 'user';
      },
      
      isProvider: () => {
        const { userType } = get();
        return userType === 'provider';
      },
      
      isAdmin: () => {
        const { userType } = get();
        return userType === 'admin';
      },
      
      // Obtener estado de encuesta para una categoría específica
      getCategorySurveyStatus: (category: CategoryId): CategorySurveyStatus => {
        const { userProfile } = get();
        if (!userProfile) return 'not_started';
        
        if (userProfile.type === 'user') {
          return (userProfile as UserProfile).categorySurveyStatus?.[category] || 'not_started';
        }
        
        if (userProfile.type === 'provider') {
          return (userProfile as ProviderProfile).categorySurveyStatus?.[category] || 'not_started';
        }
        
        return 'not_started';
      },
      
      // Obtener leads restantes para una categoría (solo proveedores)
      getCategoryLeadsRemaining: (category: CategoryId): number => {
        const { userProfile } = get();
        if (!userProfile || userProfile.type !== 'provider') return 0;
        
        const provider = userProfile as ProviderProfile;
        const limit = provider.categoryLeadLimits?.[category] || 10;
        const used = provider.categoryLeadsUsed?.[category] || 0;
        
        return Math.max(0, limit - used);
      },
    }),
    {
      name: 'matri-auth-storage',
      // Solo persistir algunos campos (no el firebaseUser ya que Firebase maneja su propia persistencia)
      partialize: (state) => ({
        userType: state.userType,
      }),
    }
  )
);

// ============================================
// CONSTANTES DE CATEGORÍAS
// ============================================

export const CATEGORY_INFO: Record<CategoryId, { id: CategoryId; name: string; icon: string }> = {
  photography: { id: 'photography', name: 'Fotografía', icon: 'camera' },
  video: { id: 'video', name: 'Videografía', icon: 'video' },
  dj: { id: 'dj', name: 'DJ/VJ', icon: 'music' },
  catering: { id: 'catering', name: 'Banquetería', icon: 'utensils' },
  venue: { id: 'venue', name: 'Centro de Eventos', icon: 'building' },
  decoration: { id: 'decoration', name: 'Decoración', icon: 'flower' },
  wedding_planner: { id: 'wedding_planner', name: 'Wedding Planner', icon: 'clipboard' },
  makeup: { id: 'makeup', name: 'Maquillaje & Peinado', icon: 'sparkles' },
};

export const ALL_CATEGORIES: CategoryId[] = [
  'photography',
  'video',
  'dj',
  'catering',
  'venue',
  'decoration',
  'wedding_planner',
  'makeup',
];
