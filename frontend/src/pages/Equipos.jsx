import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { carrosService } from '../services/carros.service';
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
    IconButton,
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
    Trash2,
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
    const habilidadColor = piloto.habilidad >= 80 ? 'green' : piloto.habilidad >= 50 ? 'yellow' : 'red';
    
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
                            {piloto.habilidad !== null && piloto.habilidad !== undefined && (
                                <Badge colorScheme={habilidadColor} fontSize="sm">
                                    H: {piloto.habilidad}
                                </Badge>
                            )}
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
function CarroCard({ carro, onClick, onDelete }) {
    const completitud = carro.partes || 0;
    const total = 5;
    const porcentaje = (completitud / total) * 100;

    const handleDelete = (e) => {
        e.stopPropagation(); // Evitar que se dispare onClick del Card
        if (onDelete) onDelete(carro.id);
    };

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
                        <HStack>
                            <Badge colorScheme={porcentaje === 100 ? 'green' : 'orange'}>
                                {completitud}/{total} partes
                            </Badge>
                            <IconButton
                                icon={<Trash2 size={14} />}
                                size="xs"
                                colorScheme="red"
                                variant="ghost"
                                aria-label="Eliminar carro"
                                onClick={handleDelete}
                            />
                        </HStack>
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
                            ${new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(patrocinador.aporte)}
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
    const { isOpen: isAporteOpen, onOpen: onAporteOpen, onClose: onAporteClose } = useDisclosure();
    const { isOpen: isCarroOpen, onOpen: onCarroOpen, onClose: onCarroClose } = useDisclosure();
    const { usuario, isEngineer } = useAuth();
    
    // Los ingenieros solo pueden ver su equipo asignado
    const esIngeniero = isEngineer();
    const equipoAsignadoId = usuario?.equipoId || null;
    
    // Estado para nuevo equipo
    const [nuevoEquipo, setNuevoEquipo] = useState({
        nombre: ''
    });
    
    // Estado para nuevo aporte
    const [nuevoAporte, setNuevoAporte] = useState({
        idPatrocinador: '',
        monto: '',
        descripcion: ''
    });
    
    // Estado para nuevo patrocinador
    const [nuevoPatrocinador, setNuevoPatrocinador] = useState('');
    const [creandoPatrocinador, setCreandoPatrocinador] = useState(false);
    const [mostrarNuevoPatrocinador, setMostrarNuevoPatrocinador] = useState(false);
    
    // Estado para nuevo carro
    const [nuevoCarro, setNuevoCarro] = useState({
        idConductor: ''
    });
    const [conductoresDisponibles, setConductoresDisponibles] = useState([]);
    const [loadingConductores, setLoadingConductores] = useState(false);
    const [creandoCarro, setCreandoCarro] = useState(false);
    
    // Estado para patrocinadores disponibles
    const [patrocinadores, setPatrocinadores] = useState([]);
    const [loadingPatrocinadores, setLoadingPatrocinadores] = useState(false);


    useEffect(() => {
        loadEquipos();
    }, []);

    // Carga todos los equipos y sus detalles
    const loadEquipos = async () => {
        try {
            setLoading(true);
            let equiposRaw = await equiposService.getAll();

            // Si es ingeniero, filtrar solo su equipo asignado
            if (esIngeniero) {
                equiposRaw = equiposRaw.filter(e => e.Id_equipo === equipoAsignadoId);
            }

            // Para cada equipo, cargar detalles
            const equiposDetallados = await Promise.all(equiposRaw.map(async (eq) => {
                const [pilotos, carros, inventario, patrocinadores, presupuestoData, gastos] = await Promise.all([
                    equiposService.getPilotos(eq.Id_equipo),
                    equiposService.getCarros(eq.Id_equipo),
                    equiposService.getInventario(eq.Id_equipo),
                    equiposService.getPatrocinadores(eq.Id_equipo),
                    equiposService.getPresupuesto(eq.Id_equipo),
                    equiposService.getGastos(eq.Id_equipo)
                ]);

                // Obtener conteo de partes para cada carro
                const carrosConPartes = await Promise.all(
                    carros.map(async (c) => {
                        try {
                            const partesData = await carrosService.getPartes(c.Id_carro);
                            const numPartes = partesData ? (Array.isArray(partesData) ? partesData.length : (partesData.Count || 0)) : 0;
                            return {
                                id: c.Id_carro,
                                nombre: eq.Nombre + ' Carro #' + c.Id_carro,
                                piloto: c.Conductor,
                                configuracion: {},
                                finalizado: c.Finalizado,
                                partes: numPartes
                            };
                        } catch (error) {
                            console.error(`Error al obtener partes del carro ${c.Id_carro}:`, error);
                            return {
                                id: c.Id_carro,
                                nombre: eq.Nombre + ' Carro #' + c.Id_carro,
                                piloto: c.Conductor,
                                configuracion: {},
                                finalizado: c.Finalizado,
                                partes: 0
                            };
                        }
                    })
                );

                // Transformar datos para la UI
                return {
                    id: eq.Id_equipo,
                    nombre: eq.Nombre,
                    pais: '', // No disponible en BD
                    colorPrimario: '#e10600', // Default, no disponible en BD
                    presupuesto: {
                        total: presupuestoData.Presupuesto || 0,
                        gastado: presupuestoData.TotalGastos || 0,
                        disponible: presupuestoData.Presupuesto || 0,
                        sponsors: patrocinadores.reduce((acc, p) => acc + (p.MontoTotal || 0), 0),
                        distribucion: [] // No disponible en BD
                    },
                    pilotos: pilotos.map(p => ({
                        id: p.Id_usuario,
                        nombre: p.Nombre_usuario || p.Correo_usuario,
                        nacionalidad: '',
                        campeonatos: 0,
                        victorias: 0,
                        numero: p.Id_usuario,
                        habilidad: p.Habilidad || p.Nivel_Habilidad || 75
                    })),
                    carros: carrosConPartes,
                    inventario: inventario.map(i => ({
                        nombre: i.Nombre,
                        categoria: i.Categoria,
                        cantidad: i.Cantidad,
                        precio: i.Precio
                    })),
                    patrocinadores: patrocinadores.map(p => ({
                        id: p.Id_patrocinador,
                        nombre: p.Nombre,
                        tipo: 'Aporte',
                        aporte: p.MontoTotal || 0
                    })),
                    gastos: gastos.map(g => ({
                        id: g.Id_pedido,
                        fecha: g.Fecha,
                        monto: g.Costo_total,
                        descripcion: g.Partes || 'Compra de partes'
                    })),
                    campeonatos: 0,
                    fundacion: 2026,
                    nombreCompleto: eq.Nombre
                };
            }));

            setEquipos(equiposDetallados);
            if (equiposDetallados.length > 0) {
                setSelectedEquipo(equiposDetallados[0]);
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

    // Cargar patrocinadores al abrir el modal de aporte
    const handleOpenAporteModal = async () => {
        setLoadingPatrocinadores(true);
        try {
            const data = await equiposService.getAllPatrocinadores();
            setPatrocinadores(data);
        } catch (error) {
            console.error('Error cargando patrocinadores:', error);
            toast({
                title: 'Error',
                description: 'No se pudieron cargar los patrocinadores',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoadingPatrocinadores(false);
        }
        onAporteOpen();
    };

    const handleAgregarAporte = async () => {
        if (!nuevoAporte.idPatrocinador || !nuevoAporte.monto) {
            toast({
                title: 'Campos incompletos',
                description: 'Por favor selecciona un patrocinador y monto',
                status: 'warning',
                duration: 3000,
            });
            return;
        }
        
        const montoNumerico = parseFloat(nuevoAporte.monto);
        if (isNaN(montoNumerico) || montoNumerico <= 0) {
            toast({
                title: 'Monto inválido',
                description: 'Por favor ingresa un monto válido',
                status: 'error',
                duration: 3000,
            });
            return;
        }
        
        try {
            // Obtener nombre del patrocinador seleccionado
            const patrocinadorSeleccionado = patrocinadores.find(
                p => p.Id_patrocinador === parseInt(nuevoAporte.idPatrocinador)
            );
            
            // Llamar al backend para agregar el aporte usando SP
            const result = await equiposService.agregarAporte(selectedEquipo.id, {
                monto: montoNumerico,
                idPatrocinador: parseInt(nuevoAporte.idPatrocinador),
                descripcion: nuevoAporte.descripcion || null
            });
            
            console.log('Resultado agregar aporte:', result);
            
            // Recargar los equipos para reflejar el cambio
            await loadEquipos();
            
            // Limpiar formulario y cerrar modal
            setNuevoAporte({ idPatrocinador: '', monto: '', descripcion: '' });
            onAporteClose();
            
            toast({
                title: 'Aporte agregado',
                description: `${new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(montoNumerico)} agregados desde ${patrocinadorSeleccionado?.Nombre}`,
                status: 'success',
                duration: 3000,
            });
        } catch (error) {
            console.error('Error agregando aporte:', error);
            toast({
                title: 'Error',
                description: 'No se pudo agregar el aporte',
                status: 'error',
                duration: 3000,
            });
        }
    };
    
    // Manejar apertura del modal de nuevo carro
    const handleNuevoCarroClick = async () => {
        if (!selectedEquipo) return;
        
        // Verificar si ya tiene 2 carros
        if (selectedEquipo.carros?.length >= 2) {
            toast({
                title: 'Límite alcanzado',
                description: 'El equipo ya tiene el máximo de 2 carros permitidos',
                status: 'warning',
                duration: 3000,
            });
            return;
        }
        
        // Cargar conductores disponibles
        setLoadingConductores(true);
        try {
            const conductores = await carrosService.getConductoresDisponibles(selectedEquipo.id);
            setConductoresDisponibles(conductores);
            setNuevoCarro({ idConductor: '' });
            onCarroOpen();
        } catch (error) {
            console.error('Error al cargar conductores:', error);
            toast({
                title: 'Error',
                description: 'No se pudieron cargar los conductores disponibles',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoadingConductores(false);
        }
    };
    
    // Crear nuevo carro
    const handleCrearCarro = async () => {
        if (!selectedEquipo) return;
        
        setCreandoCarro(true);
        try {
            const resultado = await carrosService.crearCarro(
                selectedEquipo.id,
                nuevoCarro.idConductor ? parseInt(nuevoCarro.idConductor) : null
            );
            
            if (resultado.success) {
                toast({
                    title: 'Carro creado',
                    description: resultado.mensaje,
                    status: 'success',
                    duration: 3000,
                });
                
                // Recargar equipos para reflejar el cambio
                await loadEquipos();
                onCarroClose();
            } else {
                toast({
                    title: 'Error',
                    description: resultado.mensaje,
                    status: 'error',
                    duration: 5000,
                });
            }
        } catch (error) {
            console.error('Error al crear carro:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.mensaje || error.response?.data?.error || 'Error al crear el carro',
                status: 'error',
                duration: 5000,
            });
        } finally {
            setCreandoCarro(false);
        }
    };
    
    // Eliminar carro
    const handleEliminarCarro = async (carroId) => {
        if (!confirm('¿Estás seguro de eliminar este carro? Se eliminarán también las partes instaladas y resultados de simulaciones.')) {
            return;
        }
        
        try {
            await carrosService.eliminarCarro(carroId);
            toast({
                title: 'Carro eliminado',
                description: 'El carro ha sido eliminado exitosamente',
                status: 'success',
                duration: 3000,
            });
            
            // Recargar equipos para reflejar el cambio
            await loadEquipos();
        } catch (error) {
            console.error('Error al eliminar carro:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Error al eliminar el carro',
                status: 'error',
                duration: 5000,
            });
        }
    };
    
    const handleCrearEquipo = async () => {
        try {
            // Llamar al backend para crear el equipo
            const resultado = await equiposService.create(nuevoEquipo.nombre);
            
            // Crear objeto del equipo con los datos del backend
            const equipoCreado = {
                id: resultado.Id_equipo,
                nombre: resultado.Nombre,
                nombreCompleto: resultado.Nombre,
                pais: '',
                colorPrimario: '#e10600',
                fundacion: new Date().getFullYear(),
                campeonatos: 0,
                presupuesto: {
                    total: 0,
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
                nombre: ''
            });
            onClose();
            
            toast({
                title: 'Equipo creado',
                description: `${equipoCreado.nombre} ha sido registrado exitosamente`,
                status: 'success',
                duration: 3000,
            });
        } catch (error) {
            console.error('Error al crear equipo:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Error al crear el equipo',
                status: 'error',
                duration: 5000,
            });
        }
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
                                        <HStack justify="space-between" mb={4}>
                                            <Text fontSize="sm" color="gray.400">Gestiona el presupuesto y aportes del equipo</Text>
                                            <Button
                                                leftIcon={<Plus size={16} />}
                                                size="sm"
                                                colorScheme="green"
                                                onClick={handleOpenAporteModal}
                                            >
                                                Agregar Aporte
                                            </Button>
                                        </HStack>
                                        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
                                            <StatCard
                                                icon={DollarSign}
                                                label="Presupuesto Total"
                                                value={new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(selectedEquipo.presupuesto?.total)}
                                                subtext="Temporada 2026"
                                                color="green.400"
                                            />
                                            <StatCard
                                                icon={TrendingUp}
                                                label="Gastado"
                                                value={new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(selectedEquipo.presupuesto?.gastado)}
                                                subtext={`${((selectedEquipo.presupuesto?.gastado / selectedEquipo.presupuesto?.total) * 100).toFixed(0)}% del total`}
                                                color="orange.400"
                                            />
                                            <StatCard
                                                icon={Megaphone}
                                                label="Ingresos Sponsors"
                                                value={new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(selectedEquipo.presupuesto?.sponsors)}
                                                subtext={`${selectedEquipo.patrocinadores?.length || 0} patrocinadores`}
                                                color="purple.400"
                                            />
                                        </SimpleGrid>

                                        <Card bg="brand.700" borderColor="brand.600">
                                            <CardBody>
                                                <Text fontWeight="bold" mb={4}>Historial de Gastos/Compras</Text>
                                                {selectedEquipo.gastos?.length > 0 ? (
                                                    <Table variant="simple" size="sm">
                                                        <Thead>
                                                            <Tr>
                                                                <Th color="gray.400">Fecha</Th>
                                                                <Th color="gray.400">Descripción</Th>
                                                                <Th color="gray.400" isNumeric>Monto</Th>
                                                            </Tr>
                                                        </Thead>
                                                        <Tbody>
                                                            {selectedEquipo.gastos.map((gasto) => {
                                                                // Procesar fecha correctamente sin conversión UTC
                                                                let fechaFormato = '';
                                                                if (gasto.fecha) {
                                                                    // Extraer solo la parte de fecha (YYYY-MM-DD) para evitar problemas de zona horaria
                                                                    const fechaStr = gasto.fecha.toString().split('T')[0];
                                                                    const [year, month, day] = fechaStr.split('-');
                                                                    fechaFormato = `${day}/${month}/${year}`;
                                                                }
                                                                
                                                                return (
                                                                    <Tr key={gasto.id} _hover={{ bg: 'brand.600' }}>
                                                                        <Td>{fechaFormato}</Td>
                                                                        <Td>{gasto.descripcion}</Td>
                                                                        <Td isNumeric color="red.400">
                                                                            -${gasto.monto?.toLocaleString()}
                                                                        </Td>
                                                                    </Tr>
                                                                );
                                                            })}
                                                        </Tbody>
                                                    </Table>
                                                ) : (
                                                    <Text color="gray.500" textAlign="center">No hay gastos registrados</Text>
                                                )}
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
                                        <VStack align="stretch" spacing={4}>
                                            {/* Botón para crear nuevo carro */}
                                            {selectedEquipo.carros?.length < 2 && (
                                                <Button
                                                    leftIcon={<Plus size={16} />}
                                                    colorScheme="green"
                                                    variant="outline"
                                                    onClick={handleNuevoCarroClick}
                                                    isLoading={loadingConductores}
                                                >
                                                    Nuevo Carro
                                                </Button>
                                            )}
                                            
                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                {selectedEquipo.carros?.map((carro) => (
                                                <CarroCard 
                                                    key={carro.id} 
                                                    carro={carro}
                                                    onClick={() => handleCarroClick(carro.id)}
                                                    onDelete={handleEliminarCarro}
                                                />
                                            ))}
                                            </SimpleGrid>
                                        </VStack>
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
                                                                <Td isNumeric>${new Intl.NumberFormat('es-CR').format(item.precio)}</Td>
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
                                                        {new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(selectedEquipo.patrocinadores?.reduce((acc, p) => acc + p.aporte, 0))}
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
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button 
                            colorScheme="red" 
                            onClick={handleCrearEquipo}
                            isDisabled={!nuevoEquipo.nombre}
                        >
                            Crear Equipo
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Modal para Agregar Aporte */}
            <Modal isOpen={isAporteOpen} onClose={onAporteClose} size="md" isCentered>
                <ModalOverlay bg="blackAlpha.800"/>
                <ModalContent bg="brand.800" borderColor="brand.700">
                    <ModalHeader color="white">
                        <HStack>
                            <Icon as={DollarSign} boxSize={5} color="green.400" />
                            <Text>Agregar Aporte al Presupuesto</Text>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody pb={6}>
                        <VStack spacing={4} align="stretch">
                            <FormControl isRequired>
                                <FormLabel color="gray.300">Patrocinador</FormLabel>
                                {loadingPatrocinadores ? (
                                    <Spinner size="sm" color="accent.500" />
                                ) : (
                                    <Select
                                        placeholder="Selecciona un patrocinador"
                                        value={nuevoAporte.idPatrocinador}
                                        onChange={(e) => setNuevoAporte({...nuevoAporte, idPatrocinador: e.target.value})}
                                        bg="brand.900"
                                        borderColor="brand.700"
                                        _focus={{ borderColor: 'accent.500' }}
                                    >
                                        {patrocinadores.map((p) => (
                                            <option key={p.Id_patrocinador} value={p.Id_patrocinador} style={{background: '#1a1a2e'}}>
                                                {p.Nombre}
                                            </option>
                                        ))}
                                    </Select>
                                )}
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel color="gray.300">Monto (USD)</FormLabel>
                                <Input
                                    type="number"
                                    placeholder="Ej: 5000000"
                                    value={nuevoAporte.monto}
                                    onChange={(e) => setNuevoAporte({...nuevoAporte, monto: e.target.value})}
                                    bg="brand.900"
                                    borderColor="brand.700"
                                    _focus={{ borderColor: 'accent.500' }}
                                    _placeholder={{ color: 'gray.500' }}
                                />
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    Ingresa el monto en dólares (sin comas ni símbolos)
                                </Text>
                            </FormControl>

                            <FormControl>
                                <FormLabel color="gray.300">Descripción (opcional)</FormLabel>
                                <Input
                                    type="text"
                                    placeholder="Ej: Patrocinio temporada 2026"
                                    value={nuevoAporte.descripcion}
                                    onChange={(e) => setNuevoAporte({...nuevoAporte, descripcion: e.target.value})}
                                    bg="brand.900"
                                    borderColor="brand.700"
                                    _focus={{ borderColor: 'accent.500' }}
                                    _placeholder={{ color: 'gray.500' }}
                                    maxLength={200}
                                />
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    Describe el motivo o concepto del aporte
                                </Text>
                            </FormControl>

                            {/* Preview del aporte */}
                            {nuevoAporte.monto && !isNaN(parseFloat(nuevoAporte.monto)) && (
                                <Card bg="brand.900" borderColor="green.700" borderWidth="1px">
                                    <CardBody py={3}>
                                        <VStack align="stretch" spacing={2}>
                                            <HStack justify="space-between">
                                                <Text fontSize="sm" color="gray.400">Nuevo presupuesto total:</Text>
                                                <Text fontWeight="bold" color="green.400">
                                                    {new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(selectedEquipo?.presupuesto?.total + parseFloat(nuevoAporte.monto))}
                                                </Text>
                                            </HStack>
                                            <HStack justify="space-between">
                                                <Text fontSize="sm" color="gray.400">Aumento:</Text>
                                                <Badge colorScheme="green" fontSize="sm">
                                                    +{new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(parseFloat(nuevoAporte.monto))}
                                                </Badge>
                                            </HStack>
                                        </VStack>
                                    </CardBody>
                                </Card>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onAporteClose}>
                            Cancelar
                        </Button>
                        <Button 
                            colorScheme="green" 
                            onClick={handleAgregarAporte}
                            isDisabled={!nuevoAporte.idPatrocinador || !nuevoAporte.monto}
                            leftIcon={<Plus size={16} />}
                        >
                            Agregar Aporte
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Modal para Crear Nuevo Carro */}
            <Modal isOpen={isCarroOpen} onClose={onCarroClose} size="md" isCentered>
                <ModalOverlay bg="blackAlpha.800"/>
                <ModalContent bg="brand.800" borderColor="brand.700">
                    <ModalHeader color="white">
                        <HStack>
                            <Icon as={Car} boxSize={5} color="accent.500" />
                            <Text>Nuevo Carro</Text>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody pb={6}>
                        <VStack spacing={4} align="stretch">
                            <Text color="gray.300" fontSize="sm">
                                Equipo: <Text as="span" fontWeight="bold" color="white">{selectedEquipo?.nombre}</Text>
                            </Text>
                            
                            <Text color="gray.400" fontSize="sm">
                                Carros actuales: {selectedEquipo?.carros?.length || 0}/2
                            </Text>
                            
                            <Divider borderColor="brand.600" />
                            
                            <FormControl>
                                <FormLabel color="gray.300">Piloto <Text as="span" color="gray.500">(Opcional)</Text></FormLabel>
                                {loadingConductores ? (
                                    <Spinner size="sm" color="accent.500" />
                                ) : conductoresDisponibles.length > 0 ? (
                                    <Select
                                        placeholder="Selecciona un piloto o deja sin asignar"
                                        value={nuevoCarro.idConductor}
                                        onChange={(e) => setNuevoCarro({...nuevoCarro, idConductor: e.target.value})}
                                        bg="brand.900"
                                        borderColor="brand.700"
                                        _focus={{ borderColor: 'accent.500' }}
                                    >
                                        {conductoresDisponibles.map((c) => (
                                            <option key={c.Id_usuario} value={c.Id_usuario} style={{background: '#1a1a2e'}}>
                                                {c.Nombre_usuario || c.Correo_usuario} 
                                                {c.Habilidad !== null && ` (Habilidad: ${c.Habilidad})`}
                                                {c.Id_equipo === null && ' - Sin equipo'}
                                            </option>
                                        ))}
                                    </Select>
                                ) : (
                                    <Text color="yellow.400" fontSize="sm">
                                        No hay pilotos disponibles. Puedes crear el carro sin piloto.
                                    </Text>
                                )}
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    Puedes seleccionar un piloto del equipo o crearlo sin piloto. Podrás cambiar o asignar el piloto después.
                                </Text>
                            </FormControl>
                            
                            {/* Info sobre conductores del equipo */}
                            {conductoresDisponibles.some(c => c.Id_equipo === selectedEquipo?.id) && (
                                <Card bg="brand.900" borderColor="green.700" borderWidth="1px">
                                    <CardBody py={2}>
                                        <HStack>
                                            <Icon as={Users} color="green.400" boxSize={4} />
                                            <Text fontSize="sm" color="green.400">
                                                Hay pilotos del equipo disponibles para asignar
                                            </Text>
                                        </HStack>
                                    </CardBody>
                                </Card>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onCarroClose}>
                            Cancelar
                        </Button>
                        <Button 
                            colorScheme="green" 
                            onClick={handleCrearCarro}
                            isLoading={creandoCarro}
                            leftIcon={<Plus size={16} />}
                        >
                            Crear Carro
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
}

export default Equipos;
