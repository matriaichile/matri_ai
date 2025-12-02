"use client";

import Link from 'next/link';
import { Target, BarChart3, Users, Check } from 'lucide-react';
import styles from './ProveedoresFeatures.module.css';

const features = [
  {
    icon: Target,
    title: "Leads cualificados",
    description: "Recibe solicitudes solo de parejas que buscan exactamente lo que ofreces y tienen el presupuesto adecuado."
  },
  {
    icon: BarChart3,
    title: "Dashboard analítico",
    description: "Monitorea tus estadísticas, visualiza tu rendimiento y optimiza tu estrategia de ventas."
  },
  {
    icon: Users,
    title: "Perfil profesional",
    description: "Muestra tu portafolio, reseñas verificadas y toda la información que las parejas necesitan."
  }
];

const plans = [
  {
    name: "Básico",
    price: "Gratis",
    period: "",
    description: "Perfecto para comenzar",
    features: [
      "Perfil verificado",
      "Hasta 5 leads/mes",
      "Galería básica",
      "Estadísticas simples"
    ],
    featured: false
  },
  {
    name: "Profesional",
    price: "$49",
    period: "/mes",
    description: "Más leads, más crecimiento",
    features: [
      "Todo lo básico",
      "Leads ilimitados",
      "Galería premium",
      "Prioridad en búsquedas",
      "Soporte prioritario"
    ],
    featured: true,
    badge: "Más popular"
  },
  {
    name: "Premium",
    price: "$99",
    period: "/mes",
    description: "Para negocios establecidos",
    features: [
      "Todo lo profesional",
      "Página personalizada",
      "Integraciones API",
      "Analytics avanzado",
      "Account manager"
    ],
    featured: false
  }
];

export default function ProveedoresFeatures() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.label}>Ventajas</span>
          <h2 className={styles.title}>Todo lo que necesitas para crecer</h2>
        </div>

        {/* Features grid */}
        <div className={styles.grid}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Pricing */}
        <div className={styles.pricing}>
          <div className={styles.pricingHeader}>
            <h3 className={styles.pricingTitle}>Planes para cada etapa</h3>
            <p className={styles.pricingSubtitle}>
              Elige el plan que mejor se adapte a tus necesidades
            </p>
          </div>

          <div className={styles.plans}>
            {plans.map((plan, index) => (
              <div key={index} className={`${styles.plan} ${plan.featured ? styles.featured : ''}`}>
                {plan.badge && <span className={styles.planBadge}>{plan.badge}</span>}
                <h4 className={styles.planName}>{plan.name}</h4>
                <div className={styles.planPrice}>
                  {plan.price}
                  {plan.period && <span>{plan.period}</span>}
                </div>
                <p className={styles.planDesc}>{plan.description}</p>
                <ul className={styles.planFeatures}>
                  {plan.features.map((feature, i) => (
                    <li key={i} className={styles.planFeatureItem}>
                      <Check size={16} strokeWidth={2} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register/provider" className={styles.planBtn}>
                  Comenzar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

