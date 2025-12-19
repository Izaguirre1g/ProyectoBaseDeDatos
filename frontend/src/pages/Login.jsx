import { useState } from 'react';
import axios from 'axios';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [usuario, setUsuario] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setMensaje('');

        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', {
                email,
                password
            }, {
                withCredentials: true  // Importante para enviar cookies
            });

            if (response.data.success) {
                setUsuario(response.data.usuario);
                setMensaje(`✅ Bienvenido ${response.data.usuario.nombre}!`);
            }
        } catch (error) {
            setMensaje('❌ ' + (error.response?.data?.error || 'Error al conectar'));
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:3000/api/auth/logout', {}, {
                withCredentials: true
            });
            setUsuario(null);
            setMensaje('Sesión cerrada');
        } catch (error) {
            setMensaje('Error al cerrar sesión');
        }
    };

    const verificarSesion = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/auth/me', {
                withCredentials: true
            });
            if (response.data.loggedIn) {
                setUsuario(response.data.usuario);
                setMensaje('✅ Sesión activa');
            } else {
                setMensaje('No hay sesión activa');
            }
        } catch (error) {
            setMensaje('Error al verificar sesión');
        }
    };

    return (
        <div style={styles.container}>
            <h1>🏎️ F1 Database - Login</h1>
            
            {!usuario ? (
                <form onSubmit={handleLogin} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@f1.com"
                            style={styles.input}
                        />
                    </div>
                    
                    <div style={styles.inputGroup}>
                        <label>Contraseña:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="123456"
                            style={styles.input}
                        />
                    </div>
                    
                    <button type="submit" style={styles.button}>
                        Iniciar Sesión
                    </button>
                </form>
            ) : (
                <div style={styles.userInfo}>
                    <h2>Usuario Autenticado</h2>
                    <p><strong>Nombre:</strong> {usuario.nombre}</p>
                    <p><strong>Email:</strong> {usuario.email}</p>
                    <p><strong>Rol:</strong> {usuario.rol}</p>
                    <button onClick={handleLogout} style={styles.buttonLogout}>
                        Cerrar Sesión
                    </button>
                </div>
            )}
            
            {mensaje && <p style={styles.mensaje}>{mensaje}</p>}
            
            <div style={styles.credenciales}>
                <h3>Usuarios de prueba:</h3>
                <p>👤 admin@f1.com / 123456 (Admin)</p>
                <p>👤 engineer@f1.com / 123456 (Engineer)</p>
                <p>👤 driver@f1.com / 123456 (Driver)</p>
            </div>

            <button onClick={verificarSesion} style={styles.buttonSecondary}>
                Verificar Sesión Activa
            </button>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '400px',
        margin: '50px auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    input: {
        padding: '10px',
        fontSize: '16px',
        border: '1px solid #ccc',
        borderRadius: '4px'
    },
    button: {
        padding: '12px',
        fontSize: '16px',
        backgroundColor: '#e10600',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    buttonLogout: {
        padding: '10px 20px',
        backgroundColor: '#333',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    buttonSecondary: {
        marginTop: '20px',
        padding: '10px',
        backgroundColor: '#666',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        width: '100%'
    },
    mensaje: {
        padding: '10px',
        backgroundColor: '#f0f0f0',
        borderRadius: '4px',
        marginTop: '15px'
    },
    userInfo: {
        padding: '20px',
        backgroundColor: '#e8f5e9',
        borderRadius: '8px'
    },
    credenciales: {
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#fff3e0',
        borderRadius: '8px',
        fontSize: '14px'
    }
};

export default Login;
