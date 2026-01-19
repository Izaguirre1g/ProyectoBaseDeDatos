-- =============================================
-- Stored Procedures para Armado de Carros
-- F1 Garage Manager
-- Fecha: 2026-01-19
-- =============================================

-- =============================================
-- SP_InstalarParteEnCarro (Actualizado)
-- Instala una parte en un carro vacío de esa categoría
-- =============================================
CREATE OR ALTER PROCEDURE dbo.SP_InstalarParteEnCarro
    @Id_carro INT,
    @Id_parte INT,
    @Resultado VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON
    SET XACT_ABORT ON
    
    BEGIN TRY
        DECLARE @Id_equipo INT
        DECLARE @Id_categoria INT
        DECLARE @CantidadDisponible INT
        DECLARE @PartesInstaladasEnCategoria INT
        DECLARE @NombreParte VARCHAR(50)
        DECLARE @NombreCategoria VARCHAR(50)
        DECLARE @M_total INT
        DECLARE @A_total INT
        DECLARE @P_total INT
        DECLARE @PartesInstaladas INT
        
        -- VALIDACION: Carro existe
        IF NOT EXISTS (SELECT 1 FROM CARRO WHERE Id_carro = @Id_carro)
        BEGIN
            SET @Resultado = 'Error: El carro no existe'
            RETURN -1
        END
        
        SELECT @Id_equipo = Id_equipo FROM CARRO WHERE Id_carro = @Id_carro
        
        -- VALIDACION: Parte existe
        SELECT @Id_categoria = Id_categoria, @NombreParte = Nombre FROM PARTE WHERE Id_parte = @Id_parte
        IF @Id_categoria IS NULL
        BEGIN
            SET @Resultado = 'Error: La parte no existe'
            RETURN -1
        END
        
        SELECT @NombreCategoria = Nombre FROM CATEGORIA WHERE Id_categoria = @Id_categoria
        
        -- VALIDACION: Parte en inventario
        SELECT @CantidadDisponible = Cantidad FROM INVENTARIO_EQUIPO WHERE Id_equipo = @Id_equipo AND Id_parte = @Id_parte
        IF @CantidadDisponible IS NULL OR @CantidadDisponible < 1
        BEGIN
            SET @Resultado = 'Error: El equipo no tiene la parte en inventario. Debe comprarla primero.'
            RETURN -1
        END
        
        -- VALIDACION: No hay parte de esa categoria ya instalada
        SELECT @PartesInstaladasEnCategoria = COUNT(*) FROM ESTRUCTURA_CARRO EC
        INNER JOIN PARTE P ON EC.Id_parte = P.Id_parte WHERE EC.Id_carro = @Id_carro AND P.Id_categoria = @Id_categoria
        
        IF @PartesInstaladasEnCategoria > 0
        BEGIN
            SET @Resultado = 'Error: Ya hay una parte de categoria "' + @NombreCategoria + '" instalada. Solo se permite una parte por categoria.'
            RETURN -1
        END
        
        -- TRANSACCION
        BEGIN TRANSACTION
        
        INSERT INTO ESTRUCTURA_CARRO (Id_carro, Id_parte) VALUES (@Id_carro, @Id_parte)
        
        UPDATE INVENTARIO_EQUIPO SET Cantidad = Cantidad - 1 WHERE Id_equipo = @Id_equipo AND Id_parte = @Id_parte
        DELETE FROM INVENTARIO_EQUIPO WHERE Id_equipo = @Id_equipo AND Id_parte = @Id_parte AND Cantidad <= 0
        
        -- Recalcular totales
        UPDATE CARRO SET
            P_total = ISNULL((SELECT SUM(P.Potencia) FROM ESTRUCTURA_CARRO EC JOIN PARTE P ON EC.Id_parte = P.Id_parte WHERE EC.Id_carro = @Id_carro), 0),
            A_total = ISNULL((SELECT SUM(P.Aerodinamica) FROM ESTRUCTURA_CARRO EC JOIN PARTE P ON EC.Id_parte = P.Id_parte WHERE EC.Id_carro = @Id_carro), 0),
            M_total = ISNULL((SELECT SUM(P.Manejo) FROM ESTRUCTURA_CARRO EC JOIN PARTE P ON EC.Id_parte = P.Id_parte WHERE EC.Id_carro = @Id_carro), 0)
        WHERE Id_carro = @Id_carro
        
        -- Contar partes instaladas por categorias distintas
        SELECT @PartesInstaladas = COUNT(DISTINCT P.Id_categoria) FROM ESTRUCTURA_CARRO EC JOIN PARTE P ON EC.Id_parte = P.Id_parte WHERE EC.Id_carro = @Id_carro
        
        -- Actualizar Finalizado
        UPDATE CARRO SET Finalizado = CASE WHEN @PartesInstaladas = 5 THEN 1 ELSE 0 END WHERE Id_carro = @Id_carro
        
        COMMIT TRANSACTION
        
        SELECT @M_total = M_total, @A_total = A_total, @P_total = P_total FROM CARRO WHERE Id_carro = @Id_carro
        
        SET @Resultado = 'Parte instalada exitosamente. Parte: ' + @NombreParte + ' (' + @NombreCategoria + '). ' +
                        'Totales - P: ' + CAST(@P_total AS VARCHAR) + ', A: ' + CAST(@A_total AS VARCHAR) + ', M: ' + CAST(@M_total AS VARCHAR) + '. ' +
                        'Partes instaladas: ' + CAST(@PartesInstaladas AS VARCHAR) + '/5'
        RETURN 0
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
        SET @Resultado = 'Error: ' + ERROR_MESSAGE()
        RETURN -2
    END CATCH
END
GO

-- =============================================
-- SP_DesinstalarParteDelCarro
-- Desinstala una parte del carro y la devuelve al inventario
-- =============================================
CREATE OR ALTER PROCEDURE dbo.SP_DesinstalarParteDelCarro
    @Id_carro INT,
    @Id_parte INT,
    @Resultado VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON
    SET XACT_ABORT ON
    
    DECLARE @Id_equipo INT
    DECLARE @NombreParte VARCHAR(50)
    DECLARE @NombreCategoria VARCHAR(50)
    DECLARE @M_total INT
    DECLARE @A_total INT
    DECLARE @P_total INT
    DECLARE @PartesInstaladas INT
    
    BEGIN TRY
        -- VALIDACION 1: Verificar que el carro existe
        IF NOT EXISTS (SELECT 1 FROM CARRO WHERE Id_carro = @Id_carro)
        BEGIN
            SET @Resultado = 'Error: El carro no existe'
            RETURN -1
        END
        
        -- Obtener el equipo del carro
        SELECT @Id_equipo = Id_equipo FROM CARRO WHERE Id_carro = @Id_carro
        
        -- VALIDACION 2: Verificar que la parte esta instalada en el carro
        IF NOT EXISTS (SELECT 1 FROM ESTRUCTURA_CARRO WHERE Id_carro = @Id_carro AND Id_parte = @Id_parte)
        BEGIN
            SET @Resultado = 'Error: La parte no esta instalada en este carro'
            RETURN -1
        END
        
        -- Obtener datos de la parte
        SELECT @NombreParte = p.Nombre, @NombreCategoria = c.Nombre
        FROM PARTE p
        LEFT JOIN CATEGORIA c ON p.Id_categoria = c.Id_categoria
        WHERE p.Id_parte = @Id_parte
        
        -- TRANSACCION
        BEGIN TRANSACTION
        
        -- 1. Eliminar de ESTRUCTURA_CARRO
        DELETE FROM ESTRUCTURA_CARRO WHERE Id_carro = @Id_carro AND Id_parte = @Id_parte
        
        -- 2. Devolver al inventario del equipo
        IF EXISTS (SELECT 1 FROM INVENTARIO_EQUIPO WHERE Id_equipo = @Id_equipo AND Id_parte = @Id_parte)
        BEGIN
            UPDATE INVENTARIO_EQUIPO SET Cantidad = Cantidad + 1
            WHERE Id_equipo = @Id_equipo AND Id_parte = @Id_parte
        END
        ELSE
        BEGIN
            INSERT INTO INVENTARIO_EQUIPO (Id_equipo, Id_parte, Cantidad) VALUES (@Id_equipo, @Id_parte, 1)
        END
        
        -- 3. Recalcular totales del carro
        UPDATE CARRO SET
            P_total = ISNULL((SELECT SUM(p.Potencia) FROM ESTRUCTURA_CARRO ec JOIN PARTE p ON ec.Id_parte = p.Id_parte WHERE ec.Id_carro = @Id_carro), 0),
            A_total = ISNULL((SELECT SUM(p.Aerodinamica) FROM ESTRUCTURA_CARRO ec JOIN PARTE p ON ec.Id_parte = p.Id_parte WHERE ec.Id_carro = @Id_carro), 0),
            M_total = ISNULL((SELECT SUM(p.Manejo) FROM ESTRUCTURA_CARRO ec JOIN PARTE p ON ec.Id_parte = p.Id_parte WHERE ec.Id_carro = @Id_carro), 0),
            Finalizado = 0
        WHERE Id_carro = @Id_carro
        
        COMMIT TRANSACTION
        
        -- Obtener totales y partes
        SELECT @M_total = M_total, @A_total = A_total, @P_total = P_total FROM CARRO WHERE Id_carro = @Id_carro
        SELECT @PartesInstaladas = COUNT(*) FROM ESTRUCTURA_CARRO WHERE Id_carro = @Id_carro
        
        SET @Resultado = 'Parte desinstalada. ' + @NombreParte + ' devuelta al inventario. ' +
                        'Totales - P: ' + CAST(@P_total AS VARCHAR) + ', A: ' + CAST(@A_total AS VARCHAR) +
                        ', M: ' + CAST(@M_total AS VARCHAR) + '. Partes: ' + CAST(@PartesInstaladas AS VARCHAR) + '/5'
        
        RETURN 0
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
        SET @Resultado = 'Error: ' + ERROR_MESSAGE()
        RETURN -2
    END CATCH
END
GO

-- =============================================
-- SP_ReemplazarParteEnCarro
-- Reemplaza una parte por otra de la misma categoría
-- =============================================
CREATE OR ALTER PROCEDURE dbo.SP_ReemplazarParteEnCarro
    @Id_carro INT,
    @Id_parte_nueva INT,
    @Resultado VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON
    SET XACT_ABORT ON
    
    DECLARE @Id_equipo INT
    DECLARE @Id_categoria_nueva INT
    DECLARE @Id_parte_vieja INT
    DECLARE @NombreParteNueva VARCHAR(50)
    DECLARE @NombreParteVieja VARCHAR(50)
    DECLARE @NombreCategoria VARCHAR(50)
    DECLARE @CantidadDisponible INT
    DECLARE @M_total INT
    DECLARE @A_total INT
    DECLARE @P_total INT
    DECLARE @PartesInstaladas INT
    
    BEGIN TRY
        -- VALIDACION 1: Verificar que el carro existe
        IF NOT EXISTS (SELECT 1 FROM CARRO WHERE Id_carro = @Id_carro)
        BEGIN
            SET @Resultado = 'Error: El carro no existe'
            RETURN -1
        END
        
        -- Obtener el equipo del carro
        SELECT @Id_equipo = Id_equipo FROM CARRO WHERE Id_carro = @Id_carro
        
        -- VALIDACION 2: Verificar que la parte nueva existe
        SELECT @Id_categoria_nueva = Id_categoria, @NombreParteNueva = Nombre
        FROM PARTE WHERE Id_parte = @Id_parte_nueva
        
        IF @Id_categoria_nueva IS NULL
        BEGIN
            SET @Resultado = 'Error: La parte nueva no existe'
            RETURN -1
        END
        
        -- Obtener nombre de categoría
        SELECT @NombreCategoria = Nombre FROM CATEGORIA WHERE Id_categoria = @Id_categoria_nueva
        
        -- VALIDACION 3: Verificar que el equipo tiene la parte en inventario
        SELECT @CantidadDisponible = Cantidad
        FROM INVENTARIO_EQUIPO
        WHERE Id_equipo = @Id_equipo AND Id_parte = @Id_parte_nueva
        
        IF @CantidadDisponible IS NULL OR @CantidadDisponible < 1
        BEGIN
            SET @Resultado = 'Error: El equipo no tiene la parte "' + @NombreParteNueva + '" en inventario'
            RETURN -1
        END
        
        -- Buscar si hay parte instalada de la misma categoría
        SELECT @Id_parte_vieja = ec.Id_parte, @NombreParteVieja = p.Nombre
        FROM ESTRUCTURA_CARRO ec
        INNER JOIN PARTE p ON ec.Id_parte = p.Id_parte
        WHERE ec.Id_carro = @Id_carro AND p.Id_categoria = @Id_categoria_nueva
        
        -- TRANSACCION
        BEGIN TRANSACTION
        
        -- Si hay parte vieja, desinstalarla y devolverla al inventario
        IF @Id_parte_vieja IS NOT NULL
        BEGIN
            DELETE FROM ESTRUCTURA_CARRO WHERE Id_carro = @Id_carro AND Id_parte = @Id_parte_vieja
            
            IF EXISTS (SELECT 1 FROM INVENTARIO_EQUIPO WHERE Id_equipo = @Id_equipo AND Id_parte = @Id_parte_vieja)
            BEGIN
                UPDATE INVENTARIO_EQUIPO SET Cantidad = Cantidad + 1
                WHERE Id_equipo = @Id_equipo AND Id_parte = @Id_parte_vieja
            END
            ELSE
            BEGIN
                INSERT INTO INVENTARIO_EQUIPO (Id_equipo, Id_parte, Cantidad) VALUES (@Id_equipo, @Id_parte_vieja, 1)
            END
        END
        
        -- Instalar la parte nueva
        INSERT INTO ESTRUCTURA_CARRO (Id_carro, Id_parte) VALUES (@Id_carro, @Id_parte_nueva)
        
        -- Restar del inventario
        UPDATE INVENTARIO_EQUIPO SET Cantidad = Cantidad - 1
        WHERE Id_equipo = @Id_equipo AND Id_parte = @Id_parte_nueva
        
        -- Eliminar si queda en 0
        DELETE FROM INVENTARIO_EQUIPO WHERE Id_equipo = @Id_equipo AND Id_parte = @Id_parte_nueva AND Cantidad <= 0
        
        -- Recalcular totales del carro
        UPDATE CARRO SET
            P_total = ISNULL((SELECT SUM(p.Potencia) FROM ESTRUCTURA_CARRO ec JOIN PARTE p ON ec.Id_parte = p.Id_parte WHERE ec.Id_carro = @Id_carro), 0),
            A_total = ISNULL((SELECT SUM(p.Aerodinamica) FROM ESTRUCTURA_CARRO ec JOIN PARTE p ON ec.Id_parte = p.Id_parte WHERE ec.Id_carro = @Id_carro), 0),
            M_total = ISNULL((SELECT SUM(p.Manejo) FROM ESTRUCTURA_CARRO ec JOIN PARTE p ON ec.Id_parte = p.Id_parte WHERE ec.Id_carro = @Id_carro), 0)
        WHERE Id_carro = @Id_carro
        
        -- Verificar si el carro está completo
        SELECT @PartesInstaladas = COUNT(DISTINCT p.Id_categoria)
        FROM ESTRUCTURA_CARRO ec
        JOIN PARTE p ON ec.Id_parte = p.Id_parte
        WHERE ec.Id_carro = @Id_carro
        
        UPDATE CARRO SET Finalizado = CASE WHEN @PartesInstaladas = 5 THEN 1 ELSE 0 END
        WHERE Id_carro = @Id_carro
        
        COMMIT TRANSACTION
        
        -- Obtener totales actualizados
        SELECT @M_total = M_total, @A_total = A_total, @P_total = P_total FROM CARRO WHERE Id_carro = @Id_carro
        
        -- Mensaje de éxito
        IF @Id_parte_vieja IS NOT NULL
        BEGIN
            SET @Resultado = 'Parte reemplazada. ' + @NombreParteVieja + ' -> ' + @NombreParteNueva + '. ' +
                            'Totales - P: ' + CAST(@P_total AS VARCHAR) + ', A: ' + CAST(@A_total AS VARCHAR) +
                            ', M: ' + CAST(@M_total AS VARCHAR) + '. Partes: ' + CAST(@PartesInstaladas AS VARCHAR) + '/5'
        END
        ELSE
        BEGIN
            SET @Resultado = 'Parte instalada: ' + @NombreParteNueva + ' (' + @NombreCategoria + '). ' +
                            'Totales - P: ' + CAST(@P_total AS VARCHAR) + ', A: ' + CAST(@A_total AS VARCHAR) +
                            ', M: ' + CAST(@M_total AS VARCHAR) + '. Partes: ' + CAST(@PartesInstaladas AS VARCHAR) + '/5'
        END
        
        RETURN 0
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
        SET @Resultado = 'Error: ' + ERROR_MESSAGE()
        RETURN -2
    END CATCH
END
GO
