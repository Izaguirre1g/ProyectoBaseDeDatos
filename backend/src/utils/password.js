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
 * Ahora el frontend envía el hash Argon2id directamente, así que comparamos hashes
 * @param {string} passwordHash - Hash Argon2id recibido del frontend
 * @param {string} storedHash - Hash almacenado en la BD
 * @returns {Promise<boolean>} - true si coincide, false si no
 */
async function verifyPassword(passwordHash, storedHash) {
    try {
        // Comparación directa de hashes (el frontend ya envía el hash)
        console.log('🔐 Comparando hashes:');
        console.log('   Recibido:', passwordHash.substring(0, 60) + '...');
        console.log('   En BD:   ', storedHash.substring(0, 60) + '...');
        
        const matches = (passwordHash === storedHash);
        console.log('   ¿Coinciden?:', matches);
        
        return matches;
    } catch (error) {
        console.error('Error verificando contraseña:', error.message);
        return false;
    }
}

module.exports = {
    hashPassword,
    verifyPassword
};
