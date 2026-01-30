import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardBody,
    Center,
    FormControl,
    FormLabel,
    Heading,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Text,
    VStack,
    Alert,
    AlertIcon,
    Divider,
    HStack,
    Badge,
    IconButton,
} from '@chakra-ui/react';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
        <Center 
            minH="100vh" 
            p={4}
            backgroundImage="url('/images/image2.png')"
            backgroundSize="cover"
            backgroundPosition="center"
            backgroundAttachment="fixed"
            position="relative"
            _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bg: 'rgba(15, 15, 15, 0.7)',
                zIndex: 1
            }}
        >
            <Card maxW="420px" w="full" bg="brand.800" borderColor="brand.600" zIndex={2} position="relative">
                <CardBody p={8}>
                    <VStack spacing={6}>
                        {/* Header */}
                        <VStack spacing={2}>
                            <Heading size="lg" color="white">
                                F1 Database
                            </Heading>
                            <Text color="gray.400" fontSize="sm">
                                Sistema de Gestion de Formula 1
                            </Text>
                        </VStack>

                        {/* Form */}
                        <Box as="form" onSubmit={handleSubmit} w="full">
                            <VStack spacing={4}>
                                <FormControl>
                                    <FormLabel color="gray.400" fontSize="sm">
                                        Email
                                    </FormLabel>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none">
                                            <Mail size={18} color="#718096" />
                                        </InputLeftElement>
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="admin@f1.com"
                                            required
                                            disabled={loading}
                                        />
                                    </InputGroup>
                                </FormControl>

                                <FormControl>
                                    <FormLabel color="gray.400" fontSize="sm">
                                        Contrasena
                                    </FormLabel>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none">
                                            <Lock size={18} color="#718096" />
                                        </InputLeftElement>
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Ingresa tu contraseña"
                                            required
                                            disabled={loading}
                                        />
                                        <InputRightElement>
                                            <IconButton
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowPassword(!showPassword)}
                                                icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
                                            />
                                        </InputRightElement>
                                    </InputGroup>
                                </FormControl>

                                {error && (
                                    <Alert status="error" borderRadius="md" bg="red.900" color="red.200">
                                        <AlertIcon color="red.400" />
                                        {error}
                                    </Alert>
                                )}

                                <Button
                                    type="submit"
                                    w="full"
                                    size="lg"
                                    isLoading={loading}
                                    loadingText="Iniciando sesion..."
                                    mt={2}
                                >
                                    Iniciar Sesion
                                </Button>
                            </VStack>
                        </Box>

                        <Divider borderColor="brand.600" />

                        {/* Test Users */}
                        <Box w="full" p={4} bg="brand.900" borderRadius="md" borderWidth="1px" borderColor="brand.700">
                            <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="600" mb={3}>
                                Usuarios de prueba
                            </Text>
                            <VStack spacing={2} align="stretch">
                                <HStack justify="space-between">
                                    <HStack>
                                        <User size={14} color="#718096" />
                                        <Text fontSize="sm" color="gray.400">admin@f1.com</Text>
                                    </HStack>
                                    <Badge colorScheme="red" variant="subtle">Admin</Badge>
                                </HStack>
                                <HStack justify="space-between">
                                    <HStack>
                                        <User size={14} color="#718096" />
                                        <Text fontSize="sm" color="gray.400">engineer@f1.com</Text>
                                    </HStack>
                                    <Badge colorScheme="blue" variant="subtle">Engineer</Badge>
                                </HStack>
                                <HStack justify="space-between">
                                    <HStack>
                                        <User size={14} color="#718096" />
                                        <Text fontSize="sm" color="gray.400">driver@f1.com</Text>
                                    </HStack>
                                    <Badge colorScheme="green" variant="subtle">Driver</Badge>
                                </HStack>
                            </VStack>
                            <Text fontSize="xs" color="gray.600" textAlign="center" mt={3}>
                                Contrasena: 123456
                            </Text>
                        </Box>

                        {/* Register Link */}
                        <VStack spacing={2} align="center">
                            <Link to="/register">
                                <Button variant="ghost" size="sm" color="red.600" _hover={{ color: 'white' }}>
                                    Regístrate aquí
                                </Button>
                            </Link>
                        </VStack>
                    </VStack>
                </CardBody>
            </Card>
        </Center>
    );
}

export default Login;