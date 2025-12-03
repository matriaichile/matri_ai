'use client';

import { useEffect, ReactNode } from 'react';
import { initAuthListener } from '@/lib/firebase/auth';
import { useAuthStore } from '@/store/authStore';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Componente proveedor de autenticación.
 * Inicializa el listener de Firebase Auth y mantiene el estado sincronizado.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { isInitialized } = useAuthStore();

  useEffect(() => {
    // Inicializar el listener de autenticación
    const unsubscribe = initAuthListener();
    
    // Limpiar al desmontar
    return () => {
      unsubscribe();
    };
  }, []);

  // Mientras se inicializa, podemos mostrar un estado de carga
  // Por ahora, renderizamos los children directamente
  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(212, 175, 55, 0.3)',
            borderTopColor: '#d4af37',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

