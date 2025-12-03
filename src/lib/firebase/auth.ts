import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from './config';
import { useAuthStore, UserProfileData } from '@/store/authStore';
import { getUserProfile, createUserProfile, createProviderProfile } from './firestore';
import { UserWizardData, ProviderWizardData } from '@/store/wizardStore';

// ============================================
// TIPOS DE ERROR
// ============================================

export interface AuthError {
  code: string;
  message: string;
}

// Mapeo de códigos de error de Firebase a mensajes en español
const errorMessages: Record<string, string> = {
  'auth/email-already-in-use': 'Este correo electrónico ya está registrado',
  'auth/invalid-email': 'El correo electrónico no es válido',
  'auth/operation-not-allowed': 'Operación no permitida',
  'auth/weak-password': 'La contraseña es muy débil',
  'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
  'auth/user-not-found': 'No existe una cuenta con este correo',
  'auth/wrong-password': 'Contraseña incorrecta',
  'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
  'auth/invalid-credential': 'Credenciales inválidas',
};

// Función para obtener mensaje de error legible
export const getAuthErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    return errorMessages[code] || 'Ha ocurrido un error. Intenta de nuevo.';
  }
  return 'Ha ocurrido un error inesperado';
};

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

/**
 * Registrar un nuevo usuario (novios)
 * Crea la cuenta en Firebase Auth y el perfil en Firestore
 */
export const registerUser = async (userData: UserWizardData): Promise<FirebaseUser> => {
  const { setIsLoading, setError, setFirebaseUser, setUserProfile } = useAuthStore.getState();
  
  try {
    setIsLoading(true);
    setError(null);
    
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );
    
    const user = userCredential.user;
    
    // Crear perfil en Firestore
    const profile = await createUserProfile(user.uid, userData);
    
    // Actualizar el store
    setFirebaseUser(user);
    setUserProfile(profile);
    
    return user;
  } catch (error) {
    const message = getAuthErrorMessage(error);
    setError(message);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

/**
 * Registrar un nuevo proveedor
 * Crea la cuenta en Firebase Auth y el perfil en Firestore
 */
export const registerProvider = async (providerData: ProviderWizardData): Promise<FirebaseUser> => {
  const { setIsLoading, setError, setFirebaseUser, setUserProfile } = useAuthStore.getState();
  
  try {
    setIsLoading(true);
    setError(null);
    
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      providerData.email,
      providerData.password
    );
    
    const user = userCredential.user;
    
    // Crear perfil de proveedor en Firestore
    const profile = await createProviderProfile(user.uid, providerData);
    
    // Actualizar el store
    setFirebaseUser(user);
    setUserProfile(profile);
    
    return user;
  } catch (error) {
    const message = getAuthErrorMessage(error);
    setError(message);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

/**
 * Iniciar sesión con email y contraseña
 */
export const loginWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
  const { setIsLoading, setError, setFirebaseUser, setUserProfile } = useAuthStore.getState();
  
  try {
    setIsLoading(true);
    setError(null);
    
    // Iniciar sesión en Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Obtener perfil de Firestore
    const profile = await getUserProfile(user.uid);
    
    // Actualizar el store
    setFirebaseUser(user);
    setUserProfile(profile);
    
    return user;
  } catch (error) {
    const message = getAuthErrorMessage(error);
    setError(message);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

/**
 * Cerrar sesión
 */
export const logout = async (): Promise<void> => {
  const { setIsLoading, setError, clearAuth } = useAuthStore.getState();
  
  try {
    setIsLoading(true);
    setError(null);
    
    await signOut(auth);
    clearAuth();
  } catch (error) {
    const message = getAuthErrorMessage(error);
    setError(message);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

/**
 * Enviar email de recuperación de contraseña
 */
export const resetPassword = async (email: string): Promise<void> => {
  const { setIsLoading, setError } = useAuthStore.getState();
  
  try {
    setIsLoading(true);
    setError(null);
    
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    const message = getAuthErrorMessage(error);
    setError(message);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

/**
 * Inicializar el listener de autenticación
 * Debe llamarse una vez al cargar la aplicación
 */
export const initAuthListener = (): (() => void) => {
  const { setFirebaseUser, setUserProfile, setIsLoading, setIsInitialized } = useAuthStore.getState();
  
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    setIsLoading(true);
    
    if (user) {
      setFirebaseUser(user);
      
      // Obtener perfil de Firestore
      try {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error al obtener perfil:', error);
        setUserProfile(null);
      }
    } else {
      setFirebaseUser(null);
      setUserProfile(null);
    }
    
    setIsLoading(false);
    setIsInitialized(true);
  });
  
  return unsubscribe;
};

