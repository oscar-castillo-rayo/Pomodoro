# Plan de Desarrollo: Pomodoro Timer (Arquitectura Frontend/Backend)

Este documento detalla la planificación para desarrollar el temporizador Pomodoro separando las capas de cliente y servidor, garantizando una arquitectura moderna y escalable.

## 1. Arquitectura y Stack Tecnológico

Al separar el proyecto, pasamos de una aplicación de escritorio a una arquitectura web (o empaquetada como web-app).

- **Frontend (Cliente):** React. Ideal para construir la interfaz moderna, manejar el estado complejo del temporizador y crear componentes reutilizables (botones, listas de tareas, reproductor Lofi).
- **Backend (API):** Python usando un framework ligero y rápido como **FastAPI**. Se encargará de la lógica de negocio persistente, endpoints para guardar tareas y configuraciones de usuario.
- **Base de Datos:** `PostgreSQL` para una solución en la nube, o `SQLite` si prefieres mantenerlo local en el backend. Deberia manejar Interfases y servicios para que pueda cambiar de base de datos si es necesario. (empieza con SQLite y usa SQLAlchemy ORM).
- **Notificaciones:** API nativa del navegador (`Notification API`) en lugar de librerías de sistema operativo.
- **Control de Versiones y Despliegue:** GitHub para el código. El frontend puede desplegarse fácilmente en plataformas modernas de hosting (Vercel, Netlify) y el entorno completo puede contenerizarse con Docker.
- **Testing:** Usar pytest para el backend (tests unitarios y de integracion). y cypress para el frontend (tests e2e).

---

## 2. Historias de Usuario con Criterios de Aceptación (Adaptadas a Web)

### Fase 1: Core del Temporizador e Interfaz Base

**HU-1.1 Visualización y Modos del Temporizador**

- **Como** Usuario
- **Quiero** visualizar un temporizador central con tres modos (Concentración, Descanso corto, Descanso largo)
- **Para** saber exactamente cuánto tiempo me queda y cambiar de contexto fácilmente.
- **Criterios de aceptación:**
  - Componentes de React para pestañas: "Concentración", "Descanso corto", "Descanso largo".
  - El tiempo se muestra en formato MM:SS con un anillo de progreso (SVG o CSS animado).
  - Tiempos por defecto gestionados en el estado global: 25 min, 5 min, 15 min.

**HU-1.2 Controles de Reproducción del Temporizador**

- **Como** Usuario
- **Quiero** poder iniciar, pausar y detener el temporizador
- **Criterios de aceptación:**
  - Botones dinámicos que cambian su estado de "Empezar" a "Pausar".
  - Botón secundario "Detener" que limpia el intervalo y reinicia el contador.

### Fase 2: Reproductor de Música y Sonido Ambiente

**HU-2.1 Reproductor Lofi Integrado**

- **Como** Usuario
- **Quiero** un panel para reproducir música de fondo
- **Criterios de aceptación:**
  - Uso de la API de HTML5 Audio en React para manejar las pistas.
  - Controles: Play, Pausa, Siguiente, Anterior.
  - Control de volumen (slider) exclusivo para el reproductor musical (aislado del volumen del sistema de alarmas).

### Fase 3: Gestión de Tareas Enfocadas

**HU-3.1 Creación y Gestión de Tareas (Conexión a API)**

- **Como** Usuario
- **Quiero** agregar tareas, definir su estado y prioridad
- **Criterios de aceptación:**
  - Formulario en React que envía una petición `POST` al backend en Python para guardar la tarea.
  - Estados posibles: "Por hacer", "En curso", "Hecha".
  - Prioridades: "Alta", "Media", "Baja".
  - Las tareas eliminadas envían un `DELETE` a la API.
  - _Exclusión:_ Sin fecha límite ni etiquetas.

**HU-3.2 Búsqueda y Filtrado de Tareas**

- **Como** Usuario
- **Quiero** buscar y filtrar mis tareas
- **Criterios de aceptación:**
  - Los filtros pueden aplicarse en el frontend (sobre el estado de React) o mediante parámetros de consulta (`GET /tasks?status=hecha`) al backend.

### Fase 4: Configuración y Personalización Avanzada

**HU-4.1 Ajuste de Tiempos y Automatización**

- **Como** Usuario
- **Quiero** modificar la duración y el auto-inicio de los ciclos
- **Criterios de aceptación:**
  - Las preferencias del usuario se envían al backend (`PUT /settings`) para persistencia.
  - Lógica de auto-inicio manejada en el ciclo de vida del componente del temporizador (ej. `useEffect`).

**HU-4.2 Personalización de UI**

- **Como** Usuario
- **Quiero** elegir el fondo y los colores
- **Criterios de aceptación:**
  - Fondos e imágenes servidos estáticamente o cargados vía API.
  - Cambio dinámico de variables CSS o Tailwind según la elección del color de acento.

**HU-4.3 Alarmas y Notificaciones Web**

- **Como** Usuario
- **Quiero** sonido de alarma y notificaciones del navegador
- **Criterios de aceptación:**
  - El sistema solicita permiso para usar la `Notification API` del navegador.
  - Al llegar a 00:00 se dispara el audio de alarma y una notificación push web.

---

## 3. Funcionalidades Excluidas (Fuera del Alcance)

- Sistema de rachas.
- Ventana flotante (PiP).
- Fechas límite y etiquetas de tareas.
- Botón de reseteo de contadores.
