import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// focusStore.js - qué tarea está "enfocada" ahora mismo. Se guarda {id,
// title} completos (no solo el id) para que Timer.jsx pueda mostrar el
// título sin depender de la lista de tareas de TasksView.
export const useFocusStore = create(
  persist(
    (set) => ({
      focusedTask: null,
      setFocusedTask: (task) => set({ focusedTask: task }),
      clearFocusedTask: () => set({ focusedTask: null }),
    }),
    { name: 'pomodoro-focus' },
  ),
);
