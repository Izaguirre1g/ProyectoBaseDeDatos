# F1 Database - Sistema de Gestion de Formula 1

Este proyecto integrador corresponde al curso CE-3101 Bases de Datos en modalidad de verano intensivo. El proposito es que el estudiantado aplique de forma practica los contenidos centrales del curso en un sistema realista: modelado conceptual y logico, integridad referencial, consultas, transacciones y la implementacion de reglas de negocio.

## Tecnologias

| Capa | Tecnologia |
|------|------------|
| Frontend | React 18, Vite, Chakra UI v2, Lucide React |
| Backend | Node.js, Express, Argon2id |
| Base de Datos | Microsoft SQL Server |
| Visualizacion | Grafana |

## Requisitos Previos

- **Node.js** v18 o superior
- **npm** v9 o superior
- **Microsoft SQL Server** (local o remoto)
- **Git**

## Estructura del Proyecto

```
ProyectoBaseDeDatos/
├── backend/           # API REST con Express
│   ├── src/
│   │   ├── app.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── frontend/          # SPA con React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── theme.js
│   └── package.json
├── database/          # Scripts SQL
│   ├── schema/
│   ├── seeds/
│   └── stored-procedures/
└── docs/              # Documentacion
    └── diagrams/
```

## Instalacion

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd ProyectoBaseDeDatos
```

### 2. Instalar dependencias del Backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del Frontend

```bash
cd ../frontend
npm install
```

### 4. Configurar variables de entorno

Crear archivo `.env` en la carpeta `backend/`:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de Datos SQL Server
DB_SERVER=localhost
DB_NAME=DB_F1_Garage_Manager
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_PORT=1433

# Sesiones
SESSION_SECRET=tu_clave_secreta_muy_segura
```

## Ejecucion

### Desarrollo

Abrir dos terminales:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
El servidor se ejecutara en `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
La aplicacion se ejecutara en `http://localhost:5173`

### Produccion

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Usuarios de Prueba

| Email | Contrasena | Rol |
|-------|------------|-----|
| admin@f1.com | 123456 | Admin |
| engineer@f1.com | 123456 | Engineer |
| driver@f1.com | 123456 | Driver |

## Roles y Permisos

- **Admin**: Acceso total al sistema, gestion de usuarios y equipos
- **Engineer**: Gestion de partes, configuracion de carros, compras
- **Driver**: Vista de perfil, estadisticas personales

## Seguridad

- Contrasenas hasheadas con **Argon2id** (RFC 9106)
- Sesiones con cookies **HttpOnly** y **SameSite**
- Proteccion CORS configurada
- Ver [SECURITY.md](backend/SECURITY.md) para mas detalles

## Scripts Disponibles

### Backend

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Inicia servidor con nodemon (hot-reload) |
| `npm start` | Inicia servidor en produccion |
| `npm run generate-hashes` | Genera hashes de contrasenas de prueba |

### Frontend

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo Vite |
| `npm run build` | Compila para produccion |
| `npm run preview` | Vista previa del build |
| `npm run lint` | Ejecuta ESLint |

## Configuracion en Red Local (Multiples Computadoras)

Para permitir que otras computadoras en la misma red accedan a la aplicacion, sigue estos pasos:

### Paso 1: Identificar tu direccion IP local

Abre PowerShell y ejecuta:

```powershell
ipconfig
```

Busca "IPv4 Address" bajo tu conexion de red (Ethernet o WiFi). Por ejemplo: `192.168.1.15`

### Paso 2: Iniciar el servidor

Los servidores ya estan configurados para escuchar en todas las interfaces. Solo inicia normalmente:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Deberías ver mensajes como:
```
Servidor F1 Database corriendo en http://0.0.0.0:3000
Acceso desde red: http://192.168.1.15:3000
```

### Paso 3: Configurar Firewall de Windows

El Firewall de Windows puede bloquear las conexiones. Configuralo asi:

#### Opcion A: Permitir automaticamente (Recomendado)

Cuando inicies el servidor por primera vez, Windows mostrara una ventana. Selecciona:
- "Redes privadas"
- Haz clic en "Permitir acceso"

#### Opcion B: Configurar manualmente

1. Abre "Windows Defender Firewall with Advanced Security":
   - Presiona tecla Windows y escribe "firewall"

2. Haz clic en "Inbound Rules" (Reglas de entrada)

3. Haz clic en "New Rule" (Nueva regla)

4. Para el Backend:
   - Tipo de regla: "Port"
   - Protocolo y puerto: "TCP", puerto "3000"
   - Accion: "Allow the connection"
   - Perfil: Marca "Private"
   - Nombre: "F1 Database Backend"
   - Haz clic en "Finish"

5. Repite para el Frontend (puerto "5173"):
   - Nombre: "F1 Database Frontend"

### Paso 4: Acceder desde otra computadora

En otra computadora conectada a la misma red, abre el navegador e ingresa:

```
http://192.168.1.15:5173
```

Reemplaza "192.168.1.15" con tu IP local.

### Troubleshooting

- **No se puede conectar**: Verifica que ambas computadoras esten en la misma red y que el firewall permita los puertos 3000 y 5173
- **Pagina en blanco**: Asegúrate de que el Backend y Frontend estan corriendo
- **Error de autenticacion**: Verifica que la BD este correctamente configurada en el archivo `.env`

## Licencia

MIT
