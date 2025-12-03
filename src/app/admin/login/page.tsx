'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/authStore';
import styles from './page.module.css';

/**
 * Página de login exclusiva para administradores.
 * Verifica los custom claims después del login.
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const { firebaseUser, isLoading: authLoading, isInitialized } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si ya está autenticado, verificar si es admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (isInitialized && firebaseUser) {
        try {
          // Leer claims directamente del token
          const tokenResult = await firebaseUser.getIdTokenResult(true);
          const claims = tokenResult.claims;
          
          if (claims.admin === true || claims.super_admin === true) {
            router.push('/admin');
          }
        } catch (error) {
          console.error('Error al verificar admin:', error);
        }
      }
    };

    checkAdminStatus();
  }, [firebaseUser, isInitialized, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Intentar login con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Verificar si tiene claims de admin leyendo directamente del token
      const tokenResult = await user.getIdTokenResult(true);
      const claims = tokenResult.claims;

      if (claims.admin !== true && claims.super_admin !== true) {
        // No es admin, cerrar sesión y mostrar error
        await auth.signOut();
        setError('No tienes permisos de administrador. Contacta al equipo de soporte.');
        return;
      }

      // Es admin, redirigir al dashboard
      router.push('/admin');
    } catch (err) {
      console.error('Error de login:', err);
      
      // Manejar errores de Firebase
      if (err && typeof err === 'object' && 'code' in err) {
        const errorCode = (err as { code: string }).code;
        switch (errorCode) {
          case 'auth/invalid-email':
            setError('El correo electrónico no es válido.');
            break;
          case 'auth/user-not-found':
            setError('No existe una cuenta con este correo.');
            break;
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            setError('Credenciales incorrectas.');
            break;
          case 'auth/too-many-requests':
            setError('Demasiados intentos. Intenta más tarde.');
            break;
          default:
            setError('Error al iniciar sesión. Intenta de nuevo.');
        }
      } else {
        setError('Error inesperado. Intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar loading mientras se inicializa
  if (authLoading || !isInitialized) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <div className={styles.spinner} />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.card}>
          {/* Header */}
          <div className={styles.header}>
            <Link href="/" className={styles.logoLink}>
              <Image
                src="/logo.png"
                alt="MatriMatch Logo"
                width={160}
                height={56}
                className={styles.logo}
              />
            </Link>
            
            <div className={styles.adminBadge}>
              <Shield size={16} />
              <span>Panel de Administración</span>
            </div>
            
            <h1 className={styles.title}>Acceso Administrativo</h1>
            <p className={styles.subtitle}>
              Ingresa tus credenciales de administrador
            </p>
          </div>

          {/* Form */}
          <form className={styles.form} onSubmit={handleSubmit}>
            {/* Email */}
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Correo electrónico
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  placeholder="admin@matri.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Mail size={18} className={styles.inputIcon} />
              </div>
            </div>

            {/* Password */}
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Contraseña
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Lock size={18} className={styles.inputIcon} />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className={styles.error}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <>
                  <div className={styles.spinner} />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className={styles.footer}>
            <Link href="/" className={styles.backLink}>
              <ArrowLeft size={16} />
              <span>Volver al inicio</span>
            </Link>
          </div>

          {/* Security note */}
          <div className={styles.securityNote}>
            <ShieldCheck size={16} />
            <span>Conexión segura con verificación de permisos</span>
          </div>
        </div>
      </div>
    </main>
  );
}

