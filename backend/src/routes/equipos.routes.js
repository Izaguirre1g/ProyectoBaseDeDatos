const express = require('express');
const router = express.Router();
const equiposService = require('../services/equipos.service');
const carrosService = require('../services/carros.service');
const { getConnection, sql } = require('../config/database');

/**
 * GET /api/equipos
 * Obtener todos los equipos
 */
router.get('/', async (req, res) => {
    try {
        const equipos = await equiposService.getAll();
        res.json(equipos);
    } catch (error) {
        console.error('Error al obtener equipos:', error);
        res.status(500).json({ error: 'Error al obtener equipos' });
    }
});

/**
 * GET /api/equipos/:id
 * Obtener equipo por ID con información extendida
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const equipo = await equiposService.getById(id);
        
        if (!equipo) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }
        
        // Calcular presupuesto disponible usando la función de la BD
        const pool = await getConnection();
        const presupuestoResult = await pool.request()
            .input('idEquipo', sql.Int, id)
            .query('SELECT dbo.fn_CalcularPresupuestoEquipo(@idEquipo) as Disponible');
        
        res.json({
            ...equipo,
            presupuestoDisponible: presupuestoResult.recordset[0]?.Disponible || equipo.Presupuesto
        });
    } catch (error) {
        console.error('Error al obtener equipo:', error);
        res.status(500).json({ error: 'Error al obtener equipo' });
    }
});

/**
 * GET /api/equipos/:id/pilotos
 * Obtener pilotos (usuarios con rol Driver) de un equipo
 */
router.get('/:id/pilotos', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        
        const result = await pool.request()
            .input('idEquipo', sql.Int, id)
            .query(`
                SELECT u.Id_usuario, u.Correo_usuario, r.Nombre as Rol
                FROM USUARIO u
                JOIN ROL r ON u.Id_rol = r.Id_rol
                WHERE u.Id_equipo = @idEquipo AND r.Nombre = 'Driver'
            `);
        
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener pilotos:', error);
        res.status(500).json({ error: 'Error al obtener pilotos' });
    }
});

/**
 * GET /api/equipos/:id/carros
 * Obtener carros de un equipo
 */
router.get('/:id/carros', async (req, res) => {
    try {
        const { id } = req.params;
        const carros = await carrosService.getByEquipo(id);
        res.json(carros);
    } catch (error) {
        console.error('Error al obtener carros:', error);
        res.status(500).json({ error: 'Error al obtener carros' });
    }
});

/**
 * GET /api/equipos/:id/carros/:carroId
 * Obtener carro específico con partes instaladas
 */
router.get('/:id/carros/:carroId', async (req, res) => {
    try {
        const { id, carroId } = req.params;
        
        const carro = await carrosService.getById(carroId);
        
        if (!carro || carro.Id_equipo !== parseInt(id)) {
            return res.status(404).json({ error: 'Carro no encontrado' });
        }
        
        const partes = await carrosService.getPartes(carroId);
        
        res.json({
            ...carro,
            partes
        });
    } catch (error) {
        console.error('Error al obtener carro:', error);
        res.status(500).json({ error: 'Error al obtener carro' });
    }
});

/**
 * GET /api/equipos/:id/inventario
 * Obtener inventario de partes de un equipo
 */
router.get('/:id/inventario', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        
        const result = await pool.request()
            .input('idEquipo', sql.Int, id)
            .query(`
                SELECT ie.Id_parte, ie.Cantidad,
                       p.Nombre, p.Potencia as P, p.Aerodinamica as A, p.Manejo as M, p.Precio,
                       c.Id_categoria, c.Nombre as Categoria
                FROM INVENTARIO_EQUIPO ie
                JOIN PARTE p ON ie.Id_parte = p.Id_parte
                JOIN CATEGORIA c ON p.Id_categoria = c.Id_categoria
                WHERE ie.Id_equipo = @idEquipo AND ie.Cantidad > 0
                ORDER BY c.Nombre, p.Nombre
            `);
        
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener inventario:', error);
        res.status(500).json({ error: 'Error al obtener inventario' });
    }
});

/**
 * GET /api/equipos/:id/patrocinadores
 * Obtener patrocinadores de un equipo
 */
router.get('/:id/patrocinadores', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        
        const result = await pool.request()
            .input('idEquipo', sql.Int, id)
            .query(`
                SELECT p.Id_patrocinador, p.Nombre, a.Monto, a.Fecha
                FROM APORTE a
                JOIN PATROCINADOR p ON a.Id_patrocinador = p.Id_patrocinador
                WHERE a.Id_equipo = @idEquipo
                ORDER BY a.Monto DESC
            `);
        
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener patrocinadores:', error);
        res.status(500).json({ error: 'Error al obtener patrocinadores' });
    }
});

/**
 * GET /api/equipos/:id/presupuesto
 * Obtener presupuesto detallado de un equipo
 */
router.get('/:id/presupuesto', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        
        // Obtener equipo
        const equipo = await equiposService.getById(id);
        if (!equipo) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }
        
        // Calcular presupuesto usando la función de la BD
        const disponibleResult = await pool.request()
            .input('idEquipo', sql.Int, id)
            .query('SELECT dbo.fn_CalcularPresupuestoEquipo(@idEquipo) as Disponible');
        
        // Obtener total de aportes
        const aportesResult = await pool.request()
            .input('idEquipo', sql.Int, id)
            .query('SELECT ISNULL(SUM(Monto), 0) as TotalAportes FROM APORTE WHERE Id_equipo = @idEquipo');
        
        // Obtener gastos (pedidos)
        const gastosResult = await pool.request()
            .input('idEquipo', sql.Int, id)
            .query('SELECT ISNULL(SUM(Total), 0) as TotalGastos FROM PEDIDO WHERE Id_equipo = @idEquipo');
        
        res.json({
            presupuestoBase: parseFloat(equipo.Presupuesto),
            totalAportes: parseFloat(aportesResult.recordset[0].TotalAportes),
            totalGastos: parseFloat(gastosResult.recordset[0].TotalGastos),
            disponible: parseFloat(disponibleResult.recordset[0].Disponible || 0)
        });
    } catch (error) {
        console.error('Error al obtener presupuesto:', error);
        res.status(500).json({ error: 'Error al obtener presupuesto' });
    }
});

module.exports = router;
