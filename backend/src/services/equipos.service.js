// Servicio para operaciones con Equipos
const { getConnection, sql } = require('../config/database');

const equiposService = {
    /**
     * Obtener todos los equipos
     */
    async getAll() {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM EQUIPO');
        return result.recordset;
    },

    /**
     * Obtener equipo por ID
     */
    async getById(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM EQUIPO WHERE Id_equipo = @id');
        return result.recordset[0];
    },

    /**
     * Obtener equipo por nombre
     */
    async getByNombre(nombre) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .query('SELECT * FROM EQUIPO WHERE Nombre = @nombre');
        return result.recordset[0];
    },

    /**
     * Crear nuevo equipo
     */
    async create({ nombre, presupuesto }) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('presupuesto', sql.Decimal(18, 2), presupuesto)
            .query(`
                INSERT INTO EQUIPO (Nombre, Presupuesto) 
                OUTPUT INSERTED.*
                VALUES (@nombre, @presupuesto)
            `);
        return result.recordset[0];
    },

    /**
     * Crear equipo si no existe, retorna el existente o el nuevo
     */
    async upsert({ nombre, presupuesto }) {
        const existing = await this.getByNombre(nombre);
        if (existing) return existing;
        return await this.create({ nombre, presupuesto });
    },

    /**
     * Actualizar equipo
     */
    async update(id, { nombre, presupuesto }) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('nombre', sql.NVarChar, nombre)
            .input('presupuesto', sql.Decimal(18, 2), presupuesto)
            .query(`
                UPDATE EQUIPO 
                SET Nombre = @nombre, Presupuesto = @presupuesto
                OUTPUT INSERTED.*
                WHERE Id_equipo = @id
            `);
        return result.recordset[0];
    },

    /**
     * Eliminar equipo
     */
    async delete(id) {
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM EQUIPO WHERE Id_equipo = @id');
        return true;
    },

    /**
     * Obtener mapa de equipos { nombre: id }
     */
    async getMap() {
        const equipos = await this.getAll();
        const map = {};
        equipos.forEach(e => { map[e.Nombre] = e.Id_equipo; });
        return map;
    }
};

module.exports = equiposService;
