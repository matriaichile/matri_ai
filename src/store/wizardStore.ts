import { create } from 'zustand';

// ============================================
// TIPOS PARA EL WIZARD DE USUARIOS (NOVIOS)
// ============================================

export interface UserWizardData {
  // Paso 1: Información básica
  coupleNames: string;
  eventDate: string;
  isDateTentative: boolean;
  email: string;
  phone: string;
  
  // Paso 2: Detalles del evento
  budget: string;
  guestCount: string;
  region: string;
  
  // Paso 3: Tipo de ceremonia
  ceremonyTypes: string[]; // Civil, Religiosa, Simbólica
  
  // Paso 4: Estilo del evento
  eventStyle: string;
  
  // Paso 5: Nivel de avance
  planningProgress: string;
  completedItems: string[]; // DJ/VJ, Fotografía, Video, Lugar, Banquetería
  
  // Paso 6: Categorías prioritarias
  priorityCategories: string[];
  
  // Paso 7: Vinculación con el proceso
  involvementLevel: string;
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
  
  // Paso 2: Categoría y estilo
  category: string;
  serviceStyle: string;
  
  // Paso 3: Precios y ubicación
  priceRange: string;
  workRegion: string;
  acceptsOutsideZone: boolean;
  
  // Paso 4: Descripción
  description: string;
  
  // Paso 5: Redes y portfolio
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
  eventDate: '',
  isDateTentative: true,
  email: '',
  phone: '',
  budget: '',
  guestCount: '',
  region: '',
  ceremonyTypes: [],
  eventStyle: '',
  planningProgress: '',
  completedItems: [],
  priorityCategories: [],
  involvementLevel: '',
};

const initialProviderData: ProviderWizardData = {
  email: '',
  password: '',
  providerName: '',
  phone: '',
  category: '',
  serviceStyle: '',
  priceRange: '',
  workRegion: '',
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
  totalSteps: 8, // Se ajusta según el tipo de wizard
  
  userData: initialUserData,
  providerData: initialProviderData,
  
  isLoading: false,
  isTransitioning: false,
  showWelcome: true,
  
  setWizardType: (type) => set({ 
    wizardType: type,
    totalSteps: type === 'user' ? 8 : 6,
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
    totalSteps: 8,
    userData: initialUserData,
    providerData: initialProviderData,
    isLoading: false,
    isTransitioning: false,
    showWelcome: true,
  }),
}));

// ============================================
// CONSTANTES PARA LOS WIZARDS
// ============================================

export const CEREMONY_TYPES = [
  { id: 'civil', label: 'Civil', icon: '📜' },
  { id: 'religious', label: 'Religiosa', icon: '⛪' },
  { id: 'symbolic', label: 'Simbólica', icon: '💫' },
];

export const EVENT_STYLES = [
  { id: 'classic', label: 'Clásico & Elegante', description: 'Tradición y sofisticación' },
  { id: 'rustic', label: 'Rústico & Natural', description: 'Campo y naturaleza' },
  { id: 'modern', label: 'Moderno & Minimalista', description: 'Líneas limpias y contemporáneo' },
  { id: 'romantic', label: 'Romántico & Bohemio', description: 'Flores y detalles delicados' },
  { id: 'glamorous', label: 'Glamoroso & Lujoso', description: 'Opulencia y brillo' },
  { id: 'vintage', label: 'Vintage & Retro', description: 'Nostalgia y encanto' },
  { id: 'beach', label: 'Playero & Tropical', description: 'Sol, arena y mar' },
  { id: 'industrial', label: 'Industrial & Urbano', description: 'Lofts y espacios únicos' },
];

export const PLANNING_PROGRESS = [
  { id: 'nothing', label: 'Nada', percentage: 0 },
  { id: 'little', label: 'Poco', percentage: 25 },
  { id: 'half', label: 'La mitad', percentage: 50 },
  { id: 'most', label: 'Mucho', percentage: 75 },
  { id: 'almost', label: 'Casi listo', percentage: 95 },
];

export const COMPLETED_ITEMS = [
  { id: 'dj', label: 'DJ/VJ', icon: '🎵' },
  { id: 'photography', label: 'Fotografía', icon: '📷' },
  { id: 'video', label: 'Video', icon: '🎬' },
  { id: 'venue', label: 'Lugar', icon: '🏛️' },
  { id: 'catering', label: 'Banquetería', icon: '🍽️' },
];

export const PRIORITY_CATEGORIES = [
  { id: 'photography', label: 'Fotografía', icon: '📷' },
  { id: 'video', label: 'Video', icon: '🎬' },
  { id: 'dj', label: 'DJ/VJ', icon: '🎵' },
  { id: 'catering', label: 'Banquetería', icon: '🍽️' },
  { id: 'venue', label: 'Centro de Eventos', icon: '🏛️' },
  { id: 'decoration', label: 'Decoración', icon: '🌸' },
  { id: 'wedding_planner', label: 'Wedding Planner', icon: '📋' },
  { id: 'makeup', label: 'Maquillaje & Peinado', icon: '💄' },
];

export const INVOLVEMENT_LEVELS = [
  { id: '100', label: '100% Vinculados', description: 'Queremos participar en cada detalle' },
  { id: '80', label: '80% Vinculados', description: 'Muy involucrados pero delegamos algo' },
  { id: '60', label: '60% Vinculados', description: 'Balance entre participación y delegación' },
  { id: '40', label: '40% Vinculados', description: 'Preferimos delegar la mayoría' },
  { id: '20', label: '20% Vinculados', description: 'Solo decisiones importantes' },
  { id: '0', label: 'Todo delegado', description: 'Confío completamente en los profesionales' },
];

export const BUDGET_RANGES = [
  { id: 'under_5m', label: 'Menos de $5.000.000' },
  { id: '5m_10m', label: '$5.000.000 - $10.000.000' },
  { id: '10m_15m', label: '$10.000.000 - $15.000.000' },
  { id: '15m_20m', label: '$15.000.000 - $20.000.000' },
  { id: '20m_30m', label: '$20.000.000 - $30.000.000' },
  { id: '30m_50m', label: '$30.000.000 - $50.000.000' },
  { id: 'over_50m', label: 'Más de $50.000.000' },
];

export const GUEST_COUNTS = [
  { id: 'intimate', label: 'Íntimo (menos de 50)', icon: '👥' },
  { id: 'small', label: 'Pequeño (50-100)', icon: '👥' },
  { id: 'medium', label: 'Mediano (100-150)', icon: '👥' },
  { id: 'large', label: 'Grande (150-200)', icon: '👥' },
  { id: 'xlarge', label: 'Muy grande (200-300)', icon: '👥' },
  { id: 'massive', label: 'Masivo (más de 300)', icon: '👥' },
];

export const REGIONS = [
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

export const PROVIDER_CATEGORIES = [
  { id: 'photography', label: 'Fotografía', icon: '📷' },
  { id: 'video', label: 'Videografía', icon: '🎬' },
  { id: 'dj', label: 'DJ/VJ', icon: '🎵' },
  { id: 'catering', label: 'Banquetería', icon: '🍽️' },
  { id: 'venue', label: 'Centro de Eventos', icon: '🏛️' },
  { id: 'decoration', label: 'Decoración & Florería', icon: '🌸' },
  { id: 'wedding_planner', label: 'Wedding Planner', icon: '📋' },
  { id: 'makeup', label: 'Maquillaje & Peinado', icon: '💄' },
  { id: 'dress', label: 'Vestidos & Trajes', icon: '👗' },
  { id: 'cake', label: 'Tortas & Dulces', icon: '🎂' },
  { id: 'transport', label: 'Transporte', icon: '🚗' },
  { id: 'invitations', label: 'Invitaciones', icon: '💌' },
];

export const SERVICE_STYLES = [
  { id: 'traditional', label: 'Tradicional', description: 'Estilo clásico y atemporal' },
  { id: 'modern', label: 'Moderno', description: 'Tendencias actuales' },
  { id: 'artistic', label: 'Artístico', description: 'Creativo y único' },
  { id: 'documentary', label: 'Documental', description: 'Natural y espontáneo' },
  { id: 'cinematic', label: 'Cinemático', description: 'Estilo de película' },
  { id: 'editorial', label: 'Editorial', description: 'Estilo revista de moda' },
];

export const PRICE_RANGES_PROVIDER = [
  { id: 'budget', label: 'Económico', description: 'Precios accesibles' },
  { id: 'mid', label: 'Rango Medio', description: 'Calidad-precio equilibrado' },
  { id: 'premium', label: 'Premium', description: 'Servicio de alta gama' },
  { id: 'luxury', label: 'Lujo', description: 'Exclusividad total' },
];

