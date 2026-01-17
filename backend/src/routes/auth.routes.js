//este archivo es de llamadas a la base de datos, está conectado con auth.service.js para controlar los post de login, logout, register
//este archivo hace las validaciones de los usuarios y crea las sesiones

const express = require('express');
const router = express.Router();
const { verifyPassword } = require('../utils/password');
const { getConnection, sql } = require('../config/database');
const usuariosService = require('../services/usuarios.service');

//Esta funcion registra la sesion del usuario en la base
//inicia agarrando la ip, la hora que para pasarla a standar time le restamos 6 para que se guarde bien en la base
//para que cuanddo se consulta la hora en la base se pueda comparar bien
async function registrarSesionEnBD(idUsuario, req) {
    try {
        const pool = await getConnection();

        const ipUsuario = req.ip || req.connection.remoteAddress || 'Desconocida';
        
        const horaInicio = new Date();
        //horaInicio.setHours(horaInicio.getHours() - 6);  // Solo si SQL Server está en UTC
        
        const result = await pool.request()
            .input('horaInicio', sql.DateTime, horaInicio)
            .input('estado', sql.TinyInt, 1)
            .input('ipUsuario', sql.NVarChar, ipUsuario)
            .input('idUsuario', sql.Int, idUsuario)
            .query(`
                INSERT INTO SESION (Hora_inicio_sesion, Estado, Ip_usuario, Id_usuario)
                VALUES (@horaInicio, @estado, @ipUsuario, @idUsuario);
                SELECT SCOPE_IDENTITY() as Id_sesion;
            `);
        
        const idSesion = result.recordset[0].Id_sesion;
        console.log(`Sesión en BD registrada: ID ${idSesion}`);
        console.log(`IP: ${ipUsuario}`);
        console.log(`Hora: ${horaInicio}\n`);
        return idSesion;
    } catch (error) {
        console.error('Error registrando sesión:', error);
        throw error;
    }
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        console.log('\n Inicio de sesión');
        console.log(`Email: ${email}`);
        console.log(`Contraseña ingresada: ${password}`);
        
        // Conectar a la BD y buscar usuario
        const pool = await getConnection();
        const result = await pool.request()
            .input('correo', sql.NVarChar, email)
            .query(`
                SELECT u.Id_usuario, u.Correo_usuario, u.Contrasena_hash, 
                       r.Nombre as Rol, ISNULL(e.Nombre, 'Sin equipo') as Equipo, 
                       ISNULL(e.Id_equipo, NULL) as Id_equipo
                FROM USUARIO u
                JOIN ROL r ON u.Id_rol = r.Id_rol
                LEFT JOIN EQUIPO e ON u.Id_equipo = e.Id_equipo
                WHERE u.Correo_usuario = @correo
            `);
        
        if (result.recordset.length === 0) {
            console.log('Usuario no encontrado');
            console.log(' Fin de la validacion \n');
            return res.status(401).json({ 
                success: false, 
                error: 'Email o contrasena incorrectos' 
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
        
        console.log(` Usuario encontrado: ${usuario.Correo_usuario}`);
        console.log(`   Rol: ${usuario.Rol} -> ${rolFrontend}`);
        console.log(`   Equipo: ${usuario.Equipo}`);
        console.log(`\n ARGON2ID - VERIFICACIÓN DE CONTRASEÑA:`);
        console.log(`Hash almacenado en BD:`);
        console.log(`${usuario.Contrasena_hash}`);
        
        // Verificar contraseña con Argon2id
        console.log(`\n Verificando contrasena`);
        const inicio = Date.now();
        const passwordMatch = await verifyPassword(password, usuario.Contrasena_hash);
        const tiempo = Date.now() - inicio;
        
        console.log(` Tiempo de verificación: ${tiempo}ms`);
        
        if (!passwordMatch) {
            console.log(`Contrasena Incorrecta`);
            console.log(' Login completo \n');
            return res.status(401).json({ 
                success: false, 
                error: 'Email o contrasena incorrectos' 
            });
        }
        
        // Guardar en sesión
        console.log(` Contrasena correcta `);
        console.log(`\n Creando sesión`);
        req.session.userId = usuario.Id_usuario;
        req.session.rol = rolFrontend;
        req.session.nombre = usuario.Correo_usuario.split('@')[0];
        req.session.equipo = usuario.Equipo;
        req.session.equipoId = usuario.Id_equipo;
        
        console.log(` Sesión creada para: ${usuario.Correo_usuario}`);
        console.log(`\n  Registrando sesión en BD`);
        
        // Registrar sesión en la BD
        const idSesion = await registrarSesionEnBD(usuario.Id_usuario, req);
        req.session.idSesion = idSesion;
        
        console.log(` Fin de la validacion exitosa \n`);
        
        res.json({ 
            success: true, 
            usuario: {
                id: usuario.Id_usuario,
                nombre: usuario.Correo_usuario.split('@')[0],
                email: usuario.Correo_usuario,
                rol: rolFrontend,
                equipo: usuario.Equipo,
                equipoId: usuario.Id_equipo
            },
            idSesion: idSesion
        });
    } catch (error) {
        console.error('Error en el login ', error);
        console.log(' Fin de la validacion con error \n');
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
        console.log('\n  Registrar un nuevo usuario ');
        console.log(` Nombre: ${nombre}`);
        console.log(`Email: ${email}`);
        console.log(`Rol: ${rol}`);
        
        if (!nombre || !email || !password || !rol) {
            return res.status(400).json({
                success: false,
                error: 'Todos los campos son requeridos'
            });
        }
        
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
            console.log('El correo ya está registrado');
            return res.status(400).json({
                success: false,
                error: 'El correo ya está registrado'
            });
        }
        
        // Crear el usuario sin equipo por defecto
        const nuevoUsuario = await usuariosService.create({
            nombre,
            correo: email,
            password,
            idEquipo: null,
            idRol
        });
        
        console.log(`Usuario registrado: ${email}`);
        console.log(' Registro exitoso \n');
        
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
        console.error(' ERROR EN REGISTRO:', error);
        res.status(500).json({
            success: false,
            error: 'Error al registrar usuario'
        });
    }
});

// Middleware que valida timeout en CADA solicitud
async function validarTimeoutSesion(req, res, next) {
    if (!req.session.userId) {
        return next();
    }

    try {
        const pool = await getConnection();
        const TIMEOUT_MINUTOS = 2; // Mismo tiempo que maxAge en app.js
        const TIMEOUT_MS = TIMEOUT_MINUTOS * 60 * 1000;
        
        const result = await pool.request()
            .input('idSesion', sql.Int, req.session.idSesion)
            .query(`
                SELECT Hora_inicio_sesion, Estado 
                FROM SESION 
                WHERE Id_sesion = @idSesion
            `);
        
        if (!result.recordset.length) {
            console.log(` Sesión ${req.session.idSesion} no encontrada en BD`);
            return cerrarSesion(req, res, 'sesión no encontrada en BD');
        }
        
        const sesion = result.recordset[0];
        
        if (sesion.Estado === 0) {
            console.log(` Sesión ${req.session.idSesion} marcada como inactiva en BD`);
            return cerrarSesion(req, res, 'sesión cerrada en BD');
        }
        
        const horaInicio = new Date(sesion.Hora_inicio_sesion);
        const ahora = new Date();
        const tiempoTranscurrido = ahora - horaInicio;
        
        console.log(`Validando sesión ${req.session.idSesion}: ${Math.floor(tiempoTranscurrido / 1000)}s de ${TIMEOUT_MINUTOS * 60}s`);
        
        // Verificar si la sesión ha expirado
        if (tiempoTranscurrido > TIMEOUT_MS) {
            console.log(`La sesión ${req.session.idSesion} expiró`);
            return cerrarSesion(req, res, `timeout de ${TIMEOUT_MINUTOS} minutos`);
        }
        
        // Sesión válida, continuar
        next();
    } catch (error) {
        console.error('Error validando timeout de sesión:', error);
        next();
    }
}

// Función auxiliar para cerrar sesión correctamente
async function cerrarSesion(req, res, razon = 'logout') {
    try {
        // Marcar sesión como inactiva en BD si existe
        if (req.session.idSesion) {
            const pool = await getConnection();
            await pool.request()
                .input('idSesion', sql.Int, req.session.idSesion)
                .query(`
                    UPDATE SESION 
                    SET Estado = 0
                    WHERE Id_sesion = @idSesion
                `);
            console.log(`Sesión ${req.session.idSesion} cerrada (${razon})`);
        }
        
        // Destruir sesión del servidor
        req.session.destroy((err) => {
            if (err) {
                res.status(500).json({ error: 'Error al cerrar sesión' });
            } else {
                res.clearCookie('connect.sid');
                // Si es timeout, enviar 401 para que el frontend sepa que expiró
                const statusCode = razon.includes('timeout') || razon.includes('expiró') ? 401 : 200;
                res.status(statusCode).json({ 
                    success: true, 
                    message: 'Sesión cerrada exitosamente',
                    reason: razon
                });
            }
        });
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({ error: 'Error al cerrar sesión' });
    }
}

router.post('/logout', (req, res) => {
    cerrarSesion(req, res, 'logout manual');
});

// Exportar el middleware para usarlo en app.js
module.exports = router;
module.exports.validarTimeoutSesion = validarTimeoutSesion;
