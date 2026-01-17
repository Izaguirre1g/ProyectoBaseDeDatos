-- =============================================
-- Stored Procedure: SP_EjecutarSimulacion
-- Descripción: Ejecuta una simulación de carrera con múltiples carros
-- Autor: F1 Garage Manager
-- Fecha: 2026-01-17
-- =============================================
-- Esta transacción asegura que:
--   1. Se validen todos los carros antes de iniciar
--   2. Se cree la simulación
--   3. Se calculen y registren TODOS los resultados
--   4. Si algo falla, se revierten TODOS los cambios
-- =============================================

CREATE OR ALTER PROCEDURE dbo.SP_EjecutarSimulacion
    -- PARÁMETROS DE ENTRADA
    @Id_circuito INT,                           -- Circuito donde se corre
    @CarrosJSON NVARCHAR(MAX),                  -- JSON con lista de {idCarro, habilidad}
    @Fecha_hora DATETIME = NULL,                -- Fecha/hora (opcional, usa GETDATE si es NULL)
    
    -- PARÁMETROS DE SALIDA
    @Resultado VARCHAR(1000) OUTPUT,            -- Mensaje de resultado
    @Id_simulacion_generada INT OUTPUT          -- ID de la simulación creada
AS
BEGIN
    SET NOCOUNT ON
    SET XACT_ABORT ON
    
    -- =============================================
    -- DECLARACIÓN DE VARIABLES
    -- =============================================
    
    -- Datos del circuito
    DECLARE @Distancia_total DECIMAL(10,3)
    DECLARE @Cantidad_curvas TINYINT
    
    -- Constantes de cálculo
    DECLARE @DC_CURVA DECIMAL(10,3) = 0.5  -- Distancia promedio de curvas
    
    -- Variables para el cursor de carros
    DECLARE @IdCarro INT
    DECLARE @Habilidad TINYINT
    DECLARE @P_total TINYINT
    DECLARE @A_total TINYINT
    DECLARE @M_total TINYINT
    DECLARE @Finalizado TINYINT
    DECLARE @Id_conductor INT
    DECLARE @NombreEquipo VARCHAR(100)
    
    -- Variables de cálculo de resultados
    DECLARE @Vrecta DECIMAL(10,2)
    DECLARE @Vcurva DECIMAL(10,2)
    DECLARE @Dcurvas DECIMAL(10,3)
    DECLARE @Drectas DECIMAL(10,3)
    DECLARE @Penalizacion DECIMAL(10,2)
    DECLARE @TiempoHoras DECIMAL(20,10)
    DECLARE @TiempoSegundos DECIMAL(10,3)
    
    -- Contadores
    DECLARE @TotalCarros INT = 0
    DECLARE @CarrosValidos INT = 0
    DECLARE @CarrosProcesados INT = 0
    
    -- Tabla temporal para almacenar resultados antes de ordenar
    DECLARE @ResultadosTemp TABLE (
        Id_carro INT,
        Vrecta DECIMAL(10,2),
        Vcurva DECIMAL(10,2),
        Penalizacion DECIMAL(10,2),
        Tiempo_segundos DECIMAL(10,3),
        P_total TINYINT,
        A_total TINYINT,
        M_total TINYINT,
        H_conductor TINYINT,
        Posicion INT -- Se asignará después de ordenar
    )
    
    BEGIN TRY
        -- =============================================
        -- VALIDACIONES INICIALES
        -- =============================================
        
        -- Establecer fecha si no se proporciona
        IF @Fecha_hora IS NULL
            SET @Fecha_hora = GETDATE()
        
        -- Validar que el circuito existe
        IF NOT EXISTS (SELECT 1 FROM CIRCUITO WHERE Id_circuito = @Id_circuito)
        BEGIN
            SET @Resultado = 'Error: El circuito con ID ' + CAST(@Id_circuito AS VARCHAR) + ' no existe'
            SET @Id_simulacion_generada = NULL
            RETURN -1
        END
        
        -- Obtener datos del circuito
        SELECT 
            @Distancia_total = Distancia_total,
            @Cantidad_curvas = Cantidad_curvas
        FROM CIRCUITO 
        WHERE Id_circuito = @Id_circuito
        
        -- Validar que el JSON de carros no está vacío
        IF @CarrosJSON IS NULL OR @CarrosJSON = '' OR @CarrosJSON = '[]'
        BEGIN
            SET @Resultado = 'Error: Debe proporcionar al menos un carro para la simulación'
            SET @Id_simulacion_generada = NULL
            RETURN -1
        END
        
        -- Parsear JSON y validar carros
        -- El JSON tiene formato: [{"idCarro": 1, "habilidad": 85}, {"idCarro": 2, "habilidad": 90}]
        
        -- Contar carros en el JSON
        SELECT @TotalCarros = COUNT(*)
        FROM OPENJSON(@CarrosJSON)
        WITH (
            idCarro INT '$.idCarro',
            habilidad TINYINT '$.habilidad'
        )
        
        IF @TotalCarros < 1
        BEGIN
            SET @Resultado = 'Error: El JSON de carros está vacío o mal formateado'
            SET @Id_simulacion_generada = NULL
            RETURN -1
        END
        
        -- Validar cada carro del JSON
        DECLARE carroCursor CURSOR FOR
            SELECT idCarro, habilidad
            FROM OPENJSON(@CarrosJSON)
            WITH (
                idCarro INT '$.idCarro',
                habilidad TINYINT '$.habilidad'
            )
        
        OPEN carroCursor
        FETCH NEXT FROM carroCursor INTO @IdCarro, @Habilidad
        
        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- Verificar que el carro existe y está finalizado
            SELECT 
                @P_total = P_total,
                @A_total = A_total,
                @M_total = M_total,
                @Finalizado = Finalizado,
                @Id_conductor = Id_conductor,
                @NombreEquipo = E.Nombre
            FROM CARRO C
            LEFT JOIN EQUIPO E ON C.Id_equipo = E.Id_equipo
            WHERE C.Id_carro = @IdCarro
            
            IF @Finalizado IS NULL
            BEGIN
                CLOSE carroCursor
                DEALLOCATE carroCursor
                SET @Resultado = 'Error: El carro con ID ' + CAST(@IdCarro AS VARCHAR) + ' no existe'
                SET @Id_simulacion_generada = NULL
                RETURN -1
            END
            
            IF @Finalizado != 1
            BEGIN
                CLOSE carroCursor
                DEALLOCATE carroCursor
                SET @Resultado = 'Error: El carro con ID ' + CAST(@IdCarro AS VARCHAR) + 
                               ' no está finalizado. Solo carros completos pueden participar.'
                SET @Id_simulacion_generada = NULL
                RETURN -1
            END
            
            IF @Id_conductor IS NULL
            BEGIN
                CLOSE carroCursor
                DEALLOCATE carroCursor
                SET @Resultado = 'Error: El carro con ID ' + CAST(@IdCarro AS VARCHAR) + 
                               ' no tiene conductor asignado.'
                SET @Id_simulacion_generada = NULL
                RETURN -1
            END
            
            -- =============================================
            -- CALCULAR RESULTADO PARA ESTE CARRO
            -- =============================================
            -- Fórmulas:
            --   Vrecta = 200 + 3*P + 0.2*H - A
            --   Vcurva = 90 + 2*A + 2*M + 0.2*H
            --   Dcurvas = C * DC_CURVA (donde C = cantidad de curvas)
            --   Drectas = D - Dcurvas (donde D = distancia total)
            --   Penalización = (C * 40) / (1 + H/100)
            --   Tiempo = (Drectas/Vrecta + Dcurvas/Vcurva) * 3600 + Penalización
            -- =============================================
            
            -- Usar habilidad del JSON o default 85
            IF @Habilidad IS NULL OR @Habilidad = 0
                SET @Habilidad = 85
            
            -- Calcular velocidades
            SET @Vrecta = 200.0 + (3.0 * @P_total) + (0.2 * @Habilidad) - @A_total
            SET @Vcurva = 90.0 + (2.0 * @A_total) + (2.0 * @M_total) + (0.2 * @Habilidad)
            
            -- Calcular distancias
            SET @Dcurvas = @Cantidad_curvas * @DC_CURVA
            SET @Drectas = @Distancia_total - @Dcurvas
            IF @Drectas < 0 SET @Drectas = 0
            
            -- Calcular penalización
            SET @Penalizacion = (@Cantidad_curvas * 40.0) / (1.0 + (@Habilidad / 100.0))
            
            -- Calcular tiempo total en segundos
            SET @TiempoHoras = (@Drectas / @Vrecta) + (@Dcurvas / @Vcurva)
            SET @TiempoSegundos = (@TiempoHoras * 3600.0) + @Penalizacion
            
            -- Insertar en tabla temporal (sin posición aún)
            INSERT INTO @ResultadosTemp (Id_carro, Vrecta, Vcurva, Penalizacion, Tiempo_segundos, P_total, A_total, M_total, H_conductor, Posicion)
            VALUES (@IdCarro, @Vrecta, @Vcurva, @Penalizacion, @TiempoSegundos, @P_total, @A_total, @M_total, @Habilidad, 0)
            
            SET @CarrosValidos = @CarrosValidos + 1
            
            FETCH NEXT FROM carroCursor INTO @IdCarro, @Habilidad
        END
        
        CLOSE carroCursor
        DEALLOCATE carroCursor
        
        -- Verificar que hay al menos un carro válido
        IF @CarrosValidos < 1
        BEGIN
            SET @Resultado = 'Error: No hay carros válidos para la simulación'
            SET @Id_simulacion_generada = NULL
            RETURN -1
        END
        
        -- =============================================
        -- ASIGNAR POSICIONES (ordenar por tiempo)
        -- =============================================
        ;WITH Ranked AS (
            SELECT 
                Id_carro,
                ROW_NUMBER() OVER (ORDER BY Tiempo_segundos ASC) AS NewPosicion
            FROM @ResultadosTemp
        )
        UPDATE RT
        SET RT.Posicion = R.NewPosicion
        FROM @ResultadosTemp RT
        INNER JOIN Ranked R ON RT.Id_carro = R.Id_carro
        
        -- =============================================
        -- TRANSACCIÓN: CREAR SIMULACIÓN Y RESULTADOS
        -- =============================================
        BEGIN TRANSACTION
        
        -- Crear la simulación
        INSERT INTO SIMULACION (Fecha_hora, Id_circuito)
        VALUES (@Fecha_hora, @Id_circuito)
        
        -- Obtener el ID generado
        SET @Id_simulacion_generada = SCOPE_IDENTITY()
        
        -- Insertar todos los resultados
        INSERT INTO RESULTADO (
            Id_simulacion, Id_carro, Vrecta, Vcurva, Penalizacion, 
            Tiempo_segundos, Posicion, P_total, A_total, M_total, H_conductor
        )
        SELECT 
            @Id_simulacion_generada,
            Id_carro,
            Vrecta,
            Vcurva,
            Penalizacion,
            Tiempo_segundos,
            Posicion,
            P_total,
            A_total,
            M_total,
            H_conductor
        FROM @ResultadosTemp
        ORDER BY Posicion
        
        SET @CarrosProcesados = @@ROWCOUNT
        
        -- =============================================
        -- CONFIRMAR TRANSACCIÓN
        -- =============================================
        COMMIT TRANSACTION
        
        -- Obtener info del ganador para el mensaje
        DECLARE @GanadorCarro INT
        DECLARE @GanadorTiempo DECIMAL(10,3)
        DECLARE @GanadorEquipo VARCHAR(100)
        DECLARE @GanadorConductor VARCHAR(100)
        
        SELECT TOP 1
            @GanadorCarro = R.Id_carro,
            @GanadorTiempo = R.Tiempo_segundos,
            @GanadorEquipo = E.Nombre,
            @GanadorConductor = U.Correo_usuario
        FROM RESULTADO R
        JOIN CARRO C ON R.Id_carro = C.Id_carro
        LEFT JOIN EQUIPO E ON C.Id_equipo = E.Id_equipo
        LEFT JOIN USUARIO U ON C.Id_conductor = U.Id_usuario
        WHERE R.Id_simulacion = @Id_simulacion_generada
        ORDER BY R.Posicion ASC
        
        -- Mensaje de éxito
        SET @Resultado = 'Simulación ejecutada exitosamente. ' +
                        'ID: ' + CAST(@Id_simulacion_generada AS VARCHAR) + '. ' +
                        'Carros: ' + CAST(@CarrosProcesados AS VARCHAR) + '. ' +
                        'Circuito: ' + CAST(@Distancia_total AS VARCHAR) + 'km, ' + 
                        CAST(@Cantidad_curvas AS VARCHAR) + ' curvas. ' +
                        'Ganador: ' + ISNULL(@GanadorConductor, 'N/A') + ' (' + ISNULL(@GanadorEquipo, 'N/A') + ') ' +
                        'en ' + CAST(CAST(@GanadorTiempo AS DECIMAL(10,2)) AS VARCHAR) + 's'
        
        RETURN 0
        
    END TRY
    BEGIN CATCH
        -- Revertir transacción si está activa
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION
        
        -- Limpiar cursor si está abierto
        IF CURSOR_STATUS('local', 'carroCursor') >= 0
        BEGIN
            CLOSE carroCursor
            DEALLOCATE carroCursor
        END
        
        -- Capturar información del error
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        DECLARE @ErrorLine INT = ERROR_LINE()
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY()
        DECLARE @ErrorState INT = ERROR_STATE()
        
        SET @Resultado = 'Error en simulación: ' + @ErrorMessage +
                        ' (Línea: ' + CAST(@ErrorLine AS VARCHAR) + 
                        ', Severidad: ' + CAST(@ErrorSeverity AS VARCHAR) + ')'
        SET @Id_simulacion_generada = NULL
        
        RETURN -2
    END CATCH
END
GO

-- =============================================
-- Stored Procedure: SP_ObtenerResultadosSimulacion
-- Descripción: Obtiene los resultados de una simulación con información detallada
-- =============================================

CREATE OR ALTER PROCEDURE dbo.SP_ObtenerResultadosSimulacion
    @Id_simulacion INT
AS
BEGIN
    SET NOCOUNT ON
    
    -- Verificar que la simulación existe
    IF NOT EXISTS (SELECT 1 FROM SIMULACION WHERE Id_simulacion = @Id_simulacion)
    BEGIN
        SELECT 'Error: Simulación no encontrada' AS Error
        RETURN -1
    END
    
    -- Retornar información de la simulación
    SELECT 
        S.Id_simulacion,
        S.Fecha_hora,
        C.Id_circuito,
        C.Distancia_total,
        C.Cantidad_curvas
    FROM SIMULACION S
    JOIN CIRCUITO C ON S.Id_circuito = C.Id_circuito
    WHERE S.Id_simulacion = @Id_simulacion
    
    -- Retornar resultados ordenados por posición
    SELECT 
        R.Id_resultado,
        R.Posicion,
        R.Id_carro,
        R.Tiempo_segundos,
        R.Vrecta,
        R.Vcurva,
        R.Penalizacion,
        R.P_total,
        R.A_total,
        R.M_total,
        R.H_conductor,
        E.Nombre AS Equipo,
        U.Correo_usuario AS Conductor
    FROM RESULTADO R
    JOIN CARRO CA ON R.Id_carro = CA.Id_carro
    LEFT JOIN EQUIPO E ON CA.Id_equipo = E.Id_equipo
    LEFT JOIN USUARIO U ON CA.Id_conductor = U.Id_usuario
    WHERE R.Id_simulacion = @Id_simulacion
    ORDER BY R.Posicion ASC
    
    RETURN 0
END
GO

-- =============================================
-- Stored Procedure: SP_ObtenerEstadisticasConductor
-- Descripción: Obtiene estadísticas de un conductor específico
-- =============================================

CREATE OR ALTER PROCEDURE dbo.SP_ObtenerEstadisticasConductor
    @Id_usuario INT
AS
BEGIN
    SET NOCOUNT ON
    
    -- Verificar que el usuario existe y es conductor
    IF NOT EXISTS (SELECT 1 FROM USUARIO WHERE Id_usuario = @Id_usuario)
    BEGIN
        SELECT 'Error: Usuario no encontrado' AS Error
        RETURN -1
    END
    
    -- Retornar estadísticas agregadas
    SELECT 
        @Id_usuario AS Id_usuario,
        COUNT(*) AS TotalSimulaciones,
        COUNT(CASE WHEN R.Posicion = 1 THEN 1 END) AS Victorias,
        COUNT(CASE WHEN R.Posicion <= 3 THEN 1 END) AS Podios,
        CAST(AVG(CAST(R.Posicion AS FLOAT)) AS DECIMAL(4,2)) AS PosicionPromedio,
        MIN(R.Tiempo_segundos) AS MejorTiempo,
        MAX(R.Vrecta) AS MejorVrecta,
        MAX(R.Vcurva) AS MejorVcurva,
        -- Puntos estilo F1
        SUM(CASE 
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
        END) AS PuntosTotales
    FROM RESULTADO R
    JOIN CARRO C ON R.Id_carro = C.Id_carro
    WHERE C.Id_conductor = @Id_usuario
    GROUP BY C.Id_conductor
    
    RETURN 0
END
GO

PRINT 'Stored Procedures de simulación creados exitosamente'
