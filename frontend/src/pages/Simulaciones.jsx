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
} from '@chakra-ui/react';
import { 
    Trophy, 
    Clock, 
    Flag,
    Timer,
    Gauge,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import simulacionesService from '../services/simulaciones.service';

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
