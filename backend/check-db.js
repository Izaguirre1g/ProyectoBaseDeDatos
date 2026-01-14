const sql = require('mssql/msnodesqlv8');

async function checkDB() {
    try {
        await sql.connect({ 
            connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost;Database=F1Database;Trusted_Connection=yes;' 
        });
        
        console.log('=== CONDUCTORES ===');
        const conductores = await sql.query`
            SELECT u.Id_usuario, u.Correo_usuario, e.Id_equipo, e.Nombre as Equipo, r.Nombre as Rol 
            FROM USUARIO u 
            JOIN EQUIPO e ON u.Id_equipo = e.Id_equipo 
            JOIN ROL r ON u.Id_rol = r.Id_rol 
            WHERE r.Nombre = 'Conductor'
        `;
        console.table(conductores.recordset);
        
        console.log('\n=== CARROS POR EQUIPO ===');
        const carros = await sql.query`
            SELECT c.Id_carro, c.Id_equipo, e.Nombre as Equipo, c.Finalizado, c.P_total, c.A_total, c.M_total, c.Id_conductor
            FROM CARRO c 
            JOIN EQUIPO e ON c.Id_equipo = e.Id_equipo
            ORDER BY c.Id_equipo, c.Id_carro
        `;
        console.table(carros.recordset);
        
        await sql.close();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkDB();
