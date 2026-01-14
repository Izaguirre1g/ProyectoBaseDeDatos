import api from './api';

const simulacionesService = {
    /**
     * Obtener todas las simulaciones del conductor actual
     */
    async getSimulaciones() {
        const response = await api.get('/simulaciones');
        return response.data;
    },

    /**
     * Obtener detalle de una simulación específica con podio
     */
    async getSimulacion(id) {
        const response = await api.get(`/simulaciones/${id}`);
        return response.data;
    },

    /**
     * Obtener lista de circuitos disponibles
     */
    async getCircuitos() {
        const response = await api.get('/simulaciones/circuitos/lista');
        return response.data;
    },

    /**
     * Obtener estadísticas del conductor
     */
    async getDriverStats() {
        const response = await api.get('/simulaciones/driver/stats');
        return response.data;
    }
};

export default simulacionesService;
