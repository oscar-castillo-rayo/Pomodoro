import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Paletas de acento: valores concretos para pintar las variables CSS
// --accent/--accent-hover/--accent-soft/--accent-ring que consumen los
// componentes (botones, anillo de progreso, foco de inputs, etc.).
export const ACCENTS = {
  rose: { label: 'Rosa', base: '#fb7185', hover: '#fda4af', soft: 'rgb(251 113 133 / 0.1)', ring: 'rgb(251 113 133 / 0.25)' },
  sky: { label: 'Cielo', base: '#38bdf8', hover: '#7dd3fc', soft: 'rgb(56 189 248 / 0.1)', ring: 'rgb(56 189 248 / 0.25)' },
  emerald: { label: 'Esmeralda', base: '#34d399', hover: '#6ee7b7', soft: 'rgb(52 211 153 / 0.1)', ring: 'rgb(52 211 153 / 0.25)' },
  violet: { label: 'Violeta', base: '#a78bfa', hover: '#c4b5fd', soft: 'rgb(167 139 250 / 0.1)', ring: 'rgb(167 139 250 / 0.25)' },
  amber: { label: 'Ámbar', base: '#fbbf24', hover: '#fcd34d', soft: 'rgb(251 191 36 / 0.1)', ring: 'rgb(251 191 36 / 0.25)' },
};

// Fondos disponibles para --app-bg. Son valores estáticos (no se piden a
// una API externa); HU-4.2 solo exige que puedan servirse de forma
// estática, lo que cumplen al vivir en el propio bundle del frontend.
export const BACKGROUNDS = {
  midnight: { label: 'Medianoche', value: '#020617' },
  charcoal: { label: 'Carbón', value: '#111827' },
  ink: { label: 'Tinta', value: '#0f0a1f' },
};

export const useThemeStore = create(
  persist(
    (set) => ({
      accent: 'rose',
      // `background` es la clave de un preset de BACKGROUNDS, o el `id`
      // de una entrada en `customBackgrounds` (imagen propia).
      background: 'midnight',
      // Imágenes propias subidas por el usuario, como data URL. Se
      // guardan en localStorage junto con el resto del tema.
      customBackgrounds: [],

      setAccent: (accent) => set({ accent }),
      setBackground: (background) => set({ background }),

      addCustomBackground: (dataUrl) => {
        const id = `custom-${Date.now()}`;
        set((state) => ({
          customBackgrounds: [...state.customBackgrounds, { id, dataUrl }],
          background: id,
        }));
      },

      removeCustomBackground: (id) =>
        set((state) => ({
          customBackgrounds: state.customBackgrounds.filter((bg) => bg.id !== id),
          background: state.background === id ? 'midnight' : state.background,
        })),
    }),
    { name: 'pomodoro-theme' },
  ),
);
