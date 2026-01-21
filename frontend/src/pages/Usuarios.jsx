import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Heading,
    Text,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    HStack,
    IconButton,
    Card,
    CardBody,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Select,
    VStack,
    useDisclosure,
    Flex,
    useToast,
    Spinner,
    Center,
} from '@chakra-ui/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { usuariosService } from '../services/usuarios.service';
import { equiposService } from '../services/equipos.service';
import { useAuth } from '../context/AuthContext';

/**
 * Vista de gestion de usuarios (Admin)
 */
function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const { checkAuth, usuario: usuarioActual } = useAuth();
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        rol: 'Driver',
        equipo: '',
        habilidad: ''
    });
    const toast = useToast();

    // Cargar usuarios y equipos al montar el componente
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const usuariosData = await usuariosService.getAll();
            setUsuarios(usuariosData);
            
            // Obtener equipos disponibles para ingenieros
            try {
                const equiposDisponibles = await equiposService.getEquiposDisponibles();
                setEquipos(equiposDisponibles);
            } catch (err) {
                console.warn('No se pudieron obtener equipos disponibles, usando todos:', err);
                // Fallback: si falla, obtener todos los equipos
                const equiposTodos = await equiposService.getAll();
                setEquipos(equiposTodos);
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
            toast({
                title: 'Error al cargar datos',
                description: error.response?.data?.error || 'Error desconocido',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setFormData({
            nombre: '',
            email: '',
            password: '',
            rol: 'Driver',
            equipo: '',
            habilidad: ''
        });
        setEditingUser(null);
        onClose();
    };

    const handleEdit = async (usuario) => {
        setEditingUser(usuario);
        const rolFrontend = mapRolBDtoFrontend(usuario.Rol) || 'Driver';
        
        setFormData({
            nombre: usuario.Nombre || usuario.Nombre_usuario || '',
            email: usuario.Correo_usuario || '',
            password: '',
            rol: rolFrontend,
            equipo: usuario.Equipo || '',
            habilidad: usuario.Habilidad !== null && usuario.Habilidad !== undefined ? usuario.Habilidad.toString() : ''
        });
        
        // Cargar equipos según el rol del usuario
        try {
            if (rolFrontend === 'Engineer') {
                // Ingenieros: solo equipos sin ingeniero asignado + el equipo actual
                let equiposDisponibles = await equiposService.getEquiposDisponibles();
                if (usuario.Equipo) {
                    const yaExiste = equiposDisponibles.some(e => e.Nombre === usuario.Equipo);
                    if (!yaExiste) {
                        equiposDisponibles.push({
                            Id_equipo: usuario.Id_equipo || 0,
                            Nombre: usuario.Equipo
                        });
                    }
                }
                setEquipos(equiposDisponibles);
            } else {
                // Conductores y Admin: todos los equipos
                const todosEquipos = await equiposService.getAll();
                setEquipos(todosEquipos);
            }
        } catch (err) {
            console.warn('Error al cargar equipos:', err);
        }
        
        onOpen();
    };

    const handleNew = async () => {
        setEditingUser(null);
        setFormData({
            nombre: '',
            email: '',
            password: '',
            rol: 'Driver',
            equipo: '',
            habilidad: ''
        });
        
        // Por defecto es Driver, así que cargar todos los equipos
        try {
            const todosEquipos = await equiposService.getAll();
            setEquipos(todosEquipos);
        } catch (err) {
            console.warn('Error al cargar equipos:', err);
        }
        
        onOpen();
    };

    const getRolColorScheme = (rol) => {
        switch (rol) {
            case 'Admin': return 'red';
            case 'Engineer': return 'blue';
            case 'Driver': return 'green';
            default: return 'gray';
        }
    };

    // Mapear nombres de roles de BD al frontend
    const mapRolBDtoFrontend = (rolBD) => {
        const rolMap = {
            'Administrador': 'Admin',
            'Ingeniero': 'Engineer',
            'Conductor': 'Driver',
            'Admin': 'Admin',
            'Engineer': 'Engineer',
            'Driver': 'Driver'
        };
        return rolMap[rolBD] || rolBD;
    };

    // Mapear nombres de roles del frontend a BD
    const mapRolFrontendToBD = (rolFrontend) => {
        const rolMap = {
            'Admin': 'Admin',
            'Engineer': 'Engineer',
            'Driver': 'Driver'
        };
        return rolMap[rolFrontend] || rolFrontend;
    };

    const handleFormChange = async (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Si cambia el rol, actualizar la lista de equipos disponibles
        if (field === 'rol') {
            try {
                if (value === 'Engineer') {
                    // Ingenieros: solo equipos sin ingeniero asignado
                    let equiposDisponibles = await equiposService.getEquiposDisponibles();
                    // Si estamos editando y el usuario ya tiene equipo, agregarlo
                    if (editingUser?.Equipo) {
                        const yaExiste = equiposDisponibles.some(e => e.Nombre === editingUser.Equipo);
                        if (!yaExiste) {
                            equiposDisponibles.push({
                                Id_equipo: editingUser.Id_equipo || 0,
                                Nombre: editingUser.Equipo
                            });
                        }
                    }
                    setEquipos(equiposDisponibles);
                } else {
                    // Conductores y Admin: todos los equipos
                    const todosEquipos = await equiposService.getAll();
                    setEquipos(todosEquipos);
                }
                // Limpiar equipo seleccionado al cambiar rol
                setFormData(prev => ({ ...prev, equipo: '' }));
            } catch (err) {
                console.warn('Error al cargar equipos:', err);
            }
        }
    };

    const handleDelete = async (id) => {
        if (confirm('¿Estás seguro de eliminar este usuario?')) {
            try {
                await usuariosService.delete(id);
                toast({
                    title: 'Usuario eliminado',
                    status: 'success',
                    duration: 3000,
                });
                // Recargar lista de usuarios
                await loadData();
            } catch (error) {
                console.error('Error al eliminar usuario:', error);
                toast({
                    title: 'Error al eliminar usuario',
                    description: error.response?.data?.error || error.message || 'Error desconocido',
                    status: 'error',
                    duration: 5000,
                });
            }
        }
    };

    const handleSubmit = async () => {
        try {
            // Validar campos requeridos
            if (!formData.nombre.trim()) {
                toast({
                    title: 'Error',
                    description: 'El nombre es requerido',
                    status: 'error',
                    duration: 3000,
                });
                return;
            }
            if (!formData.email.trim()) {
                toast({
                    title: 'Error',
                    description: 'El email es requerido',
                    status: 'error',
                    duration: 3000,
                });
                return;
            }

            if (editingUser) {
                // Validar habilidad para conductores
                if (formData.rol === 'Driver' && (formData.habilidad === '' || formData.habilidad === null)) {
                    toast({
                        title: 'Error',
                        description: 'La habilidad es requerida para conductores (0-100)',
                        status: 'error',
                        duration: 3000,
                    });
                    return;
                }
                
                // Actualizar usuario existente
                const updateData = {
                    nombre: formData.nombre,
                    email: formData.email,
                    rol: formData.rol,
                    equipo: formData.equipo && formData.equipo !== '' ? formData.equipo : null,
                    habilidad: formData.habilidad !== '' ? parseInt(formData.habilidad) : null
                };
                
                // Solo enviar password si se proporciona una nueva
                if (formData.password.trim()) {
                    updateData.password = formData.password;
                }

                console.log('Datos a enviar:', updateData);
                console.log('Valor equipo:', formData.equipo, 'Tipo:', typeof formData.equipo);
                await usuariosService.update(editingUser.Id_usuario, updateData);
                toast({
                    title: 'Usuario actualizado',
                    status: 'success',
                    duration: 3000,
                });
                
                // Si se actualizó el usuario actual, refrescar la sesión
                if (usuarioActual?.id === editingUser.Id_usuario) {
                    console.log('Actualizando sesión del usuario actual...');
                    await checkAuth();
                }
                
                // Recargar usuarios
                await loadData();
                onClose();
            } else {
                // Crear nuevo usuario
                if (!formData.password.trim()) {
                    toast({
                        title: 'Error',
                        description: 'La contraseña es requerida para nuevos usuarios',
                        status: 'error',
                        duration: 3000,
                    });
                    return;
                }
                
                // Validar habilidad para conductores
                if (formData.rol === 'Driver' && (formData.habilidad === '' || formData.habilidad === null)) {
                    toast({
                        title: 'Error',
                        description: 'La habilidad es requerida para conductores (0-100)',
                        status: 'error',
                        duration: 3000,
                    });
                    return;
                }

                await usuariosService.create({
                    nombre: formData.nombre,
                    email: formData.email,
                    password: formData.password,
                    rol: formData.rol,
                    equipo: formData.equipo && formData.equipo !== '' ? formData.equipo : null,
                    habilidad: formData.habilidad !== '' ? parseInt(formData.habilidad) : null
                });
                toast({
                    title: 'Usuario creado',
                    status: 'success',
                    duration: 3000,
                });
                
                // Recargar usuarios
                await loadData();
                onClose();
            }
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            toast({
                title: 'Error al guardar usuario',
                description: error.response?.data?.error || error.message || 'Error desconocido',
                status: 'error',
                duration: 5000,
            });
        }
    };

    return (
        <Container maxW="container.xl" py={8}>
            <Flex justify="space-between" align="center" mb={6}>
                <Box>
                    <Heading size="lg" color="white">Gestión de Usuarios</Heading>
                    <Text color="gray.400" mt={1}>{usuarios.length} usuarios registrados</Text>
                </Box>
                <Button leftIcon={<Plus size={16} />} onClick={handleNew}>
                    Nuevo Usuario
                </Button>
            </Flex>

            {loading ? (
                <Center py={20}>
                    <Spinner size="xl" color="red.500" />
                </Center>
            ) : (
                <Card bg="brand.800" borderColor="brand.700">
                    <CardBody p={0}>
                        <Box overflowX="auto">
                            <Table variant="simple">
                                <Thead bg="brand.900">
                                    <Tr>
                                        <Th color="gray.500" borderColor="brand.700">ID</Th>
                                        <Th color="gray.500" borderColor="brand.700">Nombre</Th>
                                        <Th color="gray.500" borderColor="brand.700">Email</Th>
                                        <Th color="gray.500" borderColor="brand.700">Rol</Th>
                                        <Th color="gray.500" borderColor="brand.700">Equipo</Th>
                                        <Th color="gray.500" borderColor="brand.700">Habilidad</Th>
                                        <Th color="gray.500" borderColor="brand.700">Acciones</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {usuarios.map(usuario => (
                                        <Tr key={usuario.Id_usuario} _hover={{ bg: 'brand.700' }}>
                                            <Td color="gray.400" borderColor="brand.700">{usuario.Id_usuario}</Td>
                                            <Td color="white" borderColor="brand.700">{usuario.Nombre || usuario.Nombre_usuario || '-'}</Td>
                                            <Td color="white" borderColor="brand.700">{usuario.Correo_usuario}</Td>
                                            
                                            <Td borderColor="brand.700">
                                                <Badge colorScheme={getRolColorScheme(usuario.Rol)} variant="subtle">
                                                    {usuario.Rol || 'Sin rol'}
                                                </Badge>
                                            </Td>
                                            <Td color="gray.400" borderColor="brand.700">{usuario.Equipo || '-'}</Td>
                                            <Td borderColor="brand.700">
                                                {usuario.Habilidad !== null && usuario.Habilidad !== undefined ? (
                                                    <Badge colorScheme="green">{usuario.Habilidad}</Badge>
                                                ) : (
                                                    <Text color="gray.500">-</Text>
                                                )}
                                            </Td>
                                            <Td borderColor="brand.700">
                                                <HStack spacing={2}>
                                                    <IconButton
                                                        icon={<Pencil size={16} />}
                                                        variant="ghost"
                                                        size="sm"
                                                        aria-label="Editar"
                                                        onClick={() => handleEdit(usuario)}
                                                    />
                                                    <IconButton
                                                        icon={<Trash2 size={16} />}
                                                        variant="ghost"
                                                        size="sm"
                                                        colorScheme="red"
                                                        aria-label="Eliminar"
                                                        onClick={() => handleDelete(usuario.Id_usuario)}
                                                    />
                                                </HStack>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    </CardBody>
                </Card>
            )}

            {/* Modal para crear/editar */}
            <Modal isOpen={isOpen} onClose={handleCloseModal} isCentered>
                <ModalOverlay bg="blackAlpha.800" />
                <ModalContent bg="brand.800" borderColor="brand.700">
                    <ModalHeader color="white">
                        {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel color="gray.400" fontSize="sm">Nombre</FormLabel>
                                <Input 
                                    value={formData.nombre}
                                    onChange={(e) => handleFormChange('nombre', e.target.value)}
                                    placeholder="Nombre completo"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel color="gray.400" fontSize="sm">Email</FormLabel>
                                <Input 
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleFormChange('email', e.target.value)}
                                    placeholder="email@f1.com"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel color="gray.400" fontSize="sm">Contraseña</FormLabel>
                                <Input 
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => handleFormChange('password', e.target.value)}
                                    placeholder={editingUser ? '(dejar vacio para mantener)' : 'Contraseña'}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel color="gray.400" fontSize="sm">Rol</FormLabel>
                                <Select 
                                    value={formData.rol}
                                    onChange={(e) => handleFormChange('rol', e.target.value)}
                                >
                                    <option value="Admin">Administrador</option>
                                    <option value="Engineer">Ingeniero</option>
                                    <option value="Driver">Conductor</option>
                                </Select>
                            </FormControl>
                            <FormControl isRequired={formData.rol === 'Driver'}>
                                <FormLabel color="gray.400" fontSize="sm">
                                    Habilidad (0-100) {formData.rol === 'Driver' && <Text as="span" color="red.400">*</Text>}
                                </FormLabel>
                                <Input 
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.habilidad}
                                    onChange={(e) => handleFormChange('habilidad', e.target.value)}
                                    placeholder={formData.rol === 'Driver' ? 'Requerido para conductores' : 'Opcional'}
                                />
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    {formData.rol === 'Driver' ? 'Obligatorio para conductores' : 'Opcional para otros roles'}
                                </Text>
                            </FormControl>
                            <FormControl>
                                <FormLabel color="gray.400" fontSize="sm">Equipo (opcional)</FormLabel>
                                <Select 
                                    value={formData.equipo}
                                    onChange={(e) => handleFormChange('equipo', e.target.value)}
                                >
                                    <option value="">Sin equipo</option>
                                    {equipos.map(equipo => (
                                        <option key={equipo.Id_equipo} value={equipo.Nombre}>
                                            {equipo.Nombre}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                            <HStack w="full" justify="flex-end" spacing={3} pt={4}>
                                <Button variant="ghost" onClick={handleCloseModal}>
                                    Cancelar
                                </Button>
                                <Button colorScheme="red" onClick={handleSubmit}>
                                    {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                                </Button>
                            </HStack>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Container>
    );
}

export default Usuarios;
