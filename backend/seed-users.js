// Script para insertar usuarios de prueba en la BD
const sql = require('mssql/msnodesqlv8');
const argon2 = require('argon2');

const config = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost;Database=F1Database;Trusted_Connection=yes;'
};

// Usuarios a insertar
const usuarios = [
    { id: 1, correo: 'admin@f1.com', password: '123456', id_equipo: 10, id_rol: 1 },      // Administrador
    { id: 2, correo: 'engineer@f1.com', password: '123456', id_equipo: 10, id_rol: 2 },   // Ingeniero
    { id: 3, correo: 'driver@f1.com', password: '123456', id_equipo: 10, id_rol: 3 },     // Conductor
];

async function insertarUsuarios() {
    try {
        console.log('🔄 Conectando a la base de datos...\n');
        const pool = await sql.connect(config);
        
        console.log('👤 INSERTANDO USUARIOS:');
        console.log('================================\n');
        
        for (const usuario of usuarios) {
            // Generar hash Argon2id
            const hash = await argon2.hash(usuario.password, {
                type: argon2.argon2id,
                memoryCost: 19456,
                timeCost: 2,
                parallelism: 1
            });
            
            console.log(`📧 ${usuario.correo}`);
            console.log(`   Rol: ${usuario.id_rol} | Equipo: ${usuario.id_equipo}`);
            console.log(`   Hash: ${hash.substring(0, 50)}...`);
            
            // Verificar si ya existe
            const existe = await pool.request()
                .input('correo', sql.NVarChar, usuario.correo)
                .query('SELECT Id_usuario FROM USUARIO WHERE Correo_usuario = @correo');
            
            if (existe.recordset.length > 0) {
                console.log(`   ⚠️  Ya existe, actualizando...\n`);
                await pool.request()
                    .input('correo', sql.NVarChar, usuario.correo)
                    .input('hash', sql.NVarChar, hash)
                    .input('id_equipo', sql.Int, usuario.id_equipo)
                    .input('id_rol', sql.Int, usuario.id_rol)
                    .query(`
                        UPDATE USUARIO 
                        SET Contrasena_hash = @hash, Id_equipo = @id_equipo, Id_rol = @id_rol
                        WHERE Correo_usuario = @correo
                    `);
            } else {
                console.log(`   ✅ Insertando...\n`);
                await pool.request()
                    .input('id', sql.Int, usuario.id)
                    .input('correo', sql.NVarChar, usuario.correo)
                    .input('hash', sql.NVarChar, hash)
                    .input('id_equipo', sql.Int, usuario.id_equipo)
                    .input('id_rol', sql.Int, usuario.id_rol)
                    .query(`
                        INSERT INTO USUARIO (Id_usuario, Correo_usuario, Contrasena_hash, Id_equipo, Id_rol)
                        VALUES (@id, @correo, @hash, @id_equipo, @id_rol)
                    `);
            }
        }
        
        // Verificar usuarios insertados
        console.log('\n📋 USUARIOS EN LA BD:');
        console.log('================================');
        const result = await pool.request().query(`
            SELECT u.Id_usuario, u.Correo_usuario, r.Nombre as Rol, e.Nombre as Equipo
            FROM USUARIO u
            JOIN ROL r ON u.Id_rol = r.Id_rol
            JOIN EQUIPO e ON u.Id_equipo = e.Id_equipo
        `);
        console.table(result.recordset);
        
        console.log('\n✅ Usuarios insertados correctamente!');
        await pool.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

insertarUsuarios();
