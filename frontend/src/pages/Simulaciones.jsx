import { useState } from 'react';
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
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Icon,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Progress,
} from '@chakra-ui/react';
import { 
    Trophy, 
    Clock, 
    MapPin, 
    Gauge, 
    Wind, 
    Wrench,
    Flag,
    Timer,
    Zap,
    AlertTriangle,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Constante global del sistema
const DC_CURVA = 0.5; // km por curva

// Datos dummy de simulaciones (valores p, a, m de 0-9)
const simulacionesData = [
    {
        id: 'SIM-2026-001',
        fecha: '2026-01-03 14:30',
        circuito: { 
            nombre: 'Monza', 
            pais: 'Italia',
            distancia: 5.793, 
            curvas: 11,
            imagen: '🇮🇹'
        },
        equipo: 'Scuderia Ferrari HP',
        carro: 'SF-24-01',
        conductor: {
            nombre: 'Charles Leclerc',
            numero: 16,
            habilidad: 92 // H
        },
        setup: {
            powerUnit: { nombre: 'Ferrari 066/12', p: 8, a: 5, m: 4 },
            aerodinamica: { nombre: 'Alerón Baja Carga', p: 4, a: 9, m: 6 },
            suspension: { nombre: 'Suspensión Pro Racing', p: 5, a: 6, m: 8 },
            cajaCambios: { nombre: 'Caja 8V Carbon', p: 7, a: 5, m: 6 },
            neumaticos: { nombre: 'Pirelli Soft C5', p: 6, a: 5, m: 5 }
        },
        posicion: 1
    },
    {
        id: 'SIM-2026-002',
        fecha: '2026-01-02 10:15',
        circuito: { 
            nombre: 'Monaco', 
            pais: 'Mónaco',
            distancia: 3.337, 
            curvas: 19,
            imagen: '🇲🇨'
        },
        equipo: 'Scuderia Ferrari HP',
        carro: 'SF-24-01',
        conductor: {
            nombre: 'Charles Leclerc',
            numero: 16,
            habilidad: 92
        },
        setup: {
            powerUnit: { nombre: 'Ferrari 066/12', p: 8, a: 5, m: 4 },
            aerodinamica: { nombre: 'Alerón Alta Carga', p: 3, a: 9, m: 7 },
            suspension: { nombre: 'Suspensión Pro Racing', p: 5, a: 6, m: 8 },
            cajaCambios: { nombre: 'Caja 8V Carbon', p: 7, a: 5, m: 6 },
            neumaticos: { nombre: 'Pirelli Soft C5', p: 6, a: 5, m: 5 }
        },
        posicion: 2
    },
    {
        id: 'SIM-2026-003',
        fecha: '2026-01-01 16:45',
        circuito: { 
            nombre: 'Spa-Francorchamps', 
            pais: 'Bélgica',
            distancia: 7.004, 
            curvas: 19,
            imagen: '🇧🇪'
        },
        equipo: 'Scuderia Ferrari HP',
        carro: 'SF-24-01',
        conductor: {
            nombre: 'Charles Leclerc',
            numero: 16,
            habilidad: 92
        },
        setup: {
            powerUnit: { nombre: 'Ferrari 066/12', p: 8, a: 5, m: 4 },
            aerodinamica: { nombre: 'Alerón Baja Carga', p: 4, a: 9, m: 6 },
            suspension: { nombre: 'Suspensión Pro Racing', p: 5, a: 6, m: 8 },
            cajaCambios: { nombre: 'Caja 8V Carbon', p: 7, a: 5, m: 6 },
            neumaticos: { nombre: 'Pirelli Medium C3', p: 5, a: 6, m: 6 }
        },
        posicion: 3
    },
    {
        id: 'SIM-2026-004',
        fecha: '2025-12-28 09:00',
        circuito: { 
            nombre: 'Silverstone', 
            pais: 'Reino Unido',
            distancia: 5.891, 
            curvas: 18,
            imagen: '🇬🇧'
        },
        equipo: 'Scuderia Ferrari HP',
        carro: 'SF-24-01',
        conductor: {
            nombre: 'Charles Leclerc',
            numero: 16,
            habilidad: 92
        },
        setup: {
            powerUnit: { nombre: 'Ferrari 066/12', p: 8, a: 5, m: 4 },
            aerodinamica: { nombre: 'Alerón Equilibrado', p: 4, a: 8, m: 7 },
            suspension: { nombre: 'Suspensión Pro Racing', p: 5, a: 6, m: 8 },
            cajaCambios: { nombre: 'Caja 8V Carbon', p: 7, a: 5, m: 6 },
            neumaticos: { nombre: 'Pirelli Hard C1', p: 4, a: 7, m: 6 }
        },
        posicion: 4
    },
    {
        id: 'SIM-2026-005',
        fecha: '2025-12-20 11:30',
        circuito: { 
            nombre: 'Suzuka', 
            pais: 'Japón',
            distancia: 5.807, 
            curvas: 18,
            imagen: '🇯🇵'
        },
        equipo: 'Scuderia Ferrari HP',
        carro: 'SF-24-01',
        conductor: {
            nombre: 'Charles Leclerc',
            numero: 16,
            habilidad: 92
        },
        setup: {
            powerUnit: { nombre: 'Ferrari 066/12', p: 8, a: 5, m: 4 },
            aerodinamica: { nombre: 'Alerón Alta Carga', p: 3, a: 9, m: 7 },
            suspension: { nombre: 'Suspensión Comfort', p: 4, a: 7, m: 9 },
            cajaCambios: { nombre: 'Caja 8V Carbon', p: 7, a: 5, m: 6 },
            neumaticos: { nombre: 'Pirelli Soft C5', p: 6, a: 5, m: 5 }
        },
        posicion: 1
    }
];

// Función para calcular todos los valores de una simulación
function calcularSimulacion(sim) {
    const setup = sim.setup;
    const H = sim.conductor.habilidad;
    const D = sim.circuito.distancia;
    const C = sim.circuito.curvas;
    
    // Calcular totales del carro (suma de las 5 partes)
    const P = setup.powerUnit.p + setup.aerodinamica.p + setup.suspension.p + 
              setup.cajaCambios.p + setup.neumaticos.p;
    const A = setup.powerUnit.a + setup.aerodinamica.a + setup.suspension.a + 
              setup.cajaCambios.a + setup.neumaticos.a;
    const M = setup.powerUnit.m + setup.aerodinamica.m + setup.suspension.m + 
              setup.cajaCambios.m + setup.neumaticos.m;
    
    // Velocidades (km/h)
    const Vrecta = 200 + 3 * P + 0.2 * H - A;
    const Vcurva = 90 + 2 * A + 2 * M + 0.2 * H;
    
    // Distancias
    const Dcurvas = C * DC_CURVA;
    const Drectas = Math.max(0, D - Dcurvas);
    
    // Penalización (segundos)
    const penalizacion = (C * 40) / (1 + H / 100);
    
    // Tiempo (horas)
    const tiempoHoras = (Drectas / Vrecta) + (Dcurvas / Vcurva);
    
    // Tiempo total (segundos)
    const tiempoSegundos = (tiempoHoras * 3600) + penalizacion;
    
    return {
        totales: { P, A, M, H },
        velocidades: { Vrecta, Vcurva },
        distancias: { D, Drectas, Dcurvas, C },
        penalizacion,
        tiempoHoras,
        tiempoSegundos
    };
}

// Función para formatear tiempo (minutos:segundos si > 60s)
function formatTiempo(segundos) {
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
function SimulacionDetalle({ sim }) {
    const calc = calcularSimulacion(sim);
    
    return (
        <VStack spacing={4} align="stretch" p={2}>
            {/* Circuito info */}
            <HStack justify="space-between" flexWrap="wrap">
                <HStack>
                    <Text fontSize="2xl">{sim.circuito.imagen}</Text>
                    <Box>
                        <Text fontWeight="bold" color="white">{sim.circuito.nombre}</Text>
                        <Text fontSize="sm" color="gray.400">{sim.circuito.pais}</Text>
                    </Box>
                </HStack>
                <HStack spacing={4}>
                    <Badge colorScheme="blue">{sim.circuito.distancia} km</Badge>
                    <Badge colorScheme="purple">{sim.circuito.curvas} curvas</Badge>
                </HStack>
            </HStack>
            
            <Divider borderColor="brand.700" />
            
            {/* Setup completo */}
            <Box>
                <Text fontWeight="bold" color="white" mb={2}>Setup del Carro</Text>
                <Table size="sm" variant="unstyled">
                    <Thead>
                        <Tr>
                            <Th color="gray.500">Categoría</Th>
                            <Th color="gray.500">Parte</Th>
                            <Th color="yellow.400" isNumeric>P</Th>
                            <Th color="blue.400" isNumeric>A</Th>
                            <Th color="green.400" isNumeric>M</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {Object.entries(sim.setup).map(([cat, parte]) => (
                            <Tr key={cat}>
                                <Td color="gray.400" fontSize="xs" textTransform="capitalize">
                                    {cat.replace(/([A-Z])/g, ' $1').trim()}
                                </Td>
                                <Td color="white" fontSize="sm">{parte.nombre}</Td>
                                <Td isNumeric color="yellow.300">{parte.p}</Td>
                                <Td isNumeric color="blue.300">{parte.a}</Td>
                                <Td isNumeric color="green.300">{parte.m}</Td>
                            </Tr>
                        ))}
                        <Tr borderTop="1px solid" borderColor="brand.600">
                            <Td></Td>
                            <Td fontWeight="bold" color="white">TOTALES</Td>
                            <Td isNumeric fontWeight="bold" color="yellow.400">{calc.totales.P}</Td>
                            <Td isNumeric fontWeight="bold" color="blue.400">{calc.totales.A}</Td>
                            <Td isNumeric fontWeight="bold" color="green.400">{calc.totales.M}</Td>
                        </Tr>
                    </Tbody>
                </Table>
            </Box>
            
            <Divider borderColor="brand.700" />
            
            {/* Valores calculados */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                <Box p={3} bg="brand.900" borderRadius="md">
                    <Text fontSize="xs" color="gray.500">V. Recta</Text>
                    <Text fontSize="lg" fontWeight="bold" color="yellow.400">
                        {calc.velocidades.Vrecta.toFixed(1)} km/h
                    </Text>
                </Box>
                <Box p={3} bg="brand.900" borderRadius="md">
                    <Text fontSize="xs" color="gray.500">V. Curva</Text>
                    <Text fontSize="lg" fontWeight="bold" color="blue.400">
                        {calc.velocidades.Vcurva.toFixed(1)} km/h
                    </Text>
                </Box>
                <Box p={3} bg="brand.900" borderRadius="md">
                    <Text fontSize="xs" color="gray.500">Penalización</Text>
                    <Text fontSize="lg" fontWeight="bold" color="orange.400">
                        +{calc.penalizacion.toFixed(2)}s
                    </Text>
                </Box>
                <Box p={3} bg="brand.900" borderRadius="md">
                    <Text fontSize="xs" color="gray.500">Tiempo Total</Text>
                    <Text fontSize="lg" fontWeight="bold" color="accent.400">
                        {formatTiempo(calc.tiempoSegundos)}
                    </Text>
                </Box>
            </SimpleGrid>
            
            {/* Fórmulas aplicadas */}
            <Box p={3} bg="brand.900" borderRadius="md">
                <Text fontSize="xs" color="gray.500" mb={2}>Cálculos Detallados</Text>
                <VStack align="stretch" spacing={1} fontSize="xs" color="gray.400">
                    <Text>• D_rectas = {calc.distancias.D} - ({calc.distancias.C} × {DC_CURVA}) = {calc.distancias.Drectas.toFixed(3)} km</Text>
                    <Text>• D_curvas = {calc.distancias.C} × {DC_CURVA} = {calc.distancias.Dcurvas.toFixed(3)} km</Text>
                    <Text>• V_recta = 200 + 3×{calc.totales.P} + 0.2×{calc.totales.H} - {calc.totales.A} = {calc.velocidades.Vrecta.toFixed(1)} km/h</Text>
                    <Text>• V_curva = 90 + 2×{calc.totales.A} + 2×{calc.totales.M} + 0.2×{calc.totales.H} = {calc.velocidades.Vcurva.toFixed(1)} km/h</Text>
                    <Text>• Penalización = ({calc.distancias.C} × 40) / (1 + {calc.totales.H}/100) = {calc.penalizacion.toFixed(2)}s</Text>
                </VStack>
            </Box>
        </VStack>
    );
}

function Simulaciones() {
    const { usuario } = useAuth();
    const [selectedSim, setSelectedSim] = useState(null);
    
    // Calcular estadísticas generales
    const victorias = simulacionesData.filter(s => s.posicion === 1).length;
    const podios = simulacionesData.filter(s => s.posicion <= 3).length;
    const mejorTiempo = Math.min(...simulacionesData.map(s => calcularSimulacion(s).tiempoSegundos));
    const promedioPos = simulacionesData.reduce((acc, s) => acc + s.posicion, 0) / simulacionesData.length;
    
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
                        value={victorias}
                        color="yellow.500"
                    />
                    <StatCard 
                        icon={Flag}
                        label="Podios"
                        value={podios}
                        color="purple.500"
                    />
                    <StatCard 
                        icon={Clock}
                        label="Mejor Tiempo"
                        value={formatTiempo(mejorTiempo)}
                        color="green.500"
                    />
                    <StatCard 
                        icon={Gauge}
                        label="Pos. Promedio"
                        value={promedioPos.toFixed(1)}
                        color="blue.500"
                    />
                </SimpleGrid>
                
                {/* Lista de simulaciones */}
                <Card bg="brand.800" borderColor="brand.700">
                    <CardBody>
                        <Heading size="md" color="white" mb={4}>Simulaciones Recientes</Heading>
                        
                        <Accordion allowMultiple>
                            {simulacionesData.map((sim) => {
                                const calc = calcularSimulacion(sim);
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
                                        >
                                            <HStack flex={1} spacing={4}>
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
                                                <Text fontSize="xl">{sim.circuito.imagen}</Text>
                                                <Box flex={1} textAlign="left">
                                                    <Text color="white" fontWeight="bold">
                                                        {sim.circuito.nombre}
                                                    </Text>
                                                    <Text color="gray.500" fontSize="xs">
                                                        {sim.fecha} • {sim.id}
                                                    </Text>
                                                </Box>
                                                <VStack align="end" spacing={0}>
                                                    <Text color="accent.400" fontWeight="bold">
                                                        {formatTiempo(calc.tiempoSegundos)}
                                                    </Text>
                                                    <HStack spacing={2}>
                                                        <Badge size="sm" colorScheme="yellow" variant="outline">
                                                            P:{calc.totales.P}
                                                        </Badge>
                                                        <Badge size="sm" colorScheme="blue" variant="outline">
                                                            A:{calc.totales.A}
                                                        </Badge>
                                                        <Badge size="sm" colorScheme="green" variant="outline">
                                                            M:{calc.totales.M}
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
                                            <SimulacionDetalle sim={sim} />
                                        </AccordionPanel>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
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
                            <Box p={3} bg="brand.900" borderRadius="md">
                                <Text color="accent.400" fontWeight="bold" mb={2}>Distancias</Text>
                                <VStack align="stretch" spacing={1} color="gray.300">
                                    <Text>D_curvas = C × dc (dc = {DC_CURVA} km)</Text>
                                    <Text>D_rectas = D_total - D_curvas</Text>
                                </VStack>
                            </Box>
                            <Box p={3} bg="brand.900" borderRadius="md">
                                <Text color="accent.400" fontWeight="bold" mb={2}>Totales del Carro</Text>
                                <VStack align="stretch" spacing={1} color="gray.300">
                                    <Text>P = Σ(p_i) de 5 categorías</Text>
                                    <Text>A = Σ(a_i) de 5 categorías</Text>
                                    <Text>M = Σ(m_i) de 5 categorías</Text>
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
