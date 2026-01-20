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
 * POST /api/usuarios
 * Crear un nuevo usuario
 */
router.post('/', async (req, res) => {
    try {
        const { nombre, email, password, rol, equipo, habilidad } = req.body;
        
        // Validar campos requeridos
        if (!nombre || !email || !password || !rol) {
            return res.status(400).json({ 
                error: 'Nombre, email, password y rol son requeridos' 
            });
        }
        
        // Validar habilidad para conductores
        if ((rol === 'Driver' || rol === 'Conductor') && (habilidad === null || habilidad === undefined || habilidad === '')) {
            return res.status(400).json({ 
                error: 'La habilidad es requerida para conductores (0-100)' 
            });
        }
        
        // Validar rango de habilidad si se proporciona
        if (habilidad !== null && habilidad !== undefined && habilidad !== '') {
            const hab = parseInt(habilidad);
            if (isNaN(hab) || hab < 0 || hab > 100) {
                return res.status(400).json({ 
                    error: 'La habilidad debe estar entre 0 y 100' 
                });
            }
        }
        
        // Mapear rol a ID
        const rolMap = {
            'Admin': 1,
            'Administrador': 1,
            'Engineer': 2,
            'Ingeniero': 2,
            'Driver': 3,
            'Conductor': 3
        };
        
        const idRol = rolMap[rol];
        if (!idRol) {
            return res.status(400).json({ error: 'Rol inválido' });
        }
        
        // Obtener ID del equipo si se proporcionó nombre
        let idEquipo = null;
        if (equipo && equipo.trim() !== '') {
            const equiposService = require('../services/equipos.service');
            const equipos = await equiposService.getAll();
            const equipoEncontrado = equipos.find(e => e.Nombre === equipo);
            if (equipoEncontrado) {
                idEquipo = equipoEncontrado.Id_equipo;
            }
        }
        
        // Verificar que el usuario no exista
        const usuarioExistente = await usuariosService.getByCorreo(email);
        if (usuarioExistente) {
            return res.status(400).json({ 
                error: 'Ya existe un usuario con ese correo' 
            });
        }
        
        // Crear usuario
        const nuevoUsuario = await usuariosService.create({
            nombre,
            correo: email,
            password,
            idEquipo,
            idRol,
            habilidad: habilidad !== null && habilidad !== undefined && habilidad !== '' ? parseInt(habilidad) : null
        });
        
        res.status(201).json(nuevoUsuario);
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ 
            error: 'Error al crear usuario',
            detalle: error.message 
        });
    }
});

/**
 * PUT /api/usuarios/:id
 * Actualizar un usuario
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, rol, equipo, password, habilidad } = req.body;
        
        // Validar habilidad para conductores
        if ((rol === 'Driver' || rol === 'Conductor') && (habilidad === null || habilidad === undefined || habilidad === '')) {
            return res.status(400).json({ 
                error: 'La habilidad es requerida para conductores (0-100)' 
            });
        }
        
        // Validar rango de habilidad si se proporciona
        if (habilidad !== null && habilidad !== undefined && habilidad !== '') {
            const hab = parseInt(habilidad);
            if (isNaN(hab) || hab < 0 || hab > 100) {
                return res.status(400).json({ 
                    error: 'La habilidad debe estar entre 0 y 100' 
                });
            }
        }
        
        const usuario = await usuariosService.update(parseInt(id), {
            nombre,
            email,
            rol,
            equipo,
            password,
            habilidad
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
