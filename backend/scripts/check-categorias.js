const { getConnection } = require('../src/config/database');

async function checkCategorias() {
    try {
        const pool = await getConnection();
        
        console.log('\n=== COLUMNAS DE CATEGORIA ===');
        const cols = await pool.request().query(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'CATEGORIA'
            ORDER BY ORDINAL_POSITION
        `);
        console.log(cols.recordset);
        
        console.log('\n=== REGISTROS EN CATEGORIA ===');
        const recs = await pool.request().query(`SELECT * FROM CATEGORIA`);
        console.log(recs.recordset);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkCategorias();
