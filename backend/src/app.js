const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Rutas
const authRoutes = require('./routes/auth.routes');

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

// Configuración de sesiones seguras (requisito del proyecto)
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-key-development',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,      // Protege contra XSS
        secure: process.env.NODE_ENV === 'production', // HTTPS en producción
        sameSite: 'lax',     // Protege contra CSRF
        maxAge: parseInt(process.env.SESSION_MAX_AGE) || 3600000 // 1 hora
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

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🏎️  Servidor F1 Database corriendo en http://localhost:${PORT}`);
    console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
