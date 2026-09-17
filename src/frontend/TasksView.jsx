import { useEffect, useRef, useState } from 'react';
import { createTask, deleteTask, fetchTasks } from './api';
import { useFocusStore } from './store/focusStore';

const STATUSES = ['Por hacer', 'En curso', 'Hecha'];
const PRIORITIES = ['Alta', 'Media', 'Baja'];
const ALL_STATUSES = 'Todas';
const ALL_PRIORITIES = 'Todas';

const PRIORITY_STYLES = {
  Alta: 'bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/30',
  Media: 'bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/30',
  Baja: 'bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/30',
};

function formatFocusTime(totalSeconds) {
  if (!totalSeconds) return null;
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes < 1) return `${totalSeconds}s de enfoque`;
  const hours = Math.floor(minutes / 60);
  if (hours < 1) return `${minutes}m de enfoque`;
  return `${hours}h ${minutes % 60}m de enfoque`;
}

// TasksView.jsx - Gestión de tareas enfocadas (HU-3.1): crear, listar y
// eliminar tareas contra la API de FastAPI. Sin fecha límite ni etiquetas
// (fuera de alcance según PomodoroPlan.md).
export default function TasksView() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState(STATUSES[0]);
  const [priority, setPriority] = useState(PRIORITIES[1]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES);
  const [priorityFilter, setPriorityFilter] = useState(ALL_PRIORITIES);

  const focusedTask = useFocusStore((state) => state.focusedTask);
  const setFocusedTask = useFocusStore((state) => state.setFocusedTask);
  const clearFocusedTask = useFocusStore((state) => state.clearFocusedTask);

  const importInputRef = useRef(null);
  const [importing, setImporting] = useState(false);

  function loadTasks(status) {
    setLoading(true);
    setError(null);
    fetchTasks(status === ALL_STATUSES ? undefined : status)
      .then(setTasks)
      .catch(() => setError('No se pudieron cargar las tareas. ¿Está corriendo el backend?'))
      .finally(() => setLoading(false));
  }

  // El filtro por estado se resuelve en el backend (GET /tasks?status=...);
  // búsqueda por título y filtro por prioridad se resuelven en el frontend.
  useEffect(() => {
    loadTasks(statusFilter);
  }, [statusFilter]);

  const visibleTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search.trim().toLowerCase());
    const matchesPriority = priorityFilter === ALL_PRIORITIES || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });
  const hasNoTasks = tasks.length === 0;

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setSubmitting(true);
    setError(null);
    try {
      await createTask({ title: trimmedTitle, status, priority });
      setTitle('');
      loadTasks(statusFilter);
    } catch {
      setError('No se pudo crear la tarea.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    const previous = tasks;
    setTasks((current) => current.filter((task) => task.id !== id));
    try {
      await deleteTask(id);
      if (focusedTask?.id === id) clearFocusedTask();
    } catch {
      setTasks(previous);
      setError('No se pudo eliminar la tarea.');
    }
  }

  async function handleExport() {
    setError(null);
    try {
      const all = await fetchTasks();
      const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pomodoro-tareas.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError('No se pudieron exportar las tareas.');
    }
  }

  async function handleImportFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError(null);
    setImporting(true);
    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed)) throw new Error('El archivo debe contener una lista de tareas.');

      for (const item of parsed) {
        const itemTitle = typeof item?.title === 'string' ? item.title.trim() : '';
        if (!itemTitle) continue;
        await createTask({
          title: itemTitle,
          status: STATUSES.includes(item.status) ? item.status : STATUSES[0],
          priority: PRIORITIES.includes(item.priority) ? item.priority : PRIORITIES[1],
        });
      }
      loadTasks(statusFilter);
    } catch {
      setError('No se pudo importar el archivo. Verifica que sea un JSON exportado desde acá.');
    } finally {
      setImporting(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-100">Tareas enfocadas</h1>
            <p className="text-sm text-slate-500">
              Organiza lo que quieres avanzar en tus próximos ciclos de concentración.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 pt-1 text-xs">
            <button
              type="button"
              onClick={handleExport}
              className="rounded-lg px-2 py-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
            >
              Exportar
            </button>
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              disabled={importing}
              className="rounded-lg px-2 py-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 disabled:opacity-50"
            >
              {importing ? 'Importando…' : 'Importar'}
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-black/20 sm:flex-row sm:items-center"
        >
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="¿Qué quieres hacer?"
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-[var(--accent)] focus:outline-none"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"
          >
            {STATUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"
          >
            {PRIORITIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Agregar
          </button>
        </form>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por título…"
            className="flex-1 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-[var(--accent)] focus:outline-none"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filtrar por estado"
            className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-200"
          >
            <option value={ALL_STATUSES}>Todos los estados</option>
            {STATUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            aria-label="Filtrar por prioridad"
            className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-200"
          >
            <option value={ALL_PRIORITIES}>Todas las prioridades</option>
            {PRIORITIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-sm text-rose-300">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-slate-500">Cargando tareas…</p>
        ) : visibleTasks.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-800 px-4 py-10 text-center">
            <span className="text-2xl" aria-hidden="true">
              {hasNoTasks ? '📝' : '🔍'}
            </span>
            <p className="text-sm text-slate-500">
              {hasNoTasks
                ? 'Todavía no tienes tareas. ¡Agrega la primera!'
                : 'Ninguna tarea coincide con la búsqueda o los filtros.'}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {visibleTasks.map((task) => {
              const isFocused = focusedTask?.id === task.id;
              const focusLabel = formatFocusTime(task.focus_seconds);
              return (
                <li
                  key={task.id}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors ${
                    isFocused
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'border-slate-800 bg-slate-900/70'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-100">{task.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                        {task.status}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${PRIORITY_STYLES[task.priority]}`}>
                        {task.priority}
                      </span>
                      {focusLabel && <span className="text-xs text-slate-500">{focusLabel}</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => (isFocused ? clearFocusedTask() : setFocusedTask({ id: task.id, title: task.title }))}
                      className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                        isFocused
                          ? 'text-[var(--accent)] hover:bg-slate-800'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {isFocused ? '● Enfocada' : 'Enfocar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(task.id)}
                      aria-label={`Eliminar tarea ${task.title}`}
                      className="rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-800 hover:text-rose-300"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
