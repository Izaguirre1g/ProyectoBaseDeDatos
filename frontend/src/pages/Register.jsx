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
    Select,
    IconButton,
} from '@chakra-ui/react';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth.service';

function Register() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [rol, setRol] = useState('Driver');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Validar campos
        if (!nombre.trim()) {
            setError('El nombre es requerido');
            setLoading(false);
            return;
        }

        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
            setError('El nombre solo puede contener letras');
            setLoading(false);
            return;
        }

        if (!email.trim()) {
            setError('El email es requerido');
            setLoading(false);
            return;
        }

        if (!email.includes('@') || !email.includes('.com')) {
            setError('El correo debe contener @ y .com');
            setLoading(false);
            return;
        }

        if (!password) {
            setError('La contraseña es requerida');
            setLoading(false);
            return;
        }

        if (!confirmPassword) {
            setError('Debes confirmar la contraseña');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setLoading(false);
            return;
        }

        try {
            const result = await authService.register({
                nombre,
                email,
                password,
                rol
            });

            if (result.success) {
                setSuccess('Registro exitoso');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(result.error || 'Error al registrar');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Error al registrar el usuario';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
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
            <Card maxW="420px" w="full" bg="brand.800" borderColor="brand.600" zIndex={2} position="relative" maxH="90vh" overflowY="off">
                <CardBody p={10}>
                    <VStack spacing={3}>
                        {/* Header */}
                        <VStack spacing={1}>
                            <Heading size="lg" color="white">
                                Registro de Usuario
                            </Heading>
                            <Text color="gray.400" fontSize="sm">
                                F1 Database
                            </Text>
                        </VStack>

                        {/* Form */}
                        <Box as="form" onSubmit={handleSubmit} w="full">
                            <VStack spacing={2}>
                                <FormControl>
                                    <FormLabel color="gray.400" fontSize="sm">
                                        Nombre Completo
                                    </FormLabel>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none">
                                            <User size={18} color="#718096" />
                                        </InputLeftElement>
                                        <Input
                                            type="text"
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            placeholder="Juan Perez"
                                            required
                                            disabled={loading}
                                        />
                                    </InputGroup>
                                </FormControl>

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
                                            placeholder="usuario@f1.com"
                                            required
                                            disabled={loading}
                                        />
                                    </InputGroup>
                                </FormControl>

                                <FormControl>
                                    <FormLabel color="gray.400" fontSize="sm">
                                        Contraseña
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

                                <FormControl>
                                    <FormLabel color="gray.400" fontSize="sm">
                                        Confirmar Contraseña
                                    </FormLabel>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none">
                                            <Lock size={18} color="#718096" />
                                        </InputLeftElement>
                                        <Input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirma tu contraseña"
                                            required
                                            disabled={loading}
                                        />
                                        <InputRightElement>
                                            <IconButton
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                icon={showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                aria-label={showConfirmPassword ? 'Ocultar' : 'Mostrar'}
                                            />
                                        </InputRightElement>
                                    </InputGroup>
                                </FormControl>

                                <FormControl>
                                    <FormLabel color="#718096" fontSize="sm">
                                        Rol
                                    </FormLabel>
                                    <Select
                                        value={rol}
                                        onChange={(e) => setRol(e.target.value)}
                                        disabled={loading}
                                        bg="brand.800"
                                        borderColor="brand.600"
                                        color="white"
                                        _hover={{ borderColor: 'brand.700' }}
                                        _focus={{ borderColor: 'brand.700', boxShadow: 'brand.700' }}
                                    >
                                        <option value="Administrador" style={{ color: 'white', backgroundColor: '#2c2e30ff' }}>
                                            Administrador
                                        </option>
                                        <option value="Conductor" style={{ color: 'white', backgroundColor: '#2c2e30ff' }}>
                                            Conductor
                                        </option>
                                        <option value="Ingeniero" style={{ color: 'white', backgroundColor: '#2c2e30ff' }}>
                                            Ingeniero
                                        </option>
                                    </Select>
                                </FormControl>

                                {error && (
                                    <Alert status="error" borderRadius="md" bg="red.900" color="red.200">
                                        <AlertIcon color="red.400" />
                                        {error}
                                    </Alert>
                                )}

                                {success && (
                                    <Alert status="success" borderRadius="md" bg="green.900" color="green.200">
                                        <AlertIcon color="green.400" />
                                        {success}
                                    </Alert>
                                )}

                                <Button
                                    type="submit"
                                    w="full"
                                    size="lg"
                                    isLoading={loading}
                                    loadingText="Registrando..."
                                    mt={2}
                                >
                                    Registrarse
                                </Button>
                            </VStack>
                        </Box>

                        <Divider borderColor="brand.600" />

                        {/* Login Link */}
                        <VStack spacing={1.5} align="center">
                            <Link to="/login">
                                <Button variant="ghost" size="sm" color="red.600" _hover={{ color: 'white' }}>
                                    Regresar al inicio de sesión
                                </Button>
                            </Link>
                        </VStack>
                    </VStack>
                </CardBody>
            </Card>
        </Center>
    );
}

export default Register;
