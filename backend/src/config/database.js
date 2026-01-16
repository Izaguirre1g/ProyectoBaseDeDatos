const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

const dbConfig = {
    connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER || 'localhost'};Database=${process.env.DB_DATABASE || 'DB_F1_Garage_Manager'};Trusted_Connection=yes;`
};

let pool;

async function getConnection() {
    try {
        if (pool) {
            return pool;
        }
        pool = await sql.connect(dbConfig);
        console.log('✅ Conexión a SQL Server establecida');
        return pool;
    } catch (error) {
        console.error('❌ Error al conectar a SQL Server:', error);
        throw error;
    }
}

// Función síncrona para obtener el pool (asume que ya está conectado)
function getPool() {
    if (!pool) {
        throw new Error('Pool no inicializado. Llama a getConnection() primero.');
    }
    return pool;
}

async function closeConnection() {
    try {
        if (pool) {
            await pool.close();
            pool = null;
            console.log('Conexión a SQL Server cerrada');
        }
    } catch (error) {
        console.error('Error al cerrar conexión:', error);
        throw error;
    }
}

module.exports = {
    sql,
    getConnection,
    getPool,
    closeConnection,
    dbConfig
};
