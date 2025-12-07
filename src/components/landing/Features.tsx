"use client";

import styles from './Features.module.css';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  ArrowRight,
  // Iconos del dashboard real
  Building2,
  Camera,
  Utensils,
  Music,
  Video,
  Flower2,
  Search,
  Edit3,
  Home,
  FileText,
  User,
  Heart,
  Users,
  Briefcase,
  Star,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function Features() {
  const [activeTab, setActiveTab] = useState<'couples' | 'providers'>('couples');

  const content = {
    couples: {
      title: "Planifica sin estrés,\ndisfruta el proceso.",
      description: "MatriMatch elimina las interminables cadenas de correos y las planillas de excel complicadas. Te damos control total en un solo Dashboard.",
      features: [
        "Recomendaciones 100% personalizadas por IA.",
        "Gestión de presupuesto automatizada.",
        "Proveedores verificados y calificados.",
        "Dashboard visual para seguir tu avance."
      ],
      ctaText: "Crear mi perfil de Novios",
      ctaLink: "/register/user",
    },
    providers: {
      title: "Leads de calidad,\ncierre de ventas efectivo.",
      description: "Deja de perder tiempo cotizando para clientes que no tienen tu presupuesto o fecha disponible. MatriMatch filtra por ti.",
      features: [
        "Leads pre-calificados (Fecha y Presupuesto OK).",
        "Calendario de disponibilidad inteligente.",
        "Showcase digital moderno de tus servicios.",
        "Estadísticas de visualización y conversión."
      ],
      ctaText: "Registrar mi Empresa",
      ctaLink: "/register/provider",
    }
  };

  const currentContent = content[activeTab];

  return (
    <section className={styles.section} id="features">
      <div className={styles.container}>
        
        {/* Toggle Controls */}
        <div className={styles.toggleWrapper}>
          <div className={styles.toggleContainer}>
            <button 
              className={`${styles.toggleButton} ${activeTab === 'couples' ? styles.active : ''}`}
              onClick={() => setActiveTab('couples')}
            >
              Para Novios
              {activeTab === 'couples' && (
                <motion.div 
                  className={styles.activeBackground} 
                  layoutId="activeTab"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
            <button 
              className={`${styles.toggleButton} ${activeTab === 'providers' ? styles.active : ''}`}
              onClick={() => setActiveTab('providers')}
            >
              Para Proveedores
              {activeTab === 'providers' && (
                <motion.div 
                  className={styles.activeBackground} 
                  layoutId="activeTab"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          </div>
        </div>

        <div className={styles.contentGrid}>
          {/* Text Content */}
          <motion.div 
            className={styles.textContent}
            key={activeTab}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className={styles.title}>
              {currentContent.title.split('\n').map((line, i) => (
                <span key={i} className={i === 1 ? styles.highlight : ''}>
                  {line}<br/>
                </span>
              ))}
            </h2>
            
            <p className={styles.description}>
              {currentContent.description}
            </p>

            <ul className={styles.featureList}>
              {currentContent.features.map((feature, index) => (
                <motion.li 
                  key={index} 
                  className={styles.featureItem}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <div className={styles.checkIcon}>
                    <CheckCircle2 size={20} />
                  </div>
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>

            <Link href={currentContent.ctaLink} className={styles.ctaButton}>
              {currentContent.ctaText} <ArrowRight size={18} />
            </Link>
          </motion.div>

          {/* Image Content */}
          <div className={styles.imageWrapper}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                className={styles.imageContainer}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
              >
                {/* Dashboard elegante con sidebar comprimido */}
                <div className={styles.dashboardCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.dots}>
                      <span className={styles.dot} style={{background: '#ff5f56'}}></span>
                      <span className={styles.dot} style={{background: '#ffbd2e'}}></span>
                      <span className={styles.dot} style={{background: '#27c93f'}}></span>
                    </div>
                    <span className={styles.addressBar}>Matrimatch.cl</span>
                  </div>
                  <div className={styles.cardBodyWithSidebar}>
                    {/* Sidebar comprimido elegante */}
                    <div className={styles.mockSidebar}>
                      <div className={styles.mockSidebarLogo}>
                        <Sparkles size={16} className={styles.mockSidebarLogoIcon} />
                      </div>
                      <div className={styles.mockSidebarNav}>
                        {activeTab === 'couples' ? (
                          <>
                            <div className={`${styles.mockSidebarItem} ${styles.mockSidebarItemActive}`}>
                              <Home size={14} />
                            </div>
                            <div className={styles.mockSidebarItem}>
                              <FileText size={14} />
                            </div>
                            <div className={styles.mockSidebarItem}>
                              <Heart size={14} />
                            </div>
                            <div className={styles.mockSidebarItem}>
                              <User size={14} />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className={styles.mockSidebarItem}>
                              <Home size={14} />
                            </div>
                            <div className={`${styles.mockSidebarItem} ${styles.mockSidebarItemActive}`}>
                              <Users size={14} />
                            </div>
                            <div className={styles.mockSidebarItem}>
                              <FileText size={14} />
                            </div>
                            <div className={styles.mockSidebarItem}>
                              <Briefcase size={14} />
                            </div>
                            <div className={styles.mockSidebarItem}>
                              <User size={14} />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Contenido principal */}
                    <div className={styles.mockMainContent}>
                    {activeTab === 'couples' ? (
                       /* ===== REPLICA EXACTA DEL DASHBOARD "MIS MATCHES" ===== */
                       <div className={styles.mockDashboard}>
                         {/* Profile Header - Replica del dashboard real */}
                         <div className={styles.mockProfileHeader}>
                           <div className={styles.mockProfileLeft}>
                             <div className={styles.mockAvatar}>
                               <span>MJ</span>
                               {/* Countdown badge flotante */}
                               <div className={styles.mockCountdownBadge}>
                                 <span className={styles.mockCountdownNum}>98</span>
                                 <span className={styles.mockCountdownLabel}>días</span>
                               </div>
                             </div>
                             <div className={styles.mockProfileInfo}>
                               <h3 className={styles.mockProfileGreeting}>Hola María & Juan</h3>
                               <div className={styles.mockProfileDate}>
                                 <span>15 de marzo de 2025</span>
                                 <button className={styles.mockEditBtn}>
                                   <Edit3 size={8} />
                                   <span>Editar</span>
                                 </button>
                               </div>
                             </div>
                           </div>
                         </div>
                         
                         {/* Stats Row - Replica exacta */}
                         <div className={styles.mockStatsRow}>
                           <div className={styles.mockStatCard}>
                             <span className={styles.mockStatLabel}>PROVEEDORES</span>
                             <span className={styles.mockStatValue}>2</span>
                           </div>
                           <div className={styles.mockStatCard}>
                             <span className={styles.mockStatLabel}>ENCUESTAS</span>
                             <span className={styles.mockStatValue}>4 de 13</span>
                           </div>
                           <div className={styles.mockStatCard}>
                             <span className={styles.mockStatLabel}>CATEGORÍAS</span>
                             <span className={styles.mockStatValue}>3</span>
                           </div>
                           <div className={styles.mockStatCard}>
                             <span className={styles.mockStatLabel}>MATCHES</span>
                             <span className={styles.mockStatValue}>12</span>
                           </div>
                         </div>
                         
                         {/* Categories Grid - Con iconos reales */}
                         <div className={styles.mockCategoriesGrid}>
                           <div className={`${styles.mockCategoryCard} ${styles.mockCategoryCompleted}`}>
                             <div className={styles.mockCategoryIcon}><Building2 size={18} /></div>
                             <span className={styles.mockCategoryName}>Centro de Eventos</span>
                             <span className={styles.mockCategoryBtn}><Search size={8} /> Buscar</span>
                             <span className={styles.mockCategoryBadge}>3</span>
                           </div>
                           <div className={`${styles.mockCategoryCard} ${styles.mockCategoryCompleted}`}>
                             <div className={styles.mockCategoryIcon}><Camera size={18} /></div>
                             <span className={styles.mockCategoryName}>Fotografía</span>
                             <span className={styles.mockCategoryBtn}><Search size={8} /> Buscar</span>
                             <span className={styles.mockCategoryBadge}>5</span>
                           </div>
                           <div className={styles.mockCategoryCard}>
                             <div className={styles.mockCategoryIcon}><Utensils size={18} /></div>
                             <span className={styles.mockCategoryName}>Banquetería</span>
                             <span className={styles.mockCategoryBtn}><Search size={8} /> Buscar</span>
                           </div>
                           <div className={styles.mockCategoryCard}>
                             <div className={styles.mockCategoryIcon}><Music size={18} /></div>
                             <span className={styles.mockCategoryName}>DJ / Música</span>
                             <span className={styles.mockCategoryBtn}><Search size={8} /> Buscar</span>
                           </div>
                           <div className={`${styles.mockCategoryCard} ${styles.mockCategoryCompleted}`}>
                             <div className={styles.mockCategoryIcon}><Video size={18} /></div>
                             <span className={styles.mockCategoryName}>Video</span>
                             <span className={styles.mockCategoryBtn}><Search size={8} /> Buscar</span>
                             <span className={styles.mockCategoryBadge}>4</span>
                           </div>
                           <div className={styles.mockCategoryCard}>
                             <div className={styles.mockCategoryIcon}><Flower2 size={18} /></div>
                             <span className={styles.mockCategoryName}>Decoración</span>
                             <span className={styles.mockCategoryBtn}><Search size={8} /> Buscar</span>
                           </div>
                         </div>
                       </div>
                    ) : (
                      /* ===== REPLICA EXACTA DEL DASHBOARD "MIS LEADS" ===== */
                      <div className={styles.mockDashboard}>
                        {/* Header con título */}
                        <div className={styles.mockLeadsHeader}>
                          <h3>Mis Leads</h3>
                          <span className={styles.mockSubtitle}>Parejas interesadas en tus servicios</span>
                        </div>
                        
                        {/* Stats Row - Replica exacta del proveedor */}
                        <div className={styles.mockStatsRowProvider}>
                          <div className={styles.mockStatCard}>
                            <span className={styles.mockStatLabel}>LEADS TOTALES</span>
                            <span className={styles.mockStatValue}>12</span>
                          </div>
                          <div className={styles.mockStatCard}>
                            <span className={styles.mockStatLabel}>INTERESADOS</span>
                            <span className={styles.mockStatValueGold}>8</span>
                          </div>
                          <div className={styles.mockStatCard}>
                            <span className={styles.mockStatLabel}>CALIDAD</span>
                            <span className={styles.mockStatValue}>Alta</span>
                          </div>
                        </div>
                        
                        {/* Leads List - Con iconos reales */}
                        <div className={styles.mockLeadsList}>
                          <div className={styles.mockLeadsListHeader}>
                            <span>Leads recientes</span>
                            <button className={styles.mockViewAllBtn}>Ver todos →</button>
                          </div>
                          
                          <div className={styles.mockLeadCard}>
                            <div className={styles.mockLeadCategory}>
                              <Camera size={12} />
                              <span>Fotografía</span>
                            </div>
                            <div className={styles.mockLeadInfo}>
                              <p className={styles.mockLeadName}>María & Juan</p>
                              <span className={styles.mockLeadDate}>15 Mar 2025 • Pendiente</span>
                            </div>
                            <div className={styles.mockLeadMatchBadge}>
                              <Star size={8} />
                              Excelente
                            </div>
                          </div>
                          
                          <div className={styles.mockLeadCard}>
                            <div className={styles.mockLeadCategory}>
                              <Camera size={12} />
                              <span>Fotografía</span>
                            </div>
                            <div className={styles.mockLeadInfo}>
                              <p className={styles.mockLeadName}>Catalina & Pedro</p>
                              <span className={styles.mockLeadDate}>02 Abr 2025 • Interesado</span>
                            </div>
                            <div className={`${styles.mockLeadMatchBadge} ${styles.mockLeadMatchGood}`}>
                              <Star size={8} />
                              Muy bueno
                            </div>
                          </div>
                          
                          <div className={styles.mockLeadCard}>
                            <div className={styles.mockLeadCategory}>
                              <Video size={12} />
                              <span>Video</span>
                            </div>
                            <div className={styles.mockLeadInfo}>
                              <p className={styles.mockLeadName}>Andrea & Felipe</p>
                              <span className={styles.mockLeadDate}>20 May 2025 • Pendiente</span>
                            </div>
                            <div className={styles.mockLeadMatchBadge}>
                              <Star size={8} />
                              Excelente
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
