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
            SELECT u.Id_usuario, u.Correo_usuario, u.Nombre_usuario as Nombre, u.Id_equipo, u.Id_rol,
                   u.Habilidad, r.Nombre as Rol, e.Nombre as Equipo
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
     * La contraseña ya viene hasheada con Argon2id desde el frontend
     */
    async create({ nombre, correo, password, idEquipo, idRol, habilidad = null }) {
        const pool = await getConnection();
        // La contraseña ya viene hasheada desde el cliente
        // Si no está hasheada (no empieza con $argon2), hashearla aquí
        let hash = password;
        if (!password.startsWith('$argon2')) {
            hash = await argon2.hash(password, ARGON2_CONFIG);
        }
        const nextId = await this.getNextId();

        const result = await pool.request()
            .input('id', sql.Int, nextId)
            .input('nombre', sql.NVarChar, nombre)
            .input('correo', sql.NVarChar, correo)
            .input('hash', sql.NVarChar, hash)
            .input('idEquipo', sql.Int, idEquipo)
            .input('idRol', sql.Int, idRol)
            .input('habilidad', sql.TinyInt, habilidad)
            .query(`
                INSERT INTO USUARIO (Id_usuario, Nombre_usuario, Correo_usuario, Contrasena_hash, Id_equipo, Id_rol, Habilidad)
                VALUES (@id, @nombre, @correo, @hash, @idEquipo, @idRol, @habilidad);
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
     * La contraseña ya viene hasheada con Argon2id desde el frontend
     */
    async updatePassword(id, newPassword) {
        const pool = await getConnection();
        // El hash Argon2id viene del cliente - guardar directamente
        const hash = newPassword;
        console.log('[AUTH] Actualizando hash Argon2id');
        await pool.request()
            .input('id', sql.Int, id)
            .input('hash', sql.NVarChar, hash)
            .query('UPDATE USUARIO SET Contrasena_hash = @hash WHERE Id_usuario = @id');
        return true;
    },

    /**
     * Actualizar usuario (sin cambiar contraseña)
     */
    async update(id, { nombre, email, rol, equipo, password, habilidad }) {
        const pool = await getConnection();
        
        // Mapear rol del frontend al nombre en BD
        const rolMap = {
            'Admin': 'Administrador',
            'Engineer': 'Ingeniero',
            'Driver': 'Conductor'
        };
        const rolBD = rolMap[rol] || rol;
        
        // Buscar ID del rol por nombre
        let idRol = null;
        if (rol) {
            const rolResult = await pool.request()
                .input('rolNombre', sql.NVarChar, rolBD)
                .query('SELECT Id_rol FROM ROL WHERE Nombre = @rolNombre');
            idRol = rolResult.recordset[0]?.Id_rol;
            console.log(`Buscando rol "${rolBD}" (recibido "${rol}"):`, idRol);
        }

        // Buscar ID del equipo por nombre
        let idEquipo = null;
        if (equipo && equipo.trim()) {
            const equipoResult = await pool.request()
                .input('equipoNombre', sql.NVarChar, `%${equipo}%`)
                .query(`
                    SELECT TOP 1 Id_equipo, Nombre 
                    FROM EQUIPO 
                    WHERE Nombre LIKE @equipoNombre
                `);
            idEquipo = equipoResult.recordset[0]?.Id_equipo || null;
            console.log(`Buscando equipo "${equipo}":`, idEquipo, equipoResult.recordset[0]);
            
            // Validación: Si es Ingeniero y se asigna un equipo, verificar que no esté ya asignado
            if (rolBD === 'Ingeniero' && idEquipo) {
                const equipoEnUsoResult = await pool.request()
                    .input('idEquipo', sql.Int, idEquipo)
                    .input('idUsuario', sql.Int, id)
                    .query(`
                        SELECT COUNT(*) as count 
                        FROM USUARIO u
                        INNER JOIN ROL r ON u.Id_rol = r.Id_rol
                        WHERE u.Id_equipo = @idEquipo 
                        AND u.Id_usuario != @idUsuario 
                        AND r.Nombre = 'Ingeniero'
                    `);
                
                if (equipoEnUsoResult.recordset[0].count > 0) {
                    throw new Error(`Este equipo ya está asignado a otro ingeniero. Un ingeniero solo puede estar en un equipo.`);
                }
            }
        }

        // Obtener equipo anterior del usuario para limpiar pilotos si cambió de equipo
        const usuarioActual = await this.getById(id);
        const equipoAnterior = usuarioActual?.Id_equipo;
        
        console.log('Update query:', { id, nombre, email, idRol, idEquipo, equipoAnterior });

        const request = pool.request()
            .input('id', sql.Int, id)
            .input('nombre', sql.NVarChar, nombre)
            .input('email', sql.NVarChar, email)
            .input('idRol', sql.Int, idRol);
        
        // Importante: Si idEquipo es null, pasarlo como SQL.NULL explícitamente
        if (idEquipo !== null) {
            request.input('idEquipo', sql.Int, idEquipo);
        } else {
            request.input('idEquipo', sql.Int, null);
        }
        
        // Agregar habilidad
        if (habilidad !== undefined && habilidad !== null && habilidad !== '') {
            request.input('habilidad', sql.TinyInt, parseInt(habilidad));
        } else {
            request.input('habilidad', sql.TinyInt, null);
        }
        
        await request.query(`
                UPDATE USUARIO 
                SET Nombre_usuario = @nombre,
                    Correo_usuario = @email,
                    Id_rol = @idRol,
                    Id_equipo = @idEquipo,
                    Habilidad = @habilidad
                WHERE Id_usuario = @id
            `);
        
        // Si el usuario cambió de equipo y tenía uno anterior, limpiar sus pilotos
        if (equipoAnterior && (idEquipo !== equipoAnterior)) {
            try {
                const carrosService = require('./carros.service');
                await carrosService.limpiarPilotoAlCambiarEquipo(id, equipoAnterior);
            } catch (error) {
                console.error('Error al limpiar pilotos al cambiar equipo:', error);
                // No lanzar error, continuar
            }
        }
        
        // Si se proporciona nueva contraseña, actualizarla
        if (password && password.trim()) {
            await this.updatePassword(id, password);
        }
        
        return await this.getById(id);
    },

    /**
     * Verificar contraseña
     * Recibe el hash Argon2id desde el frontend y lo compara directamente
     */
    async verifyPassword(correo, password) {
        const user = await this.getByCorreo(correo);
        if (!user) {
            console.log('[AUTH] Usuario no encontrado:', correo);
            return { valid: false, user: null };
        }
        
        // El password ya viene como hash Argon2id desde el cliente
        // Comparar directamente con el hash almacenado
        console.log('[AUTH] Hash recibido:', password);
        console.log('[AUTH] Hash en BD:   ', user.Contrasena_hash);
        console.log('[AUTH] Son iguales?:', password === user.Contrasena_hash);
        
        const valid = (password === user.Contrasena_hash);
        console.log('[AUTH] Verificación de hash Argon2id:', valid ? 'Correcto' : 'Incorrecto');
        
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
