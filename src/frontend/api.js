// api.js - Cliente mínimo para el backend FastAPI de tareas y configuración.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

async function request(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export function fetchTasks(status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return request(`/tasks${query}`);
}

export function createTask(payload) {
  return request('/tasks', { method: 'POST', body: JSON.stringify(payload) });
}

export function deleteTask(id) {
  return request(`/tasks/${id}`, { method: 'DELETE' });
}

export function updateTask(id, payload) {
  return request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function addFocusTime(id, seconds) {
  return request(`/tasks/${id}/focus`, { method: 'POST', body: JSON.stringify({ seconds }) });
}

export function fetchSettings() {
  return request('/settings');
}

export function updateSettings(payload) {
  return request('/settings', { method: 'PUT', body: JSON.stringify(payload) });
}
