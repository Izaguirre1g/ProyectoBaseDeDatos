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
        // Obtener carro básico
        const carroRes = await api.get(`/carros/${id}`);
        const carro = carroRes.data;
        
        // Obtener partes instaladas
        const partesRes = await api.get(`/carros/${id}/partes`);
        carro.partes = partesRes.data;
        
        return carro;
    },

    /**
     * Crear nuevo carro con conductor opcional
     * @param {number} idEquipo - ID del equipo que crea el carro
     * @param {number|null} idConductor - ID del conductor (opcional)
     * @returns {Promise<Object>} - Carro creado
     */
    async crearCarro(idEquipo, idConductor = null) {
        const response = await api.post('/carros', {
            idEquipo,
            idConductor
        });
        return response.data;
    },

    /**
     * Obtener carros de un equipo específico
     */
    async getByEquipo(idEquipo) {
        const response = await api.get('/carros', {
            params: { idEquipo }
        });
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
     * Obtener configuración completa del carro (5 categorías)
     */
    async getConfiguracion(carroId) {
        const response = await api.get(`/carros/${carroId}/configuracion`);
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
        const response = await api.post(`/carros/${carroId}/instalar`, {
            idParte: parteId
        });
        return response.data;
    },

    /**
     * Reemplazar parte en carro usando SP_ReemplazarParteEnCarro
     * Automáticamente desinstala la parte vieja de la misma categoría
     * @param {number} carroId - ID del carro
     * @param {number} parteNuevaId - ID de la nueva parte
     */
    async reemplazarParte(carroId, parteNuevaId) {
        const response = await api.post(`/carros/${carroId}/reemplazar`, {
            idParteNueva: parteNuevaId
        });
        return response.data;
    },

    /**
     * Desinstalar parte de un carro usando SP (devuelve al inventario)
     * @param {number} carroId - ID del carro
     * @param {number} parteId - ID de la parte a desinstalar
     */
    async desinstalarParte(carroId, parteId) {
        const response = await api.delete(`/carros/${carroId}/desinstalar/${parteId}`);
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
    },

    /**
     * Obtener conductores disponibles para asignar a un carro
     * @param {number} idEquipo - ID del equipo
     */
    async getConductoresDisponibles(idEquipo) {
        const response = await api.get(`/carros/conductores-disponibles/${idEquipo}`);
        return response.data;
    },

    /**
     * Eliminar un carro
     * @param {number} carroId - ID del carro a eliminar
     */
    async eliminarCarro(carroId) {
        const response = await api.delete(`/carros/${carroId}`);
        return response.data;
    }
};

export default carrosService;
