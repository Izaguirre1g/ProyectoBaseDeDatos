// Servicio para operaciones con Carros
const { getConnection, sql } = require('../config/database');

const carrosService = {
    /**
     * Obtener todos los carros
     */
    async getAll() {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT c.*, e.Nombre as Equipo, u.Correo_usuario as Conductor
            FROM CARRO c
            LEFT JOIN EQUIPO e ON c.Id_equipo = e.Id_equipo
            LEFT JOIN USUARIO u ON c.Id_conductor = u.Id_usuario
        `);
        return result.recordset;
    },

    /**
     * Obtener carro por ID
     */
    async getById(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT c.*, e.Nombre as Equipo, u.Correo_usuario as Conductor
                FROM CARRO c
                LEFT JOIN EQUIPO e ON c.Id_equipo = e.Id_equipo
                LEFT JOIN USUARIO u ON c.Id_conductor = u.Id_usuario
                WHERE c.Id_carro = @id
            `);
        return result.recordset[0];
    },

    /**
     * Obtener carros por equipo
     */
    async getByEquipo(idEquipo) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idEquipo', sql.Int, idEquipo)
            .query(`
                SELECT c.*, e.Nombre as Equipo, u.Correo_usuario as Conductor
                FROM CARRO c
                LEFT JOIN EQUIPO e ON c.Id_equipo = e.Id_equipo
                LEFT JOIN USUARIO u ON c.Id_conductor = u.Id_usuario
                WHERE c.Id_equipo = @idEquipo
            `);
        return result.recordset;
    },

    /**
     * Obtener carro por conductor
     */
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

    /**
     * Obtener carros finalizados
     */
    async getFinalizados() {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT c.*, e.Nombre as Equipo, u.Correo_usuario as Conductor
            FROM CARRO c
            LEFT JOIN EQUIPO e ON c.Id_equipo = e.Id_equipo
            LEFT JOIN USUARIO u ON c.Id_conductor = u.Id_usuario
            WHERE c.Finalizado = 1
        `);
        return result.recordset;
    },

    /**
     * Crear nuevo carro
     */
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

    /**
     * Actualizar carro
     */
    async update(id, { idEquipo, finalizado, mTotal, pTotal, aTotal, idConductor }) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('idEquipo', sql.Int, idEquipo)
            .input('finalizado', sql.TinyInt, finalizado)
            .input('mTotal', sql.TinyInt, mTotal)
            .input('pTotal', sql.TinyInt, pTotal)
            .input('aTotal', sql.TinyInt, aTotal)
            .input('idConductor', sql.Int, idConductor)
            .query(`
                UPDATE CARRO 
                SET Id_equipo = @idEquipo, Finalizado = @finalizado, 
                    M_total = @mTotal, P_total = @pTotal, A_total = @aTotal,
                    Id_conductor = @idConductor
                OUTPUT INSERTED.*
                WHERE Id_carro = @id
            `);
        return result.recordset[0];
    },

    /**
     * Asignar conductor a carro
     */
    async asignarConductor(idCarro, idConductor) {
        const pool = await getConnection();
        await pool.request()
            .input('idCarro', sql.Int, idCarro)
            .input('idConductor', sql.Int, idConductor)
            .query('UPDATE CARRO SET Id_conductor = @idConductor WHERE Id_carro = @idCarro');
        return await this.getById(idCarro);
    },

    /**
     * Marcar carro como finalizado
     */
    async marcarFinalizado(id, finalizado = 1) {
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .input('finalizado', sql.TinyInt, finalizado)
            .query('UPDATE CARRO SET Finalizado = @finalizado WHERE Id_carro = @id');
        return await this.getById(id);
    },

    /**
     * Eliminar carro
     */
    async delete(id) {
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM CARRO WHERE Id_carro = @id');
        return true;
    },

    /**
     * Obtener partes de un carro
     */
    async getPartes(idCarro) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idCarro', sql.Int, idCarro)
            .query(`
                SELECT p.*, c.Nombre as Categoria
                FROM PARTE p
                JOIN ESTRUCTURA_CARRO ec ON p.Id_parte = ec.Id_parte
                LEFT JOIN CATEGORIA c ON p.Id_categoria = c.Id_categoria
                WHERE ec.Id_carro = @idCarro
            `);
        return result.recordset;
    },

    /**
     * Agregar parte a carro (método directo - usar instalarParteSP para transacción)
     */
    async addParte(idCarro, idParte) {
        const pool = await getConnection();
        await pool.request()
            .input('idCarro', sql.Int, idCarro)
            .input('idParte', sql.Int, idParte)
            .query('INSERT INTO ESTRUCTURA_CARRO (Id_carro, Id_parte) VALUES (@idCarro, @idParte)');
        return true;
    },

    /**
     * Remover parte de carro
     */
    async removeParte(idCarro, idParte) {
        const pool = await getConnection();
        await pool.request()
            .input('idCarro', sql.Int, idCarro)
            .input('idParte', sql.Int, idParte)
            .query('DELETE FROM ESTRUCTURA_CARRO WHERE Id_carro = @idCarro AND Id_parte = @idParte');
        return true;
    },

    /**
     * Instalar parte en carro usando Stored Procedure con transacción
     * Este es el método recomendado para instalar partes - garantiza atomicidad
     * @param {number} idCarro - ID del carro
     * @param {number} idParte - ID de la parte a instalar
     * @returns {Object} - Resultado con mensaje y carro actualizado
     */
    async instalarParteSP(idCarro, idParte) {
        const pool = await getConnection();
        
        try {
            const result = await pool.request()
                .input('Id_carro', sql.Int, idCarro)
                .input('Id_parte', sql.Int, idParte)
                .output('Resultado', sql.VarChar(500))
                .execute('SP_InstalarParteEnCarro');
            
            const mensaje = result.output.Resultado;
            const returnValue = result.returnValue;
            
            if (returnValue !== 0) {
                throw new Error(mensaje || 'Error al instalar parte');
            }
            
            // Obtener el carro actualizado
            const carro = await this.getById(idCarro);
            const partes = await this.getPartes(idCarro);
            
            return {
                success: true,
                mensaje,
                carro,
                partes
            };
        } catch (error) {
            console.error('Error en SP_InstalarParteEnCarro:', error);
            throw new Error(error.message || 'Error al instalar parte en el carro');
        }
    },

    /**
     * Desinstalar parte de un carro (devuelve al inventario)
     * @param {number} idCarro - ID del carro
     * @param {number} idParte - ID de la parte
     * @param {number} idEquipo - ID del equipo (para devolver al inventario)
     */
    async desinstalarParte(idCarro, idParte, idEquipo) {
        const pool = await getConnection();
        
        // Usar transacción manual para desinstalar
        const transaction = pool.transaction();
        await transaction.begin();
        
        try {
            // Eliminar de ESTRUCTURA_CARRO
            await transaction.request()
                .input('idCarro', sql.Int, idCarro)
                .input('idParte', sql.Int, idParte)
                .query('DELETE FROM ESTRUCTURA_CARRO WHERE Id_carro = @idCarro AND Id_parte = @idParte');
            
            // Devolver al inventario
            await transaction.request()
                .input('idEquipo', sql.Int, idEquipo)
                .input('idParte', sql.Int, idParte)
                .query(`
                    IF EXISTS (SELECT 1 FROM INVENTARIO_EQUIPO WHERE Id_equipo = @idEquipo AND Id_parte = @idParte)
                        UPDATE INVENTARIO_EQUIPO SET Cantidad = Cantidad + 1 
                        WHERE Id_equipo = @idEquipo AND Id_parte = @idParte
                    ELSE
                        INSERT INTO INVENTARIO_EQUIPO (Id_equipo, Id_parte, Cantidad) 
                        VALUES (@idEquipo, @idParte, 1)
                `);
            
            // Recalcular totales del carro
            await transaction.request()
                .input('idCarro', sql.Int, idCarro)
                .query(`
                    UPDATE CARRO SET
                        P_total = ISNULL((SELECT SUM(P.Potencia) FROM ESTRUCTURA_CARRO EC 
                                          JOIN PARTE P ON EC.Id_parte = P.Id_parte WHERE EC.Id_carro = @idCarro), 0),
                        A_total = ISNULL((SELECT SUM(P.Aerodinamica) FROM ESTRUCTURA_CARRO EC 
                                          JOIN PARTE P ON EC.Id_parte = P.Id_parte WHERE EC.Id_carro = @idCarro), 0),
                        M_total = ISNULL((SELECT SUM(P.Manejo) FROM ESTRUCTURA_CARRO EC 
                                          JOIN PARTE P ON EC.Id_parte = P.Id_parte WHERE EC.Id_carro = @idCarro), 0)
                    WHERE Id_carro = @idCarro
                `);
            
            await transaction.commit();
            
            return {
                success: true,
                mensaje: 'Parte desinstalada y devuelta al inventario'
            };
        } catch (error) {
            await transaction.rollback();
            throw new Error('Error al desinstalar parte: ' + error.message);
        }
    },

    /**
     * Obtener inventario del equipo de un carro
     */
    async getInventarioEquipo(idCarro) {
        const pool = await getConnection();
        
        // Primero obtener el equipo del carro
        const carroResult = await pool.request()
            .input('idCarro', sql.Int, idCarro)
            .query('SELECT Id_equipo FROM CARRO WHERE Id_carro = @idCarro');
        
        if (!carroResult.recordset[0]) {
            throw new Error('Carro no encontrado');
        }
        
        const idEquipo = carroResult.recordset[0].Id_equipo;
        
        // Obtener inventario con detalles de partes
        const result = await pool.request()
            .input('idEquipo', sql.Int, idEquipo)
            .query(`
                SELECT ie.Id_parte, ie.Cantidad,
                       p.Nombre, p.Potencia as P, p.Aerodinamica as A, p.Manejo as M, p.Precio,
                       c.Id_categoria, c.Nombre as Categoria
                FROM INVENTARIO_EQUIPO ie
                JOIN PARTE p ON ie.Id_parte = p.Id_parte
                JOIN CATEGORIA c ON p.Id_categoria = c.Id_categoria
                WHERE ie.Id_equipo = @idEquipo AND ie.Cantidad > 0
                ORDER BY c.Nombre, p.Nombre
            `);
        
        return result.recordset;
    }
};

module.exports = carrosService;
