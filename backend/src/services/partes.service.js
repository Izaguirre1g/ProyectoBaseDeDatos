// Servicio para operaciones con Partes
const { getConnection, sql } = require('../config/database');

const partesService = {
    /**
     * Obtener todas las partes
     */
    async getAll() {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT p.*, c.Nombre as Categoria
            FROM PARTE p
            LEFT JOIN CATEGORIA c ON p.Id_categoria = c.Id_categoria
        `);
        return result.recordset;
    },

    /**
     * Obtener parte por ID
     */
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

    /**
     * Obtener parte por nombre
     */
    async getByNombre(nombre) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .query('SELECT * FROM PARTE WHERE Nombre = @nombre');
        return result.recordset[0];
    },

    /**
     * Obtener partes por categoría
     */
    async getByCategoria(idCategoria) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idCategoria', sql.Int, idCategoria)
            .query(`
                SELECT p.*, c.Nombre as Categoria
                FROM PARTE p
                LEFT JOIN CATEGORIA c ON p.Id_categoria = c.Id_categoria
                WHERE p.Id_categoria = @idCategoria
            `);
        return result.recordset;
    },

    /**
     * Crear nueva parte
     */
    async create({ nombre, marca, manejo, aerodinamica, potencia, precio, idCategoria }) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('marca', sql.NVarChar, marca)
            .input('manejo', sql.TinyInt, manejo)
            .input('aerodinamica', sql.TinyInt, aerodinamica)
            .input('potencia', sql.TinyInt, potencia)
            .input('precio', sql.Decimal(18, 2), precio)
            .input('idCategoria', sql.Int, idCategoria)
            .query(`
                INSERT INTO PARTE (Nombre, Marca, Manejo, Aerodinamica, Potencia, Precio, Id_categoria)
                OUTPUT INSERTED.*
                VALUES (@nombre, @marca, @manejo, @aerodinamica, @potencia, @precio, @idCategoria)
            `);
        return result.recordset[0];
    },

    /**
     * Crear parte si no existe
     */
    async upsert({ nombre, marca, manejo, aerodinamica, potencia, precio, idCategoria }) {
        const existing = await this.getByNombre(nombre);
        if (existing) return existing;
        return await this.create({ nombre, marca, manejo, aerodinamica, potencia, precio, idCategoria });
    },

    /**
     * Actualizar parte
     */
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

    /**
     * Eliminar parte
     */
    async delete(id) {
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM PARTE WHERE Id_parte = @id');
        return true;
    },

    /**
     * Obtener categorías
     */
    async getCategorias() {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM CATEGORIA');
        return result.recordset;
    }
};

module.exports = partesService;
