import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Catalogo from './pages/Catalogo';
import Equipos from './pages/Equipos';
import ArmadoCarro from './pages/ArmadoCarro';
import Simulaciones from './pages/Simulaciones';
import Unauthorized from './pages/Unauthorized';
import './App.css';

// Componente para redirigir si ya está autenticado
function PublicRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return <div style={{ color: '#fff', textAlign: 'center', padding: '50px' }}>Cargando...</div>;
    }
    
    if (isAuthenticated()) {
        return <Navigate to="/" replace />;
    }
    
    return children;
}

function AppRoutes() {
    return (
        <>
            <Navbar />
            <Routes>
                {/* Ruta pública - Login */}
                <Route 
                    path="/login" 
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } 
                />

                {/* Dashboard - todos los autenticados */}
                <Route 
                    path="/" 
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />

                {/* Usuarios - solo Admin */}
                <Route 
                    path="/usuarios" 
                    element={
                        <ProtectedRoute allowedRoles={['Admin']}>
                            <Usuarios />
                        </ProtectedRoute>
                    } 
                />

                {/* Catálogo - Admin y Engineer */}
                <Route 
                    path="/catalogo" 
                    element={
                        <ProtectedRoute allowedRoles={['Admin', 'Engineer']}>
                            <Catalogo />
                        </ProtectedRoute>
                    } 
                />

                {/* Simulaciones - Solo Driver */}
                <Route 
                    path="/simulaciones" 
                    element={
                        <ProtectedRoute allowedRoles={['Driver']}>
                            <Simulaciones />
                        </ProtectedRoute>
                    } 
                />

                {/* Equipos - Admin y Engineer */}
                <Route 
                    path="/equipos" 
                    element={
                        <ProtectedRoute allowedRoles={['Admin', 'Engineer']}>
                            <Equipos />
                        </ProtectedRoute>
                    } 
                />

                {/* Armado de carro individual (desde equipos) */}
                <Route 
                    path="/equipos/:equipoId/carros/:carroId" 
                    element={
                        <ProtectedRoute allowedRoles={['Admin', 'Engineer']}>
                            <ArmadoCarro />
                        </ProtectedRoute>
                    } 
                />

                {/* Página de acceso denegado */}
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Ruta por defecto - redirigir al dashboard o login */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <div style={{ backgroundColor: '#0f0f0f', minHeight: '100vh' }}>
                    <AppRoutes />
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;