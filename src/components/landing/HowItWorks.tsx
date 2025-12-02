"use client";

import styles from './HowItWorks.module.css';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Cuéntanos tu Sueño',
      desc: 'Responde nuestro wizard sobre tus preferencias, estilo y presupuesto.'
    },
    {
      number: '02',
      title: 'Recibe Matches',
      desc: 'Seleccionamos los mejores proveedores disponibles para tu fecha.'
    },
    {
      number: '03',
      title: 'Conecta y Celebra',
      desc: 'Revisa perfiles, agenda citas y cierra contratos en una plataforma segura.'
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
          <p className={styles.subtitle}>Tres simples pasos para la boda perfecta.</p>
        </motion.div>

        <motion.div 
          className={styles.steps}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {steps.map((step, index) => (
            <motion.div key={index} className={styles.step} variants={itemVariants}>
              <div className={styles.number}>{step.number}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
              {index !== steps.length - 1 && <div className={styles.connector} />}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

