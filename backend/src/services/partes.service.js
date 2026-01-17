const { getConnection, sql } = require('../config/database');

const partesService = {
    async getAll() {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT 
                p.Id_parte, p.Nombre, p.Marca,
                p.Manejo, p.Aerodinamica, p.Potencia, p.Precio,
                p.Id_categoria, c.Nombre as Categoria
            FROM PARTE p
            LEFT JOIN CATEGORIA c ON p.Id_categoria = c.Id_categoria
            ORDER BY p.Id_categoria, p.Id_parte
        `);
        return result.recordset;
    },

    async getById(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT p.*, c.Nombre as Categoria
                FROM PARTE p
                LEFT JOIN CATEGORIA c ON p.Id_categoria = c.Id_categoria
                WHERE p.Id_parte = @id
            `);
        return result.recordset[0];
    },

    async getByCategoria(idCategoria) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idCategoria', sql.Int, idCategoria)
            .query(`
                SELECT p.*, c.Nombre as Categoria
                FROM PARTE p
                LEFT JOIN CATEGORIA c ON p.Id_categoria = c.Id_categoria
                WHERE p.Id_categoria = @idCategoria
                ORDER BY p.Id_parte
            `);
        return result.recordset;
    },

    async getCategorias() {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT Id_categoria, Nombre
            FROM CATEGORIA
            ORDER BY Id_categoria
        `);
        return result.recordset;
    },

    async getInventarioTotal() {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT 
                p.Id_parte, p.Nombre, p.Marca,
                p.Manejo, p.Aerodinamica, p.Potencia, p.Precio,
                p.Id_categoria, c.Nombre as Categoria,
                ISNULL(it.Stock_total, 0) as Stock_total
            FROM PARTE p
            LEFT JOIN CATEGORIA c ON p.Id_categoria = c.Id_categoria
            LEFT JOIN INVENTARIO_TOTAL it ON p.Id_parte = it.Id_parte
            ORDER BY p.Id_categoria, p.Id_parte
        `);
        return result.recordset;
    },

    async getInventario(idEquipo) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idEquipo', sql.Int, idEquipo)
            .query(`
                SELECT 
                    ie.Id_equipo, ie.Id_parte, ie.Cantidad,
                    p.Nombre, p.Marca, p.Manejo, p.Aerodinamica,
                    p.Potencia, p.Precio, p.Id_categoria,
                    c.Nombre as Categoria
                FROM INVENTARIO_EQUIPO ie
                INNER JOIN PARTE p ON ie.Id_parte = p.Id_parte
                LEFT JOIN CATEGORIA c ON p.Id_categoria = c.Id_categoria
                WHERE ie.Id_equipo = @idEquipo AND ie.Cantidad > 0
                ORDER BY p.Id_categoria, p.Id_parte
            `);
        return result.recordset;
    },

    async comprar(idEquipo, idParte, cantidad) {
        const pool = await getConnection();
        
        try {
            const result = await pool.request()
                .input('Id_equipo', sql.Int, idEquipo)
                .input('Id_parte', sql.Int, idParte)
                .input('Cantidad', sql.Int, cantidad)
                .output('Resultado', sql.VarChar(500))
                .output('Id_pedido_generado', sql.Int)
                .execute('SP_RealizarCompra');
            
            const mensaje = result.output.Resultado;
            const idPedido = result.output.Id_pedido_generado;
            const returnValue = result.returnValue;
            
            if (returnValue === 0 && idPedido) {
                return { success: true, mensaje, idPedido };
            } else {
                return { success: false, mensaje: mensaje || 'Error en la compra' };
            }
        } catch (error) {
            console.error('Error en compra:', error);
            throw new Error(error.message || 'Error al realizar la compra');
        }
    },

    async verificarDisponibilidad(idEquipo, idParte, cantidad) {
        const pool = await getConnection();
        
        try {
            const result = await pool.request()
                .input('idEquipo', sql.Int, idEquipo)
                .input('idParte', sql.Int, idParte)
                .input('cantidad', sql.Int, cantidad)
                .query(`
                    DECLARE @Precio DECIMAL(18,2)
                    DECLARE @Stock INT
                    DECLARE @Presupuesto DECIMAL(18,2)
                    DECLARE @Total DECIMAL(18,2)
                    
                    SELECT @Precio = Precio FROM PARTE WHERE Id_parte = @idParte
                    SELECT @Stock = ISNULL(Stock_total, 0) FROM INVENTARIO_TOTAL WHERE Id_parte = @idParte
                    SET @Presupuesto = dbo.fn_CalcularPresupuestoEquipo(@idEquipo)
                    SET @Total = @Precio * @cantidad
                    
                    SELECT 
                        @Precio as Precio,
                        @Stock as StockDisponible,
                        @Presupuesto as PresupuestoDisponible,
                        @Total as Total,
                        @cantidad as Cantidad,
                        CASE 
                            WHEN @Stock >= @cantidad AND @Presupuesto >= @Total THEN 1
                            ELSE 0
                        END as PuedeComprar,
                        CASE 
                            WHEN @Stock < @cantidad THEN 'Stock insuficiente'
                            WHEN @Presupuesto < @Total THEN 'Presupuesto insuficiente'
                            ELSE 'OK'
                        END as Mensaje
                `);
            
            return result.recordset[0];
        } catch (error) {
            console.error('Error verificando disponibilidad:', error);
            throw new Error('Error al verificar disponibilidad');
        }
    },

    async create({ nombre, marca, manejo, aerodinamica, potencia, precio, idCategoria }) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('marca', sql.NVarChar, marca)
            .input('manejo', sql.TinyInt, manejo || 0)
            .input('aerodinamica', sql.TinyInt, aerodinamica || 0)
            .input('potencia', sql.TinyInt, potencia || 0)
            .input('precio', sql.Decimal(18, 2), precio)
            .input('idCategoria', sql.Int, idCategoria)
            .query(`
                INSERT INTO PARTE (Nombre, Marca, Manejo, Aerodinamica, Potencia, Precio, Id_categoria)
                OUTPUT INSERTED.*
                VALUES (@nombre, @marca, @manejo, @aerodinamica, @potencia, @precio, @idCategoria)
            `);
        return result.recordset[0];
    },

    async update(id, { nombre, marca, manejo, aerodinamica, potencia, precio, idCategoria }) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('nombre', sql.NVarChar, nombre)
            .input('marca', sql.NVarChar, marca)
            .input('manejo', sql.TinyInt, manejo)
            .input('aerodinamica', sql.TinyInt, aerodinamica)
            .input('potencia', sql.TinyInt, potencia)
            .input('precio', sql.Decimal(18, 2), precio)
            .input('idCategoria', sql.Int, idCategoria)
            .query(`
                UPDATE PARTE 
                SET Nombre = @nombre, Marca = @marca, Manejo = @manejo, 
                    Aerodinamica = @aerodinamica, Potencia = @potencia, 
                    Precio = @precio, Id_categoria = @idCategoria
                OUTPUT INSERTED.*
                WHERE Id_parte = @id
            `);
        return result.recordset[0];
    },

    async delete(id) {
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM PARTE WHERE Id_parte = @id');
        return true;
    }
};

module.exports = partesService;
