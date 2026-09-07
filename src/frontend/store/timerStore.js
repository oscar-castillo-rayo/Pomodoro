import { create } from 'zustand';

export const TIMER_MODES = {
  FOCUS: {
    id: 'FOCUS',
    label: 'Concentración',
    shortLabel: 'Focus',
    duration: 25 * 60,
  },
  SHORT: {
    id: 'SHORT',
    label: 'Descanso corto',
    shortLabel: 'Descanso corto',
    duration: 5 * 60,
  },
  LONG: {
    id: 'LONG',
    label: 'Descanso largo',
    shortLabel: 'Descanso largo',
    duration: 15 * 60,
  },
};

export const useTimerStore = create((set, get) => ({
  mode: 'FOCUS',
  secondsLeft: TIMER_MODES.FOCUS.duration,
  isRunning: false,

  setMode: (mode) =>
    set({
      mode,
      secondsLeft: TIMER_MODES[mode].duration,
      isRunning: false,
    }),

  start: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),
  toggle: () => set((state) => ({ isRunning: !state.isRunning })),

  stop: () =>
    set((state) => ({
      isRunning: false,
      secondsLeft: TIMER_MODES[state.mode].duration,
    })),

  tick: () => {
    const { secondsLeft } = get();
    if (secondsLeft <= 1) {
      set({ secondsLeft: 0, isRunning: false });
      return;
    }
    set({ secondsLeft: secondsLeft - 1 });
  },
}));
