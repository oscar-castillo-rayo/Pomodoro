import React, { useEffect, useState, useRef } from 'react';

// Timer.jsx - Componente simple de temporizador Pomodoro
export default function Timer() {
  const MODES = {
    FOCUS: { label: 'Concentración', seconds: 25 * 60 },
    SHORT: { label: 'Descanso corto', seconds: 5 * 60 },
    LONG: { label: 'Descanso largo', seconds: 15 * 60 },
  };

  const [mode, setMode] = useState('FOCUS');
  const [secondsLeft, setSecondsLeft] = useState(MODES.FOCUS.seconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setSecondsLeft(MODES[mode].seconds);
  }, [mode]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          // TODO: disparar notificación y alarma
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [running]);

  function startPause() {
    setRunning((r) => !r);
  }

  function stop() {
    setRunning(false);
    setSecondsLeft(MODES[mode].seconds);
    clearInterval(intervalRef.current);
  }

  function formatMMSS(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  const total = MODES[mode].seconds;
  const progress = ((total - secondsLeft) / total) * 100;

  return (
    <div className="timer-component">
      <div className="modes">
        {Object.keys(MODES).map((k) => (
          <button key={k} onClick={() => setMode(k)} className={k === mode ? 'active' : ''}>
            {MODES[k].label}
          </button>
        ))}
      </div>

      <div className="clock">
        <svg viewBox="0 0 100 100" className="progress-ring">
          <circle cx="50" cy="50" r="45" stroke="#e5e7eb" strokeWidth="8" fill="none" />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#ef4444"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${Math.PI * 2 * 45}`}
            strokeDashoffset={`${Math.PI * 2 * 45 * (1 - progress / 100)}`}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="time-display">{formatMMSS(secondsLeft)}</div>
      </div>

      <div className="controls">
        <button onClick={startPause}>{running ? 'Pausar' : 'Empezar'}</button>
        <button onClick={stop}>Detener</button>
      </div>
    </div>
  );
}
