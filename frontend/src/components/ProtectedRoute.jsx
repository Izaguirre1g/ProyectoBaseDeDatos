import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para proteger rutas según autenticación y rol
 * @param {ReactNode} children - Componente a renderizar si está autorizado
 * @param {string[]} allowedRoles - Roles permitidos (opcional)
 */
function ProtectedRoute({ children, allowedRoles = [] }) {
    const { usuario, loading, isAuthenticated } = useAuth();

    // Mostrar loading mientras verifica sesión
    if (loading) {
        return (
            <div style={styles.loading}>
                <div style={styles.spinner}></div>
                <p>Verificando sesión...</p>
            </div>
        );
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    // Si hay roles permitidos y el usuario no tiene uno de ellos
    if (allowedRoles.length > 0 && !allowedRoles.includes(usuario.rol)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Usuario autorizado, mostrar el contenido
    return children;
}

const styles = {
    loading: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#0f0f0f',
        color: '#fff'
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #333',
        borderTop: '4px solid #e10600',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    }
};

export default ProtectedRoute;
