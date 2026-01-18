-- =============================================
-- Stored Procedure: SP_AgregarAporte
-- Descripción: Agrega un aporte de patrocinador a un equipo
-- Autor: F1 Garage Manager
-- Fecha: 2026-01-20
-- =============================================
-- Esta transacción asegura que:
--   1. Se valide el equipo y patrocinador
--   2. Se valide el monto positivo
--   3. Se registre el aporte correctamente
--   4. Si algo falla, se revierten los cambios
-- =============================================

CREATE OR ALTER PROCEDURE dbo.SP_AgregarAporte
    -- PARÁMETROS DE ENTRADA
    @Id_equipo INT,                             -- ID del equipo que recibe el aporte
    @Monto DECIMAL(12,4),                       -- Monto del aporte
    @Id_patrocinador INT,                       -- ID del patrocinador que hace el aporte
    @Descripcion NVARCHAR(200) = NULL,          -- Descripción opcional del aporte
    
    -- PARÁMETROS DE SALIDA
    @Resultado VARCHAR(500) OUTPUT,             -- Mensaje de resultado
    @Id_aporte_generado INT OUTPUT              -- ID del aporte creado
AS
BEGIN
    SET NOCOUNT ON
    SET XACT_ABORT ON
    
    -- =============================================
    -- DECLARACIÓN DE VARIABLES
    -- =============================================
    DECLARE @NombreEquipo VARCHAR(50)
    DECLARE @NombrePatrocinador VARCHAR(50)
    DECLARE @PresupuestoAnterior MONEY
    DECLARE @NuevoPresupuesto MONEY
    
    BEGIN TRY
        -- =============================================
        -- VALIDACIONES INICIALES
        -- =============================================
        
        -- Validar monto positivo
        IF @Monto <= 0
        BEGIN
            SET @Resultado = 'Error: El monto debe ser mayor a cero'
            RETURN -1
        END
        
        -- Verificar que el equipo existe
        IF NOT EXISTS (SELECT 1 FROM EQUIPO WHERE Id_equipo = @Id_equipo)
        BEGIN
            SET @Resultado = 'Error: El equipo con ID ' + CAST(@Id_equipo AS VARCHAR) + ' no existe'
            RETURN -1
        END
        
        -- Obtener nombre del equipo
        SELECT @NombreEquipo = Nombre FROM EQUIPO WHERE Id_equipo = @Id_equipo
        
        -- Verificar que el patrocinador existe
        IF NOT EXISTS (SELECT 1 FROM PATROCINADOR WHERE Id_patrocinador = @Id_patrocinador)
        BEGIN
            SET @Resultado = 'Error: El patrocinador con ID ' + CAST(@Id_patrocinador AS VARCHAR) + ' no existe'
            RETURN -1
        END
        
        -- Obtener nombre del patrocinador
        SELECT @NombrePatrocinador = Nombre_patrocinador FROM PATROCINADOR WHERE Id_patrocinador = @Id_patrocinador
        
        -- Obtener presupuesto anterior usando la función del sistema
        SET @PresupuestoAnterior = dbo.fn_CalcularPresupuestoEquipo(@Id_equipo)
        
        -- =============================================
        -- INICIAR TRANSACCIÓN
        -- =============================================
        BEGIN TRANSACTION
        
        -- Insertar el aporte
        INSERT INTO APORTE (Monto, Descripcion, Fecha, Id_equipo, Id_patrocinador)
        VALUES (@Monto, @Descripcion, GETDATE(), @Id_equipo, @Id_patrocinador)
        
        -- Obtener el ID generado
        SET @Id_aporte_generado = SCOPE_IDENTITY()
        
        -- Confirmar la transacción
        COMMIT TRANSACTION
        
        -- =============================================
        -- GENERAR MENSAJE DE ÉXITO
        -- =============================================
        
        -- Obtener nuevo presupuesto después del aporte
        SET @NuevoPresupuesto = dbo.fn_CalcularPresupuestoEquipo(@Id_equipo)
        
        SET @Resultado = 'Aporte registrado exitosamente. ' +
                        'Equipo: ' + @NombreEquipo + '. ' +
                        'Patrocinador: ' + @NombrePatrocinador + '. ' +
                        'Monto: $' + CAST(@Monto AS VARCHAR) + '. ' +
                        'Presupuesto anterior: $' + CAST(@PresupuestoAnterior AS VARCHAR) + '. ' +
                        'Nuevo presupuesto: $' + CAST(@NuevoPresupuesto AS VARCHAR) + '. ' +
                        'ID Aporte: ' + CAST(@Id_aporte_generado AS VARCHAR)
        
        RETURN 0
        
    END TRY
    BEGIN CATCH
        -- =============================================
        -- MANEJO DE ERRORES
        -- =============================================
        
        -- Revertir transacción si está activa
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION
        
        -- Capturar detalles del error
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        DECLARE @ErrorLine INT = ERROR_LINE()
        
        SET @Resultado = 'Error en transacción: ' + @ErrorMessage +
                        ' (Línea: ' + CAST(@ErrorLine AS VARCHAR) + ')'
        
        RETURN -2
    END CATCH
END
GO

-- =============================================
-- EJEMPLO DE USO
-- =============================================
/*
DECLARE @Resultado VARCHAR(500)
DECLARE @IdAporte INT

EXEC SP_AgregarAporte
    @Id_equipo = 1,
    @Monto = 500000.00,
    @Id_patrocinador = 9,
    @Descripcion = 'Patrocinio de temporada',
    @Resultado = @Resultado OUTPUT,
    @Id_aporte_generado = @IdAporte OUTPUT

SELECT @Resultado as Mensaje, @IdAporte as IdAporte
*/
