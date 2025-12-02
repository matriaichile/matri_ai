"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Briefcase, ArrowRight } from 'lucide-react';
import styles from './ProveedoresHero.module.css';

const stats = [
  { number: "85%", label: "Tasa de conversión" },
  { number: "2.5k+", label: "Parejas activas" },
  { number: "48h", label: "Tiempo de respuesta" }
];

export default function ProveedoresHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        {/* Contenido */}
        <div className={styles.content}>
          <span className={styles.label}>
            <Briefcase size={14} strokeWidth={1.5} />
            Para proveedores
          </span>
          
          <h1 className={styles.title}>
            Haz crecer tu negocio <br />
            <span className={styles.titleAccent}>de bodas</span>
          </h1>
          
          <p className={styles.subtitle}>
            Conecta con parejas que buscan exactamente lo que ofreces. 
            Leads cualificados, sin intermediarios, resultados reales.
          </p>
          
          <div className={styles.actions}>
            <Link href="/register/provider" className={styles.primaryBtn}>
              Unirme ahora
              <ArrowRight size={18} strokeWidth={1.5} />
            </Link>
            <Link href="/precios" className={styles.secondaryBtn}>
              Ver planes
            </Link>
          </div>

          {/* Stats */}
          <div className={styles.stats}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.stat}>
                <div className={styles.statNumber}>{stat.number}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Imagen */}
        <div className={styles.imageWrapper}>
          <div className={styles.mainImage}>
            <Image
              src="https://images.unsplash.com/photo-1556125574-d7f27ec36a06?q=80&w=1200&auto=format&fit=crop"
              alt="Fotógrafo profesional de bodas"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className={styles.decoration} />
        </div>
      </div>
    </section>
  );
}

