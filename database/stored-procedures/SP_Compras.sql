
-- CREACIÓN DEL STORED PROCEDURE RealizarCompra

CREATE PROCEDURE dbo.SP_RealizarCompra
-- PARÁMETROS DE ENTRADA:
    @Id_equipo INT, -- ID del equipo que realiza la compra
    @Id_parte INT, -- ID de la parte a comprar
    @Cantidad INT, -- Cantidad de 
unidades a comprar

    -- PARÁMETROS DE SALIDA:
     -- OUTPUT: indica que este parámetro devuelve un valor al llamador
     -- VARCHAR(500): cadena de texto de máximo 500 caracteres
    @Resultado VARCHAR(500) OUTPUT, 
    @Id_pedido_generado INT OUTPUT
 -- ID del pedido creado (si fue exitoso)
AS
BEGIN

-- SET NOCOUNT ON: desactiva el mensaje "X filas afectadas"
-- Mejora el rendimiento porque no envía ese mensaje por cada operación
    SET NOCOUNT ON

-- SET XACT_ABORT ON: si ocurre un error en una tra
nsacción, la revierte automáticamente
-- XACT = transaction (transacción)
-- ABORT = abortar/cancelar
-- Esto evita que queden datos inconsistentes si algo falla
    SET XACT_ABORT ON
    
    -- Variables para cálculos y validaciones
    
    -- Variable
 para almacenar cuántas unidades hay disponibles en la tienda
    DECLARE @StockDisponible INT

    -- Variable para almacenar el precio unitario de la parte
    -- MONEY: tipo de dato especial para valores monetarios
    DECLARE @PrecioUnitario MONEY

  
  -- Variable para almacenar el costo total de la compra
    -- Se calcula como: @PrecioUnitario * @Cantidad
    DECLARE @CostoTotal MONEY

    -- Variable para almacenar el presupuesto disponible del equipo
    -- Se obtiene de la función fn_CalcularPres
upuestoEquipo
    DECLARE @PresupuestoDisponible MONEY

    -- Variable para almacenar el nombre del equipo
    -- VARCHAR(50): cadena de texto de máximo 50 caracteres
    DECLARE @NombreEquipo VARCHAR(50)

    -- Variable para almacenar el nombre de la p
arte
    DECLARE @NombreParte VARCHAR(50)
    
    BEGIN TRY

        -- VALIDACIONES INICIALES
        -- Antes de hacer la compra, verificar que todos los datos sean válidos

        -- La cantidad debe ser positiva
        IF @Cantidad <= 0
        BEG
IN

            -- SET: asigna un valor a una variable
            -- Construir mensaje de error
            SET @Resultado = 'Error la cantidad debe ser mayor a cero'
            
            -- RETURN: termina la ejecución del SP inmediatamente
        
    RETURN -1
        END
        
        -- Verificar que el equipo existe

        -- NOT EXISTS: verifica que NO exista un registro
        -- SELECT 1: selecciona un valor constante (1) si encuentra registros
        --   No necesitamos los datos, so
lo saber si existe
        --   SELECT 1 es más eficiente que SELECT *
        -- FROM EQUIPO: de la tabla EQUIPO
        -- WHERE Id_equipo = @Id_equipo: filtrar por el ID especificado
        IF NOT EXISTS (SELECT 1 FROM EQUIPO WHERE Id_equipo = @Id_equ
ipo)
        BEGIN

        -- CAST: convierte un tipo de dato a otro
        -- CAST(@Id_equipo AS VARCHAR): convierte el número a texto
        -- Necesario para concatenar con el mensaje
            SET @Resultado = 'Error: El equipo con ID ' + CAST(@I
d_equipo AS VARCHAR) + ' no existe'
            RETURN -1
        END
        
        -- Obtener el nombre del equipo para incluirlo en mensajes
        SELECT @NombreEquipo = Nombre FROM EQUIPO WHERE Id_equipo = @Id_equipo
        
        -- Verificar 
que la parte existe
        IF NOT EXISTS (SELECT 1 FROM PARTE WHERE Id_parte = @Id_parte)
        BEGIN
            SET @Resultado = 'Error: La parte con ID ' + CAST(@Id_parte AS VARCHAR) + ' no existe'
            RETURN -1
        END
        
        
-- Obtener precio y nombre de la parte
        SELECT 

            -- @PrecioUnitario: asigna el valor de la columna Precio a la variable
            @PrecioUnitario = Precio, 

            -- @NombreParte =: asigna el valor de la columna Nombre a la var
iable
            @NombreParte = Nombre

        FROM PARTE 
        WHERE Id_parte = @Id_parte
        
        -- Verificar que hay stock suficiente

        -- SELECT para obtener el stock disponible
        -- ISNULL(Stock_total, 0): si Stock_total es
 NULL, retorna 0
        SELECT @StockDisponible = ISNULL(Stock_total, 0)
        FROM INVENTARIO_TOTAL
        WHERE Id_parte = @Id_parte
        
        -- Comparar stock disponible con cantidad solicitada
        IF @StockDisponible < @Cantidad
      
  BEGIN
            SET @Resultado = 'Error: Stock insuficiente. Disponible: ' + CAST(@StockDisponible AS VARCHAR) + 
                           ', Solicitado: ' + CAST(@Cantidad AS VARCHAR)
            RETURN -1
        END
        
        -- PASO 2: VA
LIDAR PRESUPUESTO
        
        -- Calcular costo total
        SET @CostoTotal = @PrecioUnitario * @Cantidad
        
        -- Obtener presupuesto disponible usando la función que ya existe
        -- dbo.fn_CalcularPresupuestoEquipo: llamada a la f
unción que creamos 
        -- Esta función calcula: Total_Aportes - Total_Gastos
        -- (@Id_equipo): parámetro que se pasa a la función
        -- El resultado se asigna a @PresupuestoDisponible
        SET @PresupuestoDisponible = dbo.fn_CalcularPr
esupuestoEquipo(@Id_equipo)
        
        -- Verificar que el equipo tiene presupuesto suficiente

        -- Comparar presupuesto disponible con costo total
        IF @PresupuestoDisponible < @CostoTotal
        BEGIN
            SET @Resultado = 'Er
ror: Presupuesto insuficiente. ' +
                           'Disponible: $' + CAST(@PresupuestoDisponible AS VARCHAR) + 
                           ', Requerido: $' + CAST(@CostoTotal AS VARCHAR)
            RETURN -1
        END
        
        -- REA
LIZAR LA COMPRA (TRANSACCIÓN)
        
        -- BEGIN TRANSACTION: inicia una transacción https://www.geeksforgeeks.org/sql/sql-transactions/
        -- TRANSACCIÓN: conjunto de operaciones que se ejecutan como una unidad
        --   Si TODAS tienen éx
ito ? COMMIT (confirmar)
        --   Si ALGUNA falla ? ROLLBACK (revertir todo)
        -- Esto garantiza consistencia de datos
        BEGIN TRANSACTION
        
        -- Crear el PEDIDO
        INSERT INTO PEDIDO (Fecha_adquisicion, Id_equipo, Costo_
total)
        VALUES (GETDATE(), @Id_equipo, @CostoTotal)
        
        SET @Id_pedido_generado = SCOPE_IDENTITY()
        
        -- Crear el DETALLE_PEDIDO
        INSERT INTO DETALLE_PEDIDO (Id_pedido, Id_parte, Cantidad_pedido, Precio_unitario)
 
       VALUES (@Id_pedido_generado, @Id_parte, @Cantidad, @PrecioUnitario)
        
        -- Actualizar INVENTARIO_TOTAL (restar stock)
        UPDATE INVENTARIO_TOTAL
        SET Stock_total = Stock_total - @Cantidad
        WHERE Id_parte = @Id_parte

        
        -- Actualizar INVENTARIO_EQUIPO
        IF EXISTS (SELECT 1 FROM INVENTARIO_EQUIPO 
                   WHERE Id_equipo = @Id_equipo AND Id_parte = @Id_parte)
        BEGIN
            -- Ya tiene, sumar cantidad
            UPDATE INVENTA
RIO_EQUIPO
            SET Cantidad = Cantidad + @Cantidad
            WHERE Id_equipo = @Id_equipo AND Id_parte = @Id_parte
        END
        ELSE
        BEGIN
            -- No tiene, crear registro
            INSERT INTO INVENTARIO_EQUIPO (Id_equip
o, Id_parte, Cantidad)
            VALUES (@Id_equipo, @Id_parte, @Cantidad)
        END
        
        -- Registrar en COMPRA (auditoría)
        INSERT INTO COMPRA (Cantidad, Fecha_adquisicion, Id_equipo, Id_parte)
        VALUES (@Cantidad, GETDATE()
, @Id_equipo, @Id_parte)
 
         -- COMMIT TRANSACTION: confirma todos los cambios
        -- Si llegamos hasta aquí sin errores:
        --   Se creó el PEDIDO
        --   Se creó el DETALLE_PEDIDO
        --   Se actualizó INVENTARIO_TOTAL (restó st
ock)
        --   Se actualizó INVENTARIO_EQUIPO (sumó al equipo)
        --   Se registró en COMPRA
        -- COMMIT hace que todos estos cambios sean permanentes
        COMMIT TRANSACTION
        
        -- MENSAJE DE ÉXITO
        
        DECLARE @
NuevoPresupuesto MONEY
        SET @NuevoPresupuesto = dbo.fn_CalcularPresupuestoEquipo(@Id_equipo)
        
        SET @Resultado = 'Compra realizada exitosamente. ' +
                        'Equipo: ' + @NombreEquipo + '. ' +
                        '
Parte: ' + @NombreParte + '. ' +
                        'Cantidad: ' + CAST(@Cantidad AS VARCHAR) + '. ' +
                        'Costo total: $' + CAST(@CostoTotal AS VARCHAR) + '. ' +
                        'Presupuesto restante: $' + CAST(@NuevoPre
supuesto AS VARCHAR) + '. ' +
                        'ID Pedido: ' + CAST(@Id_pedido_generado AS VARCHAR)
        
        RETURN 0
        
    END TRY
    BEGIN CATCH

        -- @@TRANCOUNT: variable del sistema que indica cuántas transacciones activa
s hay > 0 hay al menos una transacción activa
        IF @@TRANCOUNT > 0
            -- ROLLBACK TRANSACTION: revierte TODOS los cambios de la transacción
            -- Es como un "deshacer" (undo) de todo lo que se hizo desde BEGIN TRANSACTION
         
   -- Esto garantiza que si algo falla, la base de datos queda como estaba antes
            ROLLBACK TRANSACTION
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        DECLARE @ErrorLine INT = ERROR_LINE()
        
        SET @R
esultado = 'Error en transacción: ' + @ErrorMessage + 
                        ' (Línea: ' + CAST(@ErrorLine AS VARCHAR) + ')'
        
        RETURN -2
    END CATCH
END
