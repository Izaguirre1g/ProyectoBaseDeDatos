import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

// Crear el contexto
const AuthContext = createContext(null);

/**
 * Provider de autenticación
 * Envuelve la aplicación y proporciona estado de usuario global
 */
export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Verificar sesión al cargar la app
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            setLoading(true);
            const data = await authService.checkSession();
            if (data.loggedIn) {
                setUsuario(data.usuario);
            } else {
                setUsuario(null);
            }
        } catch (err) {
            setUsuario(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const data = await authService.login(email, password);
            if (data.success) {
                setUsuario(data.usuario);
                return { success: true };
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Error al iniciar sesión';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        }
    };

    const logout = async () => {
        try {
            // Intentar notificar al servidor que se cierra sesión
            try {
                await authService.logout();
            } catch (err) {
                console.log('Sesión ya cerrada en servidor:', err.message);
            }
            // Limpiar estado local de todos modos
            setUsuario(null);
            return { success: true };
        } catch (err) {
            console.error('Error al cerrar sesión:', err);
            setUsuario(null);
            return { success: true };
        }
    };

    // Helpers para verificar roles
    const isAdmin = () => usuario?.rol === 'Admin';
    const isEngineer = () => usuario?.rol === 'Engineer';
    const isDriver = () => usuario?.rol === 'Driver';
    const isAuthenticated = () => !!usuario;

    const value = {
        usuario,
        loading,
        error,
        login,
        logout,
        checkAuth,
        isAdmin,
        isEngineer,
        isDriver,
        isAuthenticated
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook para usar el contexto de autenticación
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
}

export default AuthContext;
