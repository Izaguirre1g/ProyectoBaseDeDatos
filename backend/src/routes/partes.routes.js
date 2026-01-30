// RUTAS DE PARTES
const express = require('express');
const router = express.Router();
const partesService = require('../services/partes.service');

/**
 * GET /api/partes
 * Obtener todas las partes (con filtros opcionales)
 */
router.get('/', async (req, res) => {
    try {
        const { categoria, idCategoria } = req.query;
        
        if (idCategoria) {
            const partes = await partesService.getByCategoria(parseInt(idCategoria));
            return res.json(partes);
        }
        
        const partes = await partesService.getAll();
        
        if (categoria) {
            const filtradas = partes.filter(p => 
                p.Categoria?.toLowerCase() === categoria.toLowerCase()
            );
            return res.json(filtradas);
        }
        
        res.json(partes);
    } catch (error) {
        console.error('Error al obtener partes:', error);
        res.status(500).json({ error: 'Error al obtener partes' });
    }
});

/**
 * GET /api/partes/categorias/todas
 * Obtener todas las categorías (ANTES de /:id)
 */
router.get('/categorias/todas', async (req, res) => {
    try {
        const categorias = await partesService.getCategorias();
        res.json(categorias);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
});

/**
 * GET /api/partes/inventario/total
 * Catálogo con stock disponible
 * Query params: idCategoria (opcional)
 */
router.get('/inventario/total', async (req, res) => {
    try {
        const { idCategoria } = req.query;
        const inventario = await partesService.getInventarioTotal(idCategoria ? parseInt(idCategoria) : null);
        res.json(inventario);
    } catch (error) {
        console.error('Error al obtener inventario total:', error);
        res.status(500).json({ error: 'Error al obtener inventario total' });
    }
});

/**
 * GET /api/partes/inventario/:idEquipo
 * Inventario de un equipo específico
 */
router.get('/inventario/:idEquipo', async (req, res) => {
    try {
        const { idEquipo } = req.params;
        const inventario = await partesService.getInventario(parseInt(idEquipo));
        res.json(inventario);
    } catch (error) {
        console.error('Error al obtener inventario del equipo:', error);
        res.status(500).json({ error: 'Error al obtener inventario del equipo' });
    }
});

/**
 * POST /api/partes/comprar
 * COMPRAR PARTE - ENDPOINT CLAVE
 */
router.post('/comprar', async (req, res) => {
    try {
        console.log('COMPRAR PARTE INICIO');
        console.log('Body recibido:', req.body);
        
        const { idEquipo, idParte, cantidad } = req.body;
        
        console.log('Parámetros extraídos:');
        console.log('  idEquipo:', idEquipo, '(tipo:', typeof idEquipo, ')');
        console.log('  idParte:', idParte, '(tipo:', typeof idParte, ')');
        console.log('  cantidad:', cantidad, '(tipo:', typeof cantidad, ')');
        
        if (!idEquipo || !idParte || !cantidad) {
            console.log('ERROR: Faltan parámetros');
            return res.status(400).json({ 
                error: 'Faltan parámetros: idEquipo, idParte, cantidad' 
            });
        }
        
        if (cantidad <= 0) {
            console.log('ERROR: Cantidad inválida');
            return res.status(400).json({ 
                error: 'La cantidad debe ser mayor a 0' 
            });
        }
        
        console.log('Parámetros válidos, llamando al servicio de compra...');
        
        const resultado = await partesService.comprar(
            parseInt(idEquipo),
            parseInt(idParte),
            parseInt(cantidad)
        );
        
        console.log('Resultado del servicio:', resultado);
        console.log('COMPRAR PARTE FIN');
        
        if (resultado.success) {
            res.json(resultado);
        } else {
            res.status(400).json(resultado);
        }
        
    } catch (error) {
        console.error('ERROR COMPLETO en comprar:', error);
        console.error('Mensaje:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ 
            error: 'Error al procesar la compra',
            detalle: error.message 
        });
    }
});

/**
 * POST /api/partes/verificar-disponibilidad
 * Verificar si se puede comprar
 */
router.post('/verificar-disponibilidad', async (req, res) => {
    try {
        console.log('VERIFICAR DISPONIBILIDAD INICIO');
        console.log('Body recibido:', req.body);
        
        const { idEquipo, idParte, cantidad } = req.body;
        
        console.log('Parámetros extraídos:');
        console.log('  idEquipo:', idEquipo, '(tipo:', typeof idEquipo, ')');
        console.log('  idParte:', idParte, '(tipo:', typeof idParte, ')');
        console.log('  cantidad:', cantidad, '(tipo:', typeof cantidad, ')');
        
        if (!idEquipo || !idParte || !cantidad) {
            console.log('ERROR: Faltan parámetros');
            console.log('  idEquipo válido?', !!idEquipo);
            console.log('  idParte válido?', !!idParte);
            console.log('  cantidad válido?', !!cantidad);
            
            return res.status(400).json({ 
                error: 'Faltan parámetros',
                detalle: {
                    idEquipo: idEquipo || 'FALTA',
                    idParte: idParte || 'FALTA',
                    cantidad: cantidad || 'FALTA'
                }
            });
        }
        
        console.log('Parámetros válidos, llamando al servicio...');
        
        const disponibilidad = await partesService.verificarDisponibilidad(
            parseInt(idEquipo),
            parseInt(idParte),
            parseInt(cantidad)
        );
        
        console.log('Respuesta del servicio:', disponibilidad);
        console.log('VERIFICAR DISPONIBILIDAD FIN ');
        
        res.json(disponibilidad);
        
    } catch (error) {
        console.error('ERROR COMPLETO en verificar disponibilidad:', error);
        console.error('Mensaje:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ error: 'Error al verificar disponibilidad' });
    }
});

/**
 * GET /api/partes/:id
 * Obtener una parte específica
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const parte = await partesService.getById(parseInt(id));
        
        if (!parte) {
            return res.status(404).json({ error: 'Parte no encontrada' });
        }
        
        res.json(parte);
    } catch (error) {
        console.error('Error al obtener parte:', error);
        res.status(500).json({ error: 'Error al obtener parte' });
    }
});

// CRUD - Admin
router.post('/', async (req, res) => {
    try {
        console.log('CREAR PARTE INICIO');
        console.log('Usuario rol:', req.session?.rol);
        console.log('Body recibido:', req.body);
        
        // Verificar que el usuario es Admin
        if (req.session?.rol !== 'Admin') {
            console.log('Acceso denegado: usuario no es Admin');
            return res.status(403).json({ 
                error: 'Solo los administradores pueden crear nuevas partes' 
            });
        }
        
        const { nombre, marca, manejo, aerodinamica, potencia, precio, idCategoria } = req.body;
        
        if (!nombre || !idCategoria) {
            return res.status(400).json({ error: 'Nombre y categoría requeridos' });
        }
        
        const parte = await partesService.create({
            nombre, marca,
            manejo: parseInt(manejo) || 0,
            aerodinamica: parseInt(aerodinamica) || 0,
            potencia: parseInt(potencia) || 0,
            precio: parseFloat(precio) || 0,
            idCategoria: parseInt(idCategoria)
        });
        
        console.log('Parte creada:', parte);
        console.log('CREAR PARTE FIN');
        
        res.status(201).json(parte);
    } catch (error) {
        console.error('Error al crear parte:', error);
        res.status(500).json({ error: 'Error al crear parte', detalle: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, marca, manejo, aerodinamica, potencia, precio, idCategoria } = req.body;
        
        const parte = await partesService.update(parseInt(id), {
            nombre, marca,
            manejo: parseInt(manejo),
            aerodinamica: parseInt(aerodinamica),
            potencia: parseInt(potencia),
            precio: parseFloat(precio),
            idCategoria: parseInt(idCategoria)
        });
        
        if (!parte) {
            return res.status(404).json({ error: 'Parte no encontrada' });
        }
        
        res.json(parte);
    } catch (error) {
        console.error('Error al actualizar parte:', error);
        res.status(500).json({ error: 'Error al actualizar parte' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await partesService.delete(parseInt(id));
        res.json({ message: 'Parte eliminada' });
    } catch (error) {
        console.error('Error al eliminar parte:', error);
        res.status(500).json({ error: 'Error al eliminar parte' });
    }
});

/**
 * POST /api/partes/stock/agregar
 * Agregar stock al inventario general (solo Admin)
 */
router.post('/stock/agregar', async (req, res) => {
    try {
        console.log('AGREGAR STOCK INICIO ');
        console.log('Usuario rol:', req.session.rol);
        console.log('Body recibido:', req.body);
        
        // Verificar que el usuario es Admin
        if (req.session.rol !== 'Admin') {
            console.log('Acceso denegado: usuario no es Admin');
            return res.status(403).json({ 
                error: 'Solo los administradores pueden modificar el stock de la tienda' 
            });
        }
        
        const { idParte, cantidad, motivo } = req.body;
        
        console.log('Parametros extraídos:');
        console.log('  idParte:', idParte);
        console.log('  cantidad:', cantidad);
        console.log('  motivo:', motivo);
        
        if (!idParte || !cantidad) {
            console.log('Faltan parámetros');
            return res.status(400).json({ 
                error: 'ID de parte y cantidad son requeridos' 
            });
        }
        
        if (cantidad <= 0) {
            console.log('Cantidad inválida');
            return res.status(400).json({ 
                error: 'La cantidad debe ser mayor a 0' 
            });
        }
        
        console.log('Parámetros válidos, llamando al servicio...');
        
        const resultado = await partesService.agregarStock(
            parseInt(idParte),
            parseInt(cantidad),
            motivo || 'Reposición de inventario'
        );
        
        console.log('Resultado:', resultado);
        console.log('AGREGAR STOCK FIN ');
        
        if (resultado.success) {
            res.json(resultado);
        } else {
            res.status(400).json(resultado);
        }
        
    } catch (error) {
        console.error('ERROR en agregar stock:', error);
        res.status(500).json({ 
            error: 'Error al agregar stock',
            detalle: error.message 
        });
    }
});

/**
 * POST /api/partes/stock/quitar
 * Quitar stock del inventario general (solo Admin)
 */
router.post('/stock/quitar', async (req, res) => {
    try {
        console.log('QUITAR STOCK INICIO ');
        console.log('Usuario rol:', req.session.rol);
        console.log('Body recibido:', req.body);
        
        // Verificar que el usuario es Admin
        if (req.session.rol !== 'Admin') {
            console.log('Acceso denegado: usuario no es Admin');
            return res.status(403).json({ 
                error: 'Solo los administradores pueden modificar el stock de la tienda' 
            });
        }
        
        const { idParte, cantidad, motivo } = req.body;
        
        console.log('Parámetros extraídos:');
        console.log('  idParte:', idParte);
        console.log('  cantidad:', cantidad);
        console.log('  motivo:', motivo);
        
        if (!idParte || !cantidad) {
            console.log('Faltan parámetros');
            return res.status(400).json({ 
                error: 'ID de parte y cantidad son requeridos' 
            });
        }
        
        if (cantidad <= 0) {
            console.log('Cantidad inválida');
            return res.status(400).json({ 
                error: 'La cantidad debe ser mayor a 0' 
            });
        }
        
        console.log('Parámetros válidos, llamando al servicio...');
        
        const resultado = await partesService.quitarStock(
            parseInt(idParte),
            parseInt(cantidad),
            motivo || 'Ajuste de inventario'
        );
        
        console.log('Resultado:', resultado);
        console.log('QUITAR STOCK FIN ');
        
        if (resultado.success) {
            res.json(resultado);
        } else {
            res.status(400).json(resultado);
        }
        
    } catch (error) {
        console.error('ERROR en quitar stock:', error);
        res.status(500).json({ 
            error: 'Error al quitar stock',
            detalle: error.message 
        });
    }
});

module.exports = router;

