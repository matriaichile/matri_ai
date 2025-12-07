'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { resetPassword, getAuthErrorMessage } from '@/lib/firebase/auth';
import styles from './page.module.css';

/**
 * Página para recuperar contraseña.
 * Envía un email de recuperación usando Firebase Auth.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await resetPassword(email);
      setIsSuccess(true);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      {/* Fondo decorativo */}
      <div className={styles.backgroundPattern} />
      <div className={styles.gradientOverlay} />

      <div className={styles.container}>
        <Link href="/" className={styles.logoLink}>
          <Image 
            src="/logo.png" 
            alt="MatriMatch Logo" 
            width={200} 
            height={72}
            className={styles.logo}
          />
        </Link>

        <div className={styles.card}>
          {isSuccess ? (
            <div className={styles.successState}>
              <div className={styles.successIcon}>
                <Check size={32} />
              </div>
              <h2>¡Correo enviado!</h2>
              <p>
                Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
              </p>
              <Link href="/login" className={styles.backButton}>
                <ArrowLeft size={18} />
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <div className={styles.header}>
                <h1>Recuperar contraseña</h1>
                <p>Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.</p>
              </div>

              {error && (
                <div className={styles.errorMessage}>
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label htmlFor="email">Correo Electrónico</label>
                  <div className={styles.inputWrapper}>
                    <Mail className={styles.inputIcon} size={20} />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className={styles.loadingSpinner} />
                  ) : (
                    'Enviar instrucciones'
                  )}
                </button>
              </form>

              <Link href="/login" className={styles.backLink}>
                <ArrowLeft size={16} />
                Volver al inicio de sesión
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}





