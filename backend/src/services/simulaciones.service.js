// Servicio para operaciones con Simulaciones
const { getConnection, sql } = require('../config/database');

// Constante para distancia promedio de curvas
const DC_CURVA = 0.5;

const simulacionesService = {
    /**
     * Obtener todas las simulaciones
     */
    async getAll() {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT s.*, c.Distancia_total, c.Cantidad_curvas
            FROM SIMULACION s
            LEFT JOIN CIRCUITO c ON s.Id_circuito = c.Id_circuito
            ORDER BY s.Fecha_hora DESC
        `);
        return result.recordset;
    },

    /**
     * Obtener simulación por ID con resultados
     */
    async getById(id) {
        const pool = await getConnection();
        
        const simResult = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT s.*, c.Distancia_total, c.Cantidad_curvas
                FROM SIMULACION s
                LEFT JOIN CIRCUITO c ON s.Id_circuito = c.Id_circuito
                WHERE s.Id_simulacion = @id
            `);
        
        if (simResult.recordset.length === 0) return null;
        
        const resultados = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT r.*, ca.Id_equipo, e.Nombre as Equipo, u.Correo_usuario as Conductor
                FROM RESULTADO r
                JOIN CARRO ca ON r.Id_carro = ca.Id_carro
                LEFT JOIN EQUIPO e ON ca.Id_equipo = e.Id_equipo
                LEFT JOIN USUARIO u ON ca.Id_conductor = u.Id_usuario
                WHERE r.Id_simulacion = @id
                ORDER BY r.Posicion
            `);
        
        return {
            ...simResult.recordset[0],
            resultados: resultados.recordset
        };
    },

    /**
     * Obtener simulaciones de un conductor
     */
    async getByConductor(idConductor) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idConductor', sql.Int, idConductor)
            .query(`
                SELECT DISTINCT s.*, c.Distancia_total, c.Cantidad_curvas,
                       r.Posicion, r.Tiempo_segundos, r.Vrecta, r.Vcurva
                FROM SIMULACION s
                JOIN RESULTADO r ON s.Id_simulacion = r.Id_simulacion
                JOIN CARRO ca ON r.Id_carro = ca.Id_carro
                LEFT JOIN CIRCUITO c ON s.Id_circuito = c.Id_circuito
                WHERE ca.Id_conductor = @idConductor
                ORDER BY s.Fecha_hora DESC
            `);
        return result.recordset;
    },

    /**
     * Obtener estadísticas de un conductor
     */
    async getStatsConductor(idConductor) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idConductor', sql.Int, idConductor)
            .query(`
                SELECT 
                    COUNT(*) as totalSimulaciones,
                    COUNT(CASE WHEN r.Posicion = 1 THEN 1 END) as victorias,
                    COUNT(CASE WHEN r.Posicion <= 3 THEN 1 END) as podios,
                    AVG(CAST(r.Posicion AS FLOAT)) as posicionPromedio,
                    MIN(r.Tiempo_segundos) as mejorTiempo,
                    MAX(r.Vrecta) as mejorVrecta,
                    MAX(r.Vcurva) as mejorVcurva
                FROM RESULTADO r
                JOIN CARRO c ON r.Id_carro = c.Id_carro
                WHERE c.Id_conductor = @idConductor
            `);
        return result.recordset[0] || {
            totalSimulaciones: 0,
            victorias: 0,
            podios: 0,
            posicionPromedio: 0,
            mejorTiempo: null,
            mejorVrecta: null,
            mejorVcurva: null
        };
    },

    /**
     * Alias para getStatsConductor (compatibilidad con frontend)
     */
    async getDriverStats(idUsuario) {
        return await this.getStatsConductor(idUsuario);
    },

    /**
     * Obtener resultados de una simulación
     */
    async getResultados(idSimulacion) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idSimulacion', sql.Int, idSimulacion)
            .query(`
                SELECT 
                    r.*,
                    ca.Id_equipo,
                    e.Nombre as Equipo,
                    u.Correo_usuario as Conductor
                FROM RESULTADO r
                JOIN CARRO ca ON r.Id_carro = ca.Id_carro
                LEFT JOIN EQUIPO e ON ca.Id_equipo = e.Id_equipo
                LEFT JOIN USUARIO u ON ca.Id_conductor = u.Id_usuario
                WHERE r.Id_simulacion = @idSimulacion
                ORDER BY r.Posicion
            `);
        return result.recordset;
    },

    /**
     * Crear nueva simulación
     */
    async create({ fecha, idCircuito }) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('fecha', sql.DateTime, fecha || new Date())
            .input('idCircuito', sql.Int, idCircuito)
            .query(`
                INSERT INTO SIMULACION (Fecha_hora, Id_circuito)
                OUTPUT INSERTED.*
                VALUES (@fecha, @idCircuito)
            `);
        return result.recordset[0];
    },

    /**
     * Agregar resultado a simulación
     */
    async addResultado({ idSimulacion, idCarro, vrecta, vcurva, penalizacion, tiempoSegundos, posicion, pTotal, aTotal, mTotal, hConductor }) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idSimulacion', sql.Int, idSimulacion)
            .input('idCarro', sql.Int, idCarro)
            .input('vrecta', sql.Decimal(10, 2), vrecta)
            .input('vcurva', sql.Decimal(10, 2), vcurva)
            .input('penalizacion', sql.Decimal(10, 2), penalizacion)
            .input('tiempoSegundos', sql.Decimal(10, 3), tiempoSegundos)
            .input('posicion', sql.Int, posicion)
            .input('pTotal', sql.TinyInt, pTotal)
            .input('aTotal', sql.TinyInt, aTotal)
            .input('mTotal', sql.TinyInt, mTotal)
            .input('hConductor', sql.TinyInt, hConductor)
            .query(`
                INSERT INTO RESULTADO 
                (Id_simulacion, Id_carro, Vrecta, Vcurva, Penalizacion, Tiempo_segundos, Posicion, P_total, A_total, M_total, H_conductor)
                OUTPUT INSERTED.*
                VALUES (@idSimulacion, @idCarro, @vrecta, @vcurva, @penalizacion, @tiempoSegundos, @posicion, @pTotal, @aTotal, @mTotal, @hConductor)
            `);
        return result.recordset[0];
    },

    /**
     * Calcular resultado de simulación para un carro
     */
    calcularResultado(carro, circuito, habilidad) {
        const P = carro.P_total || carro.pTotal;
        const A = carro.A_total || carro.aTotal;
        const M = carro.M_total || carro.mTotal;
        const H = habilidad;
        const D = parseFloat(circuito.Distancia_total || circuito.distancia);
        const C = circuito.Cantidad_curvas || circuito.curvas;

        // Calcular velocidades
        const Vrecta = 200 + 3 * P + 0.2 * H - A;
        const Vcurva = 90 + 2 * A + 2 * M + 0.2 * H;

        // Calcular distancias
        const Dcurvas = C * DC_CURVA;
        const Drectas = Math.max(0, D - Dcurvas);

        // Penalización
        const penalizacion = (C * 40) / (1 + H / 100);

        // Tiempo total en segundos
        const tiempoHoras = (Drectas / Vrecta) + (Dcurvas / Vcurva);
        const tiempoSegundos = (tiempoHoras * 3600) + penalizacion;

        return {
            Vrecta,
            Vcurva,
            penalizacion,
            tiempoSegundos,
            P, A, M, H
        };
    },

    /**
     * Ejecutar simulación completa con múltiples carros
     */
    async ejecutarSimulacion({ idCircuito, carros, habilidades, fecha }) {
        const circuitosService = require('./circuitos.service');
        const circuito = await circuitosService.getById(idCircuito);
        if (!circuito) throw new Error('Circuito no encontrado');

        // Crear simulación
        const simulacion = await this.create({ fecha, idCircuito });

        // Calcular resultados para cada carro
        const resultados = carros.map(carro => {
            const H = habilidades[carro.Id_conductor] || 85;
            return {
                carroId: carro.Id_carro,
                conductorId: carro.Id_conductor,
                ...this.calcularResultado(carro, circuito, H)
            };
        });

        // Ordenar por tiempo y asignar posiciones
        resultados.sort((a, b) => a.tiempoSegundos - b.tiempoSegundos);

        // Insertar resultados
        for (let i = 0; i < resultados.length; i++) {
            const r = resultados[i];
            await this.addResultado({
                idSimulacion: simulacion.Id_simulacion,
                idCarro: r.carroId,
                vrecta: r.Vrecta,
                vcurva: r.Vcurva,
                penalizacion: r.penalizacion,
                tiempoSegundos: r.tiempoSegundos,
                posicion: i + 1,
                pTotal: r.P,
                aTotal: r.A,
                mTotal: r.M,
                hConductor: r.H
            });
        }

        return await this.getById(simulacion.Id_simulacion);
    },

    /**
     * Ejecutar simulación usando Stored Procedure con transacción
     * Esta es la forma recomendada para producción - garantiza atomicidad
     * @param {number} idCircuito - ID del circuito
     * @param {Array} carros - Array de {idCarro, habilidad}
     * @param {Date} fecha - Fecha opcional
     * @returns {Object} - Resultado con simulación y resultados
     */
    async ejecutarSimulacionSP({ idCircuito, carros, fecha }) {
        const pool = await getConnection();
        
        // Preparar JSON de carros para el SP
        const carrosJSON = JSON.stringify(carros.map(c => ({
            idCarro: c.idCarro || c.Id_carro,
            habilidad: c.habilidad || 85
        })));

        try {
            const result = await pool.request()
                .input('Id_circuito', sql.Int, idCircuito)
                .input('CarrosJSON', sql.NVarChar(sql.MAX), carrosJSON)
                .input('Fecha_hora', sql.DateTime, fecha || new Date())
                .output('Resultado', sql.VarChar(1000))
                .output('Id_simulacion_generada', sql.Int)
                .execute('SP_EjecutarSimulacion');
            
            const mensaje = result.output.Resultado;
            const idSimulacion = result.output.Id_simulacion_generada;
            
            // Verificar si hubo error
            if (result.returnValue !== 0 || !idSimulacion) {
                throw new Error(mensaje || 'Error desconocido en la simulación');
            }
            
            // Obtener la simulación completa con resultados
            const simulacion = await this.getById(idSimulacion);
            
            return {
                success: true,
                mensaje,
                simulacion
            };
        } catch (error) {
            console.error('Error en SP_EjecutarSimulacion:', error);
            throw new Error(error.message || 'Error al ejecutar la simulación');
        }
    },

    /**
     * Obtener estadísticas de conductor usando SP
     */
    async getStatsConductorSP(idUsuario) {
        const pool = await getConnection();
        
        try {
            const result = await pool.request()
                .input('Id_usuario', sql.Int, idUsuario)
                .execute('SP_ObtenerEstadisticasConductor');
            
            if (result.returnValue !== 0 || !result.recordset[0]) {
                return {
                    totalSimulaciones: 0,
                    victorias: 0,
                    podios: 0,
                    posicionPromedio: null,
                    mejorTiempo: null,
                    puntosTotales: 0
                };
            }
            
            const stats = result.recordset[0];
            return {
                totalSimulaciones: stats.TotalSimulaciones || 0,
                victorias: stats.Victorias || 0,
                podios: stats.Podios || 0,
                posicionPromedio: stats.PosicionPromedio,
                mejorTiempo: stats.MejorTiempo,
                mejorVrecta: stats.MejorVrecta,
                mejorVcurva: stats.MejorVcurva,
                puntosTotales: stats.PuntosTotales || 0
            };
        } catch (error) {
            console.error('Error en SP_ObtenerEstadisticasConductor:', error);
            return await this.getStatsConductor(idUsuario); // Fallback a método directo
        }
    },

    /**
     * Eliminar simulación y sus resultados
     */
    async delete(id) {
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM RESULTADO WHERE Id_simulacion = @id');
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM SIMULACION WHERE Id_simulacion = @id');
        return true;
    },

    /**
     * Obtener ranking de conductores
     */
    async getRankingConductores() {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT 
                u.Id_usuario,
                u.Correo_usuario,
                e.Nombre as Equipo,
                COUNT(*) as totalCarreras,
                SUM(CASE WHEN r.Posicion = 1 THEN 25 
                         WHEN r.Posicion = 2 THEN 18
                         WHEN r.Posicion = 3 THEN 15
                         WHEN r.Posicion = 4 THEN 12
                         WHEN r.Posicion = 5 THEN 10
                         WHEN r.Posicion = 6 THEN 8
                         WHEN r.Posicion = 7 THEN 6
                         WHEN r.Posicion = 8 THEN 4
                         WHEN r.Posicion = 9 THEN 2
                         WHEN r.Posicion = 10 THEN 1
                         ELSE 0 END) as puntos,
                COUNT(CASE WHEN r.Posicion = 1 THEN 1 END) as victorias
            FROM RESULTADO r
            JOIN CARRO c ON r.Id_carro = c.Id_carro
            JOIN USUARIO u ON c.Id_conductor = u.Id_usuario
            LEFT JOIN EQUIPO e ON u.Id_equipo = e.Id_equipo
            GROUP BY u.Id_usuario, u.Correo_usuario, e.Nombre
            ORDER BY puntos DESC
        `);
        return result.recordset;
    },

    /**
     * Obtener todos los datos del dashboard de un conductor
     * Incluye: carro asignado, equipo, simulaciones y estadísticas
     */
    async getDriverDashboard(idUsuario) {
        const pool = await getConnection();
        
        // 1. Obtener el carro asignado al conductor
        const carroResult = await pool.request()
            .input('idUsuario', sql.Int, idUsuario)
            .query(`
                SELECT c.Id_carro, c.Finalizado, c.M_total, c.P_total, c.A_total,
                       e.Id_equipo, e.Nombre as Equipo, e.Presupuesto
                FROM CARRO c
                JOIN EQUIPO e ON c.Id_equipo = e.Id_equipo
                WHERE c.Id_conductor = @idUsuario
            `);
        
        const carro = carroResult.recordset[0] || null;
        
        // 2. Obtener las simulaciones del conductor
        const simulacionesResult = await pool.request()
            .input('idUsuario', sql.Int, idUsuario)
            .query(`
                SELECT s.Id_simulacion, s.Fecha_hora, 
                       c.Distancia_total, c.Cantidad_curvas,
                       r.Posicion, r.Tiempo_segundos, r.Vrecta, r.Vcurva, r.Penalizacion,
                       r.P_total, r.A_total, r.M_total
                FROM SIMULACION s
                JOIN RESULTADO r ON s.Id_simulacion = r.Id_simulacion
                JOIN CARRO ca ON r.Id_carro = ca.Id_carro
                LEFT JOIN CIRCUITO c ON s.Id_circuito = c.Id_circuito
                WHERE ca.Id_conductor = @idUsuario
                ORDER BY s.Fecha_hora DESC
            `);
        
        // 3. Obtener estadísticas
        const stats = await this.getStatsConductor(idUsuario);
        
        return {
            carro: carro ? {
                id: carro.Id_carro,
                finalizado: carro.Finalizado === 1,
                equipo: carro.Equipo,
                equipoId: carro.Id_equipo,
                presupuesto: carro.Presupuesto,
                stats: {
                    M: carro.M_total,
                    P: carro.P_total,
                    A: carro.A_total
                }
            } : null,
            simulaciones: simulacionesResult.recordset.map(s => ({
                id: s.Id_simulacion,
                fecha: s.Fecha_hora,
                circuito: {
                    distancia: parseFloat(s.Distancia_total),
                    curvas: s.Cantidad_curvas
                },
                posicion: s.Posicion,
                tiempo: parseFloat(s.Tiempo_segundos),
                vrecta: parseFloat(s.Vrecta),
                vcurva: parseFloat(s.Vcurva),
                penalizacion: parseFloat(s.Penalizacion),
                stats: {
                    P: s.P_total,
                    A: s.A_total,
                    M: s.M_total
                }
            })),
            stats: {
                victorias: stats.victorias || 0,
                podios: stats.podios || 0,
                carreras: stats.totalSimulaciones || 0,
                mejorTiempo: stats.mejorTiempo ? parseFloat(stats.mejorTiempo) : null,
                posicionPromedio: stats.posicionPromedio ? parseFloat(stats.posicionPromedio).toFixed(1) : null
            }
        };
    }
};

module.exports = simulacionesService;

