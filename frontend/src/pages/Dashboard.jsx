import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import simulacionesService from '../services/simulaciones.service';
import { carrosService } from '../services/carros.service';
import { equiposService } from '../services/equipos.service';
import { usuariosService } from '../services/usuarios.service';
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
    const [simulaciones, setSimulaciones] = useState([]);
    const [loadingSimulaciones, setLoadingSimulaciones] = useState(true);
    const [equipos, setEquipos] = useState([]);
    const [loadingEquipos, setLoadingEquipos] = useState(true);
    const [stats, setStats] = useState([
        { label: 'Usuarios', value: '-', icon: Users, color: 'blue.500' },
        { label: 'Equipos', value: '-', icon: Building2, color: 'green.500' },
        { label: 'Pilotos', value: '-', icon: Car, color: 'yellow.500' },
        { label: 'Presupuesto Total', value: '$0M', icon: DollarSign, color: 'accent.600' },
    ]);
    
    useEffect(() => {
        loadSimulaciones();
        loadEquipos();
        loadUsuariosYPilotos();
    }, []);

    const loadEquipos = async () => {
        try {
            const equiposRaw = await equiposService.getAll();
            
            // Para cada equipo, cargar su presupuesto real
            const equiposConPresupuesto = await Promise.all(equiposRaw.map(async (eq) => {
                try {
                    const presupuestoData = await equiposService.getPresupuesto(eq.Id_equipo);
                    return {
                        id: eq.Id_equipo,
                        nombre: eq.Nombre,
                        presupuesto: presupuestoData?.TotalAportes || 0,
                        disponible: presupuestoData?.Presupuesto || 0,
                        color: getColorEquipo(eq.Nombre)
                    };
                } catch (err) {
                    return {
                        id: eq.Id_equipo,
                        nombre: eq.Nombre,
                        presupuesto: 0,
                        disponible: 0,
                        color: '#666'
                    };
                }
            }));
            
            // Ordenar por presupuesto descendente y tomar los top 4
            const equiposOrdenados = equiposConPresupuesto
                .sort((a, b) => b.presupuesto - a.presupuesto)
                .slice(0, 4);
            
            setEquipos(equiposOrdenados);
            
            // Actualizar stats con el presupuesto total real y equipos
            const presupuestoTotal = equiposConPresupuesto.reduce((acc, e) => acc + e.presupuesto, 0);
            const presupuestoFormato = new Intl.NumberFormat('es-CR', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0
            }).format(presupuestoTotal);
            
            // Obtener el estado actual de usuarios y pilotos
            setStats((statsActuales) => [
                { label: 'Usuarios', value: statsActuales[0].value, icon: Users, color: 'blue.500' },
                { label: 'Equipos', value: equiposRaw.length, icon: Building2, color: 'green.500' },
                { label: 'Pilotos', value: statsActuales[2].value, icon: Car, color: 'yellow.500' },
                { label: 'Presupuesto Total', value: presupuestoFormato, icon: DollarSign, color: 'accent.600' },
            ]);
        } catch (error) {
            console.error('Error al cargar equipos:', error);
        } finally {
            setLoadingEquipos(false);
        }
    };
    
    const loadUsuariosYPilotos = async () => {
        try {
            const usuarios = await usuariosService.getAll();
            const totalUsuarios = usuarios.length;
            
            // Contar pilotos (usuarios con Id_rol === 3, que es el rol de Conductor/Piloto)
            const pilotos = usuarios.filter(u => u.Id_rol === 3).length;
            
            // Actualizar stats con usuarios y pilotos
            setStats((statsActuales) => [
                { label: 'Usuarios', value: totalUsuarios, icon: Users, color: 'blue.500' },
                { label: 'Equipos', value: statsActuales[1].value, icon: Building2, color: 'green.500' },
                { label: 'Pilotos', value: pilotos, icon: Car, color: 'yellow.500' },
                { label: 'Presupuesto Total', value: statsActuales[3].value, icon: DollarSign, color: 'accent.600' },
            ]);
        } catch (error) {
            console.error('Error al cargar usuarios y pilotos:', error);
        }
    };
    
    const getColorEquipo = (nombre) => {
        const colores = {
            'Scuderia Ferrari': '#DC0000',
            'Oracle Red Bull Racing': '#1E41FF',
            'Mercedes-AMG Petronas': '#00D2BE',
            'McLaren F1 Team': '#FF8700',
            'Aston Martin F1': '#006F62',
            'Alpine F1 Team': '#0090FF',
        };
        return colores[nombre] || '#666666';
    };

    const loadSimulaciones = async () => {
        try {
            const data = await simulacionesService.getSimulaciones();
            // Asegurar que data es un array
            const simulacionesArray = Array.isArray(data) ? data : data?.simulaciones || [];
            setSimulaciones(simulacionesArray.slice(0, 5)); // Últimas 5 simulaciones
        } catch (error) {
            console.error('Error al cargar simulaciones:', error);
        } finally {
            setLoadingSimulaciones(false);
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return 'Sin fecha';
        const date = new Date(fecha);
        const ahora = new Date();
        const diff = ahora - date;
        const minutos = Math.floor(diff / 60000);
        const horas = Math.floor(diff / 3600000);
        const dias = Math.floor(diff / 86400000);
        
        if (minutos < 60) return `Hace ${minutos} min`;
        if (horas < 24) return `Hace ${horas}h`;
        if (dias === 1) return 'Ayer';
        return date.toLocaleDateString();
    };

    // Los stats y equipos ahora se cargan dinámicamente

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
                    <Heading size="md" color="white" mb={4}>Acciones rápidas</Heading>
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
                            leftIcon={<Flag size={16} />} 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate('/simulaciones')}
                        >
                            Simulaciones
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
                            <Heading size="md" color="white">Equipos por presupuesto</Heading>
                            <Button 
                                size="xs" 
                                variant="ghost" 
                                color="accent.400"
                                onClick={() => navigate('/equipos')}
                            >
                                Ver todos
                            </Button>
                        </HStack>
                        {loadingEquipos ? (
                            <Flex justify="center" py={4}>
                                <Spinner color="accent.400" />
                            </Flex>
                        ) : equipos.length === 0 ? (
                            <Text color="gray.500" textAlign="center" py={4}>
                                No hay equipos registrados
                            </Text>
                        ) : (
                            <VStack spacing={3} align="stretch">
                                {equipos.map((equipo, idx) => (
                                    <HStack 
                                        key={equipo.id} 
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
                                            <Text fontSize="xs" color="gray.400">
                                                Disponible: ${new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(equipo.disponible)}
                                            </Text>
                                        </Box>
                                        <VStack spacing={0} align="end">
                                            <Text color="green.400" fontWeight="bold">
                                                ${new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(equipo.presupuesto)}
                                            </Text>
                                            <Text fontSize="xs" color="gray.500">total aportes</Text>
                                        </VStack>
                                    </HStack>
                                ))}
                            </VStack>
                        )}
                    </CardBody>
                </Card>

                {/* Simulaciones Recientes */}
                <Card bg="brand.800" borderColor="brand.700">
                    <CardBody>
                        <HStack justify="space-between" mb={4}>
                            <Heading size="md" color="white">Simulaciones recientes</Heading>
                            <Button 
                                size="xs" 
                                variant="ghost" 
                                color="accent.400"
                                onClick={() => navigate('/simulaciones')}
                            >
                                Ver todas
                            </Button>
                        </HStack>
                        {loadingSimulaciones ? (
                            <Flex justify="center" py={4}>
                                <Spinner color="accent.400" />
                            </Flex>
                        ) : simulaciones.length === 0 ? (
                            <Text color="gray.500" textAlign="center" py={4}>
                                No hay simulaciones registradas
                            </Text>
                        ) : (
                            <VStack spacing={0} align="stretch" divider={<Divider borderColor="brand.700" />}>
                                {simulaciones.map((sim, index) => (
                                    <HStack key={index} py={3} spacing={4}>
                                        <HStack spacing={2}>
                                            <Flag size={14} color="#718096" />
                                            <Text fontSize="sm" color="gray.500" minW="70px">
                                                {formatearFecha(sim.Fecha)}
                                            </Text>
                                        </HStack>
                                        <Box flex={1}>
                                            <Text color="gray.300" fontSize="sm">
                                                Circuito #{sim.Id_circuito}
                                            </Text>
                                            <Text color="gray.500" fontSize="xs">
                                                {sim.Distancia_total}km, {sim.Cantidad_curvas} curvas
                                            </Text>
                                        </Box>
                                        <Badge colorScheme="green" fontSize="xs">
                                            Completada
                                        </Badge>
                                    </HStack>
                                ))}
                            </VStack>
                        )}
                    </CardBody>
                </Card>
            </SimpleGrid>
        </VStack>
    );
}

function EngineerDashboard() {
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const [loading, setLoading] = useState(true);
    const [equipo, setEquipo] = useState(null);
    const [carros, setCarros] = useState([]);
    const [inventario, setInventario] = useState([]);
    const [patrocinadores, setPatrocinadores] = useState([]);
    const [presupuesto, setPresupuesto] = useState({});

    useEffect(() => {
        const loadData = async () => {
            if (!usuario?.equipoId) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const { equiposService } = await import('../services/equipos.service');
                const equipoId = usuario.equipoId;

                const [equipoData, carrosData, inventarioData, patroData, presupuestoData] = await Promise.all([
                    equiposService.getById(equipoId),
                    equiposService.getCarros(equipoId),
                    equiposService.getInventario(equipoId),
                    equiposService.getPatrocinadores(equipoId),
                    equiposService.getPresupuesto(equipoId)
                ]);

                setEquipo({
                    id: equipoData.Id_equipo,
                    nombre: equipoData.Nombre,
                    color: '#DC0000'
                });

                // Obtener conteo de partes para cada carro
                const carrosConPartes = await Promise.all(
                    carrosData.map(async (c) => {
                        try {
                            const partesData = await carrosService.getPartes(c.Id_carro);
                            const numPartes = partesData ? (Array.isArray(partesData) ? partesData.length : (partesData.Count || 0)) : 0;
                            return {
                                id: c.Id_carro,
                                nombre: `Carro #${c.Id_carro}`,
                                piloto: c.Conductor || 'Sin asignar',
                                numero: c.Id_carro,
                                partes: numPartes,
                                total: 5,
                                status: c.Finalizado ? 'completo' : 'incompleto'
                            };
                        } catch (error) {
                            console.error(`Error al contar partes del carro ${c.Id_carro}:`, error);
                            return {
                                id: c.Id_carro,
                                nombre: `Carro #${c.Id_carro}`,
                                piloto: c.Conductor || 'Sin asignar',
                                numero: c.Id_carro,
                                partes: 0,
                                total: 5,
                                status: c.Finalizado ? 'completo' : 'incompleto'
                            };
                        }
                    })
                );
                setCarros(carrosConPartes);

                // Agrupar inventario por categoría
                const inventarioAgrupado = inventarioData.reduce((acc, item) => {
                    const cat = item.Categoria || 'Otros';
                    if (!acc[cat]) acc[cat] = { categoria: cat, cantidad: 0, valor: 0 };
                    acc[cat].cantidad += item.Cantidad || 1;
                    acc[cat].valor += (item.Precio || 0) * (item.Cantidad || 1);
                    return acc;
                }, {});
                setInventario(Object.values(inventarioAgrupado));

                setPatrocinadores(patroData.slice(0, 3).map(p => ({
                    nombre: p.Nombre,
                    aporte: Math.round((p.MontoTotal || 0) / 1000000)
                })));

                setPresupuesto({
                    total: presupuestoData.TotalAportes || 0,
                    gastado: presupuestoData.TotalGastos || 0,
                    disponible: presupuestoData.Presupuesto || 0
                });
            } catch (error) {
                console.error('Error cargando datos del ingeniero:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [usuario?.equipoId]);

    if (loading) {
        return (
            <VStack spacing={4} align="center" justify="center" minH="50vh">
                <Spinner size="xl" color="accent.500" />
                <Text color="gray.400">Cargando datos del equipo...</Text>
            </VStack>
        );
    }

    if (!equipo) {
        return (
            <Alert status="warning">
                <AlertIcon />
                No tienes un equipo asignado. Contacta al administrador.
            </Alert>
        );
    }

    return (
        <VStack spacing={6} align="stretch">
            <HStack justify="space-between" align="start">
                <Box>
                    <Heading size="lg" color="white">Panel de Ingeniero</Heading>
                    <HStack mt={1}>
                        <Box w="12px" h="12px" bg={equipo.color} borderRadius="sm" />
                        <Text color="gray.400">{equipo.nombre}</Text>
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
                    value={new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(presupuesto.total)}
                    color="green.500" 
                />
                <StatCard 
                    icon={TrendingUp} 
                    label="Disponible" 
                    value={new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(presupuesto.disponible)}
                    color="blue.500" 
                />
                <StatCard 
                    icon={Car} 
                    label="Carros" 
                    value={`${carros.length}`} 
                    color="yellow.500" 
                />
                <StatCard 
                    icon={Package} 
                    label="Partes en Inventario" 
                    value={inventario.reduce((acc, i) => acc + i.cantidad, 0)} 
                    color="purple.500" 
                />
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                {/* Carros del equipo */}
                <Card bg="brand.800" borderColor="brand.700">
                    <CardBody>
                        <HStack justify="space-between" mb={4}>
                            <Heading size="md" color="white">Carros del equipo</Heading>
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
                            {inventario.length > 0 ? inventario.map((item, idx) => (
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
                                            ${new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(item.valor)}
                                        </Text>
                                    </HStack>
                                </HStack>
                            )) : (
                                <Text color="gray.500" textAlign="center">Sin partes en inventario</Text>
                            )}
                        </VStack>
                        
                        {/* Patrocinadores resumen */}
                        <Divider my={4} borderColor="brand.700" />
                        <Text fontSize="sm" color="gray.400" mb={2}>Principales patrocinadores</Text>
                        <HStack spacing={2} flexWrap="wrap">
                            {patrocinadores.length > 0 ? patrocinadores.map((p, idx) => (
                                <Badge key={idx} colorScheme="green" variant="subtle">
                                    {p.nombre} {p.aporte > 0 ? `($${p.aporte}M)` : ''}
                                </Badge>
                            )) : (
                                <Text color="gray.500" fontSize="sm">Sin patrocinadores</Text>
                            )}
                        </HStack>
                    </CardBody>
                </Card>
            </SimpleGrid>

            <Card bg="brand.800" borderColor="brand.700">
                <CardBody>
                    <Heading size="md" color="white" mb={4}>Acciones rápidas</Heading>
                    <Flex gap={3} flexWrap="wrap">
                        <Button 
                            leftIcon={<ShoppingCart size={16} />} 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate('/catalogo')}
                        >
                            Catálogo de Partes
                        </Button>
                        {carros.slice(0, 2).map((carro) => (
                            <Button 
                                key={carro.id}
                                leftIcon={<Wrench size={16} />} 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/equipos/${equipo.id}/carros/${carro.id}`)}
                            >
                                Configurar {carro.nombre}
                            </Button>
                        ))}
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
                            <Heading size="md" color="white">Historial de simulaciones</Heading>
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
