const express = require('express');
const router = express.Router();
const usuariosService = require('../services/usuarios.service');

/**
 * GET /api/usuarios
 * Listar todos los usuarios
 */
router.get('/', async (req, res) => {
    try {
        const usuarios = await usuariosService.getAll();
        res.json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

/**
 * GET /api/usuarios/:id
 * Obtener un usuario por ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await usuariosService.getById(parseInt(id));
        
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json(usuario);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
});

/**
 * PUT /api/usuarios/:id
 * Actualizar un usuario
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, rol, equipo, password } = req.body;
        
        const usuario = await usuariosService.update(parseInt(id), {
            nombre,
            email,
            rol,
            equipo,
            password
        });
        
        // Si el usuario actualizado es el de la sesión activa, actualizar la sesión
        if (req.session.userId === parseInt(id)) {
            console.log(`[UPDATE] Actualizando sesión para usuario ${id}`);
            req.session.nombre = usuario.Nombre_usuario;
            req.session.equipo = usuario.Equipo || 'Sin equipo';
            req.session.equipoId = usuario.Id_equipo || null;
            req.session.rol = rol;
        }
        
        res.json(usuario);
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ 
            error: 'Error al actualizar usuario',
            detalle: error.message 
        });
    }
});

/**
 * DELETE /api/usuarios/:id
 * Eliminar un usuario
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await usuariosService.delete(parseInt(id));
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ 
            error: 'Error al eliminar usuario',
            detalle: error.message 
        });
    }
});

module.exports = router;
