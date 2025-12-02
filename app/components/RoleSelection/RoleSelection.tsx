"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Heart, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import styles from "./RoleSelection.module.css";

const userFeatures = [
  "Cuestionario guiado paso a paso",
  "Recomendaciones personalizadas con IA",
  "Acceso a proveedores verificados",
  "Dashboard para gestionar tu boda",
  "Comparación de proveedores",
];

const providerFeatures = [
  "Perfil profesional destacado",
  "Leads cualificados según tu perfil",
  "Calendario de disponibilidad",
  "Gestión simplificada de clientes",
  "Analytics de rendimiento",
];

export default function RoleSelection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section id="register" className={styles.roleSelection} ref={sectionRef}>
      {/* Decorative elements */}
      <div className={styles.bgGradient} />
      <div className={styles.bgPattern} />

      <div className={styles.container}>
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className={styles.eyebrow}>Comienza tu viaje</span>
          <h2 className={styles.title}>
            <span className={styles.titleMain}>¿Quién</span>
            <span className={styles.titleAccent}> Eres?</span>
          </h2>
          <p className={styles.subtitle}>
            Selecciona tu rol y comienza a crear la experiencia perfecta
          </p>
          <div className={styles.titleDivider}>
            <span className={styles.dividerLine} />
            <Sparkles size={16} className={styles.dividerIcon} />
            <span className={styles.dividerLine} />
          </div>
        </motion.div>

        {/* Cards */}
        <motion.div
          className={styles.cardsContainer}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Usuario Card */}
          <motion.div
            className={`${styles.card} ${styles.cardUser}`}
            variants={cardVariants}
            whileHover={{ y: -10, transition: { duration: 0.4 } }}
          >
            <div className={styles.cardGlow} />
            
            <div className={styles.cardHeader}>
              <div className={styles.cardIconWrapper}>
                <Heart size={32} className={styles.cardIcon} />
              </div>
              <span className={styles.cardLabel}>Para parejas</span>
              <h3 className={styles.cardTitle}>Soy Usuario</h3>
              <p className={styles.cardSubtitle}>
                Encuentra los proveedores perfectos para tu día especial
              </p>
            </div>

            <div className={styles.cardDivider} />

            <ul className={styles.featuresList}>
              {userFeatures.map((feature, index) => (
                <motion.li
                  key={feature}
                  className={styles.featureItem}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                >
                  <CheckCircle2 size={16} className={styles.featureIcon} />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>

            <motion.a
              href="#wizard-user"
              className={styles.cardCta}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Comenzar como Pareja</span>
              <ArrowRight size={18} className={styles.ctaArrow} />
            </motion.a>

            <p className={styles.cardNote}>
              Proceso guiado de 5 minutos
            </p>
          </motion.div>

          {/* Decorative center element */}
          <motion.div
            className={styles.centerOrnament}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <span className={styles.ornamentText}>ó</span>
          </motion.div>

          {/* Proveedor Card */}
          <motion.div
            className={`${styles.card} ${styles.cardProvider}`}
            variants={cardVariants}
            whileHover={{ y: -10, transition: { duration: 0.4 } }}
          >
            <div className={styles.cardGlow} />
            
            <div className={styles.cardHeader}>
              <div className={styles.cardIconWrapper}>
                <Sparkles size={32} className={styles.cardIcon} />
              </div>
              <span className={styles.cardLabel}>Para profesionales</span>
              <h3 className={styles.cardTitle}>Soy Proveedor</h3>
              <p className={styles.cardSubtitle}>
                Conecta con parejas que buscan exactamente tus servicios
              </p>
            </div>

            <div className={styles.cardDivider} />

            <ul className={styles.featuresList}>
              {providerFeatures.map((feature, index) => (
                <motion.li
                  key={feature}
                  className={styles.featureItem}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                >
                  <CheckCircle2 size={16} className={styles.featureIcon} />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>

            <motion.a
              href="#wizard-provider"
              className={`${styles.cardCta} ${styles.cardCtaOutline}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Registrar mi Negocio</span>
              <ArrowRight size={18} className={styles.ctaArrow} />
            </motion.a>

            <p className={styles.cardNote}>
              Aprobación en 24-48 horas
            </p>
          </motion.div>
        </motion.div>

        {/* Bottom text */}
        <motion.p
          className={styles.bottomText}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
        >
          ¿Tienes preguntas? <a href="#contact" className={styles.contactLink}>Contáctanos</a>
        </motion.p>
      </div>
    </section>
  );
}

