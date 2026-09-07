from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from . import models, database

app = FastAPI(title="Pomodoro API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    database.init_db()


@app.get("/health")
def health():
    return {"ok": True}

class TaskIn(BaseModel):
    title: str
    status: str = "Por hacer"
    priority: str = "Media"

class TaskOut(TaskIn):
    id: int

class SettingsIn(BaseModel):
    focus_minutes: int
    short_break_minutes: int
    long_break_minutes: int
    auto_start: bool = False

@app.post('/tasks', response_model=TaskOut)
def create_task(payload: TaskIn):
    db: Session = database.SessionLocal()
    db_task = models.Task(title=payload.title, status=payload.status, priority=payload.priority)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    db.close()
    return db_task

@app.get('/tasks', response_model=List[TaskOut])
def list_tasks(status: Optional[str] = None):
    db: Session = database.SessionLocal()
    query = db.query(models.Task)
    if status:
        query = query.filter(models.Task.status == status)
    results = query.all()
    db.close()
    return results

@app.delete('/tasks/{task_id}')
def delete_task(task_id: int):
    db: Session = database.SessionLocal()
    task = db.query(models.Task).get(task_id)
    if not task:
        db.close()
        raise HTTPException(status_code=404, detail='Task not found')
    db.delete(task)
    db.commit()
    db.close()
    return {"ok": True}

@app.put('/settings')
def update_settings(s: SettingsIn):
    db: Session = database.SessionLocal()
    settings = db.query(models.Settings).first()
    if not settings:
        settings = models.Settings(
            focus_minutes=s.focus_minutes,
            short_break_minutes=s.short_break_minutes,
            long_break_minutes=s.long_break_minutes,
            auto_start=s.auto_start,
        )
        db.add(settings)
    else:
        settings.focus_minutes = s.focus_minutes
        settings.short_break_minutes = s.short_break_minutes
        settings.long_break_minutes = s.long_break_minutes
        settings.auto_start = s.auto_start
    db.commit()
    db.close()
    return {"ok": True}
