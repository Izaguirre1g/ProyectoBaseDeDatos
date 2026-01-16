const express = require('express');
const router = express.Router();
const { verifyPassword } = require('../utils/password');
const { getConnection, sql } = require('../config/database');
const usuariosService = require('../services/usuarios.service');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        console.log('\n🔐 ========== INICIO DE SESIÓN ==========');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Contraseña ingresada: ${password}`);
        
        // Conectar a la BD y buscar usuario
        const pool = await getConnection();
        const result = await pool.request()
            .input('correo', sql.NVarChar, email)
            .query(`
                SELECT u.Id_usuario, u.Correo_usuario, u.Contrasena_hash, 
                       r.Nombre as Rol, e.Nombre as Equipo, e.Id_equipo
                FROM USUARIO u
                JOIN ROL r ON u.Id_rol = r.Id_rol
                JOIN EQUIPO e ON u.Id_equipo = e.Id_equipo
                WHERE u.Correo_usuario = @correo
            `);
        
        if (result.recordset.length === 0) {
            console.log('❌ Usuario no encontrado');
            console.log('🔐 ========== FIN VALIDACIÓN ==========\n');
            return res.status(401).json({ 
                success: false, 
                error: 'Email o contraseña incorrectos' 
            });
        }
        
        const usuario = result.recordset[0];
        
        // Mapear roles de BD a roles del frontend
        const rolMap = {
            'Administrador': 'Admin',
            'Ingeniero': 'Engineer',
            'Conductor': 'Driver'
        };
        const rolFrontend = rolMap[usuario.Rol] || usuario.Rol;
        
        console.log(`✅ Usuario encontrado: ${usuario.Correo_usuario}`);
        console.log(`   Rol: ${usuario.Rol} -> ${rolFrontend}`);
        console.log(`   Equipo: ${usuario.Equipo}`);
        console.log(`\n🔒 ARGON2ID - VERIFICACIÓN DE CONTRASEÑA:`);
        console.log(`Hash almacenado en BD:`);
        console.log(`${usuario.Contrasena_hash}`);
        
        // Verificar contraseña con Argon2id
        console.log(`\n⏳ Verificando contraseña con Argon2id...`);
        const inicio = Date.now();
        const passwordMatch = await verifyPassword(password, usuario.Contrasena_hash);
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
        req.session.userId = usuario.Id_usuario;
        req.session.rol = rolFrontend;
        req.session.nombre = usuario.Correo_usuario.split('@')[0];
        req.session.equipo = usuario.Equipo;
        req.session.equipoId = usuario.Id_equipo;
        
        console.log(`✅ Sesión creada para: ${usuario.Correo_usuario}`);
        console.log(`🔐 ========== FIN VALIDACIÓN EXITOSA ==========\n`);
        
        res.json({ 
            success: true, 
            usuario: {
                id: usuario.Id_usuario,
                nombre: usuario.Correo_usuario.split('@')[0],
                email: usuario.Correo_usuario,
                rol: rolFrontend,
                equipo: usuario.Equipo,
                equipoId: usuario.Id_equipo
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

// POST /api/auth/register - Registrar nuevo usuario
router.post('/register', async (req, res) => {
    const { nombre, email, password, rol } = req.body;
    
    try {
        console.log('\n📝 ========== REGISTRO NUEVO USUARIO ==========');
        console.log(`👤 Nombre: ${nombre}`);
        console.log(`📧 Email: ${email}`);
        console.log(`🎭 Rol: ${rol}`);
        
        // Validaciones básicas
        if (!nombre || !email || !password || !rol) {
            return res.status(400).json({
                success: false,
                error: 'Todos los campos son requeridos'
            });
        }
        
        // Mapear rol del frontend al ID de BD
        const rolMap = {
            'Administrador': 1,
            'Ingeniero': 2,
            'Conductor': 3
        };
        const idRol = rolMap[rol];
        
        if (!idRol) {
            return res.status(400).json({
                success: false,
                error: 'Rol inválido'
            });
        }
        
        // Verificar que el usuario no exista
        const usuarioExistente = await usuariosService.getByCorreo(email);
        if (usuarioExistente) {
            console.log('❌ El correo ya está registrado');
            return res.status(400).json({
                success: false,
                error: 'El correo ya está registrado'
            });
        }
        
        // Crear usuario con equipo por defecto (Ferrari)
        const pool = await getConnection();
        const equipoResult = await pool.request()
            .input('nombre', sql.NVarChar, 'Scuderia Ferrari')
            .query('SELECT Id_equipo FROM EQUIPO WHERE Nombre = @nombre');
        
        const idEquipo = equipoResult.recordset[0]?.Id_equipo || 1;
        
        // Crear el usuario
        const nuevoUsuario = await usuariosService.create({
            nombre,
            correo: email,
            password,
            idEquipo,
            idRol
        });
        
        console.log(`✅ Usuario registrado: ${email}`);
        console.log('📝 ========== REGISTRO EXITOSO ==========\n');
        
        res.status(201).json({
            success: true,
            mensaje: 'Usuario registrado exitosamente',
            usuario: {
                id: nuevoUsuario.Id_usuario,
                nombre: nuevoUsuario.Nombre_usuario,
                email: nuevoUsuario.Correo_usuario,
                rol: rol
            }
        });
    } catch (error) {
        console.error('❌ ERROR EN REGISTRO:', error);
        res.status(500).json({
            success: false,
            error: 'Error al registrar usuario'
        });
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
