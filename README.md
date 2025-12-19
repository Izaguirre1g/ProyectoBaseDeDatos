# 🏎️ F1 Database - Sistema de Gestión de Fórmula 1

Proyecto integrador para el curso **CE-3101 Bases de Datos** (modalidad verano intensivo).

Sistema para administrar equipos, carros, partes, conductores, patrocinadores y simulaciones de carreras de Fórmula 1.

## 📋 Tecnologías

| Componente | Tecnología |
|------------|------------|
| Base de datos | Microsoft SQL Server |
| Backend (API) | Node.js + Express |
| Frontend | React + Vite |
| Visualización | Grafana |

---

## 🔧 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

### 1. Node.js (v18 o superior)
Descarga e instala desde: https://nodejs.org/

Verifica la instalación:
```bash
node --version   # Debe mostrar v18.x.x o superior
npm --version    # Debe mostrar 9.x.x o superior
```

### 2. Microsoft SQL Server
Opciones:
- **SQL Server Express** (gratis): https://www.microsoft.com/sql-server/sql-server-downloads
- **SQL Server Developer** (gratis para desarrollo)
- **Azure SQL** (en la nube)

### 3. Git (opcional pero recomendado)
Descarga desde: https://git-scm.com/

---

## 🚀 Instalación

### Paso 1: Clonar o descargar el proyecto

```bash
git clone <url-del-repositorio>
cd ProyectoBaseDeDatos
```

### Paso 2: Instalar dependencias del Backend

```bash
cd backend
npm install
```

### Paso 3: Configurar variables de entorno del Backend

Crea un archivo `.env` en la carpeta `backend/` basándote en el ejemplo:

```bash
# En Windows (PowerShell)
Copy-Item .env.example .env

# En Linux/Mac
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de SQL Server:

```env
PORT=3000
NODE_ENV=development

DB_SERVER=localhost
DB_DATABASE=F1Database
DB_USER=sa
DB_PASSWORD=tu_password_aqui
DB_PORT=1433

SESSION_SECRET=una_clave_secreta_larga_y_segura
SESSION_MAX_AGE=3600000

FRONTEND_URL=http://localhost:5173
```

### Paso 4: Instalar dependencias del Frontend

```bash
cd ../frontend
npm install
```

---

## ▶️ Ejecutar el Proyecto

Necesitas **dos terminales** abiertas simultáneamente:

### Terminal 1: Backend (API)

```bash
cd backend
npm run dev
```

Salida esperada:
```
🏎️  Servidor F1 Database corriendo en http://localhost:3000
📊 Ambiente: development
```

### Terminal 2: Frontend (React)

```bash
cd frontend
npm run dev
```

Salida esperada:
```
VITE v7.x.x  ready in 300 ms
➜  Local:   http://localhost:5173/
```

### Acceder a la aplicación

Abre tu navegador en: **http://localhost:5173**

---

## 👤 Usuarios de Prueba (sin base de datos)

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@f1.com | 123456 | Admin |
| engineer@f1.com | 123456 | Engineer |
| driver@f1.com | 123456 | Driver |

---

## 📁 Estructura del Proyecto

```
ProyectoBaseDeDatos/
├── backend/                    # API Node.js + Express
│   ├── src/
│   │   ├── config/            # Configuración de BD y sesiones
│   │   ├── controllers/       # Lógica de endpoints
│   │   ├── middleware/        # Auth, roles, validación
│   │   ├── routes/            # Definición de rutas
│   │   ├── services/          # Llamadas a stored procedures
│   │   └── app.js             # Punto de entrada
│   ├── .env.example           # Plantilla de variables de entorno
│   └── package.json
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── pages/             # Vistas (Login, Dashboard, etc.)
│   │   ├── components/        # Componentes reutilizables
│   │   └── App.jsx
│   └── package.json
├── database/                   # Scripts SQL Server
│   ├── schema/                # DDL: tablas, PKs, FKs
│   ├── stored-procedures/     # Stored procedures
│   └── seeds/                 # Datos iniciales
├── docs/                       # Documentación
│   └── diagrams/              # Diagramas ER, Crow's Foot
└── README.md
```

---

## 🛠️ Comandos Útiles

### Backend
| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor con hot-reload (nodemon) |
| `npm start` | Inicia servidor en modo producción |

### Frontend
| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo Vite |
| `npm run build` | Genera build de producción |
| `npm run preview` | Previsualiza build de producción |

---

## 🔌 Endpoints de la API

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/auth/me` | Verificar sesión activa |

---

## ❓ Solución de Problemas

### Error: "npm no se reconoce como comando"
Asegúrate de que Node.js está instalado y en el PATH del sistema.

### Error: "Ejecución de scripts deshabilitada" (Windows PowerShell)
Ejecuta como administrador:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "CORS" en el navegador
Verifica que el backend esté corriendo en el puerto 3000 y que `FRONTEND_URL` en `.env` sea `http://localhost:5173`.

### Error: "Cannot connect to SQL Server"
1. Verifica que SQL Server esté corriendo
2. Revisa las credenciales en `.env`
3. Asegúrate de que el puerto 1433 esté habilitado

---

## 📅 Entregables

| Fecha | Entregable | Puntos |
|-------|------------|--------|
| 23 dic 2025 | Modelo ER + reglas de negocio | 15 |
| 6 ene 2026 | Crow's Foot + schema SQL + vistas base | 20 |
| 13 ene 2026 | Integración completa + auth + compras + armado | 20 |
| 27 ene 2026 | Sistema completo + simulación + Grafana | 45 |

---

## 👥 Equipo

- [Nombre del estudiante 1]
- [Nombre del estudiante 2]
- [Nombre del estudiante 3]

---

## 📄 Licencia

Este proyecto es para uso académico del curso CE-3101 - TEC Costa Rica.
