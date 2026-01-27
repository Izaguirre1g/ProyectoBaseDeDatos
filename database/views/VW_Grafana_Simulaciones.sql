-- =============================================
-- Vistas para Grafana - F1 Garage Manager
-- =============================================

DROP VIEW IF EXISTS dbo.VW_Grafana_PAM_Tiempo
DROP VIEW IF EXISTS dbo.VW_Grafana_Carro_Comparacion
DROP VIEW IF EXISTS dbo.VW_Grafana_Ranking
DROP VIEW IF EXISTS dbo.VW_Grafana_Simulaciones
GO

-- =============================================
-- Vista maestra: VW_Grafana_Simulaciones
-- Expone todos los datos de simulaciones requeridos por Grafana
-- =============================================
CREATE VIEW dbo.VW_Grafana_Simulaciones AS
SELECT 
    -- === IDENTIFICACIÓN DE SIMULACIÓN ===
    S.Id_simulacion,
    S.Fecha_hora,
    CONVERT(DATE, S.Fecha_hora) AS Fecha,
    CONVERT(TIME, S.Fecha_hora) AS Hora,
    
    -- === CIRCUITO ===
    CI.Id_circuito,
    'Circuito_' + CAST(CI.Id_circuito AS VARCHAR) AS Circuito_Nombre,
    CI.Distancia_total AS Circuito_Distancia_km,
    CI.Cantidad_curvas AS Circuito_Curvas,
    
    -- === EQUIPO ===
    E.Id_equipo,
    E.Nombre AS Equipo_Nombre,
    
    -- === CARRO ===
    CA.Id_carro,
    CA.Finalizado AS Carro_Finalizado,
    
    -- === CONDUCTOR ===
    U.Id_usuario AS Conductor_Id,
    U.Correo_usuario AS Conductor_Email,
    ISNULL(U.Nombre_usuario, 'N/A') AS Conductor_Nombre,
    
    -- === TOTALES DEL CARRO (al momento de la simulación) ===
    R.P_total AS Carro_Potencia,
    R.A_total AS Carro_Aerodinamica,
    R.M_total AS Carro_Manejo,
    R.H_conductor AS Conductor_Habilidad,
    (R.P_total + R.A_total + R.M_total) AS Carro_Total_PAM,
    
    -- === VALORES CALCULADOS ===
    R.Vrecta,
    R.Vcurva,
    R.Penalizacion,
    R.Tiempo_segundos,
    
    -- === RESULTADO ===
    R.Posicion,
    R.Id_resultado,
    
    -- === SETUP DEL CARRO (Partes instaladas) ===
    -- Power Unit (Categoría 1)
    PU.Id_parte AS PowerUnit_Id,
    ISNULL(PU.Nombre, 'Sin instalar') AS PowerUnit_Nombre,
    ISNULL(PU.Potencia, 0) AS PowerUnit_P,
    ISNULL(PU.Aerodinamica, 0) AS PowerUnit_A,
    ISNULL(PU.Manejo, 0) AS PowerUnit_M,
    
    -- Paquete Aerodinámico (Categoría 2)
    PA.Id_parte AS Aerodinamico_Id,
    ISNULL(PA.Nombre, 'Sin instalar') AS Aerodinamico_Nombre,
    ISNULL(PA.Potencia, 0) AS Aerodinamico_P,
    ISNULL(PA.Aerodinamica, 0) AS Aerodinamico_A,
    ISNULL(PA.Manejo, 0) AS Aerodinamico_M,
    
    -- Neumáticos (Categoría 3)
    NE.Id_parte AS Neumaticos_Id,
    ISNULL(NE.Nombre, 'Sin instalar') AS Neumaticos_Nombre,
    ISNULL(NE.Potencia, 0) AS Neumaticos_P,
    ISNULL(NE.Aerodinamica, 0) AS Neumaticos_A,
    ISNULL(NE.Manejo, 0) AS Neumaticos_M,
    
    -- Suspensión (Categoría 4)
    SU.Id_parte AS Suspension_Id,
    ISNULL(SU.Nombre, 'Sin instalar') AS Suspension_Nombre,
    ISNULL(SU.Potencia, 0) AS Suspension_P,
    ISNULL(SU.Aerodinamica, 0) AS Suspension_A,
    ISNULL(SU.Manejo, 0) AS Suspension_M,
    
    -- Caja de Cambios (Categoría 5)
    CC.Id_parte AS CajaCambios_Id,
    ISNULL(CC.Nombre, 'Sin instalar') AS CajaCambios_Nombre,
    ISNULL(CC.Potencia, 0) AS CajaCambios_P,
    ISNULL(CC.Aerodinamica, 0) AS CajaCambios_A,
    ISNULL(CC.Manejo, 0) AS CajaCambios_M,
    
    -- === MÉTRICAS ADICIONALES PARA ANÁLISIS ===
    -- Diferencia con el ganador (para comparación)
    R.Tiempo_segundos - MIN(R.Tiempo_segundos) OVER (PARTITION BY S.Id_simulacion) AS Diferencia_Con_Primero,
    
    -- Velocidad promedio (km/h)
    CASE 
        WHEN R.Tiempo_segundos > 0 
        THEN CAST((CI.Distancia_total * 3600) / R.Tiempo_segundos AS DECIMAL(10,2))
        ELSE 0 
    END AS Velocidad_Promedio_kmh,
    
    -- Puntos F1
    CASE 
        WHEN R.Posicion = 1 THEN 25 
        WHEN R.Posicion = 2 THEN 18
        WHEN R.Posicion = 3 THEN 15
        WHEN R.Posicion = 4 THEN 12
        WHEN R.Posicion = 5 THEN 10
        WHEN R.Posicion = 6 THEN 8
        WHEN R.Posicion = 7 THEN 6
        WHEN R.Posicion = 8 THEN 4
        WHEN R.Posicion = 9 THEN 2
        WHEN R.Posicion = 10 THEN 1
        ELSE 0 
    END AS Puntos_F1

FROM RESULTADO R
INNER JOIN SIMULACION S ON R.Id_simulacion = S.Id_simulacion
INNER JOIN CIRCUITO CI ON S.Id_circuito = CI.Id_circuito
INNER JOIN CARRO CA ON R.Id_carro = CA.Id_carro
LEFT JOIN EQUIPO E ON CA.Id_equipo = E.Id_equipo
LEFT JOIN USUARIO U ON CA.Id_conductor = U.Id_usuario

-- Obtener partes del setup del carro
LEFT JOIN ESTRUCTURA_CARRO EC_PU ON CA.Id_carro = EC_PU.Id_carro
LEFT JOIN PARTE PU ON EC_PU.Id_parte = PU.Id_parte AND PU.Id_categoria = 1

LEFT JOIN ESTRUCTURA_CARRO EC_PA ON CA.Id_carro = EC_PA.Id_carro
LEFT JOIN PARTE PA ON EC_PA.Id_parte = PA.Id_parte AND PA.Id_categoria = 2

LEFT JOIN ESTRUCTURA_CARRO EC_NE ON CA.Id_carro = EC_NE.Id_carro
LEFT JOIN PARTE NE ON EC_NE.Id_parte = NE.Id_parte AND NE.Id_categoria = 3

LEFT JOIN ESTRUCTURA_CARRO EC_SU ON CA.Id_carro = EC_SU.Id_carro
LEFT JOIN PARTE SU ON EC_SU.Id_parte = SU.Id_parte AND SU.Id_categoria = 4

LEFT JOIN ESTRUCTURA_CARRO EC_CC ON CA.Id_carro = EC_CC.Id_carro
LEFT JOIN PARTE CC ON EC_CC.Id_parte = CC.Id_parte AND CC.Id_categoria = 5
GO

-- =============================================
-- Vista 2: Ranking simplificado
-- =============================================
CREATE VIEW dbo.VW_Grafana_Ranking AS
SELECT 
    Id_simulacion,
    Fecha_hora,
    Circuito_Nombre,
    Circuito_Distancia_km,
    Posicion,
    Equipo_Nombre,
    Conductor_Nombre,
    Conductor_Email,
    Id_carro,
    Tiempo_segundos,
    Diferencia_Con_Primero,
    Carro_Potencia,
    Carro_Aerodinamica,
    Carro_Manejo,
    Conductor_Habilidad,
    Puntos_F1
FROM VW_Grafana_Simulaciones
GO

-- =============================================
-- Vista 3: Comparación de setup vs tiempo del mismo carro
-- =============================================
CREATE VIEW dbo.VW_Grafana_Carro_Comparacion AS
SELECT 
    Id_carro,
    Equipo_Nombre,
    Conductor_Nombre,
    Id_simulacion,
    Fecha_hora,
    Circuito_Nombre,
    
    -- Setup (identificar configuración)
    PowerUnit_Nombre,
    Aerodinamico_Nombre,
    Neumaticos_Nombre,
    Suspension_Nombre,
    CajaCambios_Nombre,
    
    -- Totales
    Carro_Potencia,
    Carro_Aerodinamica,
    Carro_Manejo,
    Carro_Total_PAM,
    
    -- Resultados
    Tiempo_segundos,
    Posicion,
    Vrecta,
    Vcurva,
    Penalizacion
FROM VW_Grafana_Simulaciones
GO

-- =============================================
-- Vista 4: Correlación P, A, M vs Tiempo
-- =============================================
CREATE VIEW dbo.VW_Grafana_PAM_Tiempo AS
SELECT 
    Id_simulacion,
    Circuito_Nombre,
    Circuito_Curvas,
    Circuito_Distancia_km,
    Id_carro,
    Equipo_Nombre,
    Conductor_Nombre,
    Carro_Potencia AS P,
    Carro_Aerodinamica AS A,
    Carro_Manejo AS M,
    Conductor_Habilidad AS H,
    Carro_Total_PAM AS Total_PAM,
    Tiempo_segundos,
    Vrecta,
    Vcurva,
    Posicion
FROM VW_Grafana_Simulaciones
GO

PRINT '✓ Vistas de Grafana creadas exitosamente'
PRINT '  - VW_Grafana_Simulaciones'
PRINT '  - VW_Grafana_Ranking'
PRINT '  - VW_Grafana_Carro_Comparacion'
PRINT '  - VW_Grafana_PAM_Tiempo'
