'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  AlertTriangle,
  Camera,
  Music,
  Utensils,
  Building2,
  Video,
  Flower2,
  ClipboardList,
  Palette,
  PartyPopper,
  Cake,
  Car,
  Send,
  Shirt,
  Settings,
  ToggleLeft,
  ToggleRight,
  Info,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { useAuthStore, CategoryId, ALL_CATEGORIES } from '@/store/authStore';
import { CATEGORY_INFO } from '@/lib/surveys';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import styles from './page.module.css';

// Iconos por categoría
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  photography: <Camera size={20} />,
  video: <Video size={20} />,
  dj: <Music size={20} />,
  catering: <Utensils size={20} />,
  venue: <Building2 size={20} />,
  decoration: <Flower2 size={20} />,
  wedding_planner: <ClipboardList size={20} />,
  makeup: <Palette size={20} />,
  entertainment: <PartyPopper size={20} />,
  dress: <Shirt size={20} />,
  cakes: <Cake size={20} />,
  transport: <Car size={20} />,
  invitations: <Send size={20} />,
};

// Interfaz para configuración de una pregunta en el matchmaking
interface QuestionMatchingConfig {
  questionId: string;
  questionLabel: string;
  weight: number; // 0-100
  isExcluding: boolean; // Si es true, no coincidencia = 0% automático
}

// Interfaz para configuración de categoría
interface CategoryMatchingConfig {
  categoryId: CategoryId;
  questions: QuestionMatchingConfig[];
  lastUpdated?: Date;
}

// Configuración de preguntas por defecto para cada categoría
// Basado en el archivo matchingService.ts
const DEFAULT_MATCHING_CONFIGS: Record<CategoryId, QuestionMatchingConfig[]> = {
  photography: [
    { questionId: 'photo_u_style', questionLabel: 'Estilo de fotografía', weight: 25, isExcluding: false },
    { questionId: 'photo_u_hours', questionLabel: 'Horas de cobertura', weight: 15, isExcluding: false },
    { questionId: 'photo_u_budget', questionLabel: 'Presupuesto', weight: 20, isExcluding: false },
    { questionId: 'photo_u_preboda', questionLabel: 'Pre-boda', weight: 5, isExcluding: false },
    { questionId: 'photo_u_postboda', questionLabel: 'Post-boda', weight: 5, isExcluding: false },
    { questionId: 'photo_u_second_shooter', questionLabel: 'Segundo fotógrafo', weight: 5, isExcluding: false },
    { questionId: 'photo_u_delivery_time', questionLabel: 'Tiempo de entrega', weight: 5, isExcluding: false },
    { questionId: 'photo_u_delivery_format', questionLabel: 'Formato de entrega', weight: 5, isExcluding: false },
    { questionId: 'photo_u_photo_count', questionLabel: 'Cantidad de fotos', weight: 5, isExcluding: false },
    { questionId: 'photo_u_retouching', questionLabel: 'Nivel de retoque', weight: 5, isExcluding: false },
  ],
  video: [
    { questionId: 'video_u_style', questionLabel: 'Estilo de video', weight: 25, isExcluding: false },
    { questionId: 'video_u_duration', questionLabel: 'Duración del video', weight: 15, isExcluding: false },
    { questionId: 'video_u_budget', questionLabel: 'Presupuesto', weight: 20, isExcluding: false },
    { questionId: 'video_u_hours', questionLabel: 'Horas de cobertura', weight: 10, isExcluding: false },
    { questionId: 'video_u_second_camera', questionLabel: 'Segunda cámara', weight: 5, isExcluding: false },
    { questionId: 'video_u_drone', questionLabel: 'Drone', weight: 5, isExcluding: false },
    { questionId: 'video_u_same_day_edit', questionLabel: 'Edición mismo día', weight: 5, isExcluding: false },
    { questionId: 'video_u_raw_footage', questionLabel: 'Material crudo', weight: 3, isExcluding: false },
    { questionId: 'video_u_social_reel', questionLabel: 'Reel para redes', weight: 5, isExcluding: false },
    { questionId: 'video_u_delivery_time', questionLabel: 'Tiempo de entrega', weight: 5, isExcluding: false },
  ],
  dj: [
    { questionId: 'dj_u_genres', questionLabel: 'Géneros musicales', weight: 25, isExcluding: false },
    { questionId: 'dj_u_style', questionLabel: 'Estilo de fiesta', weight: 15, isExcluding: false },
    { questionId: 'dj_u_budget', questionLabel: 'Presupuesto', weight: 20, isExcluding: false },
    { questionId: 'dj_u_hours', questionLabel: 'Horas de servicio', weight: 10, isExcluding: false },
    { questionId: 'dj_u_ceremony_music', questionLabel: 'Música ceremonia', weight: 5, isExcluding: false },
    { questionId: 'dj_u_cocktail_music', questionLabel: 'Música cóctel', weight: 3, isExcluding: false },
    { questionId: 'dj_u_mc', questionLabel: 'Nivel de animación', weight: 10, isExcluding: false },
    { questionId: 'dj_u_lighting', questionLabel: 'Iluminación', weight: 5, isExcluding: false },
    { questionId: 'dj_u_effects', questionLabel: 'Efectos especiales', weight: 3, isExcluding: false },
    { questionId: 'dj_u_karaoke', questionLabel: 'Karaoke', weight: 2, isExcluding: false },
  ],
  catering: [
    { questionId: 'catering_u_service_type', questionLabel: 'Tipo de servicio', weight: 20, isExcluding: false },
    { questionId: 'catering_u_cuisine', questionLabel: 'Tipo de cocina', weight: 15, isExcluding: false },
    { questionId: 'catering_u_budget_pp', questionLabel: 'Presupuesto por persona', weight: 20, isExcluding: false },
    { questionId: 'catering_u_guest_count', questionLabel: 'Cantidad de invitados', weight: 10, isExcluding: false },
    { questionId: 'catering_u_courses', questionLabel: 'Tiempos de comida', weight: 5, isExcluding: false },
    { questionId: 'catering_u_cocktail', questionLabel: 'Cóctel', weight: 5, isExcluding: false },
    { questionId: 'catering_u_dietary', questionLabel: 'Opciones dietéticas', weight: 5, isExcluding: true }, // Excluyente
    { questionId: 'catering_u_beverages', questionLabel: 'Bebestibles', weight: 5, isExcluding: false },
    { questionId: 'catering_u_tasting', questionLabel: 'Degustación', weight: 3, isExcluding: false },
    { questionId: 'catering_u_cake', questionLabel: 'Torta', weight: 5, isExcluding: false },
    { questionId: 'catering_u_staff', questionLabel: 'Nivel de servicio', weight: 5, isExcluding: false },
  ],
  venue: [
    { questionId: 'venue_u_type', questionLabel: 'Tipo de lugar', weight: 20, isExcluding: false },
    { questionId: 'venue_u_setting', questionLabel: 'Interior/Exterior', weight: 15, isExcluding: false },
    { questionId: 'venue_u_budget', questionLabel: 'Presupuesto', weight: 20, isExcluding: false },
    { questionId: 'venue_u_capacity', questionLabel: 'Capacidad', weight: 15, isExcluding: true }, // Excluyente
    { questionId: 'venue_u_exclusivity', questionLabel: 'Exclusividad', weight: 5, isExcluding: false },
    { questionId: 'venue_u_ceremony_space', questionLabel: 'Espacio ceremonia', weight: 5, isExcluding: false },
    { questionId: 'venue_u_parking', questionLabel: 'Estacionamiento', weight: 5, isExcluding: false },
    { questionId: 'venue_u_accommodation', questionLabel: 'Alojamiento', weight: 3, isExcluding: false },
    { questionId: 'venue_u_catering_policy', questionLabel: 'Política catering', weight: 5, isExcluding: false },
    { questionId: 'venue_u_end_time', questionLabel: 'Hora de término', weight: 5, isExcluding: false },
  ],
  decoration: [
    { questionId: 'deco_u_style', questionLabel: 'Estilo de decoración', weight: 25, isExcluding: false },
    { questionId: 'deco_u_colors', questionLabel: 'Paleta de colores', weight: 15, isExcluding: false },
    { questionId: 'deco_u_budget', questionLabel: 'Presupuesto', weight: 20, isExcluding: false },
    { questionId: 'deco_u_flowers', questionLabel: 'Tipos de flores', weight: 10, isExcluding: false },
    { questionId: 'deco_u_bridal_bouquet', questionLabel: 'Bouquet novia', weight: 5, isExcluding: false },
    { questionId: 'deco_u_ceremony_deco', questionLabel: 'Decoración ceremonia', weight: 5, isExcluding: false },
    { questionId: 'deco_u_table_centerpieces', questionLabel: 'Centros de mesa', weight: 5, isExcluding: false },
    { questionId: 'deco_u_table_count', questionLabel: 'Cantidad de mesas', weight: 5, isExcluding: false },
    { questionId: 'deco_u_extras', questionLabel: 'Extras', weight: 5, isExcluding: false },
    { questionId: 'deco_u_rental', questionLabel: 'Arriendo mobiliario', weight: 5, isExcluding: false },
  ],
  wedding_planner: [
    { questionId: 'wp_u_service_level', questionLabel: 'Nivel de servicio', weight: 25, isExcluding: false },
    { questionId: 'wp_u_budget', questionLabel: 'Presupuesto', weight: 20, isExcluding: false },
    { questionId: 'wp_u_vendor_help', questionLabel: 'Ayuda con proveedores', weight: 15, isExcluding: false },
    { questionId: 'wp_u_design_help', questionLabel: 'Diseño/Estilo', weight: 10, isExcluding: false },
    { questionId: 'wp_u_budget_management', questionLabel: 'Gestión presupuesto', weight: 5, isExcluding: false },
    { questionId: 'wp_u_timeline_management', questionLabel: 'Gestión timeline', weight: 5, isExcluding: false },
    { questionId: 'wp_u_guest_management', questionLabel: 'Gestión invitados', weight: 5, isExcluding: false },
    { questionId: 'wp_u_rehearsal', questionLabel: 'Ensayo', weight: 3, isExcluding: false },
  ],
  makeup: [
    { questionId: 'makeup_u_style', questionLabel: 'Estilo de maquillaje', weight: 25, isExcluding: false },
    { questionId: 'makeup_u_budget', questionLabel: 'Presupuesto', weight: 20, isExcluding: false },
    { questionId: 'makeup_u_trial', questionLabel: 'Prueba previa', weight: 10, isExcluding: false },
    { questionId: 'makeup_u_hair', questionLabel: 'Incluye peinado', weight: 15, isExcluding: false },
    { questionId: 'makeup_u_hair_style', questionLabel: 'Estilo de peinado', weight: 10, isExcluding: false },
    { questionId: 'makeup_u_extensions', questionLabel: 'Extensiones', weight: 3, isExcluding: false },
    { questionId: 'makeup_u_lashes', questionLabel: 'Pestañas', weight: 5, isExcluding: false },
    { questionId: 'makeup_u_touch_ups', questionLabel: 'Retoques', weight: 4, isExcluding: false },
    { questionId: 'makeup_u_bridesmaids', questionLabel: 'Damas de honor', weight: 5, isExcluding: false },
  ],
  entertainment: [],
  cakes: [],
  transport: [],
  invitations: [],
  dress: [],
};

/**
 * Panel de configuración de Matchmaking para Super Admin
 * Permite modificar pesos y marcar preguntas como excluyentes
 */
export default function MatchmakingConfigPage() {
  const router = useRouter();
  const { firebaseUser, isLoading: authLoading, isInitialized } = useAuthStore();
  
  // Estado de verificación admin
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  
  // Estado de la configuración
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('photography');
  const [configs, setConfigs] = useState<Record<CategoryId, QuestionMatchingConfig[]>>(DEFAULT_MATCHING_CONFIGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Verificar acceso super admin
  const verifyAdminAccess = useCallback(async () => {
    if (!firebaseUser) {
      setIsVerifying(false);
      return;
    }

    try {
      const tokenResult = await firebaseUser.getIdTokenResult(true);
      const claims = tokenResult.claims;
      setIsSuperAdmin(claims.super_admin === true);
    } catch (error) {
      console.error('Error verificando acceso:', error);
      setIsSuperAdmin(false);
    } finally {
      setIsVerifying(false);
    }
  }, [firebaseUser]);

  // Cargar configuración desde Firestore
  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      // Intentar cargar configuración guardada
      const configRef = doc(db, 'matchmaking_config', 'weights');
      const configSnap = await getDoc(configRef);
      
      if (configSnap.exists()) {
        const savedConfigs = configSnap.data() as Record<CategoryId, QuestionMatchingConfig[]>;
        // Combinar con defaults para categorías no guardadas
        setConfigs(prev => ({
          ...prev,
          ...savedConfigs,
        }));
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Guardar configuración en Firestore
  const saveConfig = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const configRef = doc(db, 'matchmaking_config', 'weights');
      await setDoc(configRef, {
        ...configs,
        lastUpdated: new Date(),
      });
      
      setSaveMessage({ type: 'success', text: '¡Configuración guardada exitosamente!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error guardando configuración:', error);
      setSaveMessage({ type: 'error', text: 'Error al guardar. Intenta de nuevo.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Actualizar peso de una pregunta
  const updateWeight = (questionId: string, weight: number) => {
    setConfigs(prev => ({
      ...prev,
      [selectedCategory]: prev[selectedCategory].map(q =>
        q.questionId === questionId ? { ...q, weight: Math.max(0, Math.min(100, weight)) } : q
      ),
    }));
  };

  // Toggle pregunta excluyente
  const toggleExcluding = (questionId: string) => {
    setConfigs(prev => ({
      ...prev,
      [selectedCategory]: prev[selectedCategory].map(q =>
        q.questionId === questionId ? { ...q, isExcluding: !q.isExcluding } : q
      ),
    }));
  };

  // Efectos
  useEffect(() => {
    if (isInitialized && !authLoading) {
      if (!firebaseUser) {
        router.push('/login');
      } else {
        verifyAdminAccess();
      }
    }
  }, [firebaseUser, authLoading, isInitialized, router, verifyAdminAccess]);

  useEffect(() => {
    if (isSuperAdmin) {
      loadConfig();
    }
  }, [isSuperAdmin, loadConfig]);

  // Calcular suma de pesos para la categoría actual
  const totalWeight = configs[selectedCategory]?.reduce((sum, q) => sum + q.weight, 0) || 0;
  const excludingCount = configs[selectedCategory]?.filter(q => q.isExcluding).length || 0;

  // Loading
  if (authLoading || isVerifying) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={32} />
        <p>Verificando acceso...</p>
      </div>
    );
  }

  // Acceso denegado
  if (!isSuperAdmin) {
    return (
      <div className={styles.accessDenied}>
        <AlertTriangle size={48} />
        <h1>Acceso Denegado</h1>
        <p>Solo Super Admins pueden acceder a esta configuración.</p>
        <Link href="/admin" className={styles.backLink}>
          Volver al panel
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <Link href="/admin" className={styles.backButton}>
          <ArrowLeft size={20} />
          <span>Volver</span>
        </Link>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <Settings size={24} />
            Configuración de Matchmaking
          </h1>
          <p className={styles.subtitle}>
            Ajusta los pesos y preguntas excluyentes para cada categoría
          </p>
        </div>
        <button 
          className={styles.saveButton}
          onClick={saveConfig}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className={styles.spinner} />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Guardar cambios</span>
            </>
          )}
        </button>
      </header>

      {/* Mensaje de guardado */}
      {saveMessage && (
        <div className={`${styles.saveMessage} ${styles[saveMessage.type]}`}>
          {saveMessage.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          <span>{saveMessage.text}</span>
        </div>
      )}

      {/* Contenido principal */}
      <div className={styles.content}>
        {/* Sidebar de categorías */}
        <aside className={styles.categorySidebar}>
          <h3 className={styles.sidebarTitle}>Categorías</h3>
          <nav className={styles.categoryNav}>
            {ALL_CATEGORIES.map((cat) => {
              const catInfo = CATEGORY_INFO[cat];
              const hasQuestions = configs[cat]?.length > 0;
              
              return (
                <button
                  key={cat}
                  className={`${styles.categoryButton} ${selectedCategory === cat ? styles.categoryButtonActive : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <span className={styles.categoryIcon}>
                    {CATEGORY_ICONS[cat]}
                  </span>
                  <span className={styles.categoryName}>{catInfo?.name || cat}</span>
                  {!hasQuestions && (
                    <span className={styles.categoryEmpty}>Sin config</span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Panel de configuración */}
        <main className={styles.configPanel}>
          <div className={styles.configHeader}>
            <h2 className={styles.configTitle}>
              {CATEGORY_ICONS[selectedCategory]}
              <span>{CATEGORY_INFO[selectedCategory]?.name || selectedCategory}</span>
            </h2>
            <div className={styles.configStats}>
              <div className={styles.configStat}>
                <span className={styles.configStatValue}>{configs[selectedCategory]?.length || 0}</span>
                <span className={styles.configStatLabel}>Preguntas</span>
              </div>
              <div className={`${styles.configStat} ${totalWeight !== 100 ? styles.configStatWarning : ''}`}>
                <span className={styles.configStatValue}>{totalWeight}%</span>
                <span className={styles.configStatLabel}>Peso total</span>
              </div>
              <div className={styles.configStat}>
                <span className={styles.configStatValue}>{excludingCount}</span>
                <span className={styles.configStatLabel}>Excluyentes</span>
              </div>
            </div>
          </div>

          {/* Aviso si el peso no suma 100 */}
          {totalWeight !== 100 && configs[selectedCategory]?.length > 0 && (
            <div className={styles.weightWarning}>
              <AlertTriangle size={16} />
              <span>El peso total debe sumar 100%. Actualmente: {totalWeight}%</span>
            </div>
          )}

          {/* Info sobre preguntas excluyentes */}
          <div className={styles.infoBox}>
            <Info size={16} />
            <div>
              <strong>Preguntas Excluyentes:</strong> Si una pregunta está marcada como excluyente 
              y no hay coincidencia, el resultado del match es automáticamente 0%, 
              sin importar las demás coincidencias.
            </div>
          </div>

          {/* Lista de preguntas */}
          {isLoading ? (
            <div className={styles.loadingQuestions}>
              <Loader2 className={styles.spinner} size={24} />
              <span>Cargando configuración...</span>
            </div>
          ) : configs[selectedCategory]?.length === 0 ? (
            <div className={styles.emptyQuestions}>
              <AlertTriangle size={32} />
              <p>Esta categoría aún no tiene criterios de matching configurados.</p>
              <p className={styles.emptySubtext}>
                Los criterios se definen en el código del servicio de matchmaking.
              </p>
            </div>
          ) : (
            <div className={styles.questionsList}>
              {configs[selectedCategory].map((question) => (
                <div 
                  key={question.questionId} 
                  className={`${styles.questionCard} ${question.isExcluding ? styles.questionCardExcluding : ''}`}
                >
                  <div className={styles.questionHeader}>
                    <h4 className={styles.questionLabel}>{question.questionLabel}</h4>
                    <button
                      className={`${styles.excludingToggle} ${question.isExcluding ? styles.excludingToggleActive : ''}`}
                      onClick={() => toggleExcluding(question.questionId)}
                      title={question.isExcluding ? 'Quitar excluyente' : 'Marcar como excluyente'}
                    >
                      {question.isExcluding ? (
                        <>
                          <ToggleRight size={20} />
                          <span>Excluyente</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={20} />
                          <span>Normal</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className={styles.questionBody}>
                    <div className={styles.weightControl}>
                      <label className={styles.weightLabel}>Peso:</label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={question.weight}
                        onChange={(e) => updateWeight(question.questionId, parseInt(e.target.value))}
                        className={styles.weightSlider}
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={question.weight}
                        onChange={(e) => updateWeight(question.questionId, parseInt(e.target.value) || 0)}
                        className={styles.weightInput}
                      />
                      <span className={styles.weightUnit}>%</span>
                    </div>
                    
                    {question.isExcluding && (
                      <p className={styles.excludingNote}>
                        ⚠️ Si no hay coincidencia en esta pregunta, el match será automáticamente 0%
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
