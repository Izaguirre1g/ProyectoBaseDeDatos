const argon2 = require('argon2');

/**
 * Hashea una contraseña utilizando Argon2id
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} - Hash de la contraseña
 */
async function hashPassword(password) {
    try {
        // Argon2id con parámetros de seguridad de industria
        const hash = await argon2.hash(password, {
            type: argon2.argon2id,  // Argon2id
            memoryCost: 2**16,      // 64MB de memoria
            timeCost: 3,            // 3 iteraciones 
            parallelism: 4,         // 4 threads
            raw: false              // Retorna el hash codificado (incluye salt y parámetros)
        });
        return hash;
    } catch (error) {
        throw new Error(`Error al hashear contraseña: ${error.message}`);
    }
}

/**
 * Verifica si una contraseña coincide con su hash
 * @param {string} password - Contraseña en texto plano
 * @param {string} hash - Hash almacenado
 * @returns {Promise<boolean>} - true si coincide, false si no
 */
async function verifyPassword(password, hash) {
    try {
        const matches = await argon2.verify(hash, password);
        return matches;
    } catch (error) {
        // En caso de error en verificación (hash corrupto, etc.)
        console.error('Error verificando contraseña:', error.message);
        return false;
    }
}

module.exports = {
    hashPassword,
    verifyPassword
};
