import api from './api';

const simulacionesService = {
    /**
     * Obtener dashboard completo del conductor (carro, simulaciones, stats)
     */
    async getDashboard() {
        const response = await api.get('/simulaciones');
        return response.data;
    },

    /**
     * Alias para getDashboard - compatibilidad
     */
    async getSimulaciones() {
        return await this.getDashboard();
    },

    /**
     * Obtener detalle de una simulación específica con resultados
     */
    async getSimulacion(id) {
        const response = await api.get(`/simulaciones/${id}`);
        return response.data;
    },

    /**
     * Obtener resultados de una simulación
     */
    async getResultados(id) {
        const response = await api.get(`/simulaciones/${id}/resultados`);
        return response.data;
    },

    /**
     * Obtener lista de circuitos disponibles
     */
    async getCircuitos() {
        const response = await api.get('/circuitos');
        return response.data;
    },

    /**
     * Obtener estadísticas del conductor actual
     */
    async getDriverStats() {
        const response = await api.get('/simulaciones/driver/stats');
        return response.data;
    },

    /**
     * Ejecutar una simulación usando Stored Procedure con transacción
     * @param {number} idCircuito - ID del circuito
     * @param {Array} carros - Array de {idCarro: number, habilidad: number}
     * @returns {Promise<Object>} - Resultado con simulación y resultados
     */
    async ejecutarSimulacion(idCircuito, carros) {
        const response = await api.post('/simulaciones/ejecutar', {
            idCircuito,
            carros
        });
        return response.data;
    },

    /**
     * Obtener ranking de conductores
     */
    async getRanking() {
        const response = await api.get('/simulaciones/ranking/conductores');
        return response.data;
    },

    /**
     * Obtener carros disponibles para simulaciones
     */
    async getCarrosDisponibles() {
        const response = await api.get('/carros/disponibles');
        return response.data;
    }
};

export default simulacionesService;
