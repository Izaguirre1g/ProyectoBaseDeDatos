const { getConnection, sql } = require('../config/database');

const equiposService = {
    /**
     * ============================================
     * CONSULTAS BÁSICAS
     * ============================================
     */
    async getAll() {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT 
                e.Id_equipo,
                e.Nombre,
                dbo.fn_CalcularPresupuestoEquipo(e.Id_equipo) as Presupuesto,
                (SELECT COUNT(*) FROM USUARIO WHERE Id_equipo = e.Id_equipo) as Miembros,
                (SELECT COUNT(*) FROM CARRO WHERE Id_equipo = e.Id_equipo) as Carros
            FROM EQUIPO e
            ORDER BY e.Id_equipo
        `);
        return result.recordset;
    },

    async getById(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT 
                    e.Id_equipo,
                    e.Nombre,
                    dbo.fn_CalcularPresupuestoEquipo(e.Id_equipo) as Presupuesto
                FROM EQUIPO e
                WHERE e.Id_equipo = @id
            `);
        return result.recordset[0];
    },

    /**
     * ============================================
     * MÉTODO CLAVE: getPresupuesto()
     * Obtener presupuesto detallado
     * ============================================
     * Retorna:
     * - Presupuesto total disponible
     * - Total de aportes
     * - Total de gastos
     */
    async getPresupuesto(idEquipo) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idEquipo', sql.Int, idEquipo)
            .query(`
                DECLARE @Presupuesto DECIMAL(18,2)
                DECLARE @TotalAportes DECIMAL(18,2)
                DECLARE @TotalGastos DECIMAL(18,2)
                
                -- Calcular presupuesto
                SET @Presupuesto = dbo.fn_CalcularPresupuestoEquipo(@idEquipo)
                
                -- Calcular aportes
                SELECT @TotalAportes = ISNULL(SUM(Monto), 0)
                FROM APORTE
                WHERE Id_equipo = @idEquipo
                
                -- Calcular gastos (de PEDIDO)
                SELECT @TotalGastos = ISNULL(SUM(Costo_total), 0)
                FROM PEDIDO
                WHERE Id_equipo = @idEquipo
                
                SELECT 
                    @Presupuesto as Presupuesto,
                    @TotalAportes as TotalAportes,
                    @TotalGastos as TotalGastos
            `);
        return result.recordset[0];
    },

    /**
     * ============================================
     * MÉTODO: getAportes()
     * Obtener lista de aportes del equipo
     * ============================================
     */
    async getAportes(idEquipo) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idEquipo', sql.Int, idEquipo)
            .query(`
                SELECT 
                    a.Id_aporte,
                    a.Monto,
                    a.Fecha,
                    a.Id_patrocinador,
                    p.Nombre as Patrocinador
                FROM APORTE a
                LEFT JOIN PATROCINADOR p ON a.Id_patrocinador = p.Id_patrocinador
                WHERE a.Id_equipo = @idEquipo
                ORDER BY a.Fecha DESC
            `);
        return result.recordset;
    },

    /**
     * ============================================
     * MÉTODO: addAporte()
     * Agregar un nuevo aporte
     * ============================================
     */
    async addAporte({ idEquipo, monto, nombrePatrocinador }) {
        const pool = await getConnection();
        
        try {
            const transaction = pool.transaction();
            await transaction.begin();
            
            try {
                // 1. Buscar o crear patrocinador
                let idPatrocinador;
                const patrocinadorResult = await transaction.request()
                    .input('nombre', sql.NVarChar, nombrePatrocinador)
                    .query(`
                        SELECT Id_patrocinador FROM PATROCINADOR WHERE Nombre = @nombre
                    `);
                
                if (patrocinadorResult.recordset.length > 0) {
                    idPatrocinador = patrocinadorResult.recordset[0].Id_patrocinador;
                } else {
                    const nuevoPatrocinador = await transaction.request()
                        .input('nombre', sql.NVarChar, nombrePatrocinador)
                        .query(`
                            INSERT INTO PATROCINADOR (Nombre)
                            OUTPUT INSERTED.Id_patrocinador
                            VALUES (@nombre)
                        `);
                    idPatrocinador = nuevoPatrocinador.recordset[0].Id_patrocinador;
                }
                
                // 2. Crear el aporte
                const aporteResult = await transaction.request()
                    .input('monto', sql.Decimal(18, 2), monto)
                    .input('fecha', sql.Date, new Date())
                    .input('idEquipo', sql.Int, idEquipo)
                    .input('idPatrocinador', sql.Int, idPatrocinador)
                    .query(`
                        INSERT INTO APORTE (Monto, Fecha, Id_equipo, Id_patrocinador)
                        OUTPUT INSERTED.*
                        VALUES (@monto, @fecha, @idEquipo, @idPatrocinador)
                    `);
                
                await transaction.commit();
                
                return aporteResult.recordset[0];
                
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
            
        } catch (error) {
            console.error('Error al agregar aporte:', error);
            throw new Error('Error al agregar aporte: ' + error.message);
        }
    },

    /**
     * ============================================
     * MÉTODO: getPatrocinadores()
     * Obtener patrocinadores del equipo con totales
     * ============================================
     */
    async getPatrocinadores(idEquipo) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idEquipo', sql.Int, idEquipo)
            .query(`
                SELECT 
                    p.Id_patrocinador,
                    p.Nombre,
                    COUNT(a.Id_aporte) as TotalAportes,
                    SUM(a.Monto) as MontoTotal
                FROM PATROCINADOR p
                INNER JOIN APORTE a ON p.Id_patrocinador = a.Id_patrocinador
                WHERE a.Id_equipo = @idEquipo
                GROUP BY p.Id_patrocinador, p.Nombre
                ORDER BY MontoTotal DESC
            `);
        return result.recordset;
    },

    /**
     * ============================================
     * MÉTODO: getPilotos()
     * Obtener conductores del equipo
     * ============================================
     */
    async getPilotos(idEquipo) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idEquipo', sql.Int, idEquipo)
            .query(`
                SELECT 
                    u.Id_usuario,
                    u.Correo_usuario,
                    u.Id_rol,
                    r.Nombre as Rol
                FROM USUARIO u
                LEFT JOIN ROL r ON u.Id_rol = r.Id_rol
                WHERE u.Id_equipo = @idEquipo AND u.Id_rol = 3
                ORDER BY u.Correo_usuario
            `);
        return result.recordset;
    },

    /**
     * ============================================
     * MÉTODO: getCarros()
     * Obtener carros del equipo
     * ============================================
     */
    async getCarros(idEquipo) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idEquipo', sql.Int, idEquipo)
            .query(`
                SELECT 
                    c.Id_carro,
                    c.Finalizado,
                    c.M_total,
                    c.P_total,
                    c.A_total,
                    u.Correo_usuario as Conductor
                FROM CARRO c
                LEFT JOIN USUARIO u ON c.Id_conductor = u.Id_usuario
                WHERE c.Id_equipo = @idEquipo
                ORDER BY c.Id_carro
            `);
        return result.recordset;
    },

    /**
     * ============================================
     * MÉTODO: getInventario()
     * Obtener inventario del equipo
     * ============================================
     */
    async getInventario(idEquipo) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idEquipo', sql.Int, idEquipo)
            .query(`
                SELECT 
                    ie.Id_parte,
                    ie.Cantidad,
                    p.Nombre,
                    p.Marca,
                    p.Precio,
                    c.Nombre as Categoria
                FROM INVENTARIO_EQUIPO ie
                INNER JOIN PARTE p ON ie.Id_parte = p.Id_parte
                LEFT JOIN CATEGORIA c ON p.Id_categoria = c.Id_categoria
                WHERE ie.Id_equipo = @idEquipo AND ie.Cantidad > 0
                ORDER BY c.Id_categoria, p.Nombre
            `);
        return result.recordset;
    },

    // CRUD básico
    async create({ nombre }) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .query(`
                INSERT INTO EQUIPO (Nombre)
                OUTPUT INSERTED.*
                VALUES (@nombre)
            `);
        return result.recordset[0];
    },

    async update(id, { nombre }) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('nombre', sql.NVarChar, nombre)
            .query(`
                UPDATE EQUIPO
                SET Nombre = @nombre
                OUTPUT INSERTED.*
                WHERE Id_equipo = @id
            `);
        return result.recordset[0];
    },

    async delete(id) {
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM EQUIPO WHERE Id_equipo = @id');
        return true;
    }
};

module.exports = equiposService;

