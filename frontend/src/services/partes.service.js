import api from './api';

/**
 * Servicios para partes del catálogo
 * Preparado para integrar con base de datos
 */

export const partesService = {
    /**
     * Obtener todas las partes o filtrar por categoría
     * @param {string} categoria - Categoría para filtrar (opcional)
     * @returns {Promise} Lista de partes
     */
    async getAll(categoria = null) {
        const params = categoria ? { categoria } : {};
        const response = await api.get('/partes', { params });
        return response.data;
    },

    /**
     * Obtener categorías disponibles
     * @returns {Promise} Lista de categorías
     */
    async getCategorias() {
        const response = await api.get('/partes/categorias');
        return response.data;
    },

    /**
     * Obtener una parte por ID
     * @param {number} id 
     * @returns {Promise} Parte encontrada
     */
    async getById(id) {
        const response = await api.get(`/partes/${id}`);
        return response.data;
    },

    /**
     * Comprar una parte (para cuando tengas BD)
     * @param {number} parteId 
     * @param {number} cantidad 
     * @returns {Promise}
     */
    async comprar(parteId, cantidad = 1) {
        const response = await api.post('/partes/comprar', { parteId, cantidad });
        return response.data;
    }
};

export default partesService;
