const { getConnection, sql } = require('../config/database');

const patrocinadoresService = {
    // Obtener todos los patrocinadores
    async getAll() {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT 
                p.Id_patrocinador,
                p.Nombre_patrocinador,
                ISNULL(SUM(a.Monto), 0) as TotalAportes,
                COUNT(DISTINCT a.Id_equipo) as EquiposPatrocinados
            FROM PATROCINADOR p
            LEFT JOIN APORTE a ON p.Id_patrocinador = a.Id_patrocinador
            GROUP BY p.Id_patrocinador, p.Nombre_patrocinador
            ORDER BY p.Nombre_patrocinador
        `);
        return result.recordset;
    },

    // Obtener patrocinador por ID
    async getById(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT 
                    p.Id_patrocinador,
                    p.Nombre_patrocinador,
                    ISNULL(SUM(a.Monto), 0) as TotalAportes,
                    COUNT(DISTINCT a.Id_equipo) as EquiposPatrocinados
                FROM PATROCINADOR p
                LEFT JOIN APORTE a ON p.Id_patrocinador = a.Id_patrocinador
                WHERE p.Id_patrocinador = @id
                GROUP BY p.Id_patrocinador, p.Nombre_patrocinador
            `);
        return result.recordset[0];
    },

    // Crear nuevo patrocinador
    async create({ nombre }) {
        const pool = await getConnection();
        
        // Verificar si ya existe
        const existente = await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .query(`
                SELECT Id_patrocinador FROM PATROCINADOR 
                WHERE Nombre_patrocinador = @nombre
            `);
        
        if (existente.recordset.length > 0) {
            throw new Error('Ya existe un patrocinador con ese nombre');
        }
        
        const result = await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .query(`
                INSERT INTO PATROCINADOR (Nombre_patrocinador)
                VALUES (@nombre);
                SELECT SCOPE_IDENTITY() as Id_patrocinador;
            `);
        
        return {
            Id_patrocinador: result.recordset[0].Id_patrocinador,
            Nombre_patrocinador: nombre,
            TotalAportes: 0,
            EquiposPatrocinados: 0
        };
    },

    // Actualizar patrocinador
    async update(id, { nombre }) {
        const pool = await getConnection();
        
        // Verificar que existe
        const existente = await pool.request()
            .input('id', sql.Int, id)
            .query(`SELECT Id_patrocinador FROM PATROCINADOR WHERE Id_patrocinador = @id`);
        
        if (existente.recordset.length === 0) {
            throw new Error('Patrocinador no encontrado');
        }
        
        // Verificar nombre duplicado
        const duplicado = await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('id', sql.Int, id)
            .query(`
                SELECT Id_patrocinador FROM PATROCINADOR 
                WHERE Nombre_patrocinador = @nombre AND Id_patrocinador != @id
            `);
        
        if (duplicado.recordset.length > 0) {
            throw new Error('Ya existe otro patrocinador con ese nombre');
        }
        
        await pool.request()
            .input('id', sql.Int, id)
            .input('nombre', sql.NVarChar, nombre)
            .query(`
                UPDATE PATROCINADOR 
                SET Nombre_patrocinador = @nombre
                WHERE Id_patrocinador = @id
            `);
        
        return await this.getById(id);
    },

    // Eliminar patrocinador
    async delete(id) {
        const pool = await getConnection();
        
        // Verificar que existe
        const existente = await pool.request()
            .input('id', sql.Int, id)
            .query(`SELECT Id_patrocinador FROM PATROCINADOR WHERE Id_patrocinador = @id`);
        
        if (existente.recordset.length === 0) {
            throw new Error('Patrocinador no encontrado');
        }
        
        // Verificar si tiene aportes asociados
        const tieneAportes = await pool.request()
            .input('id', sql.Int, id)
            .query(`SELECT COUNT(*) as count FROM APORTE WHERE Id_patrocinador = @id`);
        
        if (tieneAportes.recordset[0].count > 0) {
            throw new Error('No se puede eliminar: el patrocinador tiene aportes registrados');
        }
        
        await pool.request()
            .input('id', sql.Int, id)
            .query(`DELETE FROM PATROCINADOR WHERE Id_patrocinador = @id`);
        
        return { message: 'Patrocinador eliminado correctamente' };
    },

    // Upsert: actualizar si existe, insertar si no (mantener para compatibilidad)
    async upsert({ nombre }) {
        const pool = await getConnection();
        
        // Verificar si existe
        const existente = await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .query(`
                SELECT Id_patrocinador, Nombre_patrocinador
                FROM PATROCINADOR
                WHERE Nombre_patrocinador = @nombre
            `);

        if (existente.recordset.length > 0) {
            return existente.recordset[0];
        }

        // Insertar si no existe
        const result = await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .query(`
                INSERT INTO PATROCINADOR (Nombre_patrocinador)
                VALUES (@nombre)
                SELECT SCOPE_IDENTITY() as Id_patrocinador
            `);

        const idPatrocinador = result.recordset[0].Id_patrocinador;
        return {
            Id_patrocinador: idPatrocinador,
            Nombre_patrocinador: nombre
        };
    },

    // Obtener todos los aportes
    async getAllAportes() {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT 
                a.Id_aporte,
                a.Monto,
                a.Fecha,
                a.Id_equipo,
                a.Id_patrocinador,
                p.Nombre_patrocinador,
                e.Nombre as Equipo
            FROM APORTE a
            LEFT JOIN PATROCINADOR p ON a.Id_patrocinador = p.Id_patrocinador
            LEFT JOIN EQUIPO e ON a.Id_equipo = e.Id_equipo
            ORDER BY a.Fecha DESC
        `);
        return result.recordset;
    },

    // Agregar aporte (upsert para aportes)
    async upsertAporte({ monto, descripcion, fecha, idEquipo, idPatrocinador }) {
        const pool = await getConnection();
        
        // Insertar aporte
        const result = await pool.request()
            .input('idEquipo', sql.Int, idEquipo)
            .input('monto', sql.Decimal(12, 2), monto)
            .input('idPatrocinador', sql.Int, idPatrocinador)
            .input('fecha', sql.Date, fecha)
            .query(`
                INSERT INTO APORTE (Id_equipo, Monto, Id_patrocinador, Fecha)
                VALUES (@idEquipo, @monto, @idPatrocinador, @fecha)
                SELECT SCOPE_IDENTITY() as Id_aporte
            `);

        return {
            Id_aporte: result.recordset[0].Id_aporte,
            Monto: monto,
            Id_equipo: idEquipo,
            Id_patrocinador: idPatrocinador,
            Fecha: fecha
        };
    }
};

module.exports = patrocinadoresService;
