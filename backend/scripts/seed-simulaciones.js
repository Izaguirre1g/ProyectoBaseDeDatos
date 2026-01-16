#!/usr/bin/env node
/**
 * Script para crear simulaciones de prueba
 * Asigna conductores a carros y genera resultados de simulación
 */

const { getConnection } = require('../src/config/database');
const {
    usuariosService,
    carrosService,
    circuitosService,
    simulacionesService
} = require('../src/services');

const seedData = require('./seed-data');

async function seedSimulaciones() {
    try {
        console.log('🔄 Conectando a la base de datos...\n');
        await getConnection();

        // Obtener datos necesarios
        const carros = await carrosService.getAll();
        const circuitos = await circuitosService.getAll();
        const usuarios = await usuariosService.getAll();

        // Crear mapa de usuarios por correo
        const usuarioMap = {};
        usuarios.forEach(u => { usuarioMap[u.Correo_usuario] = u; });

        // ========== ASIGNAR CONDUCTORES A CARROS ==========
        console.log('👤 Asignando conductores a carros...');
        
        for (const asignacion of seedData.asignacionesConductores) {
            const carro = carros[asignacion.carroIndex];
            const usuario = usuarioMap[asignacion.conductorEmail];
            
            if (carro && usuario) {
                await carrosService.asignarConductor(carro.Id_carro, usuario.Id_usuario);
            }
        }
        console.log('   ✅ Conductores asignados');

        // Recargar carros con conductores asignados
        const carrosActualizados = await carrosService.getFinalizados();

        // ========== CREAR SIMULACIONES ==========
        console.log('🏁 Creando simulaciones...');

        // Crear mapa de habilidades por ID de usuario
        const habilidades = {};
        for (const [email, hab] of Object.entries(seedData.habilidadesPilotos)) {
            const usuario = usuarioMap[email];
            if (usuario) {
                habilidades[usuario.Id_usuario] = hab;
            }
        }

        for (const simConfig of seedData.simulaciones) {
            const circuito = circuitos[simConfig.circuitoIndex];
            if (!circuito) continue;

            // Filtrar carros para esta simulación
            const carrosSimulacion = simConfig.carroIndices
                .map(idx => carros[idx])
                .filter(c => c && c.Id_conductor);

            if (carrosSimulacion.length === 0) continue;

            // Crear simulación
            const simulacion = await simulacionesService.create({
                fecha: simConfig.fecha,
                idCircuito: circuito.Id_circuito
            });

            // Calcular resultados
            const resultados = carrosSimulacion.map(carro => {
                const H = habilidades[carro.Id_conductor] || 85;
                return {
                    carroId: carro.Id_carro,
                    conductorId: carro.Id_conductor,
                    ...simulacionesService.calcularResultado(carro, circuito, H)
                };
            });

            // Ordenar por tiempo
            resultados.sort((a, b) => a.tiempoSegundos - b.tiempoSegundos);

            // Insertar resultados
            for (let i = 0; i < resultados.length; i++) {
                const r = resultados[i];
                await simulacionesService.addResultado({
                    idSimulacion: simulacion.Id_simulacion,
                    idCarro: r.carroId,
                    vrecta: r.Vrecta,
                    vcurva: r.Vcurva,
                    penalizacion: r.penalizacion,
                    tiempoSegundos: r.tiempoSegundos,
                    posicion: i + 1,
                    pTotal: r.P,
                    aTotal: r.A,
                    mTotal: r.M,
                    hConductor: r.H
                });
            }

            console.log(`   ✅ Simulación ${simulacion.Id_simulacion} creada con ${resultados.length} resultados`);
        }

        // ========== RESUMEN ==========
        console.log('\n📊 RESUMEN:');
        const simulaciones = await simulacionesService.getAll();
        console.log(`   Simulaciones: ${simulaciones.length}`);

        console.log('\n✅ ¡Simulaciones creadas exitosamente!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

seedSimulaciones();
