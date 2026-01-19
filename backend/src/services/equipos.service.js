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
                Id_equipo,
                Nombre
            FROM EQUIPO
            ORDER BY Id_equipo
        `);
        
        // Ahora calcula presupuesto y otros datos en el código
        const equiposConDetalles = await Promise.all(result.recordset.map(async (equipo) => {
            try {
                const presupuesto = await this.getPresupuesto(equipo.Id_equipo);
                return {
                    ...equipo,
                    Presupuesto: presupuesto?.Presupuesto || 0,
                    Miembros: presupuesto?.Miembros || 0,
                    Carros: presupuesto?.Carros || 0
                };
            } catch (err) {
                // Si hay error, devuelve con valores por defecto
                return {
                    ...equipo,
                    Presupuesto: 0,
                    Miembros: 0,
                    Carros: 0
                };
            }
        }));
        
        return equiposConDetalles;
    },

    /**
     * Obtener equipos disponibles (sin ingeniero asignado)
     * Solo devuelve equipos que no tienen un usuario con rol Ingeniero
     */
    async getEquiposDisponibles() {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT DISTINCT
                e.Id_equipo,
                e.Nombre
            FROM EQUIPO e
            WHERE e.Id_equipo NOT IN (
                SELECT DISTINCT u.Id_equipo 
                FROM USUARIO u
                INNER JOIN ROL r ON u.Id_rol = r.Id_rol
                WHERE u.Id_equipo IS NOT NULL 
                AND r.Nombre = 'Ingeniero'
            )
            ORDER BY e.Nombre
        `);
        return result.recordset;
    },

    async getById(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                DECLARE @TotalAportes DECIMAL(18,2)
                DECLARE @TotalGastos DECIMAL(18,2)
                DECLARE @Presupuesto DECIMAL(18,2)
                
                SELECT @TotalAportes = ISNULL(SUM(ISNULL(Monto, 0)), 0)
                FROM APORTE
                WHERE Id_equipo = @id
                
                SELECT @TotalGastos = ISNULL(SUM(ISNULL(Costo_total, 0)), 0)
                FROM PEDIDO
                WHERE Id_equipo = @id
                
                SET @Presupuesto = @TotalAportes - @TotalGastos
                
                SELECT 
                    e.Id_equipo,
                    e.Nombre,
                    @Presupuesto as Presupuesto
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
        try {
            const result = await pool.request()
                .input('idEquipo', sql.Int, idEquipo)
                .query(`
                    DECLARE @TotalAportes DECIMAL(18,2)
                    DECLARE @TotalGastos DECIMAL(18,2)
                    DECLARE @Presupuesto DECIMAL(18,2)
                    
                    -- Calcular aportes
                    SELECT @TotalAportes = ISNULL(SUM(ISNULL(Monto, 0)), 0)
                    FROM APORTE
                    WHERE Id_equipo = @idEquipo
                    
                    -- Calcular gastos
                    SELECT @TotalGastos = ISNULL(SUM(ISNULL(Costo_total, 0)), 0)
                    FROM PEDIDO
                    WHERE Id_equipo = @idEquipo
                    
                    -- Presupuesto disponible
                    SET @Presupuesto = @TotalAportes - @TotalGastos
                    
                    SELECT 
                        @Presupuesto as Presupuesto,
                        @TotalAportes as TotalAportes,
                        @TotalGastos as TotalGastos
                `);
            return result.recordset[0];
        } catch (err) {
            console.log('Error en getPresupuesto:', err.message);
            return { Presupuesto: 0, TotalAportes: 0, TotalGastos: 0 };
        }
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
                    p.Nombre_patrocinador as Patrocinador
                FROM APORTE a
                LEFT JOIN PATROCINADOR p ON a.Id_patrocinador = p.Id_patrocinador
                WHERE a.Id_equipo = @idEquipo
                ORDER BY a.Fecha DESC
            `);
        return result.recordset;
    },

    /**
     * ============================================
     * MÉTODO: getGastos()
     * Obtener lista de gastos/pedidos del equipo
     * ============================================
     */
    async getGastos(idEquipo) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idEquipo', sql.Int, idEquipo)
            .query(`
                SELECT 
                    p.Id_pedido,
                    p.Fecha_adquisicion as Fecha,
                    p.Costo_total,
                    STRING_AGG(pa.Nombre, ', ') as Partes
                FROM PEDIDO p
                LEFT JOIN DETALLE_PEDIDO d ON p.Id_pedido = d.Id_pedido
                LEFT JOIN PARTE pa ON d.Id_parte = pa.Id_parte
                WHERE p.Id_equipo = @idEquipo
                GROUP BY p.Id_pedido, p.Fecha_adquisicion, p.Costo_total
                ORDER BY p.Fecha_adquisicion DESC
            `);
        return result.recordset;
    },

    /**
     * ============================================
     * MÉTODO: addAporte()
     * Agregar un nuevo aporte usando SP con transacción
     * ============================================
     */
    async addAporte({ idEquipo, monto, idPatrocinador, descripcion }) {
        const pool = await getConnection();
        
        console.log('💰 SERVICIO AGREGAR APORTE:');
        console.log('  idEquipo:', idEquipo);
        console.log('  monto:', monto);
        console.log('  idPatrocinador:', idPatrocinador);
        console.log('  descripcion:', descripcion);
        
        try {
            const result = await pool.request()
                .input('Id_equipo', sql.Int, idEquipo)
                .input('Monto', sql.Decimal(12, 4), monto)
                .input('Id_patrocinador', sql.Int, idPatrocinador)
                .input('Descripcion', sql.NVarChar(200), descripcion || null)
                .output('Resultado', sql.VarChar(500))
                .output('Id_aporte_generado', sql.Int)
                .execute('SP_AgregarAporte');
            
            const mensaje = result.output.Resultado;
            const idAporte = result.output.Id_aporte_generado;
            const returnValue = result.returnValue;
            
            console.log('Respuesta del SP:');
            console.log('  returnValue:', returnValue);
            console.log('  mensaje:', mensaje);
            console.log('  idAporte:', idAporte);
            
            if (returnValue === 0 && idAporte) {
                return { 
                    success: true, 
                    mensaje, 
                    idAporte,
                    Id_aporte: idAporte
                };
            } else {
                return { success: false, mensaje: mensaje || 'Error al agregar aporte' };
            }
        } catch (error) {
            console.error('Error en agregar aporte (servicio):', error);
            throw new Error(error.message || 'Error al agregar aporte');
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
                    p.Nombre_patrocinador as Nombre,
                    COUNT(a.Id_aporte) as TotalAportes,
                    ISNULL(SUM(ISNULL(a.Monto, 0)), 0) as MontoTotal
                FROM PATROCINADOR p
                INNER JOIN APORTE a ON p.Id_patrocinador = a.Id_patrocinador
                WHERE a.Id_equipo = @idEquipo
                GROUP BY p.Id_patrocinador, p.Nombre_patrocinador
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
    },

    /**
     * ============================================
     * MÉTODO: getAllPatrocinadores()
     * Obtener todos los patrocinadores disponibles
     * ============================================
     */
    async getAllPatrocinadores() {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`
                SELECT 
                    Id_patrocinador,
                    Nombre_patrocinador as Nombre
                FROM PATROCINADOR
                ORDER BY Nombre_patrocinador
            `);
        return result.recordset;
    }
};

module.exports = equiposService;

