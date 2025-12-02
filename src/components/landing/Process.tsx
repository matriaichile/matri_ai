"use client";

import Link from 'next/link';
import { ArrowRight, Heart, Briefcase, Sparkles } from 'lucide-react';
import { useAnimateOnScroll } from '@/hooks/useAnimateOnScroll';
import styles from './Process.module.css';

const steps = [
  {
    number: "01",
    title: "Cuéntanos tu visión",
    description: "Comparte tus preferencias, estilo y presupuesto para encontrar los proveedores perfectos.",
    icon: Sparkles
  },
  {
    number: "02",
    title: "Recibe recomendaciones",
    description: "Seleccionamos cuidadosamente los mejores profesionales disponibles para tu fecha.",
    icon: Heart
  },
  {
    number: "03",
    title: "Conecta y celebra",
    description: "Agenda reuniones, compara opciones y cierra con los proveedores ideales.",
    icon: Briefcase
  }
];

export default function Process() {
  const { ref: headerRef, isVisible: headerVisible } = useAnimateOnScroll<HTMLDivElement>({ threshold: 0.3 });
  const { ref: stepsRef, isVisible: stepsVisible } = useAnimateOnScroll<HTMLDivElement>({ threshold: 0.2 });
  const { ref: dualRef, isVisible: dualVisible } = useAnimateOnScroll<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section className={styles.section}>
      {/* Elementos decorativos */}
      <div className={styles.decorBlob} />
      
      <div className={styles.container}>
        {/* Header */}
        <div 
          ref={headerRef}
          className={`${styles.header} ${headerVisible ? styles.visible : ''}`}
        >
          <div className={styles.headerContent}>
            <span className={styles.label}>Cómo funciona</span>
            <h2 className={styles.title}>Simple, elegante, efectivo</h2>
          </div>
          <div className={styles.headerAction}>
            <Link href="/como-funciona">
              Conoce más
              <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        {/* Pasos */}
        <div 
          ref={stepsRef}
          className={`${styles.steps} ${stepsVisible ? styles.visible : ''}`}
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index} 
                className={styles.step}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className={styles.stepIcon}>
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <div className={styles.stepNumber}>{step.number}</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.description}</p>
                </div>
                {index !== steps.length - 1 && (
                  <div className={styles.connector}>
                    <div className={styles.connectorLine} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sección dual - Parejas y Proveedores */}
        <div 
          ref={dualRef}
          className={`${styles.dualSection} ${dualVisible ? styles.visible : ''}`}
        >
          {/* Para Parejas */}
          <div className={styles.dualCard}>
            <div className={styles.dualIcon}>
              <Heart size={24} strokeWidth={1.5} />
            </div>
            <h3 className={styles.dualTitle}>Para Parejas</h3>
            <p className={styles.dualDesc}>
              Encuentra los proveedores perfectos para tu boda sin estrés. 
              Compara presupuestos, lee reseñas reales y agenda citas con un solo clic.
            </p>
            <Link href="/novios" className={styles.dualLink}>
              Planear mi boda
              <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
          </div>

          {/* Para Proveedores */}
          <div className={`${styles.dualCard} ${styles.dualCardDark}`}>
            <div className={styles.dualIcon}>
              <Briefcase size={24} strokeWidth={1.5} />
            </div>
            <h3 className={styles.dualTitle}>Para Proveedores</h3>
            <p className={styles.dualDesc}>
              Conecta con parejas que buscan exactamente lo que ofreces. 
              Recibe leads cualificados y haz crecer tu negocio de bodas.
            </p>
            <Link href="/proveedores" className={styles.dualLink}>
              Ofrecer mis servicios
              <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
