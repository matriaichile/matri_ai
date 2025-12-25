import { create } from 'zustand';

interface AppState {
  userType: 'user' | 'provider' | null;
  setUserType: (type: 'user' | 'provider' | null) => void;
  // Wizard state placeholders
  wizardStep: number;
  setWizardStep: (step: number) => void;
  resetWizard: () => void;
}

export const useStore = create<AppState>((set) => ({
  userType: null,
  setUserType: (type) => set({ userType: type }),
  wizardStep: 0,
  setWizardStep: (step) => set({ wizardStep: step }),
  resetWizard: () => set({ wizardStep: 0, userType: null }),
}));












