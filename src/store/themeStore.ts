import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Tipos de tema disponibles
export type Theme = 'light' | 'dark';

// Interfaz del estado del tema
interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * Store de Zustand para manejar el tema (modo claro/oscuro).
 * Utiliza persist para guardar la preferencia en localStorage.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // Tema por defecto: oscuro (mantiene la estética actual)
      theme: 'dark',
      
      // Establecer un tema específico
      setTheme: (theme: Theme) => {
        set({ theme });
        // Actualizar la clase del documento
        updateDocumentTheme(theme);
      },
      
      // Alternar entre temas
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme: Theme = currentTheme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        // Actualizar la clase del documento
        updateDocumentTheme(newTheme);
      },
    }),
    {
      name: 'matri-theme', // Nombre único para localStorage
      storage: createJSONStorage(() => localStorage),
      // Cuando se rehidrata el estado, actualizar el DOM
      onRehydrateStorage: () => (state) => {
        if (state) {
          updateDocumentTheme(state.theme);
        }
      },
    }
  )
);

/**
 * Actualiza las clases del documento HTML para aplicar el tema.
 * Añade/quita las clases 'light' y 'dark' del elemento HTML.
 */
function updateDocumentTheme(theme: Theme) {
  if (typeof window !== 'undefined') {
    const root = document.documentElement;
    
    // Remover ambas clases primero
    root.classList.remove('light', 'dark');
    
    // Añadir la clase del tema actual
    root.classList.add(theme);
    
    // También actualizar el atributo data-theme para mayor compatibilidad
    root.setAttribute('data-theme', theme);
  }
}

/**
 * Hook para inicializar el tema al cargar la aplicación.
 * IMPORTANTE: Solo debe usarse en el dashboard. La landing y admin NO usan este sistema.
 */
export function initializeTheme() {
  if (typeof window !== 'undefined') {
    // Verificar que estamos en una ruta de dashboard
    const isDashboardRoute = window.location.pathname.startsWith('/dashboard');
    
    if (!isDashboardRoute) {
      // Si no estamos en dashboard, no aplicar tema
      return;
    }
    
    // Obtener el tema guardado o usar el preferido del sistema
    const savedTheme = localStorage.getItem('matri-theme');
    
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        if (parsed.state?.theme) {
          updateDocumentTheme(parsed.state.theme);
          return;
        }
      } catch {
        // Si hay error, usar el tema por defecto
      }
    }
    
    // Si no hay tema guardado, usar dark por defecto en dashboard
    updateDocumentTheme('dark');
  }
}

/**
 * Limpia las clases de tema del documento.
 * Útil cuando se navega fuera del dashboard.
 */
export function clearTheme() {
  if (typeof window !== 'undefined') {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.removeAttribute('data-theme');
  }
}




