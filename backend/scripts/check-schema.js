const { getConnection } = require('../src/config/database');

async function checkSchema() {
    try {
        const pool = await getConnection();
        
        console.log('\n=== COLUMNAS DE PATROCINADOR ===');
        const patCols = await pool.request().query(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'PATROCINADOR'
            ORDER BY ORDINAL_POSITION
        `);
        console.log(patCols.recordset);
        
        console.log('\n=== COLUMNAS DE APORTE ===');
        const aporteCols = await pool.request().query(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'APORTE'
            ORDER BY ORDINAL_POSITION
        `);
        console.log(aporteCols.recordset);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkSchema();
