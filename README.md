# Restaurant Booking System - Frontend

Interfaz web desarrollada con Vue 3 para un sistema de gestión de reservas de restaurante.

## 🚀 Tecnologías

- Vue 3 (Composition API)
- Vite
- Pinia (State Management)
- Vue Router
- PrimeVue (UI Components)
- Tailwind CSS 4
- JavaScript

## 📋 Características

- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión completa de mesas con DataTable
- ✅ Gestión de usuarios con validaciones
- ✅ Gestión de reservas con filtros avanzados
- ✅ Formulario público de reservas (wizard de 4 pasos)
- ✅ Validación de disponibilidad en tiempo real
- ✅ Notificaciones toast
- ✅ Diálogos de confirmación
- ✅ Diseño responsive

## 🎨 Vistas

1. **Dashboard**: Resumen general con métricas y acciones rápidas
2. **Mesas**: CRUD completo con tabla editable
3. **Usuarios**: Gestión de usuarios del sistema
4. **Reservas**: Gestión con filtros por fecha y estado
5. **Nueva Reserva**: Formulario paso a paso para clientes

## ⚙️ Configuración

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar URL del backend:**

En `src/services/api.js`, verifica:
```javascript
const API_BASE_URL = 'http://localhost:8081/api'
```

3. **Ejecutar en desarrollo:**
```bash
npm run dev
```

La aplicación iniciará en `http://localhost:5173`

4. **Build para producción:**
```bash
npm run build
```

## 📁 Estructura del Proyecto
```
src/
├── components/      # Componentes reutilizables
│   └── AppLayout.vue
├── views/          # Vistas principales
│   ├── DashboardView.vue
│   ├── TablesView.vue
│   ├── UsersView.vue
│   ├── ReservationsView.vue
│   └── NewReservationView.vue
├── services/       # Servicios API
│   ├── api.js
│   ├── tableService.js
│   ├── userService.js
│   └── reservationService.js
├── stores/         # Estado global (Pinia)
│   ├── tableStore.js
│   ├── userStore.js
│   └── reservationStore.js
└── router/         # Rutas
    └── index.js
```

## 🎯 Flujo de Estados de Reserva
```
PENDING → CONFIRMED → SEATED → COMPLETED
   ↓
CANCELLED
   ↓
NO_SHOW
```

## 🔌 Conexión con Backend

El frontend se comunica con el backend mediante fetch API:
- Todas las peticiones pasan por `services/api.js`
- Los stores (Pinia) manejan el estado global
- Las vistas consumen los stores

## 👨‍💻 Autor

[JOHAN PIEDRA]
