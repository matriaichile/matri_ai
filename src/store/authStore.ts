import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User as FirebaseUser } from 'firebase/auth';

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
  categories: string[];
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
  // Sistema de leads - cuántos leads puede recibir el proveedor
  leadLimit: number; // Límite máximo de leads asignados (por defecto 10)
  leadsUsed: number; // Cantidad de leads ya consumidos/asignados
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
