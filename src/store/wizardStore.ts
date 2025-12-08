import { create } from 'zustand';

// ============================================
// TIPOS PARA EL WIZARD DE USUARIOS (NOVIOS)
// ============================================

export interface UserWizardData {
  // Paso 1: Información básica
  coupleNames: string;
  email: string;
  password: string; // Nuevo: contraseña para usuarios
  phone: string;
  
  // Paso 2: Fecha del evento
  eventDate: string;
  isDateTentative: boolean;
  
  // Paso 3: Detalles del evento
  budget: string; // Campo legacy para compatibilidad
  budgetAmount: number; // Nuevo: presupuesto numérico en CLP
  guestCount: string;
  region: string;
  
  // Paso 4: Tipo de ceremonia
  ceremonyTypes: string[]; // Civil, Religiosa, Simbólica
  
  // Paso 5: Estilo del evento
  eventStyle: string;
  
  // Paso 6: Nivel de avance
  planningProgress: string;
  completedItems: string[]; // DJ/VJ, Fotografía, Video, Lugar, Banquetería
  
  // Paso 7: Categorías prioritarias
  priorityCategories: string[];
  
  // Paso 8: Vinculación con el proceso
  involvementLevel: string;
  
  // Paso 9: Expectativas y preferencias (para IA)
  expectations: string;
}

// ============================================
// TIPOS PARA EL WIZARD DE PROVEEDORES
// ============================================

export interface ProviderWizardData {
  // Paso 1: Datos básicos
  email: string;
  password: string;
  providerName: string;
  phone: string;
  
  // Paso 2: Categorías (ahora múltiples)
  categories: string[];
  
  // Paso 3: Estilo del servicio
  serviceStyle: string;
  
  // Paso 4: Precios y ubicación
  priceRange: string; // Campo legacy para compatibilidad
  priceMin: number; // Nuevo: precio mínimo en CLP
  priceMax: number; // Nuevo: precio máximo en CLP
  workRegions: string[]; // CAMBIO: ahora es múltiple
  workRegion: string; // Campo legacy para compatibilidad
  acceptsOutsideZone: boolean;
  
  // Paso 5: Descripción
  description: string;
  
  // Paso 6: Redes y portfolio
  website: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  portfolioImages: string[];
}

// ============================================
// ESTADO DEL WIZARD
// ============================================

interface WizardState {
  // Tipo de wizard activo
  wizardType: 'user' | 'provider' | null;
  
  // Paso actual
  currentStep: number;
  totalSteps: number;
  
  // Datos del usuario (novios)
  userData: UserWizardData;
  
  // Datos del proveedor
  providerData: ProviderWizardData;
  
  // Estados de UI
  isLoading: boolean;
  isTransitioning: boolean;
  showWelcome: boolean;
  
  // Acciones
  setWizardType: (type: 'user' | 'provider' | null) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // Actualizar datos de usuario
  updateUserData: (data: Partial<UserWizardData>) => void;
  
  // Actualizar datos de proveedor
  updateProviderData: (data: Partial<ProviderWizardData>) => void;
  
  // Estados de UI
  setIsLoading: (loading: boolean) => void;
  setIsTransitioning: (transitioning: boolean) => void;
  setShowWelcome: (show: boolean) => void;
  
  // Reset
  resetWizard: () => void;
}

// ============================================
// VALORES INICIALES
// ============================================

const initialUserData: UserWizardData = {
  coupleNames: '',
  email: '',
  password: '',
  phone: '',
  eventDate: '',
  isDateTentative: true,
  budget: '', // Campo legacy
  budgetAmount: 0, // Nuevo campo numérico
  guestCount: '',
  region: '',
  ceremonyTypes: [],
  eventStyle: '',
  planningProgress: '',
  completedItems: [],
  priorityCategories: [],
  involvementLevel: '',
  expectations: '',
};

const initialProviderData: ProviderWizardData = {
  email: '',
  password: '',
  providerName: '',
  phone: '',
  categories: [],
  serviceStyle: '',
  priceRange: '', // Campo legacy
  priceMin: 0, // Nuevo campo numérico
  priceMax: 0, // Nuevo campo numérico
  workRegions: [], // NUEVO: múltiples regiones
  workRegion: '', // Campo legacy
  acceptsOutsideZone: false,
  description: '',
  website: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  portfolioImages: [],
};

// ============================================
// STORE
// ============================================

export const useWizardStore = create<WizardState>((set, get) => ({
  wizardType: null,
  currentStep: 0,
  totalSteps: 9, // Usuario tiene 9 pasos (se eliminó vinculación)
  
  userData: initialUserData,
  providerData: initialProviderData,
  
  isLoading: false,
  isTransitioning: false,
  showWelcome: true,
  
  setWizardType: (type) => set({ 
    wizardType: type,
    totalSteps: type === 'user' ? 9 : 5, // 9 para usuarios (sin vinculación), 5 para proveedores (eliminado paso de estilos)
    currentStep: 0,
    showWelcome: true,
  }),
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  nextStep: () => {
    const { currentStep, totalSteps } = get();
    if (currentStep < totalSteps - 1) {
      set({ currentStep: currentStep + 1 });
    }
  },
  
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },
  
  updateUserData: (data) => set((state) => ({
    userData: { ...state.userData, ...data }
  })),
  
  updateProviderData: (data) => set((state) => ({
    providerData: { ...state.providerData, ...data }
  })),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsTransitioning: (transitioning) => set({ isTransitioning: transitioning }),
  setShowWelcome: (show) => set({ showWelcome: show }),
  
  resetWizard: () => set({
    wizardType: null,
    currentStep: 0,
    totalSteps: 9, // 9 pasos para usuarios (sin vinculación)
    userData: initialUserData,
    providerData: initialProviderData,
    isLoading: false,
    isTransitioning: false,
    showWelcome: true,
  }),
}));

// ============================================
// TIPOS PARA LAS CONSTANTES
// ============================================

export interface WizardOption {
  id: string;
  label: string;
  description?: string;
  percentage?: number;
  iconType?: string; // Identificador del tipo de icono
}

// ============================================
// CONSTANTES PARA LOS WIZARDS
// Los iconos se renderizan en los componentes usando iconType
// ============================================

export const CEREMONY_TYPES: WizardOption[] = [
  { id: 'civil', label: 'Civil', iconType: 'document' },
  { id: 'religious', label: 'Religiosa', iconType: 'church' },
  { id: 'symbolic', label: 'Simbólica', iconType: 'star' },
];

export const EVENT_STYLES: WizardOption[] = [
  { id: 'classic', label: 'Clásico & Elegante', description: 'Tradición y sofisticación' },
  { id: 'rustic', label: 'Rústico & Natural', description: 'Campo y naturaleza' },
  { id: 'modern', label: 'Moderno & Minimalista', description: 'Líneas limpias y contemporáneo' },
  { id: 'romantic', label: 'Romántico & Bohemio', description: 'Flores y detalles delicados' },
  { id: 'glamorous', label: 'Glamoroso & Lujoso', description: 'Opulencia y brillo' },
  { id: 'vintage', label: 'Vintage & Retro', description: 'Nostalgia y encanto' },
  { id: 'beach', label: 'Playero & Tropical', description: 'Sol, arena y mar' },
  { id: 'industrial', label: 'Industrial & Urbano', description: 'Lofts y espacios únicos' },
];

export const PLANNING_PROGRESS: WizardOption[] = [
  { id: 'nothing', label: 'Nada', percentage: 0 },
  { id: 'little', label: 'Poco', percentage: 25 },
  { id: 'half', label: 'La mitad', percentage: 50 },
  { id: 'most', label: 'Mucho', percentage: 75 },
  { id: 'almost', label: 'Casi listo', percentage: 95 },
];

export const COMPLETED_ITEMS: WizardOption[] = [
  { id: 'dj', label: 'DJ/VJ', iconType: 'music' },
  { id: 'photography', label: 'Fotografía', iconType: 'camera' },
  { id: 'video', label: 'Video', iconType: 'video' },
  { id: 'venue', label: 'Lugar', iconType: 'building' },
  { id: 'catering', label: 'Banquetería', iconType: 'utensils' },
];

// Categorías prioritarias ordenadas por importancia (nuevo orden)
// Actualizado con nuevas categorías: cakes, transport, invitations
export const PRIORITY_CATEGORIES: WizardOption[] = [
  { id: 'catering', label: 'Banquetería', iconType: 'utensils' },
  { id: 'venue', label: 'Centro de Eventos', iconType: 'building' },
  { id: 'photography', label: 'Fotografía', iconType: 'camera' },
  { id: 'video', label: 'Video', iconType: 'video' },
  { id: 'dj', label: 'DJ/VJ', iconType: 'music' },
  { id: 'decoration', label: 'Decoración & Florería', iconType: 'flower' },
  { id: 'entertainment', label: 'Entretenimiento', iconType: 'party' },
  { id: 'makeup', label: 'Maquillaje & Peinado', iconType: 'sparkles' },
  { id: 'cakes', label: 'Tortas & Dulces', iconType: 'cake' },
  { id: 'transport', label: 'Auto de Novios', iconType: 'car' },
  { id: 'invitations', label: 'Invitaciones', iconType: 'mail' },
  { id: 'dress', label: 'Vestidos & Trajes', iconType: 'dress' },
  { id: 'wedding_planner', label: 'Wedding Planner', iconType: 'clipboard' },
];

export const INVOLVEMENT_LEVELS: WizardOption[] = [
  { id: '100', label: '100% Vinculados', description: 'Queremos participar en cada detalle' },
  { id: '80', label: '80% Vinculados', description: 'Muy involucrados pero delegamos algo' },
  { id: '60', label: '60% Vinculados', description: 'Balance entre participación y delegación' },
  { id: '40', label: '40% Vinculados', description: 'Preferimos delegar la mayoría' },
  { id: '20', label: '20% Vinculados', description: 'Solo decisiones importantes' },
  { id: '0', label: 'Todo delegado', description: 'Confío completamente en los profesionales' },
];

export const BUDGET_RANGES: WizardOption[] = [
  { id: 'under_5m', label: 'Menos de $5.000.000' },
  { id: '5m_10m', label: '$5.000.000 - $10.000.000' },
  { id: '10m_15m', label: '$10.000.000 - $15.000.000' },
  { id: '15m_20m', label: '$15.000.000 - $20.000.000' },
  { id: '20m_30m', label: '$20.000.000 - $30.000.000' },
  { id: '30m_50m', label: '$30.000.000 - $50.000.000' },
  { id: 'over_50m', label: 'Más de $50.000.000' },
];

export const GUEST_COUNTS: WizardOption[] = [
  { id: 'intimate', label: 'Íntimo (menos de 50)', iconType: 'users' },
  { id: 'small', label: 'Pequeño (50-100)', iconType: 'users' },
  { id: 'medium', label: 'Mediano (100-150)', iconType: 'users' },
  { id: 'large', label: 'Grande (150-200)', iconType: 'users' },
  { id: 'xlarge', label: 'Muy grande (200-300)', iconType: 'users' },
  { id: 'massive', label: 'Masivo (más de 300)', iconType: 'users' },
];

export const REGIONS: WizardOption[] = [
  { id: 'rm', label: 'Región Metropolitana' },
  { id: 'valparaiso', label: 'Valparaíso' },
  { id: 'ohiggins', label: "O'Higgins" },
  { id: 'maule', label: 'Maule' },
  { id: 'biobio', label: 'Biobío' },
  { id: 'araucania', label: 'La Araucanía' },
  { id: 'los_rios', label: 'Los Ríos' },
  { id: 'los_lagos', label: 'Los Lagos' },
  { id: 'coquimbo', label: 'Coquimbo' },
  { id: 'atacama', label: 'Atacama' },
  { id: 'antofagasta', label: 'Antofagasta' },
  { id: 'tarapaca', label: 'Tarapacá' },
  { id: 'arica', label: 'Arica y Parinacota' },
  { id: 'aysen', label: 'Aysén' },
  { id: 'magallanes', label: 'Magallanes' },
  { id: 'nuble', label: 'Ñuble' },
];

// Categorías de proveedores ordenadas por importancia (nuevo orden)
// Actualizado con nuevas categorías: cakes, transport, invitations
export const PROVIDER_CATEGORIES: WizardOption[] = [
  { id: 'catering', label: 'Banquetería', iconType: 'utensils' },
  { id: 'venue', label: 'Centro de Eventos', iconType: 'building' },
  { id: 'photography', label: 'Fotografía', iconType: 'camera' },
  { id: 'video', label: 'Videografía', iconType: 'video' },
  { id: 'dj', label: 'DJ/VJ', iconType: 'music' },
  { id: 'decoration', label: 'Decoración & Florería', iconType: 'flower' },
  { id: 'entertainment', label: 'Entretenimiento', iconType: 'party' },
  { id: 'makeup', label: 'Maquillaje & Peinado', iconType: 'sparkles' },
  { id: 'cakes', label: 'Tortas & Dulces', iconType: 'cake' },
  { id: 'transport', label: 'Auto de Novios', iconType: 'car' },
  { id: 'invitations', label: 'Invitaciones', iconType: 'mail' },
  { id: 'dress', label: 'Vestidos & Trajes', iconType: 'dress' },
  { id: 'wedding_planner', label: 'Wedding Planner', iconType: 'clipboard' },
];

export const SERVICE_STYLES: WizardOption[] = [
  { id: 'traditional', label: 'Tradicional', description: 'Estilo clásico y atemporal' },
  { id: 'modern', label: 'Moderno', description: 'Tendencias actuales' },
  { id: 'artistic', label: 'Artístico', description: 'Creativo y único' },
  { id: 'documentary', label: 'Documental', description: 'Natural y espontáneo' },
  { id: 'cinematic', label: 'Cinemático', description: 'Estilo de película' },
  { id: 'editorial', label: 'Editorial', description: 'Estilo revista de moda' },
];

export const PRICE_RANGES_PROVIDER: WizardOption[] = [
  { id: 'budget', label: 'Económico', description: 'Precios accesibles' },
  { id: 'mid', label: 'Rango Medio', description: 'Calidad-precio equilibrado' },
  { id: 'premium', label: 'Premium', description: 'Servicio de alta gama' },
  { id: 'luxury', label: 'Lujo', description: 'Exclusividad total' },
];
