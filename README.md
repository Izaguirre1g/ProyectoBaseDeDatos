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

## Configuracion de Grafana (Dashboards de Simulaciones)

El proyecto incluye dashboards de Grafana para visualizar estadisticas de simulaciones. Los dashboards estan embebidos en la pagina de Simulaciones del frontend.

### Requisitos

- **Docker Desktop** instalado y corriendo
- Puerto **3001** disponible

### Paso 1: Crear el contenedor de Grafana

Ejecutar el siguiente comando en PowerShell:

```powershell
docker run -d --name grafana -p 3001:3000 `
  -e "GF_SECURITY_ALLOW_EMBEDDING=true" `
  -e "GF_SECURITY_COOKIE_SAMESITE=lax" `
  -e "GF_AUTH_ANONYMOUS_ENABLED=true" `
  -e "GF_AUTH_ANONYMOUS_ORG_ROLE=Viewer" `
  -v grafana-storage:/var/lib/grafana `
  grafana/grafana:latest
```

El contenedor se iniciara automaticamente. Grafana estara disponible en `http://localhost:3001` o `http://192.168.1.15:3001`

### Paso 2: Instalar el plugin de SQL Server

```powershell
docker exec grafana grafana-cli plugins install grafana-mssql-datasource
docker restart grafana
```

Esperar unos segundos a que Grafana reinicie.

### Paso 3: Configurar el Data Source

1. Abrir Grafana en `http://localhost:3001` o `http://192.168.1.15:3001`
2. Credenciales por defecto: `admin` / `admin` 
3. En **Connections** > **Data sources** > **Add data source**
4. Buscar y seleccionar **Microsoft SQL Server**
5. Configurar:
   - **Name**: `SQL Server F1`
   - **Host**: `host.docker.internal:1433` (para conectar desde Docker a SQL Server local)
   - **Database**: `DB_F1_Garage_Manager`
   - **Authentication**: SQL Server Authentication
   - **User**: usuario de SQL Server
   - **Password**: password de SQL Server
6. Click en **Save & Test** - debe mostrar "Database Connection OK"

### Paso 4: Importar los Dashboards

Los dashboards estan en la raiz del proyecto:
- `grafana-dashboard-v2.json` - Dashboard principal de simulaciones
- `grafana-carro-dashboard.json` - Dashboard de analisis por carro

Para importarlos via API (reemplazar la contrasena si se cambio):

```powershell
# Dashboard F1 Simulaciones
$headers = @{
    "Authorization" = "Basic " + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("admin:admin"))
    "Content-Type" = "application/json"
}
$body = Get-Content "grafana-dashboard-v2.json" -Raw
Invoke-RestMethod -Uri "http://localhost:3001/api/dashboards/db" -Method Post -Headers $headers -Body $body

# Dashboard F1 Analisis por Carro
$carroBody = Get-Content "grafana-carro-dashboard.json" -Raw
$carroPayload = @{
    dashboard = $carroBody | ConvertFrom-Json
    overwrite = $true
    folderId = 0
} | ConvertTo-Json -Depth 20
Invoke-RestMethod -Uri "http://localhost:3001/api/dashboards/db" -Method Post -Headers $headers -Body $carroPayload
```

O importalos manualmente:
1. Ve a **Dashboards** > **New** > **Import**
2. Click en "Upload JSON file" y selecciona cada archivo

### Paso 5: Verificar Data Source UID

Los dashboards esperan un Data Source con UID `cfbk8svo6jw8wb`. Si el UID es diferente:

1. Ve a **Connections** > **Data sources** > **SQL Server F1**
2. Copia el UID de la URL (ej: `http://localhost:3001/connections/datasources/edit/TU_UID`)
3. Edita los archivos JSON y reemplaza `cfbk8svo6jw8wb` por tu UID
4. Reimporta los dashboards

### Configuracion para Acceso en Red

Para que otras computadoras vean los dashboards embebidos:

1. **Firewall**: Permite el puerto 3001 (igual que hiciste con 3000 y 5173)

2. **Modificar Frontend**: En `frontend/src/pages/Simulaciones.jsx`, cambia:
   ```javascript
   const GRAFANA_BASE_URL = 'http://localhost:3001';
   ```
   Por tu IP local:
   ```javascript
   const GRAFANA_BASE_URL = 'http://192.168.1.15:3001';
   ```

3. Las otras computadoras podran ver los dashboards embebidos en la pagina de Simulaciones

### Dashboards Disponibles

| Dashboard | URL | Descripcion |
|-----------|-----|-------------|
| F1 Simulaciones | `/d/f1sim/f1-simulaciones` | Ranking, historial por carro, PAM vs Tiempo |
| F1 Analisis por Carro | `/d/f1carro/f1-analisis-por-carro` | Estadisticas detalladas de un carro |

### Comandos Utiles de Docker

```powershell
# Ver estado del contenedor
docker ps -a | Select-String grafana

# Iniciar Grafana
docker start grafana

# Detener Grafana
docker stop grafana

# Ver logs
docker logs grafana

# Eliminar contenedor (los datos se mantienen en el volumen)
docker rm grafana
```

## Licencia

MIT
