#!/usr/bin/env node
/**
 * Script para poblar la base de datos con datos de F1
 * Usa los servicios del backend para insertar datos
 */

const { getConnection } = require('../src/config/database');
const {
    equiposService,
    usuariosService,
    partesService,
    circuitosService,
    carrosService,
    patrocinadoresService
} = require('../src/services');

const seedData = require('./seed-data');

async function seed() {
    try {
        console.log('Conectando a la base de datos...\n');
        await getConnection();

        // ========== EQUIPOS ==========
        console.log('Insertando EQUIPOS...');
        const equipoMap = {};
        for (const eq of seedData.equipos) {
            const equipo = await equiposService.upsert(eq);
            equipoMap[equipo.Nombre] = equipo.Id_equipo;
        }
        console.log(' Equipos:', Object.keys(equipoMap).length);

        // ========== PATROCINADORES ==========
        console.log('Insertando PATROCINADORES...');
        const patMap = {};
        for (const nombre of seedData.patrocinadores) {
            const pat = await patrocinadoresService.upsert({ nombre });
            patMap[pat.Nombre_patrocinador] = pat.Id_patrocinador;
        }
        console.log('Patrocinadores:', Object.keys(patMap).length);

        // ========== PARTES ==========
        console.log('Insertando PARTES...');
        let partesCount = 0;
        for (const p of seedData.partes) {
            await partesService.upsert(p);
            partesCount++;
        }
        console.log(' Partes:', partesCount);

        // ========== CIRCUITOS ==========
        console.log('Insertando CIRCUITOS...');
        const circuitosInsertados = [];
        for (const c of seedData.circuitos) {
            const circ = await circuitosService.upsert(c);
            circuitosInsertados.push(circ);
        }
        console.log('   Circuitos:', circuitosInsertados.length);

        // ========== CARROS ==========
        console.log(' Insertando CARROS...');
        const carrosInsertados = [];
        for (const c of seedData.carros) {
            const idEquipo = equipoMap[c.equipo];
            if (idEquipo) {
                const carro = await carrosService.create({
                    idEquipo,
                    finalizado: c.finalizado,
                    mTotal: c.mTotal,
                    pTotal: c.pTotal,
                    aTotal: c.aTotal
                });
                carrosInsertados.push(carro);
            }
        }
        console.log('  Carros:', carrosInsertados.length);

        // ========== USUARIOS BASE ==========
        console.log('Insertando USUARIOS base...');
        for (const u of seedData.usuariosBase) {
            const idEquipo = equipoMap[u.equipo];
            if (idEquipo) {
                await usuariosService.upsert({
                    nombre: u.nombre,
                    correo: u.correo,
                    password: u.password,
                    idEquipo,
                    idRol: u.idRol
                });
                console.log(`   + ${u.correo}`);
            }
        }

        // ========== USUARIOS F1 ==========
        console.log(' Insertando USUARIOS F1...');
        for (const u of seedData.usuariosF1) {
            const idEquipo = equipoMap[u.equipo];
            if (idEquipo) {
                await usuariosService.upsert({
                    nombre: u.nombre,
                    correo: u.correo,
                    password: u.password,
                    idEquipo,
                    idRol: u.idRol
                });
                console.log(`   + ${u.correo}`);
            }
        }
        console.log('  Usuarios insertados');

        // ========== APORTES ==========
        console.log(' Insertando APORTES...');
        for (const a of seedData.aportes) {
            const idEquipo = equipoMap[a.equipo];
            const idPatrocinador = patMap[a.patrocinador];
            if (idEquipo && idPatrocinador) {
                await patrocinadoresService.upsertAporte({
                    monto: a.monto,
                    descripcion: a.descripcion,
                    fecha: a.fecha,
                    idEquipo,
                    idPatrocinador
                });
            }
        }
        console.log('  Aportes insertados');

        // ========== RESUMEN ==========
        console.log('\n RESUMEN DE DATOS:');
        console.log('═'.repeat(50));
        
        const equipos = await equiposService.getAll();
        const usuarios = await usuariosService.getAll();
        const partes = await partesService.getAll();
        const carros = await carrosService.getAll();
        const circuitos = await circuitosService.getAll();
        const patrocinadores = await patrocinadoresService.getAll();
        const aportes = await patrocinadoresService.getAllAportes();

        console.log(`  EQUIPO               ${equipos.length} registros`);
        console.log(`  USUARIO              ${usuarios.length} registros`);
        console.log(`  PARTE                ${partes.length} registros`);
        console.log(`  CARRO                ${carros.length} registros`);
        console.log(`  CIRCUITO             ${circuitos.length} registros`);
        console.log(`  PATROCINADOR         ${patrocinadores.length} registros`);
        console.log(`  APORTE               ${aportes.length} registros`);

        console.log('\n ¡Base de datos populada exitosamente!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

seed();
