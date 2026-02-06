# Restaurant Booking System - Frontend

Interfaz web desarrollada con Vue 3 para un sistema de gestión de reservas de restaurante con autenticación por roles.

## 🚀 Tecnologías

- Vue 3 (Composition API)
- Vite
- Pinia (State Management)
- Vue Router
- PrimeVue v4 (UI Components)
- Tailwind CSS 4
- JavaScript

## 📋 Características

### Gestión y Visualización
- ✅ Dashboard con estadísticas en tiempo real (ADMIN)
- ✅ Dashboard especializado para staff (STAFF)
- ✅ Gestión completa de mesas con DataTable
- ✅ Gestión de usuarios con validaciones (ADMIN)
- ✅ Gestión de reservas con filtros avanzados
- ✅ Vista de "Mis Reservas" para clientes (CUSTOMER)

### Autenticación y Seguridad
- ✅ Sistema de login y registro
- ✅ Autenticación con JWT tokens
- ✅ Guards de navegación por rol
- ✅ Redirección inteligente según rol
- ✅ Sesión persistente (localStorage)
- ✅ Logout con confirmación

### Experiencia de Usuario
- ✅ Formulario público de reservas (wizard de 4 pasos)
- ✅ Validación de disponibilidad en tiempo real
- ✅ Validación de username/email en tiempo real
- ✅ Notificaciones toast para feedback
- ✅ Diálogos de confirmación
- ✅ Diseño responsive y moderno

## 🎨 Vistas

### Públicas
- **Login**: Inicio de sesión con redirección por rol
- **Register**: Registro de nuevos usuarios (CUSTOMER)

### Para ADMIN
- **Dashboard**: Resumen general con métricas y acciones rápidas
- **Mesas**: CRUD completo con DataTable
- **Usuarios**: Gestión completa de usuarios (crear STAFF/ADMIN)
- **Reservas**: Gestión total con filtros avanzados

### Para STAFF
- **Dashboard Staff**: Panel operativo con reservas pendientes y del día
- **Mesas**: Vista de estado de mesas (solo lectura de edición)
- **Reservas**: Gestión con acciones (confirmar, sentar, completar)

### Para CUSTOMER
- **Mis Reservas**: Vista de reservas propias con opción de cancelar
- **Nueva Reserva**: Formulario paso a paso

### Compartidas
- **Nueva Reserva**: Wizard de 4 pasos disponible para todos los roles

## ⚙️ Configuración

### 1. Instalar dependencias:
```bash
npm install
```

### 2. Configurar URL del backend:

En `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8080/api'
```

### 3. Ejecutar en desarrollo:
```bash
npm run dev
```

La aplicación iniciará en `http://localhost:5173`

### 4. Build para producción:
```bash
npm run build
```

## 📁 Estructura del Proyecto
```
src/
├── components/         # Componentes reutilizables
│   └── AppLayout.vue
├── views/             # Vistas principales
│   ├── LoginView.vue
│   ├── RegisterView.vue
│   ├── DashboardView.vue
│   ├── DashboardStaffView.vue
│   ├── MyReservationsView.vue
│   ├── TablesView.vue
│   ├── UsersView.vue
│   ├── ReservationsView.vue
│   └── NewReservationView.vue
├── services/          # Servicios API
│   ├── api.js
│   ├── authService.js
│   ├── tableService.js
│   ├── userService.js
│   └── reservationService.js
├── stores/            # Estado global (Pinia)
│   ├── authStore.js
│   ├── tableStore.js
│   ├── userStore.js
│   └── reservationStore.js
└── router/            # Rutas con guards
    └── index.js
```

## 🔐 Sistema de Autenticación

### Flujo de Login
1. Usuario ingresa credenciales
2. Backend valida y retorna JWT token
3. Token se guarda en localStorage
4. Redirección automática según rol:
   - **ADMIN** → Dashboard general (`/`)
   - **STAFF** → Dashboard staff (`/staff`)
   - **CUSTOMER** → Mis Reservas (`/my-reservations`)

### Guards de Navegación

Las rutas están protegidas con guards que verifican:
- Si el usuario está autenticado
- Si tiene el rol requerido
- Redirige automáticamente si no cumple

### Persistencia de Sesión

El token y datos del usuario se guardan en localStorage:
```javascript
localStorage.setItem('token', token)
localStorage.setItem('user', JSON.stringify(user))
```

La sesión se restaura automáticamente al recargar la página.

## 🎯 Flujo de Estados de Reserva
```
PENDING → CONFIRMED → SEATED → COMPLETED
   ↓
CANCELLED
   ↓
NO_SHOW
```

### Acciones por Rol

**CUSTOMER:**
- Crear reserva → PENDING
- Cancelar → CANCELLED (solo si PENDING o CONFIRMED)

**STAFF:**
- Confirmar → CONFIRMED
- Sentar → SEATED
- Completar → COMPLETED
- Cancelar → CANCELLED
- Marcar no show → NO_SHOW

**ADMIN:**
- Todas las acciones de STAFF
- Eliminar reservas

## 🔌 Conexión con Backend

### Autenticación Automática

Todas las peticiones autenticadas incluyen el token JWT:
```javascript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

### Manejo de Errores

- **401 Unauthorized**: Sesión expirada → Redirige a login
- **403 Forbidden**: Sin permisos → Redirige a dashboard
- **Otros errores**: Toast con mensaje de error

### Servicios API

- **authService**: Login, registro, validaciones
- **tableService**: Gestión de mesas
- **userService**: Gestión de usuarios
- **reservationService**: Gestión de reservas

### Stores (Pinia)

- **authStore**: Estado de autenticación, usuario actual, permisos
- **tableStore**: Listado de mesas, acciones CRUD
- **userStore**: Listado de usuarios, acciones CRUD
- **reservationStore**: Listado de reservas, acciones CRUD, filtros

## 🎨 Características de UI

### Componentes PrimeVue Utilizados

- **DataTable**: Tablas con paginación, ordenamiento y filtros
- **Calendar**: Selector de fechas
- **Dropdown**: Selectores estilizados
- **Dialog**: Modales para crear/editar
- **Toast**: Notificaciones no invasivas
- **ConfirmDialog**: Confirmaciones de acciones
- **Tag**: Etiquetas de estado con colores
- **Badge**: Contadores numéricos

### Diseño Responsive

- Mobile-first con Tailwind CSS
- Breakpoints: `sm`, `md`, `lg`, `xl`
- Navegación adaptativa
- Cards y grids responsivos

## 🚀 Flujos Principales

### Registro e Inicio de Sesión
1. Usuario se registra → Email de bienvenida
2. Inicia sesión → Recibe JWT token
3. Token se guarda → Sesión persistente
4. Navega según su rol

### Crear Reserva (CUSTOMER logueado)
1. Click en "Nueva Reserva"
2. Selecciona fecha, hora, comensales
3. Sistema muestra mesas disponibles
4. Datos se pre-llenan con info del usuario
5. Confirma → Email de confirmación

### Crear Reserva (Usuario no logueado)
1. Accede a "Nueva Reserva"
2. Completa todo el wizard
3. Ingresa sus datos manualmente
4. Sistema crea usuario automáticamente
5. Email de bienvenida + confirmación de reserva

### Confirmar Reserva (STAFF)
1. Ve reserva PENDING en dashboard
2. Click en "Confirmar"
3. Estado cambia a CONFIRMED
4. Cliente recibe email de confirmación

## 👨‍💻 Autor

Johan Piedra
