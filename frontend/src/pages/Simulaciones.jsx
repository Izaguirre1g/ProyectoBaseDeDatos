import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    Card,
    CardBody,
    Badge,
    SimpleGrid,
    Divider,
    Icon,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Spinner,
    Alert,
    AlertIcon,
    Button,
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
    Select,
    Checkbox,
    CheckboxGroup,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    useToast,
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
} from '@chakra-ui/react';
import { 
    Trophy, 
    Clock, 
    Flag,
    Timer,
    Gauge,
    Play,
    Plus,
    MapPin,
    BarChart3,
    ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import simulacionesService from '../services/simulaciones.service';


//cambiar posteriormente a variables del usuario
// URL base de Grafana
const GRAFANA_BASE_URL = 'http://192.168.18.56:3001';

// Nombres de circuitos por distancia
const getNombreCircuito = (distancia) => {
    const nombres = {
        5.793: { nombre: 'Monza', pais: 'Italia', imagen: '🇮🇹' },
        3.337: { nombre: 'Monaco', pais: 'Mónaco', imagen: '🇲🇨' },
        7.004: { nombre: 'Spa-Francorchamps', pais: 'Bélgica', imagen: '🇧🇪' },
        5.891: { nombre: 'Silverstone', pais: 'Reino Unido', imagen: '🇬🇧' },
        5.807: { nombre: 'Suzuka', pais: 'Japón', imagen: '🇯🇵' },
        4.318: { nombre: 'Barcelona', pais: 'España', imagen: '🇪🇸' },
        5.412: { nombre: 'Interlagos', pais: 'Brasil', imagen: '🇧🇷' },
        6.003: { nombre: 'COTA', pais: 'USA', imagen: '🇺🇸' }
    };
    return nombres[distancia] || { nombre: `Circuito`, pais: 'Desconocido', imagen: '🏁' };
};

// Función para formatear tiempo
function formatTiempo(segundos) {
    if (!segundos) return '--';
    if (segundos >= 60) {
        const mins = Math.floor(segundos / 60);
        const secs = (segundos % 60).toFixed(3);
        return `${mins}:${secs.padStart(6, '0')}`;
    } else {
        return `${segundos.toFixed(3)}s`;
    }
}

// Color según posición
function getPosicionColor(pos) {
    if (pos === 1) return 'yellow.500';
    if (pos === 2) return 'gray.400';
    if (pos === 3) return 'orange.600';
    return 'brand.600';
}

// Componente de tarjeta de estadística
function StatCard({ icon, label, value, subtext, color = 'accent.500' }) {
    return (
        <Card bg="brand.800" borderColor="brand.700" borderWidth="1px">
            <CardBody py={3}>
                <HStack spacing={3}>
                    <Box p={2} bg={`${color}20`} borderRadius="md">
                        <Icon as={icon} boxSize={5} color={color} />
                    </Box>
                    <Stat size="sm">
                        <StatLabel color="gray.400" fontSize="xs">{label}</StatLabel>
                        <StatNumber fontSize="lg">{value}</StatNumber>
                        {subtext && <StatHelpText color="gray.500" fontSize="xs" mb={0}>{subtext}</StatHelpText>}
                    </Stat>
                </HStack>
            </CardBody>
        </Card>
    );
}

// Componente de detalle de simulación
function SimulacionDetalle({ sim, podio }) {
    const circInfo = getNombreCircuito(sim.circuito?.distancia);
    
    return (
        <VStack spacing={4} align="stretch" p={2}>
            {/* Circuito info */}
            <HStack justify="space-between" flexWrap="wrap">
                <HStack>
                    <Text fontSize="2xl">{circInfo.imagen}</Text>
                    <Box>
                        <Text fontWeight="bold" color="white">{circInfo.nombre}</Text>
                        <Text fontSize="sm" color="gray.400">{circInfo.pais}</Text>
                    </Box>
                </HStack>
                <HStack spacing={4}>
                    <Badge colorScheme="blue">{sim.circuito?.distancia} km</Badge>
                    <Badge colorScheme="purple">{sim.circuito?.curvas} curvas</Badge>
                </HStack>
            </HStack>
            
            <Divider borderColor="brand.700" />

            {/* Podio */}
            {podio && podio.length > 0 && (
                <Box>
                    <Text fontWeight="bold" color="white" mb={3}>
                        <Icon as={Trophy} mr={2} color="yellow.500" />
                        Podio de la Simulación
                    </Text>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                        {podio.slice(0, 3).map((piloto) => (
                            <Box
                                key={piloto.posicion}
                                p={4}
                                bg={piloto.posicion === 1 ? 'yellow.500' : piloto.posicion === 2 ? 'gray.400' : 'orange.600'}
                                borderRadius="md"
                                position="relative"
                                overflow="hidden"
                            >
                                <Box
                                    position="absolute"
                                    top="0"
                                    right="0"
                                    fontSize="6xl"
                                    fontWeight="bold"
                                    opacity="0.1"
                                    lineHeight="1"
                                    color={piloto.posicion === 2 ? 'black' : 'white'}
                                >
                                    {piloto.posicion}
                                </Box>
                                <VStack align="stretch" spacing={1} position="relative" zIndex={1}>
                                    <HStack>
                                        <Badge
                                            bg={piloto.posicion === 2 ? 'gray.600' : piloto.posicion === 1 ? 'yellow.700' : 'orange.800'}
                                            color="white"
                                            px={2}
                                            fontWeight="bold"
                                        >
                                            P{piloto.posicion}
                                        </Badge>
                                        <Icon as={Trophy} color={piloto.posicion === 2 ? 'black' : 'white'} />
                                    </HStack>
                                    <Text
                                        fontWeight="bold"
                                        fontSize="lg"
                                        color={piloto.posicion === 2 ? 'black' : 'white'}
                                        textTransform="capitalize"
                                    >
                                        {piloto.piloto}
                                    </Text>
                                    <Text
                                        fontSize="xs"
                                        color={piloto.posicion === 2 ? 'gray.800' : 'whiteAlpha.800'}
                                    >
                                        {piloto.equipo}
                                    </Text>
                                    <Text
                                        fontSize="sm"
                                        fontWeight="bold"
                                        color={piloto.posicion === 2 ? 'black' : 'white'}
                                        mt={1}
                                    >
                                        {formatTiempo(piloto.tiempoSegundos)}
                                    </Text>
                                </VStack>
                            </Box>
                        ))}
                    </SimpleGrid>
                </Box>
            )}
            
            <Divider borderColor="brand.700" />
            
            {/* Valores calculados */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                <Box p={3} bg="brand.900" borderRadius="md">
                    <Text fontSize="xs" color="gray.500">V. Recta</Text>
                    <Text fontSize="lg" fontWeight="bold" color="yellow.400">
                        {sim.vrecta?.toFixed(1) || '--'} km/h
                    </Text>
                </Box>
                <Box p={3} bg="brand.900" borderRadius="md">
                    <Text fontSize="xs" color="gray.500">V. Curva</Text>
                    <Text fontSize="lg" fontWeight="bold" color="blue.400">
                        {sim.vcurva?.toFixed(1) || '--'} km/h
                    </Text>
                </Box>
                <Box p={3} bg="brand.900" borderRadius="md">
                    <Text fontSize="xs" color="gray.500">Penalización</Text>
                    <Text fontSize="lg" fontWeight="bold" color="orange.400">
                        +{sim.penalizacion?.toFixed(2) || '0.00'}s
                    </Text>
                </Box>
                <Box p={3} bg="brand.900" borderRadius="md">
                    <Text fontSize="xs" color="gray.500">Tiempo Total</Text>
                    <Text fontSize="lg" fontWeight="bold" color="accent.400">
                        {formatTiempo(sim.tiempo)}
                    </Text>
                </Box>
            </SimpleGrid>
            
            {/* Stats del carro en esa simulación */}
            <Box p={3} bg="brand.900" borderRadius="md">
                <Text fontSize="xs" color="gray.500" mb={2}>Stats del Carro</Text>
                <HStack spacing={4}>
                    <Badge colorScheme="yellow" fontSize="sm" px={3} py={1}>P: {sim.stats?.P}</Badge>
                    <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>A: {sim.stats?.A}</Badge>
                    <Badge colorScheme="green" fontSize="sm" px={3} py={1}>M: {sim.stats?.M}</Badge>
                </HStack>
            </Box>
        </VStack>
    );
}

function Simulaciones() {
    const { usuario, isAdmin } = useAuth();
    
    // Si es admin, mostrar la pantalla de administración de simulaciones
    if (isAdmin && isAdmin()) {
        return <AdminSimulaciones />;
    }
    
    // Si es ingeniero, mostrar vista del equipo
    if (usuario?.rol === 'Engineer') {
        return <EngineerSimulaciones />;
    }
    
    // Para conductores, mostrar su historial
    return <DriverSimulaciones />;
}

// =============================================
// COMPONENTE ADMIN: Crear y gestionar simulaciones
// =============================================
function AdminSimulaciones() {
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useState(true);
    const [ejecutando, setEjecutando] = useState(false);
    const [circuitos, setCircuitos] = useState([]);
    const [carrosDisponibles, setCarrosDisponibles] = useState([]);
    const [simulaciones, setSimulaciones] = useState([]);
    const [resultados, setResultados] = useState({});
    
    // Estado del formulario
    const [circuitoSeleccionado, setCircuitoSeleccionado] = useState('');
    const [carrosSeleccionados, setCarrosSeleccionados] = useState([]);
    const [habilidades, setHabilidades] = useState({});
    
    useEffect(() => {
        loadData();
    }, []);
    
    const loadData = async () => {
        try {
            setLoading(true);
            const [circuitosData, carrosData, simsData] = await Promise.all([
                simulacionesService.getCircuitos().catch(err => {
                    console.error('Error cargando circuitos:', err);
                    return [];
                }),
                simulacionesService.getCarrosDisponibles().catch(err => {
                    console.error('Error cargando carros:', err);
                    return [];
                }),
                simulacionesService.getDashboard().catch(err => {
                    console.error('Error cargando dashboard:', err);
                    return { simulaciones: [] };
                })
            ]);
            
            setCircuitos(circuitosData || []);
            setCarrosDisponibles(carrosData || []);
            setSimulaciones(simsData?.simulaciones || []);
        } catch (err) {
            console.error('Error cargando datos:', err);
            toast({
                title: 'Error al cargar datos',
                description: err?.message || 'No se pudieron cargar los datos',
                status: 'error',
                duration: 3000
            });
        } finally {
            setLoading(false);
        }
    };
    
    const handleCarroToggle = (carroId, carro) => {
        const id = parseInt(carroId);
        if (carrosSeleccionados.includes(id)) {
            setCarrosSeleccionados(prev => prev.filter(c => c !== id));
        } else {
            setCarrosSeleccionados(prev => [...prev, id]);
            if (!habilidades[id]) {
                // Usar la habilidad del conductor de la base de datos si existe, sino 85
                const habilidad = carro?.Habilidad_conductor || 85;
                setHabilidades(prev => ({ ...prev, [id]: habilidad }));
            }
        }
    };
    
    const handleHabilidadChange = (carroId, value) => {
        setHabilidades(prev => ({ ...prev, [carroId]: parseInt(value) || 85 }));
    };
    
    const handleEjecutarSimulacion = async () => {
        if (!circuitoSeleccionado) {
            toast({ title: 'Selecciona un circuito', status: 'warning', duration: 3000 });
            return;
        }
        if (carrosSeleccionados.length < 2) {
            toast({ title: 'Selecciona al menos 2 carros', status: 'warning', duration: 3000 });
            return;
        }
        
        try {
            setEjecutando(true);
            
            const carros = carrosSeleccionados.map(id => ({
                idCarro: id,
                habilidad: habilidades[id] || 85
            }));
            
            const resultado = await simulacionesService.ejecutarSimulacion(
                parseInt(circuitoSeleccionado),
                carros
            );
            
            toast({
                title: '¡Simulación ejecutada!',
                description: resultado.mensaje || 'La simulación se completó correctamente',
                status: 'success',
                duration: 5000
            });
            
            // Recargar datos y cerrar modal
            await loadData();
            onClose();
            setCarrosSeleccionados([]);
            setCircuitoSeleccionado('');
            setHabilidades({});
            
        } catch (err) {
            console.error('Error ejecutando simulación:', err);
            toast({
                title: 'Error al ejecutar simulación',
                description: err.response?.data?.error || err.message,
                status: 'error',
                duration: 5000
            });
        } finally {
            setEjecutando(false);
        }
    };
    
    const loadResultados = async (simId) => {
        if (resultados[simId]) return;
        try {
            const data = await simulacionesService.getResultados(simId);
            setResultados(prev => ({ ...prev, [simId]: data }));
        } catch (err) {
            console.error('Error cargando resultados:', err);
        }
    };
    
    if (loading) {
        return (
            <Container maxW="1400px" py={8}>
                <VStack spacing={6} align="center" py={20}>
                    <Spinner size="xl" color="accent.500" />
                    <Text color="gray.400">Cargando datos...</Text>
                </VStack>
            </Container>
        );
    }
    
    return (
        <Container maxW="1400px" py={8}>
            <VStack spacing={6} align="stretch">
                {/* Header */}
                <HStack justify="space-between" flexWrap="wrap">
                    <Box>
                        <Heading size="lg" mb={2}>
                            <Icon as={Timer} mr={3} />
                            Administrar Simulaciones
                        </Heading>
                        <Text color="gray.400">
                            Crea y gestiona simulaciones de carreras
                        </Text>
                    </Box>
                    <Button
                        leftIcon={<Plus size={18} />}
                        colorScheme="green"
                        onClick={onOpen}
                    >
                        Nueva Simulación
                    </Button>
                </HStack>
                
                {/* Estadísticas rápidas */}
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                    <StatCard 
                        icon={Timer}
                        label="Total Simulaciones"
                        value={simulaciones.length}
                        color="blue.500"
                    />
                    <StatCard 
                        icon={MapPin}
                        label="Circuitos"
                        value={circuitos.length}
                        color="green.500"
                    />
                    <StatCard 
                        icon={Flag}
                        label="Carros Disponibles"
                        value={carrosDisponibles.filter(c => c.Finalizado).length}
                        color="purple.500"
                    />
                    <StatCard 
                        icon={Trophy}
                        label="Carros Listos"
                        value={carrosDisponibles.filter(c => c.Finalizado && c.Id_conductor).length}
                        color="yellow.500"
                    />
                </SimpleGrid>
                
                {/* Tabs: Historial y Circuitos */}
                <Tabs colorScheme="red" variant="soft-rounded">
                    <TabList>
                        <Tab _selected={{ bg: 'accent.600', color: 'white' }}>
                            <Icon as={BarChart3} mr={2} boxSize={4} />
                            Dashboard Grafana
                        </Tab>
                        <Tab _selected={{ bg: 'accent.600', color: 'white' }}>Historial</Tab>
                        <Tab _selected={{ bg: 'accent.600', color: 'white' }}>Circuitos</Tab>
                        <Tab _selected={{ bg: 'accent.600', color: 'white' }}>Carros</Tab>
                    </TabList>
                    
                    <TabPanels>
                        {/* Tab Dashboard Grafana */}
                        <TabPanel px={0}>
                            <Card bg="brand.800" borderColor="brand.700">
                                <CardBody p={0}>
                                    <HStack justify="flex-end" p={3} borderBottom="1px" borderColor="brand.700">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            colorScheme="blue"
                                            leftIcon={<ExternalLink size={14} />}
                                            onClick={() => window.open(`${GRAFANA_BASE_URL}/d/f1sim/f1-simulaciones`, '_blank')}
                                        >
                                            Abrir en Grafana
                                        </Button>
                                    </HStack>
                                    <Box
                                        as="iframe"
                                        src={`${GRAFANA_BASE_URL}/d/f1sim/f1-simulaciones?orgId=1&kiosk`}
                                        width="100%"
                                        height="800px"
                                        border="none"
                                        borderRadius="md"
                                    />
                                </CardBody>
                            </Card>
                        </TabPanel>
                        
                        {/* Tab Historial */}
                        <TabPanel px={0}>
                            <Card bg="brand.800" borderColor="brand.700">
                                <CardBody>
                                    {simulaciones.length === 0 ? (
                                        <Text color="gray.500" textAlign="center" py={8}>
                                            No hay simulaciones registradas
                                        </Text>
                                    ) : (
                                        <Accordion allowMultiple>
                                            {simulaciones.map((sim) => {
                                                // Usar Distancia_total del backend
                                                const circInfo = getNombreCircuito(sim.Distancia_total);
                                                return (
                                                    <AccordionItem key={`sim-${sim.Id_simulacion}`} border="none" mb={2}>
                                                        <AccordionButton 
                                                            bg="brand.900" 
                                                            borderRadius="md"
                                                            _hover={{ bg: 'brand.700' }}
                                                            onClick={() => loadResultados(sim.Id_simulacion)}
                                                        >
                                                            <HStack flex={1} spacing={4}>
                                                                <Text fontSize="xl">{circInfo.imagen}</Text>
                                                                <Box flex={1} textAlign="left">
                                                                    <Text color="white" fontWeight="bold">
                                                                        {circInfo.nombre} - Simulación #{sim.Id_simulacion}
                                                                    </Text>
                                                                    <Text color="gray.500" fontSize="xs">
                                                                        {new Date(sim.Fecha).toLocaleString()}
                                                                    </Text>
                                                                </Box>
                                                            </HStack>
                                                            <AccordionIcon color="gray.400" />
                                                        </AccordionButton>
                                                        <AccordionPanel bg="brand.850" borderRadius="0 0 md md">
                                                            {resultados[sim.Id_simulacion] ? (
                                                                <Table size="sm" variant="simple">
                                                                    <Thead>
                                                                        <Tr>
                                                                            <Th color="gray.400">Pos</Th>
                                                                            <Th color="gray.400">Conductor</Th>
                                                                            <Th color="gray.400">Equipo</Th>
                                                                            <Th color="gray.400" isNumeric>Tiempo</Th>
                                                                            <Th color="gray.400" isNumeric>V.Recta</Th>
                                                                            <Th color="gray.400" isNumeric>V.Curva</Th>
                                                                        </Tr>
                                                                    </Thead>
                                                                    <Tbody>
                                                                        {resultados[sim.Id_simulacion].map((r, idx) => (
                                                                            <Tr key={`${sim.Id_simulacion}-${r.Id_carro}-${idx}`}>
                                                                                <Td>
                                                                                    <Badge 
                                                                                        bg={getPosicionColor(r.Posicion)}
                                                                                        color={r.Posicion === 2 ? 'black' : 'white'}
                                                                                    >
                                                                                        P{r.Posicion}
                                                                                    </Badge>
                                                                                </Td>
                                                                                <Td>{r.Conductor?.split('@')[0] || 'N/A'}</Td>
                                                                                <Td>{r.Equipo}</Td>
                                                                                <Td isNumeric fontWeight="bold" color="accent.400">
                                                                                    {formatTiempo(parseFloat(r.Tiempo_segundos))}
                                                                                </Td>
                                                                                <Td isNumeric>{parseFloat(r.Vrecta).toFixed(1)}</Td>
                                                                                <Td isNumeric>{parseFloat(r.Vcurva).toFixed(1)}</Td>
                                                                            </Tr>
                                                                        ))}
                                                                    </Tbody>
                                                                </Table>
                                                            ) : (
                                                                <Spinner color="accent.500" />
                                                            )}
                                                        </AccordionPanel>
                                                    </AccordionItem>
                                                );
                                            })}
                                        </Accordion>
                                    )}
                                </CardBody>
                            </Card>
                        </TabPanel>
                        
                        {/* Tab Circuitos */}
                        <TabPanel px={0}>
                            <Card bg="brand.800" borderColor="brand.700">
                                <CardBody>
                                    <Table size="sm" variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th color="gray.400">ID</Th>
                                                <Th color="gray.400">Circuito</Th>
                                                <Th color="gray.400" isNumeric>Distancia (km)</Th>
                                                <Th color="gray.400" isNumeric>Curvas</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {circuitos.map((c) => {
                                                const info = getNombreCircuito(parseFloat(c.Distancia_total));
                                                return (
                                                    <Tr key={c.Id_circuito}>
                                                        <Td>{c.Id_circuito}</Td>
                                                        <Td>
                                                            <HStack>
                                                                <Text>{info.imagen}</Text>
                                                                <Text fontWeight="bold">{info.nombre}</Text>
                                                            </HStack>
                                                        </Td>
                                                        <Td isNumeric>{c.Distancia_total}</Td>
                                                        <Td isNumeric>{c.Cantidad_curvas}</Td>
                                                    </Tr>
                                                );
                                            })}
                                        </Tbody>
                                    </Table>
                                </CardBody>
                            </Card>
                        </TabPanel>
                        
                        {/* Tab Carros */}
                        <TabPanel px={0}>
                            <Card bg="brand.800" borderColor="brand.700">
                                <CardBody>
                                    <Table size="sm" variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th color="gray.400">ID</Th>
                                                <Th color="gray.400">Equipo</Th>
                                                <Th color="gray.400">Conductor</Th>
                                                <Th color="gray.400" isNumeric>P</Th>
                                                <Th color="gray.400" isNumeric>A</Th>
                                                <Th color="gray.400" isNumeric>M</Th>
                                                <Th color="gray.400">Estado</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {carrosDisponibles.map((c) => (
                                                <Tr key={c.Id_carro}>
                                                    <Td>{c.Id_carro}</Td>
                                                    <Td>{c.Equipo}</Td>
                                                    <Td>{c.Conductor?.split('@')[0] || <Text color="orange.400">Sin asignar</Text>}</Td>
                                                    <Td isNumeric><Badge colorScheme="yellow">{c.P_total}</Badge></Td>
                                                    <Td isNumeric><Badge colorScheme="blue">{c.A_total}</Badge></Td>
                                                    <Td isNumeric><Badge colorScheme="green">{c.M_total}</Badge></Td>
                                                    <Td>
                                                        <Badge colorScheme={c.Finalizado ? 'green' : 'orange'}>
                                                            {c.Finalizado ? 'Listo' : 'Incompleto'}
                                                        </Badge>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </CardBody>
                            </Card>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </VStack>
            
            {/* Modal Nueva Simulación */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
                <ModalOverlay bg="blackAlpha.800" />
                <ModalContent bg="brand.800" borderColor="brand.700">
                    <ModalHeader color="white">
                        <HStack>
                            <Icon as={Play} color="green.400" />
                            <Text>Ejecutar Nueva Simulación</Text>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={6} align="stretch">
                            {/* Seleccionar Circuito */}
                            <FormControl isRequired>
                                <FormLabel color="gray.300">Circuito</FormLabel>
                                <Select
                                    placeholder="Selecciona un circuito"
                                    value={circuitoSeleccionado}
                                    onChange={(e) => setCircuitoSeleccionado(e.target.value)}
                                    bg="brand.900"
                                    borderColor="brand.700"
                                >
                                    {circuitos.map((c) => {
                                        const info = getNombreCircuito(parseFloat(c.Distancia_total));
                                        return (
                                            <option key={c.Id_circuito} value={c.Id_circuito}>
                                                {info.imagen} {info.nombre} - {c.Distancia_total}km, {c.Cantidad_curvas} curvas
                                            </option>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                            
                            {/* Seleccionar Carros */}
                            <FormControl isRequired>
                                <FormLabel color="gray.300">
                                    Carros Participantes ({carrosSeleccionados.length} seleccionados)
                                </FormLabel>
                                <Text fontSize="xs" color="gray.500" mb={2}>
                                    Solo carros finalizados con conductor asignado pueden participar
                                </Text>
                                <VStack align="stretch" spacing={2} maxH="300px" overflowY="auto">
                                    {carrosDisponibles
                                        .filter(c => c.Finalizado && c.Id_conductor)
                                        .map((c) => (
                                            <HStack
                                                key={c.Id_carro}
                                                p={3}
                                                bg={carrosSeleccionados.includes(c.Id_carro) ? 'green.900' : 'brand.900'}
                                                borderRadius="md"
                                                borderWidth="1px"
                                                borderColor={carrosSeleccionados.includes(c.Id_carro) ? 'green.500' : 'brand.700'}
                                                cursor="pointer"
                                                onClick={() => handleCarroToggle(c.Id_carro, c)}
                                            >
                                                <Checkbox
                                                    isChecked={carrosSeleccionados.includes(c.Id_carro)}
                                                    onChange={() => {}}
                                                    colorScheme="green"
                                                />
                                                <VStack align="start" spacing={0} flex={1}>
                                                    <Text fontWeight="bold" color="white">
                                                        {c.Conductor?.split('@')[0]} - {c.Equipo}
                                                    </Text>
                                                    <HStack spacing={2}>
                                                        <Badge colorScheme="yellow" size="sm">P:{c.P_total}</Badge>
                                                        <Badge colorScheme="blue" size="sm">A:{c.A_total}</Badge>
                                                        <Badge colorScheme="green" size="sm">M:{c.M_total}</Badge>
                                                        <Badge colorScheme="purple" size="sm">H:{c.Habilidad_conductor || 75}</Badge>
                                                    </HStack>
                                                </VStack>
                                                {carrosSeleccionados.includes(c.Id_carro) && (
                                                    <FormControl w="100px" onClick={(e) => e.stopPropagation()}>
                                                        <NumberInput
                                                            size="sm"
                                                            value={habilidades[c.Id_carro] || c.Habilidad_conductor || 75}
                                                            min={50}
                                                            max={100}
                                                            onChange={(val) => handleHabilidadChange(c.Id_carro, val)}
                                                        >
                                                            <NumberInputField bg="brand.800" />
                                                            <NumberInputStepper>
                                                                <NumberIncrementStepper />
                                                                <NumberDecrementStepper />
                                                            </NumberInputStepper>
                                                        </NumberInput>
                                                        <Text fontSize="xs" color="gray.500" textAlign="center">Habilidad</Text>
                                                    </FormControl>
                                                )}
                                            </HStack>
                                        ))}
                                </VStack>
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            colorScheme="green"
                            leftIcon={<Play size={18} />}
                            onClick={handleEjecutarSimulacion}
                            isLoading={ejecutando}
                            isDisabled={!circuitoSeleccionado || carrosSeleccionados.length < 2}
                        >
                            Ejecutar Simulación
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
}

// =============================================
// COMPONENTE DRIVER: Historial de simulaciones
// =============================================
//========================================
// COMPONENTE ENGINEER: Vista del equipo
//========================================
function EngineerSimulaciones() {
    const { usuario } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [teamData, setTeamData] = useState(null);
    const [selectedConductor, setSelectedConductor] = useState('all');
    const [podios, setPodios] = useState({});
    const [loadingPodio, setLoadingPodio] = useState({});

    useEffect(() => {
        loadTeamData();
    }, []);

    const loadTeamData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const data = await simulacionesService.getSimulaciones();
            setTeamData(data);
            
            if (data.conductores && data.conductores.length > 0) {
                setSelectedConductor(data.conductores[0].id.toString());
            }
        } catch (err) {
            console.error('Error cargando datos del equipo:', err);
            setError(err.response?.data?.error || 'Error al cargar datos del equipo');
        } finally {
            setLoading(false);
        }
    };

    const loadPodio = async (simId) => {
        if (podios[simId] || loadingPodio[simId]) return;
        
        try {
            setLoadingPodio(prev => ({ ...prev, [simId]: true }));
            const data = await simulacionesService.getSimulacion(simId);
            const podio = (data.resultados || []).map(r => ({
                posicion: r.Posicion,
                piloto: r.Conductor?.split('@')[0] || 'Piloto',
                equipo: r.Equipo || 'Equipo',
                tiempoSegundos: parseFloat(r.Tiempo_segundos)
            }));
            setPodios(prev => ({ ...prev, [simId]: podio }));
        } catch (err) {
            console.error('Error cargando podio:', err);
        } finally {
            setLoadingPodio(prev => ({ ...prev, [simId]: false }));
        }
    };

    const getFilteredSimulations = () => {
        if (!teamData?.simulaciones) return [];
        if (selectedConductor === 'all') return teamData.simulaciones;
        return teamData.simulaciones.filter(sim => sim.conductorId.toString() === selectedConductor);
    };

    const getConductorStats = (conductorId) => {
        if (!teamData?.simulaciones) return { victorias: 0, podios: 0, carreras: 0, mejorTiempo: null };
        
        const simsConductor = teamData.simulaciones.filter(s => s.conductorId === conductorId);
        const victorias = simsConductor.filter(s => s.posicion === 1).length;
        const podios = simsConductor.filter(s => s.posicion <= 3).length;
        const mejorTiempo = Math.min(...simsConductor.map(s => s.tiempo).filter(t => t > 0));
        
        return {
            victorias,
            podios,
            carreras: simsConductor.length,
            mejorTiempo: isFinite(mejorTiempo) ? mejorTiempo : null
        };
    };

    if (loading) {
        return (
            <Container maxW="1400px" py={8}>
                <VStack spacing={6} align="center" py={20}>
                    <Spinner size="xl" color="accent.500" />
                    <Text color="gray.400">Cargando datos del equipo...</Text>
                </VStack>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxW="1400px" py={8}>
                <Alert status="error" bg="red.900" borderRadius="md">
                    <AlertIcon />
                    {error}
                </Alert>
            </Container>
        );
    }

    if (!teamData?.equipo) {
        return (
            <Container maxW="1400px" py={8}>
                <Alert status="warning" bg="orange.900" borderRadius="md">
                    <AlertIcon />
                    No tienes un equipo asignado. Contacta al administrador.
                </Alert>
            </Container>
        );
    }

    const filteredSimulations = getFilteredSimulations();

    return (
        <Container maxW="1400px" py={8}>
            <VStack spacing={6} align="stretch">
                {/* Header */}
                <Box>
                    <Heading size="lg" mb={2}>
                        <Icon as={Timer} mr={3} />
                        Simulaciones del Equipo {teamData.equipo.nombre}
                    </Heading>
                    <Text color="gray.400">
                        Panel de análisis para ingenieros - Rendimiento de todos los conductores del equipo
                    </Text>
                </Box>

                {/* Stats del equipo */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                    <Card bg="brand.800" borderColor="brand.700">
                        <CardBody>
                            <Stat>
                                <StatLabel>Victorias del Equipo</StatLabel>
                                <StatNumber color="yellow.400">{teamData.stats.totalVictorias}</StatNumber>
                                <StatHelpText>En {teamData.stats.totalCarreras} carreras</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                    <Card bg="brand.800" borderColor="brand.700">
                        <CardBody>
                            <Stat>
                                <StatLabel>Podios del Equipo</StatLabel>
                                <StatNumber color="orange.400">{teamData.stats.totalPodios}</StatNumber>
                                <StatHelpText>{teamData.stats.totalCarreras > 0 ? ((teamData.stats.totalPodios / teamData.stats.totalCarreras) * 100).toFixed(1) : 0}% éxito</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                    <Card bg="brand.800" borderColor="brand.700">
                        <CardBody>
                            <Stat>
                                <StatLabel>Conductores Activos</StatLabel>
                                <StatNumber color="blue.400">{teamData.conductores?.length || 0}</StatNumber>
                                <StatHelpText>En competición</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                    <Card bg="brand.800" borderColor="brand.700">
                        <CardBody>
                            <Stat>
                                <StatLabel>Posición Promedio</StatLabel>
                                <StatNumber color="purple.400">
                                    {teamData.stats.posicionPromedio || 'N/A'}
                                </StatNumber>
                                <StatHelpText>Del equipo</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </SimpleGrid>

                {/* Tabs: Dashboard Grafana y Vista Original */}
                <Tabs colorScheme="red" variant="soft-rounded">
                    <TabList>
                        <Tab _selected={{ bg: 'accent.600', color: 'white' }}>
                            <Icon as={BarChart3} mr={2} boxSize={4} />
                            Dashboard Análisis
                        </Tab>
                        <Tab _selected={{ bg: 'accent.600', color: 'white' }}>Conductores</Tab>
                        <Tab _selected={{ bg: 'accent.600', color: 'white' }}>Simulaciones</Tab>
                    </TabList>
                    
                    <TabPanels>
                        {/* Tab Dashboard Grafana - Análisis por Carro */}
                        <TabPanel px={0}>
                            <Card bg="brand.800" borderColor="brand.700">
                                <CardBody p={0}>
                                    <HStack justify="flex-end" p={3} borderBottom="1px" borderColor="brand.700">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            colorScheme="blue"
                                            leftIcon={<ExternalLink size={14} />}
                                            onClick={() => window.open(`${GRAFANA_BASE_URL}/d/f1carro/f1-analisis-por-carro`, '_blank')}
                                        >
                                            Abrir en Grafana
                                        </Button>
                                    </HStack>
                                    <Box
                                        as="iframe"
                                        src={`${GRAFANA_BASE_URL}/d/f1carro/f1-analisis-por-carro?orgId=1&kiosk`}
                                        width="100%"
                                        height="800px"
                                        border="none"
                                        borderRadius="md"
                                    />
                                </CardBody>
                            </Card>
                        </TabPanel>
                        
                        {/* Tab Conductores del equipo */}
                        <TabPanel px={0}>
                            <Card bg="brand.800" borderColor="brand.700">
                                <CardBody>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        {teamData.conductores?.map((conductor) => {
                                            const stats = getConductorStats(conductor.id);
                                            return (
                                                <Box 
                                                    key={conductor.id}
                                                    p={4} 
                                                    bg="brand.900" 
                                                    borderRadius="lg"
                                                    borderLeft="4px solid"
                                                    borderLeftColor="accent.500"
                                                >
                                                    <HStack justify="space-between" mb={3}>
                                                        <VStack align="start" spacing={1}>
                                                            <Text fontWeight="bold" fontSize="lg">{conductor.nombre}</Text>
                                                            <Text color="gray.400" fontSize="sm">{conductor.correo}</Text>
                                                        </VStack>
                                                        <Badge colorScheme="blue">H: {conductor.habilidad}</Badge>
                                                    </HStack>
                                                    
                                                    <HStack spacing={4} fontSize="sm" color="gray.400" mb={3}>
                                                        <HStack>
                                                            <Trophy size={14} />
                                                            <Text>{stats.victorias} victorias</Text>
                                                        </HStack>
                                                        <HStack>
                                                            <Flag size={14} />
                                                            <Text>{stats.podios} podios</Text>
                                                        </HStack>
                                                    </HStack>

                                                    {conductor.carro ? (
                                                        <HStack justify="space-between">
                                                            <Text fontSize="sm" color="green.400">
                                                                Carro #{conductor.carro.id} - {conductor.carro.finalizado ? 'Completo' : 'En desarrollo'}
                                                            </Text>
                                                            <HStack fontSize="xs" color="gray.500">
                                                                <Text>P:{conductor.carro.stats.P}</Text>
                                                                <Text>A:{conductor.carro.stats.A}</Text>
                                                                <Text>M:{conductor.carro.stats.M}</Text>
                                                            </HStack>
                                                        </HStack>
                                                    ) : (
                                                        <Text fontSize="sm" color="red.400">Sin carro asignado</Text>
                                                    )}
                                                </Box>
                                            );
                                        })}
                                    </SimpleGrid>
                                </CardBody>
                            </Card>
                        </TabPanel>
                        
                        {/* Tab Simulaciones */}
                        <TabPanel px={0}>
                            {/* Filtros */}
                            <Card bg="brand.800" borderColor="brand.700" mb={4}>
                    <CardBody>
                        <HStack spacing={4} align="center">
                            <Text fontWeight="medium">Filtrar por conductor:</Text>
                            <Select 
                                value={selectedConductor} 
                                onChange={(e) => setSelectedConductor(e.target.value)}
                                width="200px"
                                bg="brand.900"
                            >
                                <option value="all">Todos los conductores</option>
                                {teamData.conductores?.map((conductor) => (
                                    <option key={conductor.id} value={conductor.id.toString()}>
                                        {conductor.nombre}
                                    </option>
                                ))}
                            </Select>
                            <Text color="gray.400">
                                {filteredSimulations.length} simulaciones
                            </Text>
                        </HStack>
                    </CardBody>
                </Card>

                {/* Lista de simulaciones */}
                {filteredSimulations.length === 0 ? (
                    <Alert status="info" bg="blue.900" borderRadius="md">
                        <AlertIcon />
                        {selectedConductor === 'all' 
                            ? 'No hay simulaciones registradas para este equipo'
                            : 'No hay simulaciones registradas para este conductor'
                        }
                    </Alert>
                ) : (
                    <VStack spacing={4} align="stretch">
                        {filteredSimulations.map((simulacion) => {
                            const circuito = getNombreCircuito(simulacion.circuito.distancia);
                            const podioData = podios[simulacion.id] || [];
                            const isLoadingPodio = loadingPodio[simulacion.id];
                            
                            return (
                                <Card key={simulacion.id} bg="brand.800" borderColor="brand.700">
                                    <CardBody>
                                        <Accordion allowToggle>
                                            <AccordionItem border="none">
                                                <AccordionButton 
                                                    p={0} 
                                                    _hover={{ bg: 'transparent' }}
                                                    onClick={() => loadPodio(simulacion.id)}
                                                >
                                                    <HStack flex="1" spacing={4} align="center">
                                                        {/* Posición */}
                                                        <Badge 
                                                            colorScheme={
                                                                simulacion.posicion === 1 ? 'yellow' : 
                                                                simulacion.posicion <= 3 ? 'orange' : 'gray'
                                                            }
                                                            fontSize="md" 
                                                            px={3} 
                                                            py={1}
                                                        >
                                                            #{simulacion.posicion}
                                                        </Badge>

                                                        {/* Info de la simulación */}
                                                        <VStack align="start" spacing={1} flex={1}>
                                                            <HStack>
                                                                <Text fontWeight="bold">
                                                                    {circuito.imagen} {circuito.nombre}
                                                                </Text>
                                                                <Badge colorScheme="blue">{simulacion.conductor}</Badge>
                                                            </HStack>
                                                            <HStack fontSize="sm" color="gray.400">
                                                                <Icon as={MapPin} size={14} />
                                                                <Text>{simulacion.circuito.distancia}km • {simulacion.circuito.curvas} curvas</Text>
                                                                <Text>•</Text>
                                                                <Text>{new Date(simulacion.fecha).toLocaleDateString()}</Text>
                                                            </HStack>
                                                        </VStack>

                                                        {/* Tiempo */}
                                                        <VStack align="end" spacing={1}>
                                                            <HStack>
                                                                <Icon as={Clock} size={16} />
                                                                <Text fontWeight="medium">
                                                                    {formatTiempo(simulacion.tiempo)}
                                                                </Text>
                                                            </HStack>
                                                            <HStack fontSize="sm" color="gray.400">
                                                                <Text>Vmax: {simulacion.vrecta.toFixed(0)} km/h</Text>
                                                            </HStack>
                                                        </VStack>

                                                        <AccordionIcon />
                                                    </HStack>
                                                </AccordionButton>

                                                <AccordionPanel pt={4}>
                                                    <Divider mb={4} borderColor="brand.700" />
                                                    
                                                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                                                        {/* Detalles técnicos */}
                                                        <VStack align="stretch" spacing={3}>
                                                            <Text fontWeight="bold" color="accent.400">Detalles Técnicos</Text>
                                                            
                                                            <SimpleGrid columns={2} spacing={3}>
                                                                <Box bg="brand.900" p={3} borderRadius="md">
                                                                    <Text fontSize="sm" color="gray.400">Vel. en Recta</Text>
                                                                    <Text fontWeight="bold">{simulacion.vrecta.toFixed(1)} km/h</Text>
                                                                </Box>
                                                                <Box bg="brand.900" p={3} borderRadius="md">
                                                                    <Text fontSize="sm" color="gray.400">Vel. en Curva</Text>
                                                                    <Text fontWeight="bold">{simulacion.vcurva.toFixed(1)} km/h</Text>
                                                                </Box>
                                                                <Box bg="brand.900" p={3} borderRadius="md">
                                                                    <Text fontSize="sm" color="gray.400">Penalización</Text>
                                                                    <Text fontWeight="bold">+{simulacion.penalizacion.toFixed(1)}s</Text>
                                                                </Box>
                                                                <Box bg="brand.900" p={3} borderRadius="md">
                                                                    <Text fontSize="sm" color="gray.400">Tiempo Final</Text>
                                                                    <Text fontWeight="bold">{formatTiempo(simulacion.tiempo)}</Text>
                                                                </Box>
                                                            </SimpleGrid>

                                                            <Box bg="brand.900" p={3} borderRadius="md">
                                                                <Text fontSize="sm" color="gray.400" mb={2}>Configuración del Carro</Text>
                                                                <HStack spacing={4}>
                                                                    <Text fontSize="sm">P: <Text as="span" fontWeight="bold">{simulacion.stats.P}</Text></Text>
                                                                    <Text fontSize="sm">A: <Text as="span" fontWeight="bold">{simulacion.stats.A}</Text></Text>
                                                                    <Text fontSize="sm">M: <Text as="span" fontWeight="bold">{simulacion.stats.M}</Text></Text>
                                                                </HStack>
                                                            </Box>
                                                        </VStack>

                                                        {/* Podio */}
                                                        <VStack align="stretch" spacing={3}>
                                                            <Text fontWeight="bold" color="accent.400">Clasificación General</Text>
                                                            {isLoadingPodio ? (
                                                                <HStack justify="center" py={4}>
                                                                    <Spinner size="sm" />
                                                                    <Text fontSize="sm" color="gray.400">Cargando resultados...</Text>
                                                                </HStack>
                                                            ) : podioData.length > 0 ? (
                                                                <VStack spacing={2} align="stretch">
                                                                    {podioData.slice(0, 5).map((resultado, idx) => (
                                                                        <HStack 
                                                                            key={idx}
                                                                            justify="space-between" 
                                                                            p={2} 
                                                                            bg={resultado.posicion <= 3 ? 'brand.700' : 'brand.900'} 
                                                                            borderRadius="md"
                                                                            borderLeft="3px solid"
                                                                            borderLeftColor={
                                                                                resultado.posicion === 1 ? 'yellow.400' :
                                                                                resultado.posicion === 2 ? 'gray.300' :
                                                                                resultado.posicion === 3 ? 'orange.400' : 'transparent'
                                                                            }
                                                                        >
                                                                            <HStack>
                                                                                <Badge 
                                                                                    colorScheme={
                                                                                        resultado.posicion === 1 ? 'yellow' :
                                                                                        resultado.posicion === 2 ? 'gray' :
                                                                                        resultado.posicion === 3 ? 'orange' : 'blue'
                                                                                    }
                                                                                    minW="6"
                                                                                >
                                                                                    {resultado.posicion}
                                                                                </Badge>
                                                                                <VStack align="start" spacing={0}>
                                                                                    <Text fontSize="sm" fontWeight="medium">{resultado.piloto}</Text>
                                                                                    <Text fontSize="xs" color="gray.400">{resultado.equipo}</Text>
                                                                                </VStack>
                                                                            </HStack>
                                                                            <Text fontSize="sm" fontWeight="medium">{formatTiempo(resultado.tiempoSegundos)}</Text>
                                                                        </HStack>
                                                                    ))}
                                                                </VStack>
                                                            ) : (
                                                                <Text fontSize="sm" color="gray.400" textAlign="center">
                                                                    Haz clic para cargar resultados
                                                                </Text>
                                                            )}
                                                        </VStack>
                                                    </SimpleGrid>
                                                </AccordionPanel>
                                            </AccordionItem>
                                        </Accordion>
                                    </CardBody>
                                </Card>
                            );
                        })}
                    </VStack>
                )}
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </VStack>
        </Container>
    );
}

//========================================
// COMPONENTE DRIVER: Historial personal  
//========================================
function DriverSimulaciones() {
    const { usuario } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [simulaciones, setSimulaciones] = useState([]);
    const [stats, setStats] = useState(null);
    const [carro, setCarro] = useState(null);
    const [podios, setPodios] = useState({}); // Cache de podios por simulación
    const [loadingPodio, setLoadingPodio] = useState({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [simData, statsData] = await Promise.all([
                simulacionesService.getSimulaciones(),
                simulacionesService.getDriverStats()
            ]);
            
            setSimulaciones(simData.simulaciones || []);
            setCarro(simData.carro);
            setStats(statsData);
        } catch (err) {
            console.error('Error cargando datos:', err);
            setError(err.response?.data?.error || 'Error al cargar simulaciones');
        } finally {
            setLoading(false);
        }
    };

    const loadPodio = async (simId) => {
        if (podios[simId] || loadingPodio[simId]) return;
        
        try {
            setLoadingPodio(prev => ({ ...prev, [simId]: true }));
            const data = await simulacionesService.getSimulacion(simId);
            // Transformar resultados a formato de podio
            const podio = (data.resultados || []).map(r => ({
                posicion: r.Posicion,
                piloto: r.Conductor?.split('@')[0] || 'Piloto',
                equipo: r.Equipo || 'Equipo',
                tiempoSegundos: parseFloat(r.Tiempo_segundos)
            }));
            setPodios(prev => ({ ...prev, [simId]: podio }));
        } catch (err) {
            console.error('Error cargando podio:', err);
        } finally {
            setLoadingPodio(prev => ({ ...prev, [simId]: false }));
        }
    };

    if (loading) {
        return (
            <Container maxW="1400px" py={8}>
                <VStack spacing={6} align="center" py={20}>
                    <Spinner size="xl" color="accent.500" />
                    <Text color="gray.400">Cargando simulaciones...</Text>
                </VStack>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxW="1400px" py={8}>
                <Alert status="error" bg="red.900" borderRadius="md">
                    <AlertIcon />
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxW="1400px" py={8}>
            <VStack spacing={6} align="stretch">
                {/* Header */}
                <Box>
                    <Heading size="lg" mb={2}>
                        <Icon as={Timer} mr={3} />
                        Historial de Simulaciones
                    </Heading>
                    <Text color="gray.400">
                        Análisis detallado de rendimiento bajo diferentes configuraciones
                    </Text>
                </Box>
                
                {/* Stats resumen */}
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                    <StatCard 
                        icon={Trophy}
                        label="Victorias"
                        value={stats?.victorias || 0}
                        color="yellow.500"
                    />
                    <StatCard 
                        icon={Flag}
                        label="Podios"
                        value={stats?.podios || 0}
                        color="purple.500"
                    />
                    <StatCard 
                        icon={Clock}
                        label="Mejor Tiempo"
                        value={formatTiempo(stats?.mejorTiempo)}
                        color="green.500"
                    />
                    <StatCard 
                        icon={Gauge}
                        label="Pos. Promedio"
                        value={stats?.posicionPromedio || '--'}
                        color="blue.500"
                    />
                </SimpleGrid>
                
                {/* Lista de simulaciones */}
                <Card bg="brand.800" borderColor="brand.700">
                    <CardBody>
                        <Heading size="md" color="white" mb={4}>Simulaciones Recientes</Heading>
                        
                        {simulaciones.length === 0 ? (
                            <Text color="gray.500" textAlign="center" py={8}>
                                No has participado en simulaciones aún
                            </Text>
                        ) : (
                            <Accordion allowMultiple>
                                {simulaciones.map((sim) => {
                                    const circInfo = getNombreCircuito(sim.circuito?.distancia);
                                    return (
                                        <AccordionItem 
                                            key={sim.id} 
                                            border="none"
                                            mb={2}
                                        >
                                            <AccordionButton 
                                                bg="brand.900" 
                                                borderRadius="md"
                                                _hover={{ bg: 'brand.700' }}
                                                _expanded={{ bg: 'brand.700', borderBottomRadius: 0 }}
                                                onClick={() => loadPodio(sim.id)}
                                            >
                                                <HStack flex={1} spacing={4} flexWrap="wrap">
                                                    <Badge 
                                                        bg={getPosicionColor(sim.posicion)}
                                                        color={sim.posicion === 2 ? 'black' : 'white'}
                                                        px={3}
                                                        py={1}
                                                        borderRadius="md"
                                                        fontWeight="bold"
                                                        fontSize="md"
                                                    >
                                                        P{sim.posicion}
                                                    </Badge>
                                                    <Text fontSize="xl">{circInfo.imagen}</Text>
                                                    <Box flex={1} textAlign="left" minW="200px">
                                                        <Text color="white" fontWeight="bold">
                                                            {circInfo.nombre}
                                                        </Text>
                                                        <Text color="gray.500" fontSize="xs">
                                                            {new Date(sim.fecha).toLocaleString()}
                                                        </Text>
                                                    </Box>
                                                    <VStack align="end" spacing={0}>
                                                        <Text color="accent.400" fontWeight="bold">
                                                            {formatTiempo(sim.tiempo)}
                                                        </Text>
                                                        <HStack spacing={2}>
                                                            <Badge size="sm" colorScheme="yellow" variant="outline">
                                                                P:{sim.stats?.P}
                                                            </Badge>
                                                            <Badge size="sm" colorScheme="blue" variant="outline">
                                                                A:{sim.stats?.A}
                                                            </Badge>
                                                            <Badge size="sm" colorScheme="green" variant="outline">
                                                                M:{sim.stats?.M}
                                                            </Badge>
                                                        </HStack>
                                                    </VStack>
                                                </HStack>
                                                <AccordionIcon color="gray.400" ml={4} />
                                            </AccordionButton>
                                            <AccordionPanel 
                                                bg="brand.850" 
                                                borderRadius="0 0 md md"
                                                borderTop="1px solid"
                                                borderColor="brand.700"
                                            >
                                                {loadingPodio[sim.id] ? (
                                                    <VStack py={4}>
                                                        <Spinner color="accent.500" />
                                                        <Text color="gray.400" fontSize="sm">Cargando detalles...</Text>
                                                    </VStack>
                                                ) : (
                                                    <SimulacionDetalle sim={sim} podio={podios[sim.id]} />
                                                )}
                                            </AccordionPanel>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                        )}
                    </CardBody>
                </Card>
                
                {/* Leyenda de fórmulas */}
                <Card bg="brand.800" borderColor="brand.700">
                    <CardBody>
                        <Heading size="sm" color="white" mb={3}>Fórmulas del Sistema</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} fontSize="sm">
                            <Box p={3} bg="brand.900" borderRadius="md">
                                <Text color="accent.400" fontWeight="bold" mb={2}>Velocidades</Text>
                                <VStack align="stretch" spacing={1} color="gray.300">
                                    <Text>V_recta = 200 + 3×P + 0.2×H - A</Text>
                                    <Text>V_curva = 90 + 2×A + 2×M + 0.2×H</Text>
                                </VStack>
                            </Box>
                            <Box p={3} bg="brand.900" borderRadius="md">
                                <Text color="accent.400" fontWeight="bold" mb={2}>Tiempos</Text>
                                <VStack align="stretch" spacing={1} color="gray.300">
                                    <Text>Penalización = (C × 40) / (1 + H/100)</Text>
                                    <Text>T_total = (D_rectas/V_recta + D_curvas/V_curva) × 3600 + Pen</Text>
                                </VStack>
                            </Box>
                        </SimpleGrid>
                    </CardBody>
                </Card>
            </VStack>
        </Container>
    );
}

export default Simulaciones;
