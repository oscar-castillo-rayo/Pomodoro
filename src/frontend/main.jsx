import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// PWA instalable (issue #25): un service worker registrado es uno de los
// requisitos del navegador para ofrecer "Instalar app", junto al manifest
// y los íconos ya declarados en index.html.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // No es crítico: la app sigue funcionando normalmente sin PWA.
    });
  });
}
