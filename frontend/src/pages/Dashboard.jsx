import { useAuth } from '../context/AuthContext';

function Dashboard() {
    const { usuario } = useAuth();

    // Renderizar dashboard según rol
    const renderContent = () => {
        switch (usuario?.rol) {
            case 'Admin':
                return <AdminDashboard />;
            case 'Engineer':
                return <EngineerDashboard />;
            case 'Driver':
                return <DriverDashboard />;
            default:
                return <div>Rol no reconocido</div>;
        }
    };

    return (
        <div style={styles.container}>
            {renderContent()}
        </div>
    );
}

// Dashboard para Admin
function AdminDashboard() {
    const stats = [
        { label: 'Usuarios', value: 3, icon: '👥', color: '#3b82f6' },
        { label: 'Equipos', value: 5, icon: '🏢', color: '#22c55e' },
        { label: 'Conductores', value: 10, icon: '🏎️', color: '#eab308' },
        { label: 'Simulaciones', value: 12, icon: '🏁', color: '#e10600' },
    ];

    return (
        <>
            <header style={styles.header}>
                <h1>Panel de Administración</h1>
                <p style={styles.subtitle}>Vista general del sistema</p>
            </header>

            <div style={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <div key={index} style={styles.statCard}>
                        <div style={{ ...styles.statIcon, backgroundColor: stat.color }}>
                            {stat.icon}
                        </div>
                        <div style={styles.statInfo}>
                            <span style={styles.statValue}>{stat.value}</span>
                            <span style={styles.statLabel}>{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div style={styles.section}>
                <h2>Acciones Rápidas</h2>
                <div style={styles.actionsGrid}>
                    <button style={styles.actionBtn}>➕ Nuevo Usuario</button>
                    <button style={styles.actionBtn}>➕ Nuevo Equipo</button>
                    <button style={styles.actionBtn}>🏁 Nueva Simulación</button>
                    <button style={styles.actionBtn}>📊 Ver Grafana</button>
                </div>
            </div>

            <div style={styles.section}>
                <h2>Actividad Reciente</h2>
                <div style={styles.activityList}>
                    <div style={styles.activityItem}>
                        <span style={styles.activityTime}>Hace 2h</span>
                        <span>Simulación #12 completada - Circuito de Mónaco</span>
                    </div>
                    <div style={styles.activityItem}>
                        <span style={styles.activityTime}>Hace 5h</span>
                        <span>Red Bull Racing compró Power Unit Honda</span>
                    </div>
                    <div style={styles.activityItem}>
                        <span style={styles.activityTime}>Ayer</span>
                        <span>Ferrari agregó nuevo patrocinador: Shell</span>
                    </div>
                </div>
            </div>
        </>
    );
}

// Dashboard para Engineer
function EngineerDashboard() {
    const equipo = {
        nombre: 'Red Bull Racing',
        presupuesto: 145000000,
        carros: 2,
        partes: 24
    };

    return (
        <>
            <header style={styles.header}>
                <h1>Panel de Ingeniero</h1>
                <p style={styles.subtitle}>Equipo: {equipo.nombre}</p>
            </header>

            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, backgroundColor: '#22c55e' }}>💰</div>
                    <div style={styles.statInfo}>
                        <span style={styles.statValue}>${(equipo.presupuesto / 1000000).toFixed(0)}M</span>
                        <span style={styles.statLabel}>Presupuesto</span>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, backgroundColor: '#3b82f6' }}>🏎️</div>
                    <div style={styles.statInfo}>
                        <span style={styles.statValue}>{equipo.carros}/2</span>
                        <span style={styles.statLabel}>Carros</span>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, backgroundColor: '#eab308' }}>📦</div>
                    <div style={styles.statInfo}>
                        <span style={styles.statValue}>{equipo.partes}</span>
                        <span style={styles.statLabel}>Partes en Inventario</span>
                    </div>
                </div>
            </div>

            <div style={styles.section}>
                <h2>Carros del Equipo</h2>
                <div style={styles.carrosGrid}>
                    <div style={styles.carroCard}>
                        <h3>#1 RB20</h3>
                        <p>Conductor: Max Verstappen</p>
                        <div style={styles.carroStats}>
                            <span>P: 42</span>
                            <span>A: 38</span>
                            <span>M: 35</span>
                        </div>
                        <span style={styles.badge}>✅ Finalizado</span>
                    </div>
                    <div style={styles.carroCard}>
                        <h3>#11 RB20</h3>
                        <p>Conductor: Sergio Pérez</p>
                        <div style={styles.carroStats}>
                            <span>P: 40</span>
                            <span>A: 36</span>
                            <span>M: 33</span>
                        </div>
                        <span style={styles.badge}>✅ Finalizado</span>
                    </div>
                </div>
            </div>

            <div style={styles.section}>
                <h2>Acciones</h2>
                <div style={styles.actionsGrid}>
                    <button style={styles.actionBtn}>🛒 Comprar Partes</button>
                    <button style={styles.actionBtn}>🔧 Configurar Carro</button>
                    <button style={styles.actionBtn}>📦 Ver Inventario</button>
                </div>
            </div>
        </>
    );
}

// Dashboard para Driver
function DriverDashboard() {
    const driver = {
        nombre: 'Carlos Sainz',
        equipo: 'Ferrari',
        numero: 55,
        habilidad: 85,
        victorias: 3,
        podios: 15,
        puntos: 245
    };

    return (
        <>
            <header style={styles.header}>
                <h1>Mi Perfil</h1>
                <p style={styles.subtitle}>#{driver.numero} - {driver.equipo}</p>
            </header>

            <div style={styles.driverProfile}>
                <div style={styles.driverAvatar}>
                    🏎️
                </div>
                <div style={styles.driverInfo}>
                    <h2>{driver.nombre}</h2>
                    <div style={styles.habilidadBar}>
                        <span>Habilidad: {driver.habilidad}/100</span>
                        <div style={styles.barContainer}>
                            <div style={{ ...styles.barFill, width: `${driver.habilidad}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, backgroundColor: '#eab308' }}>🏆</div>
                    <div style={styles.statInfo}>
                        <span style={styles.statValue}>{driver.victorias}</span>
                        <span style={styles.statLabel}>Victorias</span>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, backgroundColor: '#a855f7' }}>🥇</div>
                    <div style={styles.statInfo}>
                        <span style={styles.statValue}>{driver.podios}</span>
                        <span style={styles.statLabel}>Podios</span>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, backgroundColor: '#22c55e' }}>⭐</div>
                    <div style={styles.statInfo}>
                        <span style={styles.statValue}>{driver.puntos}</span>
                        <span style={styles.statLabel}>Puntos</span>
                    </div>
                </div>
            </div>

            <div style={styles.section}>
                <h2>Últimas Carreras</h2>
                <div style={styles.activityList}>
                    <div style={styles.activityItem}>
                        <span style={styles.posicion}>P2</span>
                        <span>GP de España - Barcelona</span>
                    </div>
                    <div style={styles.activityItem}>
                        <span style={styles.posicion}>P1</span>
                        <span>GP de Mónaco - Monte Carlo</span>
                    </div>
                    <div style={styles.activityItem}>
                        <span style={styles.posicion}>P4</span>
                        <span>GP de Miami - Hard Rock Stadium</span>
                    </div>
                </div>
            </div>
        </>
    );
}

const styles = {
    container: {
        padding: '30px',
        maxWidth: '1200px',
        margin: '0 auto',
        color: '#fff'
    },
    header: {
        marginBottom: '30px'
    },
    subtitle: {
        color: '#888',
        margin: '8px 0 0 0'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
    },
    statCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        border: '1px solid #333'
    },
    statIcon: {
        width: '50px',
        height: '50px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px'
    },
    statInfo: {
        display: 'flex',
        flexDirection: 'column'
    },
    statValue: {
        fontSize: '24px',
        fontWeight: 'bold'
    },
    statLabel: {
        color: '#888',
        fontSize: '14px'
    },
    section: {
        backgroundColor: '#1a1a1a',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px',
        border: '1px solid #333'
    },
    actionsGrid: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        marginTop: '16px'
    },
    actionBtn: {
        padding: '12px 24px',
        backgroundColor: '#0f0f0f',
        border: '1px solid #333',
        color: '#fff',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    activityList: {
        marginTop: '16px'
    },
    activityItem: {
        padding: '12px 0',
        borderBottom: '1px solid #333',
        display: 'flex',
        gap: '16px',
        color: '#ccc'
    },
    activityTime: {
        color: '#888',
        minWidth: '80px',
        fontSize: '13px'
    },
    carrosGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginTop: '16px'
    },
    carroCard: {
        backgroundColor: '#0f0f0f',
        borderRadius: '8px',
        padding: '20px',
        border: '1px solid #333'
    },
    carroStats: {
        display: 'flex',
        gap: '16px',
        color: '#888',
        margin: '12px 0',
        fontSize: '14px'
    },
    badge: {
        display: 'inline-block',
        padding: '4px 12px',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        color: '#22c55e',
        borderRadius: '20px',
        fontSize: '12px'
    },
    driverProfile: {
        display: 'flex',
        gap: '24px',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '30px',
        border: '1px solid #333'
    },
    driverAvatar: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: '#e10600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '48px'
    },
    driverInfo: {
        flex: 1
    },
    habilidadBar: {
        marginTop: '12px'
    },
    barContainer: {
        height: '8px',
        backgroundColor: '#333',
        borderRadius: '4px',
        marginTop: '8px',
        overflow: 'hidden'
    },
    barFill: {
        height: '100%',
        backgroundColor: '#22c55e',
        borderRadius: '4px'
    },
    posicion: {
        backgroundColor: '#e10600',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold'
    }
};

export default Dashboard;
