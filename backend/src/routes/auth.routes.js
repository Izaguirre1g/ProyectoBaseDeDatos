const express = require('express');
const router = express.Router();
const { verifyPassword } = require('../utils/password');

// Usuarios de prueba con hashes de Argon2id
// IMPORTANTE: Las contraseñas NO están en texto plano, solo los hashes
const usuarios = [
    { 
        id: 1, 
        email: 'admin@f1.com', 
        passwordHash: '$argon2id$v=19$m=19456,t=2,p=1$uAoDVRVV/PyaR/3G8JXn+A$JLcqKtj5Bd2PcJAL134278O5kjhnTZ6KOyEZGojgHP0',
        rol: 'Admin', 
        nombre: 'Administrador' 
    },
    { 
        id: 2, 
        email: 'engineer@f1.com', 
        passwordHash: '$argon2id$v=19$m=19456,t=2,p=1$+T2AI1BckNFMaOe4E3H4lQ$y9+Ed2TSOU8kLZp0FjZu37is1WeVXLyYs1M/v+9/ULM',
        rol: 'Engineer', 
        nombre: 'Carlos Sainz Engineer' 
    },
    { 
        id: 3, 
        email: 'driver@f1.com', 
        passwordHash: '$argon2id$v=19$m=19456,t=2,p=1$Zp/BMR21snko8vtsn4A6fA$PIjcjPTusY6ln2in0nDl9PYgN78sDGxGAWcFdARp+iA',
        rol: 'Driver', 
        nombre: 'Carlos Sainz' 
    }
];

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        console.log('\n🔐 ========== INICIO DE SESIÓN ==========');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Contraseña ingresada: ${password}`);
        
        // Buscar usuario por email
        const usuario = usuarios.find(u => u.email === email);
        
        if (!usuario) {
            console.log('❌ Usuario no encontrado');
            console.log('🔐 ========== FIN VALIDACIÓN ==========\n');
            return res.status(401).json({ 
                success: false, 
                error: 'Email o contraseña incorrectos' 
            });
        }
        
        console.log(`✅ Usuario encontrado: ${usuario.nombre}`);
        console.log(`\n🔒 ARGON2ID - VERIFICACIÓN DE CONTRASEÑA:`);
        console.log(`Hash almacenado en BD:`);
        console.log(`${usuario.passwordHash}`);
        console.log(`\nDesglose del hash Argon2id:`);
        const partes = usuario.passwordHash.split('$');
        console.log(`  • Algoritmo: ${partes[1]}`);
        console.log(`  • Versión: v19 (Argon2 v1.3)`);
        console.log(`  • Parámetros: m=19456 (19MB), t=2, p=1`);
        console.log(`  • Salt: ${partes[4]} (16 bytes aleatorios)`);
        console.log(`  • Hash: ${partes[5].substring(0, 30)}...`);
        
        // Verificar contraseña con Argon2id
        console.log(`\n⏳ Verificando contraseña con Argon2id...`);
        const inicio = Date.now();
        const passwordMatch = await verifyPassword(password, usuario.passwordHash);
        const tiempo = Date.now() - inicio;
        
        console.log(`⏱️  Tiempo de verificación: ${tiempo}ms`);
        
        if (!passwordMatch) {
            console.log(`❌ CONTRASEÑA INCORRECTA`);
            console.log('🔐 ========== FIN VALIDACIÓN ==========\n');
            return res.status(401).json({ 
                success: false, 
                error: 'Email o contraseña incorrectos' 
            });
        }
        
        // Guardar en sesión
        console.log(`✅ CONTRASEÑA CORRECTA`);
        console.log(`\n📋 Creando sesión...`);
        req.session.userId = usuario.id;
        req.session.rol = usuario.rol;
        req.session.nombre = usuario.nombre;
        
        console.log(`✅ Sesión creada para: ${usuario.nombre}`);
        console.log(`🔐 ========== FIN VALIDACIÓN EXITOSA ==========\n`);
        
        res.json({ 
            success: true, 
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });
    } catch (error) {
        console.error('❌ ERROR EN LOGIN:', error);
        console.log('🔐 ========== FIN VALIDACIÓN CON ERROR ==========\n');
        res.status(500).json({ 
            success: false, 
            error: 'Error interno del servidor' 
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
