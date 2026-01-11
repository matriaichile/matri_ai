"use client";

import styles from './ComingSoon.module.css';
import { motion } from 'framer-motion';
import { 
  Users, 
  LayoutGrid, 
  MapPin, 
  Clock, 
  CheckSquare, 
  Sparkles,
  Rocket
} from 'lucide-react';

// Lista de funcionalidades que vendrán en la segunda etapa
const upcomingFeatures = [
  {
    icon: Users,
    title: "Lista de Invitados",
    description: "Gestiona tu lista completa con confirmaciones automáticas"
  },
  {
    icon: LayoutGrid,
    title: "Distribución de Mesas",
    description: "Organiza la ubicación de tus invitados visualmente"
  },
  {
    icon: MapPin,
    title: "Layout del Evento",
    description: "Diseña el espacio de tu celebración con herramientas intuitivas"
  },
  {
    icon: Clock,
    title: "Timeline del Día",
    description: "Planifica cada momento de tu boda minuto a minuto"
  },
  {
    icon: CheckSquare,
    title: "Checklist Inteligente",
    description: "Tareas personalizadas según tu fecha y tipo de boda"
  },
  {
    icon: Sparkles,
    title: "Y mucho más...",
    description: "Nuevas herramientas para hacer tu planificación más fácil"
  }
];

export default function ComingSoon() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className={styles.section} id="coming-soon">
      <div className={styles.container}>
        {/* Header */}
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.badge}>
            <Rocket size={14} />
            <span>Próximamente</span>
          </div>
          
          <h2 className={styles.title}>
            Próximamente en <span className={styles.highlight}>MatriMatch</span>
          </h2>
          
          <p className={styles.subtitle}>
            Planifica tu matrimonio completo en un solo lugar: lista de invitados, 
            mesas, layout, timeline, checklist inteligente y más.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className={styles.featuresGrid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {upcomingFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div 
                key={index} 
                className={styles.featureCard}
                variants={itemVariants}
              >
                <div className={styles.iconWrapper}>
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <div className={styles.featureContent}>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Note */}
        <motion.p 
          className={styles.bottomNote}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Estamos trabajando para ofrecerte la experiencia de planificación de bodas más completa de Chile.
        </motion.p>
      </div>
    </section>
  );
}



