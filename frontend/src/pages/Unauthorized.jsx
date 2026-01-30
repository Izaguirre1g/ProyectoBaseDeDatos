import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Center,
    VStack,
    Heading,
    Text,
    Link,
    Icon,
} from '@chakra-ui/react';
import { ShieldX, ArrowLeft } from 'lucide-react';

function Unauthorized() {
    return (
        <Center minH="80vh">
            <VStack spacing={6} textAlign="center">
                <Box
                    p={6}
                    borderRadius="full"
                    bg="red.900"
                >
                    <Icon as={ShieldX} boxSize={16} color="red.400" />
                </Box>
                <Heading color="white">Acceso Denegado</Heading>
                <Text color="gray.500">
                    No tienes permisos para acceder a esta pagina.
                </Text>
                <Link
                    as={RouterLink}
                    to="/"
                    color="accent.500"
                    display="flex"
                    alignItems="center"
                    gap={2}
                    _hover={{ color: 'accent.400' }}
                >
                    <ArrowLeft size={16} />
                    Volver al Dashboard
                </Link>
            </VStack>
        </Center>
    );
}

export default Unauthorized;
