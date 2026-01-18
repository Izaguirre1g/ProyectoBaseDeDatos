import api from './api';

/**
 * Servicios para partes del catálogo
 * Preparado para integrar con base de datos
 */

export const partesService = {
    /**
     * Obtener todas las partes o filtrar por categoría
     * @param {number} idCategoria - ID de la categoría para filtrar (opcional)
     * @returns {Promise} Lista de partes
     */
    async getAll(idCategoria = null) {
        const params = idCategoria ? { idCategoria } : {};
        const response = await api.get('/partes', { params });
        return response.data;
    },

    /**
     * Obtener categorías disponibles
     * @returns {Promise} Lista de categorías
     */
    async getCategorias() {
        const response = await api.get('/partes/categorias/todas'); 
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
     * Obtener catálogo con inventario total
     * @returns {Promise} Lista de partes con stock disponible
     */
    async getCatalogo() {
        const response = await api.get('/partes/inventario/total');
        return response.data;
    },

    /**
     * Obtener inventario de un equipo específico
     * @param {number} idEquipo - ID del equipo
     * @returns {Promise} Lista de partes disponibles en el inventario del equipo
     */
    async getInventarioEquipo(idEquipo) {
        const response = await api.get(`/partes/inventario/${idEquipo}`);
        return response.data;
    },

    /**
     * Comprar una parte usando SP_RealizarCompra
     * @param {number} idEquipo - ID del equipo que compra
     * @param {number} idParte - ID de la parte a comprar
     * @param {number} cantidad - Cantidad a comprar
     * @returns {Promise<Object>} - Resultado con mensaje e ID pedido
     */
    async comprar(idEquipo, idParte, cantidad = 1) {
        const response = await api.post('/partes/comprar', { 
            idEquipo, 
            idParte, 
            cantidad 
        });
        return response.data;
    },

    /**
     * Verificar disponibilidad antes de comprar
     * @param {number} idEquipo - ID del equipo
     * @param {number} idParte - ID de la parte
     * @param {number} cantidad - Cantidad a verificar
     * @returns {Promise<Object>} - Info de disponibilidad
     */
    async verificarDisponibilidad(idEquipo, idParte, cantidad) {
        const response = await api.post('/partes/verificar-disponibilidad', {
            idEquipo,
            idParte,
            cantidad
        });
        return response.data;
    }
};

export default partesService;
