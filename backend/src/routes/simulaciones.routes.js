const express = require('express');
const router = express.Router();
const { getConnection, sql } = require('../config/database');

// GET /api/simulaciones - Obtener simulaciones del conductor actual
router.get('/', async (req, res) => {
    try {
        // Verificar autenticación
        if (!req.session.userId) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        
        const pool = await getConnection();
        
        // Obtener el carro del conductor actual
        const carroResult = await pool.request()
            .input('userId', sql.Int, req.session.userId)
            .query(`
                SELECT c.Id_carro, c.P_total, c.A_total, c.M_total, c.Finalizado,
                       e.Id_equipo, e.Nombre as Equipo
                FROM CARRO c
                JOIN EQUIPO e ON c.Id_equipo = e.Id_equipo
                WHERE c.Id_conductor = @userId
            `);
        
        if (carroResult.recordset.length === 0) {
            return res.json({ 
                simulaciones: [],
                carro: null,
                message: 'No tienes un carro asignado'
            });
        }
        
        const carro = carroResult.recordset[0];
        
        // Obtener simulaciones donde participó el carro del conductor
        const simResult = await pool.request()
            .input('carroId', sql.Int, carro.Id_carro)
            .query(`
                SELECT 
                    s.Id_simulacion,
                    s.Fecha_hora,
                    c.Id_circuito,
                    c.Distancia_total,
                    c.Cantidad_curvas,
                    r.Id_resultado,
                    r.Vrecta,
                    r.Vcurva,
                    r.Penalizacion,
                    r.Tiempo_segundos,
                    r.Posicion,
                    r.P_total,
                    r.A_total,
                    r.M_total,
                    r.H_conductor
                FROM SIMULACION s
                JOIN CIRCUITO c ON s.Id_circuito = c.Id_circuito
                JOIN RESULTADO r ON s.Id_simulacion = r.Id_simulacion
                WHERE r.Id_carro = @carroId
                ORDER BY s.Fecha_hora DESC
            `);
        
        // Formatear datos para el frontend
        const simulaciones = simResult.recordset.map(sim => ({
            id: sim.Id_simulacion,
            fecha: sim.Fecha_hora,
            circuito: {
                id: sim.Id_circuito,
                distancia: parseFloat(sim.Distancia_total),
                curvas: sim.Cantidad_curvas
            },
            resultado: {
                posicion: sim.Posicion,
                vRecta: parseFloat(sim.Vrecta),
                vCurva: parseFloat(sim.Vcurva),
                penalizacion: parseFloat(sim.Penalizacion),
                tiempoSegundos: parseFloat(sim.Tiempo_segundos)
            },
            stats: {
                P: sim.P_total,
                A: sim.A_total,
                M: sim.M_total,
                H: sim.H_conductor
            }
        }));
        
        res.json({
            simulaciones,
            carro: {
                id: carro.Id_carro,
                equipo: carro.Equipo,
                equipoId: carro.Id_equipo,
                finalizado: carro.Finalizado === 1,
                stats: {
                    P: carro.P_total,
                    A: carro.A_total,
                    M: carro.M_total
                }
            }
        });
        
    } catch (error) {
        console.error('Error al obtener simulaciones:', error);
        res.status(500).json({ error: 'Error al obtener simulaciones' });
    }
});

// GET /api/simulaciones/:id - Obtener detalle de una simulación con podio
router.get('/:id', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        
        const simId = parseInt(req.params.id);
        const pool = await getConnection();
        
        // Obtener info de la simulación
        const simResult = await pool.request()
            .input('simId', sql.Int, simId)
            .query(`
                SELECT 
                    s.Id_simulacion,
                    s.Fecha_hora,
                    c.Id_circuito,
                    c.Distancia_total,
                    c.Cantidad_curvas
                FROM SIMULACION s
                JOIN CIRCUITO c ON s.Id_circuito = c.Id_circuito
                WHERE s.Id_simulacion = @simId
            `);
        
        if (simResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Simulación no encontrada' });
        }
        
        const sim = simResult.recordset[0];
        
        // Obtener todos los resultados (podio completo)
        const resultsResult = await pool.request()
            .input('simId', sql.Int, simId)
            .query(`
                SELECT 
                    r.Posicion,
                    r.Tiempo_segundos,
                    r.P_total,
                    r.A_total,
                    r.M_total,
                    r.H_conductor,
                    r.Vrecta,
                    r.Vcurva,
                    r.Penalizacion,
                    car.Id_carro,
                    e.Nombre as Equipo,
                    u.Correo_usuario as Piloto
                FROM RESULTADO r
                JOIN CARRO car ON r.Id_carro = car.Id_carro
                JOIN EQUIPO e ON car.Id_equipo = e.Id_equipo
                LEFT JOIN USUARIO u ON car.Id_conductor = u.Id_usuario
                WHERE r.Id_simulacion = @simId
                ORDER BY r.Posicion ASC
            `);
        
        const podio = resultsResult.recordset.map(r => ({
            posicion: r.Posicion,
            piloto: r.Piloto ? r.Piloto.split('@')[0] : `Carro ${r.Id_carro}`,
            equipo: r.Equipo,
            tiempoSegundos: parseFloat(r.Tiempo_segundos),
            stats: {
                P: r.P_total,
                A: r.A_total,
                M: r.M_total,
                H: r.H_conductor
            }
        }));
        
        res.json({
            id: sim.Id_simulacion,
            fecha: sim.Fecha_hora,
            circuito: {
                id: sim.Id_circuito,
                distancia: parseFloat(sim.Distancia_total),
                curvas: sim.Cantidad_curvas
            },
            podio
        });
        
    } catch (error) {
        console.error('Error al obtener detalle de simulación:', error);
        res.status(500).json({ error: 'Error al obtener detalle' });
    }
});

// GET /api/simulaciones/circuitos - Obtener lista de circuitos
router.get('/circuitos/lista', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT Id_circuito, Distancia_total, Cantidad_curvas
            FROM CIRCUITO
            ORDER BY Id_circuito
        `);
        
        // Nombres de circuitos (mapeo por distancia ya que no hay nombre en la BD)
        const nombreCircuitos = {
            5.793: 'Monza',
            3.337: 'Monaco',
            7.004: 'Spa-Francorchamps',
            5.891: 'Silverstone',
            5.807: 'Suzuka',
            4.318: 'Barcelona',
            5.412: 'Interlagos',
            6.003: 'COTA'
        };
        
        const circuitos = result.recordset.map(c => ({
            id: c.Id_circuito,
            nombre: nombreCircuitos[parseFloat(c.Distancia_total)] || `Circuito ${c.Id_circuito}`,
            distancia: parseFloat(c.Distancia_total),
            curvas: c.Cantidad_curvas
        }));
        
        res.json(circuitos);
    } catch (error) {
        console.error('Error al obtener circuitos:', error);
        res.status(500).json({ error: 'Error al obtener circuitos' });
    }
});

// GET /api/simulaciones/driver/stats - Estadísticas del conductor
router.get('/driver/stats', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        
        const pool = await getConnection();
        
        // Obtener carro del conductor
        const carroResult = await pool.request()
            .input('userId', sql.Int, req.session.userId)
            .query('SELECT Id_carro FROM CARRO WHERE Id_conductor = @userId');
        
        if (carroResult.recordset.length === 0) {
            return res.json({
                victorias: 0,
                podios: 0,
                carreras: 0,
                mejorTiempo: null,
                promedioPos: null
            });
        }
        
        const carroId = carroResult.recordset[0].Id_carro;
        
        // Estadísticas
        const statsResult = await pool.request()
            .input('carroId', sql.Int, carroId)
            .query(`
                SELECT 
                    COUNT(*) as carreras,
                    SUM(CASE WHEN Posicion = 1 THEN 1 ELSE 0 END) as victorias,
                    SUM(CASE WHEN Posicion <= 3 THEN 1 ELSE 0 END) as podios,
                    MIN(Tiempo_segundos) as mejorTiempo,
                    AVG(CAST(Posicion as FLOAT)) as promedioPos
                FROM RESULTADO
                WHERE Id_carro = @carroId
            `);
        
        const stats = statsResult.recordset[0];
        
        res.json({
            victorias: stats.victorias || 0,
            podios: stats.podios || 0,
            carreras: stats.carreras || 0,
            mejorTiempo: stats.mejorTiempo ? parseFloat(stats.mejorTiempo) : null,
            promedioPos: stats.promedioPos ? parseFloat(stats.promedioPos) : null
        });
        
    } catch (error) {
        console.error('Error al obtener stats:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

module.exports = router;
