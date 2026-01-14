// Script para ver datos actuales
const sql = require('mssql/msnodesqlv8');

const config = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost;Database=F1Database;Trusted_Connection=yes;'
};

async function verDatos() {
    try {
        const pool = await sql.connect(config);
        
        console.log('📋 CATEGORÍAS:');
        const cats = await pool.request().query('SELECT * FROM CATEGORIA');
        console.table(cats.recordset);
        
        console.log('\n📋 PARTES:');
        const partes = await pool.request().query('SELECT * FROM PARTE');
        console.table(partes.recordset);
        
        console.log('\n📋 CARROS:');
        const carros = await pool.request().query('SELECT * FROM CARRO');
        console.table(carros.recordset);
        
        console.log('\n📋 PATROCINADORES:');
        const pats = await pool.request().query('SELECT * FROM PATROCINADOR');
        console.table(pats.recordset);
        
        console.log('\n📋 APORTES:');
        const aportes = await pool.request().query('SELECT * FROM APORTE');
        console.table(aportes.recordset);
        
        await pool.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

verDatos();
