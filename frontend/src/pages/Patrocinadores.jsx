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
    VStack,
    useDisclosure,
    Flex,
    useToast,
    Spinner,
    Center,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    SimpleGrid,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
} from '@chakra-ui/react';
import { Plus, Pencil, Trash2, Users, DollarSign, Building2 } from 'lucide-react';
import patrocinadoresService from '../services/patrocinadores.service';
import { useAuth } from '../context/AuthContext';
import { useRef } from 'react';

/**
 * Vista de gestión de patrocinadores (Solo Admin)
 */
function Patrocinadores() {
    const [patrocinadores, setPatrocinadores] = useState([]);
    const { usuario } = useAuth();
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editingPatrocinador, setEditingPatrocinador] = useState(null);
    const [formData, setFormData] = useState({
        nombre: ''
    });
    const [deleteId, setDeleteId] = useState(null);
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = useRef();
    const toast = useToast();

    // Estadísticas
    const [stats, setStats] = useState({
        totalPatrocinadores: 0,
        totalAportes: 0,
        equiposPatrocinados: 0
    });

    // Verificar si el usuario es Admin
    const isAdmin = usuario?.rol === 'Admin';

    // Cargar patrocinadores al montar el componente
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await patrocinadoresService.getAll();
            setPatrocinadores(data);
            
            // Calcular estadísticas
            const totalAportes = data.reduce((sum, p) => sum + (p.TotalAportes || 0), 0);
            const equiposSet = new Set();
            data.forEach(p => {
                if (p.EquiposPatrocinados > 0) {
                    equiposSet.add(p.Id_patrocinador);
                }
            });
            
            setStats({
                totalPatrocinadores: data.length,
                totalAportes: totalAportes,
                equiposPatrocinados: data.filter(p => p.EquiposPatrocinados > 0).length
            });
        } catch (error) {
            console.error('Error al cargar patrocinadores:', error);
            toast({
                title: 'Error al cargar patrocinadores',
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
        setFormData({ nombre: '' });
        setEditingPatrocinador(null);
        onClose();
    };

    const handleEdit = (patrocinador) => {
        setEditingPatrocinador(patrocinador);
        setFormData({
            nombre: patrocinador.Nombre_patrocinador || ''
        });
        onOpen();
    };

    const handleNew = () => {
        setEditingPatrocinador(null);
        setFormData({ nombre: '' });
        onOpen();
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        onDeleteOpen();
    };

    const handleDeleteConfirm = async () => {
        if (deleteId) {
            try {
                await patrocinadoresService.delete(deleteId);
                toast({
                    title: 'Patrocinador eliminado',
                    status: 'success',
                    duration: 3000,
                });
                await loadData();
            } catch (error) {
                console.error('Error al eliminar patrocinador:', error);
                toast({
                    title: 'Error al eliminar patrocinador',
                    description: error.response?.data?.error || error.message || 'Error desconocido',
                    status: 'error',
                    duration: 5000,
                });
            }
        }
        onDeleteClose();
        setDeleteId(null);
    };

    const handleSubmit = async () => {
        try {
            // Validar campos requeridos
            if (!formData.nombre.trim()) {
                toast({
                    title: 'Error',
                    description: 'El nombre del patrocinador es requerido',
                    status: 'error',
                    duration: 3000,
                });
                return;
            }

            if (editingPatrocinador) {
                // Actualizar patrocinador existente
                await patrocinadoresService.update(editingPatrocinador.Id_patrocinador, {
                    nombre: formData.nombre.trim()
                });
                toast({
                    title: 'Patrocinador actualizado',
                    status: 'success',
                    duration: 3000,
                });
            } else {
                // Crear nuevo patrocinador
                await patrocinadoresService.create({
                    nombre: formData.nombre.trim()
                });
                toast({
                    title: 'Patrocinador creado',
                    status: 'success',
                    duration: 3000,
                });
            }
            
            await loadData();
            handleCloseModal();
        } catch (error) {
            console.error('Error al guardar patrocinador:', error);
            toast({
                title: 'Error al guardar patrocinador',
                description: error.response?.data?.error || error.message || 'Error desconocido',
                status: 'error',
                duration: 5000,
            });
        }
    };

    // Formatear
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CR', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <Container maxW="container.xl" py={8}>
            {/* Header */}
            <Flex justify="space-between" align="center" mb={6}>
                <Box>
                    <Heading size="lg" color="white">Gestión de Patrocinadores</Heading>
                    <Text color="gray.400" mt={1}>
                        {patrocinadores.length} patrocinadores registrados
                    </Text>
                </Box>
                {isAdmin && (
                    <Button leftIcon={<Plus size={16} />} colorScheme="red" onClick={handleNew}>
                        Nuevo Patrocinador
                    </Button>
                )}
            </Flex>

            {/* Estadísticas */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
                <Card bg="brand.800" borderColor="brand.700">
                    <CardBody>
                        <Stat>
                            <StatLabel color="gray.400">
                                <HStack>
                                    <Building2 size={16} />
                                    <Text>Total Patrocinadores</Text>
                                </HStack>
                            </StatLabel>
                            <StatNumber color="white" fontSize="2xl">
                                {stats.totalPatrocinadores}
                            </StatNumber>
                            <StatHelpText color="gray.500">
                                Patrocinadores registrados
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card bg="brand.800" borderColor="brand.700">
                    <CardBody>
                        <Stat>
                            <StatLabel color="gray.400">
                                <HStack>
                                    <DollarSign size={16} />
                                    <Text>Total en Aportes</Text>
                                </HStack>
                            </StatLabel>
                            <StatNumber color="green.400" fontSize="2xl">
                                {formatCurrency(stats.totalAportes)}
                            </StatNumber>
                            <StatHelpText color="gray.500">
                                Suma de todos los aportes
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card bg="brand.800" borderColor="brand.700">
                    <CardBody>
                        <Stat>
                            <StatLabel color="gray.400">
                                <HStack>
                                    <Users size={16} />
                                    <Text>Patrocinadores Activos</Text>
                                </HStack>
                            </StatLabel>
                            <StatNumber color="blue.400" fontSize="2xl">
                                {stats.equiposPatrocinados}
                            </StatNumber>
                            <StatHelpText color="gray.500">
                                Con aportes a equipos
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Tabla de patrocinadores */}
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
                                        <Th color="gray.500" borderColor="brand.700">Total Aportes</Th>
                                        <Th color="gray.500" borderColor="brand.700">Equipos</Th>
                                        {isAdmin && (
                                            <Th color="gray.500" borderColor="brand.700">Acciones</Th>
                                        )}
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {patrocinadores.length === 0 ? (
                                        <Tr>
                                            <Td colSpan={isAdmin ? 5 : 4} textAlign="center" py={8}>
                                                <Text color="gray.500">No hay patrocinadores registrados</Text>
                                            </Td>
                                        </Tr>
                                    ) : (
                                        patrocinadores.map(patrocinador => (
                                            <Tr key={patrocinador.Id_patrocinador} _hover={{ bg: 'brand.700' }}>
                                                <Td color="gray.400" borderColor="brand.700">
                                                    {patrocinador.Id_patrocinador}
                                                </Td>
                                                <Td color="white" borderColor="brand.700" fontWeight="medium">
                                                    {patrocinador.Nombre_patrocinador}
                                                </Td>
                                                <Td borderColor="brand.700">
                                                    <Text color="green.400" fontWeight="medium">
                                                        {formatCurrency(patrocinador.TotalAportes || 0)}
                                                    </Text>
                                                </Td>
                                                <Td borderColor="brand.700">
                                                    <Badge 
                                                        colorScheme={patrocinador.EquiposPatrocinados > 0 ? 'blue' : 'gray'}
                                                        variant="subtle"
                                                    >
                                                        {patrocinador.EquiposPatrocinados || 0} equipos
                                                    </Badge>
                                                </Td>
                                                {isAdmin && (
                                                    <Td borderColor="brand.700">
                                                        <HStack spacing={2}>
                                                            <IconButton
                                                                icon={<Pencil size={16} />}
                                                                variant="ghost"
                                                                size="sm"
                                                                aria-label="Editar"
                                                                onClick={() => handleEdit(patrocinador)}
                                                            />
                                                            <IconButton
                                                                icon={<Trash2 size={16} />}
                                                                variant="ghost"
                                                                size="sm"
                                                                colorScheme="red"
                                                                aria-label="Eliminar"
                                                                onClick={() => handleDeleteClick(patrocinador.Id_patrocinador)}
                                                            />
                                                        </HStack>
                                                    </Td>
                                                )}
                                            </Tr>
                                        ))
                                    )}
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
                        {editingPatrocinador ? 'Editar Patrocinador' : 'Nuevo Patrocinador'}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel color="gray.400" fontSize="sm">
                                    Nombre del Patrocinador
                                </FormLabel>
                                <Input 
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ nombre: e.target.value })}
                                    placeholder="Ej: Red Bull, Ferrari, Mercedes..."
                                    bg="brand.900"
                                    borderColor="brand.600"
                                    _hover={{ borderColor: 'brand.500' }}
                                    _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px var(--chakra-colors-red-500)' }}
                                />
                            </FormControl>
                            
                            <HStack w="full" justify="flex-end" spacing={3} pt={4}>
                                <Button variant="ghost" onClick={handleCloseModal}>
                                    Cancelar
                                </Button>
                                <Button colorScheme="red" onClick={handleSubmit}>
                                    {editingPatrocinador ? 'Guardar Cambios' : 'Crear Patrocinador'}
                                </Button>
                            </HStack>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Diálogo de confirmación para eliminar */}
            <AlertDialog
                isOpen={isDeleteOpen}
                leastDestructiveRef={cancelRef}
                onClose={onDeleteClose}
                isCentered
            >
                <AlertDialogOverlay bg="blackAlpha.800">
                    <AlertDialogContent bg="brand.800" borderColor="brand.700">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold" color="white">
                            Eliminar Patrocinador
                        </AlertDialogHeader>

                        <AlertDialogBody color="gray.300">
                            ¿Estás seguro de que deseas eliminar este patrocinador? 
                            Esta acción no se puede deshacer.
                            <Text mt={2} color="yellow.400" fontSize="sm">
                                Nota: No se puede eliminar si tiene aportes registrados.
                            </Text>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} variant="ghost" onClick={onDeleteClose}>
                                Cancelar
                            </Button>
                            <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                                Eliminar
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Container>
    );
}

export default Patrocinadores;
