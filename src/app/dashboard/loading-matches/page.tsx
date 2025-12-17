'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import styles from './page.module.css';

/**
 * Pantalla de carga mientras se buscan los matches.
 * Muestra una animación elegante y mensajes de progreso.
 */
export default function LoadingMatchesPage() {
  const router = useRouter();
  const { isAuthenticated, userType, isLoading } = useAuthStore();
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);

  const loadingMessages = [
    'Analizando tus preferencias...',
    'Buscando proveedores en tu zona...',
    'Comparando estilos y presupuestos...',
    'Calculando compatibilidad...',
    'Preparando tus recomendaciones...',
  ];

  // Verificar autenticación
  useEffect(() => {
    if (!isLoading && !isAuthenticated()) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Simular progreso de carga
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, []);

  // Cambiar mensajes de carga
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(messageInterval);
  }, []);

  // Redirigir al dashboard cuando termine
  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    }
  }, [progress, router]);

  return (
    <main className={styles.main}>
      {/* Fondo decorativo */}
      <div className={styles.backgroundPattern} />
      <div className={styles.gradientOverlay} />
      
      {/* Partículas flotantes */}
      <div className={styles.particles}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className={styles.particle} style={{ animationDelay: `${i * 0.5}s` }} />
        ))}
      </div>

      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logoContainer}>
          <Image 
            src="/logo.png" 
            alt="MatriMatch Logo" 
            width={200} 
            height={72}
            className={styles.logo}
          />
        </div>

        {/* Contenido principal */}
        <div className={styles.content}>
          {/* Icono animado */}
          <div className={styles.iconContainer}>
            <div className={styles.iconRing} />
            <div className={styles.iconRing2} />
            <div className={styles.iconInner}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
          </div>

          {/* Título */}
          <h1 className={styles.title}>
            Buscando tu <span className={styles.highlight}>match perfecto</span>
          </h1>

          {/* Mensaje actual */}
          <p className={styles.message} key={currentMessage}>
            {loadingMessages[currentMessage]}
          </p>

          {/* Barra de progreso */}
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={styles.progressText}>{progress}%</span>
          </div>

          {/* Indicadores de pasos */}
          <div className={styles.steps}>
            {loadingMessages.map((_, index) => (
              <div 
                key={index}
                className={`${styles.step} ${index <= currentMessage ? styles.stepActive : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Texto inferior */}
        <p className={styles.footerText}>
          Nuestro algoritmo está analizando cientos de proveedores para encontrar los mejores para ti
        </p>
      </div>
    </main>
  );
}









