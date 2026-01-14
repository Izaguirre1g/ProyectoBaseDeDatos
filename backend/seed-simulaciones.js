// Script para asignar conductores a carros y crear simulaciones de prueba
const sql = require('mssql/msnodesqlv8');

const config = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost;Database=F1Database;Trusted_Connection=yes;'
};

async function setupSimulaciones() {
    try {
        console.log('🔄 Conectando a la base de datos...\n');
        const pool = await sql.connect(config);
        
        // ========== ASIGNAR CONDUCTORES A CARROS ==========
        console.log('👤 Asignando conductores a carros...');
        
        const asignaciones = [
            // Ferrari
            { carro: 2, conductor: 12 },  // leclerc@f1.com -> Carro Ferrari
            // Red Bull
            { carro: 3, conductor: 4 },   // verstappen@f1.com
            { carro: 4, conductor: 5 },   // perez@f1.com
            // Mercedes
            { carro: 5, conductor: 7 },   // hamilton@f1.com
            { carro: 6, conductor: 8 },   // russell@f1.com
            // McLaren
            { carro: 7, conductor: 10 },  // norris@f1.com
            { carro: 8, conductor: 11 },  // piastri@f1.com
        ];
        
        for (const a of asignaciones) {
            await pool.request()
                .input('carro', sql.Int, a.carro)
                .input('conductor', sql.Int, a.conductor)
                .query('UPDATE CARRO SET Id_conductor = @conductor WHERE Id_carro = @carro');
        }
        console.log('   ✅ Conductores asignados');
        
        // ========== CREAR SIMULACIONES ==========
        console.log('🏁 Creando simulaciones...');
        
        // Obtener circuitos
        const circuitos = await pool.request().query('SELECT * FROM CIRCUITO');
        const circs = circuitos.recordset;
        
        // Obtener carros finalizados con sus conductores
        const carros = await pool.request().query(`
            SELECT c.Id_carro, c.P_total, c.A_total, c.M_total, c.Id_conductor, e.Nombre as Equipo
            FROM CARRO c 
            JOIN EQUIPO e ON c.Id_equipo = e.Id_equipo
            WHERE c.Finalizado = 1 AND c.Id_conductor IS NOT NULL
        `);
        
        const DC_CURVA = 0.5;
        
        // Crear 5 simulaciones con 3-4 carros cada una
        const simulacionesConfig = [
            { circuitoIdx: 0, carroIds: [3, 5, 7], fecha: '2026-01-10 14:30:00' },      // Monza
            { circuitoIdx: 1, carroIds: [3, 4, 5, 7], fecha: '2026-01-08 10:15:00' },   // Monaco  
            { circuitoIdx: 2, carroIds: [3, 5, 6, 7], fecha: '2026-01-05 16:45:00' },   // Spa
            { circuitoIdx: 3, carroIds: [4, 5, 7], fecha: '2026-01-03 09:00:00' },      // Silverstone
            { circuitoIdx: 4, carroIds: [3, 6, 7], fecha: '2025-12-28 11:30:00' },      // Suzuka
        ];
        
        // Habilidades de conductores (simuladas - en producción vendría de la BD)
        const habilidades = {
            4: 95,   // Verstappen
            5: 88,   // Perez
            7: 92,   // Hamilton
            8: 90,   // Russell
            10: 91,  // Norris
            11: 87,  // Piastri
            12: 93,  // Leclerc
        };
        
        for (const simConfig of simulacionesConfig) {
            const circ = circs[simConfig.circuitoIdx];
            
            // Insertar simulación
            const simResult = await pool.request()
                .input('fecha', sql.DateTime, simConfig.fecha)
                .input('circuito', sql.Int, circ.Id_circuito)
                .query('INSERT INTO SIMULACION (Fecha_hora, Id_circuito) OUTPUT INSERTED.Id_simulacion VALUES (@fecha, @circuito)');
            
            const simId = simResult.recordset[0].Id_simulacion;
            
            // Calcular resultados para cada carro
            const resultados = [];
            
            for (const carroId of simConfig.carroIds) {
                const carro = carros.recordset.find(c => c.Id_carro === carroId);
                if (!carro) continue;
                
                const P = carro.P_total;
                const A = carro.A_total;
                const M = carro.M_total;
                const H = habilidades[carro.Id_conductor] || 85;
                const D = parseFloat(circ.Distancia_total);
                const C = circ.Cantidad_curvas;
                
                // Calcular velocidades
                const Vrecta = 200 + 3 * P + 0.2 * H - A;
                const Vcurva = 90 + 2 * A + 2 * M + 0.2 * H;
                
                // Calcular distancias
                const Dcurvas = C * DC_CURVA;
                const Drectas = Math.max(0, D - Dcurvas);
                
                // Penalización
                const penalizacion = (C * 40) / (1 + H / 100);
                
                // Tiempo total en segundos
                const tiempoHoras = (Drectas / Vrecta) + (Dcurvas / Vcurva);
                const tiempoSegundos = (tiempoHoras * 3600) + penalizacion;
                
                resultados.push({
                    carroId,
                    Vrecta,
                    Vcurva,
                    penalizacion,
                    tiempoSegundos,
                    P, A, M, H
                });
            }
            
            // Ordenar por tiempo y asignar posiciones
            resultados.sort((a, b) => a.tiempoSegundos - b.tiempoSegundos);
            
            // Insertar resultados
            for (let i = 0; i < resultados.length; i++) {
                const r = resultados[i];
                await pool.request()
                    .input('simId', sql.Int, simId)
                    .input('carroId', sql.Int, r.carroId)
                    .input('vrecta', sql.Decimal(10, 2), r.Vrecta)
                    .input('vcurva', sql.Decimal(10, 2), r.Vcurva)
                    .input('pen', sql.Decimal(10, 2), r.penalizacion)
                    .input('tiempo', sql.Decimal(10, 3), r.tiempoSegundos)
                    .input('pos', sql.Int, i + 1)
                    .input('p', sql.TinyInt, r.P)
                    .input('a', sql.TinyInt, r.A)
                    .input('m', sql.TinyInt, r.M)
                    .input('h', sql.TinyInt, r.H)
                    .query(`
                        INSERT INTO RESULTADO 
                        (Id_simulacion, Id_carro, Vrecta, Vcurva, Penalizacion, Tiempo_segundos, Posicion, P_total, A_total, M_total, H_conductor)
                        VALUES (@simId, @carroId, @vrecta, @vcurva, @pen, @tiempo, @pos, @p, @a, @m, @h)
                    `);
            }
            
            console.log(`   ✅ Simulación ${simId} creada con ${resultados.length} resultados`);
        }
        
        // ========== RESUMEN ==========
        console.log('\n📊 RESUMEN:');
        const simCount = await pool.request().query('SELECT COUNT(*) as total FROM SIMULACION');
        const resCount = await pool.request().query('SELECT COUNT(*) as total FROM RESULTADO');
        console.log(`   Simulaciones: ${simCount.recordset[0].total}`);
        console.log(`   Resultados: ${resCount.recordset[0].total}`);
        
        console.log('\n✅ ¡Simulaciones creadas exitosamente!');
        await pool.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

setupSimulaciones();
