'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WizardContainer, WizardStep, SelectionGrid, WizardInput } from '@/components/wizard';
import { useWizardStore, CEREMONY_TYPES, EVENT_STYLES, PLANNING_PROGRESS, COMPLETED_ITEMS, PRIORITY_CATEGORIES, INVOLVEMENT_LEVELS, BUDGET_RANGES, GUEST_COUNTS, REGIONS } from '@/store/wizardStore';
import { playUiClick, playSuccessSound, playTransitionSound } from '@/utils/sound';
import styles from './page.module.css';

/**
 * Wizard de registro para usuarios (novios).
 * Flujo paso a paso con animaciones elegantes.
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
    setCurrentStep,
    nextStep,
    prevStep,
    updateUserData,
    resetWizard,
  } = useWizardStore();

  const [isTransitioning, setIsTransitioning] = useState(false);

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

  // Manejar finalización del wizard
  const handleComplete = async () => {
    playSuccessSound();
    setIsTransitioning(true);
    
    // Aquí se enviaría la data al backend
    console.log('User wizard completed:', userData);
    
    // Simular guardado y redirigir
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  };

  // Validaciones por paso
  const isStep1Valid = userData.coupleNames.trim().length >= 3 && userData.email.includes('@') && userData.phone.length >= 8;
  const isStep2Valid = userData.eventDate.length > 0;
  const isStep3Valid = userData.budget.length > 0 && userData.guestCount.length > 0 && userData.region.length > 0;
  const isStep4Valid = userData.ceremonyTypes.length > 0;
  const isStep5Valid = userData.eventStyle.length > 0;
  const isStep6Valid = userData.planningProgress.length > 0;
  const isStep7Valid = userData.priorityCategories.length > 0;
  const isStep8Valid = userData.involvementLevel.length > 0;

  return (
    <main className={styles.main}>
      <WizardContainer
        showWelcome={showWelcome}
        welcomeTitle="Bienvenidos"
        welcomeSubtitle="Comencemos a planificar el día más especial de sus vidas. Responde algunas preguntas para encontrar los proveedores perfectos para tu boda."
        onStartWizard={handleStartWizard}
        startButtonText="Comenzar mi boda"
      >
        {/* Paso 1: Información básica */}
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

        {/* Paso 2: Fecha del evento */}
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
            <WizardInput
              label="Fecha del evento"
              type="date"
              value={userData.eventDate}
              onChange={(e) => updateUserData({ eventDate: e.target.value })}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              }
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

        {/* Paso 3: Presupuesto, invitados y región */}
        <WizardStep
          title="Detalles del evento"
          subtitle="Presupuesto aproximado, número de invitados y ubicación"
          currentStep={currentStep}
          totalSteps={totalSteps}
          isVisible={currentStep === 2}
          onNext={handleNext}
          onBack={handleBack}
          nextDisabled={!isStep3Valid}
        >
          <div className={styles.detailsSection}>
            <div className={styles.fieldSection}>
              <h3 className={styles.fieldTitle}>Presupuesto aproximado</h3>
              <SelectionGrid
                options={BUDGET_RANGES}
                selected={userData.budget}
                onSelect={(id) => handleSingleSelect('budget', id)}
                columns={2}
                cardSize="small"
              />
            </div>
            
            <div className={styles.fieldSection}>
              <h3 className={styles.fieldTitle}>Número de invitados</h3>
              <SelectionGrid
                options={GUEST_COUNTS}
                selected={userData.guestCount}
                onSelect={(id) => handleSingleSelect('guestCount', id)}
                columns={2}
                cardSize="small"
              />
            </div>

            <div className={styles.fieldSection}>
              <h3 className={styles.fieldTitle}>Región del evento</h3>
              <div className={styles.selectWrapper}>
                <select
                  value={userData.region}
                  onChange={(e) => updateUserData({ region: e.target.value })}
                  className={styles.select}
                >
                  <option value="">Selecciona una región</option>
                  {REGIONS.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </WizardStep>

        {/* Paso 4: Tipo de ceremonia */}
        <WizardStep
          title="Tipo de ceremonia"
          subtitle="Puedes seleccionar más de una opción"
          currentStep={currentStep}
          totalSteps={totalSteps}
          isVisible={currentStep === 3}
          onNext={handleNext}
          onBack={handleBack}
          nextDisabled={!isStep4Valid}
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

        {/* Paso 5: Estilo del evento */}
        <WizardStep
          title="¿Qué estilo define tu boda?"
          subtitle="Selecciona el estilo que más te representa"
          currentStep={currentStep}
          totalSteps={totalSteps}
          isVisible={currentStep === 4}
          onNext={handleNext}
          onBack={handleBack}
          nextDisabled={!isStep5Valid}
        >
          <SelectionGrid
            options={EVENT_STYLES}
            selected={userData.eventStyle}
            onSelect={(id) => handleSingleSelect('eventStyle', id)}
            columns={2}
          />
        </WizardStep>

        {/* Paso 6: Nivel de avance */}
        <WizardStep
          title="¿Cuánto han avanzado?"
          subtitle="Nivel de avance en la planificación"
          currentStep={currentStep}
          totalSteps={totalSteps}
          isVisible={currentStep === 5}
          onNext={handleNext}
          onBack={handleBack}
          nextDisabled={!isStep6Valid}
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

        {/* Paso 7: Categorías prioritarias */}
        <WizardStep
          title="¿Qué proveedores necesitas?"
          subtitle="Selecciona las categorías que más te interesan"
          currentStep={currentStep}
          totalSteps={totalSteps}
          isVisible={currentStep === 6}
          onNext={handleNext}
          onBack={handleBack}
          nextDisabled={!isStep7Valid}
        >
          <SelectionGrid
            options={PRIORITY_CATEGORIES}
            selected={userData.priorityCategories}
            onSelect={(id) => handleMultiSelect('priorityCategories', id)}
            multiple
            columns={2}
          />
        </WizardStep>

        {/* Paso 8: Nivel de vinculación */}
        <WizardStep
          title="¿Qué tan involucrados quieren estar?"
          subtitle="Tu nivel de participación en el proceso"
          currentStep={currentStep}
          totalSteps={totalSteps}
          isVisible={currentStep === 7}
          onNext={handleComplete}
          onBack={handleBack}
          nextDisabled={!isStep8Valid}
          nextLabel="Crear mi cuenta"
        >
          <SelectionGrid
            options={INVOLVEMENT_LEVELS}
            selected={userData.involvementLevel}
            onSelect={(id) => handleSingleSelect('involvementLevel', id)}
            columns={2}
          />
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
          </div>
        </div>
      )}
    </main>
  );
}
