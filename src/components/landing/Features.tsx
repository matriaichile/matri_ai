"use client";

import styles from './Features.module.css';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
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
                {/* Placeholder for the dashboard image - styled as a card */}
                <div className={styles.dashboardCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.dots}>
                      <span className={styles.dot} style={{background: '#ff5f56'}}></span>
                      <span className={styles.dot} style={{background: '#ffbd2e'}}></span>
                      <span className={styles.dot} style={{background: '#27c93f'}}></span>
                    </div>
                    <span className={styles.addressBar}>dashboard.matri.ai</span>
                  </div>
                  <div className={styles.cardBody}>
                    {activeTab === 'couples' ? (
                       <div className={styles.mockContentCouples}>
                         <div className={styles.mockStat}>
                           <span>Progreso del evento</span>
                           <span>65%</span>
                         </div>
                         <div className={styles.progressBar}><div style={{width: '65%'}}></div></div>
                         <div className={styles.mockRow}>
                           <div className={styles.mockItem}>
                             <span>Fotografía</span>
                             <span className={styles.statusSuccess}>Contratado</span>
                           </div>
                           <div className={styles.mockItem}>
                             <span>Banquetería</span>
                             <span className={styles.statusPending}>Pendiente <span className={styles.badge}>3 Matches</span></span>
                           </div>
                         </div>
                       </div>
                    ) : (
                      <div className={styles.mockContentProviders}>
                        <div className={styles.mockStatsGrid}>
                          <div className={styles.mockStatBox}>
                            <span className={styles.bigNum}>12</span>
                            <span>Nuevos Leads</span>
                          </div>
                          <div className={styles.mockStatBox}>
                            <span className={styles.bigNum}>4.8</span>
                            <span>Calificación</span>
                          </div>
                        </div>
                        <div className={styles.mockList}>
                          <div className={styles.mockListItem}>
                            <div className={styles.avatar}>MJ</div>
                            <div>
                              <p>María & Juan</p>
                              <small>15 Nov 2024</small>
                            </div>
                          </div>
                          <div className={styles.mockListItem}>
                            <div className={styles.avatar}>CP</div>
                            <div>
                              <p>Cata & Pedro</p>
                              <small>02 Ene 2025</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
