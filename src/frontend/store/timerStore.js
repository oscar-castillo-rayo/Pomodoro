import { create } from 'zustand';
import { useSettingsStore } from './settingsStore';

export const TIMER_MODES = {
  FOCUS: { id: 'FOCUS', label: 'Concentración', shortLabel: 'Focus', settingsKey: 'focus_minutes' },
  SHORT: { id: 'SHORT', label: 'Descanso corto', shortLabel: 'Descanso corto', settingsKey: 'short_break_minutes' },
  LONG: { id: 'LONG', label: 'Descanso largo', shortLabel: 'Descanso largo', settingsKey: 'long_break_minutes' },
};

// Ciclo simple para el auto-inicio (HU-4.1): tras un foco viene un
// descanso corto, y tras cualquier descanso se vuelve a concentración.
// El descanso largo se elige manualmente desde las pestañas.
const NEXT_MODE = { FOCUS: 'SHORT', SHORT: 'FOCUS', LONG: 'FOCUS' };

function durationFor(mode) {
  const minutes = useSettingsStore.getState()[TIMER_MODES[mode].settingsKey];
  return minutes * 60;
}

export const useTimerStore = create((set, get) => ({
  mode: 'FOCUS',
  secondsLeft: durationFor('FOCUS'),
  isRunning: false,
  // completedAt/completedMode marcan el último ciclo que llegó a 00:00,
  // sin importar si auto-inicio encadenó el siguiente. AlarmManager
  // (HU-4.3) escucha completedAt para disparar el sonido y la
  // notificación exactamente una vez por cada intervalo terminado.
  completedAt: null,
  completedMode: null,

  // Se llama una vez que las preferencias reales terminan de cargar del
  // backend, para que el conteo refleje la duración configurada.
  syncDurationWithSettings: () => {
    const { mode, isRunning } = get();
    if (isRunning) return;
    set({ secondsLeft: durationFor(mode) });
  },

  setMode: (mode) =>
    set({
      mode,
      secondsLeft: durationFor(mode),
      isRunning: false,
    }),

  start: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),
  toggle: () => set((state) => ({ isRunning: !state.isRunning })),

  stop: () =>
    set((state) => ({
      isRunning: false,
      secondsLeft: durationFor(state.mode),
    })),

  tick: () => {
    const { secondsLeft, mode } = get();
    if (secondsLeft > 1) {
      set({ secondsLeft: secondsLeft - 1 });
      return;
    }

    const autoStart = useSettingsStore.getState().auto_start;
    const completedMode = mode;
    const completedAt = Date.now();
    if (autoStart) {
      const nextMode = NEXT_MODE[mode];
      set({ mode: nextMode, secondsLeft: durationFor(nextMode), isRunning: true, completedMode, completedAt });
    } else {
      set({ secondsLeft: 0, isRunning: false, completedMode, completedAt });
    }
  },
}));
