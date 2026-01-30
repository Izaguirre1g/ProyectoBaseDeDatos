// Datos de seed para equipos F1
module.exports = {
    equipos: [
        { nombre: 'Scuderia Ferrari', presupuesto: 150000 },
        { nombre: 'Oracle Red Bull Racing', presupuesto: 145000 },
        { nombre: 'Mercedes-AMG Petronas', presupuesto: 140000 },
        { nombre: 'McLaren F1 Team', presupuesto: 135000 },
        { nombre: 'Aston Martin F1', presupuesto: 130000 },
        { nombre: 'Alpine F1 Team', presupuesto: 120000 },
    ],

    patrocinadores: [
        'Oracle', 'Red Bull', 'Petronas', 'INEOS', 'Google', 
        'Dell Technologies', 'Cognizant', 'Aramco', 'BWT', 'Castrol', 'Shell'
    ],

    partes: [
        // Power Units (Cat 1)
        { nombre: 'Power Unit Honda RBPT', marca: 'Honda', manejo: 5, aerodinamica: 2, potencia: 9, precio: 15000000, idCategoria: 1 },
        { nombre: 'Power Unit Mercedes M14', marca: 'Mercedes', manejo: 6, aerodinamica: 3, potencia: 8, precio: 14000000, idCategoria: 1 },
        { nombre: 'Power Unit Renault E-Tech', marca: 'Renault', manejo: 7, aerodinamica: 2, potencia: 7, precio: 12000000, idCategoria: 1 },
        // Aerodinamica (Cat 2)
        { nombre: 'Alerón Baja Carga RB', marca: 'Red Bull Tech', manejo: 4, aerodinamica: 9, potencia: 3, precio: 800000, idCategoria: 2 },
        { nombre: 'Alerón Alta Carga AMG', marca: 'Mercedes AMG', manejo: 6, aerodinamica: 7, potencia: 2, precio: 750000, idCategoria: 2 },
        { nombre: 'Alerón Equilibrado MCL', marca: 'McLaren Tech', manejo: 5, aerodinamica: 8, potencia: 2, precio: 700000, idCategoria: 2 },
        // Neumáticos (Cat 3)
        { nombre: 'Pirelli Soft C5', marca: 'Pirelli', manejo: 5, aerodinamica: 3, potencia: 6, precio: 2000, idCategoria: 3 },
        { nombre: 'Pirelli Medium C3', marca: 'Pirelli', manejo: 6, aerodinamica: 4, potencia: 5, precio: 2000, idCategoria: 3 },
        { nombre: 'Pirelli Hard C1', marca: 'Pirelli', manejo: 7, aerodinamica: 5, potencia: 4, precio: 2000, idCategoria: 3 },
        // Suspensión (Cat 4)
        { nombre: 'Suspensión Push-Rod Pro', marca: 'Multimatic', manejo: 8, aerodinamica: 4, potencia: 2, precio: 500000, idCategoria: 4 },
        { nombre: 'Suspensión Pull-Rod Racing', marca: 'Sachs', manejo: 7, aerodinamica: 5, potencia: 3, precio: 450000, idCategoria: 4 },
        // Caja de cambios (Cat 5)
        { nombre: 'Caja 8V Secuencial Pro', marca: 'Xtrac', manejo: 6, aerodinamica: 2, potencia: 5, precio: 600000, idCategoria: 5 },
        { nombre: 'Caja 8V Carbon Elite', marca: 'Ricardo', manejo: 7, aerodinamica: 3, potencia: 4, precio: 650000, idCategoria: 5 },
    ],

    circuitos: [
        { distancia: 5.793, curvas: 11 },  // Monza
        { distancia: 3.337, curvas: 19 },  // Monaco
        { distancia: 7.004, curvas: 19 },  // Spa
        { distancia: 5.891, curvas: 18 },  // Silverstone
        { distancia: 5.807, curvas: 18 },  // Suzuka
        { distancia: 4.318, curvas: 16 },  // Barcelona
        { distancia: 5.412, curvas: 15 },  // Interlagos
        { distancia: 6.003, curvas: 14 },  // COTA
    ],

    carros: [
        { equipo: 'Scuderia Ferrari', finalizado: 1, mTotal: 32, pTotal: 34, aTotal: 30 },
        { equipo: 'Oracle Red Bull Racing', finalizado: 1, mTotal: 30, pTotal: 35, aTotal: 28 },
        { equipo: 'Oracle Red Bull Racing', finalizado: 1, mTotal: 28, pTotal: 33, aTotal: 30 },
        { equipo: 'Mercedes-AMG Petronas', finalizado: 1, mTotal: 32, pTotal: 30, aTotal: 32 },
        { equipo: 'Mercedes-AMG Petronas', finalizado: 1, mTotal: 31, pTotal: 31, aTotal: 31 },
        { equipo: 'McLaren F1 Team', finalizado: 1, mTotal: 29, pTotal: 32, aTotal: 29 },
        { equipo: 'McLaren F1 Team', finalizado: 0, mTotal: 27, pTotal: 30, aTotal: 28 },
    ],

    // Usuarios base del sistema
    usuariosBase: [
        { nombre: 'Administrador', correo: 'admin@f1.com', password: '123456', equipo: 'Scuderia Ferrari', idRol: 1 },
        { nombre: 'Ingeniero', correo: 'engineer@f1.com', password: '123456', equipo: 'Scuderia Ferrari', idRol: 2 },
        { nombre: 'Conductor', correo: 'driver@f1.com', password: '123456', equipo: 'Scuderia Ferrari', idRol: 3 },
    ],

    // Pilotos e ingenieros de equipos
    usuariosF1: [
        // Red Bull
        { nombre: 'Max Verstappen', correo: 'verstappen@f1.com', password: '123456', equipo: 'Oracle Red Bull Racing', idRol: 3 },
        { nombre: 'Sergio Perez', correo: 'perez@f1.com', password: '123456', equipo: 'Oracle Red Bull Racing', idRol: 3 },
        { nombre: 'Adrian Newey', correo: 'newey@f1.com', password: '123456', equipo: 'Oracle Red Bull Racing', idRol: 2 },
        // Mercedes
        { nombre: 'Lewis Hamilton', correo: 'hamilton@f1.com', password: '123456', equipo: 'Mercedes-AMG Petronas', idRol: 3 },
        { nombre: 'George Russell', correo: 'russell@f1.com', password: '123456', equipo: 'Mercedes-AMG Petronas', idRol: 3 },
        { nombre: 'Toto Wolff', correo: 'wolff@f1.com', password: '123456', equipo: 'Mercedes-AMG Petronas', idRol: 2 },
        // McLaren
        { nombre: 'Lando Norris', correo: 'norris@f1.com', password: '123456', equipo: 'McLaren F1 Team', idRol: 3 },
        { nombre: 'Oscar Piastri', correo: 'piastri@f1.com', password: '123456', equipo: 'McLaren F1 Team', idRol: 3 },
        // Ferrari
        { nombre: 'Charles Leclerc', correo: 'leclerc@f1.com', password: '123456', equipo: 'Scuderia Ferrari', idRol: 3 },
        { nombre: 'Carlos Sainz', correo: 'sainz@f1.com', password: '123456', equipo: 'Scuderia Ferrari', idRol: 3 },
    ],

    aportes: [
        { monto: 50000000, descripcion: 'Patrocinio Temporada 2026', fecha: '2026-01-01', equipo: 'Oracle Red Bull Racing', patrocinador: 'Oracle' },
        { monto: 40000000, descripcion: 'Patrocinio Principal', fecha: '2026-01-01', equipo: 'Oracle Red Bull Racing', patrocinador: 'Red Bull' },
        { monto: 45000000, descripcion: 'Patrocinio Temporada', fecha: '2026-01-01', equipo: 'Mercedes-AMG Petronas', patrocinador: 'Petronas' },
        { monto: 35000000, descripcion: 'Socio Tecnológico', fecha: '2026-01-01', equipo: 'Mercedes-AMG Petronas', patrocinador: 'INEOS' },
        { monto: 30000000, descripcion: 'Patrocinio Digital', fecha: '2026-01-01', equipo: 'McLaren F1 Team', patrocinador: 'Google' },
        { monto: 25000000, descripcion: 'Socio Tecnológico', fecha: '2026-01-01', equipo: 'McLaren F1 Team', patrocinador: 'Dell Technologies' },
        { monto: 40000000, descripcion: 'Patrocinio Principal', fecha: '2026-01-01', equipo: 'Scuderia Ferrari', patrocinador: 'Shell' },
    ],

    // Configuración para simulaciones
    asignacionesConductores: [
        { carroIndex: 0, conductorEmail: 'leclerc@f1.com' },   // Ferrari
        { carroIndex: 1, conductorEmail: 'verstappen@f1.com' }, // Red Bull 1
        { carroIndex: 2, conductorEmail: 'perez@f1.com' },      // Red Bull 2
        { carroIndex: 3, conductorEmail: 'hamilton@f1.com' },   // Mercedes 1
        { carroIndex: 4, conductorEmail: 'russell@f1.com' },    // Mercedes 2
        { carroIndex: 5, conductorEmail: 'norris@f1.com' },     // McLaren 1
        { carroIndex: 6, conductorEmail: 'piastri@f1.com' },    // McLaren 2
    ],

    habilidadesPilotos: {
        'verstappen@f1.com': 95,
        'perez@f1.com': 88,
        'hamilton@f1.com': 92,
        'russell@f1.com': 90,
        'norris@f1.com': 91,
        'piastri@f1.com': 87,
        'leclerc@f1.com': 93,
        'sainz@f1.com': 89,
    },

    simulaciones: [
        { circuitoIndex: 0, carroIndices: [1, 3, 5], fecha: '2026-01-10 14:30:00' },      // Monza
        { circuitoIndex: 1, carroIndices: [1, 2, 3, 5], fecha: '2026-01-08 10:15:00' },   // Monaco
        { circuitoIndex: 2, carroIndices: [1, 3, 4, 5], fecha: '2026-01-05 16:45:00' },   // Spa
        { circuitoIndex: 3, carroIndices: [2, 3, 5], fecha: '2026-01-03 09:00:00' },      // Silverstone
        { circuitoIndex: 4, carroIndices: [1, 4, 5], fecha: '2025-12-28 11:30:00' },      // Suzuka
    ]
};
