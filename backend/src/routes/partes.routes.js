const express = require('express');
const router = express.Router();

/**
 * Datos dummy del catálogo de partes F1
 * TODO: Reemplazar con consultas a SQL Server
 */

const categorias = [
    { id: 'Motor', nombre: 'Motor', descripcion: 'Power Units y componentes de motor' },
    { id: 'Aerodinamica', nombre: 'Aerodinamica', descripcion: 'Alerones, difusores y elementos aerodinamicos' },
    { id: 'Transmision', nombre: 'Transmision', descripcion: 'Cajas de cambio y componentes de transmision' },
    { id: 'Suspension', nombre: 'Suspension', descripcion: 'Sistemas de suspension y amortiguacion' },
    { id: 'Frenos', nombre: 'Frenos', descripcion: 'Discos, pinzas y sistemas de frenado' },
    { id: 'Neumaticos', nombre: 'Neumaticos', descripcion: 'Compuestos y sets de neumaticos' },
];

const partes = [
    // Motor
    { id: 1, nombre: 'Power Unit Honda RBPT', categoria: 'Motor', descripcion: 'Motor V6 turbo hibrido de ultima generacion', precio: 15000000, potencia: 9, aerodinamica: 2, manejo: 5, stock: 3 },
    { id: 2, nombre: 'Power Unit Ferrari 066/12', categoria: 'Motor', descripcion: 'Motor V6 turbo con sistema hibrido avanzado', precio: 14500000, potencia: 9, aerodinamica: 2, manejo: 4, stock: 4 },
    { id: 3, nombre: 'Power Unit Mercedes M14', categoria: 'Motor', descripcion: 'Motor V6 turbo hibrido eficiente', precio: 14000000, potencia: 8, aerodinamica: 2, manejo: 6, stock: 5 },
    { id: 4, nombre: 'MGU-K Reforzado', categoria: 'Motor', descripcion: 'Unidad de recuperacion de energia cinetica mejorada', precio: 2500000, potencia: 7, aerodinamica: 1, manejo: 3, stock: 8 },
    
    // Aerodinamica
    { id: 5, nombre: 'Aleron Delantero Red Bull', categoria: 'Aerodinamica', descripcion: 'Aleron con alto downforce para curvas lentas', precio: 850000, potencia: 1, aerodinamica: 9, manejo: 7, stock: 6 },
    { id: 6, nombre: 'Aleron Trasero DRS+', categoria: 'Aerodinamica', descripcion: 'Aleron con sistema DRS optimizado', precio: 920000, potencia: 2, aerodinamica: 8, manejo: 6, stock: 5 },
    { id: 7, nombre: 'Piso Efecto Suelo V2', categoria: 'Aerodinamica', descripcion: 'Piso con canales Venturi mejorados', precio: 1200000, potencia: 1, aerodinamica: 9, manejo: 8, stock: 4 },
    { id: 8, nombre: 'Difusor Trasero Pro', categoria: 'Aerodinamica', descripcion: 'Difusor de alto rendimiento', precio: 780000, potencia: 1, aerodinamica: 8, manejo: 7, stock: 7 },
    
    // Transmision
    { id: 9, nombre: 'Caja de Cambios 8V Titanio', categoria: 'Transmision', descripcion: 'Transmision de 8 velocidades ultraligera', precio: 3200000, potencia: 6, aerodinamica: 1, manejo: 8, stock: 3 },
    { id: 10, nombre: 'Diferencial Activo', categoria: 'Transmision', descripcion: 'Diferencial electronico de respuesta rapida', precio: 1800000, potencia: 4, aerodinamica: 1, manejo: 9, stock: 6 },
    
    // Suspension
    { id: 11, nombre: 'Suspension Push-Rod Racing', categoria: 'Suspension', descripcion: 'Sistema push-rod de competicion', precio: 950000, potencia: 2, aerodinamica: 5, manejo: 9, stock: 8 },
    { id: 12, nombre: 'Amortiguadores Ohlins F1', categoria: 'Suspension', descripcion: 'Amortiguadores ajustables de alta gama', precio: 680000, potencia: 1, aerodinamica: 3, manejo: 8, stock: 10 },
    
    // Frenos
    { id: 13, nombre: 'Discos Carbono-Ceramica', categoria: 'Frenos', descripcion: 'Discos de freno de carbono ceramico', precio: 420000, potencia: 1, aerodinamica: 2, manejo: 9, stock: 12 },
    { id: 14, nombre: 'Pinzas Brembo Racing', categoria: 'Frenos', descripcion: 'Sistema de frenado de 6 pistones', precio: 380000, potencia: 1, aerodinamica: 1, manejo: 8, stock: 15 },
    
    // Neumaticos
    { id: 15, nombre: 'Set Pirelli Soft', categoria: 'Neumaticos', descripcion: 'Compuesto blando para maximo agarre', precio: 45000, potencia: 3, aerodinamica: 2, manejo: 9, stock: 50 },
    { id: 16, nombre: 'Set Pirelli Medium', categoria: 'Neumaticos', descripcion: 'Compuesto medio equilibrado', precio: 42000, potencia: 4, aerodinamica: 2, manejo: 7, stock: 60 },
    { id: 17, nombre: 'Set Pirelli Hard', categoria: 'Neumaticos', descripcion: 'Compuesto duro para larga duracion', precio: 40000, potencia: 5, aerodinamica: 2, manejo: 5, stock: 55 },
];

/**
 * GET /api/partes
 * Obtener todas las partes o filtrar por categoria
 */
router.get('/', (req, res) => {
    try {
        const { categoria } = req.query;
        
        let resultado = partes;
        if (categoria) {
            resultado = partes.filter(p => p.categoria === categoria);
        }
        
        res.json(resultado);
    } catch (error) {
        console.error('Error al obtener partes:', error);
        res.status(500).json({ error: 'Error al obtener partes' });
    }
});

/**
 * GET /api/partes/categorias
 * Obtener todas las categorias
 */
router.get('/categorias', (req, res) => {
    try {
        res.json(categorias);
    } catch (error) {
        console.error('Error al obtener categorias:', error);
        res.status(500).json({ error: 'Error al obtener categorias' });
    }
});

/**
 * GET /api/partes/:id
 * Obtener una parte por ID
 */
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const parte = partes.find(p => p.id === parseInt(id));
        
        if (!parte) {
            return res.status(404).json({ error: 'Parte no encontrada' });
        }
        
        res.json(parte);
    } catch (error) {
        console.error('Error al obtener parte:', error);
        res.status(500).json({ error: 'Error al obtener parte' });
    }
});

/**
 * POST /api/partes/comprar
 * Simular compra de una parte (requiere autenticacion)
 * TODO: Implementar con transacciones en SQL Server
 */
router.post('/comprar', (req, res) => {
    try {
        // Verificar sesion
        if (!req.session.usuario) {
            return res.status(401).json({ error: 'Debe iniciar sesion' });
        }
        
        const { parteId, cantidad = 1 } = req.body;
        const parte = partes.find(p => p.id === parseInt(parteId));
        
        if (!parte) {
            return res.status(404).json({ error: 'Parte no encontrada' });
        }
        
        if (parte.stock < cantidad) {
            return res.status(400).json({ error: 'Stock insuficiente' });
        }
        
        // TODO: Implementar logica real con BD
        // - Verificar presupuesto del equipo
        // - Descontar del presupuesto
        // - Actualizar inventario del equipo
        // - Registrar transaccion
        
        res.json({ 
            success: true, 
            message: `Compra simulada: ${cantidad}x ${parte.nombre}`,
            total: parte.precio * cantidad
        });
    } catch (error) {
        console.error('Error al comprar:', error);
        res.status(500).json({ error: 'Error al procesar compra' });
    }
});

module.exports = router;
