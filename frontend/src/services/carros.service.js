import api from './api';

/**
 * Servicios para carros y configuración
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
     * Obtener un carro por ID
     */
    async getById(id) {
        const response = await api.get(`/carros/${id}`);
        return response.data;
    },

    /**
     * Obtener inventario de partes del equipo
     */
    async getInventario(carroId) {
        const response = await api.get(`/carros/${carroId}/inventario`);
        return response.data;
    },

    /**
     * Actualizar configuración de un slot
     */
    async updateConfiguracion(carroId, slot, parteId) {
        const response = await api.put(`/carros/${carroId}/configuracion`, { slot, parteId });
        return response.data;
    },

    /**
     * Obtener estadísticas del carro
     */
    async getStats(carroId) {
        const response = await api.get(`/carros/${carroId}/stats`);
        return response.data;
    }
};

export default carrosService;
