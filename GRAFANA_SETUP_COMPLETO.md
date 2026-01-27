# ✅ Grafana Configurado - Data Source Listo

## 🎉 Estado Actual

✅ **Grafana corriendo** en http://localhost:3000  
✅ **Data Source creado** (SQL Server F1)  
✅ **Usuario DB creado** (GrafanaUser / Grafana2024!)  
✅ **Vistas SQL listas** (3,129 registros disponibles)

---

## 📊 Paso 1: Acceder a Grafana

```
URL: http://localhost:3000
Usuario: admin
Contraseña: admin
```

---

## 📈 Paso 2: Crear Dashboard con Paneles

### 2.1 Crear Dashboard Nuevo

1. Click en **+** (arriba izquierda)
2. Click en **Dashboard**
3. Click en **Add a new panel**

### 2.2 Panel 1: RANKING

**Nombre:** Ranking - Simulaciones

**Tipo:** Table

**Query SQL:**
```sql
SELECT 
    Posicion,
    Equipo_Nombre AS [Equipo],
    Conductor_Nombre AS [Conductor],
    Circuito_Nombre AS [Circuito],
    CAST(Tiempo_segundos AS DECIMAL(10,3)) AS [Tiempo(s)],
    Puntos_F1 AS [Puntos],
    Carro_Potencia AS [P],
    Carro_Aerodinamica AS [A],
    Carro_Manejo AS [M]
FROM VW_Grafana_Ranking
WHERE Id_simulacion = $simulacion
ORDER BY Posicion ASC
```

**Pasos en Grafana:**
1. Click en **Query A**
2. Selecciona Data Source: "SQL Server F1"
3. Pega la query SQL
4. Click **Run query**
5. Ajusta ancho/alto del panel

---

### 2.3 Panel 2: COMPARACIÓN SETUP vs TIEMPO

**Nombre:** Setup vs Tiempo

**Tipo:** Time series (Línea)

**Query SQL:**
```sql
SELECT 
    Fecha_hora AS time,
    Tiempo_segundos,
    CONCAT(
        'PU: ', LEFT(PowerUnit_Nombre, 10), ' | ',
        'Aero: ', LEFT(Aerodinamico_Nombre, 10)
    ) AS [Setup],
    Circuito_Nombre,
    Carro_Total_PAM
FROM VW_Grafana_Carro_Comparacion
WHERE Id_carro = $carro
ORDER BY Fecha_hora DESC
OFFSET 0 ROWS FETCH NEXT 20 ROWS ONLY
```

---

### 2.4 Panel 3: P, A, M vs TIEMPO

**Nombre:** Análisis PAM

**Tipo:** XY Chart (Scatter)

**Query SQL:**
```sql
SELECT 
    Carro_Total_PAM AS [Total P+A+M],
    Tiempo_segundos AS [Tiempo(s)],
    Equipo_Nombre AS [Equipo],
    Conductor_Nombre AS [Conductor],
    Posicion AS [Posicion]
FROM VW_Grafana_PAM_Tiempo
WHERE Id_simulacion = $simulacion
ORDER BY Tiempo_segundos
```

---

## 🔧 Paso 3: Crear Variables

### Variable 1: simulacion

1. Click en **⚙️ Dashboard settings**
2. Click en **Variables**
3. Click **Create variable**

**Configuración:**
```
Name: simulacion
Type: Query
Query: SELECT CAST(Id_simulacion AS VARCHAR) FROM VW_Grafana_Simulaciones GROUP BY Id_simulacion ORDER BY Id_simulacion DESC LIMIT 20
Refresh: Dashboard
```

### Variable 2: carro

```
Name: carro
Type: Query
Query: SELECT CAST(Id_carro AS VARCHAR) FROM VW_Grafana_Carro_Comparacion GROUP BY Id_carro ORDER BY Id_carro
Refresh: Dashboard
```

---

## 💾 Paso 4: Guardar Dashboard

1. Press **Ctrl+S**
2. Nombre: **"F1 Simulaciones"**
3. Click **Save**

---

## 🧪 Verificar que hay datos

Ejecuta en SQL:

```sql
USE DB_F1_Garage_Manager;

-- Ver cantidad de simulaciones
SELECT COUNT(DISTINCT Id_simulacion) AS SimulacionesTotales 
FROM VW_Grafana_Simulaciones;

-- Ver últimos resultados
SELECT TOP 10 
    Id_simulacion, 
    Equipo_Nombre, 
    Conductor_Nombre, 
    Tiempo_segundos, 
    Posicion
FROM VW_Grafana_Ranking
ORDER BY Fecha_hora DESC;
```

---

## 🔗 URLs Útiles

| Servicio | URL |
|----------|-----|
| Grafana | http://localhost:3000 |
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| SQL Server | localhost:1433 |

---

## 🎯 Próximo Paso

Una vez que verifies que los paneles muestran datos correctamente, avísame para:

1. **Crear componente React** para embeber los dashboards en Admin
2. **Configurar auto-refresh** de paneles
3. **Agregar más visualizaciones** (si es necesario)

---

## ❓ ¿Problemas?

Si no ves datos en los paneles:

1. **Verifica el Data Source**
   - Click ⚙️ → Data Sources → "SQL Server F1"
   - Click "Save & Test"

2. **Verifica la query**
   - Usa la query directamente en SQL Server Management Studio
   - Verifica que `VW_Grafana_Simulaciones` tiene datos

3. **Verifica las variables**
   - Las variables deben tener valores disponibles
   - Prueba primero sin variables (hardcodea un ID)

