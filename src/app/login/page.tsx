'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { loginWithEmail } from '@/lib/firebase/auth';
import { useAuthStore } from '@/store/authStore';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, userType, error: authError, setError } = useAuthStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated()) {
      if (userType === 'admin') {
        router.push('/admin');
      } else if (userType === 'user') {
        router.push('/dashboard');
      } else if (userType === 'provider') {
        router.push('/dashboard/provider');
      }
    }
  }, [isAuthenticated, userType, router]);

  // Limpiar errores al cambiar campos
  useEffect(() => {
    setLocalError(null);
    setError(null);
  }, [email, password, setError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError(null);
    
    try {
      const user = await loginWithEmail(email, password);
      
      // Verificar si es admin leyendo los claims del token
      const tokenResult = await user.getIdTokenResult(true);
      const claims = tokenResult.claims;
      
      // Redirigir según tipo de usuario
      // El middleware también maneja esto, pero hacemos redirect explícito para UX
      if (claims.admin === true || claims.super_admin === true) {
        router.push('/admin');
      } else {
        // El useEffect redirigirá según userType del store
        router.refresh(); // Forzar que el middleware actúe
      }
    } catch (error) {
      // El error ya se maneja en el store
      console.error('Error de login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = localError || authError;

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

            {/* Mensaje de error */}
            {displayError && (
              <div className={styles.errorMessage}>
                <AlertCircle size={20} />
                <span>{displayError}</span>
              </div>
            )}

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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
            </form>

            {/* Links de registro */}
            <div className={styles.registerLinks}>
              <p className={styles.registerLink}>
                ¿No tienes una cuenta?
              </p>
              <div className={styles.registerOptions}>
                <Link href="/register/user" className={styles.registerLinkHighlight}>
                  Soy Novio/a
                </Link>
                <span className={styles.registerDivider}>|</span>
                <Link href="/register/provider" className={styles.registerLinkSecondary}>
                  Soy Proveedor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
