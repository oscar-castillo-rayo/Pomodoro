import { useEffect, useRef, useState } from 'react';
import { TIMER_MODES, useTimerStore } from './store/timerStore';
import { useAlarmStore } from './store/alarmStore';

const BANNER_DURATION_MS = 6000;

// AlarmManager.jsx - HU-4.3 + banner in-app: pide permiso de
// notificaciones al navegador y, cuando un intervalo llega a 00:00,
// reproduce la alarma, muestra una notificación web nativa Y un banner
// propio dentro de la app (funciona incluso sin permiso/soporte de
// Notification, y auto-desaparece a los pocos segundos).
export default function AlarmManager() {
  const completedAt = useTimerStore((state) => state.completedAt);
  const completedMode = useTimerStore((state) => state.completedMode);
  const volume = useAlarmStore((state) => state.volume);
  const audioRef = useRef(null);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!completedAt) return undefined;

    const label = completedMode ? TIMER_MODES[completedMode].label : 'Intervalo';

    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch(() => {
        // El navegador puede bloquear el audio hasta la primera
        // interacción del usuario; el resto de los avisos se muestran igual.
      });
    }

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('¡Tiempo terminado!', {
        body: `${label} completado. Es hora de continuar.`,
        tag: 'pomodoro-cycle-end',
      });
    }

    setBanner({ label, key: completedAt });
    const timeoutId = setTimeout(() => setBanner(null), BANNER_DURATION_MS);
    return () => clearTimeout(timeoutId);
    // Solo debe reaccionar a un nuevo ciclo terminado, no a cambios de volumen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedAt]);

  return (
    <>
      <audio ref={audioRef} src="/audio/alarm.wav" preload="auto" />

      {banner && (
        <div
          key={banner.key}
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
        >
          <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-slate-700 bg-slate-900/95 px-4 py-2.5 text-sm text-slate-100 shadow-2xl shadow-black/40 backdrop-blur animate-[fade-in-up_0.25s_ease-out]">
            <span aria-hidden="true">⏰</span>
            <span>
              <strong className="font-semibold">{banner.label}</strong> completado. Es hora de continuar.
            </span>
            <button
              type="button"
              onClick={() => setBanner(null)}
              aria-label="Cerrar aviso"
              className="ml-1 text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
