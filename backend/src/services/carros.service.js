const { getConnection, sql } = require('../config/database');

const carrosService = {
    /**
     * ============================================
     * CONSULTAS BÁSICAS
     * ============================================
     */
    async getAll() {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT 
                c.Id_carro, c.Id_equipo, c.Finalizado,
                c.M_total, c.P_total, c.A_total, c.Id_conductor,
                e.Nombre as Equipo,
                u.Correo_usuario as Conductor,
                u.Habilidad as Habilidad_conductor
            FROM CARRO c
            LEFT JOIN EQUIPO e ON c.Id_equipo = e.Id_equipo
            LEFT JOIN USUARIO u ON c.Id_conductor = u.Id_usuario
            ORDER BY c.Id_carro
        `);
        return result.recordset;
    },

    async getById(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT 
                    c.Id_carro, c.Id_equipo, c.Finalizado,
                    c.M_total, c.P_total, c.A_total, c.Id_conductor,
                    e.Nombre as Equipo,
                    u.Correo_usuario as Conductor,
                    u.Habilidad as Habilidad_conductor
                FROM CARRO c
                LEFT JOIN EQUIPO e ON c.Id_equipo = e.Id_equipo
                LEFT JOIN USUARIO u ON c.Id_conductor = u.Id_usuario
                WHERE c.Id_carro = @id
            `);
        return result.recordset[0];
    },

    async getByEquipo(idEquipo) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idEquipo', sql.Int, idEquipo)
            .query(`
                SELECT 
                    c.Id_carro, c.Id_equipo, c.Finalizado,
                    c.M_total, c.P_total, c.A_total, c.Id_conductor,
                    e.Nombre as Equipo,
                    u.Correo_usuario as Conductor
                FROM CARRO c
                LEFT JOIN EQUIPO e ON c.Id_equipo = e.Id_equipo
                LEFT JOIN USUARIO u ON c.Id_conductor = u.Id_usuario
                WHERE c.Id_equipo = @idEquipo
                ORDER BY c.Id_carro
            `);
        return result.recordset;
    },

    async getByConductor(idConductor) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idConductor', sql.Int, idConductor)
            .query(`
                SELECT c.*, e.Nombre as Equipo
                FROM CARRO c
                LEFT JOIN EQUIPO e ON c.Id_equipo = e.Id_equipo
                WHERE c.Id_conductor = @idConductor
            `);
        return result.recordset[0];
    },

    async getFinalizados() {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT c.*, e.Nombre as Equipo, u.Correo_usuario as Conductor
            FROM CARRO c
            LEFT JOIN EQUIPO e ON c.Id_equipo = e.Id_equipo
            LEFT JOIN USUARIO u ON c.Id_conductor = u.Id_usuario
            WHERE c.Finalizado = 1
            ORDER BY c.Id_carro
        `);
        return result.recordset;
    },

    /**
     * ============================================
     * MÉTODO NUEVO: getPartes()
     * Obtener partes instaladas en un carro
     * ============================================
     */
    async getPartes(idCarro) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idCarro', sql.Int, idCarro)
            .query(`
                SELECT 
                    ec.Id_carro,
                    ec.Id_parte,
                    p.Nombre,
                    p.Marca,
                    p.Manejo,
                    p.Aerodinamica,
                    p.Potencia,
                    p.Precio,
                    p.Id_categoria,
                    c.Nombre as Categoria
                FROM ESTRUCTURA_CARRO ec
                INNER JOIN PARTE p ON ec.Id_parte = p.Id_parte
                LEFT JOIN CATEGORIA c ON p.Id_categoria = c.Id_categoria
                WHERE ec.Id_carro = @idCarro
                ORDER BY p.Id_categoria
            `);
        return result.recordset;
    },

    /**
     * ============================================
     * MÉTODO: getInventarioParaCarro()
     * Obtener inventario del equipo dueño del carro
     * ============================================
     */
    async getInventarioParaCarro(idCarro) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idCarro', sql.Int, idCarro)
            .query(`
                SELECT 
                    ie.Id_parte,
                    ie.Cantidad,
                    p.Nombre,
                    p.Marca,
                    p.Manejo,
                    p.Aerodinamica,
                    p.Potencia,
                    p.Precio,
                    p.Id_categoria,
                    c.Nombre as Categoria
                FROM CARRO car
                INNER JOIN INVENTARIO_EQUIPO ie ON car.Id_equipo = ie.Id_equipo
                INNER JOIN PARTE p ON ie.Id_parte = p.Id_parte
                LEFT JOIN CATEGORIA c ON p.Id_categoria = c.Id_categoria
                WHERE car.Id_carro = @idCarro AND ie.Cantidad > 0
                ORDER BY p.Id_categoria, p.Nombre
            `);
        return result.recordset;
    },

    /**
     * ============================================
     * MÉTODO CLAVE: getConfiguracion()
     * Obtener configuración completa del carro
     * ============================================
     * Retorna las 5 categorías con:
     * - La parte instalada (si hay)
     * - NULL si no hay parte instalada
     */
    async getConfiguracion(idCarro) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idCarro', sql.Int, idCarro)
            .query(`
                SELECT 
                    cat.Id_categoria,
                    cat.Nombre as Categoria,
                    p.Id_parte,
                    p.Nombre as Parte,
                    p.Marca,
                    p.Manejo,
                    p.Aerodinamica,
                    p.Potencia,
                    p.Precio
                FROM CATEGORIA cat
                LEFT JOIN ESTRUCTURA_CARRO ec ON cat.Id_categoria = (
                    SELECT p2.Id_categoria 
                    FROM ESTRUCTURA_CARRO ec2 
                    JOIN PARTE p2 ON ec2.Id_parte = p2.Id_parte
                    WHERE ec2.Id_carro = @idCarro AND p2.Id_categoria = cat.Id_categoria
                ) AND ec.Id_carro = @idCarro
                LEFT JOIN PARTE p ON ec.Id_parte = p.Id_parte
                ORDER BY cat.Id_categoria
            `);
        return result.recordset;
    },

    /**
     * ============================================
     * MÉTODO CLAVE: instalarParte()
     * Instalar parte usando SP_InstalarParteEnCarro
     * ============================================
     * El SP hace:
     * 1. Valida que el carro existe
     * 2. Valida que la parte existe
     * 3. Valida que la parte pertenece al equipo
     * 4. Verifica si ya hay una parte de esa categoría
     * 5. Si hay, la reemplaza (elimina la vieja, agrega la nueva)
     * 6. Actualiza totales (P_total, A_total, M_total)
     * 7. Verifica si el carro está completo (5 partes) → Finalizado=1
     */
    async instalarParte(idCarro, idParte) {
        const pool = await getConnection();
        
        try {
            const result = await pool.request()
                .input('Id_carro', sql.Int, idCarro)
                .input('Id_parte', sql.Int, idParte)
                .output('Resultado', sql.VarChar(500))
                .execute('SP_InstalarParteEnCarro');
            
            const mensaje = result.output.Resultado;
            const returnValue = result.returnValue;
            
            if (returnValue === 0) {
                // Obtener el carro actualizado
                const carroActualizado = await this.getById(idCarro);
                return {
                    success: true,
                    mensaje,
                    carro: carroActualizado
                };
            } else {
                return {
                    success: false,
                    mensaje: mensaje || 'Error al instalar parte'
                };
            }
        } catch (error) {
            console.error('Error en SP_InstalarParteEnCarro:', error);
            throw new Error(error.message || 'Error al instalar parte en el carro');
        }
    },

    /**
     * ============================================
     * MÉTODO: desinstalarParte() usando SP
     * Desinstalar una parte del carro
     * ============================================
     */
    async desinstalarParte(idCarro, idParte) {
        const pool = await getConnection();
        
        try {
            const result = await pool.request()
                .input('Id_carro', sql.Int, idCarro)
                .input('Id_parte', sql.Int, idParte)
                .output('Resultado', sql.VarChar(500))
                .execute('SP_DesinstalarParteDelCarro');
            
            const mensaje = result.output.Resultado;
            const returnValue = result.returnValue;
            
            if (returnValue === 0) {
                const carroActualizado = await this.getById(idCarro);
                return {
                    success: true,
                    mensaje,
                    carro: carroActualizado
                };
            } else {
                return {
                    success: false,
                    mensaje: mensaje || 'Error al desinstalar parte'
                };
            }
        } catch (error) {
            console.error('Error en SP_DesinstalarParteDelCarro:', error);
            throw new Error(error.message || 'Error al desinstalar parte');
        }
    },

    /**
     * ============================================
     * MÉTODO: reemplazarParte() usando SP
     * Reemplazar una parte por otra de la misma categoría
     * ============================================
     */
    async reemplazarParte(idCarro, idParteNueva) {
        const pool = await getConnection();
        
        try {
            const result = await pool.request()
                .input('Id_carro', sql.Int, idCarro)
                .input('Id_parte_nueva', sql.Int, idParteNueva)
                .output('Resultado', sql.VarChar(500))
                .execute('SP_ReemplazarParteEnCarro');
            
            const mensaje = result.output.Resultado;
            const returnValue = result.returnValue;
            
            if (returnValue === 0) {
                const carroActualizado = await this.getById(idCarro);
                return {
                    success: true,
                    mensaje,
                    carro: carroActualizado
                };
            } else {
                return {
                    success: false,
                    mensaje: mensaje || 'Error al reemplazar parte'
                };
            }
        } catch (error) {
            console.error('Error en SP_ReemplazarParteEnCarro:', error);
            throw new Error(error.message || 'Error al reemplazar parte');
        }
    },

    /**
     * ============================================
     * MÉTODO: crearCarro()
     * Crear un nuevo carro con conductor opcional
     * ============================================
     * Valida que el equipo no tenga más de 2 carros
     */
    async crearCarro(idEquipo, idConductor = null) {
        const pool = await getConnection();
        const transaction = pool.transaction();
        
        try {
            await transaction.begin();
            
            // Verificar que el equipo no tenga más de 2 carros
            const checkResult = await transaction.request()
                .input('idEquipo', sql.Int, idEquipo)
                .query('SELECT COUNT(*) as total FROM CARRO WHERE Id_equipo = @idEquipo');
            
            if (checkResult.recordset[0].total >= 2) {
                await transaction.rollback();
                return {
                    success: false,
                    mensaje: 'El equipo ya tiene el máximo de 2 carros permitidos'
                };
            }
            
            // Crear el carro
            const insertResult = await transaction.request()
                .input('idEquipo', sql.Int, idEquipo)
                .input('idConductor', sql.Int, idConductor)
                .query(`
                    INSERT INTO CARRO (Id_equipo, Finalizado, M_total, P_total, A_total, Id_conductor)
                    OUTPUT INSERTED.*
                    VALUES (@idEquipo, 0, 0, 0, 0, @idConductor)
                `);
            
            const nuevoCarro = insertResult.recordset[0];
            
            // Si hay conductor, actualizar su equipo
            if (idConductor) {
                await transaction.request()
                    .input('idConductor', sql.Int, idConductor)
                    .input('idEquipo', sql.Int, idEquipo)
                    .query('UPDATE USUARIO SET Id_equipo = @idEquipo WHERE Id_usuario = @idConductor');
            }
            
            await transaction.commit();
            
            return {
                success: true,
                mensaje: 'Carro creado exitosamente',
                carro: nuevoCarro
            };
        } catch (error) {
            await transaction.rollback();
            console.error('Error al crear carro:', error);
            throw new Error(error.message || 'Error al crear carro');
        }
    },

    // CRUD básico
    async create({ idEquipo, finalizado = 0, mTotal = 0, pTotal = 0, aTotal = 0, idConductor = null }) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idEquipo', sql.Int, idEquipo)
            .input('finalizado', sql.TinyInt, finalizado)
            .input('mTotal', sql.TinyInt, mTotal)
            .input('pTotal', sql.TinyInt, pTotal)
            .input('aTotal', sql.TinyInt, aTotal)
            .input('idConductor', sql.Int, idConductor)
            .query(`
                INSERT INTO CARRO (Id_equipo, Finalizado, M_total, P_total, A_total, Id_conductor)
                OUTPUT INSERTED.*
                VALUES (@idEquipo, @finalizado, @mTotal, @pTotal, @aTotal, @idConductor)
            `);
        return result.recordset[0];
    },

    async assignDriver(idCarro, idConductor) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idCarro', sql.Int, idCarro)
            .input('idConductor', sql.Int, idConductor)
            .query(`
                UPDATE CARRO
                SET Id_conductor = @idConductor
                OUTPUT INSERTED.*
                WHERE Id_carro = @idCarro
            `);
        return result.recordset[0];
    },

    async finalizar(idCarro) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idCarro', sql.Int, idCarro)
            .query(`
                UPDATE CARRO
                SET Finalizado = 1
                OUTPUT INSERTED.*
                WHERE Id_carro = @idCarro
            `);
        return result.recordset[0];
    },

    async delete(id) {
        const pool = await getConnection();
        const transaction = pool.transaction();
        
        try {
            await transaction.begin();
            
            // Eliminar resultados de simulaciones relacionados
            await transaction.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM RESULTADO WHERE Id_carro = @id');
            
            // Eliminar estructura del carro (partes instaladas)
            await transaction.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM ESTRUCTURA_CARRO WHERE Id_carro = @id');
            
            // Eliminar conductor_chasis si existe
            await transaction.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM CONDUCTOR_CHASIS WHERE Id_carro = @id');
            
            // Eliminar el carro
            await transaction.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM CARRO WHERE Id_carro = @id');
            
            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            console.error('Error al eliminar carro:', error);
            throw error;
        }
    },

    /**
     * Obtener conductores disponibles para asignar a un carro
     * Retorna conductores con rol 'Conductor' que no están asignados a ningún carro
     */
    async getConductoresDisponibles(idEquipo) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idEquipo', sql.Int, idEquipo)
            .query(`
                SELECT 
                    u.Id_usuario,
                    u.Nombre_usuario,
                    u.Correo_usuario,
                    u.Habilidad,
                    u.Id_equipo,
                    e.Nombre as Equipo
                FROM USUARIO u
                INNER JOIN ROL r ON u.Id_rol = r.Id_rol
                LEFT JOIN EQUIPO e ON u.Id_equipo = e.Id_equipo
                WHERE r.Nombre = 'Conductor'
                AND u.Id_usuario NOT IN (
                    SELECT Id_conductor FROM CARRO WHERE Id_conductor IS NOT NULL
                )
                AND (u.Id_equipo = @idEquipo OR u.Id_equipo IS NULL)
                ORDER BY 
                    CASE WHEN u.Id_equipo = @idEquipo THEN 0 ELSE 1 END,
                    u.Nombre_usuario
            `);
        return result.recordset;
    }
};

module.exports = carrosService;

