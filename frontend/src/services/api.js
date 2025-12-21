import axios from 'axios';

// Configuración base de Axios
const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true,  // Importante para enviar cookies de sesión
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si el servidor responde con 401, el usuario no está autenticado
        if (error.response?.status === 401) {
            // Podrías redirigir al login o limpiar el estado
            console.log('No autorizado - sesión expirada o inválida');
        }
        return Promise.reject(error);
    }
);

export default api;
