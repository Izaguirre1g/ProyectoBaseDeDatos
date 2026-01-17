#!/usr/bin/env node
/**
 * Script para limpiar datos de prueba de la base de datos
 * ⚠️ CUIDADO: Este script elimina datos!
 */

const { getConnection } = require('../src/config/database');

async function cleanDB() {
    try {
        console.log('🔄 Conectando a la base de datos...\n');
        const pool = await getConnection();
        
        console.log('⚠️  LIMPIANDO DATOS DE PRUEBA...\n');
        
        // Orden de eliminación (respetando FKs)
        const tablas = [
            'RESULTADO',
            'SIMULACION', 
            'ESTRUCTURA_CARRO',
            'INVENTARIO_EQUIPO',
            'DETALLE_PEDIDO',
            'PEDIDO',
            'APORTE',
            'CARRO',
            'USUARIO',
            'PARTE',
            'CIRCUITO',
            'PATROCINADOR',
            'EQUIPO'
        ];
        
        for (const tabla of tablas) {
            try {
                const result = await pool.request().query(`DELETE FROM ${tabla}`);
                console.log(`  ✅ ${tabla}: ${result.rowsAffected[0]} registros eliminados`);
            } catch (e) {
                console.log(`  ❌ ${tabla}: ${e.message}`);
            }
        }
        
        console.log('\n✅ Limpieza completada');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Confirmación de seguridad
const args = process.argv.slice(2);
if (args.includes('--confirm')) {
    cleanDB();
} else {
    console.log('⚠️  Este script eliminará todos los datos de prueba.');
    console.log('   Para confirmar, ejecuta: node scripts/clean-db.js --confirm');
    process.exit(0);
}
