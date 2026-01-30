// Servicio para operaciones con Circuitos
const { getConnection, sql } = require('../config/database');

const circuitosService = {
    /**
     * Obtener todos los circuitos
     */
    async getAll() {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM CIRCUITO');
        return result.recordset;
    },

    /**
     * Obtener circuito por ID
     */
    async getById(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM CIRCUITO WHERE Id_circuito = @id');
        return result.recordset[0];
    },

    /**
     * Obtener circuito por distancia (único)
     */
    async getByDistancia(distancia) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('distancia', sql.Decimal(10, 3), distancia)
            .query('SELECT * FROM CIRCUITO WHERE Distancia_total = @distancia');
        return result.recordset[0];
    },

    /**
     * Crear nuevo circuito
     */
    async create({ distancia, curvas }) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('distancia', sql.Decimal(10, 3), distancia)
            .input('curvas', sql.TinyInt, curvas)
            .query(`
                INSERT INTO CIRCUITO (Distancia_total, Cantidad_curvas)
                OUTPUT INSERTED.*
                VALUES (@distancia, @curvas)
            `);
        return result.recordset[0];
    },

    /**
     * Crear circuito si no existe
     */
    async upsert({ distancia, curvas }) {
        const existing = await this.getByDistancia(distancia);
        if (existing) return existing;
        return await this.create({ distancia, curvas });
    },

    /**
     * Actualizar circuito
     */
    async update(id, { distancia, curvas }) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('distancia', sql.Decimal(10, 3), distancia)
            .input('curvas', sql.TinyInt, curvas)
            .query(`
                UPDATE CIRCUITO 
                SET Distancia_total = @distancia, Cantidad_curvas = @curvas
                OUTPUT INSERTED.*
                WHERE Id_circuito = @id
            `);
        return result.recordset[0];
    },

    /**
     * Eliminar circuito
     */
    async delete(id) {
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM CIRCUITO WHERE Id_circuito = @id');
        return true;
    },

    /**
     * Obtener lista formateada para frontend
     */
    async getListaFormateada() {
        const circuitos = await this.getAll();
        return circuitos.map(c => ({
            id: c.Id_circuito,
            distancia: parseFloat(c.Distancia_total),
            curvas: c.Cantidad_curvas,
            nombre: `Circuito ${c.Id_circuito} - ${c.Distancia_total}km`
        }));
    }
};

module.exports = circuitosService;
