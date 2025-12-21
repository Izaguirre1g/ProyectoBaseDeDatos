import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { usuario, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // No mostrar navbar en login
    if (location.pathname === '/login') {
        return null;
    }

    const isActive = (path) => location.pathname === path;

    return (
        <nav style={styles.nav}>
            <div style={styles.brand}>
                <Link to="/" style={styles.brandLink}>🏎️ F1 Database</Link>
            </div>

            {isAuthenticated() && (
                <>
                    <div style={styles.links}>
                        <Link 
                            to="/" 
                            style={isActive('/') ? styles.linkActive : styles.link}
                        >
                            Dashboard
                        </Link>
                        
                        {/* Links para Admin */}
                        {usuario?.rol === 'Admin' && (
                            <>
                                <Link 
                                    to="/usuarios" 
                                    style={isActive('/usuarios') ? styles.linkActive : styles.link}
                                >
                                    👥 Usuarios
                                </Link>
                                <Link 
                                    to="/equipos" 
                                    style={isActive('/equipos') ? styles.linkActive : styles.link}
                                >
                                    🏢 Equipos
                                </Link>
                                <Link 
                                    to="/simulaciones" 
                                    style={isActive('/simulaciones') ? styles.linkActive : styles.link}
                                >
                                    🏁 Simulaciones
                                </Link>
                            </>
                        )}

                        {/* Links para Engineer */}
                        {usuario?.rol === 'Engineer' && (
                            <>
                                <Link 
                                    to="/mi-equipo" 
                                    style={isActive('/mi-equipo') ? styles.linkActive : styles.link}
                                >
                                    🏢 Mi Equipo
                                </Link>
                                <Link 
                                    to="/inventario" 
                                    style={isActive('/inventario') ? styles.linkActive : styles.link}
                                >
                                    📦 Inventario
                                </Link>
                                <Link 
                                    to="/armado" 
                                    style={isActive('/armado') ? styles.linkActive : styles.link}
                                >
                                    🔧 Armado
                                </Link>
                            </>
                        )}

                        {/* Links para todos los autenticados */}
                        <Link 
                            to="/catalogo" 
                            style={isActive('/catalogo') ? styles.linkActive : styles.link}
                        >
                            🛒 Catálogo
                        </Link>
                    </div>

                    <div style={styles.userSection}>
                        <div style={styles.userInfo}>
                            <span style={styles.userName}>{usuario?.nombre}</span>
                            <span style={styles.userRole}>{usuario?.rol}</span>
                        </div>
                        <button onClick={handleLogout} style={styles.logoutBtn}>
                            Salir
                        </button>
                    </div>
                </>
            )}
        </nav>
    );
}

const styles = {
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        backgroundColor: '#1a1a1a',
        borderBottom: '2px solid #e10600',
        position: 'sticky',
        top: 0,
        zIndex: 1000
    },
    brand: {
        fontSize: '20px',
        fontWeight: 'bold'
    },
    brandLink: {
        color: '#fff',
        textDecoration: 'none'
    },
    links: {
        display: 'flex',
        gap: '8px'
    },
    link: {
        color: '#aaa',
        textDecoration: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        fontSize: '14px',
        transition: 'all 0.2s'
    },
    linkActive: {
        color: '#fff',
        textDecoration: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        fontSize: '14px',
        backgroundColor: '#e10600'
    },
    userSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
    },
    userName: {
        color: '#fff',
        fontSize: '14px',
        fontWeight: '500'
    },
    userRole: {
        color: '#888',
        fontSize: '12px'
    },
    logoutBtn: {
        padding: '8px 16px',
        backgroundColor: 'transparent',
        border: '1px solid #444',
        color: '#fff',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.2s'
    }
};

export default Navbar;
