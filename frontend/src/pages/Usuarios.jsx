import { useState } from 'react';
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
} from '@chakra-ui/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

/**
 * Vista de gestion de usuarios (Admin)
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

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editingUser, setEditingUser] = useState(null);
    const toast = useToast();

    const handleEdit = (usuario) => {
        setEditingUser(usuario);
        onOpen();
    };

    const handleDelete = (id) => {
        if (confirm('Estas seguro de eliminar este usuario?')) {
            setUsuarios(usuarios.filter(u => u.id !== id));
            toast({
                title: 'Usuario eliminado',
                status: 'success',
                duration: 3000,
            });
        }
    };

    const handleNew = () => {
        setEditingUser(null);
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

    return (
        <Container maxW="container.xl" py={8}>
            <Flex justify="space-between" align="center" mb={6}>
                <Box>
                    <Heading size="lg" color="white">Gestion de Usuarios</Heading>
                    <Text color="gray.400" mt={1}>{usuarios.length} usuarios registrados</Text>
                </Box>
                <Button leftIcon={<Plus size={16} />} onClick={handleNew}>
                    Nuevo Usuario
                </Button>
            </Flex>

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
                                    <Th color="gray.500" borderColor="brand.700">Acciones</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {usuarios.map(usuario => (
                                    <Tr key={usuario.id} _hover={{ bg: 'brand.700' }}>
                                        <Td color="gray.400" borderColor="brand.700">{usuario.id}</Td>
                                        <Td color="white" borderColor="brand.700">{usuario.nombre}</Td>
                                        <Td color="gray.300" borderColor="brand.700">{usuario.email}</Td>
                                        <Td borderColor="brand.700">
                                            <Badge colorScheme={getRolColorScheme(usuario.rol)} variant="subtle">
                                                {usuario.rol}
                                            </Badge>
                                        </Td>
                                        <Td color="gray.400" borderColor="brand.700">{usuario.equipo || '-'}</Td>
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
                                                    onClick={() => handleDelete(usuario.id)}
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

            {/* Modal para crear/editar */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
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
                                    defaultValue={editingUser?.nombre || ''}
                                    placeholder="Nombre completo"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel color="gray.400" fontSize="sm">Email</FormLabel>
                                <Input 
                                    type="email"
                                    defaultValue={editingUser?.email || ''}
                                    placeholder="email@f1.com"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel color="gray.400" fontSize="sm">Contrasena</FormLabel>
                                <Input 
                                    type="password"
                                    placeholder={editingUser ? '(dejar vacio para mantener)' : 'Contrasena'}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel color="gray.400" fontSize="sm">Rol</FormLabel>
                                <Select defaultValue={editingUser?.rol || 'Driver'}>
                                    <option value="Admin">Admin</option>
                                    <option value="Engineer">Engineer</option>
                                    <option value="Driver">Driver</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel color="gray.400" fontSize="sm">Equipo (opcional)</FormLabel>
                                <Select defaultValue={editingUser?.equipo || ''}>
                                    <option value="">Sin equipo</option>
                                    <option value="Ferrari">Ferrari</option>
                                    <option value="Red Bull Racing">Red Bull Racing</option>
                                    <option value="Mercedes">Mercedes</option>
                                    <option value="McLaren">McLaren</option>
                                </Select>
                            </FormControl>
                            <HStack w="full" justify="flex-end" spacing={3} pt={4}>
                                <Button variant="ghost" onClick={onClose}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
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
