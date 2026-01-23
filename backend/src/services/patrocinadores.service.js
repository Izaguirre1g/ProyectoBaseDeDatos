const { getConnection, sql } = require('../config/database');

const patrocinadoresService = {
    // Obtener todos los patrocinadores
    async getAll() {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT 
                Id_patrocinador,
                Nombre_patrocinador
            FROM PATROCINADOR
            ORDER BY Nombre_patrocinador
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
                    Id_patrocinador,
                    Nombre_patrocinador
                FROM PATROCINADOR
                WHERE Id_patrocinador = @id
            `);
        return result.recordset[0];
    },

    // Upsert: actualizar si existe, insertar si no
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
