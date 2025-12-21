/**
 * GUÍA: Cómo usar Argon2id en tu proyecto
 * 
 * Este archivo explica la implementación de seguridad de contraseñas
 */

const { hashPassword, verifyPassword } = require('./src/utils/password');

/**
 * PARA DESARROLLO (Usuarios de prueba)
 * Las contraseñas ya están hasheadas con Argon2id
 * Email: admin@f1.com / 123456
 * Email: engineer@f1.com / 123456
 * Email: driver@f1.com / 123456
 */

/**
 * PARA PRODUCCIÓN - Ejemplo de cómo guardar usuarios con contraseña hasheada
 */

// ✅ CORRECTO - Cuando un usuario se registra o cambia contraseña:
// const newUser = {
//     email: 'newuser@f1.com',
//     nombre: 'Nuevo Usuario',
//     rol: 'Engineer'
// };
//
// const plainPassword = 'password123'; // Contraseña en texto plano del usuario
// const passwordHash = await hashPassword(plainPassword);
// 
// // Guardar en BD:
// // INSERT INTO usuarios (email, nombre, rol, password_hash) 
// // VALUES (?, ?, ?, ?)
// // [newUser.email, newUser.nombre, newUser.rol, passwordHash]

// ❌ NUNCA hagas esto - Guardar contraseña en texto plano:
// INSERT INTO usuarios (email, password) VALUES (?, ?)
// [email, plainPassword]  // ¡¡¡ INSEGURO !!!

/**
 * VERIFICACIÓN DE CONTRASEÑA EN LOGIN
 * Ejemplo en tu ruta de login:
 */

// async function loginExample() {
//     const { email, password } = req.body;
//     
//     // Obtener usuario de la BD
//     const usuario = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
//     
//     if (!usuario) {
//         return res.status(401).json({ error: 'Credenciales inválidas' });
//     }
//     
//     // Verificar contraseña
//     const isValid = await verifyPassword(password, usuario.password_hash);
//     
//     if (!isValid) {
//         return res.status(401).json({ error: 'Credenciales inválidas' });
//     }
//     
//     // Contraseña correcta, crear sesión
//     req.session.userId = usuario.id;
// }

/**
 * PARÁMETROS DE ARGON2ID
 * 
 * Los parámetros actuales son los recomendados por OWASP:
 * - Algoritmo: Argon2id (más resistente a ataques)
 * - Memory: 19456 KB (~19 MB)
 * - Time Cost: 2 iteraciones
 * - Parallelism: 1 thread
 * 
 * Si necesitas cambiarlos para mayor/menor seguridad:
 * 
 * MÁS SEGURO (más lento, ~300ms por hash):
 * {
 *     type: argon2.argon2id,
 *     memoryCost: 65540,  // 64 MB
 *     timeCost: 3,
 *     parallelism: 4
 * }
 * 
 * MÁS RÁPIDO pero menos seguro (menos lento, ~50ms):
 * {
 *     type: argon2.argon2id,
 *     memoryCost: 9728,   // ~10 MB
 *     timeCost: 1,
 *     parallelism: 1
 * }
 */

/**
 * SEGURIDAD
 * 
 * ✅ Lo que estamos haciendo bien:
 * - Hashing con Argon2id (resistente a GPU/ASIC attacks)
 * - Salt automático (incluido en el hash)
 * - Parámetros de costo apropiados
 * - Nunca almacenar contraseña en texto plano
 * - Contraseña solo en comparación, nunca en logs
 * 
 * ✅ Otras mejoras de seguridad en tu app:
 * - Sesiones con httpOnly cookies
 * - HTTPS en producción (secure: true)
 * - CSRF protection (sameSite: 'lax')
 * - Rate limiting (implementar después)
 * - Validación de entrada (implementar después)
 */

module.exports = {
    hashPassword,
    verifyPassword
};
