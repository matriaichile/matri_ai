import { create } from 'zustand';
import { UserProfile, ProviderProfile } from './authStore';
import { Lead } from '@/lib/firebase/firestore';

// ============================================
// TIPOS PARA ADMINISTRACIÓN
// ============================================

// Estadísticas generales del dashboard
export interface AdminStats {
  totalUsers: number;
  totalProviders: number;
  totalLeads: number;
  pendingProviders: number;
  activeProviders: number;
  closedProviders: number;
  leadsApproved: number;
  leadsRejected: number;
  leadsPending: number;
}

// Filtros para listas
export interface AdminFilters {
  search: string;
  status: string;
  category: string;
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

// Paginación
export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

// Estado del store de admin
interface AdminState {
  // Datos
  users: UserProfile[];
  providers: ProviderProfile[];
  leads: Lead[];
  stats: AdminStats | null;
  
  // Estados de carga
  isLoadingUsers: boolean;
  isLoadingProviders: boolean;
  isLoadingLeads: boolean;
  isLoadingStats: boolean;
  
  // Filtros y paginación
  userFilters: AdminFilters;
  providerFilters: AdminFilters;
  leadFilters: AdminFilters;
  userPagination: Pagination;
  providerPagination: Pagination;
  leadPagination: Pagination;
  
  // Elemento seleccionado para edición
  selectedUser: UserProfile | null;
  selectedProvider: ProviderProfile | null;
  selectedLead: Lead | null;
  
  // Modal states
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isLeadAssignModalOpen: boolean;
  
  // Errores
  error: string | null;
  
  // Acciones - Setters
  setUsers: (users: UserProfile[]) => void;
  setProviders: (providers: ProviderProfile[]) => void;
  setLeads: (leads: Lead[]) => void;
  setStats: (stats: AdminStats) => void;
  
  setIsLoadingUsers: (loading: boolean) => void;
  setIsLoadingProviders: (loading: boolean) => void;
  setIsLoadingLeads: (loading: boolean) => void;
  setIsLoadingStats: (loading: boolean) => void;
  
  setUserFilters: (filters: Partial<AdminFilters>) => void;
  setProviderFilters: (filters: Partial<AdminFilters>) => void;
  setLeadFilters: (filters: Partial<AdminFilters>) => void;
  
  setUserPagination: (pagination: Partial<Pagination>) => void;
  setProviderPagination: (pagination: Partial<Pagination>) => void;
  setLeadPagination: (pagination: Partial<Pagination>) => void;
  
  setSelectedUser: (user: UserProfile | null) => void;
  setSelectedProvider: (provider: ProviderProfile | null) => void;
  setSelectedLead: (lead: Lead | null) => void;
  
  setIsEditModalOpen: (open: boolean) => void;
  setIsDeleteModalOpen: (open: boolean) => void;
  setIsLeadAssignModalOpen: (open: boolean) => void;
  
  setError: (error: string | null) => void;
  
  // Acciones - Helpers
  clearFilters: () => void;
  resetState: () => void;
}

// ============================================
// VALORES INICIALES
// ============================================

const initialFilters: AdminFilters = {
  search: '',
  status: '',
  category: '',
  dateRange: {
    start: null,
    end: null,
  },
};

const initialPagination: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
};

const initialStats: AdminStats = {
  totalUsers: 0,
  totalProviders: 0,
  totalLeads: 0,
  pendingProviders: 0,
  activeProviders: 0,
  closedProviders: 0,
  leadsApproved: 0,
  leadsRejected: 0,
  leadsPending: 0,
};

// ============================================
// STORE
// ============================================

export const useAdminStore = create<AdminState>()((set) => ({
  // Datos iniciales
  users: [],
  providers: [],
  leads: [],
  stats: null,
  
  // Estados de carga
  isLoadingUsers: false,
  isLoadingProviders: false,
  isLoadingLeads: false,
  isLoadingStats: false,
  
  // Filtros y paginación
  userFilters: { ...initialFilters },
  providerFilters: { ...initialFilters },
  leadFilters: { ...initialFilters },
  userPagination: { ...initialPagination },
  providerPagination: { ...initialPagination },
  leadPagination: { ...initialPagination },
  
  // Selecciones
  selectedUser: null,
  selectedProvider: null,
  selectedLead: null,
  
  // Modales
  isEditModalOpen: false,
  isDeleteModalOpen: false,
  isLeadAssignModalOpen: false,
  
  // Error
  error: null,
  
  // Setters
  setUsers: (users) => set({ users }),
  setProviders: (providers) => set({ providers }),
  setLeads: (leads) => set({ leads }),
  setStats: (stats) => set({ stats }),
  
  setIsLoadingUsers: (loading) => set({ isLoadingUsers: loading }),
  setIsLoadingProviders: (loading) => set({ isLoadingProviders: loading }),
  setIsLoadingLeads: (loading) => set({ isLoadingLeads: loading }),
  setIsLoadingStats: (loading) => set({ isLoadingStats: loading }),
  
  setUserFilters: (filters) => 
    set((state) => ({ 
      userFilters: { ...state.userFilters, ...filters } 
    })),
  setProviderFilters: (filters) => 
    set((state) => ({ 
      providerFilters: { ...state.providerFilters, ...filters } 
    })),
  setLeadFilters: (filters) => 
    set((state) => ({ 
      leadFilters: { ...state.leadFilters, ...filters } 
    })),
  
  setUserPagination: (pagination) => 
    set((state) => ({ 
      userPagination: { ...state.userPagination, ...pagination } 
    })),
  setProviderPagination: (pagination) => 
    set((state) => ({ 
      providerPagination: { ...state.providerPagination, ...pagination } 
    })),
  setLeadPagination: (pagination) => 
    set((state) => ({ 
      leadPagination: { ...state.leadPagination, ...pagination } 
    })),
  
  setSelectedUser: (user) => set({ selectedUser: user }),
  setSelectedProvider: (provider) => set({ selectedProvider: provider }),
  setSelectedLead: (lead) => set({ selectedLead: lead }),
  
  setIsEditModalOpen: (open) => set({ isEditModalOpen: open }),
  setIsDeleteModalOpen: (open) => set({ isDeleteModalOpen: open }),
  setIsLeadAssignModalOpen: (open) => set({ isLeadAssignModalOpen: open }),
  
  setError: (error) => set({ error }),
  
  // Helpers
  clearFilters: () => set({
    userFilters: { ...initialFilters },
    providerFilters: { ...initialFilters },
    leadFilters: { ...initialFilters },
  }),
  
  resetState: () => set({
    users: [],
    providers: [],
    leads: [],
    stats: null,
    isLoadingUsers: false,
    isLoadingProviders: false,
    isLoadingLeads: false,
    isLoadingStats: false,
    userFilters: { ...initialFilters },
    providerFilters: { ...initialFilters },
    leadFilters: { ...initialFilters },
    userPagination: { ...initialPagination },
    providerPagination: { ...initialPagination },
    leadPagination: { ...initialPagination },
    selectedUser: null,
    selectedProvider: null,
    selectedLead: null,
    isEditModalOpen: false,
    isDeleteModalOpen: false,
    isLeadAssignModalOpen: false,
    error: null,
  }),
}));









