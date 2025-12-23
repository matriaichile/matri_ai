'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WizardContainer, WizardStep, SelectionGrid, WizardInput, DatePicker, CustomDropdown, BudgetSlider } from '@/components/wizard';
import { useWizardStore, CEREMONY_TYPES, EVENT_STYLES, PLANNING_PROGRESS, COMPLETED_ITEMS, PRIORITY_CATEGORIES, REGIONS } from '@/store/wizardStore';
import { playUiClick, playSuccessSound, playTransitionSound } from '@/utils/sound';
import { registerUser, getAuthErrorMessage } from '@/lib/firebase/auth';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import styles from './page.module.css';

/**
 * Función helper para convertir el valor numérico del presupuesto a una etiqueta legacy.
 * Esto mantiene compatibilidad con el campo budget: string existente.
 */
function getBudgetLabel(amount: number): string {
  if (amount < 5_000_000) return 'under_5m';
  if (amount < 10_000_000) return '5m_10m';
  if (amount < 15_000_000) return '10m_15m';
  if (amount < 20_000_000) return '15m_20m';
  if (amount < 30_000_000) return '20m_30m';
  if (amount < 50_000_000) return '30m_50m';
  return 'over_50m';
}

/**
 * Wizard de registro para usuarios (novios).
 * Flujo paso a paso con animaciones elegantes.
 * Al finalizar, crea la cuenta en Firebase y redirige al dashboard.
 */
export default function UserRegisterPage() {
  const router = useRouter();
  const {
    currentStep,
    totalSteps,
    userData,
    showWelcome,
    setWizardType,
    setShowWelcome,
    nextStep,
    prevStep,
    updateUserData,
    resetWizard,
  } = useWizardStore();

  const { error: authError, setError } = useAuthStore();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  // Inicializar el wizard como tipo usuario
  useEffect(() => {
    setWizardType('user');
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
  const handleSingleSelect = (field: keyof typeof userData, value: string) => {
    playUiClick();
    updateUserData({ [field]: value });
  };

  // Manejar selección múltiple
  const handleMultiSelect = (field: keyof typeof userData, value: string) => {
    playUiClick();
    const currentValues = userData[field] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    updateUserData({ [field]: newValues });
  };

  // Manejar finalización del wizard - CREAR CUENTA EN FIREBASE
  const handleComplete = async () => {
    playSuccessSound();
    setIsTransitioning(true);
    setRegistrationError(null);
    setError(null);
    
    try {
      // Registrar usuario en Firebase Auth y crear perfil en Firestore
      await registerUser(userData);
      
      // Redirigir a la pantalla de carga de matches
      setTimeout(() => {
        router.push('/dashboard/loading-matches');
      }, 1500);
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      setIsTransitioning(false);
      setRegistrationError(getAuthErrorMessage(error));
    }
  };

  // Validaciones por paso (ahora son 9 pasos - se eliminó vinculación)
  const isStep1Valid = userData.coupleNames.trim().length >= 3 && userData.email.includes('@') && userData.password.length >= 6 && userData.phone.length >= 8;
  const isStep2Valid = userData.eventDate.length > 0;
  const isStep3Valid = userData.budgetAmount > 0 && userData.guestCount > 0; // Presupuesto (slider) e invitados (número)
  const isStep4Valid = userData.region.length > 0; // Ubicación separada
  const isStep5Valid = userData.ceremonyTypes.length > 0;
  const isStep6Valid = userData.eventStyle.length > 0;
  const isStep7Valid = userData.planningProgress.length > 0;
  const isStep8Valid = userData.priorityCategories.length > 0;
  const isStep9Valid = true; // Expectativas son opcionales

  const displayError = registrationError || authError;

  return (
    <main className={styles.main}>
      <WizardContainer
        showWelcome={showWelcome}
        welcomeTitle="Bienvenidos"
        welcomeSubtitle="Comencemos a planificar el día más especial de sus vidas. Responde algunas preguntas para encontrar los proveedores perfectos para tu boda."
        onStartWizard={handleStartWizard}
        startButtonText="Comenzar mi boda"
      >
        {/* Paso 1: Información básica con contraseña */}
        <WizardStep
          title="Cuéntanos sobre ustedes"
          subtitle="Información básica para crear su perfil"
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
              label="Nombres de los novios"
              placeholder="Ej: María & Juan"
              value={userData.coupleNames}
              onChange={(e) => updateUserData({ coupleNames: e.target.value })}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              }
            />
            <WizardInput
              label="Correo electrónico"
              type="email"
              placeholder="tu@email.com"
              value={userData.email}
              onChange={(e) => updateUserData({ email: e.target.value })}
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
                value={userData.password}
                onChange={(e) => updateUserData({ password: e.target.value })}
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
              value={userData.phone}
              onChange={(e) => updateUserData({ phone: e.target.value })}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              }
            />
          </div>
        </WizardStep>

        {/* Paso 2: Fecha del evento con DatePicker personalizado */}
        <WizardStep
          title="¿Cuándo es el gran día?"
          subtitle="Fecha tentativa o confirmada de tu matrimonio"
          currentStep={currentStep}
          totalSteps={totalSteps}
          isVisible={currentStep === 1}
          onNext={handleNext}
          onBack={handleBack}
          nextDisabled={!isStep2Valid}
        >
          <div className={styles.dateSection}>
            <DatePicker
              label="Fecha del evento"
              value={userData.eventDate}
              onChange={(date) => updateUserData({ eventDate: date })}
              placeholder="Selecciona la fecha de tu boda"
            />
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={userData.isDateTentative}
                onChange={(e) => updateUserData({ isDateTentative: e.target.checked })}
                className={styles.checkbox}
              />
              <span className={styles.checkboxCustom} />
              <span>La fecha es tentativa</span>
            </label>
          </div>
        </WizardStep>

        {/* Paso 3: Presupuesto e invitados */}
        <WizardStep
          title="Detalles del evento"
          subtitle="Presupuesto aproximado y número de invitados"
          currentStep={currentStep}
          totalSteps={totalSteps}
          isVisible={currentStep === 2}
          onNext={handleNext}
          onBack={handleBack}
          nextDisabled={!isStep3Valid}
        >
          <div className={styles.detailsSection}>
            <div className={styles.fieldSection}>
              <BudgetSlider
                value={userData.budgetAmount}
                onChange={(value) => {
                  // Actualizar budgetAmount y también budget (legacy) para compatibilidad
                  const budgetLabel = getBudgetLabel(value);
                  updateUserData({ budgetAmount: value, budget: budgetLabel });
                }}
              />
            </div>
            
            <div className={styles.fieldSection}>
              <h3 className={styles.fieldTitle}>Número de invitados</h3>
              <div className={styles.guestCountInput}>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  step="10"
                  value={userData.guestCount || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    updateUserData({ guestCount: Math.max(0, Math.min(1000, value)) });
                  }}
                  placeholder="Ej: 150"
                  className={styles.numberInput}
                />
                <span className={styles.guestCountLabel}>personas</span>
              </div>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={userData.isGuestCountApproximate}
                  onChange={(e) => updateUserData({ isGuestCountApproximate: e.target.checked })}
                  className={styles.checkbox}
                />
                <span>Es un número aproximado</span>
              </label>
            </div>
          </div>
        </WizardStep>

        {/* Paso 4: Ubicación del evento */}
        <WizardStep
          title="¿Dónde será tu boda?"
          subtitle="Selecciona la región donde se realizará el evento"
          currentStep={currentStep}
          totalSteps={totalSteps}
          isVisible={currentStep === 3}
          onNext={handleNext}
          onBack={handleBack}
          nextDisabled={!isStep4Valid}
        >
          <div className={styles.locationSection}>
            <CustomDropdown
              options={REGIONS}
              value={userData.region}
              onChange={(value) => updateUserData({ region: value })}
              placeholder="Selecciona una región"
              label="Región del evento"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              }
            />
          </div>
        </WizardStep>

        {/* Paso 5: Tipo de ceremonia */}
        <WizardStep
          title="Tipo de ceremonia"
          subtitle="Puedes seleccionar más de una opción"
          currentStep={currentStep}
          totalSteps={totalSteps}
          isVisible={currentStep === 4}
          onNext={handleNext}
          onBack={handleBack}
          nextDisabled={!isStep5Valid}
        >
          <SelectionGrid
            options={CEREMONY_TYPES}
            selected={userData.ceremonyTypes}
            onSelect={(id) => handleMultiSelect('ceremonyTypes', id)}
            multiple
            columns={3}
            cardSize="large"
          />
        </WizardStep>

        {/* Paso 6: Estilo del evento */}
        <WizardStep
          title="¿Qué estilo define tu boda?"
          subtitle="Selecciona el estilo que más te representa"
          currentStep={currentStep}
          totalSteps={totalSteps}
          isVisible={currentStep === 5}
          onNext={handleNext}
          onBack={handleBack}
          nextDisabled={!isStep6Valid}
        >
          <SelectionGrid
            options={EVENT_STYLES}
            selected={userData.eventStyle}
            onSelect={(id) => handleSingleSelect('eventStyle', id)}
            columns={2}
          />
        </WizardStep>

        {/* Paso 7: Nivel de avance */}
        <WizardStep
          title="¿Cuánto han avanzado?"
          subtitle="Nivel de avance en la planificación"
          currentStep={currentStep}
          totalSteps={totalSteps}
          isVisible={currentStep === 6}
          onNext={handleNext}
          onBack={handleBack}
          nextDisabled={!isStep7Valid}
        >
          <div className={styles.progressSection}>
            <SelectionGrid
              options={PLANNING_PROGRESS}
              selected={userData.planningProgress}
              onSelect={(id) => handleSingleSelect('planningProgress', id)}
              columns={3}
              cardSize="small"
            />

            {userData.planningProgress && userData.planningProgress !== 'nothing' && (
              <div className={styles.completedItemsSection}>
                <h3 className={styles.fieldTitle}>¿Qué ya tienen listo?</h3>
                <SelectionGrid
                  options={COMPLETED_ITEMS}
                  selected={userData.completedItems}
                  onSelect={(id) => handleMultiSelect('completedItems', id)}
                  multiple
                  columns={3}
                  cardSize="small"
                />
              </div>
            )}
          </div>
        </WizardStep>

        {/* Paso 8: Categorías prioritarias */}
        <WizardStep
          title="¿Qué proveedores necesitas?"
          subtitle="Selecciona las categorías que más te interesan"
          currentStep={currentStep}
          totalSteps={totalSteps}
          isVisible={currentStep === 7}
          onNext={handleNext}
          onBack={handleBack}
          nextDisabled={!isStep8Valid}
        >
          <SelectionGrid
            options={PRIORITY_CATEGORIES}
            selected={userData.priorityCategories}
            onSelect={(id) => handleMultiSelect('priorityCategories', id)}
            multiple
            columns={2}
          />
        </WizardStep>

        {/* Paso 9: Expectativas y preferencias (para IA) - Antes era paso 10, se eliminó vinculación */}
        <WizardStep
          title="Cuéntanos tus expectativas"
          subtitle="Opcional - Describe qué buscas para ayudarnos a encontrar proveedores perfectos"
          currentStep={currentStep}
          totalSteps={totalSteps}
          isVisible={currentStep === 8}
          onNext={handleComplete}
          onBack={handleBack}
          nextDisabled={!isStep9Valid}
          nextLabel="Crear mi cuenta"
          showSkip
          onSkip={handleComplete}
        >
          <div className={styles.textareaSection}>
            {/* Mostrar error si existe */}
            {displayError && (
              <div className={styles.errorMessage}>
                <AlertCircle size={20} />
                <span>{displayError}</span>
              </div>
            )}
            
            <div className={styles.expectationsHeader}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.expectationsIcon}>
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
              <p className={styles.expectationsNote}>
                Esta información nos ayuda a usar inteligencia artificial para encontrar los proveedores que mejor se adapten a tu visión.
              </p>
            </div>
            <textarea
              value={userData.expectations}
              onChange={(e) => updateUserData({ expectations: e.target.value })}
              placeholder="Describe tu boda ideal: ¿Qué ambiente quieres crear? ¿Tienes alguna preferencia especial? ¿Hay algo que sea imprescindible para ti? ¿Qué valoras más en un proveedor?"
              className={styles.textarea}
              rows={6}
            />
            <span className={styles.charCount}>
              {userData.expectations.length} caracteres
            </span>
          </div>
        </WizardStep>
      </WizardContainer>

      {/* Overlay de transición final */}
      {isTransitioning && (
        <div className={styles.completionOverlay}>
          <div className={styles.completionContent}>
            <div className={styles.completionIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h2 className={styles.completionTitle}>¡Perfecto!</h2>
            <p className={styles.completionText}>Tu perfil ha sido creado exitosamente</p>
            <p className={styles.completionSubtext}>Buscando proveedores perfectos para ti...</p>
          </div>
        </div>
      )}
    </main>
  );
}
