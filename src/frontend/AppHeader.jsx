// AppHeader.jsx - encabezado compartido por las tres vistas (Temporizador,
// Tareas, Ajustes) para que la marca sea consistente al cambiar de pestaña.
export default function AppHeader({ tagline }) {
  return (
    <header className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--accent-soft)] text-lg ring-1 ring-[var(--accent-ring)]">
          🍅
        </span>
        <span className="text-sm font-semibold tracking-wide text-slate-200 sm:text-base">Pomodoro Timer</span>
      </div>
      {tagline && <span className="hidden text-xs text-slate-500 sm:block">{tagline}</span>}
    </header>
  );
}
