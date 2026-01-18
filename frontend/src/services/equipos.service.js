import api from './api';

export const equiposService = {
    // Obtener todos los equipos
    getAll: async () => {
        const response = await api.get('/equipos');
        return response.data;
    },

    // Obtener equipo por ID
    getById: async (id) => {
        const response = await api.get(`/equipos/${id}`);
        return response.data;
    },

    // Obtener pilotos de un equipo
    getPilotos: async (equipoId) => {
        const response = await api.get(`/equipos/${equipoId}/pilotos`);
        return response.data;
    },

    // Obtener carros de un equipo
    getCarros: async (equipoId) => {
        const response = await api.get(`/equipos/${equipoId}/carros`);
        return response.data;
    },

    // Obtener carro específico de un equipo
    getCarro: async (equipoId, carroId) => {
        const response = await api.get(`/equipos/${equipoId}/carros/${carroId}`);
        return response.data;
    },

    // Obtener inventario de un equipo
    getInventario: async (equipoId) => {
        const response = await api.get(`/equipos/${equipoId}/inventario`);
        return response.data;
    },

    // Obtener patrocinadores de un equipo
    getPatrocinadores: async (equipoId) => {
        const response = await api.get(`/equipos/${equipoId}/patrocinadores`);
        return response.data;
    },

    // Obtener presupuesto de un equipo
    getPresupuesto: async (equipoId) => {
        const response = await api.get(`/equipos/${equipoId}/presupuesto`);
        return response.data;
    },

    // Obtener todos los patrocinadores disponibles
    getAllPatrocinadores: async () => {
        const response = await api.get('/equipos/patrocinadores');
        return response.data;
    },

    // Agregar aporte a un equipo
    agregarAporte: async (equipoId, data) => {
        const response = await api.post(`/equipos/${equipoId}/aportes`, data);
        return response.data;
    },

    // Obtener aportes de un equipo
    getAportes: async (equipoId) => {
        const response = await api.get(`/equipos/${equipoId}/aportes`);
        return response.data;
    },

    // Obtener gastos/pedidos de un equipo
    getGastos: async (equipoId) => {
        const response = await api.get(`/equipos/${equipoId}/gastos`);
        return response.data;
    },
};
