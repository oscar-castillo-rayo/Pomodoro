import { useEffect } from 'react';
import { TIMER_MODES, useTimerStore } from './store/timerStore';

const MODES = Object.values(TIMER_MODES);
const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function ProgressRing({ progress }) {
  const offset = CIRCUMFERENCE * (1 - progress);

  return (
    <svg
      className="h-[min(78vw,360px)] w-[min(78vw,360px)] max-w-full -rotate-90"
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
        className="text-rose-400 transition-[stroke-dashoffset] duration-500"
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
  const progress = (activeMode.duration - secondsLeft) / activeMode.duration;

  useEffect(() => {
    if (!isRunning) return undefined;
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [isRunning, tick]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col">
        <header className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-400/10 text-lg ring-1 ring-rose-400/20">🍅</span>
            <span className="text-sm font-semibold tracking-wide text-slate-200 sm:text-base">Pomodoro Timer</span>
          </div>
          <span className="hidden text-xs text-slate-500 sm:block">Focus one thing at a time.</span>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center py-8 sm:py-12">
          <div className="mb-8 flex w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/70 p-1.5 shadow-2xl shadow-black/20 backdrop-blur sm:mb-10">
            {MODES.map((timerMode) => {
              const isActive = timerMode.id === mode;

              return (
                <button
                  key={timerMode.id}
                  type="button"
                  onClick={() => setMode(timerMode.id)}
                  aria-pressed={isActive}
                  className={`flex-1 rounded-xl px-2 py-2.5 text-xs font-medium transition-all sm:px-4 sm:py-3 sm:text-sm ${
                    isActive
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

          <div className="relative grid place-items-center">
            <ProgressRing progress={progress} />
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
            <button
              type="button"
              onClick={toggle}
              className="rounded-xl bg-rose-400 px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-rose-400/20 transition-colors hover:bg-rose-300 sm:text-base"
            >
              {isRunning ? 'Pausar' : 'Empezar'}
            </button>
            <button
              type="button"
              onClick={stop}
              className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 sm:text-base"
            >
              Detener
            </button>
          </div>

          <p className="mt-8 max-w-md text-center text-sm leading-6 text-slate-500 sm:mt-10">
            {mode === 'FOCUS'
              ? 'Un intervalo de concentración de 25 minutos para avanzar sin distracciones.'
              : mode === 'SHORT'
                ? 'Tómate cinco minutos para despejar la mente y volver con energía.'
                : 'Quince minutos para desconectar, descansar y prepararte para el siguiente ciclo.'}
          </p>
        </section>

        <footer className="py-3 text-center text-xs text-slate-600">
          Selecciona un modo para comenzar tu próximo intervalo.
        </footer>
      </div>
    </main>
  );
}
