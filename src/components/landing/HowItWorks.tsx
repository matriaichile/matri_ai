"use client";

import styles from './HowItWorks.module.css';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, FileText, Sparkles, HeartHandshake, Building2, Users, TrendingUp, Calendar } from 'lucide-react';

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<'couples' | 'providers'>('couples');

  // Contenido para Novios
  const couplesSteps = [
    {
      number: '01',
      title: 'Crea tu usuario',
      desc: 'Regístrate y cuéntanos sobre tu boda soñada a través de un cuestionario interactivo y personalizado.',
      icon: UserPlus,
      tag: '5 minutos'
    },
    {
      number: '02',
      title: 'Responde el cuestionario',
      desc: 'Nuestras preguntas inteligentes capturan tus preferencias, estilo, presupuesto y visión única.',
      icon: FileText,
      tag: 'Paso a paso'
    },
    {
      number: '03',
      title: 'Recibe recomendaciones',
      desc: 'Nuestra IA analiza tu perfil y te presenta los 3 proveedores más compatibles para cada categoría.',
      icon: Sparkles,
      tag: 'IA Avanzada'
    },
    {
      number: '04',
      title: 'Conecta y celebra',
      desc: 'Elige tus proveedores favoritos, coordina los detalles y prepárate para tu día especial.',
      icon: HeartHandshake,
      tag: '¡Tu boda!'
    }
  ];

  // Contenido para Proveedores
  const providersSteps = [
    {
      number: '01',
      title: 'Registra tu empresa',
      desc: 'Crea tu perfil de proveedor con la información de tu negocio, servicios y portafolio.',
      icon: Building2,
      tag: '10 minutos'
    },
    {
      number: '02',
      title: 'Completa tu perfil',
      desc: 'Añade tus servicios, precios, disponibilidad y responde preguntas sobre tu estilo de trabajo.',
      icon: FileText,
      tag: 'Personalizado'
    },
    {
      number: '03',
      title: 'Recibe leads calificados',
      desc: 'Nuestra IA te conecta solo con parejas cuyo presupuesto y fecha coinciden con tu disponibilidad.',
      icon: Users,
      tag: 'Pre-filtrados'
    },
    {
      number: '04',
      title: 'Cierra más ventas',
      desc: 'Gestiona tus leads, coordina reuniones y haz crecer tu negocio con clientes ideales.',
      icon: TrendingUp,
      tag: '¡Más clientes!'
    }
  ];

  const steps = activeTab === 'couples' ? couplesSteps : providersSteps;
  const subtitle = activeTab === 'couples' 
    ? 'Cuatro simples pasos hacia tu boda perfecta' 
    : 'Cuatro simples pasos para hacer crecer tu negocio';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section id="how-it-works" className={styles.section}>
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className={styles.title}>¿Cómo Funciona?</h2>
          
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
                    layoutId="activeTabHowItWorks"
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
                    layoutId="activeTabHowItWorks"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.p 
              key={activeTab}
              className={styles.subtitle}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {subtitle}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            className={styles.stepsWrapper}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
          >
            {/* Connector Line */}
            <div className={styles.mainConnector} />

            <div className={styles.steps}>
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div key={`${activeTab}-${index}`} className={styles.step} variants={itemVariants}>
                    <div className={styles.iconContainer}>
                      <div className={styles.iconCircle}>
                        <Icon size={28} strokeWidth={1.5} />
                      </div>
                      <div className={styles.stepNumber}>{step.number}</div>
                    </div>
                    
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepDesc}>{step.desc}</p>
                    
                    <span className={styles.stepTag}>{step.tag}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
