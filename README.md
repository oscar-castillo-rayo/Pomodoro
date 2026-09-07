# Pomodoro

Temporizador Pomodoro con frontend en React (Vite + Tailwind) y backend en FastAPI.
Ver [`PomodoroPlan.md`](./PomodoroPlan.md) para el plan de desarrollo completo.

## Frontend

```bash
npm install
npm run dev
```

Levanta la app en `http://localhost:5173`.

## Backend

```bash
pip install -r requirements.txt
uvicorn src.backend.main:app --reload
```

Levanta la API en `http://localhost:8000`. La base de datos SQLite (`pomodoro.db`) se crea
automáticamente al iniciar.

### Tests

```bash
pytest
```
