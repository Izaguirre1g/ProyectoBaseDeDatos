# 🚀 Configuración de Grafana - Paso a Paso

## ✅ Estado Actual
- Grafana está corriendo en **http://localhost:3000**
- Usuario: `admin`
- Contraseña: `admin`
- Vistas SQL creadas con 3,129 registros

---

## 📋 Paso 1: Acceder a Grafana

1. Abre tu navegador
2. Ve a **http://localhost:3000**
3. Login con:
   - Usuario: `admin`
   - Contraseña: `admin`
4. Cambia la contraseña si lo deseas

---

## 🔌 Paso 2: Agregar Data Source (SQL Server)

### 2.1 Navegar a Data Sources
1. Click en el icono de **configuración** (⚙️) en el sidebar izquierdo
2. Click en **Data Sources**
3. Click en **Add data source**

### 2.2 Seleccionar SQL Server
1. Busca **"Microsoft SQL Server"**
2. Click en **Select**

### 2.3 Configurar Conexión

**Importante:** SQL Server está en `host.docker.internal` desde el contenedor.

Rellena los campos:

```
Name: SQL Server F1
Host: host.docker.internal:1433
Database: DB_F1_Garage_Manager
User: sa
Password: [TU_PASSWORD_SQL]
SQL Server Authentication: checked
Encrypt: Optional
```

**O si usas Windows Authentication:**
```
Name: SQL Server F1
Host: host.docker.internal:1433
Database: DB_F1_Garage_Manager
SQL Server Authentication: unchecked (usar Windows Auth)
```

### 2.4 Test & Save

1. Click **Save & Test**
2. Deberías ver: ✅ "Database connection successful"

Si no funciona, verifica:
- SQL Server está corriendo: `SELECT @@version;`
- El usuario/contraseña son correctos
- El firewall permite conexiones

---

## 📊 Paso 3: Crear Dashboard

### 3.1 Crear nuevo Dashboard
1. Click en **+** (arriba izquierda) → **Dashboard**
2. Click en **Add a new panel**

### 3.2 Panel 1: RANKING POR SIMULACIÓN

**Nombre:** Ranking - Simulaciones

**Query SQL:**
```sql
SELECT 
    Posicion,
    Equipo_Nombre AS Equipo,
    Conductor_Nombre AS Conductor,
    Circuito_Nombre AS Circuito,
    FORMAT(Tiempo_segundos, 'N3') AS Tiempo_s,
    Puntos_F1 AS Puntos,
    Carro_Potencia AS P,
    Carro_Aerodinamica AS A,
    Carro_Manejo AS M
FROM VW_Grafana_Ranking
WHERE Id_simulacion = $simulacion
ORDER BY Posicion ASC
```

**Tipo de Panel:** Table (Tabla)

**Configuración:**
- Sobrescribir título: "Ranking Final"
- Altura: 400px

---

### 3.3 Panel 2: COMPARACIÓN SETUP vs TIEMPO (mismo carro)

**Nombre:** Comparación - Setup vs Tiempo

**Query SQL:**
```sql
SELECT 
    Fecha_hora,
    Circuito_Nombre,
    CONCAT(
        'PU: ', PowerUnit_Nombre, ' | ',
        'Aero: ', Aerodinamico_Nombre
    ) AS Setup,
    Tiempo_segundos,
    Carro_Total_PAM,
    Posicion
FROM VW_Grafana_Carro_Comparacion
WHERE Id_carro = $carro
ORDER BY Fecha_hora DESC
```

**Tipo de Panel:** Time series (Línea)

**Configuración:**
- Eje Y: Tiempo_segundos
- Altura: 400px
- Leyenda: Bottom

---

### 3.4 Panel 3: P, A, M vs TIEMPO

**Nombre:** Análisis - P,A,M vs Tiempo

**Query SQL:**
```sql
SELECT 
    P,
    A,
    M,
    H,
    Tiempo_segundos,
    Equipo_Nombre,
    Conductor_Nombre
FROM VW_Grafana_PAM_Tiempo
WHERE Id_simulacion = $simulacion
ORDER BY Tiempo_segundos
```

**Tipo de Panel:** XY Chart (Scatter)

**Configuración:**
- X Axis: Total_PAM
- Y Axis: Tiempo_segundos
- Color: Equipo_Nombre
- Altura: 400px

---

## 📝 Crear Variables para Filtros

### Variable 1: $simulacion

1. Click en **Dashboard settings** ⚙️
2. Click en **Variables**
3. Click **Add variable**

**Configuración:**
```
Name: simulacion
Label: Simulación
Type: Query
Query: SELECT DISTINCT Id_simulacion FROM VW_Grafana_Simulaciones ORDER BY Id_simulacion DESC
Refresh: Dashboard
```

### Variable 2: $carro

```
Name: carro
Label: Carro
Type: Query
Query: SELECT DISTINCT Id_carro FROM VW_Grafana_Carro_Comparacion ORDER BY Id_carro
Refresh: Dashboard
```

---

## 💾 Guardar Dashboard

1. Click **Save** (Ctrl+S)
2. Dale un nombre: **"F1 Simulaciones"**
3. Click **Save**

---

## 🎯 Verificar Datos

Para verificar que hay datos:

```sql
-- Ver últimas simulaciones
SELECT TOP 5 
    Id_simulacion, Fecha_hora, Equipo_Nombre, 
    Conductor_Nombre, Tiempo_segundos, Posicion
FROM VW_Grafana_Ranking
ORDER BY Fecha_hora DESC

-- Ver conteo total
SELECT COUNT(*) FROM VW_Grafana_Simulaciones
```

---

## 🔗 URLs Importantes

| Servicio | URL |
|----------|-----|
| Grafana | http://localhost:3000 |
| SQL Server | localhost:1433 |
| Frontend React | http://localhost:5173 |
| Backend API | http://localhost:3000/api |

---

## 🆘 Troubleshooting

### Problema: "Database connection failed"
```powershell
# Verificar SQL Server está corriendo
sqlcmd -S localhost -E -Q "SELECT @@version;"

# Ver logs del contenedor Docker
docker logs grafana
```

### Problema: "Connection timeout"
```powershell
# Dentro del contenedor Docker, usar:
Host: host.docker.internal:1433

# No localhost:1433
```

### Problema: No hay datos en las vistas
```sql
-- Verifica datos existen
SELECT COUNT(*) FROM RESULTADO
SELECT COUNT(*) FROM SIMULACION
```

---

## 📱 Próximo: Embeber Grafana en React (Opcional)

Ver archivo: `frontend/src/components/GrafanaDashboard.jsx`

