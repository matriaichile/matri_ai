"use client";

import styles from './Features.module.css';
import { Heart, Search, ShieldCheck, Sparkles, TrendingUp, Calendar, Zap } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Features() {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <>
      {/* Sección para Novios */}
      <section id="couples" className={styles.section}>
        <div className={styles.container}>
          <motion.div 
            className={styles.header}
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className={styles.tag}>Para Novios</span>
            <h2 className={styles.title}>La Boda de tus Sueños, <br/>Sin el Estrés de la Planificación</h2>
            <p className={styles.description}>
              Olvídate de las hojas de cálculo interminables. Matri.AI hace el trabajo pesado por ti.
            </p>
          </motion.div>

          <div className={styles.grid}>
            <motion.div 
              className={styles.card}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className={styles.iconWrapper}><Sparkles size={32} /></div>
              <h3>Matchmaking Personalizado</h3>
              <p>Analizamos tu estilo, presupuesto y fecha para recomendarte solo a los proveedores que realmente encajan contigo.</p>
            </motion.div>
            <motion.div 
              className={styles.card}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className={styles.iconWrapper}><Search size={32} /></div>
              <h3>Búsqueda Centralizada</h3>
              <p>Encuentra banquetería, fotografía, música y más en un solo lugar, con perfiles verificados.</p>
            </motion.div>
            <motion.div 
              className={styles.card}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className={styles.iconWrapper}><ShieldCheck size={32} /></div>
              <h3>Garantía de Calidad</h3>
              <p>Solo trabajamos con proveedores evaluados y recomendados. Tu tranquilidad es nuestra prioridad.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sección Visual Intermedia */}
      <section className={styles.visualBreak}>
        <div className={styles.visualContent}>
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Celebra el Amor
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              "El matrimonio no es un destino, sino un viaje que comienza."
            </motion.p>
        </div>
      </section>

      {/* Sección para Proveedores */}
      <section id="providers" className={`${styles.section} ${styles.altBackground}`}>
        <div className={styles.container}>
          <motion.div 
            className={styles.header}
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className={styles.tag}>Para Proveedores</span>
            <h2 className={styles.title}>Impulsa tu Negocio <br/>con Clientes Cualificados</h2>
            <p className={styles.description}>
              Deja de perseguir leads que no convierten. Recibe solicitudes que realmente encajan con tu servicio.
            </p>
          </motion.div>

          <div className={styles.grid}>
            <motion.div 
              className={styles.card}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className={styles.iconWrapper}><Zap size={32} /></div>
              <h3>Leads de Alta Calidad</h3>
              <p>Recibe notificaciones solo de parejas que buscan exactamente lo que ofreces y tienen el presupuesto adecuado.</p>
            </motion.div>
            <motion.div 
              className={styles.card}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className={styles.iconWrapper}><Calendar size={32} /></div>
              <h3>Gestión de Calendario</h3>
              <p>Mantén tu disponibilidad actualizada y evita conflictos de fechas automáticamente.</p>
            </motion.div>
            <motion.div 
              className={styles.card}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className={styles.iconWrapper}><TrendingUp size={32} /></div>
              <h3>Dashboard Profesional</h3>
              <p>Gestiona tus estadísticas, muestra tu portafolio y construye tu reputación digital.</p>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

