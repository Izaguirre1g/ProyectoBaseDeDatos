const express = require('express');
const router = express.Router();
const partesService = require('../services/partes.service');
const { getConnection, sql } = require('../config/database');

/**
 * GET /api/partes
 * Obtener todas las partes o filtrar por categoria
 */
router.get('/', async (req, res) => {
    try {
        const { categoria, idCategoria } = req.query;
        
        if (idCategoria) {
            const partes = await partesService.getByCategoria(parseInt(idCategoria));
            return res.json(partes);
        }
        
        const partes = await partesService.getAll();
        
        // Si hay filtro por nombre de categoría
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
 * GET /api/partes/categorias
 * Obtener todas las categorías
 */
router.get('/categorias', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM CATEGORIA ORDER BY Id_categoria');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
});

/**
 * GET /api/partes/:id
 * Obtener una parte por ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const parte = await partesService.getById(id);
        
        if (!parte) {
            return res.status(404).json({ error: 'Parte no encontrada' });
        }
        
        res.json(parte);
    } catch (error) {
        console.error('Error al obtener parte:', error);
        res.status(500).json({ error: 'Error al obtener parte' });
    }
});

/**
 * POST /api/partes
 * Crear nueva parte
 */
router.post('/', async (req, res) => {
    try {
        const { nombre, marca, manejo, aerodinamica, potencia, precio, idCategoria } = req.body;
        
        if (!nombre || !idCategoria) {
            return res.status(400).json({ error: 'Nombre y categoría son requeridos' });
        }
        
        const parte = await partesService.create({
            nombre, marca, manejo, aerodinamica, potencia, precio, idCategoria
        });
        
        res.status(201).json(parte);
    } catch (error) {
        console.error('Error al crear parte:', error);
        res.status(500).json({ error: 'Error al crear parte' });
    }
});

/**
 * PUT /api/partes/:id
 * Actualizar parte
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, marca, manejo, aerodinamica, potencia, precio, idCategoria } = req.body;
        
        const parte = await partesService.update(id, {
            nombre, marca, manejo, aerodinamica, potencia, precio, idCategoria
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

/**
 * DELETE /api/partes/:id
 * Eliminar parte
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await partesService.delete(id);
        res.json({ message: 'Parte eliminada' });
    } catch (error) {
        console.error('Error al eliminar parte:', error);
        res.status(500).json({ error: 'Error al eliminar parte' });
    }
});

module.exports = router;
