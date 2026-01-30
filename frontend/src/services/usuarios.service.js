import api from './api';
import { hashPassword } from '../utils/password';

/**
 * Servicios para usuarios
 * Las contraseñas se hashean con Argon2id antes de enviarse
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
     * La contraseña se hashea con Argon2id antes de enviar
     * @param {object} usuario - { nombre, email, password, rol, equipoId }
     * @returns {Promise}
     */
    async create(usuario) {
        let datosEnviar = { ...usuario };
        
        // Si hay contraseña, hashearla con Argon2id
        if (usuario.password && usuario.password.trim()) {
            datosEnviar.password = await hashPassword(usuario.password, usuario.email);
            console.log('Contrasena hasheada con Argon2id para crear usuario');
        }
        
        const response = await api.post('/usuarios', datosEnviar);
        return response.data;
    },

    /**
     * Actualizar usuario
     * Si se proporciona contraseña, se hashea con Argon2id antes de enviar
     * @param {number} id 
     * @param {object} datos 
     * @returns {Promise}
     */
    async update(id, datos) {
        let datosEnviar = { ...datos };
        
        // Si hay contraseña nueva, hashearla con Argon2id
        if (datos.password && datos.password.trim()) {
            datosEnviar.password = await hashPassword(datos.password, datos.email);
            console.log('Contrasena hasheada con Argon2id para actualizar usuario');
        }
        
        const response = await api.put(`/usuarios/${id}`, datosEnviar);
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
