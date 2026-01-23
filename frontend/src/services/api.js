import axios from 'axios';

// Detectar automáticamente la IP (localhost o IP local según dónde se acceda)
const getBaseURL = () => {
    const host = window.location.hostname;
    return `http://${host}:3000/api`;
};

// Configuración base de Axios
const api = axios.create({
    baseURL: getBaseURL(),
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
            console.log('Sesión expirada o no autorizado');
            
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
