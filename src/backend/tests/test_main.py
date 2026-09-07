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
