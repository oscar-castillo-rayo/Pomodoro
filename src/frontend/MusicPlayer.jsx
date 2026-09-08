import { useEffect, useMemo, useRef, useState } from 'react';
import { BUILTIN_TRACKS, useMusicStore } from './store/musicStore';

// MusicPlayer.jsx - Panel Lofi con audio HTML5, controlado por musicStore.
// El volumen de este reproductor es independiente del volumen de las
// alarmas del temporizador (HU-4.3), por eso vive en su propio store.
export default function MusicPlayer() {
  const trackIndex = useMusicStore((state) => state.trackIndex);
  const isPlaying = useMusicStore((state) => state.isPlaying);
  const volume = useMusicStore((state) => state.volume);
  const muted = useMusicStore((state) => state.muted);
  const customTracks = useMusicStore((state) => state.customTracks);
  const tracks = useMemo(() => [...BUILTIN_TRACKS, ...customTracks], [customTracks]);
  const toggle = useMusicStore((state) => state.toggle);
  const toggleMuted = useMusicStore((state) => state.toggleMuted);
  const next = useMusicStore((state) => state.next);
  const previous = useMusicStore((state) => state.previous);
  const selectTrack = useMusicStore((state) => state.selectTrack);
  const setVolume = useMusicStore((state) => state.setVolume);
  const addTrack = useMusicStore((state) => state.addTrack);
  const removeTrack = useMusicStore((state) => state.removeTrack);

  const [showList, setShowList] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const audioRef = useRef(null);
  const track = tracks[trackIndex] ?? tracks[0];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying && !muted) {
      audio.play().catch(() => {
        // El navegador puede bloquear el autoplay hasta la primera
        // interacción del usuario; el estado queda en "pausado".
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, muted, trackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  // Atajos N / P para siguiente / pista anterior (ignorados si se está
  // escribiendo en un input, p. ej. el formulario de agregar pista).
  useEffect(() => {
    function handleKeyDown(event) {
      const tag = event.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (event.key === 'n' || event.key === 'N') next();
      else if (event.key === 'p' || event.key === 'P') previous();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [next, previous]);

  function handleAddTrack(event) {
    event.preventDefault();
    const url = newUrl.trim();
    if (!url) return;
    addTrack(newTitle.trim(), url);
    setNewTitle('');
    setNewUrl('');
  }

  return (
    <section className="mx-auto w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-black/20 backdrop-blur">
      <audio ref={audioRef} src={track.src} loop onEnded={next} />

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setShowList((v) => !v)}
          className="min-w-0 flex-1 text-left"
          aria-expanded={showList}
        >
          <p className="truncate text-sm font-medium text-slate-200">{track.title}</p>
          <p className="truncate text-xs text-slate-500">{track.artist}</p>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMuted}
            aria-label={muted ? 'Activar sonido ambiente' : 'Silenciar sonido ambiente'}
            aria-pressed={!muted}
            className={`grid h-9 w-9 place-items-center rounded-lg transition-colors ${
              muted ? 'text-slate-600 hover:bg-slate-800' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <button
            type="button"
            onClick={previous}
            aria-label="Pista anterior"
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition-colors hover:bg-slate-800"
          >
            ⏮
          </button>
          <button
            type="button"
            onClick={toggle}
            aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
            className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent)] text-slate-950 transition-colors hover:bg-[var(--accent-hover)]"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Siguiente pista"
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition-colors hover:bg-slate-800"
          >
            ⏭
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-slate-500" aria-hidden="true">
          🔉
        </span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={muted ? 0 : volume}
          onChange={(event) => setVolume(Number(event.target.value))}
          aria-label="Volumen de la música"
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-[var(--accent)]"
        />
      </div>

      {showList && (
        <div className="mt-4 border-t border-slate-800 pt-3">
          <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto">
            {tracks.map((item, index) => (
              <li key={item.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => selectTrack(index)}
                  className={`flex-1 truncate rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                    index === trackIndex
                      ? 'bg-slate-800 text-[var(--accent)]'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  {index === trackIndex && isPlaying ? '♪ ' : ''}
                  {item.title}
                </button>
                {item.custom && (
                  <button
                    type="button"
                    onClick={() => removeTrack(item.id)}
                    aria-label={`Quitar ${item.title}`}
                    className="shrink-0 rounded-lg px-2 py-1 text-xs text-slate-600 hover:bg-slate-800 hover:text-rose-300"
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>

          <form onSubmit={handleAddTrack} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="Título (opcional)"
              className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-[var(--accent)] focus:outline-none"
            />
            <input
              type="url"
              value={newUrl}
              onChange={(event) => setNewUrl(event.target.value)}
              placeholder="URL de audio (mp3, wav…)"
              className="flex-[2] rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-[var(--accent)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newUrl.trim()}
              className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-slate-950 transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Agregar
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
