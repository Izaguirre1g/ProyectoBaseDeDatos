// RUTAS DE CARROS
const express = require('express');
const router = express.Router();
const carrosService = require('../services/carros.service');

/**
 * GET /api/carros
 * Listar todos los carros
 */
router.get('/', async (req, res) => {
    try {
        const { idEquipo, finalizado } = req.query;
        
        if (finalizado === '1' || finalizado === 'true') {
            const carros = await carrosService.getFinalizados();
            return res.json(carros);
        }
        
        if (idEquipo) {
            const carros = await carrosService.getByEquipo(parseInt(idEquipo));
            return res.json(carros);
        }
        
        const carros = await carrosService.getAll();
        res.json(carros);
    } catch (error) {
        console.error('Error al obtener carros:', error);
        res.status(500).json({ error: 'Error al obtener carros' });
    }
});

/**
 * GET /api/carros/disponibles
 * Obtener carros disponibles para simulaciones (con conductor y finalizados preferidos)
 */
router.get('/disponibles', async (req, res) => {
    try {
        const carros = await carrosService.getAll();
        res.json(carros);
    } catch (error) {
        console.error('Error al obtener carros disponibles:', error);
        res.status(500).json({ error: 'Error al obtener carros disponibles' });
    }
});

/**
 * GET /api/carros/:id/configuracion
 * Obtener configuración completa del carro (5 categorías)
 */
router.get('/:id/configuracion', async (req, res) => {
    try {
        const { id } = req.params;
        const configuracion = await carrosService.getConfiguracion(parseInt(id));
        res.json(configuracion);
    } catch (error) {
        console.error('Error al obtener configuración:', error);
        res.status(500).json({ error: 'Error al obtener configuración' });
    }
});

/**
 * GET /api/carros/:id/partes
 * Obtener partes instaladas en el carro
 */
router.get('/:id/partes', async (req, res) => {
    try {
        const { id } = req.params;
        const partes = await carrosService.getPartes(parseInt(id));
        res.json(partes);
    } catch (error) {
        console.error('Error al obtener partes:', error);
        res.status(500).json({ error: 'Error al obtener partes del carro' });
    }
});

/**
 * POST /api/carros/:id/instalar
 * INSTALAR PARTE EN EL CARRO - ENDPOINT CLAVE
 */
router.post('/:id/instalar', async (req, res) => {
    try {
        const { id } = req.params;
        const { idParte } = req.body;
        
        if (!idParte) {
            return res.status(400).json({ error: 'idParte es requerido' });
        }
        
        const resultado = await carrosService.instalarParte(
            parseInt(id),
            parseInt(idParte)
        );
        
        if (resultado.success) {
            res.json(resultado);
        } else {
            res.status(400).json(resultado);
        }
        
    } catch (error) {
        console.error('Error al instalar parte:', error);
        res.status(500).json({ 
            error: 'Error al instalar parte',
            detalle: error.message 
        });
    }
});

/**
 * DELETE /api/carros/:id/desinstalar/:idCategoria
 * Desinstalar parte del carro
 */
router.delete('/:id/desinstalar/:idCategoria', async (req, res) => {
    try {
        const { id, idCategoria } = req.params;
        const { idEquipo } = req.body;
        
        if (!idEquipo) {
            return res.status(400).json({ error: 'idEquipo es requerido' });
        }
        
        const resultado = await carrosService.desinstalarParte(
            parseInt(id),
            parseInt(idCategoria),
            parseInt(idEquipo)
        );
        
        if (resultado.success) {
            res.json(resultado);
        } else {
            res.status(400).json(resultado);
        }
        
    } catch (error) {
        console.error('Error al desinstalar parte:', error);
        res.status(500).json({ 
            error: 'Error al desinstalar parte',
            detalle: error.message 
        });
    }
});

/**
 * GET /api/carros/:id
 * Obtener un carro específico
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const carro = await carrosService.getById(parseInt(id));
        
        if (!carro) {
            return res.status(404).json({ error: 'Carro no encontrado' });
        }
        
        res.json(carro);
    } catch (error) {
        console.error('Error al obtener carro:', error);
        res.status(500).json({ error: 'Error al obtener carro' });
    }
});

/**
 * POST /api/carros
 * Crear nuevo carro usando SP_CrearCarro
 */
router.post('/', async (req, res) => {
    try {
        const { idEquipo } = req.body;
        
        if (!idEquipo) {
            return res.status(400).json({ error: 'idEquipo es requerido' });
        }
        
        const resultado = await carrosService.crearCarro(parseInt(idEquipo));
        
        if (resultado.success) {
            res.status(201).json(resultado);
        } else {
            res.status(400).json(resultado);
        }
    } catch (error) {
        console.error('Error al crear carro:', error);
        res.status(500).json({ 
            error: 'Error al crear carro',
            detalle: error.message 
        });
    }
});

/**
 * PUT /api/carros/:id/conductor
 * Asignar conductor a un carro
 */
router.put('/:id/conductor', async (req, res) => {
    try {
        const { id } = req.params;
        const { idConductor } = req.body;
        
        if (!idConductor) {
            return res.status(400).json({ error: 'idConductor es requerido' });
        }
        
        const carro = await carrosService.assignDriver(
            parseInt(id),
            parseInt(idConductor)
        );
        
        res.json(carro);
    } catch (error) {
        console.error('Error al asignar conductor:', error);
        res.status(500).json({ error: 'Error al asignar conductor' });
    }
});

/**
 * PUT /api/carros/:id/finalizar
 * Marcar carro como finalizado
 */
router.put('/:id/finalizar', async (req, res) => {
    try {
        const { id } = req.params;
        const carro = await carrosService.finalizar(parseInt(id));
        res.json(carro);
    } catch (error) {
        console.error('Error al finalizar carro:', error);
        res.status(500).json({ error: 'Error al finalizar carro' });
    }
});

/**
 * DELETE /api/carros/:id
 * Eliminar carro
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await carrosService.delete(parseInt(id));
        res.json({ message: 'Carro eliminado' });
    } catch (error) {
        console.error('Error al eliminar carro:', error);
        res.status(500).json({ error: 'Error al eliminar carro' });
    }
});

module.exports = router;