import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const BUILTIN_TRACKS = [
  { id: 'chill', title: 'Chill Focus', artist: 'Lofi Ambient', src: '/audio/lofi-chill.wav', custom: false },
  { id: 'rain', title: 'Rainy Afternoon', artist: 'Lofi Ambient', src: '/audio/lofi-rain.wav', custom: false },
  { id: 'night', title: 'Night Drive', artist: 'Lofi Ambient', src: '/audio/lofi-night.wav', custom: false },
];

export const useMusicStore = create(
  persist(
    (set, get) => ({
      trackIndex: 0,
      isPlaying: false,
      volume: 0.5,
      // Interruptor maestro, independiente del nivel de volumen: silencia
      // sin perder el valor configurado en `volume`.
      muted: false,
      // Pistas agregadas por el usuario (por URL), persistidas junto con
      // el resto de las preferencias de este store.
      customTracks: [],

      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
      toggleMuted: () => set((state) => ({ muted: !state.muted })),

      next: () => {
        const total = BUILTIN_TRACKS.length + get().customTracks.length;
        set((state) => ({ trackIndex: (state.trackIndex + 1) % total, isPlaying: true }));
      },

      previous: () => {
        const total = BUILTIN_TRACKS.length + get().customTracks.length;
        set((state) => ({ trackIndex: (state.trackIndex - 1 + total) % total, isPlaying: true }));
      },

      selectTrack: (index) => set({ trackIndex: index, isPlaying: true }),

      setVolume: (volume) => set({ volume, muted: false }),

      addTrack: (title, src) =>
        set((state) => ({
          customTracks: [
            ...state.customTracks,
            { id: `custom-${Date.now()}`, title: title || src, artist: 'Pista propia', src, custom: true },
          ],
        })),

      removeTrack: (id) =>
        set((state) => {
          const customTracks = state.customTracks.filter((track) => track.id !== id);
          const total = BUILTIN_TRACKS.length + customTracks.length;
          return {
            customTracks,
            trackIndex: state.trackIndex >= total ? 0 : state.trackIndex,
          };
        }),
    }),
    {
      name: 'pomodoro-music',
      partialize: (state) => ({ volume: state.volume, muted: state.muted, customTracks: state.customTracks }),
    },
  ),
);
