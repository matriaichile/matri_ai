"use client";

import styles from './HowItWorks.module.css';
import { motion } from 'framer-motion';
import { UserPlus, FileText, Sparkles, HeartHandshake } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
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
          <p className={styles.subtitle}>Cuatro simples pasos hacia tu boda perfecta</p>
        </motion.div>

        <motion.div 
          className={styles.stepsWrapper}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
           {/* Connector Line */}
           <div className={styles.mainConnector} />

          <div className={styles.steps}>
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div key={index} className={styles.step} variants={itemVariants}>
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
      </div>
    </section>
  );
}
