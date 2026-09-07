import { useEffect, useRef } from 'react';
import { TIMER_MODES, useTimerStore } from './store/timerStore';
import { useAlarmStore } from './store/alarmStore';

// AlarmManager.jsx - HU-4.3: pide permiso de notificaciones al navegador
// y, cuando un intervalo llega a 00:00, reproduce la alarma y muestra una
// notificación web. No renderiza nada visible (solo el <audio>).
export default function AlarmManager() {
  const completedAt = useTimerStore((state) => state.completedAt);
  const completedMode = useTimerStore((state) => state.completedMode);
  const volume = useAlarmStore((state) => state.volume);
  const audioRef = useRef(null);

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!completedAt) return;

    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch(() => {
        // El navegador puede bloquear el audio hasta la primera
        // interacción del usuario; la notificación se muestra igual.
      });
    }

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      const label = completedMode ? TIMER_MODES[completedMode].label : 'Intervalo';
      new Notification('¡Tiempo terminado!', {
        body: `${label} completado. Es hora de continuar.`,
        tag: 'pomodoro-cycle-end',
      });
    }
    // Solo debe reaccionar a un nuevo ciclo terminado, no a cambios de volumen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedAt]);

  return <audio ref={audioRef} src="/audio/alarm.wav" preload="auto" />;
}
