import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Box,
    Container,
    Heading,
    Text,
    SimpleGrid,
    Card,
    CardBody,
    VStack,
    HStack,
    Badge,
    Spinner,
    Center,
    Icon,
    Avatar,
    Divider,
    Progress,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Button,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    useDisclosure,
    FormControl,
    FormLabel,
    Input,
    Select,
} from '@chakra-ui/react';
import {
    Building2,
    DollarSign,
    Users,
    Car,
    Package,
    Trophy,
    Wrench,
    Flag,
    TrendingUp,
    Megaphone,
    ChevronRight,
    Plus,
} from 'lucide-react';
import { equiposService } from '../services/equipos.service';

// Componente para mostrar estadísticas
function StatCard({ icon, label, value, subtext, color = 'accent.500' }) {
    return (
        <Card bg="brand.800" borderColor="brand.700" borderWidth="1px">
            <CardBody>
                <HStack spacing={4}>
                    <Box p={3} bg={`${color}20`} borderRadius="lg">
                        <Icon as={icon} boxSize={6} color={color} />
                    </Box>
                    <Stat>
                        <StatLabel color="gray.400">{label}</StatLabel>
                        <StatNumber fontSize="2xl">{value}</StatNumber>
                        {subtext && <StatHelpText color="gray.500">{subtext}</StatHelpText>}
                    </Stat>
                </HStack>
            </CardBody>
        </Card>
    );
}

// Componente para tarjeta de conductor
function PilotoCard({ piloto }) {
    return (
        <Card bg="brand.800" borderColor="brand.700" borderWidth="1px">
            <CardBody>
                <HStack spacing={4}>
                    <Avatar 
                        size="lg" 
                        name={piloto.nombre} 
                        bg={piloto.numero % 2 === 0 ? 'red.500' : 'blue.500'}
                    />
                    <VStack align="start" spacing={1} flex={1}>
                        <HStack>
                            <Text fontWeight="bold" fontSize="lg">{piloto.nombre}</Text>
                            <Badge colorScheme="purple" fontSize="sm">#{piloto.numero}</Badge>
                        </HStack>
                        <Text color="gray.400" fontSize="sm">{piloto.nacionalidad}</Text>
                        <HStack spacing={4} mt={2}>
                            <HStack>
                                <Icon as={Trophy} boxSize={4} color="yellow.400" />
                                <Text fontSize="sm">{piloto.campeonatos} títulos</Text>
                            </HStack>
                            <HStack>
                                <Icon as={Flag} boxSize={4} color="green.400" />
                                <Text fontSize="sm">{piloto.victorias} victorias</Text>
                            </HStack>
                        </HStack>
                    </VStack>
                </HStack>
            </CardBody>
        </Card>
    );
}

// Componente para tarjeta de carro
function CarroCard({ carro, onClick }) {
    const completitud = Object.values(carro.configuracion || {}).filter(Boolean).length;
    const total = 5;
    const porcentaje = (completitud / total) * 100;

    return (
        <Card 
            bg="brand.800" 
            borderColor="brand.700" 
            borderWidth="1px"
            cursor="pointer"
            _hover={{ borderColor: 'accent.500', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
            onClick={onClick}
        >
            <CardBody>
                <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between">
                        <HStack>
                            <Icon as={Car} boxSize={5} color="accent.500" />
                            <Text fontWeight="bold">{carro.nombre}</Text>
                        </HStack>
                        <Badge colorScheme={porcentaje === 100 ? 'green' : 'orange'}>
                            {completitud}/{total} partes
                        </Badge>
                    </HStack>
                    <Progress 
                        value={porcentaje} 
                        colorScheme={porcentaje === 100 ? 'green' : 'orange'}
                        size="sm"
                        borderRadius="full"
                    />
                    <HStack justify="space-between" fontSize="sm" color="gray.400">
                        <Text>Piloto: {carro.piloto || 'Sin asignar'}</Text>
                        <HStack>
                            <Text>Configurar</Text>
                            <Icon as={ChevronRight} boxSize={4} />
                        </HStack>
                    </HStack>
                </VStack>
            </CardBody>
        </Card>
    );
}

// Componente para tarjeta de patrocinador
function PatrocinadorCard({ patrocinador }) {
    return (
        <Card bg="brand.800" borderColor="brand.700" borderWidth="1px">
            <CardBody>
                <HStack spacing={4}>
                    <Box 
                        p={3} 
                        bg="brand.700" 
                        borderRadius="lg"
                        minW="60px"
                        textAlign="center"
                    >
                        <Text fontSize="xl" fontWeight="bold" color="accent.400">
                            {patrocinador.nombre.substring(0, 2).toUpperCase()}
                        </Text>
                    </Box>
                    <VStack align="start" spacing={1} flex={1}>
                        <Text fontWeight="bold">{patrocinador.nombre}</Text>
                        <Text color="gray.400" fontSize="sm">{patrocinador.tipo}</Text>
                    </VStack>
                    <VStack align="end" spacing={0}>
                        <Text fontWeight="bold" color="green.400">
                            ${(patrocinador.aporte / 1000000).toFixed(1)}M
                        </Text>
                        <Text fontSize="xs" color="gray.500">por temporada</Text>
                    </VStack>
                </HStack>
            </CardBody>
        </Card>
    );
}

function Equipos() {
    const [equipos, setEquipos] = useState([]);
    const [selectedEquipo, setSelectedEquipo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tabIndex, setTabIndex] = useState(0);
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { usuario, isEngineer } = useAuth();
    
    // Los ingenieros solo pueden ver su equipo asignado (Ferrari id: 2)
    const esIngeniero = isEngineer();
    const equipoAsignadoId = 2; // Ferrari
    
    // Estado para nuevo equipo
    const [nuevoEquipo, setNuevoEquipo] = useState({
        nombre: '',
        nombreCompleto: '',
        pais: '',
        colorPrimario: '#e10600',
        presupuesto: 100000000
    });

    useEffect(() => {
        loadEquipos();
    }, []);

    const loadEquipos = async () => {
        try {
            setLoading(true);
            let data = await equiposService.getAll();
            
            // Si es ingeniero, filtrar solo su equipo asignado
            if (esIngeniero) {
                data = data.filter(e => e.id === equipoAsignadoId);
            }
            
            setEquipos(data);
            if (data.length > 0) {
                setSelectedEquipo(data[0]);
            }
        } catch (error) {
            toast({
                title: 'Error al cargar equipos',
                description: error.message,
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCarroClick = (carroId) => {
        navigate(`/equipos/${selectedEquipo.id}/carros/${carroId}`);
    };

    const handleCrearEquipo = () => {
        // Simular creación (en producción sería una llamada al backend)
        const nuevoId = equipos.length + 1;
        const equipoCreado = {
            id: nuevoId,
            ...nuevoEquipo,
            fundacion: new Date().getFullYear(),
            campeonatos: 0,
            presupuesto: {
                total: nuevoEquipo.presupuesto,
                gastado: 0,
                sponsors: 0,
                distribucion: []
            },
            pilotos: [],
            carros: [],
            inventario: [],
            patrocinadores: []
        };
        
        setEquipos([...equipos, equipoCreado]);
        setSelectedEquipo(equipoCreado);
        setNuevoEquipo({
            nombre: '',
            nombreCompleto: '',
            pais: '',
            colorPrimario: '#e10600',
            presupuesto: 100000000
        });
        onClose();
        
        toast({
            title: 'Equipo creado',
            description: `${equipoCreado.nombre} ha sido registrado exitosamente`,
            status: 'success',
            duration: 3000,
        });
    };

    if (loading) {
        return (
            <Center h="60vh">
                <Spinner size="xl" color="accent.500" />
            </Center>
        );
    }

    return (
        <Container maxW="1400px" py={8}>
            {/* Header con selector de equipo */}
            <VStack spacing={6} align="stretch">
                <HStack justify="space-between" align="start">
                    <Box>
                        <Heading size="lg" mb={2}>
                            <Icon as={Building2} mr={3} />
                            {esIngeniero ? 'Mi Equipo' : 'Gestión de Equipos'}
                        </Heading>
                        <Text color="gray.400">
                            {esIngeniero 
                                ? 'Gestiona presupuesto, pilotos y vehículos de tu equipo'
                                : 'Administra equipos, presupuestos, pilotos y vehículos'
                            }
                        </Text>
                    </Box>
                    {!esIngeniero && (
                        <Button
                            leftIcon={<Plus size={18} />}
                            colorScheme="red"
                            onClick={onOpen}
                        >
                            Nuevo Equipo
                        </Button>
                    )}
                </HStack>

                {/* Lista de equipos */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                    {equipos.map((equipo) => (
                        <Card
                            key={equipo.id}
                            bg={selectedEquipo?.id === equipo.id ? 'accent.900' : 'brand.800'}
                            borderColor={selectedEquipo?.id === equipo.id ? 'accent.500' : 'brand.700'}
                            borderWidth="2px"
                            cursor="pointer"
                            onClick={() => setSelectedEquipo(equipo)}
                            _hover={{ borderColor: 'accent.400' }}
                            transition="all 0.2s"
                        >
                            <CardBody py={3}>
                                <HStack>
                                    <Box
                                        w="4px"
                                        h="40px"
                                        bg={equipo.colorPrimario}
                                        borderRadius="full"
                                    />
                                    <VStack align="start" spacing={0}>
                                        <Text fontWeight="bold">{equipo.nombre}</Text>
                                        <Text fontSize="sm" color="gray.400">{equipo.pais}</Text>
                                    </VStack>
                                </HStack>
                            </CardBody>
                        </Card>
                    ))}
                </SimpleGrid>

                {/* Contenido del equipo seleccionado */}
                {selectedEquipo && (
                    <Card bg="brand.800" borderColor="brand.700" borderWidth="1px">
                        <CardBody>
                            {/* Header del equipo */}
                            <HStack spacing={4} mb={6}>
                                <Box
                                    w="60px"
                                    h="60px"
                                    bg={selectedEquipo.colorPrimario}
                                    borderRadius="lg"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Text fontSize="2xl" fontWeight="bold" color="white">
                                        {selectedEquipo.nombre.substring(0, 2).toUpperCase()}
                                    </Text>
                                </Box>
                                <VStack align="start" spacing={0}>
                                    <Heading size="md">{selectedEquipo.nombre}</Heading>
                                    <Text color="gray.400">{selectedEquipo.nombreCompleto}</Text>
                                </VStack>
                                <Box flex={1} />
                                <VStack align="end" spacing={0}>
                                    <HStack>
                                        <Icon as={Trophy} color="yellow.400" />
                                        <Text fontWeight="bold">{selectedEquipo.campeonatos} Campeonatos</Text>
                                    </HStack>
                                    <Text fontSize="sm" color="gray.400">
                                        Fundado en {selectedEquipo.fundacion}
                                    </Text>
                                </VStack>
                            </HStack>

                            <Divider borderColor="brand.600" mb={6} />

                            {/* Tabs de contenido */}
                            <Tabs 
                                index={tabIndex} 
                                onChange={setTabIndex}
                                colorScheme="red"
                                variant="soft-rounded"
                            >
                                <TabList mb={6} flexWrap="wrap" gap={2}>
                                    <Tab _selected={{ bg: 'accent.600', color: 'white' }}>
                                        <Icon as={DollarSign} mr={2} /> Presupuesto
                                    </Tab>
                                    <Tab _selected={{ bg: 'accent.600', color: 'white' }}>
                                        <Icon as={Users} mr={2} /> Pilotos
                                    </Tab>
                                    <Tab _selected={{ bg: 'accent.600', color: 'white' }}>
                                        <Icon as={Car} mr={2} /> Carros
                                    </Tab>
                                    <Tab _selected={{ bg: 'accent.600', color: 'white' }}>
                                        <Icon as={Package} mr={2} /> Inventario
                                    </Tab>
                                    <Tab _selected={{ bg: 'accent.600', color: 'white' }}>
                                        <Icon as={Megaphone} mr={2} /> Patrocinadores
                                    </Tab>
                                </TabList>

                                <TabPanels>
                                    {/* Tab Presupuesto */}
                                    <TabPanel p={0}>
                                        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
                                            <StatCard
                                                icon={DollarSign}
                                                label="Presupuesto Total"
                                                value={`$${(selectedEquipo.presupuesto?.total / 1000000).toFixed(0)}M`}
                                                subtext="Temporada 2026"
                                                color="green.400"
                                            />
                                            <StatCard
                                                icon={TrendingUp}
                                                label="Gastado"
                                                value={`$${(selectedEquipo.presupuesto?.gastado / 1000000).toFixed(0)}M`}
                                                subtext={`${((selectedEquipo.presupuesto?.gastado / selectedEquipo.presupuesto?.total) * 100).toFixed(0)}% del total`}
                                                color="orange.400"
                                            />
                                            <StatCard
                                                icon={DollarSign}
                                                label="Disponible"
                                                value={`$${((selectedEquipo.presupuesto?.total - selectedEquipo.presupuesto?.gastado) / 1000000).toFixed(0)}M`}
                                                subtext="Para desarrollo"
                                                color="blue.400"
                                            />
                                            <StatCard
                                                icon={Megaphone}
                                                label="Ingresos Sponsors"
                                                value={`$${(selectedEquipo.presupuesto?.sponsors / 1000000).toFixed(0)}M`}
                                                subtext={`${selectedEquipo.patrocinadores?.length || 0} patrocinadores`}
                                                color="purple.400"
                                            />
                                        </SimpleGrid>

                                        <Card bg="brand.700" borderColor="brand.600">
                                            <CardBody>
                                                <Text fontWeight="bold" mb={4}>Distribución del Presupuesto</Text>
                                                <VStack spacing={3} align="stretch">
                                                    {selectedEquipo.presupuesto?.distribucion?.map((item, idx) => (
                                                        <Box key={idx}>
                                                            <HStack justify="space-between" mb={1}>
                                                                <Text fontSize="sm">{item.categoria}</Text>
                                                                <Text fontSize="sm" color="gray.400">
                                                                    ${(item.monto / 1000000).toFixed(1)}M ({item.porcentaje}%)
                                                                </Text>
                                                            </HStack>
                                                            <Progress 
                                                                value={item.porcentaje} 
                                                                colorScheme={
                                                                    item.categoria === 'Power Unit' ? 'red' :
                                                                    item.categoria === 'Aerodinámica' ? 'blue' :
                                                                    item.categoria === 'Personal' ? 'green' : 'purple'
                                                                }
                                                                size="sm"
                                                                borderRadius="full"
                                                            />
                                                        </Box>
                                                    ))}
                                                </VStack>
                                            </CardBody>
                                        </Card>
                                    </TabPanel>

                                    {/* Tab Pilotos */}
                                    <TabPanel p={0}>
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                            {selectedEquipo.pilotos?.map((piloto) => (
                                                <PilotoCard key={piloto.id} piloto={piloto} />
                                            ))}
                                        </SimpleGrid>
                                    </TabPanel>

                                    {/* Tab Carros */}
                                    <TabPanel p={0}>
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                            {selectedEquipo.carros?.map((carro) => (
                                                <CarroCard 
                                                    key={carro.id} 
                                                    carro={carro}
                                                    onClick={() => handleCarroClick(carro.id)}
                                                />
                                            ))}
                                        </SimpleGrid>
                                    </TabPanel>

                                    {/* Tab Inventario */}
                                    <TabPanel p={0}>
                                        <Card bg="brand.700" borderColor="brand.600">
                                            <CardBody p={0}>
                                                <Table variant="simple" size="sm">
                                                    <Thead>
                                                        <Tr>
                                                            <Th color="gray.400">Parte</Th>
                                                            <Th color="gray.400">Categoría</Th>
                                                            <Th color="gray.400" isNumeric>Cantidad</Th>
                                                            <Th color="gray.400" isNumeric>Valor Unit.</Th>
                                                            <Th color="gray.400">Estado</Th>
                                                        </Tr>
                                                    </Thead>
                                                    <Tbody>
                                                        {selectedEquipo.inventario?.map((item, idx) => (
                                                            <Tr key={idx} _hover={{ bg: 'brand.600' }}>
                                                                <Td fontWeight="medium">{item.nombre}</Td>
                                                                <Td>
                                                                    <Badge colorScheme={
                                                                        item.categoria === 'Power Unit' ? 'red' :
                                                                        item.categoria === 'Aerodinámica' ? 'blue' :
                                                                        item.categoria === 'Neumáticos' ? 'gray' : 'purple'
                                                                    }>
                                                                        {item.categoria}
                                                                    </Badge>
                                                                </Td>
                                                                <Td isNumeric>{item.cantidad}</Td>
                                                                <Td isNumeric>${(item.precio / 1000).toFixed(0)}K</Td>
                                                                <Td>
                                                                    <Badge colorScheme={
                                                                        item.cantidad > 3 ? 'green' :
                                                                        item.cantidad > 1 ? 'yellow' : 'red'
                                                                    }>
                                                                        {item.cantidad > 3 ? 'Stock OK' :
                                                                         item.cantidad > 1 ? 'Stock Bajo' : 'Crítico'}
                                                                    </Badge>
                                                                </Td>
                                                            </Tr>
                                                        ))}
                                                    </Tbody>
                                                </Table>
                                            </CardBody>
                                        </Card>
                                    </TabPanel>

                                    {/* Tab Patrocinadores */}
                                    <TabPanel p={0}>
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                            {selectedEquipo.patrocinadores?.map((patrocinador) => (
                                                <PatrocinadorCard 
                                                    key={patrocinador.id} 
                                                    patrocinador={patrocinador}
                                                />
                                            ))}
                                        </SimpleGrid>
                                        <Card bg="brand.700" mt={4}>
                                            <CardBody>
                                                <HStack justify="space-between">
                                                    <Text fontWeight="bold">Total Ingresos por Patrocinio</Text>
                                                    <Text fontSize="xl" fontWeight="bold" color="green.400">
                                                        ${(selectedEquipo.patrocinadores?.reduce((acc, p) => acc + p.aporte, 0) / 1000000).toFixed(1)}M
                                                    </Text>
                                                </HStack>
                                            </CardBody>
                                        </Card>
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        </CardBody>
                    </Card>
                )}
            </VStack>

            {/* Modal para crear nuevo equipo */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
                <ModalOverlay bg="blackAlpha.800" />
                <ModalContent bg="brand.800" borderColor="brand.700">
                    <ModalHeader color="white">
                        <HStack>
                            <Icon as={Building2} />
                            <Text>Registrar Nuevo Equipo</Text>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel color="gray.300">Nombre del Equipo</FormLabel>
                                <Input
                                    placeholder="Ej: Red Bull Racing"
                                    value={nuevoEquipo.nombre}
                                    onChange={(e) => setNuevoEquipo({...nuevoEquipo, nombre: e.target.value})}
                                    bg="brand.900"
                                    borderColor="brand.700"
                                    _focus={{ borderColor: 'accent.500' }}
                                />
                            </FormControl>
                            
                            <FormControl isRequired>
                                <FormLabel color="gray.300">Nombre Completo</FormLabel>
                                <Input
                                    placeholder="Ej: Oracle Red Bull Racing"
                                    value={nuevoEquipo.nombreCompleto}
                                    onChange={(e) => setNuevoEquipo({...nuevoEquipo, nombreCompleto: e.target.value})}
                                    bg="brand.900"
                                    borderColor="brand.700"
                                    _focus={{ borderColor: 'accent.500' }}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel color="gray.300">País</FormLabel>
                                <Select
                                    placeholder="Seleccionar país"
                                    value={nuevoEquipo.pais}
                                    onChange={(e) => setNuevoEquipo({...nuevoEquipo, pais: e.target.value})}
                                    bg="brand.900"
                                    borderColor="brand.700"
                                    _focus={{ borderColor: 'accent.500' }}
                                >
                                    <option value="Reino Unido">Reino Unido</option>
                                    <option value="Italia">Italia</option>
                                    <option value="Alemania">Alemania</option>
                                    <option value="Austria">Austria</option>
                                    <option value="Francia">Francia</option>
                                    <option value="Estados Unidos">Estados Unidos</option>
                                    <option value="Suiza">Suiza</option>
                                </Select>
                            </FormControl>

                            <HStack w="full" spacing={4}>
                                <FormControl>
                                    <FormLabel color="gray.300">Color del Equipo</FormLabel>
                                    <Input
                                        type="color"
                                        value={nuevoEquipo.colorPrimario}
                                        onChange={(e) => setNuevoEquipo({...nuevoEquipo, colorPrimario: e.target.value})}
                                        bg="brand.900"
                                        borderColor="brand.700"
                                        h="50px"
                                        p={1}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel color="gray.300">Presupuesto Inicial</FormLabel>
                                    <Select
                                        value={nuevoEquipo.presupuesto}
                                        onChange={(e) => setNuevoEquipo({...nuevoEquipo, presupuesto: parseInt(e.target.value)})}
                                        bg="brand.900"
                                        borderColor="brand.700"
                                        _focus={{ borderColor: 'accent.500' }}
                                    >
                                        <option value={80000000}>$80M - Equipo Pequeño</option>
                                        <option value={100000000}>$100M - Equipo Mediano</option>
                                        <option value={120000000}>$120M - Equipo Grande</option>
                                        <option value={145000000}>$145M - Equipo Top</option>
                                    </Select>
                                </FormControl>
                            </HStack>

                            {/* Preview */}
                            {nuevoEquipo.nombre && (
                                <Card bg="brand.900" w="full" mt={2}>
                                    <CardBody py={3}>
                                        <HStack>
                                            <Box
                                                w="4px"
                                                h="40px"
                                                bg={nuevoEquipo.colorPrimario}
                                                borderRadius="full"
                                            />
                                            <VStack align="start" spacing={0}>
                                                <Text fontWeight="bold" color="white">{nuevoEquipo.nombre || 'Nombre del Equipo'}</Text>
                                                <Text fontSize="sm" color="gray.400">{nuevoEquipo.pais || 'País'}</Text>
                                            </VStack>
                                            <Box flex={1} />
                                            <Badge colorScheme="green">${(nuevoEquipo.presupuesto / 1000000)}M</Badge>
                                        </HStack>
                                    </CardBody>
                                </Card>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button 
                            colorScheme="red" 
                            onClick={handleCrearEquipo}
                            isDisabled={!nuevoEquipo.nombre || !nuevoEquipo.nombreCompleto || !nuevoEquipo.pais}
                        >
                            Crear Equipo
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
}

export default Equipos;
