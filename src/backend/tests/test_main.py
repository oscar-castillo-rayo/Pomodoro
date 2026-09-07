import pytest
from fastapi.testclient import TestClient

from src.backend.main import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"ok": True}


def test_create_and_list_task(client):
    created = client.post("/tasks", json={"title": "Escribir tests"})
    assert created.status_code == 200
    task = created.json()
    assert task["title"] == "Escribir tests"
    assert task["status"] == "Por hacer"
    assert task["priority"] == "Media"

    listed = client.get("/tasks")
    assert listed.status_code == 200
    assert any(t["id"] == task["id"] for t in listed.json())

    deleted = client.delete(f"/tasks/{task['id']}")
    assert deleted.status_code == 200


def test_delete_missing_task_returns_404(client):
    response = client.delete("/tasks/999999")
    assert response.status_code == 404


def test_get_settings_defaults_when_unset(client):
    response = client.get("/settings")
    assert response.status_code == 200
    assert response.json() == {
        "focus_minutes": 25,
        "short_break_minutes": 5,
        "long_break_minutes": 15,
        "auto_start": False,
    }


def test_update_and_get_settings_persists(client):
    payload = {
        "focus_minutes": 50,
        "short_break_minutes": 10,
        "long_break_minutes": 20,
        "auto_start": True,
    }
    updated = client.put("/settings", json=payload)
    assert updated.status_code == 200
    assert updated.json() == payload

    fetched = client.get("/settings")
    assert fetched.status_code == 200
    assert fetched.json() == payload
