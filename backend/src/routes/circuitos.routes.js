const express = require('express');
const router = express.Router();
const circuitosService = require('../services/circuitos.service');

/**
 * GET /api/circuitos
 * Obtener todos los circuitos
 */
router.get('/', async (req, res) => {
    try {
        const circuitos = await circuitosService.getAll();
        res.json(circuitos);
    } catch (error) {
        console.error('Error al obtener circuitos:', error);
        res.status(500).json({ error: 'Error al obtener circuitos' });
    }
});

/**
 * GET /api/circuitos/:id
 * Obtener circuito por ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const circuito = await circuitosService.getById(id);
        
        if (!circuito) {
            return res.status(404).json({ error: 'Circuito no encontrado' });
        }
        
        res.json(circuito);
    } catch (error) {
        console.error('Error al obtener circuito:', error);
        res.status(500).json({ error: 'Error al obtener circuito' });
    }
});

module.exports = router;
