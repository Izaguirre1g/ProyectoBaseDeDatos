const express = require('express');
const router = express.Router();

// Usuarios de prueba (sin base de datos)
const usuarios = [
    { id: 1, email: 'admin@f1.com', password: '123456', rol: 'Admin', nombre: 'Administrador' },
    { id: 2, email: 'engineer@f1.com', password: '123456', rol: 'Engineer', nombre: 'Carlos Sainz Engineer' },
    { id: 3, email: 'driver@f1.com', password: '123456', rol: 'Driver', nombre: 'Carlos Sainz' }
];

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    // Buscar usuario
    const usuario = usuarios.find(u => u.email === email && u.password === password);
    
    if (usuario) {
        // Guardar en sesión
        req.session.userId = usuario.id;
        req.session.rol = usuario.rol;
        req.session.nombre = usuario.nombre;
        
        res.json({ 
            success: true, 
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });
    } else {
        res.status(401).json({ 
            success: false, 
            error: 'Email o contraseña incorrectos' 
        });
    }
});

// GET /api/auth/me - Verificar si hay sesión activa
router.get('/me', (req, res) => {
    if (req.session.userId) {
        res.json({
            loggedIn: true,
            usuario: {
                id: req.session.userId,
                nombre: req.session.nombre,
                rol: req.session.rol
            }
        });
    } else {
        res.json({ loggedIn: false });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).json({ error: 'Error al cerrar sesión' });
        } else {
            res.clearCookie('connect.sid');
            res.json({ success: true, message: 'Sesión cerrada' });
        }
    });
});

module.exports = router;
