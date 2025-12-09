'use client';

import { ReactNode, useEffect } from 'react';
import { initializeTheme, clearTheme } from '@/store/themeStore';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Layout específico para el dashboard de novios y proveedores.
 * Incluye el sistema de temas (claro/oscuro) que SOLO aplica en esta sección.
 * 
 * IMPORTANTE: La landing y el admin NO se ven afectados por estos estilos.
 * El tema se limpia automáticamente cuando el usuario sale del dashboard.
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  useEffect(() => {
    // Aplicar el tema inmediatamente al entrar al dashboard
    try {
      const saved = localStorage.getItem('matri-theme');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.state?.theme) {
          document.documentElement.classList.add(parsed.state.theme);
          document.documentElement.setAttribute('data-theme', parsed.state.theme);
        } else {
          // Default a dark
          document.documentElement.classList.add('dark');
          document.documentElement.setAttribute('data-theme', 'dark');
        }
      } else {
        // Default a dark si no hay preferencia guardada
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    } catch {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Inicializar el store del tema
    initializeTheme();

    // Limpiar al desmontar (cuando el usuario sale del dashboard)
    return () => {
      clearTheme();
    };
  }, []);

  return <>{children}</>;
}
