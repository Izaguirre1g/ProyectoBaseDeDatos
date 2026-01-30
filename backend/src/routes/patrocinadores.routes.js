// RUTAS DE PATROCINADORES
const express = require('express');
const router = express.Router();
const patrocinadoresService = require('../services/patrocinadores.service');

/**
 * GET /api/patrocinadores
 * Obtener todos los patrocinadores
 */
router.get('/', async (req, res) => {
    try {
        const patrocinadores = await patrocinadoresService.getAll();
        res.json(patrocinadores);
    } catch (error) {
        console.error('Error al obtener patrocinadores:', error);
        res.status(500).json({ error: 'Error al obtener patrocinadores' });
    }
});

/**
 * GET /api/patrocinadores/:id
 * Obtener patrocinador por ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const patrocinador = await patrocinadoresService.getById(parseInt(id));
        
        if (!patrocinador) {
            return res.status(404).json({ error: 'Patrocinador no encontrado' });
        }
        
        res.json(patrocinador);
    } catch (error) {
        console.error('Error al obtener patrocinador:', error);
        res.status(500).json({ error: 'Error al obtener patrocinador' });
    }
});

/**
 * POST /api/patrocinadores
 * Crear nuevo patrocinador (Solo Admin)
 */
router.post('/', async (req, res) => {
    try {
        console.log('CREAR PATROCINADOR - Usuario rol:', req.session?.rol);
        
        // Verificar que el usuario es Admin
        if (req.session?.rol !== 'Admin') {
            return res.status(403).json({ 
                error: 'Solo los administradores pueden crear patrocinadores' 
            });
        }
        
        const { nombre } = req.body;
        
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: 'El nombre del patrocinador es requerido' });
        }
        
        const patrocinador = await patrocinadoresService.create({ 
            nombre: nombre.trim() 
        });
        
        console.log('Patrocinador creado:', patrocinador);
        res.status(201).json(patrocinador);
    } catch (error) {
        console.error('Error al crear patrocinador:', error);
        if (error.message.includes('Ya existe')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error al crear patrocinador' });
    }
});

/**
 * PUT /api/patrocinadores/:id
 * Actualizar patrocinador (Solo Admin)
 */
router.put('/:id', async (req, res) => {
    try {
        console.log('ACTUALIZAR PATROCINADOR - Usuario rol:', req.session?.rol);
        
        // Verificar que el usuario es Admin
        if (req.session?.rol !== 'Admin') {
            return res.status(403).json({ 
                error: 'Solo los administradores pueden editar patrocinadores' 
            });
        }
        
        const { id } = req.params;
        const { nombre } = req.body;
        
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: 'El nombre del patrocinador es requerido' });
        }
        
        const patrocinador = await patrocinadoresService.update(parseInt(id), { 
            nombre: nombre.trim() 
        });
        
        console.log('Patrocinador actualizado:', patrocinador);
        res.json(patrocinador);
    } catch (error) {
        console.error('Error al actualizar patrocinador:', error);
        if (error.message.includes('no encontrado') || error.message.includes('Ya existe')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error al actualizar patrocinador' });
    }
});

/**
 * DELETE /api/patrocinadores/:id
 * Eliminar patrocinador (Solo Admin)
 */
router.delete('/:id', async (req, res) => {
    try {
        console.log('ELIMINAR PATROCINADOR - Usuario rol:', req.session?.rol);
        
        // Verificar que el usuario es Admin
        if (req.session?.rol !== 'Admin') {
            return res.status(403).json({ 
                error: 'Solo los administradores pueden eliminar patrocinadores' 
            });
        }
        
        const { id } = req.params;
        const result = await patrocinadoresService.delete(parseInt(id));
        
        console.log('Patrocinador eliminado:', id);
        res.json(result);
    } catch (error) {
        console.error('Error al eliminar patrocinador:', error);
        if (error.message.includes('no encontrado') || error.message.includes('No se puede eliminar')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error al eliminar patrocinador' });
    }
});

module.exports = router;
