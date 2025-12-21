import { useState, useEffect } from 'react';
import partesService from '../services/partes.service';

function Catalogo() {
    const [partes, setPartes] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [categoriaActiva, setCategoriaActiva] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar categorías al inicio
    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const data = await partesService.getCategorias();
                setCategorias(data);
            } catch (err) {
                console.error('Error al cargar categorías:', err);
            }
        };
        fetchCategorias();
    }, []);

    // Cargar partes (todas o por categoría)
    useEffect(() => {
        const fetchPartes = async () => {
            setLoading(true);
            try {
                const data = await partesService.getAll(categoriaActiva);
                setPartes(data);
                setError(null);
            } catch (err) {
                setError('Error al cargar partes');
            } finally {
                setLoading(false);
            }
        };
        fetchPartes();
    }, [categoriaActiva]);

    const formatPrecio = (precio) => {
        return new Intl.NumberFormat('es-CR', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(precio);
    };

    const getStatColor = (value) => {
        if (value >= 7) return '#22c55e'; // verde
        if (value >= 4) return '#eab308'; // amarillo
        return '#ef4444'; // rojo
    };

    const StatBar = ({ label, value, icon }) => (
        <div style={styles.statRow}>
            <span style={styles.statLabel}>{icon} {label}</span>
            <div style={styles.statBarContainer}>
                <div 
                    style={{
                        ...styles.statBarFill,
                        width: `${(value / 9) * 100}%`,
                        backgroundColor: getStatColor(value)
                    }}
                />
            </div>
            <span style={styles.statValue}>{value}</span>
        </div>
    );

    const handleComprar = async (parteId) => {
        // TODO: Implementar cuando tengas BD
        alert('Función de compra - Se implementará con la base de datos');
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1>🛒 Catálogo de Partes F1</h1>
                <p style={styles.subtitle}>Selecciona las mejores partes para tu carro</p>
            </header>

            {/* Filtros por categoría */}
            <div style={styles.filtros}>
                <button 
                    style={categoriaActiva === null ? styles.filtroActivo : styles.filtroBtn}
                    onClick={() => setCategoriaActiva(null)}
                >
                    📦 Todas
                </button>
                {categorias.map(cat => (
                    <button
                        key={cat.id}
                        style={categoriaActiva === cat.id ? styles.filtroActivo : styles.filtroBtn}
                        onClick={() => setCategoriaActiva(cat.id)}
                    >
                        {cat.icono} {cat.nombre}
                    </button>
                ))}
            </div>

            {/* Mensaje de error */}
            {error && <div style={styles.error}>{error}</div>}

            {/* Loading */}
            {loading && <div style={styles.loading}>Cargando partes...</div>}

            {/* Grid de partes */}
            {!loading && (
                <div style={styles.grid}>
                    {partes.map(parte => (
                        <div key={parte.id} style={styles.card}>
                            <div style={styles.cardHeader}>
                                <span style={styles.categoria}>
                                    {categorias.find(c => c.id === parte.categoria)?.icono} {parte.categoria}
                                </span>
                                <span style={{
                                    ...styles.stock,
                                    color: parte.stock > 5 ? '#22c55e' : '#ef4444'
                                }}>
                                    Stock: {parte.stock}
                                </span>
                            </div>
                            
                            <h3 style={styles.cardTitle}>{parte.nombre}</h3>
                            <p style={styles.cardDesc}>{parte.descripcion}</p>

                            <div style={styles.stats}>
                                <StatBar label="Potencia" value={parte.potencia} icon="⚡" />
                                <StatBar label="Aerodinámica" value={parte.aerodinamica} icon="💨" />
                                <StatBar label="Manejo" value={parte.manejo} icon="🎯" />
                            </div>

                            <div style={styles.cardFooter}>
                                <span style={styles.precio}>{formatPrecio(parte.precio)}</span>
                                <button 
                                    style={styles.btnComprar}
                                    onClick={() => handleComprar(parte.id)}
                                >
                                    Comprar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Resumen */}
            <div style={styles.resumen}>
                Mostrando {partes.length} partes 
                {categoriaActiva && ` en ${categorias.find(c => c.id === categoriaActiva)?.nombre}`}
            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '30px',
        color: '#fff'
    },
    header: {
        marginBottom: '30px'
    },
    subtitle: {
        color: '#888',
        marginTop: '8px'
    },
    filtros: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        marginBottom: '20px'
    },
    filtroBtn: {
        padding: '10px 16px',
        border: '1px solid #333',
        backgroundColor: '#1a1a1a',
        color: '#fff',
        borderRadius: '20px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.2s'
    },
    filtroActivo: {
        padding: '10px 16px',
        border: '1px solid #e10600',
        backgroundColor: '#e10600',
        color: '#fff',
        borderRadius: '20px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
    },
    card: {
        backgroundColor: '#1a1a1a',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #333',
        transition: 'transform 0.2s, border-color 0.2s'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
        fontSize: '12px'
    },
    categoria: {
        color: '#888',
        textTransform: 'uppercase'
    },
    stock: {
        fontWeight: 'bold'
    },
    cardTitle: {
        margin: '0 0 8px 0',
        fontSize: '18px',
        color: '#fff'
    },
    cardDesc: {
        color: '#888',
        fontSize: '13px',
        marginBottom: '15px'
    },
    stats: {
        marginBottom: '15px'
    },
    statRow: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px',
        gap: '10px'
    },
    statLabel: {
        width: '100px',
        fontSize: '12px',
        color: '#aaa'
    },
    statBarContainer: {
        flex: 1,
        height: '8px',
        backgroundColor: '#333',
        borderRadius: '4px',
        overflow: 'hidden'
    },
    statBarFill: {
        height: '100%',
        borderRadius: '4px',
        transition: 'width 0.3s'
    },
    statValue: {
        width: '20px',
        textAlign: 'right',
        fontSize: '12px',
        fontWeight: 'bold'
    },
    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid #333',
        paddingTop: '15px'
    },
    precio: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#22c55e'
    },
    btnComprar: {
        padding: '8px 20px',
        backgroundColor: '#e10600',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    error: {
        padding: '15px',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid #ef4444',
        color: '#ef4444',
        borderRadius: '8px',
        marginBottom: '20px'
    },
    loading: {
        textAlign: 'center',
        padding: '40px',
        color: '#888'
    },
    resumen: {
        textAlign: 'center',
        marginTop: '30px',
        color: '#666',
        fontSize: '14px'
    }
};

export default Catalogo;
