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

export const useTimerStore = create((set) => ({
  mode: 'FOCUS',
  setMode: (mode) => set({ mode }),
}));
