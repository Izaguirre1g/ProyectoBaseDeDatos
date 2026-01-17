// Servicio para operaciones con Usuarios
const { getConnection, sql } = require('../config/database');
const argon2 = require('argon2');

// Configuración de Argon2id según OWASP
const ARGON2_CONFIG = {
    type: argon2.argon2id,
    memoryCost: 19456,  // 19MB
    timeCost: 2,
    parallelism: 1
};

const usuariosService = {
    /**
     * Obtener todos los usuarios
     */
    async getAll() {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT u.Id_usuario, u.Correo_usuario, u.Id_equipo, u.Id_rol,
                   r.Nombre as Rol, e.Nombre as Equipo
            FROM USUARIO u
            LEFT JOIN ROL r ON u.Id_rol = r.Id_rol
            LEFT JOIN EQUIPO e ON u.Id_equipo = e.Id_equipo
        `);
        return result.recordset;
    },

    /**
     * Obtener usuario por ID
     */
    async getById(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT u.*, r.Nombre as Rol, e.Nombre as Equipo
                FROM USUARIO u
                LEFT JOIN ROL r ON u.Id_rol = r.Id_rol
                LEFT JOIN EQUIPO e ON u.Id_equipo = e.Id_equipo
                WHERE u.Id_usuario = @id
            `);
        return result.recordset[0];
    },

    /**
     * Obtener usuario por correo
     */
    async getByCorreo(correo) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('correo', sql.NVarChar, correo)
            .query(`
                SELECT u.*, r.Nombre as Rol, e.Nombre as Equipo
                FROM USUARIO u
                LEFT JOIN ROL r ON u.Id_rol = r.Id_rol
                LEFT JOIN EQUIPO e ON u.Id_equipo = e.Id_equipo
                WHERE u.Correo_usuario = @correo
            `);
        return result.recordset[0];
    },

    /**
     * Obtener el siguiente ID disponible
     */
    async getNextId() {
        const pool = await getConnection();
        const result = await pool.request()
            .query('SELECT ISNULL(MAX(Id_usuario), 0) + 1 as nextId FROM USUARIO');
        return result.recordset[0].nextId;
    },

    /**
     * Crear nuevo usuario
     */
    async create({ correo, password, idEquipo, idRol }) {
        const pool = await getConnection();
        const hash = await argon2.hash(password, ARGON2_CONFIG);
        const nextId = await this.getNextId();

        const result = await pool.request()
            .input('id', sql.Int, nextId)
            .input('correo', sql.NVarChar, correo)
            .input('hash', sql.NVarChar, hash)
            .input('idEquipo', sql.Int, idEquipo)
            .input('idRol', sql.Int, idRol)
            .query(`
                INSERT INTO USUARIO (Id_usuario, Correo_usuario, Contrasena_hash, Id_equipo, Id_rol)
                VALUES (@id, @correo, @hash, @idEquipo, @idRol);
                SELECT @id as Id_usuario;
            `);
        
        return await this.getById(nextId);
    },

    /**
     * Crear usuario si no existe
     */
    async upsert({ correo, password, idEquipo, idRol }) {
        const existing = await this.getByCorreo(correo);
        if (existing) return existing;
        return await this.create({ correo, password, idEquipo, idRol });
    },

    /**
     * Actualizar usuario
     */
    async update(id, { correo, idEquipo, idRol }) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('correo', sql.NVarChar, correo)
            .input('idEquipo', sql.Int, idEquipo)
            .input('idRol', sql.Int, idRol)
            .query(`
                UPDATE USUARIO 
                SET Correo_usuario = @correo, Id_equipo = @idEquipo, Id_rol = @idRol
                WHERE Id_usuario = @id
            `);
        return await this.getById(id);
    },

    /**
     * Actualizar contraseña
     */
    async updatePassword(id, newPassword) {
        const pool = await getConnection();
        const hash = await argon2.hash(newPassword, ARGON2_CONFIG);
        await pool.request()
            .input('id', sql.Int, id)
            .input('hash', sql.NVarChar, hash)
            .query('UPDATE USUARIO SET Contrasena_hash = @hash WHERE Id_usuario = @id');
        return true;
    },

    /**
     * Verificar contraseña
     */
    async verifyPassword(correo, password) {
        const user = await this.getByCorreo(correo);
        if (!user) return { valid: false, user: null };
        
        const valid = await argon2.verify(user.Contrasena_hash, password);
        return { valid, user: valid ? user : null };
    },

    /**
     * Eliminar usuario
     */
    async delete(id) {
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM USUARIO WHERE Id_usuario = @id');
        return true;
    },

    /**
     * Obtener usuarios por rol
     */
    async getByRol(idRol) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idRol', sql.Int, idRol)
            .query(`
                SELECT u.*, r.Nombre as Rol, e.Nombre as Equipo
                FROM USUARIO u
                LEFT JOIN ROL r ON u.Id_rol = r.Id_rol
                LEFT JOIN EQUIPO e ON u.Id_equipo = e.Id_equipo
                WHERE u.Id_rol = @idRol
            `);
        return result.recordset;
    },

    /**
     * Obtener usuarios por equipo
     */
    async getByEquipo(idEquipo) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idEquipo', sql.Int, idEquipo)
            .query(`
                SELECT u.*, r.Nombre as Rol, e.Nombre as Equipo
                FROM USUARIO u
                LEFT JOIN ROL r ON u.Id_rol = r.Id_rol
                LEFT JOIN EQUIPO e ON u.Id_equipo = e.Id_equipo
                WHERE u.Id_equipo = @idEquipo
            `);
        return result.recordset;
    }
};

module.exports = usuariosService;
