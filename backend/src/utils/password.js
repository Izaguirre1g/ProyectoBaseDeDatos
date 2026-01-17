const argon2 = require('argon2');

// Configuración de Argon2id según OWASP (debe coincidir con usuariosService.js)
const ARGON2_CONFIG = {
    type: argon2.argon2id,
    memoryCost: 19456,  // 19MB
    timeCost: 2,
    parallelism: 1
};

/**
 * Hashea una contraseña utilizando Argon2id
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} - Hash de la contraseña
 */
async function hashPassword(password) {
    try {
        // Argon2id con parámetros de seguridad de industria (OWASP)
        const hash = await argon2.hash(password, ARGON2_CONFIG);
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
