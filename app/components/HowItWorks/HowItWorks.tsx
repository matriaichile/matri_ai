"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { 
  UserPlus, 
  MessageSquareText, 
  Sparkles, 
  Heart,
  ArrowRight 
} from "lucide-react";
import styles from "./HowItWorks.module.css";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Crea tu Perfil",
    description: "Regístrate y cuéntanos sobre tu boda soñada a través de un wizard interactivo y personalizado.",
    detail: "5 minutos",
  },
  {
    number: "02",
    icon: MessageSquareText,
    title: "Responde el Cuestionario",
    description: "Nuestras preguntas inteligentes capturan tus preferencias, estilo, presupuesto y visión única.",
    detail: "Paso a paso",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Recibe Recomendaciones",
    description: "Nuestra IA analiza tu perfil y te presenta los 3 proveedores más compatibles para cada categoría.",
    detail: "IA Avanzada",
  },
  {
    number: "04",
    icon: Heart,
    title: "Conecta y Celebra",
    description: "Elige tus proveedores favoritos, coordina los detalles y prepárate para tu día especial.",
    detail: "¡Tu boda!",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className={styles.howItWorks} ref={sectionRef}>
      <div className={styles.container}>
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className={styles.eyebrow}>Proceso simple</span>
          <h2 className={styles.title}>
            <span className={styles.titleMain}>¿Cómo</span>
            <span className={styles.titleAccent}> Funciona?</span>
          </h2>
          <p className={styles.subtitle}>
            Cuatro simples pasos hacia tu boda perfecta
          </p>
          <div className={styles.titleDivider}>
            <span className={styles.dividerLine} />
            <Sparkles size={14} className={styles.dividerIcon} />
            <span className={styles.dividerLine} />
          </div>
        </motion.div>

        {/* Steps */}
        <div className={styles.stepsContainer}>
          {/* Connecting line */}
          <motion.div
            className={styles.connectingLine}
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className={styles.step}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ 
                duration: 0.8, 
                delay: 0.2 + index * 0.15,
                ease: [0.22, 1, 0.36, 1] 
              }}
            >
              {/* Step number badge */}
              <motion.div
                className={styles.stepBadge}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <span className={styles.stepNumber}>{step.number}</span>
              </motion.div>

              {/* Icon */}
              <motion.div
                className={styles.stepIconWrapper}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <step.icon size={28} className={styles.stepIcon} />
              </motion.div>

              {/* Content */}
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
                <span className={styles.stepDetail}>{step.detail}</span>
              </div>

              {/* Arrow (except last) */}
              {index < steps.length - 1 && (
                <div className={styles.stepArrow}>
                  <ArrowRight size={20} />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className={styles.ctaContainer}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.a
            href="#register"
            className={styles.cta}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Comenzar Ahora</span>
            <Heart size={16} />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

