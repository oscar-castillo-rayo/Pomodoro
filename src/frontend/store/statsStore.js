import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function todayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

// statsStore.js - Resumen del día (issue #24): NO es un contador de
// rachas (eso está descartado explícitamente) — solo cuenta los
// pomodoros y el tiempo de concentración de HOY, y se reinicia solo al
// cambiar de fecha.
export const useStatsStore = create(
  persist(
    (set, get) => ({
      date: todayKey(),
      pomodorosCompleted: 0,
      focusSeconds: 0,

      recordFocusSession: (seconds) => {
        const today = todayKey();
        const state = get();
        if (state.date !== today) {
          set({ date: today, pomodorosCompleted: 1, focusSeconds: seconds });
        } else {
          set({ pomodorosCompleted: state.pomodorosCompleted + 1, focusSeconds: state.focusSeconds + seconds });
        }
      },
    }),
    { name: 'pomodoro-stats' },
  ),
);
