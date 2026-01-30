import api from './api';

const patrocinadoresService = {
    // Obtener todos los patrocinadores
    async getAll() {
        const response = await api.get('/patrocinadores');
        return response.data;
    },

    // Obtener patrocinador por ID
    async getById(id) {
        const response = await api.get(`/patrocinadores/${id}`);
        return response.data;
    },

    // Crear nuevo patrocinador (Solo Admin)
    async create(data) {
        const response = await api.post('/patrocinadores', data);
        return response.data;
    },

    // Actualizar patrocinador (Solo Admin)
    async update(id, data) {
        const response = await api.put(`/patrocinadores/${id}`, data);
        return response.data;
    },

    // Eliminar patrocinador (Solo Admin)
    async delete(id) {
        const response = await api.delete(`/patrocinadores/${id}`);
        return response.data;
    }
};

export default patrocinadoresService;
