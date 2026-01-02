import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    Card,
    CardBody,
    Progress,
    Badge,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    SimpleGrid,
    Flex,
    Tooltip,
    useToast,
    Spinner,
    Center,
    IconButton,
} from '@chakra-ui/react';
import { ArrowLeft, Check, Zap, Wind, Target, AlertCircle } from 'lucide-react';
import carrosService from '../services/carros.service';

// Configuración de slots
const SLOTS_CONFIG = {
    powerUnit: { 
        nombre: 'Power Unit', 
        icon: '⚡',
        posicion: { x: 200, y: 180 },
        color: '#e10600'
    },
    aerodinamica: { 
        nombre: 'Aerodinamica', 
        icon: '💨',
        posicion: { x: 200, y: 60 },
        color: '#3b82f6'
    },
    cajaCambios: { 
        nombre: 'Caja Cambios', 
        icon: '⚙️',
        posicion: { x: 200, y: 240 },
        color: '#8b5cf6'
    },
    suspension: { 
        nombre: 'Suspension', 
        icon: '🔧',
        posicion: { x: 80, y: 150 },
        color: '#22c55e'
    },
    neumaticos: { 
        nombre: 'Neumaticos', 
        icon: '🛞',
        posicion: { x: 320, y: 150 },
        color: '#eab308'
    },
};

function ArmadoCarro() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    
    const [carro, setCarro] = useState(null);
    const [inventario, setInventario] = useState({});
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [slotActivo, setSlotActivo] = useState(null);
    const [hoveredSlot, setHoveredSlot] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, [id]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [carroData, inventarioData, statsData] = await Promise.all([
                carrosService.getById(id),
                carrosService.getInventario(id),
                carrosService.getStats(id)
            ]);
            setCarro(carroData);
            setInventario(inventarioData);
            setStats(statsData);
        } catch (error) {
            console.error('Error cargando datos:', error);
            toast({
                title: 'Error al cargar carro',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSlotClick = (slot) => {
        setSlotActivo(slot);
        onOpen();
    };

    const handleSeleccionarParte = async (parte) => {
        try {
            await carrosService.updateConfiguracion(id, slotActivo, parte?.id || null);
            await cargarDatos();
            onClose();
            toast({
                title: parte ? `${parte.nombre} instalado` : 'Parte removida',
                status: 'success',
                duration: 2000,
            });
        } catch (error) {
            toast({
                title: 'Error al actualizar',
                status: 'error',
                duration: 3000,
            });
        }
    };

    if (loading) {
        return (
            <Center minH="60vh">
                <Spinner size="xl" color="accent.600" />
            </Center>
        );
    }

    if (!carro) {
        return (
            <Center minH="60vh">
                <Text color="gray.500">Carro no encontrado</Text>
            </Center>
        );
    }

    const parteInstalada = slotActivo ? carro.configuracion[slotActivo] : null;

    return (
        <Container maxW="container.xl" py={6}>
            {/* Header */}
            <HStack mb={6} spacing={4}>
                <IconButton
                    icon={<ArrowLeft size={20} />}
                    variant="ghost"
                    onClick={() => navigate('/carros')}
                    aria-label="Volver"
                />
                <Box>
                    <Heading size="lg" color="white">
                        {carro.modelo} #{carro.numero}
                    </Heading>
                    <Text color="gray.400">
                        {carro.conductor} - {carro.equipo}
                    </Text>
                </Box>
                <Badge 
                    colorScheme={stats?.completo ? 'green' : 'orange'} 
                    fontSize="sm"
                    px={3}
                    py={1}
                    ml="auto"
                >
                    {stats?.completo ? 'Completo' : `${stats?.partesInstaladas}/${stats?.partesTotales} partes`}
                </Badge>
            </HStack>

            <Flex gap={6} direction={{ base: 'column', lg: 'row' }}>
                {/* Vista del F1 */}
                <Card bg="brand.800" borderColor="brand.700" flex={2}>
                    <CardBody p={6}>
                        <Text fontSize="sm" color="gray.500" mb={4} textAlign="center">
                            Click en una zona para cambiar la parte
                        </Text>
                        
                        <Box position="relative" mx="auto" maxW="450px">
                            <svg viewBox="0 0 340 280" style={{ width: '100%', height: 'auto' }}>
                                {/* Definiciones */}
                                <defs>
                                    <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#3a3a3a"/>
                                        <stop offset="100%" stopColor="#1a1a1a"/>
                                    </linearGradient>
                                    <radialGradient id="tireGradient" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stopColor="#2a2a2a"/>
                                        <stop offset="100%" stopColor="#0a0a0a"/>
                                    </radialGradient>
                                    <linearGradient id="haloGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#555"/>
                                        <stop offset="50%" stopColor="#888"/>
                                        <stop offset="100%" stopColor="#555"/>
                                    </linearGradient>
                                </defs>
                                
                                {/* Fondo */}
                                <rect width="340" height="280" fill="#0d0d0d" rx="8"/>
                                
                                {/* Grid sutil */}
                                <g opacity="0.08">
                                    {[...Array(17)].map((_, i) => (
                                        <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="280" stroke="#fff" strokeWidth="0.5"/>
                                    ))}
                                    {[...Array(14)].map((_, i) => (
                                        <line key={`h${i}`} x1="0" y1={i * 20} x2="340" y2={i * 20} stroke="#fff" strokeWidth="0.5"/>
                                    ))}
                                </g>
                                
                                {/* ===== F1 COMPACTO ===== */}
                                <g id="f1-car" transform="translate(170, 140)">
                                    
                                    {/* RUEDAS TRASERAS */}
                                    <g id="rear-wheels">
                                        <rect x="-78" y="48" width="18" height="38" rx="3" fill="url(#tireGradient)" stroke="#333"/>
                                        <rect x="-74" y="54" width="10" height="26" rx="2" fill="#222"/>
                                        <rect x="60" y="48" width="18" height="38" rx="3" fill="url(#tireGradient)" stroke="#333"/>
                                        <rect x="64" y="54" width="10" height="26" rx="2" fill="#222"/>
                                    </g>
                                    
                                    {/* RUEDAS DELANTERAS */}
                                    <g id="front-wheels">
                                        <rect x="-85" y="-82" width="16" height="34" rx="3" fill="url(#tireGradient)" stroke="#333"/>
                                        <rect x="-82" y="-76" width="10" height="22" rx="2" fill="#222"/>
                                        <rect x="69" y="-82" width="16" height="34" rx="3" fill="url(#tireGradient)" stroke="#333"/>
                                        <rect x="72" y="-76" width="10" height="22" rx="2" fill="#222"/>
                                    </g>
                                    
                                    {/* ALERÓN TRASERO */}
                                    <g id="rear-wing">
                                        <rect x="-42" y="82" width="84" height="8" rx="1" fill="#1a1a1a" stroke="#444"/>
                                        <rect x="-48" y="78" width="8" height="16" rx="1" fill="#222" stroke="#333"/>
                                        <rect x="40" y="78" width="8" height="16" rx="1" fill="#222" stroke="#333"/>
                                        <rect x="-18" y="72" width="6" height="12" fill="#333"/>
                                        <rect x="12" y="72" width="6" height="12" fill="#333"/>
                                    </g>
                                    
                                    {/* CUERPO TRASERO - CAJA CAMBIOS */}
                                    <g id="rear-body">
                                        <path d="M -22 52 L 22 52 L 28 82 L -28 82 Z" fill="url(#bodyGradient)" stroke="#333"/>
                                        <ellipse cx="0" cy="58" rx="5" ry="3" fill="#333" stroke="#e10600" strokeWidth="0.5"/>
                                    </g>
                                    
                                    {/* SIDEPODS Y MOTOR */}
                                    <g id="sidepods">
                                        <path d="M -28 -8 L -55 15 L -55 50 L -28 58 Z" fill="url(#bodyGradient)" stroke="#333"/>
                                        <path d="M 28 -8 L 55 15 L 55 50 L 28 58 Z" fill="url(#bodyGradient)" stroke="#333"/>
                                        <rect x="-55" y="18" width="12" height="8" fill="#0a0a0a"/>
                                        <rect x="43" y="18" width="12" height="8" fill="#0a0a0a"/>
                                    </g>
                                    
                                    {/* POWER UNIT */}
                                    <g id="engine">
                                        <path d="M -28 5 L 28 5 L 24 55 L -24 55 Z" fill="#1f1f1f" stroke="#333"/>
                                        <path d="M -10 0 L 10 0 L 8 15 L -8 15 Z" fill="#0a0a0a"/>
                                        <line x1="0" y1="10" x2="0" y2="50" stroke="#333" strokeWidth="0.5"/>
                                    </g>
                                    
                                    {/* CUERPO PRINCIPAL */}
                                    <g id="main-body">
                                        <path d="M -30 -45 L 30 -45 L 32 5 L -32 5 Z" fill="url(#bodyGradient)" stroke="#333"/>
                                        <line x1="0" y1="-45" x2="0" y2="5" stroke="#e10600" strokeWidth="1.5" opacity="0.5"/>
                                    </g>
                                    
                                    {/* COCKPIT */}
                                    <g id="cockpit">
                                        <ellipse cx="0" cy="-25" rx="14" ry="22" fill="#050505"/>
                                        <path d="M -12 -42 Q 0 -55 12 -42" fill="none" stroke="#555" strokeWidth="4" strokeLinecap="round"/>
                                        <path d="M -12 -42 Q 0 -55 12 -42" fill="none" stroke="url(#haloGradient)" strokeWidth="2.5" strokeLinecap="round"/>
                                        <line x1="0" y1="-52" x2="0" y2="-32" stroke="#555" strokeWidth="3"/>
                                        <line x1="0" y1="-52" x2="0" y2="-32" stroke="url(#haloGradient)" strokeWidth="2"/>
                                        <ellipse cx="0" cy="-8" rx="8" ry="5" fill="#1a1a1a"/>
                                    </g>
                                    
                                    {/* NARIZ */}
                                    <g id="nose">
                                        <path d="M -18 -45 L 18 -45 L 10 -78 L -10 -78 Z" fill="url(#bodyGradient)" stroke="#333"/>
                                        <path d="M -10 -78 L 10 -78 L 5 -98 L -5 -98 Z" fill="#2a2a2a" stroke="#333"/>
                                        <path d="M -5 -98 L 5 -98 L 2 -108 L -2 -108 Z" fill="#1a1a1a" stroke="#333"/>
                                    </g>
                                    
                                    {/* ALERÓN DELANTERO */}
                                    <g id="front-wing">
                                        <rect x="-75" y="-105" width="150" height="6" rx="1" fill="#1a1a1a" stroke="#444"/>
                                        <path d="M -80 -110 L -72 -110 L -70 -95 L -78 -95 Z" fill="#222" stroke="#333"/>
                                        <path d="M 80 -110 L 72 -110 L 70 -95 L 78 -95 Z" fill="#222" stroke="#333"/>
                                        <rect x="-70" y="-112" width="55" height="3" rx="1" fill="#2a2a2a"/>
                                        <rect x="15" y="-112" width="55" height="3" rx="1" fill="#2a2a2a"/>
                                    </g>
                                    
                                    {/* SUSPENSIÓN */}
                                    <g id="suspension" stroke="#555" strokeWidth="1.5">
                                        <line x1="-32" y1="-62" x2="-69" y2="-72"/>
                                        <line x1="-32" y1="-55" x2="-69" y2="-58"/>
                                        <line x1="32" y1="-62" x2="69" y2="-72"/>
                                        <line x1="32" y1="-55" x2="69" y2="-58"/>
                                        <line x1="-28" y1="52" x2="-60" y2="58"/>
                                        <line x1="-28" y1="45" x2="-60" y2="52"/>
                                        <line x1="28" y1="52" x2="60" y2="58"/>
                                        <line x1="28" y1="45" x2="60" y2="52"/>
                                    </g>
                                    
                                    {/* ESPEJOS */}
                                    <rect x="-38" y="-32" width="6" height="3" rx="1" fill="#333"/>
                                    <rect x="32" y="-32" width="6" height="3" rx="1" fill="#333"/>
                                </g>
                                
                                {/* ===== ZONAS CLICKEABLES ===== */}
                                <g id="zones" transform="translate(170, 140)">
                                {Object.entries(SLOTS_CONFIG).map(([slot, config]) => {
                                    const parte = carro.configuracion[slot];
                                    const isHovered = hoveredSlot === slot;
                                    const isEmpty = !parte;
                                    
                                    let pathData, cx, cy;
                                    switch(slot) {
                                        case 'aerodinamica':
                                            pathData = "M -82 -115 L 82 -115 L 80 -92 L -80 -92 Z";
                                            cx = 70; cy = -108;
                                            break;
                                        case 'powerUnit':
                                            pathData = "M -32 0 L 32 0 L 30 60 L -30 60 Z";
                                            cx = 25; cy = 8;
                                            break;
                                        case 'cajaCambios':
                                            pathData = "M -50 58 L 50 58 L 52 95 L -52 95 Z";
                                            cx = 42; cy = 68;
                                            break;
                                        case 'suspension':
                                            pathData = "M -90 -88 L -58 -88 L -58 90 L -90 90 Z";
                                            cx = -65; cy = -78;
                                            break;
                                        case 'neumaticos':
                                            pathData = "M 58 -88 L 90 -88 L 90 90 L 58 90 Z";
                                            cx = 82; cy = -78;
                                            break;
                                    }
                                    
                                    return (
                                        <g 
                                            key={slot}
                                            onClick={() => handleSlotClick(slot)}
                                            onMouseEnter={() => setHoveredSlot(slot)}
                                            onMouseLeave={() => setHoveredSlot(null)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <path
                                                d={pathData}
                                                fill={isHovered ? config.color : 'transparent'}
                                                fillOpacity={isHovered ? 0.2 : 0}
                                                stroke={isEmpty ? '#ef4444' : config.color}
                                                strokeWidth={isHovered ? 2 : 1.5}
                                                strokeDasharray={isEmpty ? '5,3' : 'none'}
                                            />
                                            <circle
                                                cx={cx}
                                                cy={cy}
                                                r="6"
                                                fill={isEmpty ? '#ef4444' : '#22c55e'}
                                                stroke="#000"
                                                strokeWidth="1.5"
                                            />
                                            {isEmpty && (
                                                <text x={cx} y={cy + 3} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">!</text>
                                            )}
                                            {!isEmpty && (
                                                <text x={cx} y={cy + 2} textAnchor="middle" fill="#fff" fontSize="6">✓</text>
                                            )}
                                        </g>
                                    );
                                })}
                                </g>
                                
                                {/* Leyenda hover */}
                                {hoveredSlot && (
                                    <g>
                                        <rect x="10" y="240" width="160" height="32" fill="#1a1a1a" rx="4" stroke="#333"/>
                                        <text x="20" y="256" fill="white" fontSize="10" fontWeight="bold">
                                            {SLOTS_CONFIG[hoveredSlot].icon} {SLOTS_CONFIG[hoveredSlot].nombre}
                                        </text>
                                        <text x="20" y="267" fill="#888" fontSize="8">
                                            {carro.configuracion[hoveredSlot]?.nombre || 'Click para añadir'}
                                        </text>
                                    </g>
                                )}
                            </svg>
                        </Box>
                        
                        {/* Leyenda */}
                        <HStack justify="center" mt={4} spacing={6}>
                            <HStack>
                                <Box w={3} h={3} bg="green.500" borderRadius="full"/>
                                <Text fontSize="xs" color="gray.400">Instalado</Text>
                            </HStack>
                            <HStack>
                                <Box w={3} h={3} bg="red.500" borderRadius="full"/>
                                <Text fontSize="xs" color="gray.400">Vacío</Text>
                            </HStack>
                        </HStack>
                    </CardBody>
                </Card>

                {/* Panel de stats y partes */}
                <VStack flex={1} spacing={4} align="stretch">
                    {/* Estadísticas */}
                    <Card bg="brand.800" borderColor="brand.700">
                        <CardBody>
                            <Heading size="sm" color="white" mb={4}>Estadisticas Totales</Heading>
                            <VStack spacing={3}>
                                <Box w="full">
                                    <HStack justify="space-between" mb={1}>
                                        <HStack>
                                            <Zap size={14} color="#eab308"/>
                                            <Text fontSize="sm" color="gray.400">Potencia</Text>
                                        </HStack>
                                        <Text fontSize="sm" color="white" fontWeight="bold">{stats?.potencia || 0}/45</Text>
                                    </HStack>
                                    <Progress value={(stats?.potencia || 0) / 45 * 100} colorScheme="yellow" bg="brand.700" size="sm" borderRadius="full"/>
                                </Box>
                                <Box w="full">
                                    <HStack justify="space-between" mb={1}>
                                        <HStack>
                                            <Wind size={14} color="#3b82f6"/>
                                            <Text fontSize="sm" color="gray.400">Aerodinamica</Text>
                                        </HStack>
                                        <Text fontSize="sm" color="white" fontWeight="bold">{stats?.aerodinamica || 0}/45</Text>
                                    </HStack>
                                    <Progress value={(stats?.aerodinamica || 0) / 45 * 100} colorScheme="blue" bg="brand.700" size="sm" borderRadius="full"/>
                                </Box>
                                <Box w="full">
                                    <HStack justify="space-between" mb={1}>
                                        <HStack>
                                            <Target size={14} color="#22c55e"/>
                                            <Text fontSize="sm" color="gray.400">Manejo</Text>
                                        </HStack>
                                        <Text fontSize="sm" color="white" fontWeight="bold">{stats?.manejo || 0}/45</Text>
                                    </HStack>
                                    <Progress value={(stats?.manejo || 0) / 45 * 100} colorScheme="green" bg="brand.700" size="sm" borderRadius="full"/>
                                </Box>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Partes instaladas */}
                    <Card bg="brand.800" borderColor="brand.700">
                        <CardBody>
                            <Heading size="sm" color="white" mb={4}>Configuracion Actual</Heading>
                            <VStack spacing={2} align="stretch">
                                {Object.entries(SLOTS_CONFIG).map(([slot, config]) => {
                                    const parte = carro.configuracion[slot];
                                    return (
                                        <HStack 
                                            key={slot} 
                                            p={2} 
                                            bg="brand.900" 
                                            borderRadius="md"
                                            borderWidth="1px"
                                            borderColor={parte ? 'brand.700' : 'red.800'}
                                            cursor="pointer"
                                            _hover={{ borderColor: config.color }}
                                            onClick={() => handleSlotClick(slot)}
                                        >
                                            <Text fontSize="lg">{config.icon}</Text>
                                            <Box flex={1}>
                                                <Text fontSize="xs" color="gray.500">{config.nombre}</Text>
                                                <Text fontSize="sm" color={parte ? 'white' : 'red.400'} noOfLines={1}>
                                                    {parte?.nombre || 'Sin instalar'}
                                                </Text>
                                            </Box>
                                            {parte && (
                                                <HStack spacing={1}>
                                                    <Badge size="sm" colorScheme="yellow" variant="subtle">P:{parte.potencia}</Badge>
                                                    <Badge size="sm" colorScheme="blue" variant="subtle">A:{parte.aerodinamica}</Badge>
                                                    <Badge size="sm" colorScheme="green" variant="subtle">M:{parte.manejo}</Badge>
                                                </HStack>
                                            )}
                                        </HStack>
                                    );
                                })}
                            </VStack>
                        </CardBody>
                    </Card>
                </VStack>
            </Flex>

            {/* Modal de selección de parte */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
                <ModalOverlay bg="blackAlpha.800"/>
                <ModalContent bg="brand.800" borderColor="brand.700">
                    <ModalHeader color="white">
                        {slotActivo && (
                            <HStack>
                                <Text>{SLOTS_CONFIG[slotActivo]?.icon}</Text>
                                <Text>Seleccionar {SLOTS_CONFIG[slotActivo]?.nombre}</Text>
                            </HStack>
                        )}
                    </ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody pb={6}>
                        <VStack spacing={3} align="stretch">
                            {/* Opción de remover */}
                            {parteInstalada && (
                                <Card 
                                    bg="brand.900" 
                                    borderColor="red.800"
                                    cursor="pointer"
                                    _hover={{ borderColor: 'red.600' }}
                                    onClick={() => handleSeleccionarParte(null)}
                                >
                                    <CardBody py={3}>
                                        <HStack>
                                            <AlertCircle size={20} color="#ef4444"/>
                                            <Text color="red.400">Remover parte instalada</Text>
                                        </HStack>
                                    </CardBody>
                                </Card>
                            )}
                            
                            {/* Partes disponibles */}
                            {slotActivo && inventario[slotActivo]?.map(parte => {
                                const isInstalada = parteInstalada?.id === parte.id;
                                return (
                                    <Card 
                                        key={parte.id}
                                        bg="brand.900" 
                                        borderColor={isInstalada ? 'green.500' : 'brand.700'}
                                        cursor="pointer"
                                        _hover={{ borderColor: SLOTS_CONFIG[slotActivo]?.color }}
                                        onClick={() => !isInstalada && handleSeleccionarParte(parte)}
                                        opacity={isInstalada ? 0.7 : 1}
                                    >
                                        <CardBody py={3}>
                                            <HStack justify="space-between">
                                                <Box>
                                                    <HStack>
                                                        <Text color="white" fontWeight="500">{parte.nombre}</Text>
                                                        {isInstalada && <Check size={16} color="#22c55e"/>}
                                                    </HStack>
                                                    <HStack mt={1} spacing={2}>
                                                        <Badge colorScheme="yellow" variant="subtle" size="sm">
                                                            <HStack spacing={1}>
                                                                <Zap size={10}/><Text>P: {parte.potencia}</Text>
                                                            </HStack>
                                                        </Badge>
                                                        <Badge colorScheme="blue" variant="subtle" size="sm">
                                                            <HStack spacing={1}>
                                                                <Wind size={10}/><Text>A: {parte.aerodinamica}</Text>
                                                            </HStack>
                                                        </Badge>
                                                        <Badge colorScheme="green" variant="subtle" size="sm">
                                                            <HStack spacing={1}>
                                                                <Target size={10}/><Text>M: {parte.manejo}</Text>
                                                            </HStack>
                                                        </Badge>
                                                    </HStack>
                                                </Box>
                                            </HStack>
                                        </CardBody>
                                    </Card>
                                );
                            })}
                            
                            {slotActivo && (!inventario[slotActivo] || inventario[slotActivo].length === 0) && (
                                <Text color="gray.500" textAlign="center" py={4}>
                                    No hay partes disponibles en el inventario
                                </Text>
                            )}
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Container>
    );
}

export default ArmadoCarro;
