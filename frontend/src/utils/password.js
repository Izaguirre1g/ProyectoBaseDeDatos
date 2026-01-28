import { argon2id, sha256 } from 'hash-wasm';

/**
 * Configuración de Argon2id según OWASP
 */
const ARGON2_CONFIG = {
    parallelism: 1,
    iterations: 2,      // timeCost
    memorySize: 19456,  // memoryCost en KB (19MB)
    hashLength: 32,
    outputType: 'encoded'  // Formato: $argon2id$v=19$m=19456,t=2,p=1$salt$hash
};

/**
 * Genera un salt determinístico basado en el email
 * Esto permite que el mismo usuario genere siempre el mismo hash
 * @param {string} email - Email del usuario
 * @returns {Uint8Array} Salt de 16 bytes
 */
async function generateDeterministicSalt(email) {
    const encoder = new TextEncoder();
    const data = encoder.encode(email.toLowerCase().trim() + '_F1_DATABASE_SALT');
    
    // Usar sha256 de hash-wasm
    const hashHex = await sha256(data);
    
    // Convertir el string hexadecimal a Uint8Array y tomar primeros 16 bytes
    const hashBuffer = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
        hashBuffer[i] = parseInt(hashHex.substr(i * 2, 2), 16);
    }
    
    return hashBuffer;
}

/**
 * Hashea una contraseña utilizando Argon2id
 * Usa un salt determinístico basado en el email para que siempre genere el mismo hash
 * @param {string} password - Contraseña en texto plano
 * @param {string} email - Email del usuario (para generar salt determinístico)
 * @returns {Promise<string>} - Hash Argon2id
 */
export async function hashPassword(password, email) {
    try {
        const salt = await generateDeterministicSalt(email);
        
        const hash = await argon2id({
            password: password,
            salt: salt,
            parallelism: ARGON2_CONFIG.parallelism,
            iterations: ARGON2_CONFIG.iterations,
            memorySize: ARGON2_CONFIG.memorySize,
            hashLength: ARGON2_CONFIG.hashLength,
            outputType: ARGON2_CONFIG.outputType
        });
        
        return hash;
    } catch (error) {
        console.error('Error al hashear contraseña con Argon2id:', error);
        throw new Error('Error al procesar la contraseña');
    }
}

export default { hashPassword };