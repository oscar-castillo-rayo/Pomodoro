import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Volumen de la alarma (HU-4.3), completamente independiente del volumen
// del reproductor de música (musicStore) tal como pide HU-2.1.
export const useAlarmStore = create(
  persist(
    (set) => ({
      volume: 0.7,
      setVolume: (volume) => set({ volume }),
    }),
    { name: 'pomodoro-alarm' },
  ),
);
