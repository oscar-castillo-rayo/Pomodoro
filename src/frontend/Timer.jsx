import { useEffect, useRef } from 'react';
import MusicPlayer from './MusicPlayer';
import { TIMER_MODES, useTimerStore } from './store/timerStore';
import { useSettingsStore } from './store/settingsStore';
import { useFocusStore } from './store/focusStore';
import { addFocusTime } from './api';

const MODES = Object.values(TIMER_MODES);
const MODE_IDS = MODES.map((m) => m.id);
const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function ProgressRing({ progress, large }) {
  const offset = CIRCUMFERENCE * (1 - progress);

  return (
    <svg
      className={`max-w-full -rotate-90 transition-[height,width] duration-500 ${
        large ? 'h-[min(90vw,460px)] w-[min(90vw,460px)]' : 'h-[min(78vw,360px)] w-[min(78vw,360px)]'
      }`}
      viewBox="0 0 110 110"
      aria-hidden="true"
    >
      <circle
        cx="55"
        cy="55"
        r={RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="text-slate-800"
      />
      <circle
        cx="55"
        cy="55"
        r={RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        className="text-[var(--accent)] transition-[stroke-dashoffset] duration-500"
      />
    </svg>
  );
}

export default function Timer() {
  const mode = useTimerStore((state) => state.mode);
  const setMode = useTimerStore((state) => state.setMode);
  const secondsLeft = useTimerStore((state) => state.secondsLeft);
  const isRunning = useTimerStore((state) => state.isRunning);
  const toggle = useTimerStore((state) => state.toggle);
  const stop = useTimerStore((state) => state.stop);
  const tick = useTimerStore((state) => state.tick);
  const activeMode = TIMER_MODES[mode];
  const activeMinutes = useSettingsStore((state) => state[activeMode.settingsKey]);
  const activeDuration = activeMinutes * 60;
  const progress = activeDuration > 0 ? (activeDuration - secondsLeft) / activeDuration : 0;
  // "Activo" = corriendo o pausado a mitad de sesión. En ese estado se
  // oculta el botón grande "Empezar" y el anillo crece, para una vista
  // más minimalista una vez que ya empezaste a trabajar.
  const isActive = isRunning || secondsLeft !== activeDuration;

  const focusedTask = useFocusStore((state) => state.focusedTask);
  const clearFocusedTask = useFocusStore((state) => state.clearFocusedTask);

  // Acumula tiempo de concentración en la tarea enfocada mientras el
  // modo activo es FOCUS y el temporizador corre. Se envía al backend en
  // un solo lote al pausar/detener/cambiar de modo (o al desmontar la
  // vista) en vez de en cada tick, para no llamar a la API cada segundo.
  const focusStartRef = useRef(null);
  const trackingFocusId = mode === 'FOCUS' && isRunning ? focusedTask?.id : null;

  useEffect(() => {
    if (trackingFocusId) {
      focusStartRef.current = { id: trackingFocusId, startedAt: Date.now() };
      return undefined;
    }
    const tracked = focusStartRef.current;
    focusStartRef.current = null;
    if (!tracked) return undefined;
    const elapsed = Math.round((Date.now() - tracked.startedAt) / 1000);
    if (elapsed > 0) addFocusTime(tracked.id, elapsed).catch(() => {});
    return undefined;
  }, [trackingFocusId]);

  // Si se cierra/recarga la pestaña a mitad de un ciclo enfocado, intenta
  // avisar al backend igual (best-effort, puede no llegar a completarse).
  useEffect(
    () => () => {
      const tracked = focusStartRef.current;
      if (!tracked) return;
      const elapsed = Math.round((Date.now() - tracked.startedAt) / 1000);
      if (elapsed > 0) addFocusTime(tracked.id, elapsed).catch(() => {});
    },
    [],
  );

  useEffect(() => {
    if (!isRunning) return undefined;
    const intervalId = setInterval(tick, 1000);
    // Al volver a la pestaña (p. ej. tras minimizarla), recalcula de
    // inmediato en vez de esperar al próximo tick del intervalo, que el
    // navegador puede haber limitado mientras estaba en segundo plano.
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isRunning, tick]);

  // Título de la pestaña con la cuenta regresiva en vivo.
  useEffect(() => {
    document.title = isRunning
      ? `${formatTime(secondsLeft)} · ${activeMode.label}`
      : 'Pomodoro Timer';
    return () => {
      document.title = 'Pomodoro Timer';
    };
  }, [isRunning, secondsLeft, activeMode.label]);

  // Atajos de teclado: espacio = Empezar/Pausar, ←/→ = cambiar de modo.
  useEffect(() => {
    function handleKeyDown(event) {
      const target = event.target;
      const isTyping = target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      if (isTyping) return;

      if (event.code === 'Space') {
        event.preventDefault();
        toggle();
      } else if (event.code === 'ArrowRight' || event.code === 'ArrowLeft') {
        event.preventDefault();
        const currentIndex = MODE_IDS.indexOf(mode);
        const delta = event.code === 'ArrowRight' ? 1 : -1;
        const nextIndex = (currentIndex + delta + MODE_IDS.length) % MODE_IDS.length;
        setMode(MODE_IDS[nextIndex]);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle, setMode, mode]);

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      {/* Oscurece levemente el fondo durante Concentración para reducir
          distracción visual; queda listo para cuando el fondo sea una
          imagen (issue de fondos personalizables) y no solo un color. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-black transition-opacity duration-700 ${
          mode === 'FOCUS' ? 'opacity-30' : 'opacity-0'
        }`}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-center py-8 sm:py-12">
          <div className="mb-8 flex w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/70 p-1.5 shadow-2xl shadow-black/20 backdrop-blur sm:mb-10">
            {MODES.map((timerMode) => {
              const isModeActive = timerMode.id === mode;

              return (
                <button
                  key={timerMode.id}
                  type="button"
                  onClick={() => setMode(timerMode.id)}
                  aria-pressed={isModeActive}
                  className={`flex-1 rounded-xl px-2 py-2.5 text-xs font-medium transition-all sm:px-4 sm:py-3 sm:text-sm ${
                    isModeActive
                      ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                      : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
                  }`}
                >
                  <span className="sm:hidden">{timerMode.shortLabel}</span>
                  <span className="hidden sm:inline">{timerMode.label}</span>
                </button>
              );
            })}
          </div>

          {focusedTask && (
            <div className="mb-4 flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs text-slate-300">
              <span aria-hidden="true">🎯</span>
              <span className="max-w-[16rem] truncate">{focusedTask.title}</span>
              <button
                type="button"
                onClick={clearFocusedTask}
                aria-label="Quitar tarea enfocada"
                className="text-slate-500 hover:text-rose-300"
              >
                ✕
              </button>
            </div>
          )}

          <div className="relative grid place-items-center">
            <ProgressRing progress={progress} large={isActive} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
                {activeMode.label}
              </span>
              <time className="font-mono text-6xl font-medium tracking-[-0.06em] text-white sm:text-7xl md:text-8xl" dateTime={`PT${secondsLeft}S`}>
                {formatTime(secondsLeft)}
              </time>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3 sm:mt-10">
            {!isActive && (
              <button
                type="button"
                onClick={toggle}
                className="rounded-xl bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-black/20 transition-colors hover:bg-[var(--accent-hover)] sm:text-base"
              >
                Empezar
              </button>
            )}
            {isActive && (
              <>
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={isRunning ? 'Pausar' : 'Reanudar'}
                  className="grid h-12 w-12 place-items-center rounded-full bg-[var(--accent)] text-lg text-slate-950 shadow-lg shadow-black/20 transition-colors hover:bg-[var(--accent-hover)]"
                >
                  {isRunning ? '⏸' : '▶'}
                </button>
                <button
                  type="button"
                  onClick={stop}
                  aria-label="Detener"
                  className="grid h-12 w-12 place-items-center rounded-full border border-slate-700 text-slate-300 transition-colors hover:bg-slate-800"
                >
                  ⏹
                </button>
              </>
            )}
          </div>

          {!isActive && (
            <p className="mt-8 max-w-md text-center text-sm leading-6 text-slate-500 sm:mt-10">
              {mode === 'FOCUS'
                ? `Un intervalo de concentración de ${activeMinutes} minutos para avanzar sin distracciones.`
                : mode === 'SHORT'
                  ? `Tómate ${activeMinutes} minutos para despejar la mente y volver con energía.`
                  : `${activeMinutes} minutos para desconectar, descansar y prepararte para el siguiente ciclo.`}
            </p>
          )}

          <MusicPlayer />
        </section>

        <footer className="py-3 text-center text-xs text-slate-600">
          {isActive ? 'Espacio: pausar/reanudar · ←/→: cambiar de modo' : 'Selecciona un modo para comenzar tu próximo intervalo.'}
        </footer>
      </div>
    </main>
  );
}
