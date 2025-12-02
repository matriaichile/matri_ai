"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Check, Heart, Briefcase, ArrowRight } from 'lucide-react';
import styles from './HowItWorksDetail.module.css';

const steps = [
  {
    number: "01",
    title: "Cuéntanos tu visión",
    description: "Completa un breve cuestionario sobre tu boda ideal. Fecha, estilo, presupuesto y preferencias. Todo lo que necesitamos para encontrar el match perfecto.",
    features: [
      "Cuestionario de 5 minutos",
      "Define tu estilo y presupuesto",
      "Selecciona categorías de interés"
    ],
    image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000&auto=format&fit=crop"
  },
  {
    number: "02",
    title: "Recibe recomendaciones personalizadas",
    description: "Nuestro algoritmo analiza tus preferencias y te presenta una selección curada de proveedores que se ajustan perfectamente a lo que buscas.",
    features: [
      "Matches basados en compatibilidad",
      "Proveedores verificados",
      "Comparación lado a lado"
    ],
    image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=1000&auto=format&fit=crop"
  },
  {
    number: "03",
    title: "Conecta y celebra",
    description: "Agenda reuniones directamente, negocia detalles y cierra contratos. Todo desde nuestra plataforma, con total transparencia y seguridad.",
    features: [
      "Mensajería directa",
      "Calendario integrado",
      "Contratos digitales seguros"
    ],
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop"
  }
];

export default function HowItWorksDetail() {
  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.label}>Cómo funciona</span>
          <h1 className={styles.title}>Simple, elegante, efectivo</h1>
          <p className={styles.subtitle}>
            Tres pasos para transformar tu visión en la celebración de tus sueños. 
            Sin complicaciones, sin estrés.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className={styles.section}>
        <div className={styles.container}>
          {steps.map((step, index) => (
            <div key={index} className={styles.step}>
              <div className={styles.stepContent}>
                <span className={styles.stepNumber}>{step.number}</span>
                <h2 className={styles.stepTitle}>{step.title}</h2>
                <p className={styles.stepDesc}>{step.description}</p>
                <div className={styles.stepFeatures}>
                  {step.features.map((feature, i) => (
                    <div key={i} className={styles.stepFeature}>
                      <Check size={18} strokeWidth={2} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.stepImage}>
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Dual CTA */}
        <div className={styles.dual}>
          <div className={styles.dualCard}>
            <div className={styles.dualIcon}>
              <Heart size={28} strokeWidth={1.5} />
            </div>
            <h3 className={styles.dualTitle}>Para Parejas</h3>
            <p className={styles.dualDesc}>
              Encuentra los proveedores perfectos para tu boda. Compara opciones, 
              lee reseñas reales y agenda citas con un solo clic.
            </p>
            <Link href="/register/user" className={styles.dualBtn}>
              Planear mi boda
              <ArrowRight size={18} strokeWidth={1.5} />
            </Link>
          </div>

          <div className={styles.dualCard}>
            <div className={styles.dualIcon}>
              <Briefcase size={28} strokeWidth={1.5} />
            </div>
            <h3 className={styles.dualTitle}>Para Proveedores</h3>
            <p className={styles.dualDesc}>
              Haz crecer tu negocio conectando con parejas que buscan exactamente 
              lo que ofreces. Leads cualificados, sin intermediarios.
            </p>
            <Link href="/register/provider" className={styles.dualBtn}>
              Ofrecer servicios
              <ArrowRight size={18} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

