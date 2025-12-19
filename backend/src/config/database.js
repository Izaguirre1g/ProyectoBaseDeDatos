const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: false, // true si usas Azure
        trustServerCertificate: true, // para desarrollo local
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
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
    closeConnection,
    dbConfig
};
