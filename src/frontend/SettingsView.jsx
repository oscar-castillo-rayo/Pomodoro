import { useEffect, useState } from 'react';
import { useSettingsStore } from './store/settingsStore';
import { useTimerStore } from './store/timerStore';
import { ACCENTS, BACKGROUNDS, useThemeStore } from './store/themeStore';
import { useAlarmStore } from './store/alarmStore';

// SettingsView.jsx - Ajuste de duración de los ciclos y auto-inicio (HU-4.1)
// y personalización de fondo/color de acento (HU-4.2). Las duraciones
// persisten en el backend vía PUT /settings; el tema se guarda en
// localStorage (themeStore) y se aplica como variables CSS en <html>.
export default function SettingsView() {
  const focusMinutes = useSettingsStore((state) => state.focus_minutes);
  const shortBreakMinutes = useSettingsStore((state) => state.short_break_minutes);
  const longBreakMinutes = useSettingsStore((state) => state.long_break_minutes);
  const autoStart = useSettingsStore((state) => state.auto_start);
  const saving = useSettingsStore((state) => state.saving);
  const error = useSettingsStore((state) => state.error);
  const save = useSettingsStore((state) => state.save);
  const syncDurationWithSettings = useTimerStore((state) => state.syncDurationWithSettings);
  const timerRunning = useTimerStore((state) => state.isRunning);

  const accent = useThemeStore((state) => state.accent);
  const background = useThemeStore((state) => state.background);
  const setAccent = useThemeStore((state) => state.setAccent);
  const setBackground = useThemeStore((state) => state.setBackground);

  const alarmVolume = useAlarmStore((state) => state.volume);
  const setAlarmVolume = useAlarmStore((state) => state.setVolume);
  const notificationsSupported = typeof Notification !== 'undefined';
  const notificationPermission = notificationsSupported ? Notification.permission : 'unsupported';

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
    <main className="flex flex-1 flex-col bg-[var(--app-bg)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Ajustes del temporizador</h1>
          <p className="text-sm text-slate-500">
            Personaliza la duración de cada ciclo y si quieres que empiecen automáticamente.
          </p>
          {timerRunning && (
            <p className="mt-1 text-xs text-amber-400">
              Bloqueado durante la sesión — detén el temporizador para cambiar la duración.
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-black/20"
        >
          <label className="flex items-center justify-between gap-4 text-sm text-slate-300">
            Concentración (min)
            <input
              type="number"
              min="1"
              disabled={timerRunning}
              value={form.focus_minutes}
              onChange={(event) => updateField('focus_minutes', Number(event.target.value))}
              className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-right text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>
          <label className="flex items-center justify-between gap-4 text-sm text-slate-300">
            Descanso corto (min)
            <input
              type="number"
              min="1"
              disabled={timerRunning}
              value={form.short_break_minutes}
              onChange={(event) => updateField('short_break_minutes', Number(event.target.value))}
              className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-right text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>
          <label className="flex items-center justify-between gap-4 text-sm text-slate-300">
            Descanso largo (min)
            <input
              type="number"
              min="1"
              disabled={timerRunning}
              value={form.long_break_minutes}
              onChange={(event) => updateField('long_break_minutes', Number(event.target.value))}
              className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-right text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>

          <label className="flex items-center justify-between gap-4 text-sm text-slate-300">
            Auto-inicio del siguiente ciclo
            <input
              type="checkbox"
              checked={form.auto_start}
              onChange={(event) => updateField('auto_start', event.target.checked)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar preferencias'}
          </button>

          {saved && <p className="text-sm text-emerald-400">Preferencias guardadas.</p>}
          {error && <p className="text-sm text-rose-300">{error}</p>}
        </form>

        <section className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-black/20">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Personalización</h2>
            <p className="text-xs text-slate-500">Elige el color de acento y el fondo de la app.</p>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Color de acento</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ACCENTS).map(([id, palette]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAccent(id)}
                  aria-label={`Acento ${palette.label}`}
                  aria-pressed={accent === id}
                  className={`h-8 w-8 rounded-full transition-transform ${
                    accent === id ? 'ring-2 ring-offset-2 ring-offset-slate-900 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: palette.base, ...(accent === id ? { '--tw-ring-color': palette.base } : {}) }}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Fondo</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(BACKGROUNDS).map(([id, option]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setBackground(id)}
                  aria-label={`Fondo ${option.label}`}
                  aria-pressed={background === id}
                  className={`h-8 w-8 rounded-full border border-slate-700 transition-transform ${
                    background === id ? 'ring-2 ring-offset-2 ring-offset-slate-900 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: option.value, ...(background === id ? { '--tw-ring-color': option.value } : {}) }}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-black/20">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Alarma y notificaciones</h2>
            <p className="text-xs text-slate-500">
              Suena y notifica en el navegador cuando un intervalo llega a 00:00.
            </p>
          </div>

          <label className="flex flex-col gap-2 text-sm text-slate-300">
            <span>Volumen de la alarma</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={alarmVolume}
              onChange={(event) => setAlarmVolume(Number(event.target.value))}
              aria-label="Volumen de la alarma"
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-[var(--accent)]"
            />
          </label>

          <p className="text-xs text-slate-500">
            Notificaciones del navegador:{' '}
            {!notificationsSupported && 'no disponibles en este navegador.'}
            {notificationsSupported && notificationPermission === 'granted' && 'permitidas.'}
            {notificationsSupported && notificationPermission === 'denied' &&
              'bloqueadas (actívalas desde los ajustes del sitio en tu navegador).'}
            {notificationsSupported && notificationPermission === 'default' && (
              <button
                type="button"
                onClick={() => Notification.requestPermission()}
                className="ml-1 underline decoration-dotted hover:text-slate-300"
              >
                pedir permiso
              </button>
            )}
          </p>
        </section>
      </div>
    </main>
  );
}
