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
                JOIN CARRO_PARTE cp ON p.Id_parte = cp.Id_parte
                LEFT JOIN CATEGORIA c ON p.Id_categoria = c.Id_categoria
                WHERE cp.Id_carro = @idCarro
            `);
        return result.recordset;
    },

    /**
     * Agregar parte a carro
     */
    async addParte(idCarro, idParte) {
        const pool = await getConnection();
        await pool.request()
            .input('idCarro', sql.Int, idCarro)
            .input('idParte', sql.Int, idParte)
            .query('INSERT INTO CARRO_PARTE (Id_carro, Id_parte) VALUES (@idCarro, @idParte)');
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
            .query('DELETE FROM CARRO_PARTE WHERE Id_carro = @idCarro AND Id_parte = @idParte');
        return true;
    }
};

module.exports = carrosService;
