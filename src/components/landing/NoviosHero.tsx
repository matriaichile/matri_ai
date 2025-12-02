"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ArrowRight } from 'lucide-react';
import styles from './NoviosHero.module.css';

export default function NoviosHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        {/* Contenido */}
        <div className={styles.content}>
          <span className={styles.label}>
            <Heart size={14} strokeWidth={1.5} />
            Para parejas
          </span>
          
          <h1 className={styles.title}>
            Tu boda perfecta, <br />
            <span className={styles.titleAccent}>sin complicaciones</span>
          </h1>
          
          <p className={styles.subtitle}>
            Encuentra los proveedores ideales para cada detalle de tu celebración. 
            Compara, conecta y celebra el amor como siempre lo soñaste.
          </p>
          
          <div className={styles.actions}>
            <Link href="/register/user" className={styles.primaryBtn}>
              Comenzar a planear
              <ArrowRight size={18} strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        {/* Imagen */}
        <div className={styles.imageWrapper}>
          <div className={styles.mainImage}>
            <Image
              src="https://images.unsplash.com/photo-1529636798458-92182e662485?q=80&w=1200&auto=format&fit=crop"
              alt="Pareja feliz en su boda"
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

