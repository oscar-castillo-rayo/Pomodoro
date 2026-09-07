import { useState } from 'react';
import Timer from './Timer';
import TasksView from './TasksView';

const VIEWS = [
  { id: 'timer', label: 'Temporizador' },
  { id: 'tasks', label: 'Tareas' },
];

export default function App() {
  const [view, setView] = useState('timer');

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="mx-auto flex w-full max-w-2xl justify-center gap-2 pt-4">
        {VIEWS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setView(item.id)}
            aria-pressed={view === item.id}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              view === item.id
                ? 'bg-slate-800 text-white'
                : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {view === 'timer' ? <Timer /> : <TasksView />}
    </div>
  );
}
