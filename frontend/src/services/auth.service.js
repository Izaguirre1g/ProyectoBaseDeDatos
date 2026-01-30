//este archivo se encarga de hacer las llamadas a auth.routes.js para manejar la autenticación de usuarios
import api from './api';
import { hashPassword } from '../utils/password';

/**
 * Servicios de autenticación
 * Las contraseñas SIEMPRE se hashean con Argon2id antes de enviarse al servidor
 * Se usa un salt determinístico basado en el email para consistencia
 */
export const authService = {
    /**
     * Iniciar sesión
     * La contraseña se hashea con Argon2id antes de enviarla
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise} Usuario autenticado
     */
    async login(email, password) {
        // Hashear contraseña con Argon2id antes de enviar
        const hashedPassword = await hashPassword(password, email);
        console.log('Login - Hash generado:', hashedPassword);
        
        const response = await api.post('/auth/login', { 
            email, 
            password: hashedPassword 
        });
        return response.data;
    },

    /**
     * Cerrar sesión
     * @returns {Promise}
     */
    async logout() {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    /**
     * Verificar sesión activa
     * @returns {Promise} Estado de la sesión
     */
    async checkSession() {
        const response = await api.get('/auth/me');
        return response.data;
    },

    /**
     * Registrar nuevo usuario
     * La contraseña se hashea con Argon2id antes de enviarla
     * @param {object} userData - { nombre, email, password, rol }
     * @returns {Promise}
     */
    async register(userData) {
        // Hashear contraseña con Argon2id antes de enviar
        const hashedPassword = await hashPassword(userData.password, userData.email);
        console.log('Contrasena hasheada con Argon2id para registro');
        
        const response = await api.post('/auth/register', {
            ...userData,
            password: hashedPassword
        });
        return response.data;
    }
};

export default authService;
