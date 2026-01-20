USE [DB_F1_Garage_Manager]
GO

-- =============================================
-- SP_CrearCarro
-- Crea un nuevo carro para un equipo
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[SP_CrearCarro]
    @Id_equipo INT,
    @Id_conductor INT = NULL,
    @Id_carro INT OUTPUT,
    @Resultado VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON
    SET XACT_ABORT ON
    
    BEGIN TRY
        BEGIN TRANSACTION
        
        -- Validar que el equipo existe
        IF NOT EXISTS (SELECT 1 FROM EQUIPO WHERE Id_equipo = @Id_equipo)
        BEGIN
            SET @Resultado = 'Error: Equipo no encontrado'
            ROLLBACK TRANSACTION
            RETURN -1
        END
        
        -- Validar que el equipo no tenga más de 2 carros
        DECLARE @CarrosExistentes INT
        SELECT @CarrosExistentes = COUNT(*) FROM CARRO WHERE Id_equipo = @Id_equipo
        
        IF @CarrosExistentes >= 2
        BEGIN
            SET @Resultado = 'Error: El equipo ya tiene el máximo de 2 carros permitidos'
            ROLLBACK TRANSACTION
            RETURN -1
        END
        
        -- Si se proporciona conductor, validar que existe y pertenece al equipo
        IF @Id_conductor IS NOT NULL
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM USUARIO 
                WHERE Id_usuario = @Id_conductor 
                AND Id_equipo = @Id_equipo
                AND Id_rol = 3 -- Rol de Conductor
            )
            BEGIN
                SET @Resultado = 'Error: El conductor no existe o no pertenece a este equipo'
                ROLLBACK TRANSACTION
                RETURN -1
            END
            
            -- Validar que el conductor no tenga otro carro asignado
            IF EXISTS (SELECT 1 FROM CARRO WHERE Id_conductor = @Id_conductor)
            BEGIN
                SET @Resultado = 'Error: El conductor ya tiene un carro asignado'
                ROLLBACK TRANSACTION
                RETURN -1
            END
        END
        
        -- Crear el carro
        INSERT INTO CARRO (Id_equipo, Finalizado, M_total, P_total, A_total, Id_conductor)
        VALUES (@Id_equipo, 0, 0, 0, 0, @Id_conductor)
        
        SET @Id_carro = SCOPE_IDENTITY()
        
        -- Si hay conductor, crear registro en CONDUCTOR_CHASIS
        IF @Id_conductor IS NOT NULL
        BEGIN
            INSERT INTO CONDUCTOR_CHASIS (Id_usuario, Id_carro)
            VALUES (@Id_conductor, @Id_carro)
        END
        
        SET @Resultado = 'Carro creado exitosamente'
        
        COMMIT TRANSACTION
        RETURN 0
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION
            
        SET @Resultado = 'Error: ' + ERROR_MESSAGE()
        RETURN -1
    END CATCH
END
GO

-- =============================================
-- SP_AsignarConductor
-- Asigna o cambia el conductor de un carro
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[SP_AsignarConductor]
    @Id_carro INT,
    @Id_conductor INT,
    @Resultado VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON
    SET XACT_ABORT ON
    
    BEGIN TRY
        BEGIN TRANSACTION
        
        -- Validar que el carro existe
        DECLARE @Id_equipo INT
        SELECT @Id_equipo = Id_equipo FROM CARRO WHERE Id_carro = @Id_carro
        
        IF @Id_equipo IS NULL
        BEGIN
            SET @Resultado = 'Error: Carro no encontrado'
            ROLLBACK TRANSACTION
            RETURN -1
        END
        
        -- Validar que el conductor existe y pertenece al mismo equipo O no tiene equipo
        IF NOT EXISTS (
            SELECT 1 FROM USUARIO 
            WHERE Id_usuario = @Id_conductor 
            AND (Id_equipo = @Id_equipo OR Id_equipo IS NULL)
            AND Id_rol = 3 -- Rol de Conductor
        )
        BEGIN
            SET @Resultado = 'Error: El conductor no existe o no pertenece a este equipo'
            ROLLBACK TRANSACTION
            RETURN -1
        END
        
        -- Validar que el conductor no tenga otro carro asignado
        DECLARE @CarroExistente INT
        SELECT @CarroExistente = Id_carro FROM CARRO WHERE Id_conductor = @Id_conductor
        
        IF @CarroExistente IS NOT NULL AND @CarroExistente != @Id_carro
        BEGIN
            SET @Resultado = 'Error: El conductor ya tiene otro carro asignado'
            ROLLBACK TRANSACTION
            RETURN -1
        END
        
        -- Obtener el conductor anterior (si existe)
        DECLARE @ConductorAnterior INT
        SELECT @ConductorAnterior = Id_conductor FROM CARRO WHERE Id_carro = @Id_carro
        
        -- Actualizar el carro
        UPDATE CARRO
        SET Id_conductor = @Id_conductor
        WHERE Id_carro = @Id_carro
        
        -- Si el conductor no tenía equipo, asignarlo al equipo del carro
        UPDATE USUARIO
        SET Id_equipo = @Id_equipo
        WHERE Id_usuario = @Id_conductor AND Id_equipo IS NULL
        
        -- Eliminar relación anterior en CONDUCTOR_CHASIS (si existe)
        IF @ConductorAnterior IS NOT NULL
        BEGIN
            DELETE FROM CONDUCTOR_CHASIS 
            WHERE Id_carro = @Id_carro AND Id_usuario = @ConductorAnterior
        END
        
        -- Crear o actualizar relación en CONDUCTOR_CHASIS
        IF NOT EXISTS (SELECT 1 FROM CONDUCTOR_CHASIS WHERE Id_carro = @Id_carro AND Id_usuario = @Id_conductor)
        BEGIN
            INSERT INTO CONDUCTOR_CHASIS (Id_usuario, Id_carro)
            VALUES (@Id_conductor, @Id_carro)
        END
        
        SET @Resultado = 'Conductor asignado exitosamente'
        
        COMMIT TRANSACTION
        RETURN 0
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION
            
        SET @Resultado = 'Error: ' + ERROR_MESSAGE()
        RETURN -1
    END CATCH
END
GO

-- =============================================
-- SP_EliminarCarro
-- Elimina un carro y sus relaciones
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[SP_EliminarCarro]
    @Id_carro INT,
    @Resultado VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON
    SET XACT_ABORT ON
    
    BEGIN TRY
        BEGIN TRANSACTION
        
        -- Validar que el carro existe
        IF NOT EXISTS (SELECT 1 FROM CARRO WHERE Id_carro = @Id_carro)
        BEGIN
            SET @Resultado = 'Error: Carro no encontrado'
            ROLLBACK TRANSACTION
            RETURN -1
        END
        
        -- Eliminar resultados de simulaciones
        DELETE FROM RESULTADO WHERE Id_carro = @Id_carro
        
        -- Eliminar relación en CONDUCTOR_CHASIS
        DELETE FROM CONDUCTOR_CHASIS WHERE Id_carro = @Id_carro
        
        -- Eliminar estructura del carro
        DELETE FROM ESTRUCTURA_CARRO WHERE Id_carro = @Id_carro
        
        -- Eliminar el carro
        DELETE FROM CARRO WHERE Id_carro = @Id_carro
        
        SET @Resultado = 'Carro eliminado exitosamente'
        
        COMMIT TRANSACTION
        RETURN 0
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION
            
        SET @Resultado = 'Error: ' + ERROR_MESSAGE()
        RETURN -1
    END CATCH
END
GO
