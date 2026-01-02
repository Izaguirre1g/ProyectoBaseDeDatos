const express = require('express');
const router = express.Router();

/**
 * Datos dummy de carros y configuraciones
 * TODO: Reemplazar con consultas a SQL Server
 */

// Inventario de partes del equipo (simulado)
const inventarioEquipo = {
    'Red Bull Racing': {
        powerUnit: [
            { id: 1, nombre: 'Power Unit Honda RBPT', potencia: 9, aerodinamica: 2, manejo: 5 },
            { id: 2, nombre: 'Power Unit Honda RBPT v2', potencia: 8, aerodinamica: 3, manejo: 6 },
        ],
        aerodinamica: [
            { id: 5, nombre: 'Paquete Aero Alta Carga', potencia: 1, aerodinamica: 9, manejo: 7 },
            { id: 6, nombre: 'Paquete Aero Baja Resistencia', potencia: 3, aerodinamica: 6, manejo: 5 },
        ],
        cajaCambios: [
            { id: 9, nombre: 'Caja 8V Titanio', potencia: 6, aerodinamica: 1, manejo: 8 },
            { id: 10, nombre: 'Caja 8V Carbon', potencia: 5, aerodinamica: 1, manejo: 9 },
        ],
        suspension: [
            { id: 11, nombre: 'Suspension Push-Rod Racing', potencia: 2, aerodinamica: 5, manejo: 9 },
            { id: 12, nombre: 'Suspension Pull-Rod Pro', potencia: 2, aerodinamica: 6, manejo: 8 },
        ],
        neumaticos: [
            { id: 15, nombre: 'Pirelli Soft C5', potencia: 3, aerodinamica: 2, manejo: 9 },
            { id: 16, nombre: 'Pirelli Medium C3', potencia: 4, aerodinamica: 2, manejo: 7 },
            { id: 17, nombre: 'Pirelli Hard C1', potencia: 5, aerodinamica: 2, manejo: 5 },
        ],
    },
    'Ferrari': {
        powerUnit: [
            { id: 3, nombre: 'Power Unit Ferrari 066/12', potencia: 9, aerodinamica: 2, manejo: 4 },
        ],
        aerodinamica: [
            { id: 7, nombre: 'Paquete Aero Ferrari F1-75', potencia: 2, aerodinamica: 8, manejo: 6 },
        ],
        cajaCambios: [
            { id: 13, nombre: 'Caja Ferrari 8V', potencia: 5, aerodinamica: 1, manejo: 7 },
        ],
        suspension: [
            { id: 14, nombre: 'Suspension Ferrari Racing', potencia: 2, aerodinamica: 4, manejo: 8 },
        ],
        neumaticos: [
            { id: 15, nombre: 'Pirelli Soft C5', potencia: 3, aerodinamica: 2, manejo: 9 },
            { id: 16, nombre: 'Pirelli Medium C3', potencia: 4, aerodinamica: 2, manejo: 7 },
        ],
    }
};

// Carros con su configuración actual
let carros = [
    { 
        id: 1, 
        numero: 1, 
        modelo: 'RB20', 
        equipo: 'Red Bull Racing',
        conductor: 'Max Verstappen',
        configuracion: {
            powerUnit: { id: 1, nombre: 'Power Unit Honda RBPT', potencia: 9, aerodinamica: 2, manejo: 5 },
            aerodinamica: { id: 5, nombre: 'Paquete Aero Alta Carga', potencia: 1, aerodinamica: 9, manejo: 7 },
            cajaCambios: { id: 9, nombre: 'Caja 8V Titanio', potencia: 6, aerodinamica: 1, manejo: 8 },
            suspension: null,
            neumaticos: { id: 16, nombre: 'Pirelli Medium C3', potencia: 4, aerodinamica: 2, manejo: 7 },
        }
    },
    { 
        id: 2, 
        numero: 11, 
        modelo: 'RB20', 
        equipo: 'Red Bull Racing',
        conductor: 'Sergio Perez',
        configuracion: {
            powerUnit: { id: 2, nombre: 'Power Unit Honda RBPT v2', potencia: 8, aerodinamica: 3, manejo: 6 },
            aerodinamica: null,
            cajaCambios: { id: 10, nombre: 'Caja 8V Carbon', potencia: 5, aerodinamica: 1, manejo: 9 },
            suspension: { id: 11, nombre: 'Suspension Push-Rod Racing', potencia: 2, aerodinamica: 5, manejo: 9 },
            neumaticos: null,
        }
    },
    { 
        id: 3, 
        numero: 55, 
        modelo: 'SF-24', 
        equipo: 'Ferrari',
        conductor: 'Carlos Sainz',
        configuracion: {
            powerUnit: { id: 3, nombre: 'Power Unit Ferrari 066/12', potencia: 9, aerodinamica: 2, manejo: 4 },
            aerodinamica: { id: 7, nombre: 'Paquete Aero Ferrari F1-75', potencia: 2, aerodinamica: 8, manejo: 6 },
            cajaCambios: { id: 13, nombre: 'Caja Ferrari 8V', potencia: 5, aerodinamica: 1, manejo: 7 },
            suspension: { id: 14, nombre: 'Suspension Ferrari Racing', potencia: 2, aerodinamica: 4, manejo: 8 },
            neumaticos: { id: 15, nombre: 'Pirelli Soft C5', potencia: 3, aerodinamica: 2, manejo: 9 },
        }
    },
];

/**
 * GET /api/carros
 * Obtener todos los carros del equipo del usuario
 */
router.get('/', (req, res) => {
    try {
        // TODO: Filtrar por equipo del usuario logueado
        res.json(carros);
    } catch (error) {
        console.error('Error al obtener carros:', error);
        res.status(500).json({ error: 'Error al obtener carros' });
    }
});

/**
 * GET /api/carros/:id
 * Obtener un carro con su configuración
 */
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const carro = carros.find(c => c.id === parseInt(id));
        
        if (!carro) {
            return res.status(404).json({ error: 'Carro no encontrado' });
        }
        
        res.json(carro);
    } catch (error) {
        console.error('Error al obtener carro:', error);
        res.status(500).json({ error: 'Error al obtener carro' });
    }
});

/**
 * GET /api/carros/:id/inventario
 * Obtener partes disponibles en el inventario del equipo
 */
router.get('/:id/inventario', (req, res) => {
    try {
        const { id } = req.params;
        const carro = carros.find(c => c.id === parseInt(id));
        
        if (!carro) {
            return res.status(404).json({ error: 'Carro no encontrado' });
        }
        
        const inventario = inventarioEquipo[carro.equipo] || {};
        res.json(inventario);
    } catch (error) {
        console.error('Error al obtener inventario:', error);
        res.status(500).json({ error: 'Error al obtener inventario' });
    }
});

/**
 * PUT /api/carros/:id/configuracion
 * Actualizar la configuración de un carro
 */
router.put('/:id/configuracion', (req, res) => {
    try {
        const { id } = req.params;
        const { slot, parteId } = req.body;
        
        const carroIndex = carros.findIndex(c => c.id === parseInt(id));
        if (carroIndex === -1) {
            return res.status(404).json({ error: 'Carro no encontrado' });
        }
        
        const carro = carros[carroIndex];
        const inventario = inventarioEquipo[carro.equipo];
        
        if (!inventario || !inventario[slot]) {
            return res.status(400).json({ error: 'Slot invalido' });
        }
        
        // Buscar la parte en el inventario
        const parte = inventario[slot].find(p => p.id === parteId);
        if (!parte && parteId !== null) {
            return res.status(400).json({ error: 'Parte no encontrada en inventario' });
        }
        
        // Actualizar configuración
        carros[carroIndex].configuracion[slot] = parte || null;
        
        res.json({ 
            success: true, 
            message: parte ? `${parte.nombre} instalado en ${slot}` : `${slot} removido`,
            carro: carros[carroIndex]
        });
    } catch (error) {
        console.error('Error al actualizar configuracion:', error);
        res.status(500).json({ error: 'Error al actualizar configuracion' });
    }
});

/**
 * GET /api/carros/:id/stats
 * Calcular estadísticas totales del carro
 */
router.get('/:id/stats', (req, res) => {
    try {
        const { id } = req.params;
        const carro = carros.find(c => c.id === parseInt(id));
        
        if (!carro) {
            return res.status(404).json({ error: 'Carro no encontrado' });
        }
        
        const config = carro.configuracion;
        const slots = ['powerUnit', 'aerodinamica', 'cajaCambios', 'suspension', 'neumaticos'];
        
        let potencia = 0, aerodinamica = 0, manejo = 0;
        let partesInstaladas = 0;
        
        slots.forEach(slot => {
            if (config[slot]) {
                potencia += config[slot].potencia || 0;
                aerodinamica += config[slot].aerodinamica || 0;
                manejo += config[slot].manejo || 0;
                partesInstaladas++;
            }
        });
        
        res.json({
            potencia,
            aerodinamica,
            manejo,
            partesInstaladas,
            partesTotales: slots.length,
            completo: partesInstaladas === slots.length
        });
    } catch (error) {
        console.error('Error al calcular stats:', error);
        res.status(500).json({ error: 'Error al calcular stats' });
    }
});

module.exports = router;
