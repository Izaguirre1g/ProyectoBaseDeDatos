-- SP_ModificarStock
-- Permite añadir o quitar stock del inventario general

CREATE OR ALTER PROCEDURE dbo.SP_ModificarStock
    -- PARÁMETROS DE ENTRADA
    @Id_parte INT,              -- ID de la parte a modificar
    @Cantidad INT,              -- Cantidad a añadir (positivo) o quitar (negativo)
    @Motivo VARCHAR(200),       -- Razón del ajuste de inventario
    
    -- PARÁMETROS DE SALIDA
    @Resultado VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON
    SET XACT_ABORT ON
    
    -- DECLARACIÓN DE VARIABLES
    DECLARE @StockActual INT
    DECLARE @NombreParte VARCHAR(50)
    DECLARE @NuevoStock INT
    
    BEGIN TRY
        -- VALIDACIONES INICIALES
        
        -- Validar que la cantidad no sea cero
        IF @Cantidad = 0
        BEGIN
            SET @Resultado = 'Error: La cantidad debe ser diferente de cero'
            RETURN -1
        END
        
        -- Validar que la parte existe
        IF NOT EXISTS (SELECT 1 FROM PARTE WHERE Id_parte = @Id_parte)
        BEGIN
            SET @Resultado = 'Error: La parte con ID ' + CAST(@Id_parte AS VARCHAR) + ' no existe'
            RETURN -1
        END
        
        -- Obtener nombre de la parte para mensajes
        SELECT @NombreParte = Nombre 
        FROM PARTE 
        WHERE Id_parte = @Id_parte
        
        -- Obtener stock actual (puede no existir registro aún)
        SELECT @StockActual = ISNULL(Stock_total, 0)
        FROM INVENTARIO_TOTAL
        WHERE Id_parte = @Id_parte
        
        -- Si no existe registro, el stock actual es 0
        IF @StockActual IS NULL
            SET @StockActual = 0
        
        -- Calcular nuevo stock
        SET @NuevoStock = @StockActual + @Cantidad
        
        -- VALIDACIÓN: No permitir stock negativo
        IF @NuevoStock < 0
        BEGIN
            SET @Resultado = 'Error: Stock insuficiente. ' +
                           'Stock actual: ' + CAST(@StockActual AS VARCHAR) + ' unidades. ' +
                           'Intentando quitar: ' + CAST(ABS(@Cantidad) AS VARCHAR) + ' unidades. ' +
                           'Resultado sería: ' + CAST(@NuevoStock AS VARCHAR) + ' (no permitido)'
            RETURN -1
        END
        
        -- TRANSACCIÓN: MODIFICAR STOCK
        BEGIN TRANSACTION
        
        -- Verificar si ya existe registro en INVENTARIO_TOTAL
        IF EXISTS (SELECT 1 FROM INVENTARIO_TOTAL WHERE Id_parte = @Id_parte)
        BEGIN
            -- Actualizar stock existente
            UPDATE INVENTARIO_TOTAL
            SET Stock_total = @NuevoStock
            WHERE Id_parte = @Id_parte
        END
        ELSE
        BEGIN
            -- Crear nuevo registro (solo si el resultado es positivo)
            IF @NuevoStock > 0
            BEGIN
                INSERT INTO INVENTARIO_TOTAL (Id_parte, Stock_total)
                VALUES (@Id_parte, @NuevoStock)
            END
            ELSE
            BEGIN
                -- No se puede crear un registro con stock 0 o negativo
                ROLLBACK TRANSACTION
                SET @Resultado = 'Error: No se puede crear inventario con stock cero o negativo'
                RETURN -1
            END
        END
        
        
        -- CONFIRMAR TRANSACCIÓN
        COMMIT TRANSACTION
        
        -- MENSAJE DE ÉXITO
        DECLARE @Accion VARCHAR(20)
        
        IF @Cantidad > 0
            SET @Accion = 'añadido'
        ELSE
            SET @Accion = 'quitado'
        
        SET @Resultado = 'Stock ' + @Accion + ' exitosamente. ' +
                        'Parte: ' + @NombreParte + '. ' +
                        'Cantidad ' + @Accion + ': ' + CAST(ABS(@Cantidad) AS VARCHAR) + ' unidades. ' +
                        'Stock anterior: ' + CAST(@StockActual AS VARCHAR) + ' unidades. ' +
                        'Stock nuevo: ' + CAST(@NuevoStock AS VARCHAR) + ' unidades. ' +
                        'Motivo: ' + ISNULL(@Motivo, 'No especificado')
        
        RETURN 0
        
    END TRY
    BEGIN CATCH

        -- MANEJO DE ERRORES
        
        -- Revertir transacción si está activa
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION
        
        -- Capturar información del error
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        DECLARE @ErrorLine INT = ERROR_LINE()
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY()
        
        SET @Resultado = 'Error al modificar stock: ' + @ErrorMessage +
                        ' (Línea: ' + CAST(@ErrorLine AS VARCHAR) + 
                        ', Severidad: ' + CAST(@ErrorSeverity AS VARCHAR) + ')'
        
        RETURN -2
    END CATCH
END
GO

PRINT 'Stored Procedure SP_ModificarStock creado exitosamente'
GO
