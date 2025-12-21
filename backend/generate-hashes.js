/**
 * Script para generar hashes de Argon2id para usuarios de prueba
 * Ejecuta una sola vez: node generate-hashes.js
 */

const { hashPassword } = require('./src/utils/password');

async function generateHashes() {
    const testUsers = [
        { email: 'admin@f1.com', password: '123456', rol: 'Admin', nombre: 'Administrador' },
        { email: 'engineer@f1.com', password: '123456', rol: 'Engineer', nombre: 'Carlos Sainz Engineer' },
        { email: 'driver@f1.com', password: '123456', rol: 'Driver', nombre: 'Carlos Sainz' }
    ];

    console.log('Generando hashes de Argon2id para usuarios de prueba...\n');

    for (const user of testUsers) {
        const hash = await hashPassword(user.password);
        console.log(`Email: ${user.email}`);
        console.log(`Hash: ${hash}\n`);
    }

    console.log('Hashes generados.');
}

generateHashes().catch(err => console.error('Error:', err));
