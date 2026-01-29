const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Rutas
const authRoutes = require('./routes/auth.routes');
const { validarTimeoutSesion } = require('./routes/auth.routes');
const carrosRoutes = require('./routes/carros.routes');
const equiposRoutes = require('./routes/equipos.routes');
const partesRoutes = require('./routes/partes.routes');
const simulacionesRoutes = require('./routes/simulaciones.routes');
const circuitosRoutes = require('./routes/circuitos.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const patrocinadoresRoutes = require('./routes/patrocinadores.routes');

// Base de datos
const { getConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configurado para React - Permitir localhost y cualquier IP de la red local
app.use(cors({
    origin: function(origin, callback) {
        // Permitir solicitudes sin origin (como Postman, curl, etc.)
        if (!origin) {
            return callback(null, true);
        }
        
        // Permitir localhost con cualquier puerto
        if (origin.startsWith('http://localhost:')) {
            return callback(null, true);
        }
        
        // Permitir cualquier IP de red local (192.168.x.x) con cualquier puerto
        const localNetworkPattern = /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/;
        if (localNetworkPattern.test(origin)) {
            return callback(null, true);
        }
        
        // Permitir IPs de red local 10.x.x.x
        const localNetwork10Pattern = /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/;
        if (localNetwork10Pattern.test(origin)) {
            return callback(null, true);
        }
        
        console.log('CORS bloqueado para origen:', origin);
        callback(new Error('No permitido por CORS'));
    },
    credentials: true
}));

// Configuración de sesiones seguras
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-key-development',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,      // Protege contra XSS
        secure: false,       // false para desarrollo con HTTP
        sameSite: false,     // Desactivado para permitir cookies entre IPs de red local
        maxAge: parseInt(process.env.SESSION_MAX_AGE) || 500000 // 2 minutos
    }
}));

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ 
        message: 'API F1 Database - Sistema de Gestión de Fórmula 1',
        status: 'running',
        version: '1.0.0'
    });
});

// Rutas de la API
app.use('/api/auth', authRoutes);

// Aplicar validación de timeout a TODAS las rutas de la API (excepto login y register)
app.use('/api/', validarTimeoutSesion);

// Registrar todas las rutas
app.use('/api/carros', carrosRoutes);
app.use('/api/equipos', equiposRoutes);
app.use('/api/partes', partesRoutes);
app.use('/api/simulaciones', simulacionesRoutes);
app.use('/api/circuitos', circuitosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/patrocinadores', patrocinadoresRoutes);

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', async () => {
    console.log(`Servidor F1 Database corriendo en http://0.0.0.0:${PORT}`);
    console.log(`Acceso local: http://localhost:${PORT}`);
    console.log(`Acceso desde red: http://192.168.1.15:${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    
    // Intentar conectar a la base de datos
    try {
        await getConnection();
        console.log('Base de datos conectada');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error.message);
        console.error('Detalles:', error);
    }
});

module.exports = app;
