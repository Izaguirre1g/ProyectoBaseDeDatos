import api from './api';

/**
 * Servicios para carros y configuración
 * Usa Stored Procedures con transacciones para operaciones críticas
 */

export const carrosService = {
    /**
     * Obtener todos los carros
     */
    async getAll() {
        const response = await api.get('/carros');
        return response.data;
    },

    /**
     * Obtener un carro por ID con sus partes instaladas
     */
    async getById(id) {
        const response = await api.get(`/carros/${id}`);
        return response.data;
    },

    /**
     * Obtener carro del conductor actual
     */
    async getMiCarro() {
        const response = await api.get('/carros/mi-carro');
        return response.data;
    },

    /**
     * Obtener partes instaladas en un carro
     */
    async getPartes(carroId) {
        const response = await api.get(`/carros/${carroId}/partes`);
        return response.data;
    },

    /**
     * Obtener inventario de partes disponibles del equipo
     */
    async getInventario(carroId) {
        const response = await api.get(`/carros/${carroId}/inventario`);
        return response.data;
    },

    /**
     * Instalar parte en carro usando SP_InstalarParteEnCarro (transaccional)
     * @param {number} carroId - ID del carro
     * @param {number} parteId - ID de la parte a instalar
     * @returns {Promise<Object>} - Resultado con mensaje y nuevos totales
     */
    async instalarParte(carroId, parteId) {
        const response = await api.post(`/carros/${carroId}/instalar-parte`, {
            idParte: parteId
        });
        return response.data;
    },

    /**
     * Desinstalar parte de un carro (devuelve al inventario)
     * @param {number} carroId - ID del carro
     * @param {number} parteId - ID de la parte a desinstalar
     */
    async desinstalarParte(carroId, parteId) {
        const response = await api.delete(`/carros/${carroId}/partes/${parteId}`);
        return response.data;
    },

    /**
     * Marcar carro como finalizado
     */
    async finalizarCarro(carroId) {
        const response = await api.put(`/carros/${carroId}/finalizar`);
        return response.data;
    },

    /**
     * Obtener estadísticas del carro (P, A, M totales)
     */
    async getStats(carroId) {
        const response = await api.get(`/carros/${carroId}/stats`);
        return response.data;
    }
};

export default carrosService;
