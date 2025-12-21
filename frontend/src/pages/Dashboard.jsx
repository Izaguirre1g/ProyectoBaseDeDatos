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
    Flex,
    Button,
    Badge,
    Progress,
    Avatar,
    Divider,
    Icon,
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
    const stats = [
        { label: 'Usuarios', value: 3, icon: Users, color: 'blue.500' },
        { label: 'Equipos', value: 5, icon: Building2, color: 'green.500' },
        { label: 'Conductores', value: 10, icon: Car, color: 'yellow.500' },
        { label: 'Simulaciones', value: 12, icon: Flag, color: 'accent.600' },
    ];

    const activities = [
        { time: 'Hace 2h', text: 'Simulacion #12 completada - Circuito de Monaco' },
        { time: 'Hace 5h', text: 'Red Bull Racing compro Power Unit Honda' },
        { time: 'Ayer', text: 'Ferrari agrego nuevo patrocinador: Shell' },
    ];

    return (
        <VStack spacing={6} align="stretch">
            <Box>
                <Heading size="lg" color="white">Panel de Administracion</Heading>
                <Text color="gray.400" mt={1}>Vista general del sistema</Text>
            </Box>

            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </SimpleGrid>

            <Card bg="brand.800" borderColor="brand.700">
                <CardBody>
                    <Heading size="md" color="white" mb={4}>Acciones Rapidas</Heading>
                    <Flex gap={3} flexWrap="wrap">
                        <Button leftIcon={<Plus size={16} />} variant="outline" size="sm">
                            Nuevo Usuario
                        </Button>
                        <Button leftIcon={<Plus size={16} />} variant="outline" size="sm">
                            Nuevo Equipo
                        </Button>
                        <Button leftIcon={<Flag size={16} />} variant="outline" size="sm">
                            Nueva Simulacion
                        </Button>
                        <Button leftIcon={<BarChart3 size={16} />} variant="outline" size="sm">
                            Ver Grafana
                        </Button>
                    </Flex>
                </CardBody>
            </Card>

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
                                <Text color="gray.300">{activity.text}</Text>
                            </HStack>
                        ))}
                    </VStack>
                </CardBody>
            </Card>
        </VStack>
    );
}

function EngineerDashboard() {
    const equipo = {
        nombre: 'Red Bull Racing',
        presupuesto: 145000000,
        carros: 2,
        partes: 24
    };

    const carros = [
        { numero: 1, modelo: 'RB20', conductor: 'Max Verstappen', p: 42, a: 38, m: 35 },
        { numero: 11, modelo: 'RB20', conductor: 'Sergio Perez', p: 40, a: 36, m: 33 },
    ];

    return (
        <VStack spacing={6} align="stretch">
            <Box>
                <Heading size="lg" color="white">Panel de Ingeniero</Heading>
                <Text color="gray.400" mt={1}>Equipo: {equipo.nombre}</Text>
            </Box>

            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
                <StatCard 
                    icon={DollarSign} 
                    label="Presupuesto" 
                    value={`$${(equipo.presupuesto / 1000000).toFixed(0)}M`} 
                    color="green.500" 
                />
                <StatCard 
                    icon={Car} 
                    label="Carros" 
                    value={`${equipo.carros}/2`} 
                    color="blue.500" 
                />
                <StatCard 
                    icon={Package} 
                    label="Partes en Inventario" 
                    value={equipo.partes} 
                    color="yellow.500" 
                />
            </SimpleGrid>

            <Card bg="brand.800" borderColor="brand.700">
                <CardBody>
                    <Heading size="md" color="white" mb={4}>Carros del Equipo</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {carros.map((carro) => (
                            <Box 
                                key={carro.numero}
                                bg="brand.900" 
                                p={5} 
                                borderRadius="lg"
                                borderWidth="1px"
                                borderColor="brand.700"
                            >
                                <HStack justify="space-between" mb={2}>
                                    <Heading size="sm" color="white">
                                        #{carro.numero} {carro.modelo}
                                    </Heading>
                                    <Badge colorScheme="green" variant="subtle">Finalizado</Badge>
                                </HStack>
                                <Text color="gray.400" fontSize="sm" mb={3}>
                                    Conductor: {carro.conductor}
                                </Text>
                                <HStack spacing={4} color="gray.500" fontSize="sm">
                                    <Text>P: {carro.p}</Text>
                                    <Text>A: {carro.a}</Text>
                                    <Text>M: {carro.m}</Text>
                                </HStack>
                            </Box>
                        ))}
                    </SimpleGrid>
                </CardBody>
            </Card>

            <Card bg="brand.800" borderColor="brand.700">
                <CardBody>
                    <Heading size="md" color="white" mb={4}>Acciones</Heading>
                    <Flex gap={3} flexWrap="wrap">
                        <Button leftIcon={<ShoppingCart size={16} />} variant="outline" size="sm">
                            Comprar Partes
                        </Button>
                        <Button leftIcon={<Wrench size={16} />} variant="outline" size="sm">
                            Configurar Carro
                        </Button>
                        <Button leftIcon={<Package size={16} />} variant="outline" size="sm">
                            Ver Inventario
                        </Button>
                    </Flex>
                </CardBody>
            </Card>
        </VStack>
    );
}

function DriverDashboard() {
    const driver = {
        nombre: 'Carlos Sainz',
        equipo: 'Ferrari',
        numero: 55,
        habilidad: 85,
        victorias: 3,
        podios: 15,
        puntos: 245
    };

    const races = [
        { position: 'P2', name: 'GP de Espana - Barcelona' },
        { position: 'P1', name: 'GP de Monaco - Monte Carlo' },
        { position: 'P4', name: 'GP de Miami - Hard Rock Stadium' },
    ];

    return (
        <VStack spacing={6} align="stretch">
            <Box>
                <Heading size="lg" color="white">Mi Perfil</Heading>
                <Text color="gray.400" mt={1}>#{driver.numero} - {driver.equipo}</Text>
            </Box>

            <Card bg="brand.800" borderColor="brand.700">
                <CardBody>
                    <HStack spacing={6} align="center">
                        <Avatar 
                            size="xl" 
                            bg="accent.600" 
                            icon={<Car size={40} color="white" />} 
                        />
                        <Box flex={1}>
                            <Heading size="md" color="white">{driver.nombre}</Heading>
                            <Box mt={3}>
                                <HStack justify="space-between" mb={1}>
                                    <Text fontSize="sm" color="gray.400">Habilidad</Text>
                                    <Text fontSize="sm" color="gray.400">{driver.habilidad}/100</Text>
                                </HStack>
                                <Progress 
                                    value={driver.habilidad} 
                                    colorScheme="green" 
                                    bg="brand.700"
                                    borderRadius="full"
                                    size="sm"
                                />
                            </Box>
                        </Box>
                    </HStack>
                </CardBody>
            </Card>

            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
                <StatCard 
                    icon={Trophy} 
                    label="Victorias" 
                    value={driver.victorias} 
                    color="yellow.500" 
                />
                <StatCard 
                    icon={Medal} 
                    label="Podios" 
                    value={driver.podios} 
                    color="purple.500" 
                />
                <StatCard 
                    icon={Star} 
                    label="Puntos" 
                    value={driver.puntos} 
                    color="green.500" 
                />
            </SimpleGrid>

            <Card bg="brand.800" borderColor="brand.700">
                <CardBody>
                    <Heading size="md" color="white" mb={4}>Ultimas Carreras</Heading>
                    <VStack spacing={0} align="stretch" divider={<Divider borderColor="brand.700" />}>
                        {races.map((race, index) => (
                            <HStack key={index} py={3} spacing={4}>
                                <Badge 
                                    bg="accent.600" 
                                    color="white" 
                                    px={2} 
                                    py={1}
                                    borderRadius="md"
                                    fontWeight="bold"
                                >
                                    {race.position}
                                </Badge>
                                <Text color="gray.300">{race.name}</Text>
                            </HStack>
                        ))}
                    </VStack>
                </CardBody>
            </Card>
        </VStack>
    );
}

export default Dashboard;
