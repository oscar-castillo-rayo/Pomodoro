import { create } from 'zustand';
import { useSettingsStore } from './settingsStore';

export const TIMER_MODES = {
  FOCUS: { id: 'FOCUS', label: 'Concentración', shortLabel: 'Focus', settingsKey: 'focus_minutes' },
  SHORT: { id: 'SHORT', label: 'Descanso corto', shortLabel: 'Descanso corto', settingsKey: 'short_break_minutes' },
  LONG: { id: 'LONG', label: 'Descanso largo', shortLabel: 'Descanso largo', settingsKey: 'long_break_minutes' },
};

// Ciclo simple para el auto-inicio: tras un foco viene un descanso corto,
// y tras cualquier descanso se vuelve a concentración. El descanso largo
// se elige manualmente desde las pestañas.
const NEXT_MODE = { FOCUS: 'SHORT', SHORT: 'FOCUS', LONG: 'FOCUS' };

function durationFor(mode) {
  const minutes = useSettingsStore.getState()[TIMER_MODES[mode].settingsKey];
  return minutes * 60;
}

export const useTimerStore = create((set, get) => ({
  mode: 'FOCUS',
  secondsLeft: durationFor('FOCUS'),
  isRunning: false,
  // endsAt: timestamp (ms) al que debería llegar 00:00. Es la fuente de
  // verdad mientras isRunning es true — secondsLeft se deriva de
  // `endsAt - Date.now()` en cada tick en vez de restarse de a uno, así
  // el conteo no se desincroniza si el navegador limita los timers de la
  // pestaña en segundo plano (solo importa el tiempo real transcurrido).
  endsAt: null,
  // completedAt/completedMode marcan el último ciclo que llegó a 00:00,
  // sin importar si auto-inicio encadenó el siguiente. AlarmManager
  // escucha completedAt para disparar el sonido y la notificación
  // exactamente una vez por cada intervalo terminado.
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
      endsAt: null,
    }),

  start: () =>
    set((state) => ({
      isRunning: true,
      endsAt: Date.now() + state.secondsLeft * 1000,
    })),

  pause: () =>
    set((state) => ({
      isRunning: false,
      secondsLeft: state.endsAt ? Math.max(0, Math.round((state.endsAt - Date.now()) / 1000)) : state.secondsLeft,
      endsAt: null,
    })),

  toggle: () => {
    const { isRunning, start, pause } = get();
    if (isRunning) pause();
    else start();
  },

  stop: () =>
    set((state) => ({
      isRunning: false,
      secondsLeft: durationFor(state.mode),
      endsAt: null,
    })),

  // Recalcula secondsLeft a partir de endsAt y maneja el fin de ciclo.
  // Se llama desde un setInterval Y desde el listener de visibilitychange
  // (para refrescar de inmediato al volver a la pestaña).
  tick: () => {
    const { isRunning, endsAt, mode } = get();
    if (!isRunning || !endsAt) return;

    const remaining = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
    if (remaining > 0) {
      set({ secondsLeft: remaining });
      return;
    }

    const autoStart = useSettingsStore.getState().auto_start;
    const completedMode = mode;
    const completedAt = Date.now();
    if (autoStart) {
      const nextMode = NEXT_MODE[mode];
      const nextDuration = durationFor(nextMode);
      set({
        mode: nextMode,
        secondsLeft: nextDuration,
        isRunning: true,
        endsAt: Date.now() + nextDuration * 1000,
        completedMode,
        completedAt,
      });
    } else {
      set({ secondsLeft: 0, isRunning: false, endsAt: null, completedMode, completedAt });
    }
  },
}));
