const express = require('express');
const router = express.Router();
const simulacionesService = require('../services/simulaciones.service');

// =============================================
// RUTAS ESTÁTICAS (deben ir ANTES de las rutas con parámetros)
// =============================================

/**
 * GET /api/simulaciones
 * Obtener dashboard completo del conductor (carro, simulaciones, stats)
 * Si es Admin, devuelve todas las simulaciones del sistema
 * Si es Engineer, devuelve datos de todo su equipo
 */
router.get('/', async (req, res) => {
    try {
        const idUsuario = req.session?.userId;
        const userRole = req.session?.rol;
        
        console.log(`[SIMULACIONES] userId: ${idUsuario}, rol: ${userRole}`);
        
        // Si es Admin, devolver todas las simulaciones
        if (userRole === 'Admin') {
            console.log(`[SIMULACIONES] Admin detectado, devolviendo todas las simulaciones`);
            const simulaciones = await simulacionesService.getAll();
            return res.json({ simulaciones });
        }
        
        // Si es Engineer, devolver datos de todo su equipo
        if (userRole === 'Engineer') {
            console.log(`[SIMULACIONES] Ingeniero detectado, devolviendo dashboard del equipo`);
            const teamDashboard = await simulacionesService.getTeamDashboard(idUsuario);
            return res.json(teamDashboard);
        }
        
        // Si hay usuario logueado (conductor), devolver su dashboard
        if (idUsuario) {
            console.log(`[SIMULACIONES] Conductor detectado, devolviendo su dashboard`);
            const dashboard = await simulacionesService.getDriverDashboard(idUsuario);
            return res.json(dashboard);
        }
        
        // Si no hay sesión, devolver todas las simulaciones (para debugging/testing)
        console.log(`[SIMULACIONES] Sin sesión, devolviendo todas las simulaciones`);
        const simulaciones = await simulacionesService.getAll();
        res.json({ simulaciones });
    } catch (error) {
        console.error('Error obteniendo simulaciones:', error);
        res.status(500).json({ error: 'Error al obtener simulaciones' });
    }
});

/**
 * GET /api/simulaciones/driver/stats
 * Obtener estadísticas del conductor actual
 */
router.get('/driver/stats', async (req, res) => {
    try {
        const idUsuario = req.session.userId;
        
        if (!idUsuario) {
            return res.status(401).json({ error: 'No autorizado' });
        }
        
        // Obtener estadísticas del conductor
        const stats = await simulacionesService.getDriverStats(idUsuario);
        res.json(stats);
    } catch (error) {
        console.error('Error obteniendo estadísticas del conductor:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

/**
 * GET /api/simulaciones/ranking/conductores
 * Obtener ranking de conductores
 */
router.get('/ranking/conductores', async (req, res) => {
    try {
        const ranking = await simulacionesService.getRankingConductores();
        res.json(ranking);
    } catch (error) {
        console.error('Error obteniendo ranking:', error);
        res.status(500).json({ error: 'Error al obtener ranking' });
    }
});

/**
 * POST /api/simulaciones/ejecutar
 * Ejecutar una simulación completa usando stored procedure con transacción
 * Body: { idCircuito: number, carros: [{idCarro: number, habilidad: number}] }
 */
router.post('/ejecutar', async (req, res) => {
    try {
        const { idCircuito, carros, fecha } = req.body;
        
        // Validaciones
        if (!idCircuito) {
            return res.status(400).json({ 
                error: 'Falta el circuito (idCircuito)' 
            });
        }
        
        if (!carros || !Array.isArray(carros) || carros.length === 0) {
            return res.status(400).json({ 
                error: 'Debe proporcionar al menos un carro para la simulación' 
            });
        }
        
        // Ejecutar simulación con SP (transaccional)
        const resultado = await simulacionesService.ejecutarSimulacion({
            idCircuito,
            carros,
            fecha: fecha ? new Date(fecha) : new Date()
        });
        
        res.status(201).json(resultado);
    } catch (error) {
        console.error('Error ejecutando simulación:', error);
        res.status(500).json({ 
            error: error.message || 'Error al ejecutar la simulación' 
        });
    }
});

/**
 * POST /api/simulaciones
 * Crear nueva simulación (básica)
 */
router.post('/', async (req, res) => {
    try {
        const { idCircuito, idCarro } = req.body;
        
        if (!idCircuito || !idCarro) {
            return res.status(400).json({ 
                error: 'Faltan datos requeridos: idCircuito, idCarro' 
            });
        }
        
        const simulacion = await simulacionesService.create({
            idCircuito,
            idCarro
        });
        
        res.status(201).json(simulacion);
    } catch (error) {
        console.error('Error creando simulación:', error);
        res.status(500).json({ error: 'Error al crear simulación' });
    }
});

// =============================================
// RUTAS CON PARÁMETROS (deben ir AL FINAL)
// =============================================

/**
 * GET /api/simulaciones/:id
 * Obtener simulación por ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const simulacion = await simulacionesService.getById(id);
        
        if (!simulacion) {
            return res.status(404).json({ error: 'Simulación no encontrada' });
        }
        
        res.json(simulacion);
    } catch (error) {
        console.error('Error obteniendo simulación:', error);
        res.status(500).json({ error: 'Error al obtener simulación' });
    }
});

/**
 * GET /api/simulaciones/:id/resultados
 * Obtener resultados de una simulación
 */
router.get('/:id/resultados', async (req, res) => {
    try {
        const { id } = req.params;
        const resultados = await simulacionesService.getResultados(id);
        res.json(resultados);
    } catch (error) {
        console.error('Error obteniendo resultados:', error);
        res.status(500).json({ error: 'Error al obtener resultados' });
    }
});

/**
 * DELETE /api/simulaciones/:id
 * Eliminar simulación y sus resultados
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await simulacionesService.delete(id);
        res.json({ message: 'Simulación eliminada exitosamente' });
    } catch (error) {
        console.error('Error eliminando simulación:', error);
        res.status(500).json({ error: 'Error al eliminar simulación' });
    }
});

module.exports = router;
