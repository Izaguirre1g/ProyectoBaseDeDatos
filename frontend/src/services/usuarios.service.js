import api from './api';

/**
 * Servicios para usuarios
 * Preparado para integrar con base de datos
 */

export const usuariosService = {
    /**
     * Obtener todos los usuarios
     * @returns {Promise} Lista de usuarios
     */
    async getAll() {
        const response = await api.get('/usuarios');
        return response.data;
    },

    /**
     * Obtener usuario por ID
     * @param {number} id 
     * @returns {Promise} Usuario encontrado
     */
    async getById(id) {
        const response = await api.get(`/usuarios/${id}`);
        return response.data;
    },

    /**
     * Crear nuevo usuario
     * @param {object} usuario - { nombre, email, password, rol, equipoId }
     * @returns {Promise}
     */
    async create(usuario) {
        const response = await api.post('/usuarios', usuario);
        return response.data;
    },

    /**
     * Actualizar usuario
     * @param {number} id 
     * @param {object} datos 
     * @returns {Promise}
     */
    async update(id, datos) {
        const response = await api.put(`/usuarios/${id}`, datos);
        return response.data;
    },

    /**
     * Eliminar usuario
     * @param {number} id 
     * @returns {Promise}
     */
    async delete(id) {
        const response = await api.delete(`/usuarios/${id}`);
        return response.data;
    }
};

export default usuariosService;
