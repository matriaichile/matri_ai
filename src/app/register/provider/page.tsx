'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WizardContainer, WizardStep, SelectionGrid, WizardInput, CustomDropdown, PriceRangeInput } from '@/components/wizard';
import { useWizardStore, PROVIDER_CATEGORIES, SERVICE_STYLES, REGIONS } from '@/store/wizardStore';
import { playUiClick, playSuccessSound, playTransitionSound } from '@/utils/sound';
import { registerProvider, getAuthErrorMessage } from '@/lib/firebase/auth';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import styles from './page.module.css';

/**
 * Función helper para convertir el rango de precios numérico a una etiqueta legacy.
 * Esto mantiene compatibilidad con el campo priceRange: string existente.
 */
function getPriceRangeLabel(min: number, max: number): string {
  const avg = (min + max) / 2;
  if (avg < 2_000_000) return 'budget';
  if (avg < 5_000_000) return 'mid';
  if (avg < 15_000_000) return 'premium';
  return 'luxury';
}

/**
 * Wizard de registro para proveedores.
 * Flujo paso a paso con animaciones elegantes.
 * Al finalizar, crea la cuenta en Firebase y redirige al dashboard.
 */
export default function ProviderRegisterPage() {
  const router = useRouter();
  const {
    currentStep,
    totalSteps,
    providerData,
    showWelcome,
    setWizardType,
    setShowWelcome,
    nextStep,
    prevStep,
    updateProviderData,
    resetWizard,
  } = useWizardStore();

  const { error: authError, setError } = useAuthStore();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  // Inicializar el wizard como tipo proveedor
  useEffect(() => {
    setWizardType('provider');
    return () => resetWizard();
  }, [setWizardType, resetWizard]);

  // Manejar inicio del wizard
  const handleStartWizard = () => {
    playTransitionSound();
    setShowWelcome(false);
  };

  // Manejar siguiente paso con sonido
  const handleNext = () => {
    playUiClick();
    nextStep();
  };

  // Manejar paso anterior con sonido
  const handleBack = () => {
    playUiClick({ frequency: 440 });
    prevStep();
  };

  // Manejar selección simple
  const handleSingleSelect = (field: keyof typeof providerData, value: string) => {
    playUiClick();
    updateProviderData({ [field]: value });
  };

  // Manejar selección múltiple para categorías
  const handleCategorySelect = (value: string) => {
    playUiClick();
    const currentCategories = providerData.categories;
    const newCategories = currentCategories.includes(value)
      ? currentCategories.filter((v) => v !== value)
      : [...currentCategories, value];
    updateProviderData({ categories: newCategories });
  };

  // Manejar finalización del wizard - CREAR CUENTA EN FIREBASE
  const handleComplete = async () => {
    playSuccessSound();
    setIsTransitioning(true);
    setRegistrationError(null);
    setError(null);
    
    try {
      // Registrar proveedor en Firebase Auth y crear perfil en Firestore
      await registerProvider(providerData);
      
      // Redirigir al dashboard del proveedor
      setTimeout(() => {
        router.push('/dashboard/provider');
      }, 2000);
    } catch (error) {
      console.error('Error al registrar proveedor:', error);
      setIsTransitioning(false);
      setRegistrationError(getAuthErrorMessage(error));
    }
  };

  // Validaciones por paso
  const isStep1Valid = 
    providerData.email.includes('@') && 
    providerData.password.length >= 6 && 
    providerData.providerName.trim().length >= 2 &&
    providerData.phone.length >= 8;
  
  const isStep2Valid = providerData.categories.length > 0; // Ahora múltiples categorías
  // CAMBIO: Eliminado paso de estilos - se pregunta en las encuestas por categoría
  // CAMBIO: Eliminada validación de precios - ahora se pregunta en las encuestas específicas por categoría
  // Solo validamos que haya al menos una región seleccionada
  const isStep3Valid = providerData.workRegions.length > 0;
  const isStep4Valid = providerData.description.trim().length >= 20;
  const isStep5Valid = true; // Redes sociales son opcionales

  const displayError = registrationError || authError;

  return (
    <main className={styles.main}>
      <WizardContainer
        showWelcome={showWelcome}
        welcomeTitle="Únete como Proveedor"
        welcomeSubtitle="Conecta con parejas que buscan exactamente tus servicios. Completa tu perfil y comienza a recibir leads cualificados."
        onStartWizard={handleStartWizard}
        startButtonText="Crear mi perfil"
      >
        {/* Paso 1: Datos básicos */}
        <WizardStep
          title="Datos de tu cuenta"
          subtitle="Información básica para crear tu perfil de proveedor"
          currentStep={currentStep}
          totalSteps={totalSteps}
          isVisible={currentStep === 0}
          onNext={handleNext}
          onBack={handleBack}
          nextDisabled={!isStep1Valid}
          showBack={false}
        >
          <div className={styles.formGrid}>
            <WizardInput
              label="Nombre del proveedor o empresa"
              placeholder="Ej: Fotografía Elegante"
              value={providerData.providerName}
              onChange={(e) => updateProviderData({ providerName: e.target.value })}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
            />
            <WizardInput
              label="Correo electrónico"
              type="email"
              placeholder="tu@email.com"
              value={providerData.email}
              onChange={(e) => updateProviderData({ email: e.target.value })}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              }
            />
            <div className={styles.passwordField}>
              <WizardInput
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={providerData.password}
                onChange={(e) => updateProviderData({ password: e.target.value })}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                }
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
            <WizardInput
              label="Teléfono de contacto"
              type="tel"
              placeholder="+56 9 1234 5678"
              value={providerData.phone}
              onChange={(e) => updateProviderData({ phone: e.target.value })}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              }
            />
          </div>
        </WizardStep>

        {/* Paso 2: Categorías (ahora múltiples) */}
        <WizardStep
          title="¿Qué servicios ofreces?"
          subtitle="Selecciona todas las categorías que apliquen a tu negocio"
          currentStep={currentStep}
          totalSteps={totalSteps}
          isVisible={currentStep === 1}
          onNext={handleNext}
          onBack={handleBack}
          nextDisabled={!isStep2Valid}
        >
          <div className={styles.categoriesSection}>
            <div className={styles.categoriesNote}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>Puedes seleccionar múltiples categorías si ofreces varios servicios</span>
            </div>
            <SelectionGrid
              options={PROVIDER_CATEGORIES}
              selected={providerData.categories}
              onSelect={handleCategorySelect}
              multiple
              columns={3}
            />
            {providerData.categories.length > 0 && (
              <div className={styles.selectedCategories}>
                <span className={styles.selectedLabel}>Seleccionadas:</span>
                <div className={styles.selectedTags}>
                  {providerData.categories.map((catId) => {
                    const category = PROVIDER_CATEGORIES.find((c) => c.id === catId);
                    return category ? (
                      <span key={catId} className={styles.selectedTag}>
                        {category.label}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </WizardStep>

        {/* CAMBIO: Eliminado Paso 3 (Estilo del servicio) - se pregunta en las encuestas por categoría */}

        {/* Paso 3: Ubicación (sin precios - se pregunta en encuestas específicas) */}
        <WizardStep
          title="Ubicación"
          subtitle="Define tu zona de trabajo"
          currentStep={currentStep}
          totalSteps={totalSteps}
          isVisible={currentStep === 2}
          onNext={handleNext}
          onBack={handleBack}
          nextDisabled={!isStep3Valid}
        >
          <div className={styles.detailsSection}>
            {/* ELIMINADO: PriceRangeInput - El rango de precios ahora se pregunta en las encuestas específicas de cada categoría */}

            <div className={styles.fieldSection}>
              <h3 className={styles.fieldTitle}>¿En qué zonas prestas tus servicios?</h3>
              <p className={styles.fieldDescription}>Selecciona todas las regiones donde trabajas</p>
              <SelectionGrid
                options={REGIONS}
                selected={providerData.workRegions}
                onSelect={(value) => {
                  playUiClick();
                  const currentRegions = providerData.workRegions || [];
                  const newRegions = currentRegions.includes(value)
                    ? currentRegions.filter((v) => v !== value)
                    : [...currentRegions, value];
                  // Actualizar ambos campos para compatibilidad
                  updateProviderData({ 
                    workRegions: newRegions,
                    workRegion: newRegions[0] || '' // Mantener legacy con la primera selección
                  });
                }}
                multiple
                columns={2}
              />
            </div>

            {/* 
              Ocultar opción "Acepto trabajos fuera de mi zona" si SOLO se selecciona Banquetería.
              La banquetería típicamente va al lugar del evento, no tiene "zona" propia.
            */}
            {!(providerData.categories.length === 1 && providerData.categories[0] === 'catering') && (
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={providerData.acceptsOutsideZone}
                  onChange={(e) => updateProviderData({ acceptsOutsideZone: e.target.checked })}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxCustom} />
                <span>Acepto trabajos fuera de mi zona</span>
              </label>
            )}
          </div>
        </WizardStep>

        {/* Paso 4: Descripción (antes era paso 5) */}
        <WizardStep
          title="Cuéntanos sobre ti"
          subtitle="Una breve descripción de tu servicio (mínimo 20 caracteres)"
          currentStep={currentStep}
          totalSteps={totalSteps}
          isVisible={currentStep === 3}
          onNext={handleNext}
          onBack={handleBack}
          nextDisabled={!isStep4Valid}
        >
          <div className={styles.textareaSection}>
            <textarea
              value={providerData.description}
              onChange={(e) => updateProviderData({ description: e.target.value })}
              placeholder="Describe tu servicio, experiencia, qué te hace único..."
              className={styles.textarea}
              rows={5}
            />
            <span className={styles.charCount}>
              {providerData.description.length} caracteres
            </span>
          </div>
        </WizardStep>

        {/* Paso 5: Redes sociales y portfolio (antes era paso 6) */}
        <WizardStep
          title="Redes sociales y portfolio"
          subtitle="Opcional - Ayuda a los novios a conocerte mejor"
          currentStep={currentStep}
          totalSteps={totalSteps}
          isVisible={currentStep === 4}
          onNext={handleComplete}
          onBack={handleBack}
          nextDisabled={!isStep5Valid}
          nextLabel="Crear mi cuenta"
          showSkip
          onSkip={handleComplete}
        >
          <div className={styles.formGrid}>
            {/* Mostrar error si existe */}
            {displayError && (
              <div className={styles.errorMessage}>
                <AlertCircle size={20} />
                <span>{displayError}</span>
              </div>
            )}
            
            <WizardInput
              label="Sitio web"
              type="url"
              placeholder="https://tusitio.com"
              value={providerData.website}
              onChange={(e) => updateProviderData({ website: e.target.value })}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              }
            />
            <WizardInput
              label="Instagram"
              placeholder="@tuusuario"
              value={providerData.instagram}
              onChange={(e) => updateProviderData({ instagram: e.target.value })}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              }
            />
            <WizardInput
              label="Facebook"
              placeholder="facebook.com/tupagina"
              value={providerData.facebook}
              onChange={(e) => updateProviderData({ facebook: e.target.value })}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              }
            />
            <WizardInput
              label="TikTok"
              placeholder="@tuusuario"
              value={providerData.tiktok}
              onChange={(e) => updateProviderData({ tiktok: e.target.value })}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              }
            />
          </div>
        </WizardStep>
      </WizardContainer>

      {/* Overlay de transición final */}
      {isTransitioning && (
        <div className={styles.completionOverlay}>
          <div className={styles.completionContent}>
            <div className={styles.completionIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className={styles.completionTitle}>¡Cuenta Creada!</h2>
            <p className={styles.completionText}>Tu perfil está pendiente de aprobación</p>
            <p className={styles.completionSubtext}>Te notificaremos cuando esté activo</p>
          </div>
        </div>
      )}
    </main>
  );
}
