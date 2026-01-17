const express = require('express');
const router = express.Router();
const simulacionesService = require('../services/simulaciones.service');

/**
 * GET /api/simulaciones
 * Obtener todas las simulaciones
 */
router.get('/', async (req, res) => {
    try {
        const simulaciones = await simulacionesService.getAll();
        res.json(simulaciones);
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
 * POST /api/simulaciones
 * Crear nueva simulación
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

module.exports = router;
