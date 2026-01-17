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
        // Si el servidor responde con 401, el usuario no está autenticado o la sesión expiró
        if (error.response?.status === 401) {
            console.log('⚠️ Sesión expirada o no autorizado');
            
            // Limpiar localStorage
            localStorage.removeItem('usuario');
            localStorage.removeItem('token');
            
            // Redirigir a login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
