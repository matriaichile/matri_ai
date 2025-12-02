"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { 
  Heart, 
  Sparkles, 
  Calendar, 
  Users, 
  Star, 
  Shield,
  Camera,
  Music,
  Utensils,
  MapPin
} from "lucide-react";
import styles from "./Benefits.module.css";

const userBenefits = [
  {
    icon: Sparkles,
    title: "Matchmaking Inteligente",
    description: "Nuestra IA encuentra los proveedores perfectos según tu estilo, presupuesto y preferencias únicas.",
  },
  {
    icon: Calendar,
    title: "Disponibilidad en Tiempo Real",
    description: "Visualiza al instante qué proveedores están disponibles para la fecha de tu evento.",
  },
  {
    icon: Star,
    title: "Proveedores Verificados",
    description: "Todos nuestros proveedores pasan por un riguroso proceso de selección y verificación.",
  },
  {
    icon: Heart,
    title: "Experiencia Personalizada",
    description: "Cada recomendación está diseñada exclusivamente para tu visión de boda perfecta.",
  },
];

const providerBenefits = [
  {
    icon: Users,
    title: "Leads Cualificados",
    description: "Recibe solicitudes de parejas que ya coinciden con tu perfil y servicios.",
  },
  {
    icon: Shield,
    title: "Gestión Simplificada",
    description: "Dashboard intuitivo para gestionar tu disponibilidad, precios y portafolio.",
  },
  {
    icon: Star,
    title: "Mayor Visibilidad",
    description: "Destaca entre los mejores proveedores y aumenta tu presencia en el mercado.",
  },
  {
    icon: Sparkles,
    title: "Match Perfecto",
    description: "Conecta con parejas que buscan exactamente lo que ofreces, sin perder tiempo.",
  },
];

const categories = [
  { icon: Camera, name: "Fotografía" },
  { icon: Music, name: "DJ & Música" },
  { icon: Utensils, name: "Banquetería" },
  { icon: MapPin, name: "Lugares" },
];

export default function Benefits() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
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
    <section id="benefits" className={styles.benefits} ref={sectionRef}>
      {/* Decorative background */}
      <div className={styles.bgPattern} />
      
      <div className={styles.container}>
        {/* Section Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className={styles.eyebrow}>¿Por qué elegirnos?</span>
          <h2 className={styles.title}>
            <span className={styles.titleMain}>Beneficios</span>
            <span className={styles.titleAccent}> Exclusivos</span>
          </h2>
          <div className={styles.titleDivider}>
            <span className={styles.dividerLine} />
            <Heart size={14} className={styles.dividerIcon} />
            <span className={styles.dividerLine} />
          </div>
        </motion.div>

        {/* Two Column Benefits */}
        <div className={styles.benefitsGrid}>
          {/* Para Parejas */}
          <motion.div
            className={styles.benefitsColumn}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <motion.div className={styles.columnHeader} variants={itemVariants}>
              <span className={styles.columnIcon}>
                <Heart size={20} />
              </span>
              <h3 className={styles.columnTitle}>Para Parejas</h3>
              <p className={styles.columnSubtitle}>Tu boda de ensueño, a un clic</p>
            </motion.div>

            <div className={styles.benefitsList}>
              {userBenefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  className={styles.benefitCard}
                  variants={itemVariants}
                  whileHover={{ y: -5, transition: { duration: 0.3 } }}
                >
                  <div className={styles.benefitIcon}>
                    <benefit.icon size={22} />
                  </div>
                  <div className={styles.benefitContent}>
                    <h4 className={styles.benefitTitle}>{benefit.title}</h4>
                    <p className={styles.benefitDescription}>{benefit.description}</p>
                  </div>
                  <div className={styles.benefitNumber}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Para Proveedores */}
          <motion.div
            className={styles.benefitsColumn}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <motion.div className={styles.columnHeader} variants={itemVariants}>
              <span className={styles.columnIcon}>
                <Sparkles size={20} />
              </span>
              <h3 className={styles.columnTitle}>Para Proveedores</h3>
              <p className={styles.columnSubtitle}>Haz crecer tu negocio</p>
            </motion.div>

            <div className={styles.benefitsList}>
              {providerBenefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  className={styles.benefitCard}
                  variants={itemVariants}
                  whileHover={{ y: -5, transition: { duration: 0.3 } }}
                >
                  <div className={styles.benefitIcon}>
                    <benefit.icon size={22} />
                  </div>
                  <div className={styles.benefitContent}>
                    <h4 className={styles.benefitTitle}>{benefit.title}</h4>
                    <p className={styles.benefitDescription}>{benefit.description}</p>
                  </div>
                  <div className={styles.benefitNumber}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Categories Preview */}
        <motion.div
          className={styles.categoriesSection}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className={styles.categoriesLabel}>Categorías disponibles</p>
          <div className={styles.categoriesGrid}>
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                className={styles.categoryItem}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <category.icon size={24} className={styles.categoryIcon} />
                <span className={styles.categoryName}>{category.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

