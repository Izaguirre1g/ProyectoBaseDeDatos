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

// Base de datos
const { getConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configurado para React
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Configuración de sesiones seguras
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-key-development',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,      // Protege contra XSS
        secure: process.env.NODE_ENV === 'production', // HTTPS en producción
        sameSite: 'lax',     // Protege contra CSRF
        maxAge: parseInt(process.env.SESSION_MAX_AGE) || 120000 // 2 minutos
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

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Iniciar servidor
app.listen(PORT, async () => {
    console.log(`Servidor F1 Database corriendo en http://localhost:${PORT}`);
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
