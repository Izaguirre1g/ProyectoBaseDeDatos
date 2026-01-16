// Servicio para operaciones con Patrocinadores y Aportes
const { getConnection, sql } = require('../config/database');

const patrocinadoresService = {
    /**
     * Obtener todos los patrocinadores
     */
    async getAll() {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM PATROCINADOR');
        return result.recordset;
    },

    /**
     * Obtener patrocinador por ID
     */
    async getById(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM PATROCINADOR WHERE Id_patrocinador = @id');
        return result.recordset[0];
    },

    /**
     * Obtener patrocinador por nombre
     */
    async getByNombre(nombre) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .query('SELECT * FROM PATROCINADOR WHERE Nombre_patrocinador = @nombre');
        return result.recordset[0];
    },

    /**
     * Crear nuevo patrocinador
     */
    async create({ nombre }) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .query(`
                INSERT INTO PATROCINADOR (Nombre_patrocinador)
                OUTPUT INSERTED.*
                VALUES (@nombre)
            `);
        return result.recordset[0];
    },

    /**
     * Crear patrocinador si no existe
     */
    async upsert({ nombre }) {
        const existing = await this.getByNombre(nombre);
        if (existing) return existing;
        return await this.create({ nombre });
    },

    /**
     * Actualizar patrocinador
     */
    async update(id, { nombre }) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('nombre', sql.NVarChar, nombre)
            .query(`
                UPDATE PATROCINADOR 
                SET Nombre_patrocinador = @nombre
                OUTPUT INSERTED.*
                WHERE Id_patrocinador = @id
            `);
        return result.recordset[0];
    },

    /**
     * Eliminar patrocinador
     */
    async delete(id) {
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM PATROCINADOR WHERE Id_patrocinador = @id');
        return true;
    },

    /**
     * Obtener mapa de patrocinadores { nombre: id }
     */
    async getMap() {
        const patrocinadores = await this.getAll();
        const map = {};
        patrocinadores.forEach(p => { map[p.Nombre_patrocinador] = p.Id_patrocinador; });
        return map;
    },

    // ==================== APORTES ====================

    /**
     * Obtener todos los aportes
     */
    async getAllAportes() {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT a.*, p.Nombre_patrocinador, e.Nombre as Equipo
            FROM APORTE a
            LEFT JOIN PATROCINADOR p ON a.Id_patrocinador = p.Id_patrocinador
            LEFT JOIN EQUIPO e ON a.Id_equipo = e.Id_equipo
        `);
        return result.recordset;
    },

    /**
     * Obtener aportes por equipo
     */
    async getAportesByEquipo(idEquipo) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idEquipo', sql.Int, idEquipo)
            .query(`
                SELECT a.*, p.Nombre_patrocinador
                FROM APORTE a
                LEFT JOIN PATROCINADOR p ON a.Id_patrocinador = p.Id_patrocinador
                WHERE a.Id_equipo = @idEquipo
            `);
        return result.recordset;
    },

    /**
     * Crear aporte
     */
    async createAporte({ monto, descripcion, fecha, idEquipo, idPatrocinador }) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('monto', sql.Decimal(18, 2), monto)
            .input('descripcion', sql.NVarChar, descripcion)
            .input('fecha', sql.Date, fecha)
            .input('idEquipo', sql.Int, idEquipo)
            .input('idPatrocinador', sql.Int, idPatrocinador)
            .query(`
                INSERT INTO APORTE (Monto, Descripcion, Fecha, Id_equipo, Id_patrocinador)
                OUTPUT INSERTED.*
                VALUES (@monto, @descripcion, @fecha, @idEquipo, @idPatrocinador)
            `);
        return result.recordset[0];
    },

    /**
     * Crear aporte si no existe (por equipo, patrocinador y monto)
     */
    async upsertAporte({ monto, descripcion, fecha, idEquipo, idPatrocinador }) {
        const pool = await getConnection();
        const existe = await pool.request()
            .input('idEquipo', sql.Int, idEquipo)
            .input('idPatrocinador', sql.Int, idPatrocinador)
            .input('monto', sql.Decimal(18, 2), monto)
            .query('SELECT * FROM APORTE WHERE Id_equipo = @idEquipo AND Id_patrocinador = @idPatrocinador AND Monto = @monto');
        
        if (existe.recordset.length > 0) return existe.recordset[0];
        return await this.createAporte({ monto, descripcion, fecha, idEquipo, idPatrocinador });
    },

    /**
     * Eliminar aporte
     */
    async deleteAporte(id) {
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM APORTE WHERE Id_aporte = @id');
        return true;
    },

    /**
     * Obtener total de aportes por equipo
     */
    async getTotalAportesByEquipo(idEquipo) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idEquipo', sql.Int, idEquipo)
            .query('SELECT ISNULL(SUM(Monto), 0) as total FROM APORTE WHERE Id_equipo = @idEquipo');
        return result.recordset[0].total;
    }
};

module.exports = patrocinadoresService;
