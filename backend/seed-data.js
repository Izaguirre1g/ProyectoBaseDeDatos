// Script simplificado para popular la base de datos
const sql = require('mssql/msnodesqlv8');
const argon2 = require('argon2');

const config = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost;Database=F1Database;Trusted_Connection=yes;'
};

async function popularBD() {
    try {
        console.log('🔄 Conectando a la base de datos...\n');
        const pool = await sql.connect(config);
        
        // ========== EQUIPOS ==========
        console.log('🏎️  Insertando EQUIPOS...');
        const equipos = [
            { nombre: 'Oracle Red Bull Racing', presupuesto: 145000 },
            { nombre: 'Mercedes-AMG Petronas', presupuesto: 140000 },
            { nombre: 'McLaren F1 Team', presupuesto: 135000 },
            { nombre: 'Aston Martin F1', presupuesto: 130000 },
            { nombre: 'Alpine F1 Team', presupuesto: 120000 },
        ];
        
        for (const eq of equipos) {
            const existe = await pool.request()
                .input('nombre', sql.NVarChar, eq.nombre)
                .query('SELECT 1 FROM EQUIPO WHERE Nombre = @nombre');
            
            if (existe.recordset.length === 0) {
                await pool.request()
                    .input('nombre', sql.NVarChar, eq.nombre)
                    .input('presupuesto', sql.Decimal(18, 2), eq.presupuesto)
                    .query('INSERT INTO EQUIPO (Nombre, Presupuesto) VALUES (@nombre, @presupuesto)');
            }
        }
        console.log('   ✅ Equipos insertados');
        
        // Obtener IDs de equipos insertados
        const equiposDB = await pool.request().query('SELECT Id_equipo, Nombre FROM EQUIPO');
        const equipoMap = {};
        equiposDB.recordset.forEach(e => { equipoMap[e.Nombre] = e.Id_equipo; });
        console.log('   Equipos:', equipoMap);
        
        // ========== PATROCINADORES ==========
        console.log('💰 Insertando PATROCINADORES...');
        const patrocinadores = ['Oracle', 'Red Bull', 'Petronas', 'INEOS', 'Google', 'Dell Technologies', 'Cognizant', 'Aramco', 'BWT', 'Castrol'];
        
        for (const nombre of patrocinadores) {
            const existe = await pool.request()
                .input('nombre', sql.NVarChar, nombre)
                .query('SELECT 1 FROM PATROCINADOR WHERE Nombre_patrocinador = @nombre');
            
            if (existe.recordset.length === 0) {
                await pool.request()
                    .input('nombre', sql.NVarChar, nombre)
                    .query('INSERT INTO PATROCINADOR (Nombre_patrocinador) VALUES (@nombre)');
            }
        }
        console.log('   ✅ Patrocinadores insertados');
        
        // Obtener IDs de patrocinadores
        const patsDB = await pool.request().query('SELECT Id_patrocinador, Nombre_patrocinador FROM PATROCINADOR');
        const patMap = {};
        patsDB.recordset.forEach(p => { patMap[p.Nombre_patrocinador] = p.Id_patrocinador; });
        
        // ========== PARTES ADICIONALES ==========
        console.log('🔧 Insertando PARTES adicionales...');
        const partes = [
            // Power Units (Cat 1)
            { nombre: 'Power Unit Honda RBPT', marca: 'Honda', m: 5, a: 2, p: 9, precio: 15000000, cat: 1 },
            { nombre: 'Power Unit Mercedes M14', marca: 'Mercedes', m: 6, a: 3, p: 8, precio: 14000000, cat: 1 },
            { nombre: 'Power Unit Renault E-Tech', marca: 'Renault', m: 7, a: 2, p: 7, precio: 12000000, cat: 1 },
            // Aerodinamica (Cat 2)
            { nombre: 'Alerón Baja Carga RB', marca: 'Red Bull Tech', m: 4, a: 9, p: 3, precio: 800000, cat: 2 },
            { nombre: 'Alerón Alta Carga AMG', marca: 'Mercedes AMG', m: 6, a: 7, p: 2, precio: 750000, cat: 2 },
            { nombre: 'Alerón Equilibrado MCL', marca: 'McLaren Tech', m: 5, a: 8, p: 2, precio: 700000, cat: 2 },
            // Neumáticos (Cat 3)
            { nombre: 'Pirelli Soft C5', marca: 'Pirelli', m: 5, a: 3, p: 6, precio: 2000, cat: 3 },
            { nombre: 'Pirelli Medium C3', marca: 'Pirelli', m: 6, a: 4, p: 5, precio: 2000, cat: 3 },
            { nombre: 'Pirelli Hard C1', marca: 'Pirelli', m: 7, a: 5, p: 4, precio: 2000, cat: 3 },
            // Suspensión (Cat 4)
            { nombre: 'Suspensión Push-Rod Pro', marca: 'Multimatic', m: 8, a: 4, p: 2, precio: 500000, cat: 4 },
            { nombre: 'Suspensión Pull-Rod Racing', marca: 'Sachs', m: 7, a: 5, p: 3, precio: 450000, cat: 4 },
            // Caja de cambios (Cat 5)
            { nombre: 'Caja 8V Secuencial Pro', marca: 'Xtrac', m: 6, a: 2, p: 5, precio: 600000, cat: 5 },
            { nombre: 'Caja 8V Carbon Elite', marca: 'Ricardo', m: 7, a: 3, p: 4, precio: 650000, cat: 5 },
        ];
        
        for (const p of partes) {
            const existe = await pool.request()
                .input('nombre', sql.NVarChar, p.nombre)
                .query('SELECT 1 FROM PARTE WHERE Nombre = @nombre');
            
            if (existe.recordset.length === 0) {
                await pool.request()
                    .input('nombre', sql.NVarChar, p.nombre)
                    .input('marca', sql.NVarChar, p.marca)
                    .input('m', sql.TinyInt, p.m)
                    .input('a', sql.TinyInt, p.a)
                    .input('p', sql.TinyInt, p.p)
                    .input('precio', sql.Decimal(18, 2), p.precio)
                    .input('cat', sql.Int, p.cat)
                    .query(`
                        INSERT INTO PARTE (Nombre, Marca, Manejo, Aerodinamica, Potencia, Precio, Id_categoria)
                        VALUES (@nombre, @marca, @m, @a, @p, @precio, @cat)
                    `);
            }
        }
        console.log('   ✅ Partes insertadas');
        
        // ========== CIRCUITOS ==========
        console.log('🏁 Insertando CIRCUITOS...');
        const circuitos = [
            { distancia: 5.793, curvas: 11 },  // Monza
            { distancia: 3.337, curvas: 19 },  // Monaco
            { distancia: 7.004, curvas: 19 },  // Spa
            { distancia: 5.891, curvas: 18 },  // Silverstone
            { distancia: 5.807, curvas: 18 },  // Suzuka
            { distancia: 4.318, curvas: 16 },  // Barcelona
            { distancia: 5.412, curvas: 15 },  // Interlagos
            { distancia: 6.003, curvas: 14 },  // COTA
        ];
        
        for (const c of circuitos) {
            const existe = await pool.request()
                .input('distancia', sql.Decimal(10, 3), c.distancia)
                .query('SELECT 1 FROM CIRCUITO WHERE Distancia_total = @distancia');
            
            if (existe.recordset.length === 0) {
                await pool.request()
                    .input('distancia', sql.Decimal(10, 3), c.distancia)
                    .input('curvas', sql.TinyInt, c.curvas)
                    .query('INSERT INTO CIRCUITO (Distancia_total, Cantidad_curvas) VALUES (@distancia, @curvas)');
            }
        }
        console.log('   ✅ Circuitos insertados');
        
        // ========== CARROS ADICIONALES ==========
        console.log('🚗 Insertando CARROS...');
        const carrosData = [
            { equipo: 'Oracle Red Bull Racing', finalizado: 1, m: 30, p: 35, a: 28 },
            { equipo: 'Oracle Red Bull Racing', finalizado: 1, m: 28, p: 33, a: 30 },
            { equipo: 'Mercedes-AMG Petronas', finalizado: 1, m: 32, p: 30, a: 32 },
            { equipo: 'Mercedes-AMG Petronas', finalizado: 1, m: 31, p: 31, a: 31 },
            { equipo: 'McLaren F1 Team', finalizado: 1, m: 29, p: 32, a: 29 },
            { equipo: 'McLaren F1 Team', finalizado: 0, m: 27, p: 30, a: 28 },
        ];
        
        for (const c of carrosData) {
            const equipoId = equipoMap[c.equipo];
            if (equipoId) {
                await pool.request()
                    .input('equipo', sql.Int, equipoId)
                    .input('finalizado', sql.TinyInt, c.finalizado)
                    .input('m', sql.TinyInt, c.m)
                    .input('p', sql.TinyInt, c.p)
                    .input('a', sql.TinyInt, c.a)
                    .query('INSERT INTO CARRO (Id_equipo, Finalizado, M_total, P_total, A_total) VALUES (@equipo, @finalizado, @m, @p, @a)');
            }
        }
        console.log('   ✅ Carros insertados');
        
        // ========== USUARIOS ADICIONALES (Pilotos e Ingenieros) ==========
        console.log('👤 Insertando USUARIOS adicionales...');
        
        // Obtener el próximo ID disponible (USUARIO no tiene IDENTITY)
        const maxIdResult = await pool.request().query('SELECT ISNULL(MAX(Id_usuario), 0) as maxId FROM USUARIO');
        let nextUserId = maxIdResult.recordset[0].maxId + 1;
        
        const usuarios = [
            // Red Bull
            { correo: 'verstappen@f1.com', password: '123456', equipo: 'Oracle Red Bull Racing', rol: 3 },
            { correo: 'perez@f1.com', password: '123456', equipo: 'Oracle Red Bull Racing', rol: 3 },
            { correo: 'newey@f1.com', password: '123456', equipo: 'Oracle Red Bull Racing', rol: 2 },
            // Mercedes
            { correo: 'hamilton@f1.com', password: '123456', equipo: 'Mercedes-AMG Petronas', rol: 3 },
            { correo: 'russell@f1.com', password: '123456', equipo: 'Mercedes-AMG Petronas', rol: 3 },
            { correo: 'wolff@f1.com', password: '123456', equipo: 'Mercedes-AMG Petronas', rol: 2 },
            // McLaren
            { correo: 'norris@f1.com', password: '123456', equipo: 'McLaren F1 Team', rol: 3 },
            { correo: 'piastri@f1.com', password: '123456', equipo: 'McLaren F1 Team', rol: 3 },
            // Ferrari adicionales
            { correo: 'leclerc@f1.com', password: '123456', equipo: 'Scuderia Ferrari', rol: 3 },
            { correo: 'sainz@f1.com', password: '123456', equipo: 'Scuderia Ferrari', rol: 3 },
        ];
        
        for (const u of usuarios) {
            const existe = await pool.request()
                .input('correo', sql.NVarChar, u.correo)
                .query('SELECT 1 FROM USUARIO WHERE Correo_usuario = @correo');
            
            if (existe.recordset.length === 0) {
                const equipoId = equipoMap[u.equipo];
                if (equipoId) {
                    const hash = await argon2.hash(u.password, {
                        type: argon2.argon2id,
                        memoryCost: 19456,
                        timeCost: 2,
                        parallelism: 1
                    });
                    
                    await pool.request()
                        .input('id', sql.Int, nextUserId++)
                        .input('correo', sql.NVarChar, u.correo)
                        .input('hash', sql.NVarChar, hash)
                        .input('equipo', sql.Int, equipoId)
                        .input('rol', sql.Int, u.rol)
                        .query('INSERT INTO USUARIO (Id_usuario, Correo_usuario, Contrasena_hash, Id_equipo, Id_rol) VALUES (@id, @correo, @hash, @equipo, @rol)');
                    console.log(`   + ${u.correo}`);
                }
            }
        }
        console.log('   ✅ Usuarios insertados');
        
        // ========== APORTES ==========
        console.log('💵 Insertando APORTES...');
        const aportes = [
            { monto: 50000000, desc: 'Patrocinio Temporada 2026', fecha: '2026-01-01', equipo: 'Oracle Red Bull Racing', pat: 'Oracle' },
            { monto: 40000000, desc: 'Patrocinio Principal', fecha: '2026-01-01', equipo: 'Oracle Red Bull Racing', pat: 'Red Bull' },
            { monto: 45000000, desc: 'Patrocinio Temporada', fecha: '2026-01-01', equipo: 'Mercedes-AMG Petronas', pat: 'Petronas' },
            { monto: 35000000, desc: 'Socio Tecnológico', fecha: '2026-01-01', equipo: 'Mercedes-AMG Petronas', pat: 'INEOS' },
            { monto: 30000000, desc: 'Patrocinio Digital', fecha: '2026-01-01', equipo: 'McLaren F1 Team', pat: 'Google' },
            { monto: 25000000, desc: 'Socio Tecnológico', fecha: '2026-01-01', equipo: 'McLaren F1 Team', pat: 'Dell Technologies' },
        ];
        
        for (const a of aportes) {
            const equipoId = equipoMap[a.equipo];
            const patId = patMap[a.pat];
            if (equipoId && patId) {
                const existe = await pool.request()
                    .input('equipo', sql.Int, equipoId)
                    .input('pat', sql.Int, patId)
                    .input('monto', sql.Decimal(18, 2), a.monto)
                    .query('SELECT 1 FROM APORTE WHERE Id_equipo = @equipo AND Id_patrocinador = @pat AND Monto = @monto');
                
                if (existe.recordset.length === 0) {
                    await pool.request()
                        .input('monto', sql.Decimal(18, 2), a.monto)
                        .input('desc', sql.NVarChar, a.desc)
                        .input('fecha', sql.Date, a.fecha)
                        .input('equipo', sql.Int, equipoId)
                        .input('pat', sql.Int, patId)
                        .query('INSERT INTO APORTE (Monto, Descripcion, Fecha, Id_equipo, Id_patrocinador) VALUES (@monto, @desc, @fecha, @equipo, @pat)');
                }
            }
        }
        console.log('   ✅ Aportes insertados');
        
        // ========== RESUMEN ==========
        console.log('\n📊 RESUMEN DE DATOS:');
        console.log('═'.repeat(50));
        
        const tablas = ['EQUIPO', 'USUARIO', 'PARTE', 'CARRO', 'CIRCUITO', 'PATROCINADOR', 'APORTE'];
        for (const t of tablas) {
            const count = await pool.request().query(`SELECT COUNT(*) as total FROM ${t}`);
            console.log(`  ${t.padEnd(20)} ${count.recordset[0].total} registros`);
        }
        
        console.log('\n✅ ¡Base de datos populada exitosamente!');
        await pool.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

popularBD();
