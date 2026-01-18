// ================================================
// RUTAS DE EQUIPOS - VERSIÓN CORREGIDA
// ================================================

const express = require('express');
const router = express.Router();
const equiposService = require('../services/equipos.service');

/**
 * GET /api/equipos
 * Listar todos los equipos
 */
router.get('/', async (req, res) => {
    try {
        const equipos = await equiposService.getAll();
        res.json(equipos);
    } catch (error) {
        console.error('Error al obtener equipos:', error);
        res.status(500).json({ error: 'Error al obtener equipos' });
    }
});

/**
 * GET /api/equipos/:id/presupuesto
 * Obtener presupuesto detallado del equipo
 */
router.get('/:id/presupuesto', async (req, res) => {
    try {
        const { id } = req.params;
        const presupuesto = await equiposService.getPresupuesto(parseInt(id));
        res.json(presupuesto);
    } catch (error) {
        console.error('Error al obtener presupuesto:', error);
        res.status(500).json({ error: 'Error al obtener presupuesto' });
    }
});

/**
 * GET /api/equipos/:id/aportes
 * Obtener lista de aportes del equipo
 */
router.get('/:id/aportes', async (req, res) => {
    try {
        const { id } = req.params;
        const aportes = await equiposService.getAportes(parseInt(id));
        res.json(aportes);
    } catch (error) {
        console.error('Error al obtener aportes:', error);
        res.status(500).json({ error: 'Error al obtener aportes' });
    }
});

/**
 * GET /api/equipos/:id/gastos
 * Obtener lista de gastos/pedidos del equipo
 */
router.get('/:id/gastos', async (req, res) => {
    try {
        const { id } = req.params;
        const gastos = await equiposService.getGastos(parseInt(id));
        res.json(gastos);
    } catch (error) {
        console.error('Error al obtener gastos:', error);
        res.status(500).json({ error: 'Error al obtener gastos' });
    }
});

/**
 * POST /api/equipos/:id/aportes
 * Agregar un nuevo aporte al equipo usando SP con transacción
 */
router.post('/:id/aportes', async (req, res) => {
    try {
        const { id } = req.params;
        const { monto, idPatrocinador, descripcion } = req.body;
        
        if (!monto || !idPatrocinador) {
            return res.status(400).json({ 
                error: 'monto e idPatrocinador son requeridos' 
            });
        }
        
        if (monto <= 0) {
            return res.status(400).json({ 
                error: 'El monto debe ser mayor a 0' 
            });
        }
        
        const result = await equiposService.addAporte({
            idEquipo: parseInt(id),
            monto: parseFloat(monto),
            idPatrocinador: parseInt(idPatrocinador),
            descripcion: descripcion || null
        });
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json({ error: result.mensaje });
        }
    } catch (error) {
        console.error('Error al agregar aporte:', error);
        res.status(500).json({ 
            error: 'Error al agregar aporte',
            detalle: error.message 
        });
    }
});

/**
 * GET /api/equipos/:id/patrocinadores
 * Obtener patrocinadores del equipo con totales
 */
router.get('/:id/patrocinadores', async (req, res) => {
    try {
        const { id } = req.params;
        const patrocinadores = await equiposService.getPatrocinadores(parseInt(id));
        res.json(patrocinadores);
    } catch (error) {
        console.error('Error al obtener patrocinadores:', error);
        res.status(500).json({ error: 'Error al obtener patrocinadores' });
    }
});

/**
 * GET /api/equipos/:id/pilotos
 * Obtener conductores del equipo
 */
router.get('/:id/pilotos', async (req, res) => {
    try {
        const { id } = req.params;
        const pilotos = await equiposService.getPilotos(parseInt(id));
        res.json(pilotos);
    } catch (error) {
        console.error('Error al obtener pilotos:', error);
        res.status(500).json({ error: 'Error al obtener pilotos' });
    }
});

/**
 * GET /api/equipos/:id/carros
 * Obtener carros del equipo
 */
router.get('/:id/carros', async (req, res) => {
    try {
        const { id } = req.params;
        const carros = await equiposService.getCarros(parseInt(id));
        res.json(carros);
    } catch (error) {
        console.error('Error al obtener carros:', error);
        res.status(500).json({ error: 'Error al obtener carros del equipo' });
    }
});

/**
 * GET /api/equipos/:id/inventario
 * Obtener inventario del equipo
 */
router.get('/:id/inventario', async (req, res) => {
    try {
        const { id } = req.params;
        const inventario = await equiposService.getInventario(parseInt(id));
        res.json(inventario);
    } catch (error) {
        console.error('Error al obtener inventario:', error);
        res.status(500).json({ error: 'Error al obtener inventario del equipo' });
    }
});

/**
 * GET /api/equipos/patrocinadores
 * Obtener todos los patrocinadores disponibles
 */
router.get('/patrocinadores', async (req, res) => {
    try {
        const patrocinadores = await equiposService.getAllPatrocinadores();
        res.json(patrocinadores);
    } catch (error) {
        console.error('Error al obtener patrocinadores:', error);
        res.status(500).json({ error: 'Error al obtener patrocinadores' });
    }
});

/**
 * GET /api/equipos/:id
 * Obtener un equipo específico
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const equipo = await equiposService.getById(parseInt(id));
        
        if (!equipo) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }
        
        res.json(equipo);
    } catch (error) {
        console.error('Error al obtener equipo:', error);
        res.status(500).json({ error: 'Error al obtener equipo' });
    }
});

/**
 * POST /api/equipos
 * Crear nuevo equipo
 */
router.post('/', async (req, res) => {
    try {
        const { nombre } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ error: 'nombre es requerido' });
        }
        
        const equipo = await equiposService.create({ nombre });
        res.status(201).json(equipo);
    } catch (error) {
        console.error('Error al crear equipo:', error);
        res.status(500).json({ error: 'Error al crear equipo' });
    }
});

/**
 * PUT /api/equipos/:id
 * Actualizar equipo
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ error: 'nombre es requerido' });
        }
        
        const equipo = await equiposService.update(parseInt(id), { nombre });
        
        if (!equipo) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }
        
        res.json(equipo);
    } catch (error) {
        console.error('Error al actualizar equipo:', error);
        res.status(500).json({ error: 'Error al actualizar equipo' });
    }
});

/**
 * DELETE /api/equipos/:id
 * Eliminar equipo
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await equiposService.delete(parseInt(id));
        res.json({ message: 'Equipo eliminado' });
    } catch (error) {
        console.error('Error al eliminar equipo:', error);
        res.status(500).json({ error: 'Error al eliminar equipo' });
    }
});

module.exports = router;
