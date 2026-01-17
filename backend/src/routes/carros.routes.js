const express = require('express');
const router = express.Router();
const carrosService = require('../services/carros.service');

// =============================================
// RUTAS ESTÁTICAS (antes de las rutas con parámetros)
// =============================================

/**
 * GET /api/carros
 * Obtener todos los carros
 */
router.get('/', async (req, res) => {
    try {
        const carros = await carrosService.getAll();
        res.json(carros);
    } catch (error) {
        console.error('Error al obtener carros:', error);
        res.status(500).json({ error: 'Error al obtener carros' });
    }
});

/**
 * GET /api/carros/mi-carro
 * Obtener el carro del conductor actual
 */
router.get('/mi-carro', async (req, res) => {
    try {
        const idUsuario = req.session?.userId;
        
        if (!idUsuario) {
            return res.status(401).json({ error: 'No autorizado' });
        }
        
        const carro = await carrosService.getByConductor(idUsuario);
        
        if (!carro) {
            return res.status(404).json({ error: 'No tienes un carro asignado' });
        }
        
        // Obtener partes instaladas
        const partes = await carrosService.getPartes(carro.Id_carro);
        
        res.json({
            ...carro,
            partes
        });
    } catch (error) {
        console.error('Error al obtener mi carro:', error);
        res.status(500).json({ error: 'Error al obtener carro' });
    }
});

/**
 * GET /api/carros/finalizados
 * Obtener todos los carros finalizados (para simulaciones)
 */
router.get('/finalizados', async (req, res) => {
    try {
        const carros = await carrosService.getFinalizados();
        res.json(carros);
    } catch (error) {
        console.error('Error al obtener carros finalizados:', error);
        res.status(500).json({ error: 'Error al obtener carros finalizados' });
    }
});

// =============================================
// RUTAS CON PARÁMETROS
// =============================================

/**
 * GET /api/carros/:id
 * Obtener un carro con su configuración
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const carro = await carrosService.getById(id);
        
        if (!carro) {
            return res.status(404).json({ error: 'Carro no encontrado' });
        }
        
        // Obtener partes instaladas
        const partes = await carrosService.getPartes(id);
        
        res.json({
            ...carro,
            partes
        });
    } catch (error) {
        console.error('Error al obtener carro:', error);
        res.status(500).json({ error: 'Error al obtener carro' });
    }
});

/**
 * GET /api/carros/:id/partes
 * Obtener partes instaladas en un carro
 */
router.get('/:id/partes', async (req, res) => {
    try {
        const { id } = req.params;
        const partes = await carrosService.getPartes(id);
        res.json(partes);
    } catch (error) {
        console.error('Error al obtener partes:', error);
        res.status(500).json({ error: 'Error al obtener partes' });
    }
});

/**
 * GET /api/carros/:id/inventario
 * Obtener partes disponibles en el inventario del equipo
 */
router.get('/:id/inventario', async (req, res) => {
    try {
        const { id } = req.params;
        const inventario = await carrosService.getInventarioEquipo(id);
        res.json(inventario);
    } catch (error) {
        console.error('Error al obtener inventario:', error);
        res.status(500).json({ error: 'Error al obtener inventario' });
    }
});

/**
 * POST /api/carros/:id/instalar-parte
 * Instalar una parte en el carro usando SP_InstalarParteEnCarro (transaccional)
 * Body: { idParte: number }
 */
router.post('/:id/instalar-parte', async (req, res) => {
    try {
        const { id } = req.params;
        const { idParte } = req.body;
        
        if (!idParte) {
            return res.status(400).json({ error: 'Falta el ID de la parte' });
        }
        
        // Usar el stored procedure con transacción
        const resultado = await carrosService.instalarParteSP(parseInt(id), parseInt(idParte));
        
        res.json(resultado);
    } catch (error) {
        console.error('Error al instalar parte:', error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * DELETE /api/carros/:id/partes/:parteId
 * Desinstalar una parte del carro (devuelve al inventario)
 */
router.delete('/:id/partes/:parteId', async (req, res) => {
    try {
        const { id, parteId } = req.params;
        
        // Obtener el equipo del carro
        const carro = await carrosService.getById(id);
        if (!carro) {
            return res.status(404).json({ error: 'Carro no encontrado' });
        }
        
        const resultado = await carrosService.desinstalarParte(
            parseInt(id), 
            parseInt(parteId), 
            carro.Id_equipo
        );
        
        // Obtener carro actualizado
        const carroActualizado = await carrosService.getById(id);
        const partes = await carrosService.getPartes(id);
        
        res.json({
            ...resultado,
            carro: carroActualizado,
            partes
        });
    } catch (error) {
        console.error('Error al desinstalar parte:', error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * PUT /api/carros/:id/finalizar
 * Marcar carro como finalizado
 */
router.put('/:id/finalizar', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar que tiene 5 partes
        const partes = await carrosService.getPartes(id);
        if (partes.length < 5) {
            return res.status(400).json({ 
                error: `El carro necesita 5 partes para finalizarse. Actualmente tiene ${partes.length}.` 
            });
        }
        
        const carro = await carrosService.marcarFinalizado(id, 1);
        
        res.json({
            success: true,
            mensaje: 'Carro finalizado exitosamente. ¡Listo para competir!',
            carro
        });
    } catch (error) {
        console.error('Error al finalizar carro:', error);
        res.status(500).json({ error: 'Error al finalizar carro' });
    }
});

/**
 * GET /api/carros/:id/stats
 * Calcular estadísticas totales del carro
 */
router.get('/:id/stats', async (req, res) => {
    try {
        const { id } = req.params;
        const carro = await carrosService.getById(id);
        
        if (!carro) {
            return res.status(404).json({ error: 'Carro no encontrado' });
        }
        
        const partes = await carrosService.getPartes(id);
        
        res.json({
            P: carro.P_total || 0,
            A: carro.A_total || 0,
            M: carro.M_total || 0,
            partesInstaladas: partes.length,
            partesTotales: 5,
            completo: partes.length === 5,
            finalizado: carro.Finalizado === 1
        });
    } catch (error) {
        console.error('Error al calcular stats:', error);
        res.status(500).json({ error: 'Error al calcular stats' });
    }
});

module.exports = router;
