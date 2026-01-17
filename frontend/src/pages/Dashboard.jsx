import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import simulacionesService from '../services/simulaciones.service';
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
    Flex,
    Button,
    Badge,
    Progress,
    Avatar,
    Divider,
    Icon,
    Spinner,
    Alert,
    AlertIcon,
} from '@chakra-ui/react';
import {
    Users,
    Building2,
    Car,
    Flag,
    Plus,
    BarChart3,
    ShoppingCart,
    Wrench,
    Package,
    Trophy,
    Medal,
    Star,
    DollarSign,
    Clock,
    TrendingUp,
} from 'lucide-react';

function Dashboard() {
    const { usuario } = useAuth();

    const renderContent = () => {
        switch (usuario?.rol) {
            case 'Admin':
                return <AdminDashboard />;
            case 'Engineer':
                return <EngineerDashboard />;
            case 'Driver':
                return <DriverDashboard />;
            default:
                return <Box>Rol no reconocido</Box>;
        }
    };

    return (
        <Container maxW="container.xl" py={8}>
            {renderContent()}
        </Container>
    );
}

function StatCard({ icon: IconComponent, label, value, color }) {
    return (
        <Card bg="brand.800" borderColor="brand.700">
            <CardBody>
                <HStack spacing={4}>
                    <Flex
                        w={12}
                        h={12}
                        bg={color}
                        borderRadius="xl"
                        align="center"
                        justify="center"
                    >
                        <Icon as={IconComponent} boxSize={6} color="white" />
                    </Flex>
                    <VStack align="start" spacing={0}>
                        <Text fontSize="2xl" fontWeight="bold" color="white">
                            {value}
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                            {label}
                        </Text>
                    </VStack>
                </HStack>
            </CardBody>
        </Card>
    );
}

function AdminDashboard() {
    const navigate = useNavigate();
    
    // Datos que coinciden con los dummy de equipos
    const stats = [
        { label: 'Usuarios', value: 3, icon: Users, color: 'blue.500' },
        { label: 'Equipos', value: 4, icon: Building2, color: 'green.500' },
        { label: 'Pilotos', value: 8, icon: Car, color: 'yellow.500' },
        { label: 'Presupuesto Total', value: '$565M', icon: DollarSign, color: 'accent.600' },
    ];

    // Top equipos por presupuesto
    const topEquipos = [
        { nombre: 'Red Bull Racing', presupuesto: 145, campeonatos: 6, color: '#1E41FF' },
        { nombre: 'Mercedes', presupuesto: 145, campeonatos: 8, color: '#00D2BE' },
        { nombre: 'Ferrari', presupuesto: 140, campeonatos: 16, color: '#DC0000' },
        { nombre: 'McLaren', presupuesto: 135, campeonatos: 8, color: '#FF8700' },
    ];

    const activities = [
        { time: 'Hace 1h', text: 'Lewis Hamilton se unió a Ferrari', type: 'transfer' },
        { time: 'Hace 3h', text: 'Red Bull Racing compró Power Unit Honda RBPT', type: 'purchase' },
        { time: 'Hace 5h', text: 'McLaren actualizó paquete aerodinámico Silverstone', type: 'update' },
        { time: 'Ayer', text: 'Mercedes renovó contrato con Petronas ($32M)', type: 'sponsor' },
    ];

    return (
        <VStack spacing={6} align="stretch">
            <Box>
                <Heading size="lg" color="white">Panel de Administración</Heading>
                <Text color="gray.400" mt={1}>Vista general del sistema F1 Database</Text>
            </Box>

            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </SimpleGrid>

            <Card bg="brand.800" borderColor="brand.700">
                <CardBody>
                    <Heading size="md" color="white" mb={4}>Acciones Rápidas</Heading>
                    <Flex gap={3} flexWrap="wrap">
                        <Button 
                            leftIcon={<Plus size={16} />} 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate('/usuarios')}
                        >
                            Gestionar Usuarios
                        </Button>
                        <Button 
                            leftIcon={<Building2 size={16} />} 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate('/equipos')}
                        >
                            Ver Equipos
                        </Button>
                        <Button 
                            leftIcon={<ShoppingCart size={16} />} 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate('/catalogo')}
                        >
                            Catálogo de Partes
                        </Button>
                        <Button 
                            leftIcon={<BarChart3 size={16} />} 
                            variant="outline" 
                            size="sm"
                            isDisabled
                        >
                            Ver Grafana
                        </Button>
                    </Flex>
                </CardBody>
            </Card>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                {/* Ranking de equipos */}
                <Card bg="brand.800" borderColor="brand.700">
                    <CardBody>
                        <HStack justify="space-between" mb={4}>
                            <Heading size="md" color="white">Equipos por Presupuesto</Heading>
                            <Button 
                                size="xs" 
                                variant="ghost" 
                                color="accent.400"
                                onClick={() => navigate('/equipos')}
                            >
                                Ver todos
                            </Button>
                        </HStack>
                        <VStack spacing={3} align="stretch">
                            {topEquipos.map((equipo, idx) => (
                                <HStack 
                                    key={idx} 
                                    p={3} 
                                    bg="brand.900" 
                                    borderRadius="md"
                                    borderLeft="4px solid"
                                    borderLeftColor={equipo.color}
                                >
                                    <Text color="gray.500" fontWeight="bold" w="24px">
                                        #{idx + 1}
                                    </Text>
                                    <Box flex={1}>
                                        <Text color="white" fontWeight="medium">{equipo.nombre}</Text>
                                        <HStack spacing={2} fontSize="xs" color="gray.400">
                                            <HStack>
                                                <Trophy size={12} />
                                                <Text>{equipo.campeonatos} títulos</Text>
                                            </HStack>
                                        </HStack>
                                    </Box>
                                    <VStack spacing={0} align="end">
                                        <Text color="green.400" fontWeight="bold">${equipo.presupuesto}M</Text>
                                        <Text fontSize="xs" color="gray.500">presupuesto</Text>
                                    </VStack>
                                </HStack>
                            ))}
                        </VStack>
                    </CardBody>
                </Card>

                {/* Actividad reciente */}
                <Card bg="brand.800" borderColor="brand.700">
                    <CardBody>
                        <Heading size="md" color="white" mb={4}>Actividad Reciente</Heading>
                        <VStack spacing={0} align="stretch" divider={<Divider borderColor="brand.700" />}>
                            {activities.map((activity, index) => (
                                <HStack key={index} py={3} spacing={4}>
                                    <HStack spacing={2}>
                                        <Clock size={14} color="#718096" />
                                        <Text fontSize="sm" color="gray.500" minW="70px">
                                            {activity.time}
                                        </Text>
                                    </HStack>
                                    <Text color="gray.300" fontSize="sm">{activity.text}</Text>
                                </HStack>
                            ))}
                        </VStack>
                    </CardBody>
                </Card>
            </SimpleGrid>
        </VStack>
    );
}

function EngineerDashboard() {
    const navigate = useNavigate();
    
    // Datos de Ferrari (equipo asignado al ingeniero de prueba)
    const equipo = {
        id: 2,
        nombre: 'Ferrari',
        nombreCompleto: 'Scuderia Ferrari HP',
        presupuesto: 140000000,
        gastado: 92000000,
        disponible: 48000000,
        sponsors: 78000000,
        carros: 2,
        partes: 6,
        color: '#DC0000'
    };

    const carros = [
        { 
            id: 3,
            nombre: 'SF-24-01', 
            piloto: 'Charles Leclerc', 
            numero: 16,
            partes: 5,
            total: 5,
            status: 'completo'
        },
        { 
            id: 4,
            nombre: 'SF-24-02', 
            piloto: 'Lewis Hamilton', 
            numero: 44,
            partes: 4,
            total: 5,
            status: 'incompleto'
        },
    ];

    const pilotos = [
        { nombre: 'Charles Leclerc', numero: 16, victorias: 7, campeonatos: 0 },
        { nombre: 'Lewis Hamilton', numero: 44, victorias: 104, campeonatos: 7 },
    ];

    const inventarioResumen = [
        { categoria: 'Power Unit', cantidad: 3, valor: '$54M' },
        { categoria: 'Aerodinámica', cantidad: 2, valor: '$5.6M' },
        { categoria: 'Suspensión', cantidad: 5, valor: '$4.6M' },
        { categoria: 'Caja de Cambios', cantidad: 3, valor: '$4.2M' },
    ];

    const patrocinadores = [
        { nombre: 'HP', aporte: 28 },
        { nombre: 'Shell', aporte: 20 },
        { nombre: 'Santander', aporte: 15 },
    ];

    return (
        <VStack spacing={6} align="stretch">
            <HStack justify="space-between" align="start">
                <Box>
                    <Heading size="lg" color="white">Panel de Ingeniero</Heading>
                    <HStack mt={1}>
                        <Box w="12px" h="12px" bg={equipo.color} borderRadius="sm" />
                        <Text color="gray.400">{equipo.nombreCompleto}</Text>
                    </HStack>
                </Box>
                <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => navigate('/equipos')}
                >
                    Ir a Mi Equipo
                </Button>
            </HStack>

            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
                <StatCard 
                    icon={DollarSign} 
                    label="Presupuesto Total" 
                    value={`$${(equipo.presupuesto / 1000000).toFixed(0)}M`} 
                    color="green.500" 
                />
                <StatCard 
                    icon={TrendingUp} 
                    label="Disponible" 
                    value={`$${(equipo.disponible / 1000000).toFixed(0)}M`} 
                    color="blue.500" 
                />
                <StatCard 
                    icon={Car} 
                    label="Carros" 
                    value={`${equipo.carros}`} 
                    color="yellow.500" 
                />
                <StatCard 
                    icon={Package} 
                    label="Partes en Inventario" 
                    value={equipo.partes} 
                    color="purple.500" 
                />
            </SimpleGrid>

            {/* Pilotos del equipo */}
            <Card bg="brand.800" borderColor="brand.700">
                <CardBody>
                    <Heading size="md" color="white" mb={4}>Pilotos del Equipo</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {pilotos.map((piloto, idx) => (
                            <HStack 
                                key={idx}
                                p={4}
                                bg="brand.900"
                                borderRadius="lg"
                                borderLeft="4px solid"
                                borderLeftColor={equipo.color}
                            >
                                <Avatar name={piloto.nombre} bg="accent.600" />
                                <VStack align="start" spacing={0} flex={1}>
                                    <HStack>
                                        <Text fontWeight="bold" color="white">{piloto.nombre}</Text>
                                        <Badge colorScheme="purple">#{piloto.numero}</Badge>
                                    </HStack>
                                    <HStack spacing={4} fontSize="sm" color="gray.400">
                                        <HStack>
                                            <Trophy size={14} />
                                            <Text>{piloto.campeonatos} títulos</Text>
                                        </HStack>
                                        <HStack>
                                            <Flag size={14} />
                                            <Text>{piloto.victorias} victorias</Text>
                                        </HStack>
                                    </HStack>
                                </VStack>
                            </HStack>
                        ))}
                    </SimpleGrid>
                </CardBody>
            </Card>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                {/* Carros del equipo */}
                <Card bg="brand.800" borderColor="brand.700">
                    <CardBody>
                        <HStack justify="space-between" mb={4}>
                            <Heading size="md" color="white">Carros del Equipo</Heading>
                            <Button 
                                size="xs" 
                                variant="ghost" 
                                color="accent.400"
                                onClick={() => navigate('/equipos')}
                            >
                                Configurar
                            </Button>
                        </HStack>
                        <VStack spacing={3} align="stretch">
                            {carros.map((carro) => (
                                <Box 
                                    key={carro.id}
                                    bg="brand.900" 
                                    p={4} 
                                    borderRadius="lg"
                                    borderWidth="1px"
                                    borderColor="brand.700"
                                    cursor="pointer"
                                    _hover={{ borderColor: 'accent.500' }}
                                    onClick={() => navigate(`/equipos/${equipo.id}/carros/${carro.id}`)}
                                >
                                    <HStack justify="space-between" mb={2}>
                                        <HStack>
                                            <Badge colorScheme="red" fontSize="sm">#{carro.numero}</Badge>
                                            <Text fontWeight="bold" color="white">{carro.nombre}</Text>
                                        </HStack>
                                        <Badge colorScheme={carro.status === 'completo' ? 'green' : 'orange'}>
                                            {carro.partes}/{carro.total} partes
                                        </Badge>
                                    </HStack>
                                    <Text color="gray.400" fontSize="sm" mb={2}>
                                        Piloto: {carro.piloto}
                                    </Text>
                                    <Progress 
                                        value={(carro.partes / carro.total) * 100} 
                                        colorScheme={carro.status === 'completo' ? 'green' : 'orange'}
                                        size="sm"
                                        borderRadius="full"
                                    />
                                </Box>
                            ))}
                        </VStack>
                    </CardBody>
                </Card>

                {/* Resumen inventario */}
                <Card bg="brand.800" borderColor="brand.700">
                    <CardBody>
                        <HStack justify="space-between" mb={4}>
                            <Heading size="md" color="white">Inventario</Heading>
                            <Button 
                                size="xs" 
                                variant="ghost" 
                                color="accent.400"
                                onClick={() => navigate('/equipos')}
                            >
                                Ver completo
                            </Button>
                        </HStack>
                        <VStack spacing={2} align="stretch">
                            {inventarioResumen.map((item, idx) => (
                                <HStack 
                                    key={idx} 
                                    p={3} 
                                    bg="brand.900" 
                                    borderRadius="md"
                                    justify="space-between"
                                >
                                    <HStack>
                                        <Package size={16} color="#a0aec0" />
                                        <Text color="white">{item.categoria}</Text>
                                    </HStack>
                                    <HStack spacing={4}>
                                        <Badge colorScheme="purple">{item.cantidad} unid.</Badge>
                                        <Text color="green.400" fontSize="sm" fontWeight="bold">
                                            {item.valor}
                                        </Text>
                                    </HStack>
                                </HStack>
                            ))}
                        </VStack>
                        
                        {/* Patrocinadores resumen */}
                        <Divider my={4} borderColor="brand.700" />
                        <Text fontSize="sm" color="gray.400" mb={2}>Principales Patrocinadores</Text>
                        <HStack spacing={2} flexWrap="wrap">
                            {patrocinadores.map((p, idx) => (
                                <Badge key={idx} colorScheme="green" variant="subtle">
                                    {p.nombre} (${p.aporte}M)
                                </Badge>
                            ))}
                        </HStack>
                    </CardBody>
                </Card>
            </SimpleGrid>

            <Card bg="brand.800" borderColor="brand.700">
                <CardBody>
                    <Heading size="md" color="white" mb={4}>Acciones Rápidas</Heading>
                    <Flex gap={3} flexWrap="wrap">
                        <Button 
                            leftIcon={<ShoppingCart size={16} />} 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate('/catalogo')}
                        >
                            Catálogo de Partes
                        </Button>
                        <Button 
                            leftIcon={<Wrench size={16} />} 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/equipos/${equipo.id}/carros/3`)}
                        >
                            Configurar SF-24-01
                        </Button>
                        <Button 
                            leftIcon={<Wrench size={16} />} 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/equipos/${equipo.id}/carros/4`)}
                        >
                            Configurar SF-24-02
                        </Button>
                        <Button 
                            leftIcon={<Package size={16} />} 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate('/equipos')}
                        >
                            Ver Inventario Completo
                        </Button>
                    </Flex>
                </CardBody>
            </Card>
        </VStack>
    );
}

function DriverDashboard() {
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [stats, setStats] = useState(null);

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
            
            setData(simData);
            setStats(statsData);
        } catch (err) {
            console.error('Error cargando datos:', err);
            setError(err.response?.data?.error || 'Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    // Función para formatear tiempo
    const formatTiempo = (segundos) => {
        if (!segundos) return '--';
        if (segundos >= 60) {
            const mins = Math.floor(segundos / 60);
            const secs = (segundos % 60).toFixed(2);
            return `${mins}:${secs.padStart(5, '0')}`;
        }
        return `${segundos.toFixed(2)}s`;
    };

    // Color según posición
    const getPosicionColor = (pos) => {
        if (pos === 1) return 'yellow.500';
        if (pos === 2) return 'gray.400';
        if (pos === 3) return 'orange.600';
        return 'brand.600';
    };

    // Nombres de circuitos por distancia
    const getNombreCircuito = (distancia) => {
        const nombres = {
            5.793: 'Monza',
            3.337: 'Monaco',
            7.004: 'Spa-Francorchamps',
            5.891: 'Silverstone',
            5.807: 'Suzuka',
            4.318: 'Barcelona',
            5.412: 'Interlagos',
            6.003: 'COTA'
        };
        return nombres[distancia] || `Circuito`;
    };

    if (loading) {
        return (
            <VStack spacing={6} align="center" py={20}>
                <Spinner size="xl" color="accent.500" />
                <Text color="gray.400">Cargando datos del piloto...</Text>
            </VStack>
        );
    }

    if (error) {
        return (
            <Alert status="error" bg="red.900" borderRadius="md">
                <AlertIcon />
                {error}
            </Alert>
        );
    }

    const carro = data?.carro;
    const simulaciones = data?.simulaciones || [];

    return (
        <VStack spacing={6} align="stretch">
            <Box>
                <Heading size="lg" color="white">Mi Perfil de Piloto</Heading>
                <HStack mt={1}>
                    <Box w="12px" h="12px" bg="red.600" borderRadius="sm" />
                    <Text color="gray.400">{usuario?.correo} - {carro?.equipo || 'Sin equipo'}</Text>
                </HStack>
            </Box>

            <Card bg="brand.800" borderColor="brand.700">
                <CardBody>
                    <HStack spacing={6} align="center">
                        <Avatar 
                            size="xl" 
                            name={usuario?.correo?.split('@')[0]}
                            bg="accent.600"
                        />
                        <Box flex={1}>
                            <HStack mb={1}>
                                <Heading size="md" color="white" textTransform="capitalize">
                                    {usuario?.correo?.split('@')[0] || 'Piloto'}
                                </Heading>
                                <Badge colorScheme="blue">{carro?.equipo}</Badge>
                            </HStack>
                            {carro ? (
                                <Text color="gray.400" fontSize="sm" mb={3}>
                                    Carro #{carro.id} • {carro.finalizado ? 'Listo para correr' : 'En construcción'}
                                </Text>
                            ) : (
                                <Text color="orange.400" fontSize="sm" mb={3}>
                                    No tienes un carro asignado
                                </Text>
                            )}
                        </Box>
                    </HStack>
                </CardBody>
            </Card>

            <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={4}>
                <StatCard 
                    icon={Trophy} 
                    label="Victorias" 
                    value={stats?.victorias || 0} 
                    color="yellow.500" 
                />
                <StatCard 
                    icon={Medal} 
                    label="Podios" 
                    value={stats?.podios || 0} 
                    color="purple.500" 
                />
                <StatCard 
                    icon={Flag} 
                    label="Carreras" 
                    value={stats?.carreras || 0} 
                    color="green.500" 
                />
                <StatCard 
                    icon={Clock} 
                    label="Mejor Tiempo" 
                    value={formatTiempo(stats?.mejorTiempo)} 
                    color="blue.500" 
                />
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                {/* Rendimiento del carro */}
                {carro && (
                    <Card bg="brand.800" borderColor="brand.700">
                        <CardBody>
                            <Heading size="md" color="white" mb={4}>Rendimiento del Carro</Heading>
                            <VStack spacing={4}>
                                <Box w="full">
                                    <HStack justify="space-between" mb={1}>
                                        <HStack>
                                            <Box w="8px" h="8px" bg="yellow.400" borderRadius="full" />
                                            <Text fontSize="sm" color="gray.400">Potencia (P)</Text>
                                        </HStack>
                                        <Text fontSize="sm" color="white" fontWeight="bold">{carro.stats.P}</Text>
                                    </HStack>
                                    <Progress 
                                        value={(carro.stats.P / 45) * 100} 
                                        colorScheme="yellow"
                                        bg="brand.700" 
                                        size="sm" 
                                        borderRadius="full"
                                    />
                                </Box>
                                <Box w="full">
                                    <HStack justify="space-between" mb={1}>
                                        <HStack>
                                            <Box w="8px" h="8px" bg="blue.400" borderRadius="full" />
                                            <Text fontSize="sm" color="gray.400">Aerodinámica (A)</Text>
                                        </HStack>
                                        <Text fontSize="sm" color="white" fontWeight="bold">{carro.stats.A}</Text>
                                    </HStack>
                                    <Progress 
                                        value={(carro.stats.A / 45) * 100} 
                                        colorScheme="blue"
                                        bg="brand.700" 
                                        size="sm" 
                                        borderRadius="full"
                                    />
                                </Box>
                                <Box w="full">
                                    <HStack justify="space-between" mb={1}>
                                        <HStack>
                                            <Box w="8px" h="8px" bg="green.400" borderRadius="full" />
                                            <Text fontSize="sm" color="gray.400">Manejo (M)</Text>
                                        </HStack>
                                        <Text fontSize="sm" color="white" fontWeight="bold">{carro.stats.M}</Text>
                                    </HStack>
                                    <Progress 
                                        value={(carro.stats.M / 45) * 100} 
                                        colorScheme="green"
                                        bg="brand.700" 
                                        size="sm" 
                                        borderRadius="full"
                                    />
                                </Box>
                            </VStack>
                        </CardBody>
                    </Card>
                )}

                {/* Historial de Simulaciones */}
                <Card bg="brand.800" borderColor="brand.700">
                    <CardBody>
                        <HStack justify="space-between" mb={4}>
                            <Heading size="md" color="white">Historial de Simulaciones</Heading>
                            <Button 
                                size="xs" 
                                variant="ghost" 
                                color="accent.400"
                                onClick={() => navigate('/simulaciones')}
                            >
                                Ver todas
                            </Button>
                        </HStack>
                        
                        {simulaciones.length === 0 ? (
                            <Text color="gray.500" textAlign="center" py={4}>
                                No has participado en simulaciones aún
                            </Text>
                        ) : (
                            <VStack spacing={0} align="stretch" divider={<Divider borderColor="brand.700" />}>
                                {simulaciones.slice(0, 5).map((sim) => (
                                    <Box key={sim.id} py={3}>
                                        <HStack justify="space-between" mb={2}>
                                            <HStack spacing={3}>
                                                <Badge 
                                                    bg={getPosicionColor(sim.posicion)}
                                                    color={sim.posicion === 2 ? 'black' : 'white'}
                                                    px={2} 
                                                    py={1}
                                                    borderRadius="md"
                                                    fontWeight="bold"
                                                    fontSize="sm"
                                                >
                                                    P{sim.posicion}
                                                </Badge>
                                                <VStack align="start" spacing={0}>
                                                    <Text color="white" fontSize="sm" fontWeight="bold">
                                                        {getNombreCircuito(sim.circuito?.distancia)}
                                                    </Text>
                                                    <Text color="gray.500" fontSize="xs">
                                                        {new Date(sim.fecha).toLocaleDateString()}
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                            <VStack align="end" spacing={0}>
                                                <Text color="accent.400" fontWeight="bold" fontSize="sm">
                                                    {formatTiempo(sim.tiempo)}
                                                </Text>
                                                <Text color="gray.500" fontSize="xs">
                                                    Vrecta: {sim.vrecta?.toFixed(0)} km/h
                                                </Text>
                                            </VStack>
                                        </HStack>
                                        <HStack spacing={2} flexWrap="wrap">
                                            <Badge size="sm" colorScheme="yellow" variant="subtle">
                                                P:{sim.stats?.P}
                                            </Badge>
                                            <Badge size="sm" colorScheme="blue" variant="subtle">
                                                A:{sim.stats?.A}
                                            </Badge>
                                            <Badge size="sm" colorScheme="green" variant="subtle">
                                                M:{sim.stats?.M}
                                            </Badge>
                                            <Text color="gray.600" fontSize="xs">•</Text>
                                            <Text color="gray.500" fontSize="xs">
                                                {sim.circuito?.distancia}km, {sim.circuito?.curvas} curvas
                                            </Text>
                                        </HStack>
                                    </Box>
                                ))}
                            </VStack>
                        )}
                    </CardBody>
                </Card>
            </SimpleGrid>

            <Card bg="brand.800" borderColor="brand.700">
                <CardBody>
                    <Heading size="md" color="white" mb={4}>Acciones</Heading>
                    <Flex gap={3} flexWrap="wrap">
                        <Button 
                            leftIcon={<Flag size={16} />} 
                            colorScheme="red"
                            size="sm"
                            onClick={() => navigate('/simulaciones')}
                        >
                            Ver Simulaciones
                        </Button>
                    </Flex>
                </CardBody>
            </Card>
        </VStack>
    );
}

export default Dashboard;
