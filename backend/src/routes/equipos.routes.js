const express = require('express');
const router = express.Router();

// Dummy data para equipos F1
const equipos = [
    {
        id: 1,
        nombre: 'Red Bull Racing',
        nombreCompleto: 'Oracle Red Bull Racing',
        pais: 'Austria',
        colorPrimario: '#1E41FF',
        fundacion: 2005,
        campeonatos: 6,
        presupuesto: {
            total: 145000000,
            gastado: 98000000,
            sponsors: 85000000,
            distribucion: [
                { categoria: 'Power Unit', monto: 35000000, porcentaje: 24 },
                { categoria: 'Aerodinámica', monto: 42000000, porcentaje: 29 },
                { categoria: 'Personal', monto: 38000000, porcentaje: 26 },
                { categoria: 'Logística', monto: 30000000, porcentaje: 21 },
            ]
        },
        pilotos: [
            {
                id: 1,
                nombre: 'Max Verstappen',
                numero: 1,
                nacionalidad: 'Países Bajos',
                campeonatos: 4,
                victorias: 62
            },
            {
                id: 2,
                nombre: 'Sergio Pérez',
                numero: 11,
                nacionalidad: 'México',
                campeonatos: 0,
                victorias: 6
            }
        ],
        carros: [
            {
                id: 1,
                nombre: 'RB20-01',
                piloto: 'Max Verstappen',
                configuracion: {
                    powerUnit: { id: 1, nombre: 'Honda RBPT RA623H' },
                    aerodinamica: { id: 2, nombre: 'Paquete Aero Monaco' },
                    suspension: { id: 3, nombre: 'Suspensión Push-rod' },
                    cajaCambios: { id: 4, nombre: 'Caja 8 velocidades' },
                    neumaticos: null
                }
            },
            {
                id: 2,
                nombre: 'RB20-02',
                piloto: 'Sergio Pérez',
                configuracion: {
                    powerUnit: { id: 1, nombre: 'Honda RBPT RA623H' },
                    aerodinamica: { id: 2, nombre: 'Paquete Aero Monaco' },
                    suspension: { id: 3, nombre: 'Suspensión Push-rod' },
                    cajaCambios: { id: 4, nombre: 'Caja 8 velocidades' },
                    neumaticos: { id: 5, nombre: 'Pirelli C3 Medium' }
                }
            }
        ],
        inventario: [
            { nombre: 'Honda RBPT RA623H', categoria: 'Power Unit', cantidad: 4, precio: 15000000 },
            { nombre: 'Paquete Aero Monaco', categoria: 'Aerodinámica', cantidad: 2, precio: 2500000 },
            { nombre: 'Paquete Aero Monza', categoria: 'Aerodinámica', cantidad: 3, precio: 2200000 },
            { nombre: 'Suspensión Push-rod', categoria: 'Suspensión', cantidad: 6, precio: 850000 },
            { nombre: 'Caja 8 velocidades', categoria: 'Caja de Cambios', cantidad: 4, precio: 1200000 },
            { nombre: 'Pirelli C3 Medium', categoria: 'Neumáticos', cantidad: 24, precio: 2500 },
            { nombre: 'Pirelli C4 Soft', categoria: 'Neumáticos', cantidad: 16, precio: 2500 },
            { nombre: 'Alerón delantero v3', categoria: 'Aerodinámica', cantidad: 1, precio: 180000 },
        ],
        patrocinadores: [
            { id: 1, nombre: 'Oracle', tipo: 'Title Sponsor', aporte: 30000000 },
            { id: 2, nombre: 'Red Bull', tipo: 'Principal', aporte: 25000000 },
            { id: 3, nombre: 'ExxonMobil', tipo: 'Oficial', aporte: 15000000 },
            { id: 4, nombre: 'TAG Heuer', tipo: 'Oficial', aporte: 10000000 },
            { id: 5, nombre: 'Puma', tipo: 'Partner', aporte: 5000000 },
        ]
    },
    {
        id: 2,
        nombre: 'Ferrari',
        nombreCompleto: 'Scuderia Ferrari HP',
        pais: 'Italia',
        colorPrimario: '#DC0000',
        fundacion: 1950,
        campeonatos: 16,
        presupuesto: {
            total: 140000000,
            gastado: 92000000,
            sponsors: 78000000,
            distribucion: [
                { categoria: 'Power Unit', monto: 40000000, porcentaje: 29 },
                { categoria: 'Aerodinámica', monto: 38000000, porcentaje: 27 },
                { categoria: 'Personal', monto: 35000000, porcentaje: 25 },
                { categoria: 'Logística', monto: 27000000, porcentaje: 19 },
            ]
        },
        pilotos: [
            {
                id: 3,
                nombre: 'Charles Leclerc',
                numero: 16,
                nacionalidad: 'Mónaco',
                campeonatos: 0,
                victorias: 7
            },
            {
                id: 4,
                nombre: 'Lewis Hamilton',
                numero: 44,
                nacionalidad: 'Reino Unido',
                campeonatos: 7,
                victorias: 104
            }
        ],
        carros: [
            {
                id: 3,
                nombre: 'SF-24-01',
                piloto: 'Charles Leclerc',
                configuracion: {
                    powerUnit: { id: 6, nombre: 'Ferrari 066/12' },
                    aerodinamica: { id: 7, nombre: 'Paquete Aero Barcelona' },
                    suspension: { id: 8, nombre: 'Suspensión Pull-rod' },
                    cajaCambios: { id: 9, nombre: 'Caja Ferrari 8v' },
                    neumaticos: { id: 10, nombre: 'Pirelli C2 Hard' }
                }
            },
            {
                id: 4,
                nombre: 'SF-24-02',
                piloto: 'Lewis Hamilton',
                configuracion: {
                    powerUnit: { id: 6, nombre: 'Ferrari 066/12' },
                    aerodinamica: null,
                    suspension: { id: 8, nombre: 'Suspensión Pull-rod' },
                    cajaCambios: { id: 9, nombre: 'Caja Ferrari 8v' },
                    neumaticos: { id: 10, nombre: 'Pirelli C2 Hard' }
                }
            }
        ],
        inventario: [
            { nombre: 'Ferrari 066/12', categoria: 'Power Unit', cantidad: 3, precio: 18000000 },
            { nombre: 'Paquete Aero Barcelona', categoria: 'Aerodinámica', cantidad: 2, precio: 2800000 },
            { nombre: 'Suspensión Pull-rod', categoria: 'Suspensión', cantidad: 5, precio: 920000 },
            { nombre: 'Caja Ferrari 8v', categoria: 'Caja de Cambios', cantidad: 3, precio: 1400000 },
            { nombre: 'Pirelli C2 Hard', categoria: 'Neumáticos', cantidad: 20, precio: 2500 },
            { nombre: 'Pirelli C5 Hypersoft', categoria: 'Neumáticos', cantidad: 8, precio: 2500 },
        ],
        patrocinadores: [
            { id: 6, nombre: 'HP', tipo: 'Title Sponsor', aporte: 28000000 },
            { id: 7, nombre: 'Shell', tipo: 'Principal', aporte: 20000000 },
            { id: 8, nombre: 'Santander', tipo: 'Oficial', aporte: 15000000 },
            { id: 9, nombre: 'Ray-Ban', tipo: 'Partner', aporte: 8000000 },
            { id: 10, nombre: 'Puma', tipo: 'Partner', aporte: 7000000 },
        ]
    },
    {
        id: 3,
        nombre: 'McLaren',
        nombreCompleto: 'McLaren Formula 1 Team',
        pais: 'Reino Unido',
        colorPrimario: '#FF8700',
        fundacion: 1966,
        campeonatos: 8,
        presupuesto: {
            total: 135000000,
            gastado: 88000000,
            sponsors: 72000000,
            distribucion: [
                { categoria: 'Power Unit', monto: 32000000, porcentaje: 24 },
                { categoria: 'Aerodinámica', monto: 40000000, porcentaje: 30 },
                { categoria: 'Personal', monto: 33000000, porcentaje: 24 },
                { categoria: 'Logística', monto: 30000000, porcentaje: 22 },
            ]
        },
        pilotos: [
            {
                id: 5,
                nombre: 'Lando Norris',
                numero: 4,
                nacionalidad: 'Reino Unido',
                campeonatos: 0,
                victorias: 3
            },
            {
                id: 6,
                nombre: 'Oscar Piastri',
                numero: 81,
                nacionalidad: 'Australia',
                campeonatos: 0,
                victorias: 2
            }
        ],
        carros: [
            {
                id: 5,
                nombre: 'MCL38-01',
                piloto: 'Lando Norris',
                configuracion: {
                    powerUnit: { id: 11, nombre: 'Mercedes M15' },
                    aerodinamica: { id: 12, nombre: 'Paquete Aero Silverstone' },
                    suspension: { id: 13, nombre: 'Suspensión McLaren SR' },
                    cajaCambios: { id: 14, nombre: 'Caja McLaren 8v' },
                    neumaticos: { id: 15, nombre: 'Pirelli C3 Medium' }
                }
            },
            {
                id: 6,
                nombre: 'MCL38-02',
                piloto: 'Oscar Piastri',
                configuracion: {
                    powerUnit: { id: 11, nombre: 'Mercedes M15' },
                    aerodinamica: { id: 12, nombre: 'Paquete Aero Silverstone' },
                    suspension: null,
                    cajaCambios: { id: 14, nombre: 'Caja McLaren 8v' },
                    neumaticos: { id: 15, nombre: 'Pirelli C3 Medium' }
                }
            }
        ],
        inventario: [
            { nombre: 'Mercedes M15', categoria: 'Power Unit', cantidad: 4, precio: 14000000 },
            { nombre: 'Paquete Aero Silverstone', categoria: 'Aerodinámica', cantidad: 3, precio: 2600000 },
            { nombre: 'Suspensión McLaren SR', categoria: 'Suspensión', cantidad: 4, precio: 780000 },
            { nombre: 'Caja McLaren 8v', categoria: 'Caja de Cambios', cantidad: 3, precio: 1100000 },
            { nombre: 'Pirelli C3 Medium', categoria: 'Neumáticos', cantidad: 22, precio: 2500 },
        ],
        patrocinadores: [
            { id: 11, nombre: 'Google', tipo: 'Title Sponsor', aporte: 25000000 },
            { id: 12, nombre: 'Dell', tipo: 'Principal', aporte: 18000000 },
            { id: 13, nombre: 'Coca-Cola', tipo: 'Oficial', aporte: 12000000 },
            { id: 14, nombre: 'Hilton', tipo: 'Partner', aporte: 9000000 },
            { id: 15, nombre: 'Estrella Galicia', tipo: 'Partner', aporte: 8000000 },
        ]
    },
    {
        id: 4,
        nombre: 'Mercedes',
        nombreCompleto: 'Mercedes-AMG Petronas F1 Team',
        pais: 'Alemania',
        colorPrimario: '#00D2BE',
        fundacion: 2010,
        campeonatos: 8,
        presupuesto: {
            total: 145000000,
            gastado: 95000000,
            sponsors: 82000000,
            distribucion: [
                { categoria: 'Power Unit', monto: 45000000, porcentaje: 31 },
                { categoria: 'Aerodinámica', monto: 35000000, porcentaje: 24 },
                { categoria: 'Personal', monto: 38000000, porcentaje: 26 },
                { categoria: 'Logística', monto: 27000000, porcentaje: 19 },
            ]
        },
        pilotos: [
            {
                id: 7,
                nombre: 'George Russell',
                numero: 63,
                nacionalidad: 'Reino Unido',
                campeonatos: 0,
                victorias: 3
            },
            {
                id: 8,
                nombre: 'Kimi Antonelli',
                numero: 12,
                nacionalidad: 'Italia',
                campeonatos: 0,
                victorias: 0
            }
        ],
        carros: [
            {
                id: 7,
                nombre: 'W15-01',
                piloto: 'George Russell',
                configuracion: {
                    powerUnit: { id: 16, nombre: 'Mercedes M15 EVO' },
                    aerodinamica: { id: 17, nombre: 'Zero Sidepod Concept' },
                    suspension: { id: 18, nombre: 'Suspensión Mercedes ZS' },
                    cajaCambios: { id: 19, nombre: 'Caja Mercedes 8v' },
                    neumaticos: { id: 20, nombre: 'Pirelli C4 Soft' }
                }
            },
            {
                id: 8,
                nombre: 'W15-02',
                piloto: 'Kimi Antonelli',
                configuracion: {
                    powerUnit: { id: 16, nombre: 'Mercedes M15 EVO' },
                    aerodinamica: null,
                    suspension: null,
                    cajaCambios: null,
                    neumaticos: null
                }
            }
        ],
        inventario: [
            { nombre: 'Mercedes M15 EVO', categoria: 'Power Unit', cantidad: 5, precio: 16000000 },
            { nombre: 'Zero Sidepod Concept', categoria: 'Aerodinámica', cantidad: 2, precio: 3200000 },
            { nombre: 'Suspensión Mercedes ZS', categoria: 'Suspensión', cantidad: 4, precio: 950000 },
            { nombre: 'Caja Mercedes 8v', categoria: 'Caja de Cambios', cantidad: 4, precio: 1300000 },
            { nombre: 'Pirelli C4 Soft', categoria: 'Neumáticos', cantidad: 18, precio: 2500 },
        ],
        patrocinadores: [
            { id: 16, nombre: 'Petronas', tipo: 'Title Sponsor', aporte: 32000000 },
            { id: 17, nombre: 'INEOS', tipo: 'Principal', aporte: 22000000 },
            { id: 18, nombre: 'IWC', tipo: 'Oficial', aporte: 12000000 },
            { id: 19, nombre: 'Tommy Hilfiger', tipo: 'Partner', aporte: 9000000 },
            { id: 20, nombre: 'Monster Energy', tipo: 'Partner', aporte: 7000000 },
        ]
    }
];

// GET /api/equipos - Obtener todos los equipos
router.get('/', (req, res) => {
    res.json(equipos);
});

// GET /api/equipos/:id - Obtener equipo por ID
router.get('/:id', (req, res) => {
    const equipo = equipos.find(e => e.id === parseInt(req.params.id));
    if (!equipo) {
        return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    res.json(equipo);
});

// GET /api/equipos/:id/pilotos - Obtener pilotos de un equipo
router.get('/:id/pilotos', (req, res) => {
    const equipo = equipos.find(e => e.id === parseInt(req.params.id));
    if (!equipo) {
        return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    res.json(equipo.pilotos);
});

// GET /api/equipos/:id/carros - Obtener carros de un equipo
router.get('/:id/carros', (req, res) => {
    const equipo = equipos.find(e => e.id === parseInt(req.params.id));
    if (!equipo) {
        return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    res.json(equipo.carros);
});

// GET /api/equipos/:id/carros/:carroId - Obtener carro específico
router.get('/:id/carros/:carroId', (req, res) => {
    const equipo = equipos.find(e => e.id === parseInt(req.params.id));
    if (!equipo) {
        return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    const carro = equipo.carros.find(c => c.id === parseInt(req.params.carroId));
    if (!carro) {
        return res.status(404).json({ error: 'Carro no encontrado' });
    }
    res.json({
        ...carro,
        equipo: {
            id: equipo.id,
            nombre: equipo.nombre,
            colorPrimario: equipo.colorPrimario
        }
    });
});

// GET /api/equipos/:id/inventario - Obtener inventario de un equipo
router.get('/:id/inventario', (req, res) => {
    const equipo = equipos.find(e => e.id === parseInt(req.params.id));
    if (!equipo) {
        return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    res.json(equipo.inventario);
});

// GET /api/equipos/:id/patrocinadores - Obtener patrocinadores
router.get('/:id/patrocinadores', (req, res) => {
    const equipo = equipos.find(e => e.id === parseInt(req.params.id));
    if (!equipo) {
        return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    res.json(equipo.patrocinadores);
});

// GET /api/equipos/:id/presupuesto - Obtener presupuesto
router.get('/:id/presupuesto', (req, res) => {
    const equipo = equipos.find(e => e.id === parseInt(req.params.id));
    if (!equipo) {
        return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    res.json(equipo.presupuesto);
});

module.exports = router;
