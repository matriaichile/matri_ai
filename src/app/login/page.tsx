'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import styles from './page.module.css';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Función placeholder para el submit - la lógica de Firebase se agregará después
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular carga - aquí irá la lógica de Firebase
    setTimeout(() => {
      setIsLoading(false);
      console.log('Login attempt:', { email, password });
    }, 1500);
  };

  return (
    <main className={styles.main}>
      {/* Fondo decorativo */}
      <div className={styles.backgroundPattern} />
      <div className={styles.gradientOverlay} />
      
      {/* Partículas decorativas */}
      <div className={styles.particles}>
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
      </div>

      <div className={styles.container}>
        {/* Lado izquierdo - Branding */}
        <div className={styles.brandingSide}>
          <div className={styles.brandingContent}>
            <Link href="/" className={styles.logoLink}>
              <Image 
                src="/logo.png" 
                alt="MatriMatch Logo" 
                width={280} 
                height={100}
                className={styles.logo}
              />
            </Link>
            
            <div className={styles.brandingText}>
              <h1 className={styles.brandingTitle}>
                Bienvenido de <span className={styles.highlight}>vuelta</span>
              </h1>
              <p className={styles.brandingSubtitle}>
                Tu boda perfecta te espera. Continúa planificando el día más especial de tu vida.
              </p>
            </div>

            <div className={styles.features}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <Sparkles size={20} />
                </div>
                <span>Recomendaciones personalizadas con IA</span>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <Sparkles size={20} />
                </div>
                <span>Proveedores exclusivos verificados</span>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <Sparkles size={20} />
                </div>
                <span>Planificación sin estrés</span>
              </div>
            </div>
          </div>

          {/* Decoración elegante */}
          <div className={styles.decorativeRing} />
          <div className={styles.decorativeRing2} />
        </div>

        {/* Lado derecho - Formulario */}
        <div className={styles.formSide}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Iniciar Sesión</h2>
              <p className={styles.formSubtitle}>
                Ingresa tus credenciales para continuar
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Campo de Email */}
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>
                  Correo Electrónico
                </label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} size={20} />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              {/* Campo de Contraseña */}
              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.label}>
                  Contraseña
                </label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={styles.input}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.passwordToggle}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Opciones adicionales */}
              <div className={styles.formOptions}>
                <label className={styles.rememberMe}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span className={styles.checkmark} />
                  <span>Recordarme</span>
                </label>
                <Link href="/forgot-password" className={styles.forgotPassword}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Botón de Submit */}
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className={styles.loadingSpinner} />
                ) : (
                  <>
                    Ingresar
                    <ArrowRight size={20} className={styles.buttonIcon} />
                  </>
                )}
              </button>

              {/* Divisor */}
              <div className={styles.divider}>
                <span>o continúa con</span>
              </div>

              {/* Botones de redes sociales */}
              <div className={styles.socialButtons}>
                <button type="button" className={styles.socialButton}>
                  <svg viewBox="0 0 24 24" className={styles.socialIcon}>
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button type="button" className={styles.socialButton}>
                  <svg viewBox="0 0 24 24" className={styles.socialIcon}>
                    <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  Facebook
                </button>
              </div>
            </form>

            {/* Link de registro */}
            <p className={styles.registerLink}>
              ¿No tienes una cuenta?{' '}
              <Link href="/register/user" className={styles.registerLinkHighlight}>
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

