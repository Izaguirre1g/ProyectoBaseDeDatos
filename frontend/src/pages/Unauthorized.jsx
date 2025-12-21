import { Link } from 'react-router-dom';

function Unauthorized() {
    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <span style={styles.icon}>🚫</span>
                <h1>Acceso Denegado</h1>
                <p style={styles.text}>
                    No tienes permisos para acceder a esta página.
                </p>
                <Link to="/" style={styles.link}>
                    ← Volver al Dashboard
                </Link>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
    },
    content: {
        textAlign: 'center'
    },
    icon: {
        fontSize: '80px',
        display: 'block',
        marginBottom: '20px'
    },
    text: {
        color: '#888',
        marginBottom: '30px'
    },
    link: {
        color: '#e10600',
        textDecoration: 'none'
    }
};

export default Unauthorized;
