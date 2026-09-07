import { useEffect, useState } from 'react';
import { useSettingsStore } from './store/settingsStore';
import { useTimerStore } from './store/timerStore';

// SettingsView.jsx - Ajuste de duración de los ciclos y auto-inicio (HU-4.1).
// Persiste en el backend vía PUT /settings; el temporizador vuelve a leer
// la duración activa desde settingsStore en cada render.
export default function SettingsView() {
  const focusMinutes = useSettingsStore((state) => state.focus_minutes);
  const shortBreakMinutes = useSettingsStore((state) => state.short_break_minutes);
  const longBreakMinutes = useSettingsStore((state) => state.long_break_minutes);
  const autoStart = useSettingsStore((state) => state.auto_start);
  const saving = useSettingsStore((state) => state.saving);
  const error = useSettingsStore((state) => state.error);
  const save = useSettingsStore((state) => state.save);
  const syncDurationWithSettings = useTimerStore((state) => state.syncDurationWithSettings);

  const [form, setForm] = useState({
    focus_minutes: focusMinutes,
    short_break_minutes: shortBreakMinutes,
    long_break_minutes: longBreakMinutes,
    auto_start: autoStart,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({
      focus_minutes: focusMinutes,
      short_break_minutes: shortBreakMinutes,
      long_break_minutes: longBreakMinutes,
      auto_start: autoStart,
    });
  }, [focusMinutes, shortBreakMinutes, longBreakMinutes, autoStart]);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const ok = await save(form);
    if (ok) {
      syncDurationWithSettings();
      setSaved(true);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 py-8">
        <header>
          <h1 className="text-lg font-semibold text-slate-100">Ajustes del temporizador</h1>
          <p className="text-sm text-slate-500">
            Personaliza la duración de cada ciclo y si quieres que empiecen automáticamente.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-black/20"
        >
          <label className="flex items-center justify-between gap-4 text-sm text-slate-300">
            Concentración (min)
            <input
              type="number"
              min="1"
              value={form.focus_minutes}
              onChange={(event) => updateField('focus_minutes', Number(event.target.value))}
              className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-right text-slate-100"
            />
          </label>
          <label className="flex items-center justify-between gap-4 text-sm text-slate-300">
            Descanso corto (min)
            <input
              type="number"
              min="1"
              value={form.short_break_minutes}
              onChange={(event) => updateField('short_break_minutes', Number(event.target.value))}
              className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-right text-slate-100"
            />
          </label>
          <label className="flex items-center justify-between gap-4 text-sm text-slate-300">
            Descanso largo (min)
            <input
              type="number"
              min="1"
              value={form.long_break_minutes}
              onChange={(event) => updateField('long_break_minutes', Number(event.target.value))}
              className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-right text-slate-100"
            />
          </label>

          <label className="flex items-center justify-between gap-4 text-sm text-slate-300">
            Auto-inicio del siguiente ciclo
            <input
              type="checkbox"
              checked={form.auto_start}
              onChange={(event) => updateField('auto_start', event.target.checked)}
              className="h-4 w-4 accent-rose-400"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-rose-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar preferencias'}
          </button>

          {saved && <p className="text-sm text-emerald-400">Preferencias guardadas.</p>}
          {error && <p className="text-sm text-rose-300">{error}</p>}
        </form>
      </div>
    </main>
  );
}
