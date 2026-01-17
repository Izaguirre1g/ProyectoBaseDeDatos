// RUTAS DE PARTES
const express = require('express');
const router = express.Router();
const partesService = require('../services/partes.service');

/**
 * GET /api/partes
 * Obtener todas las partes (con filtros opcionales)
 */
router.get('/', async (req, res) => {
    try {
        const { categoria, idCategoria } = req.query;
        
        if (idCategoria) {
            const partes = await partesService.getByCategoria(parseInt(idCategoria));
            return res.json(partes);
        }
        
        const partes = await partesService.getAll();
        
        if (categoria) {
            const filtradas = partes.filter(p => 
                p.Categoria?.toLowerCase() === categoria.toLowerCase()
            );
            return res.json(filtradas);
        }
        
        res.json(partes);
    } catch (error) {
        console.error('Error al obtener partes:', error);
        res.status(500).json({ error: 'Error al obtener partes' });
    }
});

/**
 * GET /api/partes/categorias/todas
 * Obtener todas las categorías (ANTES de /:id)
 */
router.get('/categorias/todas', async (req, res) => {
    try {
        const categorias = await partesService.getCategorias();
        res.json(categorias);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
});

/**
 * GET /api/partes/inventario/total
 * Catálogo con stock disponible
 */
router.get('/inventario/total', async (req, res) => {
    try {
        const inventario = await partesService.getInventarioTotal();
        res.json(inventario);
    } catch (error) {
        console.error('Error al obtener inventario total:', error);
        res.status(500).json({ error: 'Error al obtener inventario total' });
    }
});

/**
 * GET /api/partes/inventario/:idEquipo
 * Inventario de un equipo específico
 */
router.get('/inventario/:idEquipo', async (req, res) => {
    try {
        const { idEquipo } = req.params;
        const inventario = await partesService.getInventario(parseInt(idEquipo));
        res.json(inventario);
    } catch (error) {
        console.error('Error al obtener inventario del equipo:', error);
        res.status(500).json({ error: 'Error al obtener inventario del equipo' });
    }
});

/**
 * POST /api/partes/comprar
 * COMPRAR PARTE - ENDPOINT CLAVE
 */
router.post('/comprar', async (req, res) => {
    try {
        const { idEquipo, idParte, cantidad } = req.body;
        
        if (!idEquipo || !idParte || !cantidad) {
            return res.status(400).json({ 
                error: 'Faltan parámetros: idEquipo, idParte, cantidad' 
            });
        }
        
        if (cantidad <= 0) {
            return res.status(400).json({ 
                error: 'La cantidad debe ser mayor a 0' 
            });
        }
        
        const resultado = await partesService.comprar(
            parseInt(idEquipo),
            parseInt(idParte),
            parseInt(cantidad)
        );
        
        if (resultado.success) {
            res.json(resultado);
        } else {
            res.status(400).json(resultado);
        }
        
    } catch (error) {
        console.error('Error en compra:', error);
        res.status(500).json({ 
            error: 'Error al procesar la compra',
            detalle: error.message 
        });
    }
});

/**
 * POST /api/partes/verificar-disponibilidad
 * Verificar si se puede comprar
 */
router.post('/verificar-disponibilidad', async (req, res) => {
    try {
        const { idEquipo, idParte, cantidad } = req.body;
        
        if (!idEquipo || !idParte || !cantidad) {
            return res.status(400).json({ 
                error: 'Faltan parámetros' 
            });
        }
        
        const disponibilidad = await partesService.verificarDisponibilidad(
            parseInt(idEquipo),
            parseInt(idParte),
            parseInt(cantidad)
        );
        
        res.json(disponibilidad);
        
    } catch (error) {
        console.error('Error al verificar disponibilidad:', error);
        res.status(500).json({ error: 'Error al verificar disponibilidad' });
    }
});

/**
 * GET /api/partes/:id
 * Obtener una parte específica
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const parte = await partesService.getById(parseInt(id));
        
        if (!parte) {
            return res.status(404).json({ error: 'Parte no encontrada' });
        }
        
        res.json(parte);
    } catch (error) {
        console.error('Error al obtener parte:', error);
        res.status(500).json({ error: 'Error al obtener parte' });
    }
});

// CRUD - Admin
router.post('/', async (req, res) => {
    try {
        const { nombre, marca, manejo, aerodinamica, potencia, precio, idCategoria } = req.body;
        
        if (!nombre || !idCategoria) {
            return res.status(400).json({ error: 'Nombre y categoría requeridos' });
        }
        
        const parte = await partesService.create({
            nombre, marca,
            manejo: parseInt(manejo) || 0,
            aerodinamica: parseInt(aerodinamica) || 0,
            potencia: parseInt(potencia) || 0,
            precio: parseFloat(precio) || 0,
            idCategoria: parseInt(idCategoria)
        });
        
        res.status(201).json(parte);
    } catch (error) {
        console.error('Error al crear parte:', error);
        res.status(500).json({ error: 'Error al crear parte' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, marca, manejo, aerodinamica, potencia, precio, idCategoria } = req.body;
        
        const parte = await partesService.update(parseInt(id), {
            nombre, marca,
            manejo: parseInt(manejo),
            aerodinamica: parseInt(aerodinamica),
            potencia: parseInt(potencia),
            precio: parseFloat(precio),
            idCategoria: parseInt(idCategoria)
        });
        
        if (!parte) {
            return res.status(404).json({ error: 'Parte no encontrada' });
        }
        
        res.json(parte);
    } catch (error) {
        console.error('Error al actualizar parte:', error);
        res.status(500).json({ error: 'Error al actualizar parte' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await partesService.delete(parseInt(id));
        res.json({ message: 'Parte eliminada' });
    } catch (error) {
        console.error('Error al eliminar parte:', error);
        res.status(500).json({ error: 'Error al eliminar parte' });
    }
});

module.exports = router;

