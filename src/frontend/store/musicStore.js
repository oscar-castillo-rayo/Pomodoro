import { create } from 'zustand';

export const PLAYLIST = [
  { id: 'chill', title: 'Chill Focus', artist: 'Lofi Ambient', src: '/audio/lofi-chill.wav' },
  { id: 'rain', title: 'Rainy Afternoon', artist: 'Lofi Ambient', src: '/audio/lofi-rain.wav' },
  { id: 'night', title: 'Night Drive', artist: 'Lofi Ambient', src: '/audio/lofi-night.wav' },
];

export const useMusicStore = create((set) => ({
  trackIndex: 0,
  isPlaying: false,
  volume: 0.5,

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),

  next: () =>
    set((state) => ({
      trackIndex: (state.trackIndex + 1) % PLAYLIST.length,
      isPlaying: true,
    })),

  previous: () =>
    set((state) => ({
      trackIndex: (state.trackIndex - 1 + PLAYLIST.length) % PLAYLIST.length,
      isPlaying: true,
    })),

  setVolume: (volume) => set({ volume }),
}));
