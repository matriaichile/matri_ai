'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Clock, 
  CheckCircle, 
  XCircle,
  Users,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  DollarSign,
  MapPin,
  Star,
  Edit3,
  Eye,
  BarChart3,
  Inbox,
  ExternalLink,
  Camera,
  Music,
  Utensils,
  Building2,
  Video,
  Flower2,
  ClipboardList,
  Palette,
  Instagram,
  Globe,
  AlertCircle,
  ChevronRight,
  Check,
  FileText,
  Copy,
  X,
  Heart,
  Sparkles,
  Save,
  ChevronDown,
  ChevronUp,
  Filter,
  Plus,
  PartyPopper,
  Shirt,
  Cake,
  Car,
  Send
} from 'lucide-react';
import { useAuthStore, ProviderProfile, CategoryId, UserProfile, PortfolioImage, ProfileImageData } from '@/store/authStore';
import { logout } from '@/lib/firebase/auth';
import { PROVIDER_CATEGORIES, REGIONS, PRICE_RANGES_PROVIDER, SERVICE_STYLES } from '@/store/wizardStore';
import { useToast } from '@/components/ui/Toast';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Sidebar, DashboardHeader, DashboardLayout, EmptyState, LoadingState } from '@/components/dashboard';
import { CATEGORY_INFO, getCategoryInfo, CATEGORY_SURVEYS, getSurveyQuestions, SurveyQuestion } from '@/lib/surveys';
import { updateProviderProfile, getUserCategorySurveyById, getProviderCategorySurvey, UserCategorySurvey, ProviderCategorySurvey } from '@/lib/firebase/firestore';
import { getMatchCategory, getMatchCategoryStyles, getMatchCategoryStylesCompact, getMatchCategoryStylesLarge } from '@/lib/matching/matchCategories';
import { CATEGORY_MATCHING_CRITERIA, calculateCriterionMatch } from '@/lib/matching/comparisonUtils';
import { PortfolioUploader, ProfileImageEditor } from '@/components/portfolio';
import { updateProviderPortfolioImages } from '@/lib/firebase/firestore';
import styles from './page.module.css';

// Interfaz para los leads con info extendida
interface Lead {
  id: string;
  userId: string;
  category: string;
  matchScore: number;
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
  userInfo: {
    coupleNames: string;
    eventDate: string;
    budget: string;
    region: string;
    email: string;
    phone: string;
  };
  // IDs de encuestas para acceso seguro
  userSurveyId?: string;
  providerSurveyId?: string;
  createdAt: Date;
}

// Interfaz para el perfil completo del usuario (para el modal)
interface ExtendedUserInfo extends UserProfile {
  categorySurvey?: UserCategorySurvey | null;
}

// Iconos por categoría
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  photography: <Camera size={18} />,
  video: <Video size={18} />,
  dj: <Music size={18} />,
  catering: <Utensils size={18} />,
  venue: <Building2 size={18} />,
  decoration: <Flower2 size={18} />,
  wedding_planner: <ClipboardList size={18} />,
  makeup: <Palette size={18} />,
  entertainment: <PartyPopper size={18} />,
  dress: <Shirt size={18} />,
  cakes: <Cake size={18} />,
  transport: <Car size={18} />,
  invitations: <Send size={18} />,
};

// Labels de presupuesto
const BUDGET_LABELS: Record<string, string> = {
  'under_5m': 'Menos de $5M',
  '5m_10m': '$5M - $10M',
  '10m_15m': '$10M - $15M',
  '15m_20m': '$15M - $20M',
  '20m_30m': '$20M - $30M',
  '30m_50m': '$30M - $50M',
  'over_50m': 'Más de $50M',
};

// Labels de cantidad de invitados
const GUEST_COUNT_LABELS: Record<string, string> = {
  'under_50': 'Menos de 50',
  '50_100': '50 - 100',
  '100_150': '100 - 150',
  '150_200': '150 - 200',
  '200_300': '200 - 300',
  'over_300': 'Más de 300',
};

// Labels de estilos
const EVENT_STYLE_LABELS: Record<string, string> = {
  'classic': 'Clásico/Tradicional',
  'modern': 'Moderno/Minimalista',
  'romantic': 'Romántico',
  'rustic': 'Rústico/Campestre',
  'bohemian': 'Bohemio',
  'luxury': 'Lujo/Glamour',
  'beach': 'Playero',
  'vintage': 'Vintage',
};

/**
 * Dashboard del proveedor.
 * Diseño elegante y minimalista con sidebar.
 */
export default function ProviderDashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const { isAuthenticated, userProfile, userType, isLoading, firebaseUser, setUserProfile } = useAuthStore();
  const [activeSection, setActiveSection] = useState<'overview' | 'leads' | 'surveys' | 'portfolio' | 'profile'>('overview');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [extendedUserInfo, setExtendedUserInfo] = useState<ExtendedUserInfo | null>(null);
  const [providerSurvey, setProviderSurvey] = useState<ProviderCategorySurvey | null>(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  
  // Estados para edición de perfil
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<ProviderProfile>>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [editingCategories, setEditingCategories] = useState<CategoryId[]>([]);
  
  // Estados para secciones expandibles en el modal
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basicInfo: true,
    eventDetails: true,
    surveyComparison: false,
  });

  // Verificar autenticación y tipo de usuario
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated()) {
        router.push('/login');
      } else if (userType === 'user') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, userType, isLoading, router]);

  // Cargar leads del proveedor
  useEffect(() => {
    const loadLeads = async () => {
      if (!firebaseUser?.uid) return;

      try {
        setLoadingLeads(true);
        
        const leadsRef = collection(db, 'leads');
        const q = query(
          leadsRef, 
          where('providerId', '==', firebaseUser.uid),
          orderBy('matchScore', 'desc')
        );
        const snapshot = await getDocs(q);
        
        const leadsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Lead[];

        setLeads(leadsData);
      } catch (error) {
        console.error('Error cargando leads:', error);
      } finally {
        setLoadingLeads(false);
      }
    };

    loadLeads();
  }, [firebaseUser?.uid]);

  // Función para copiar al portapapeles
  const copyToClipboard = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  }, []);

  // Función para cargar info extendida del usuario cuando se abre el modal
  // NOTA: Los proveedores NO tienen acceso directo a /users/{userId}
  // La info del usuario está denormalizada en el lead (userInfo)
  // Para la encuesta, usamos el userSurveyId del lead para acceso seguro
  const loadExtendedUserInfo = useCallback(async (lead: Lead) => {
    setLoadingModal(true);
    try {
      // Crear objeto con la info del usuario desde el lead (ya denormalizada)
      // No accedemos a /users/{userId} directamente por seguridad
      const extendedInfo: ExtendedUserInfo = {
        id: lead.userId,
        type: 'user',
        email: lead.userInfo.email,
        coupleNames: lead.userInfo.coupleNames,
        phone: lead.userInfo.phone,
        eventDate: lead.userInfo.eventDate,
        budget: lead.userInfo.budget,
        budgetAmount: 0, // No disponible en userInfo denormalizada
        region: lead.userInfo.region,
        // Campos que no tenemos en userInfo - se mostrarán como vacíos
        isDateTentative: false,
        guestCount: '',
        ceremonyTypes: [],
        eventStyle: '',
        planningProgress: '',
        completedItems: [],
        priorityCategories: [],
        involvementLevel: '',
        expectations: '',
        categorySurveyStatus: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Cargar encuesta del usuario usando el userSurveyId del lead
      // Esto es seguro porque el proveedor solo puede acceder a encuestas
      // de usuarios que son sus leads (tiene el ID específico)
      if (lead.userSurveyId) {
        try {
          const userSurvey = await getUserCategorySurveyById(lead.userSurveyId);
          if (userSurvey) {
            extendedInfo.categorySurvey = userSurvey;
          }
        } catch (surveyError) {
          console.warn('No se pudo cargar la encuesta del usuario:', surveyError);
        }
      }
      
      setExtendedUserInfo(extendedInfo);
      
      // Cargar encuesta del proveedor para comparación
      if (firebaseUser?.uid) {
        const provSurvey = await getProviderCategorySurvey(firebaseUser.uid, lead.category as CategoryId);
        setProviderSurvey(provSurvey);
      }
    } catch (error) {
      console.error('Error cargando info del usuario:', error);
    } finally {
      setLoadingModal(false);
    }
  }, [firebaseUser?.uid]);

  // Abrir modal con lead seleccionado
  const handleOpenLeadModal = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    loadExtendedUserInfo(lead);
  }, [loadExtendedUserInfo]);

  // Cerrar modal
  const handleCloseModal = useCallback(() => {
    setSelectedLead(null);
    setExtendedUserInfo(null);
    setProviderSurvey(null);
  }, []);

  // Toggle sección expandible
  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Iniciar edición de perfil
  const startEditing = useCallback(() => {
    if (userProfile && userProfile.type === 'provider') {
      const providerData = userProfile as ProviderProfile;
      setEditFormData({
        providerName: providerData.providerName,
        phone: providerData.phone,
        description: providerData.description,
        website: providerData.website,
        instagram: providerData.instagram,
        serviceStyle: providerData.serviceStyle,
        priceRange: providerData.priceRange,
        workRegion: providerData.workRegion,
        acceptsOutsideZone: providerData.acceptsOutsideZone,
      });
      setEditingCategories(providerData.categories || []);
      setIsEditing(true);
    }
  }, [userProfile]);

  // Guardar cambios del perfil
  const saveProfile = useCallback(async () => {
    if (!firebaseUser?.uid || !editFormData) return;
    
    setSavingProfile(true);
    try {
      const currentProfile = userProfile as ProviderProfile;
      const currentCategories = currentProfile?.categories || [];
      
      // Detectar nuevas categorías agregadas
      const newCategories = editingCategories.filter(cat => !currentCategories.includes(cat));
      
      // Preparar datos de actualización
      const updateData: Partial<ProviderProfile> = {
        ...editFormData,
        categories: editingCategories,
      };
      
      // Si hay nuevas categorías, inicializar sus campos
      if (newCategories.length > 0) {
        const newCategoryLeadLimits = { ...(currentProfile?.categoryLeadLimits || {}) };
        const newCategoryLeadsUsed = { ...(currentProfile?.categoryLeadsUsed || {}) };
        const newCategorySurveyStatus = { ...(currentProfile?.categorySurveyStatus || {}) };
        
        for (const cat of newCategories) {
          newCategoryLeadLimits[cat] = 10; // 10 leads por defecto
          newCategoryLeadsUsed[cat] = 0;
          newCategorySurveyStatus[cat] = 'not_started';
        }
        
        updateData.categoryLeadLimits = newCategoryLeadLimits;
        updateData.categoryLeadsUsed = newCategoryLeadsUsed;
        updateData.categorySurveyStatus = newCategorySurveyStatus;
      }
      
      await updateProviderProfile(firebaseUser.uid, updateData);
      
      // Actualizar el store local con los datos actualizados
      const updatedProfile = {
        ...userProfile,
        ...updateData,
      } as ProviderProfile;
      
      setUserProfile(updatedProfile);
      
      // Log para verificar la actualización
      console.log('✅ Perfil actualizado:', {
        categories: updatedProfile.categories,
        categorySurveyStatus: updatedProfile.categorySurveyStatus,
        categoryLeadLimits: updatedProfile.categoryLeadLimits,
        categoryLeadsUsed: updatedProfile.categoryLeadsUsed,
      });
      
      // Mostrar mensaje de éxito si se agregaron nuevas categorías
      if (newCategories.length > 0) {
        const newCatLabels = newCategories.map(c => PROVIDER_CATEGORIES.find(pc => pc.id === c)?.label || c).join(', ');
        toast.success('¡Categorías agregadas!', `Ahora debes completar las encuestas de: ${newCatLabels}`, 6000);
      } else {
        toast.success('¡Perfil actualizado!', 'Los cambios se han guardado correctamente');
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error guardando perfil:', error);
      toast.error('Error al guardar', 'No se pudo guardar el perfil. Por favor, intenta de nuevo.');
    } finally {
      setSavingProfile(false);
    }
  }, [firebaseUser?.uid, editFormData, editingCategories, userProfile, setUserProfile]);

  // Cancelar edición
  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditFormData({});
    setEditingCategories([]);
  }, []);

  // Toggle categoría en edición
  const toggleCategory = useCallback((categoryId: CategoryId) => {
    setEditingCategories(prev => {
      if (prev.includes(categoryId)) {
        // No permitir quitar la última categoría
        if (prev.length <= 1) return prev;
        return prev.filter(c => c !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  }, []);

  // Handlers para el portafolio
  const handlePortfolioImageUploaded = useCallback((newImage: PortfolioImage) => {
    if (!userProfile || userProfile.type !== 'provider') return;
    
    const currentImages = (userProfile as ProviderProfile).portfolioImages || [];
    const updatedImages = [...currentImages, newImage];
    
    // Actualizar el store local
    setUserProfile({
      ...userProfile,
      portfolioImages: updatedImages,
    } as ProviderProfile);
  }, [userProfile, setUserProfile]);

  const handlePortfolioImageDeleted = useCallback((key: string) => {
    if (!userProfile || userProfile.type !== 'provider') return;
    
    const currentImages = (userProfile as ProviderProfile).portfolioImages || [];
    const updatedImages = currentImages
      .filter(img => img.key !== key)
      .map((img, index) => ({ ...img, order: index }));
    
    // Actualizar el store local
    setUserProfile({
      ...userProfile,
      portfolioImages: updatedImages,
    } as ProviderProfile);
  }, [userProfile, setUserProfile]);

  const handlePortfolioImagesReordered = useCallback(async (reorderedImages: PortfolioImage[]) => {
    if (!userProfile || userProfile.type !== 'provider' || !firebaseUser?.uid) return;
    
    // Actualizar el store local inmediatamente
    setUserProfile({
      ...userProfile,
      portfolioImages: reorderedImages,
    } as ProviderProfile);
    
    // Guardar en Firestore
    try {
      await updateProviderPortfolioImages(firebaseUser.uid, reorderedImages);
    } catch (error) {
      console.error('Error al guardar el orden de las imágenes:', error);
    }
  }, [userProfile, setUserProfile, firebaseUser?.uid]);

  // Handler para guardar la imagen de perfil
  const handleProfileImageSaved = useCallback(async (imageData: ProfileImageData) => {
    if (!userProfile || userProfile.type !== 'provider' || !firebaseUser?.uid) return;
    
    // Actualizar el store local inmediatamente
    setUserProfile({
      ...userProfile,
      profileImage: imageData,
    } as ProviderProfile);
    
    // Guardar en Firestore
    try {
      await updateProviderProfile(firebaseUser.uid, { profileImage: imageData });
    } catch (error) {
      console.error('Error al guardar la imagen de perfil:', error);
    }
  }, [userProfile, setUserProfile, firebaseUser?.uid]);

  const getCategoryLabel = (id: string) => PROVIDER_CATEGORIES.find((c) => c.id === id)?.label || id;
  const getRegionLabel = (id: string) => REGIONS.find((r) => r.id === id)?.label || id;
  const getPriceLabel = (id: string) => PRICE_RANGES_PROVIDER.find((p) => p.id === id)?.label || id;
  const getStyleLabel = (id: string) => SERVICE_STYLES.find((s) => s.id === id)?.label || id;

  // Función para obtener label de una respuesta de encuesta
  const getSurveyAnswerLabel = (questionId: string, answer: string | string[] | number | boolean | undefined, questions: SurveyQuestion[]): string => {
    if (answer === undefined) return 'No especificado';
    
    const question = questions.find(q => q.id === questionId);
    if (!question) return String(answer);
    
    if (question.type === 'boolean') {
      return answer ? 'Sí' : 'No';
    }
    
    if (question.type === 'multiple' && Array.isArray(answer)) {
      return answer.map(a => {
        const opt = question.options?.find(o => o.id === a);
        return opt?.label || a;
      }).join(', ');
    }
    
    if (question.options) {
      const opt = question.options.find(o => o.id === answer);
      return opt?.label || String(answer);
    }
    
    return String(answer);
  };

  if (isLoading) {
    return <LoadingState message="Cargando tu dashboard..." fullScreen />;
  }

  const profile = userProfile as ProviderProfile | null;
  const isPending = profile?.status === 'pending';
  const isClosed = profile?.status === 'closed';

  // Filtrar leads por categoría
  const filteredLeads = selectedCategory === 'all' 
    ? leads 
    : leads.filter(l => l.category === selectedCategory);

  // Estadísticas
  const totalLeads = leads.length;
  const pendingLeads = leads.filter(l => l.status === 'pending').length;
  const approvedLeads = leads.filter(l => l.status === 'approved').length;
  const matchRate = totalLeads > 0 ? Math.round((approvedLeads / totalLeads) * 100) : 0;

  // Calcular encuestas completadas por categoría
  const completedSurveysCount = profile?.categorySurveyStatus 
    ? Object.values(profile.categorySurveyStatus).filter(status => status === 'completed').length 
    : 0;

  // Agrupar leads por categoría para stats
  const leadsByCategory = leads.reduce((acc, lead) => {
    acc[lead.category] = (acc[lead.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Configuración del header según la sección activa
  const headerConfig = {
    overview: { title: 'Resumen', subtitle: 'Vista general de tu rendimiento' },
    leads: { title: 'Mis Leads', subtitle: 'Parejas interesadas en tus servicios' },
    surveys: { title: 'Encuestas por Categoría', subtitle: 'Completa las encuestas para recibir mejores matches' },
    portfolio: { title: 'Mi Portafolio', subtitle: 'Muestra tu mejor trabajo a las parejas' },
    profile: { title: 'Mi Perfil', subtitle: 'Información de tu negocio' },
  };

  return (
    <DashboardLayout
      sidebar={
        <Sidebar
          variant="provider"
          profile={profile}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onLogout={handleLogout}
          pendingLeadsCount={pendingLeads}
          categoryIcon={profile?.categories?.[0] ? CATEGORY_ICONS[profile.categories[0]] : undefined}
          completedSurveysCount={completedSurveysCount}
        />
      }
    >
      {/* Banner de estado */}
      {isPending && (
        <div className={styles.statusBanner}>
          <Clock size={20} />
          <div className={styles.statusBannerContent}>
            <h3>Tu cuenta está en revisión</h3>
            <p>Estamos verificando tu perfil. Te notificaremos cuando esté activa.</p>
          </div>
        </div>
      )}

      {isClosed && (
        <div className={`${styles.statusBanner} ${styles.statusBannerClosed}`}>
          <AlertCircle size={20} />
          <div className={styles.statusBannerContent}>
            <h3>Tu cuenta está cerrada</h3>
            <p>Contacta al administrador si deseas reactivar tu cuenta.</p>
          </div>
        </div>
      )}

      <DashboardHeader
        title={headerConfig[activeSection].title}
        subtitle={headerConfig[activeSection].subtitle}
        userName={profile?.providerName}
        showUserBadge
      />

      <div className={styles.content}>
        {/* Sección Overview */}
        {activeSection === 'overview' && (
          <div className={styles.overviewSection}>
            {/* Stats Grid */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Users size={24} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{totalLeads}</span>
                  <span className={styles.statLabel}>Leads totales</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.statIconPending}`}>
                  <Clock size={24} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{pendingLeads}</span>
                  <span className={styles.statLabel}>Pendientes</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>
                  <CheckCircle size={24} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{approvedLeads}</span>
                  <span className={styles.statLabel}>Aprobados</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.statIconTrend}`}>
                  <TrendingUp size={24} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{matchRate}%</span>
                  <span className={styles.statLabel}>Tasa de éxito</span>
                </div>
              </div>
            </div>

            {/* Métricas de visibilidad */}
            {profile?.metrics && (
              <div className={styles.metricsSection}>
                <div className={styles.sectionHeader}>
                  <h2>Tu visibilidad</h2>
                  <span className={styles.sectionSubtitle}>Estadísticas de cómo te ven las parejas</span>
                </div>
                <div className={styles.metricsGrid}>
                  <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>
                      <Eye size={20} />
                    </div>
                    <div className={styles.metricInfo}>
                      <span className={styles.metricValue}>{profile.metrics.timesOffered || 0}</span>
                      <span className={styles.metricLabel}>Veces mostrado</span>
                    </div>
                  </div>
                  <div className={styles.metricCard}>
                    <div className={`${styles.metricIcon} ${styles.metricIconSuccess}`}>
                      <Heart size={20} />
                    </div>
                    <div className={styles.metricInfo}>
                      <span className={styles.metricValue}>{profile.metrics.timesInterested || 0}</span>
                      <span className={styles.metricLabel}>Me interesa</span>
                    </div>
                  </div>
                  <div className={styles.metricCard}>
                    <div className={`${styles.metricIcon} ${styles.metricIconDanger}`}>
                      <XCircle size={20} />
                    </div>
                    <div className={styles.metricInfo}>
                      <span className={styles.metricValue}>{profile.metrics.timesNotInterested || 0}</span>
                      <span className={styles.metricLabel}>No me interesa</span>
                    </div>
                  </div>
                  <div className={styles.metricCard}>
                    <div className={`${styles.metricIcon} ${styles.metricIconPrimary}`}>
                      <BarChart3 size={20} />
                    </div>
                    <div className={styles.metricInfo}>
                      <span className={styles.metricValue}>
                        {profile.metrics.timesOffered > 0 
                          ? Math.round((profile.metrics.timesInterested / profile.metrics.timesOffered) * 100) 
                          : 0}%
                      </span>
                      <span className={styles.metricLabel}>Calidad de leads</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Leads por categoría */}
            {profile?.categories && profile.categories.length > 1 && (
              <div className={styles.categoryStatsSection}>
                <div className={styles.sectionHeader}>
                  <h2>Leads por servicio</h2>
                </div>
                <div className={styles.categoryStatsGrid}>
                  {profile.categories.map((cat) => (
                    <div key={cat} className={styles.categoryStatCard}>
                      <div className={styles.categoryStatIcon}>
                        {CATEGORY_ICONS[cat]}
                      </div>
                      <div className={styles.categoryStatInfo}>
                        <span className={styles.categoryStatName}>{getCategoryLabel(cat)}</span>
                        <span className={styles.categoryStatValue}>{leadsByCategory[cat] || 0} leads</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leads recientes */}
            <div className={styles.recentSection}>
              <div className={styles.sectionHeader}>
                <h2>Leads recientes</h2>
                <button 
                  className={styles.viewAllButton}
                  onClick={() => setActiveSection('leads')}
                >
                  <span>Ver todos</span>
                  <ExternalLink size={14} />
                </button>
              </div>

              {loadingLeads ? (
                <LoadingState message="Cargando leads..." />
              ) : leads.length === 0 ? (
                <EmptyState
                  icon={<Inbox size={48} />}
                  title="Aún no tienes leads"
                  description="Cuando las parejas te seleccionen, aparecerán aquí"
                />
              ) : (
                <div className={styles.leadsPreview}>
                  {leads.slice(0, 3).map((lead) => (
                    <div 
                      key={lead.id} 
                      className={styles.leadPreviewCard}
                      onClick={() => handleOpenLeadModal(lead)}
                    >
                      <div className={styles.leadPreviewHeader}>
                        <div className={styles.leadPreviewInfo}>
                          {/* Icono de categoría más grande con nombre */}
                          <div className={styles.leadCategoryBadgeLarge}>
                            {CATEGORY_ICONS[lead.category]}
                            <span className={styles.leadCategoryName}>{getCategoryLabel(lead.category)}</span>
                          </div>
                          <h4>{lead.userInfo.coupleNames}</h4>
                        </div>
                        <span 
                          className={styles.matchBadge}
                          style={getMatchCategoryStylesCompact(lead.matchScore)}
                        >
                          {getMatchCategory(lead.matchScore).label}
                        </span>
                      </div>
                      <div className={styles.leadPreviewMeta}>
                        <span>
                          <Calendar size={12} />
                          <span>{lead.userInfo.eventDate}</span>
                        </span>
                        <span>
                          <MapPin size={12} />
                          <span>{getRegionLabel(lead.userInfo.region)}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bloque "Tu perfil" eliminado - la página Resumen debe enfocarse solo en leads */}
          </div>
        )}

        {/* Sección Leads */}
        {activeSection === 'leads' && (
          <div className={styles.leadsSection}>
            {/* Filtro por categoría */}
            {profile?.categories && profile.categories.length > 1 && (
              <div className={styles.leadsFilter}>
                <div className={styles.filterLabel}>
                  <Filter size={16} />
                  <span>Filtrar por servicio:</span>
                </div>
                <div className={styles.filterOptions}>
                  <button
                    className={`${styles.filterOption} ${selectedCategory === 'all' ? styles.filterOptionActive : ''}`}
                    onClick={() => setSelectedCategory('all')}
                  >
                    Todos ({leads.length})
                  </button>
                  {profile.categories.map((cat) => (
                    <button
                      key={cat}
                      className={`${styles.filterOption} ${selectedCategory === cat ? styles.filterOptionActive : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {CATEGORY_ICONS[cat]}
                      <span>{getCategoryLabel(cat)} ({leadsByCategory[cat] || 0})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loadingLeads ? (
              <LoadingState message="Cargando leads..." />
            ) : filteredLeads.length === 0 ? (
              <EmptyState
                icon={<Inbox size={48} />}
                title={selectedCategory === 'all' ? "Aún no tienes leads" : `No tienes leads de ${getCategoryLabel(selectedCategory)}`}
                description="Cuando las parejas te seleccionen, aparecerán aquí"
              />
            ) : (
              <div className={styles.leadsGrid}>
                {filteredLeads.map((lead) => (
                  <div 
                    key={lead.id} 
                    className={styles.leadCard}
                  >
                    <div className={styles.leadCardHeader}>
                      <div className={styles.leadCardTitle}>
                        <div className={styles.leadCardNameRow}>
                          {/* Icono de categoría más grande con nombre */}
                          <div className={styles.leadCategoryBadgeLarge}>
                            {CATEGORY_ICONS[lead.category]}
                            <span className={styles.leadCategoryName}>{getCategoryLabel(lead.category)}</span>
                          </div>
                          <h3>{lead.userInfo.coupleNames}</h3>
                        </div>
                        <span className={`${styles.leadStatusBadge} ${styles[`leadStatus${lead.status.charAt(0).toUpperCase()}${lead.status.slice(1)}`]}`}>
                          {lead.status === 'pending' ? 'Pendiente' : 
                           lead.status === 'approved' ? 'Interesado' : 
                           lead.status === 'contacted' ? 'Contactado' : 'Rechazado'}
                        </span>
                      </div>
                      <div className={styles.leadCardActions}>
                        {/* Presupuesto total eliminado - los proveedores no deben ver el presupuesto total */}
                        <button 
                          className={styles.viewDetailsButton}
                          onClick={() => handleOpenLeadModal(lead)}
                        >
                          <Eye size={14} />
                          <span>Ver detalles</span>
                        </button>
                      </div>
                    </div>

                    <div className={styles.leadCardBody}>
                      <div className={styles.leadDetail}>
                        <Calendar size={14} />
                        {/* Formato de fecha: DD-MM-AAAA */}
                        <span>Evento: {new Date(lead.userInfo.eventDate).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}</span>
                      </div>
                      <div className={styles.leadDetail}>
                        <MapPin size={14} />
                        <span>{getRegionLabel(lead.userInfo.region)}</span>
                      </div>
                    </div>

                    <div className={styles.leadCardFooter}>
                      <div 
                        className={styles.matchBadgeLarge}
                        style={getMatchCategoryStyles(lead.matchScore)}
                      >
                        {getMatchCategory(lead.matchScore).label}
                      </div>
                      {/* Fecha de creación con etiqueta explícita - formato DD-MM-AAAA */}
                      <span className={styles.leadDate}>
                        Creado: {lead.createdAt.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sección Encuestas por Categoría - Diseño Premium */}
        {activeSection === 'surveys' && (
          <div className={styles.surveysSection}>
            {/* Header elegante */}
            <div className={styles.categoriesHeader}>
              <h2 className={styles.categoriesTitle}>Configura tus servicios</h2>
              <p className={styles.categoriesSubtitle}>
                Completa las encuestas para recibir leads más relevantes y aumentar tus matches
              </p>
            </div>

            {/* Grid de categorías con iconos grandes */}
            {profile?.categories && profile.categories.length > 0 ? (
              <div className={styles.categoriesIconGrid}>
                {profile.categories.map((category) => {
                  const categoryId = category as CategoryId;
                  const surveyStatus = profile?.categorySurveyStatus?.[categoryId];
                  const isCompleted = surveyStatus === 'completed';
                  const categoryInfo = getCategoryInfo(categoryId);
                  const surveyConfig = CATEGORY_SURVEYS[categoryId];
                  const questionCount = surveyConfig?.providerQuestions.length || 0;
                  
                  // Contar leads de esta categoría
                  const categoryLeads = leads.filter(l => l.category === categoryId);
                  
                  return (
                    <div key={category} className={styles.categoryIconCardWrapper}>
                      {/* Badge de leads ELIMINADO - no es útil en la sección de encuestas */}
                      <Link 
                        href={`/dashboard/provider/category/${categoryId}/survey`}
                        className={`${styles.categoryIconCard} ${isCompleted ? styles.categoryIconCardCompleted : ''}`}
                      >
                        {/* Icono grande */}
                        <div className={styles.categoryIconLarge}>
                          {CATEGORY_ICONS[category]}
                        </div>
                        
                        {/* Nombre */}
                        <span className={styles.categoryIconName}>
                          {categoryInfo?.name || getCategoryLabel(category)}
                        </span>
                        
                        {/* Info adicional */}
                        <span className={styles.categoryQuestionCount}>
                          {questionCount} preguntas
                        </span>
                        
                        {/* Estado */}
                        {isCompleted ? (
                          <span className={styles.categoryStatusCompleted}>
                            <Check size={10} />
                          </span>
                        ) : (
                          <span className={styles.categoryStatusPending}>
                            Completar
                          </span>
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={<FileText size={48} />}
                title="No hay categorías seleccionadas"
                description="Actualiza tu perfil para seleccionar las categorías de servicios que ofreces"
              />
            )}
          </div>
        )}

        {/* Sección Portafolio */}
        {activeSection === 'portfolio' && (
          <div className={styles.portfolioSection}>
            <div className={styles.portfolioIntro}>
              <p>
                Tu portafolio es tu carta de presentación. Configura tu foto de perfil y sube entre 5 y 10 fotos 
                de tu mejor trabajo para que las parejas puedan ver la calidad de tus servicios.
              </p>
            </div>
            
            {/* Editor de foto de perfil */}
            <ProfileImageEditor
              providerId={firebaseUser?.uid || ''}
              currentImage={profile?.profileImage}
              portfolioImages={profile?.portfolioImages || []}
              onImageSaved={handleProfileImageSaved}
              disabled={!firebaseUser?.uid}
            />
            
            {/* Separador visual */}
            <div className={styles.portfolioDivider} />
            
            <PortfolioUploader
              providerId={firebaseUser?.uid || ''}
              currentImages={profile?.portfolioImages || []}
              onImageUploaded={handlePortfolioImageUploaded}
              onImageDeleted={handlePortfolioImageDeleted}
              onImagesReordered={handlePortfolioImagesReordered}
              disabled={!firebaseUser?.uid}
            />
          </div>
        )}

        {/* Sección Perfil */}
        {activeSection === 'profile' && (
          <div className={styles.profileSection}>
            {/* Botón de edición global */}
            <div className={styles.profileActions}>
              {isEditing ? (
                <>
                  <button 
                    className={styles.cancelButton}
                    onClick={cancelEditing}
                    disabled={savingProfile}
                  >
                    <X size={16} />
                    <span>Cancelar</span>
                  </button>
                  <button 
                    className={styles.saveButton}
                    onClick={saveProfile}
                    disabled={savingProfile}
                  >
                    {savingProfile ? (
                      <>
                        <span className={styles.spinner}></span>
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Guardar cambios</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button 
                  className={styles.editProfileButton}
                  onClick={startEditing}
                >
                  <Edit3 size={16} />
                  <span>Editar perfil</span>
                </button>
              )}
            </div>

            <div className={styles.profileGrid}>
              {/* Información básica */}
              <div className={styles.profileCard}>
                <h3 className={styles.profileCardTitle}>
                  <User size={20} />
                  <span>Información básica</span>
                </h3>
                <div className={styles.profileCardContent}>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Nombre del negocio</span>
                    {isEditing ? (
                      <input
                        type="text"
                        className={styles.fieldInput}
                        value={editFormData.providerName || ''}
                        onChange={(e) => setEditFormData({...editFormData, providerName: e.target.value})}
                      />
                    ) : (
                      <span className={styles.fieldValue}>{profile?.providerName}</span>
                    )}
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Email</span>
                    <span className={styles.fieldValue}>{profile?.email}</span>
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Teléfono</span>
                    {isEditing ? (
                      <input
                        type="tel"
                        className={styles.fieldInput}
                        value={editFormData.phone || ''}
                        onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                      />
                    ) : (
                      <span className={styles.fieldValue}>{profile?.phone || 'No registrado'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Servicios */}
              <div className={styles.profileCard}>
                <h3 className={styles.profileCardTitle}>
                  <Star size={20} />
                  <span>Servicios</span>
                </h3>
                <div className={styles.profileCardContent}>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>
                      Categorías
                      {isEditing && (
                        <span className={styles.fieldHint}> (selecciona los servicios que ofreces)</span>
                      )}
                    </span>
                    {isEditing ? (
                      <div className={styles.categoriesEditor}>
                        <div className={styles.categoriesGrid}>
                          {PROVIDER_CATEGORIES.map((cat) => {
                            const isSelected = editingCategories.includes(cat.id as CategoryId);
                            const isOnlyOne = editingCategories.length === 1 && isSelected;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                className={`${styles.categoryToggle} ${isSelected ? styles.categoryToggleActive : ''}`}
                                onClick={() => toggleCategory(cat.id as CategoryId)}
                                disabled={isOnlyOne}
                                title={isOnlyOne ? 'Debes tener al menos una categoría' : ''}
                              >
                                {CATEGORY_ICONS[cat.id]}
                                <span>{cat.label}</span>
                                {isSelected ? (
                                  <Check size={16} className={styles.categoryCheckIcon} />
                                ) : (
                                  <Plus size={16} className={styles.categoryAddIcon} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                        {editingCategories.length > (profile?.categories?.length || 0) && (
                          <p className={styles.newCategoriesNote}>
                            <AlertCircle size={14} />
                            Las nuevas categorías requieren completar sus encuestas para recibir leads
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className={styles.tagsList}>
                        {profile?.categories?.map((cat) => (
                          <span key={cat} className={styles.tag}>
                            {CATEGORY_ICONS[cat]}
                            <span>{getCategoryLabel(cat)}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Estilo de servicio</span>
                    {isEditing ? (
                      <select
                        className={styles.fieldSelect}
                        value={editFormData.serviceStyle || ''}
                        onChange={(e) => setEditFormData({...editFormData, serviceStyle: e.target.value})}
                      >
                        {SERVICE_STYLES.map(style => (
                          <option key={style.id} value={style.id}>{style.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={styles.fieldValue}>{getStyleLabel(profile?.serviceStyle || '')}</span>
                    )}
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Rango de precios</span>
                    {isEditing ? (
                      <select
                        className={styles.fieldSelect}
                        value={editFormData.priceRange || ''}
                        onChange={(e) => setEditFormData({...editFormData, priceRange: e.target.value})}
                      >
                        {PRICE_RANGES_PROVIDER.map(price => (
                          <option key={price.id} value={price.id}>{price.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={styles.fieldValue}>{getPriceLabel(profile?.priceRange || '')}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div className={styles.profileCard}>
                <h3 className={styles.profileCardTitle}>
                  <MapPin size={20} />
                  <span>Ubicación</span>
                </h3>
                <div className={styles.profileCardContent}>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Región de trabajo</span>
                    {isEditing ? (
                      <select
                        className={styles.fieldSelect}
                        value={editFormData.workRegion || ''}
                        onChange={(e) => setEditFormData({...editFormData, workRegion: e.target.value})}
                      >
                        {REGIONS.map(region => (
                          <option key={region.id} value={region.id}>{region.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={styles.fieldValue}>{getRegionLabel(profile?.workRegion || '')}</span>
                    )}
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Acepta fuera de zona</span>
                    {isEditing ? (
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={editFormData.acceptsOutsideZone || false}
                          onChange={(e) => setEditFormData({...editFormData, acceptsOutsideZone: e.target.checked})}
                        />
                        <span>Sí, acepto trabajar fuera de mi región</span>
                      </label>
                    ) : (
                      <span className={styles.fieldValue}>
                        {profile?.acceptsOutsideZone ? 'Sí' : 'No'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Redes sociales */}
              <div className={styles.profileCard}>
                <h3 className={styles.profileCardTitle}>
                  <Globe size={20} />
                  <span>Presencia online</span>
                </h3>
                <div className={styles.profileCardContent}>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Sitio web</span>
                    {isEditing ? (
                      <input
                        type="url"
                        className={styles.fieldInput}
                        placeholder="https://..."
                        value={editFormData.website || ''}
                        onChange={(e) => setEditFormData({...editFormData, website: e.target.value})}
                      />
                    ) : profile?.website ? (
                      <div className={styles.socialLink}>
                        <Globe size={16} />
                        <a href={profile.website} target="_blank" rel="noopener noreferrer">
                          {profile.website}
                        </a>
                      </div>
                    ) : (
                      <span className={styles.fieldValue}>No configurado</span>
                    )}
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Instagram</span>
                    {isEditing ? (
                      <input
                        type="text"
                        className={styles.fieldInput}
                        placeholder="@usuario"
                        value={editFormData.instagram || ''}
                        onChange={(e) => setEditFormData({...editFormData, instagram: e.target.value})}
                      />
                    ) : profile?.instagram ? (
                      <div className={styles.socialLink}>
                        <Instagram size={16} />
                        <span>{profile.instagram}</span>
                      </div>
                    ) : (
                      <span className={styles.fieldValue}>No configurado</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className={`${styles.profileCard} ${styles.profileCardFull}`}>
                <h3 className={styles.profileCardTitle}>
                  <Edit3 size={20} />
                  <span>Descripción</span>
                </h3>
                <div className={styles.profileCardContent}>
                  {isEditing ? (
                    <textarea
                      className={styles.fieldTextarea}
                      rows={4}
                      placeholder="Describe tu negocio, experiencia y lo que te hace único..."
                      value={editFormData.description || ''}
                      onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    />
                  ) : (
                    <p className={styles.descriptionText}>
                      {profile?.description || 'No has agregado una descripción aún.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Estadísticas de cuenta - Diferenciando créditos de leads */}
              <div className={styles.profileCard}>
                <h3 className={styles.profileCardTitle}>
                  <BarChart3 size={20} />
                  <span>Estado de cuenta</span>
                </h3>
                <div className={styles.profileCardContent}>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Estado</span>
                    <span className={`${styles.fieldValue} ${styles.statusText} ${styles[`status${profile?.status}`]}`}>
                      {profile?.status === 'active' ? 'Activo' : 
                       profile?.status === 'pending' ? 'Pendiente de aprobación' : 'Cerrado'}
                    </span>
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Créditos totales</span>
                    <span className={styles.fieldValue}>{profile?.leadLimit || 10}</span>
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Créditos utilizados</span>
                    <span className={styles.fieldValue}>{profile?.leadsUsed || 0}</span>
                  </div>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Créditos disponibles</span>
                    <span className={styles.fieldValue}>{(profile?.leadLimit || 10) - (profile?.leadsUsed || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de lead seleccionado - MEJORADO */}
      {selectedLead && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderInfo}>
                <span className={styles.modalCategoryBadge}>
                  {CATEGORY_ICONS[selectedLead.category]}
                  <span>{getCategoryLabel(selectedLead.category)}</span>
                </span>
                <h2>{selectedLead.userInfo.coupleNames}</h2>
                <div 
                  className={styles.modalMatchBadge}
                  style={getMatchCategoryStylesLarge(selectedLead.matchScore)}
                >
                  {getMatchCategory(selectedLead.matchScore).label}
                </div>
              </div>
              <button 
                className={styles.modalClose}
                onClick={handleCloseModal}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {loadingModal ? (
                <div className={styles.modalLoading}>
                  <LoadingState message="Cargando información..." />
                </div>
              ) : (
                <>
                  {/* Sección de contacto con botones de copiado */}
                  <div className={styles.modalContactSection}>
                    <h4>Información de contacto</h4>
                    <div className={styles.contactCards}>
                      <div className={styles.contactCard}>
                        <div className={styles.contactCardIcon}>
                          <Mail size={20} />
                        </div>
                        <div className={styles.contactCardInfo}>
                          <span className={styles.contactLabel}>Email</span>
                          <span className={styles.contactValue}>{selectedLead.userInfo.email}</span>
                        </div>
                        <button 
                          className={`${styles.copyButton} ${copiedField === 'email' ? styles.copied : ''}`}
                          onClick={() => copyToClipboard(selectedLead.userInfo.email, 'email')}
                        >
                          {copiedField === 'email' ? <Check size={16} /> : <Copy size={16} />}
                          <span>{copiedField === 'email' ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                      
                      <div className={styles.contactCard}>
                        <div className={styles.contactCardIcon}>
                          <Phone size={20} />
                        </div>
                        <div className={styles.contactCardInfo}>
                          <span className={styles.contactLabel}>Teléfono</span>
                          <span className={styles.contactValue}>{selectedLead.userInfo.phone}</span>
                        </div>
                        <button 
                          className={`${styles.copyButton} ${copiedField === 'phone' ? styles.copied : ''}`}
                          onClick={() => copyToClipboard(selectedLead.userInfo.phone, 'phone')}
                        >
                          {copiedField === 'phone' ? <Check size={16} /> : <Copy size={16} />}
                          <span>{copiedField === 'phone' ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sección expandible: Información básica */}
                  <div className={styles.expandableSection}>
                    <button 
                      className={styles.sectionToggle}
                      onClick={() => toggleSection('basicInfo')}
                    >
                      <div className={styles.sectionToggleTitle}>
                        <Heart size={18} />
                        <span>Información del evento</span>
                      </div>
                      {expandedSections.basicInfo ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    
                    {expandedSections.basicInfo && (
                      <div className={styles.sectionContent}>
                        <div className={styles.infoGrid}>
                          <div className={styles.infoItem}>
                            <Calendar size={16} />
                            <div>
                              <span className={styles.infoLabel}>Fecha del evento</span>
                              <span className={styles.infoValue}>{selectedLead.userInfo.eventDate}</span>
                            </div>
                          </div>
                          <div className={styles.infoItem}>
                            <MapPin size={16} />
                            <div>
                              <span className={styles.infoLabel}>Región</span>
                              <span className={styles.infoValue}>{getRegionLabel(selectedLead.userInfo.region)}</span>
                            </div>
                          </div>
                          {/* Presupuesto total eliminado - solo mostrar si hay presupuesto de categoría */}
                          {extendedUserInfo?.categorySurvey?.responses && (
                            <div className={styles.infoItem}>
                              <DollarSign size={16} />
                              <div>
                                <span className={styles.infoLabel}>Presupuesto para {getCategoryLabel(selectedLead.category)}</span>
                                <span className={styles.infoValue}>Consultar en preferencias</span>
                              </div>
                            </div>
                          )}
                          {extendedUserInfo && (
                            <>
                              <div className={styles.infoItem}>
                                <Users size={16} />
                                <div>
                                  <span className={styles.infoLabel}>Invitados</span>
                                  <span className={styles.infoValue}>{GUEST_COUNT_LABELS[extendedUserInfo.guestCount] || extendedUserInfo.guestCount}</span>
                                </div>
                              </div>
                              <div className={styles.infoItem}>
                                <Sparkles size={16} />
                                <div>
                                  <span className={styles.infoLabel}>Estilo del evento</span>
                                  <span className={styles.infoValue}>{EVENT_STYLE_LABELS[extendedUserInfo.eventStyle] || extendedUserInfo.eventStyle}</span>
                                </div>
                              </div>
                              {extendedUserInfo.ceremonyTypes && extendedUserInfo.ceremonyTypes.length > 0 && (
                                <div className={styles.infoItem}>
                                  <Heart size={16} />
                                  <div>
                                    <span className={styles.infoLabel}>Tipo de ceremonia</span>
                                    <span className={styles.infoValue}>{extendedUserInfo.ceremonyTypes.join(', ')}</span>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sección "Detalles de planificación" ELIMINADA - no aporta valor, siempre está vacía */}

                  {/* Sección expandible: Comparativa de encuestas */}
                  {extendedUserInfo?.categorySurvey && providerSurvey && (
                    <div className={styles.expandableSection}>
                      <button 
                        className={styles.sectionToggle}
                        onClick={() => toggleSection('surveyComparison')}
                      >
                        <div className={styles.sectionToggleTitle}>
                          <BarChart3 size={18} />
                          <span>Comparativa de preferencias</span>
                          <span className={styles.comparisonBadge}>
                            <Sparkles size={12} />
                            Ver match detallado
                          </span>
                        </div>
                        {expandedSections.surveyComparison ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                      
                      {expandedSections.surveyComparison && (
                        <div className={styles.sectionContent}>
                          <div className={styles.comparisonIntro}>
                            <p>Comparación entre lo que busca la pareja y lo que tú ofreces en {getCategoryLabel(selectedLead.category)}:</p>
                          </div>
                          
                          <div className={styles.comparisonGrid}>
                            {(() => {
                              const categoryId = selectedLead.category as CategoryId;
                              const userQuestions = getSurveyQuestions(categoryId, 'user');
                              const providerQuestions = getSurveyQuestions(categoryId, 'provider');
                              const userResponses = extendedUserInfo.categorySurvey?.responses || {};
                              const providerResponses = providerSurvey.responses || {};
                              
                              // Obtener los criterios de matching para esta categoría
                              const matchingCriteria = CATEGORY_MATCHING_CRITERIA[categoryId] || [];
                              
                              // Crear comparaciones basadas en los criterios de matching
                              const comparisons: Array<{
                                label: string;
                                userValue: string;
                                providerValue: string;
                                isMatch: boolean;
                                explanation: string;
                              }> = [];
                              
                              // Iterar sobre los criterios de matching definidos
                              matchingCriteria.forEach(criterion => {
                                const userQuestion = userQuestions.find(q => q.id === criterion.userQuestionId);
                                const providerQuestion = providerQuestions.find(q => q.id === criterion.providerQuestionId);
                                
                                if (!userQuestion) return;
                                
                                const userAnswer = userResponses[criterion.userQuestionId];
                                const providerAnswer = providerResponses[criterion.providerQuestionId];
                                const providerMaxAnswer = criterion.providerQuestionIdMax 
                                  ? providerResponses[criterion.providerQuestionIdMax]
                                  : undefined;
                                
                                // Si el usuario no respondió esta pregunta, saltarla
                                if (userAnswer === undefined || userAnswer === null || userAnswer === '') return;
                                
                                // Usar la lógica correcta del matchmaking para determinar si cumple
                                const matchResult = calculateCriterionMatch(
                                  userAnswer,
                                  providerAnswer,
                                  providerMaxAnswer,
                                  criterion
                                );
                                
                                // Formatear los valores para mostrar
                                const userValue = getSurveyAnswerLabel(criterion.userQuestionId, userAnswer, userQuestions);
                                const providerValue = providerQuestion && providerAnswer !== undefined
                                  ? getSurveyAnswerLabel(criterion.providerQuestionId, providerAnswer, providerQuestions)
                                  : 'No especificado';
                                
                                comparisons.push({
                                  label: userQuestion.question,
                                  userValue,
                                  providerValue,
                                  isMatch: matchResult.matches,
                                  explanation: matchResult.explanation,
                                });
                              });
                              
                              // Si no hay criterios definidos, usar el método antiguo como fallback
                              if (comparisons.length === 0) {
                                Object.keys(userResponses).forEach(questionId => {
                                  const userQuestion = userQuestions.find(q => q.id === questionId);
                                  if (!userQuestion) return;
                                  
                                  const providerQuestionId = questionId.replace('_u_', '_p_');
                                  const providerQuestion = providerQuestions.find(q => q.id === providerQuestionId);
                                  
                                  const userValue = getSurveyAnswerLabel(questionId, userResponses[questionId], userQuestions);
                                  const providerValue = providerQuestion && providerResponses[providerQuestion.id]
                                    ? getSurveyAnswerLabel(providerQuestion.id, providerResponses[providerQuestion.id], providerQuestions)
                                    : 'No especificado';
                                  
                                  comparisons.push({
                                    label: userQuestion.question,
                                    userValue,
                                    providerValue,
                                    isMatch: true, // Marcar como match por defecto en fallback
                                    explanation: 'Comparación básica',
                                  });
                                });
                              }
                              
                              return comparisons.map((comp, index) => (
                                <div 
                                  key={index} 
                                  className={`${styles.comparisonItem} ${comp.isMatch ? styles.comparisonMatch : styles.comparisonDiff}`}
                                >
                                  <div className={styles.comparisonLabel}>{comp.label}</div>
                                  <div className={styles.comparisonValues}>
                                    <div className={styles.comparisonUser}>
                                      <span className={styles.comparisonTag}>Buscan</span>
                                      <span className={styles.comparisonText}>{comp.userValue}</span>
                                    </div>
                                    <div className={styles.comparisonDivider}>
                                      {comp.isMatch ? (
                                        <Check size={16} className={styles.matchIcon} />
                                      ) : (
                                        <X size={16} className={styles.diffIcon} />
                                      )}
                                    </div>
                                    <div className={styles.comparisonProvider}>
                                      <span className={styles.comparisonTag}>Ofreces</span>
                                      <span className={styles.comparisonText}>{comp.providerValue}</span>
                                    </div>
                                  </div>
                                  {/* Mostrar explicación del match */}
                                  <div className={styles.comparisonExplanation}>
                                    <span className={comp.isMatch ? styles.explanationMatch : styles.explanationDiff}>
                                      {comp.explanation}
                                    </span>
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mensaje si no hay encuesta */}
                  {(!extendedUserInfo?.categorySurvey || !providerSurvey) && (
                    <div className={styles.noSurveyMessage}>
                      <AlertCircle size={20} />
                      <div>
                        <p><strong>Comparativa no disponible</strong></p>
                        <p>
                          {!providerSurvey 
                            ? 'Completa tu encuesta de esta categoría para ver la comparativa detallada.'
                            : 'La pareja aún no ha completado la encuesta de esta categoría.'}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
