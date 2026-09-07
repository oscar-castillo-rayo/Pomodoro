import { useEffect, useRef } from 'react';
import { PLAYLIST, useMusicStore } from './store/musicStore';

// MusicPlayer.jsx - Panel Lofi con audio HTML5, controlado por musicStore.
// El volumen de este reproductor es independiente del volumen de las
// alarmas del temporizador (HU-4.3), por eso vive en su propio store.
export default function MusicPlayer() {
  const trackIndex = useMusicStore((state) => state.trackIndex);
  const isPlaying = useMusicStore((state) => state.isPlaying);
  const volume = useMusicStore((state) => state.volume);
  const toggle = useMusicStore((state) => state.toggle);
  const next = useMusicStore((state) => state.next);
  const previous = useMusicStore((state) => state.previous);
  const setVolume = useMusicStore((state) => state.setVolume);

  const audioRef = useRef(null);
  const track = PLAYLIST[trackIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => {
        // El navegador puede bloquear el autoplay hasta la primera
        // interacción del usuario; el estado queda en "pausado".
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, trackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <section className="mx-auto w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-black/20 backdrop-blur">
      <audio ref={audioRef} src={track.src} loop onEnded={next} />

      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-200">{track.title}</p>
          <p className="truncate text-xs text-slate-500">{track.artist}</p>
        </div>

        <div className="flex items-center gap-2">
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
          value={volume}
          onChange={(event) => setVolume(Number(event.target.value))}
          aria-label="Volumen de la música"
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-[var(--accent)]"
        />
      </div>
    </section>
  );
}
