import { create } from 'zustand';
import { fetchSettings, updateSettings } from '../api';

export const DEFAULT_SETTINGS = {
  focus_minutes: 25,
  short_break_minutes: 5,
  long_break_minutes: 15,
  auto_start: false,
};

export const useSettingsStore = create((set, get) => ({
  ...DEFAULT_SETTINGS,
  loaded: false,
  saving: false,
  error: null,

  load: async () => {
    try {
      const settings = await fetchSettings();
      set({ ...settings, loaded: true, error: null });
    } catch {
      // Sin backend disponible: seguimos con los valores por defecto.
      set({ loaded: true });
    }
  },

  save: async (partial) => {
    const next = { ...get(), ...partial };
    set({ saving: true, error: null });
    try {
      const saved = await updateSettings({
        focus_minutes: next.focus_minutes,
        short_break_minutes: next.short_break_minutes,
        long_break_minutes: next.long_break_minutes,
        auto_start: next.auto_start,
      });
      set({ ...saved, saving: false });
      return true;
    } catch {
      set({ saving: false, error: 'No se pudieron guardar las preferencias.' });
      return false;
    }
  },
}));
