// Utilidad de sonido elegante para feedback de UI usando Web Audio API
// Diseñado para dar una sensación premium y elegante al usuario

let sharedAudioContext: AudioContext | null = null;

function getOrCreateAudioContext(): AudioContext | null {
  // Evitar ejecutar en SSR
  if (typeof window === 'undefined') return null;

  // Compatibilidad con navegadores (webkit)
  const AudioCtx = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext || 
                   (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioContext) {
    try {
      sharedAudioContext = new AudioCtx();
    } catch {
      return null;
    }
  }

  // Reanudar contexto si está suspendido por políticas de autoplay
  if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
    void sharedAudioContext.resume().catch(() => undefined);
  }

  return sharedAudioContext;
}

export type UiClickOptions = {
  frequency?: number; // Frecuencia base del tono (Hz)
  volume?: number; // Volumen pico (0-1)
  durationMs?: number; // Duración total (ms)
  waveform?: OscillatorType; // Forma de onda del oscilador
};

/**
 * Reproduce un clic sutil y elegante para feedback de UI.
 * Diseñado para ser mínimo, elegante y no intrusivo - estilo premium.
 */
export function playUiClick(options?: UiClickOptions): void {
  const ctx = getOrCreateAudioContext();
  if (!ctx) return;

  // Frecuencia dorada - tono cálido y elegante
  const frequency = options?.frequency ?? 660;
  const volume = Math.max(0.0001, Math.min(options?.volume ?? 0.05, 0.5));
  const durationMs = Math.max(40, Math.min(options?.durationMs ?? 100, 300));
  const waveform: OscillatorType = options?.waveform ?? 'sine';

  const now = ctx.currentTime;
  const duration = durationMs / 1000;

  // Cadena de audio — Oscilador → Filtro → Ganancia → Destino
  const oscillator = ctx.createOscillator();
  oscillator.type = waveform;
  oscillator.frequency.setValueAtTime(frequency, now);

  // Sutil segundo armónico para dar elegancia sin estridencia
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(frequency * 1.5, now);
  osc2.detune.setValueAtTime(5, now);

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(400, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  // Envolvente rápida (attack corto, decay exponencial)
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(now);
  osc2.start(now);
  oscillator.stop(now + duration + 0.02);
  osc2.stop(now + duration + 0.02);
}

/**
 * Reproduce un sonido de éxito/completado más elaborado.
 * Para momentos de celebración como completar un paso del wizard.
 */
export function playSuccessSound(): void {
  const ctx = getOrCreateAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Acorde ascendente elegante
  const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 - Acorde mayor
  
  frequencies.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, now);

    const gain = ctx.createGain();
    const startTime = now + (index * 0.08);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.04, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.3);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + 0.35);
  });
}

/**
 * Reproduce un sonido de transición suave entre pasos.
 */
export function playTransitionSound(): void {
  const ctx = getOrCreateAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  const oscillator = ctx.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, now);
  oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.15);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.03, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.25);
}












