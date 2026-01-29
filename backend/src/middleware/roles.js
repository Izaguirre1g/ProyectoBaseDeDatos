/**
 * Middleware para validar roles de usuario
 */

const { getConnection, sql } = require('../config/database');

/**
 * Validar que el usuario tenga uno de los roles especificados
 * @param {string|string[]} rolesPermitidos - Rol o array de roles permitidos ('Administrador', 'Ingeniero', 'Conductor')
 * @returns {Function} Middleware Express
 */
function verificarRol(rolesPermitidos) {
    // Convertir a array si es un string
    const roles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];
    
    return async (req, res, next) => {
        try {
            // Verificar que haya sesión - buscar userId en diferentes lugares
            let userId = null;
            
            if (req.session && req.session.userId) {
                userId = req.session.userId;
            } else if (req.user && req.user.Id_usuario) {
                userId = req.user.Id_usuario;
            }
            
            if (!userId) {
                console.log('[ROLES] No se encontró userId en sesión');
                return res.status(401).json({ error: 'No autenticado. Inicia sesión para continuar.' });
            }
            
            console.log(`[ROLES] Validando rol para usuario ${userId}`);
            
            // Obtener el rol del usuario de la BD
            const pool = await getConnection();
            const result = await pool.request()
                .input('idUsuario', sql.Int, userId)
                .query(`
                    SELECT r.Nombre as Rol
                    FROM USUARIO u
                    JOIN ROL r ON u.Id_rol = r.Id_rol
                    WHERE u.Id_usuario = @idUsuario
                `);
            
            if (result.recordset.length === 0) {
                console.log(`[ROLES] Usuario ${userId} no encontrado`);
                return res.status(401).json({ error: 'Usuario no encontrado' });
            }
            
            const rolUsuario = result.recordset[0].Rol;
            console.log(`[ROLES] Usuario ${userId} tiene rol: ${rolUsuario}`);
            
            // Verificar si el rol está permitido
            if (!roles.includes(rolUsuario)) {
                console.log(`[ROLES] Rol ${rolUsuario} no está en lista permitida: ${roles.join(', ')}`);
                return res.status(403).json({ 
                    error: 'No tienes permisos para realizar esta acción',
                    roleRequerido: roles.join(' o '),
                    rolActual: rolUsuario
                });
            }
            
            console.log(`[ROLES] ✓ Usuario ${userId} autorizado`);
            // Agregar rol al request para usarlo después si es necesario
            req.userRole = rolUsuario;
            req.userId = userId;
            next();
        } catch (error) {
            console.error('Error validando rol:', error);
            res.status(500).json({ error: 'Error al validar permisos' });
        }
    };
}

module.exports = {
    verificarRol
};
