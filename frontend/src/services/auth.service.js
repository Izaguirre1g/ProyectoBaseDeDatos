import api from './api';

/**
 * Servicios de autenticación
 * Preparado para integrar con base de datos (solo cambiar el backend)
 */

export const authService = {
    /**
     * Iniciar sesión
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise} Usuario autenticado
     */
    async login(email, password) {
        const response = await api.post('/auth/login', { email, password });
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
     * Registrar nuevo usuario (para cuando tengas BD)
     * @param {object} userData - { nombre, email, password, rol }
     * @returns {Promise}
     */
    async register(userData) {
        const response = await api.post('/auth/register', userData);
        return response.data;
    }
};

export default authService;
