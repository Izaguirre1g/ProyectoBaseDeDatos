import { useState } from 'react';

/**
 * Vista de gestión de usuarios (Admin)
 * Datos dummy - preparado para integrar con BD
 */
function Usuarios() {
    const [usuarios, setUsuarios] = useState([
        { id: 1, nombre: 'Administrador', email: 'admin@f1.com', rol: 'Admin', equipo: null },
        { id: 2, nombre: 'Carlos Engineer', email: 'engineer@f1.com', rol: 'Engineer', equipo: 'Ferrari' },
        { id: 3, nombre: 'Carlos Sainz', email: 'driver@f1.com', rol: 'Driver', equipo: 'Ferrari' },
        { id: 4, nombre: 'Max Engineer', email: 'max.eng@f1.com', rol: 'Engineer', equipo: 'Red Bull Racing' },
        { id: 5, nombre: 'Max Verstappen', email: 'max@f1.com', rol: 'Driver', equipo: 'Red Bull Racing' },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const handleEdit = (usuario) => {
        setEditingUser(usuario);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar este usuario?')) {
            setUsuarios(usuarios.filter(u => u.id !== id));
        }
    };

    const handleNew = () => {
        setEditingUser(null);
        setShowModal(true);
    };

    const getRolColor = (rol) => {
        switch (rol) {
            case 'Admin': return '#e10600';
            case 'Engineer': return '#3b82f6';
            case 'Driver': return '#22c55e';
            default: return '#888';
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h1>Gestión de Usuarios</h1>
                    <p style={styles.subtitle}>{usuarios.length} usuarios registrados</p>
                </div>
                <button style={styles.btnPrimary} onClick={handleNew}>
                    ➕ Nuevo Usuario
                </button>
            </header>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Nombre</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Rol</th>
                            <th style={styles.th}>Equipo</th>
                            <th style={styles.th}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map(usuario => (
                            <tr key={usuario.id} style={styles.tr}>
                                <td style={styles.td}>{usuario.id}</td>
                                <td style={styles.td}>{usuario.nombre}</td>
                                <td style={styles.td}>{usuario.email}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.rolBadge,
                                        backgroundColor: getRolColor(usuario.rol)
                                    }}>
                                        {usuario.rol}
                                    </span>
                                </td>
                                <td style={styles.td}>{usuario.equipo || '-'}</td>
                                <td style={styles.td}>
                                    <button 
                                        style={styles.btnEdit}
                                        onClick={() => handleEdit(usuario)}
                                    >
                                        ✏️
                                    </button>
                                    <button 
                                        style={styles.btnDelete}
                                        onClick={() => handleDelete(usuario.id)}
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal para crear/editar */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h2>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                        <form style={styles.form}>
                            <div style={styles.formGroup}>
                                <label>Nombre</label>
                                <input 
                                    type="text" 
                                    style={styles.input}
                                    defaultValue={editingUser?.nombre || ''}
                                    placeholder="Nombre completo"
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label>Email</label>
                                <input 
                                    type="email" 
                                    style={styles.input}
                                    defaultValue={editingUser?.email || ''}
                                    placeholder="email@f1.com"
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label>Contraseña</label>
                                <input 
                                    type="password" 
                                    style={styles.input}
                                    placeholder={editingUser ? '••••••• (dejar vacío para mantener)' : 'Contraseña'}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label>Rol</label>
                                <select style={styles.input} defaultValue={editingUser?.rol || 'Driver'}>
                                    <option value="Admin">Admin</option>
                                    <option value="Engineer">Engineer</option>
                                    <option value="Driver">Driver</option>
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label>Equipo (opcional)</label>
                                <select style={styles.input} defaultValue={editingUser?.equipo || ''}>
                                    <option value="">Sin equipo</option>
                                    <option value="Ferrari">Ferrari</option>
                                    <option value="Red Bull Racing">Red Bull Racing</option>
                                    <option value="Mercedes">Mercedes</option>
                                    <option value="McLaren">McLaren</option>
                                </select>
                            </div>
                            <div style={styles.modalActions}>
                                <button 
                                    type="button" 
                                    style={styles.btnCancel}
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" style={styles.btnPrimary}>
                                    {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
    },
    subtitle: {
        color: '#888',
        margin: '8px 0 0 0'
    },
    btnPrimary: {
        padding: '12px 24px',
        backgroundColor: '#e10600',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600'
    },
    tableContainer: {
        backgroundColor: '#1a1a1a',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #333'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse'
    },
    th: {
        textAlign: 'left',
        padding: '16px',
        backgroundColor: '#0f0f0f',
        color: '#888',
        fontSize: '13px',
        textTransform: 'uppercase',
        borderBottom: '1px solid #333'
    },
    tr: {
        borderBottom: '1px solid #333'
    },
    td: {
        padding: '16px',
        color: '#fff'
    },
    rolBadge: {
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500'
    },
    btnEdit: {
        padding: '8px 12px',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px'
    },
    btnDelete: {
        padding: '8px 12px',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px'
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    modal: {
        backgroundColor: '#1a1a1a',
        borderRadius: '16px',
        padding: '30px',
        width: '100%',
        maxWidth: '450px',
        border: '1px solid #333'
    },
    form: {
        marginTop: '20px'
    },
    formGroup: {
        marginBottom: '16px'
    },
    input: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#0f0f0f',
        border: '1px solid #333',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '14px',
        marginTop: '6px',
        boxSizing: 'border-box'
    },
    modalActions: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        marginTop: '24px'
    },
    btnCancel: {
        padding: '12px 24px',
        backgroundColor: 'transparent',
        border: '1px solid #333',
        color: '#fff',
        borderRadius: '8px',
        cursor: 'pointer'
    }
};

export default Usuarios;
