# 📊 Guía de Integración Grafana para F1 Garage Manager

## 🎯 Objetivo
Visualizar simulaciones de carreras F1 con paneles interactivos que permitan:
- Ver ranking por simulación y circuito
- Comparar el mismo carro en distintas simulaciones (setup vs tiempo)
- Correlacionar Tiempo con P, A, M

---

## 📋 Requisitos Previos

1. **Grafana instalado** (versión 9.x o superior)
   - Opción A: Docker: `docker run -d -p 3001:3000 --name=grafana grafana/grafana-oss`
   - Opción B: Instalación local: https://grafana.com/grafana/download

2. **Plugin de SQL Server para Grafana**
   - Ya viene incluido en Grafana 9+

3. **Vistas de BD creadas**
   - Ejecutar: `database/views/VW_Grafana_Simulaciones.sql`

---

## 🔧 Paso 1: Crear las Vistas en SQL Server

```powershell
# Desde PowerShell, ejecutar el script SQL
sqlcmd -S localhost -d DB_F1_Garage_Manager -E -i "database/views/VW_Grafana_Simulaciones.sql"
```

Esto crea 4 vistas:
| Vista | Propósito |
|-------|-----------|
| `VW_Grafana_Simulaciones` | Vista completa con todos los datos |
| `VW_Grafana_Ranking` | Ranking simplificado por simulación |
| `VW_Grafana_Carro_Comparacion` | Comparar setup del mismo carro |
| `VW_Grafana_PAM_Tiempo` | Correlación P, A, M vs Tiempo |

---

## 🔧 Paso 2: Configurar Grafana

### 2.1 Iniciar Grafana

```powershell
# Con Docker
docker run -d -p 3001:3000 --name=grafana grafana/grafana-oss

# O si está instalado localmente, iniciar el servicio
```

Acceder a: http://localhost:3001 (usuario: admin, contraseña: admin)

### 2.2 Agregar Data Source de SQL Server

1. Ir a **Configuration → Data Sources → Add data source**
2. Seleccionar **Microsoft SQL Server**
3. Configurar:
   ```
   Host: localhost
   Database: DB_F1_Garage_Manager
   Authentication: Windows Integrated Security
   ```
   O si usas usuario SQL:
   ```
   Host: localhost
   Database: DB_F1_Garage_Manager
   User: tu_usuario
   Password: tu_password
   ```
4. Click **Save & Test**

---

## 🔧 Paso 3: Crear Dashboard y Paneles

### 3.1 Crear Dashboard
1. Click **+** → **Dashboard**
2. Click **Add a new panel**

### 3.2 Panel 1: Ranking por Simulación y Circuito

**Tipo:** Table

**Query (SQL):**
```sql
SELECT 
    Posicion,
    Equipo_Nombre AS Equipo,
    Conductor_Nombre AS Conductor,
    FORMAT(Tiempo_segundos, 'N3') AS Tiempo,
    FORMAT(Diferencia_Con_Primero, 'N3') AS Diferencia,
    Puntos_F1 AS Puntos,
    Carro_Potencia AS P,
    Carro_Aerodinamica AS A,
    Carro_Manejo AS M
FROM VW_Grafana_Ranking
WHERE Id_simulacion = $simulacion
  AND ($circuito = 'Todos' OR Circuito_Nombre = $circuito)
ORDER BY Posicion
```

**Variables a crear:**
- `$simulacion`: Query `SELECT DISTINCT Id_simulacion FROM VW_Grafana_Ranking ORDER BY Id_simulacion DESC`
- `$circuito`: Query `SELECT 'Todos' UNION SELECT DISTINCT Circuito_Nombre FROM VW_Grafana_Ranking`

### 3.3 Panel 2: Comparación de Setup vs Tiempo (mismo carro)

**Tipo:** Time series o Bar chart

**Query (SQL):**
```sql
SELECT 
    Fecha_hora AS time,
    Tiempo_segundos,
    CONCAT(PowerUnit_Nombre, ' + ', Aerodinamico_Nombre) AS Setup,
    Circuito_Nombre,
    Carro_Total_PAM
FROM VW_Grafana_Carro_Comparacion
WHERE Id_carro = $carro
ORDER BY Fecha_hora
```

**Variable a crear:**
- `$carro`: Query `SELECT DISTINCT Id_carro FROM VW_Grafana_Carro_Comparacion`

### 3.4 Panel 3: P, A, M vs Tiempo (Scatter plot)

**Tipo:** XY Chart / Scatter

**Query para Potencia vs Tiempo:**
```sql
SELECT 
    P AS x,
    Tiempo_segundos AS y,
    Equipo_Nombre AS label
FROM VW_Grafana_PAM_Tiempo
WHERE Id_simulacion = $simulacion
```

**Query para Total PAM vs Tiempo:**
```sql
SELECT 
    Total_PAM AS "Total P+A+M",
    Tiempo_segundos,
    Equipo_Nombre,
    Conductor_Nombre
FROM VW_Grafana_PAM_Tiempo
WHERE ($circuito = 'Todos' OR Circuito_Nombre = $circuito)
ORDER BY Total_PAM
```

---

## 🔧 Paso 4: Configurar Embedding (para iframe)

### 4.1 Habilitar embedding anónimo

Editar `grafana.ini` o `custom.ini`:

```ini
[auth.anonymous]
enabled = true
org_name = Main Org.
org_role = Viewer

[security]
allow_embedding = true

[server]
# Si usas diferente puerto
http_port = 3001
```

Reiniciar Grafana después de cambiar configuración.

### 4.2 Obtener URL del Dashboard para embed

1. Abrir el dashboard en Grafana
2. Click en **Share** (icono de compartir)
3. Tab **Embed**
4. Copiar el código iframe o URL

Ejemplo de URL:
```
http://localhost:3001/d/f1-simulaciones/simulaciones?orgId=1&kiosk
```

El parámetro `&kiosk` oculta menús para mejor embedding.

---

## 🔧 Paso 5: Integrar en Frontend React

### Opción A: Embeber con iframe (recomendado)

Crear componente `GrafanaDashboard.jsx`:

```jsx
import { Box, Card, CardBody, Heading, Select, HStack } from '@chakra-ui/react';
import { useState } from 'react';

const GRAFANA_BASE_URL = 'http://localhost:3001';

// URLs de los paneles (obtener de Grafana → Share → Embed)
const PANELS = {
    ranking: '/d-solo/f1-sim/ranking?panelId=1',
    comparacion: '/d-solo/f1-sim/comparacion?panelId=2',
    pamTiempo: '/d-solo/f1-sim/pam-tiempo?panelId=3',
    dashboard: '/d/f1-sim/simulaciones?kiosk'
};

function GrafanaDashboard() {
    const [activePanel, setActivePanel] = useState('dashboard');

    return (
        <Card bg="brand.800" borderColor="brand.700">
            <CardBody>
                <HStack justify="space-between" mb={4}>
                    <Heading size="md" color="white">
                        📊 Análisis de Simulaciones
                    </Heading>
                    <Select 
                        w="250px" 
                        value={activePanel}
                        onChange={(e) => setActivePanel(e.target.value)}
                        bg="brand.700"
                    >
                        <option value="dashboard">Dashboard Completo</option>
                        <option value="ranking">Ranking por Simulación</option>
                        <option value="comparacion">Comparación de Setup</option>
                        <option value="pamTiempo">P,A,M vs Tiempo</option>
                    </Select>
                </HStack>
                
                <Box 
                    as="iframe"
                    src={`${GRAFANA_BASE_URL}${PANELS[activePanel]}&theme=dark`}
                    width="100%"
                    height="600px"
                    frameBorder="0"
                    borderRadius="md"
                />
            </CardBody>
        </Card>
    );
}

export default GrafanaDashboard;
```

### Opción B: Links directos a Grafana

```jsx
import { Button, HStack, Icon } from '@chakra-ui/react';
import { ExternalLink } from 'lucide-react';

const GRAFANA_LINKS = {
    ranking: 'http://localhost:3001/d/f1-sim/ranking',
    comparacion: 'http://localhost:3001/d/f1-sim/comparacion',
    pamTiempo: 'http://localhost:3001/d/f1-sim/pam-tiempo'
};

function GrafanaLinks() {
    return (
        <HStack spacing={4}>
            <Button 
                as="a" 
                href={GRAFANA_LINKS.ranking} 
                target="_blank"
                leftIcon={<Icon as={ExternalLink} />}
                colorScheme="blue"
            >
                Ver Ranking
            </Button>
            <Button 
                as="a" 
                href={GRAFANA_LINKS.comparacion} 
                target="_blank"
                leftIcon={<Icon as={ExternalLink} />}
                colorScheme="green"
            >
                Comparar Setups
            </Button>
            <Button 
                as="a" 
                href={GRAFANA_LINKS.pamTiempo} 
                target="_blank"
                leftIcon={<Icon as={ExternalLink} />}
                colorScheme="purple"
            >
                P,A,M vs Tiempo
            </Button>
        </HStack>
    );
}
```

---

## 📊 Resumen de Paneles Requeridos

| # | Panel | Vista SQL | Tipo Grafana |
|---|-------|-----------|--------------|
| 1 | Ranking por simulación/circuito | `VW_Grafana_Ranking` | Table |
| 2 | Comparación setup vs tiempo | `VW_Grafana_Carro_Comparacion` | Time Series |
| 3 | P, A, M vs Tiempo | `VW_Grafana_PAM_Tiempo` | XY Chart/Scatter |

---

## 🚀 Orden de Implementación Recomendado

1. ✅ **Crear vistas SQL** (ya hecho - `VW_Grafana_Simulaciones.sql`)
2. ⬜ **Instalar/Iniciar Grafana** 
3. ⬜ **Configurar Data Source SQL Server**
4. ⬜ **Crear Dashboard con 3 paneles**
5. ⬜ **Habilitar embedding**
6. ⬜ **Crear componente React**
7. ⬜ **Agregar a vista Admin**

---

## 🔍 Verificar datos antes de Grafana

```sql
-- Verificar que hay datos en las vistas
SELECT TOP 10 * FROM VW_Grafana_Simulaciones ORDER BY Fecha_hora DESC;
SELECT COUNT(*) AS TotalResultados FROM VW_Grafana_Ranking;
```

Si no hay datos, ejecutar una simulación primero desde la aplicación.
