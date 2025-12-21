import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(email, password);
        
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
        
        setLoading(false);
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h1 style={styles.title}>🏎️ F1 Database</h1>
                    <p style={styles.subtitle}>Sistema de Gestión de Fórmula 1</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@f1.com"
                            style={styles.input}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••"
                            style={styles.input}
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div style={styles.error}>
                            ❌ {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div style={styles.testUsers}>
                    <h4 style={styles.testTitle}>Usuarios de prueba:</h4>
                    <div style={styles.testUser}>
                        <span>👤 admin@f1.com</span>
                        <span style={styles.testRole}>Admin</span>
                    </div>
                    <div style={styles.testUser}>
                        <span>👤 engineer@f1.com</span>
                        <span style={styles.testRole}>Engineer</span>
                    </div>
                    <div style={styles.testUser}>
                        <span>👤 driver@f1.com</span>
                        <span style={styles.testRole}>Driver</span>
                    </div>
                    <p style={styles.testPassword}>Contraseña: 123456</p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f0f0f',
        padding: '20px'
    },
    card: {
        backgroundColor: '#1a1a1a',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid #333'
    },
    header: {
        textAlign: 'center',
        marginBottom: '30px'
    },
    title: {
        color: '#fff',
        fontSize: '28px',
        margin: '0 0 8px 0'
    },
    subtitle: {
        color: '#888',
        fontSize: '14px',
        margin: 0
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    label: {
        color: '#aaa',
        fontSize: '14px'
    },
    input: {
        padding: '14px 16px',
        fontSize: '16px',
        backgroundColor: '#0f0f0f',
        border: '1px solid #333',
        borderRadius: '8px',
        color: '#fff',
        outline: 'none',
        transition: 'border-color 0.2s'
    },
    button: {
        padding: '14px',
        fontSize: '16px',
        fontWeight: '600',
        backgroundColor: '#e10600',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        marginTop: '10px'
    },
    error: {
        padding: '12px',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid #ef4444',
        borderRadius: '8px',
        color: '#ef4444',
        fontSize: '14px'
    },
    testUsers: {
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#0f0f0f',
        borderRadius: '8px',
        border: '1px solid #333'
    },
    testTitle: {
        color: '#888',
        fontSize: '12px',
        textTransform: 'uppercase',
        margin: '0 0 12px 0'
    },
    testUser: {
        display: 'flex',
        justifyContent: 'space-between',
        color: '#aaa',
        fontSize: '13px',
        padding: '6px 0'
    },
    testRole: {
        color: '#e10600',
        fontSize: '12px'
    },
    testPassword: {
        color: '#666',
        fontSize: '12px',
        margin: '12px 0 0 0',
        textAlign: 'center'
    }
};

export default Login;