#!/usr/bin/env node
/**
 * Script para verificar la conexión y el estado de la base de datos
 */

const { getConnection, sql } = require('../src/config/database');

async function checkDB() {
    try {
        console.log('🔄 Verificando conexión a la base de datos...\n');
        const pool = await getConnection();
        
        console.log('✅ Conexión exitosa!\n');
        
        // Verificar tablas
        const tablas = ['ROL', 'CATEGORIA', 'EQUIPO', 'USUARIO', 'PARTE', 'CARRO', 'CIRCUITO', 'PATROCINADOR', 'APORTE', 'SIMULACION', 'RESULTADO'];
        
        console.log('📊 ESTADO DE TABLAS:');
        console.log('═'.repeat(50));
        
        for (const tabla of tablas) {
            try {
                const result = await pool.request().query(`SELECT COUNT(*) as total FROM ${tabla}`);
                console.log(`  ${tabla.padEnd(20)} ${result.recordset[0].total} registros`);
            } catch (e) {
                console.log(`  ${tabla.padEnd(20)} ❌ Error: ${e.message}`);
            }
        }
        
        console.log('\n✅ Verificación completada');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        process.exit(1);
    }
}

checkDB();
