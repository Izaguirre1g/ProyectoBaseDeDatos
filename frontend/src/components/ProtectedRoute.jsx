import { Navigate } from 'react-router-dom';
import { Center, Spinner, Text, VStack } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles = [] }) {
    const { usuario, loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <Center h="100vh" bg="brand.900">
                <VStack spacing={4}>
                    <Spinner
                        size="xl"
                        color="accent.500"
                        thickness="4px"
                    />
                    <Text color="gray.400">Verificando sesion...</Text>
                </VStack>
            </Center>
        );
    }

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(usuario.rol)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}

export default ProtectedRoute;
