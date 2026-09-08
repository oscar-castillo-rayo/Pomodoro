from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Task(Base):
    __tablename__ = 'tasks'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    status = Column(String, default='Por hacer')
    priority = Column(String, default='Media')


class Settings(Base):
    __tablename__ = 'settings'
    id = Column(Integer, primary_key=True, index=True)
    focus_minutes = Column(Integer, default=25)
    short_break_minutes = Column(Integer, default=5)
    long_break_minutes = Column(Integer, default=15)
    auto_start_break = Column(Boolean, default=False)
    auto_start_focus = Column(Boolean, default=False)
