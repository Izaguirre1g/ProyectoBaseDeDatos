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
    ModalFooter,
    useDisclosure,
    SimpleGrid,
    Flex,
    Tooltip,
    useToast,
    Spinner,
    Center,
    IconButton,
    Divider,
    FormControl,
    FormLabel,
} from '@chakra-ui/react';
import { ArrowLeft, Check, Zap, Wind, Target, AlertCircle, Trash2 } from 'lucide-react';
import { carrosService } from '../services/carros.service';

// Mapeo de categorías de DB a slots del frontend
// Las categorías en BD: Power unit(1), Paquete aerodinámico(2), Neumáticos(3), Suspensión(4), Caja de cambios(5)
const CATEGORIA_TO_SLOT = {
    'Power unit': 'powerUnit',
    'Paquete aerodinámico': 'aerodinamica', 
    'Neumáticos': 'neumaticos',
    'Suspensión': 'suspension',
    'Caja de cambios': 'cajaCambios'
};

const SLOT_TO_CATEGORIA_ID = {
    'powerUnit': 1,
    'aerodinamica': 2,
    'neumaticos': 3,
    'suspension': 4,
    'cajaCambios': 5
};

// Configuración de slots
const SLOTS_CONFIG = {
    powerUnit: { 
        nombre: 'Power Unit', 
        icon: 'PU',
        posicion: { x: 200, y: 180 },
        color: '#e10600',
        categoriaId: 1
    },
    aerodinamica: { 
        nombre: 'Aerodinamica', 
        icon: 'AE',
        posicion: { x: 200, y: 60 },
        color: '#3b82f6',
        categoriaId: 2
    },
    neumaticos: { 
        nombre: 'Neumaticos', 
        icon: 'NE',
        posicion: { x: 320, y: 150 },
        color: '#eab308',
        categoriaId: 3
    },
    suspension: { 
        nombre: 'Suspension', 
        icon: 'SU',
        posicion: { x: 80, y: 150 },
        color: '#22c55e',
        categoriaId: 4
    },
    cajaCambios: { 
        nombre: 'Caja Cambios', 
        icon: 'CC',
        posicion: { x: 200, y: 240 },
        color: '#8b5cf6',
        categoriaId: 5
    },
};

function ArmadoCarro() {
    const { equipoId, carroId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isOpenPiloto, onOpen: onOpenPiloto, onClose: onClosePiloto } = useDisclosure();
    
    const [carro, setCarro] = useState(null);
    const [partes, setPartes] = useState([]); // Partes instaladas en el carro
    const [inventario, setInventario] = useState([]); // Inventario disponible del equipo
    const [stats, setStats] = useState({ P: 0, A: 0, M: 0 });
    const [loading, setLoading] = useState(true);
    const [instalando, setInstalando] = useState(false);
    const [slotActivo, setSlotActivo] = useState(null);
    const [hoveredSlot, setHoveredSlot] = useState(null);
    const [conductoresDisponibles, setConductoresDisponibles] = useState([]);
    const [loadingConductores, setLoadingConductores] = useState(false);
    const [cambingPiloto, setCambingPiloto] = useState(false);
    const [nuevoPiloto, setNuevoPiloto] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, [carroId]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            
            // Obtener carro con partes instaladas
            const carroData = await carrosService.getById(carroId);
            console.log('Carro cargado:', carroData);
            setCarro(carroData);
            setPartes(carroData.partes || []);
            
            // Calcular stats
            setStats({
                P: carroData.P_total || 0,
                A: carroData.A_total || 0,
                M: carroData.M_total || 0
            });
            
            // Obtener inventario del equipo
            const inventarioData = await carrosService.getInventario(carroId);
            console.log('Inventario cargado:', inventarioData);
            setInventario(inventarioData);
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            console.error('Detalles:', error.response?.data || error.message || 'Error desconocido');
            toast({
                title: 'Error al cargar carro',
                description: error.response?.data?.error || error.message || 'Error al cargar los datos',
                status: 'error',
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    // Obtener la configuración actual (partes por slot)
    const getConfiguracion = () => {
        const config = {};
        Object.keys(SLOTS_CONFIG).forEach(slot => {
            config[slot] = null;
        });
        
        partes.forEach(parte => {
            // Buscar el slot por Id_categoria
            const slotEntry = Object.entries(SLOTS_CONFIG).find(
                ([_, cfg]) => cfg.categoriaId === parte.Id_categoria
            );
            
            if (slotEntry) {
                const [slot] = slotEntry;
                config[slot] = {
                    id: parte.Id_parte,
                    nombre: parte.Nombre,
                    p: parte.Potencia || 0,
                    a: parte.Aerodinamica || 0,
                    m: parte.Manejo || 0
                };
            }
        });
        
        return config;
    };

    const handleSlotClick = (slot) => {
        setSlotActivo(slot);
        onOpen();
    };

    const handleInstalarParte = async (parte) => {
        if (!parte || !parte.Id_parte) return;
        
        setInstalando(true);
        try {
            // Verificar si ya hay una parte instalada en la misma categoría
            const configuracion = getConfiguracion();
            const parteInstalada = configuracion[slotActivo];
            
            let resultado;
            if (parteInstalada) {
                // Usar reemplazar si ya hay parte instalada
                resultado = await carrosService.reemplazarParte(carroId, parte.Id_parte);
            } else {
                // Usar instalar si el slot está vacío
                resultado = await carrosService.instalarParte(carroId, parte.Id_parte);
            }
            
            toast({
                title: 'Parte instalada',
                description: resultado.mensaje,
                status: 'success',
                duration: 3000,
            });
            
            onClose();
            
            // Recargar datos
            await cargarDatos();
            
        } catch (error) {
            console.error('Error instalando parte:', error);
            toast({
                title: 'Error al instalar parte',
                description: error.response?.data?.mensaje || error.message || 'No se pudo instalar la parte',
                status: 'error',
                duration: 4000,
            });
        } finally {
            setInstalando(false);
        }
    };

    const handleDesinstalarParte = async (parteId) => {
        setInstalando(true);
        try {
            const resultado = await carrosService.desinstalarParte(carroId, parteId);
            
            toast({
                title: 'Parte desinstalada',
                description: resultado.mensaje,
                status: 'info',
                duration: 3000,
            });
            
            onClose();
            await cargarDatos();
            
        } catch (error) {
            console.error('Error desinstalando parte:', error);
            toast({
                title: 'Error al desinstalar',
                description: error.response?.data?.mensaje || error.message,
                status: 'error',
                duration: 4000,
            });
        } finally {
            setInstalando(false);
        }
    };

    const handleFinalizarCarro = async () => {
        try {
            const resultado = await carrosService.finalizarCarro(carroId);
            
            toast({
                title: '¡Carro finalizado!',
                description: resultado.mensaje,
                status: 'success',
                duration: 5000,
            });
            
            await cargarDatos();
            
        } catch (error) {
            toast({
                title: 'No se puede finalizar',
                description: error.message,
                status: 'warning',
                duration: 4000,
            });
        }
    };

    const handleAbrirModalPiloto = async () => {
        setLoadingConductores(true);
        try {
            if (carro?.Id_equipo) {
                const conductores = await carrosService.getConductoresDelEquipo(carro.Id_equipo);
                setConductoresDisponibles(conductores);
            }
            setNuevoPiloto(carro?.Id_conductor || '');
            onOpenPiloto();
        } catch (error) {
            console.error('Error al cargar conductores:', error);
            toast({
                title: 'Error',
                description: 'No se pudieron cargar los pilotos disponibles',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoadingConductores(false);
        }
    };

    const handleCambiarPiloto = async () => {
        if (!carro) return;
        
        setCambingPiloto(true);
        try {
            const resultado = await carrosService.cambiarPiloto(
                carroId,
                nuevoPiloto ? parseInt(nuevoPiloto) : null
            );
            
            if (resultado.success) {
                toast({
                    title: 'Piloto actualizado',
                    description: resultado.mensaje,
                    status: 'success',
                    duration: 3000,
                });
                onClosePiloto();
                await cargarDatos();
            } else {
                toast({
                    title: 'Error',
                    description: resultado.mensaje,
                    status: 'error',
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error('Error al cambiar piloto:', error);
            toast({
                title: 'Error al cambiar piloto',
                description: error.message,
                status: 'error',
                duration: 3000,
            });
        } finally {
            setCambingPiloto(false);
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

    const configuracion = getConfiguracion();
    const parteInstalada = slotActivo ? configuracion[slotActivo] : null;
    const partsCount = partes.length;
    const isComplete = partsCount === 5;
    const isFinalizado = carro.Finalizado === 1;

    return (
        <Container maxW="container.xl" py={6}>
            {/* Header */}
            <HStack mb={6} spacing={4}>
                <IconButton
                    icon={<ArrowLeft size={20} />}
                    variant="ghost"
                    onClick={() => navigate('/equipos')}
                    aria-label="Volver"
                />
                <Box flex={1}>
                    <Heading size="lg" color="white">
                        {carro.Equipo || 'Carro'} #{carro.Id_carro}
                    </Heading>
                    <HStack spacing={2} mt={1}>
                        <Text color="gray.400" fontSize="sm">
                            {carro.Conductor || 'Sin piloto asignado'}
                        </Text>
                        <Button 
                            size="xs"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={handleAbrirModalPiloto}
                        >
                            Cambiar
                        </Button>
                    </HStack>
                </Box>
                <Badge 
                    colorScheme={isFinalizado ? 'green' : isComplete ? 'blue' : 'orange'} 
                    fontSize="sm"
                    px={3}
                    py={1}
                >
                    {isFinalizado ? 'Finalizado' : isComplete ? 'Completo - Listo para finalizar' : `${partsCount}/5 partes`}
                </Badge>
                {isComplete && !isFinalizado && (
                    <Button 
                        colorScheme="green" 
                        size="sm"
                        onClick={handleFinalizarCarro}
                    >
                        Finalizar Carro
                    </Button>
                )}
            </HStack>

            <Flex gap={6} direction={{ base: 'column', lg: 'row' }}>
                {/* Vista del F1 */}
                <Card bg="brand.800" borderColor="brand.700" flex={2}>
                    <CardBody p={6}>
                        <Text fontSize="sm" color="gray.500" mb={4} textAlign="center">
                            Click en una zona para cambiar la parte
                        </Text>
                        
                        <Box position="relative" mx="auto" maxW="500px">
                            <svg key={carro?.Id_carro} viewBox="0 0 280 360" style={{ width: '100%', height: 'auto' }}>
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
                                <rect width="280" height="360" fill="#0d0d0d" rx="8"/>
                                
                                {/* Grid sutil */}
                                <g opacity="0.08">
                                    {[...Array(14)].map((_, i) => (
                                        <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="360" stroke="#fff" strokeWidth="0.5"/>
                                    ))}
                                    {[...Array(18)].map((_, i) => (
                                        <line key={`h${i}`} x1="0" y1={i * 20} x2="280" y2={i * 20} stroke="#fff" strokeWidth="0.5"/>
                                    ))}
                                </g>
                                
                                {/* ===== F1 COMPACTO ===== */}
                                <g id="f1-car" transform="translate(140, 180)">
                                    
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
                                <g id="zones" transform="translate(140, 180)">
                                {Object.entries(SLOTS_CONFIG).map(([slot, config]) => {
                                    const parte = configuracion[slot];
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
                                                <text x={cx} y={cy + 2} textAnchor="middle" fill="#fff" fontSize="6">OK</text>
                                            )}
                                        </g>
                                    );
                                })}
                                </g>
                                
                                {/* Leyenda hover */}
                                {hoveredSlot && (
                                    <g>
                                        <rect x="10" y="320" width="160" height="32" fill="#1a1a1a" rx="4" stroke="#333"/>
                                        <text x="20" y="336" fill="white" fontSize="10" fontWeight="bold">
                                            {SLOTS_CONFIG[hoveredSlot].icon} {SLOTS_CONFIG[hoveredSlot].nombre}
                                        </text>
                                        <text x="20" y="347" fill="#888" fontSize="8">
                                            {configuracion[hoveredSlot]?.nombre || 'Click para añadir'}
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
                    {/* Totales del carro P, A, M */}
                    <Card bg="brand.800" borderColor="brand.700">
                        <CardBody>
                            <Heading size="sm" color="white" mb={4}>Totales del Vehículo</Heading>
                            <VStack spacing={4}>
                                <Box w="full">
                                    <HStack justify="space-between" mb={1}>
                                        <HStack>
                                            <Box w="8px" h="8px" bg="yellow.400" borderRadius="full"/>
                                            <Zap size={14} color="#eab308"/>
                                            <Text fontSize="sm" color="gray.400">Potencia (P)</Text>
                                        </HStack>
                                        <Text fontSize="sm" color="white" fontWeight="bold">{stats?.P || 0}</Text>
                                    </HStack>
                                    <Progress value={Math.min((stats?.P || 0), 100)} colorScheme="yellow" bg="brand.700" size="sm" borderRadius="full"/>
                                </Box>
                                <Box w="full">
                                    <HStack justify="space-between" mb={1}>
                                        <HStack>
                                            <Box w="8px" h="8px" bg="blue.400" borderRadius="full"/>
                                            <Wind size={14} color="#3b82f6"/>
                                            <Text fontSize="sm" color="gray.400">Aerodinámica (A)</Text>
                                        </HStack>
                                        <Text fontSize="sm" color="white" fontWeight="bold">{stats?.A || 0}</Text>
                                    </HStack>
                                    <Progress value={Math.min((stats?.A || 0), 100)} colorScheme="blue" bg="brand.700" size="sm" borderRadius="full"/>
                                </Box>
                                <Box w="full">
                                    <HStack justify="space-between" mb={1}>
                                        <HStack>
                                            <Box w="8px" h="8px" bg="green.400" borderRadius="full"/>
                                            <Target size={14} color="#22c55e"/>
                                            <Text fontSize="sm" color="gray.400">Manejo (M)</Text>
                                        </HStack>
                                        <Text fontSize="sm" color="white" fontWeight="bold">{stats?.M || 0}</Text>
                                    </HStack>
                                    <Progress value={Math.min((stats?.M || 0), 100)} colorScheme="green" bg="brand.700" size="sm" borderRadius="full"/>
                                </Box>
                                
                                <Divider borderColor="brand.700" />
                                
                                {/* Suma total */}
                                <HStack justify="space-between" w="full" p={2} bg="brand.900" borderRadius="md">
                                    <Text fontSize="sm" color="gray.400">Total (P+A+M)</Text>
                                    <Text fontSize="lg" fontWeight="bold" color="accent.400">
                                        {(stats?.P || 0) + (stats?.A || 0) + (stats?.M || 0)}
                                    </Text>
                                </HStack>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Partes instaladas */}
                    <Card bg="brand.800" borderColor="brand.700">
                        <CardBody>
                            <Heading size="sm" color="white" mb={4}>Configuración Actual</Heading>
                            <VStack spacing={2} align="stretch">
                                {Object.entries(SLOTS_CONFIG).map(([slot, config]) => {
                                    const parte = configuracion[slot];
                                    return (
                                        <Box 
                                            key={slot} 
                                            p={2} 
                                            bg="brand.900" 
                                            borderRadius="md"
                                            borderWidth="1px"
                                            borderColor={parte ? 'brand.700' : 'red.800'}
                                            cursor="pointer"
                                            _hover={{ borderColor: config.color }}
                                            onClick={() => handleSlotClick(slot)}
                                            opacity={1}
                                        >
                                            <HStack>
                                                <Text fontSize="lg">{config.icon}</Text>
                                                <Box flex={1}>
                                                    <Text fontSize="xs" color="gray.500">{config.nombre}</Text>
                                                    <Text fontSize="sm" color={parte ? 'white' : 'red.400'} noOfLines={1}>
                                                        {parte?.nombre || 'Sin instalar'}
                                                    </Text>
                                                </Box>
                                                {parte && (
                                                    <Badge size="sm" colorScheme="green" variant="subtle">
                                                        <Check size={12} />
                                                    </Badge>
                                                )}
                                            </HStack>
                                            {parte && (
                                                <HStack mt={2} spacing={2} pl={8}>
                                                    <Badge size="sm" colorScheme="yellow" variant="subtle">
                                                        P:{parte.p || 0}
                                                    </Badge>
                                                    <Badge size="sm" colorScheme="blue" variant="subtle">
                                                        A:{parte.a || 0}
                                                    </Badge>
                                                    <Badge size="sm" colorScheme="green" variant="subtle">
                                                        M:{parte.m || 0}
                                                    </Badge>
                                                </HStack>
                                            )}
                                        </Box>
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
                        {instalando ? (
                            <Center py={10}>
                                <VStack>
                                    <Spinner size="lg" color="accent.500" />
                                    <Text color="gray.400">Instalando parte...</Text>
                                </VStack>
                            </Center>
                        ) : (
                        <VStack spacing={3} align="stretch">
                            {/* Opción de remover si hay parte instalada */}
                            {parteInstalada && (
                                <Card 
                                    bg="brand.900" 
                                    borderColor="red.800"
                                    cursor="pointer"
                                    _hover={{ borderColor: 'red.600' }}
                                    onClick={() => handleDesinstalarParte(parteInstalada.id)}
                                >
                                    <CardBody py={3}>
                                        <HStack>
                                            <Trash2 size={20} color="#ef4444"/>
                                            <Box flex={1}>
                                                <Text color="red.400">Desinstalar {parteInstalada.nombre}</Text>
                                                <Text color="gray.500" fontSize="xs">La parte volverá al inventario</Text>
                                            </Box>
                                        </HStack>
                                    </CardBody>
                                </Card>
                            )}
                            
                            {/* Partes disponibles del inventario del equipo */}
                            {slotActivo && inventario
                                .filter(item => {
                                    // Filtrar por categoría ID que corresponde al slot
                                    const categoriaId = SLOTS_CONFIG[slotActivo]?.categoriaId;
                                    return item.Id_categoria === categoriaId;
                                })
                                .map((parte) => {
                                    const isInstalada = parteInstalada?.id === parte.Id_parte;
                                    return (
                                        <Card 
                                            key={parte.Id_parte}
                                            bg="brand.900" 
                                            borderColor={isInstalada ? 'green.500' : 'brand.700'}
                                            cursor={isInstalada ? 'default' : 'pointer'}
                                            _hover={!isInstalada ? { borderColor: SLOTS_CONFIG[slotActivo]?.color } : {}}
                                            onClick={() => !isInstalada && handleInstalarParte(parte)}
                                            opacity={isInstalada ? 0.7 : 1}
                                        >
                                            <CardBody py={3}>
                                                <VStack align="stretch" spacing={2}>
                                                    <HStack justify="space-between">
                                                        <Box>
                                                            <HStack>
                                                                <Text color="white" fontWeight="500">{parte.Nombre}</Text>
                                                                {isInstalada && <Check size={16} color="#22c55e"/>}
                                                            </HStack>
                                                            <HStack mt={1} spacing={3}>
                                                                <Text fontSize="xs" color="gray.400">
                                                                    Disponibles: {parte.Cantidad}
                                                                </Text>
                                                                <Text fontSize="xs" color="green.400">
                                                                    ${new Intl.NumberFormat('es-CR').format(parte.Precio)}
                                                                </Text>
                                                            </HStack>
                                                        </Box>
                                                        <Badge colorScheme={parte.Cantidad > 2 ? 'green' : 'orange'}>
                                                            {parte.Cantidad} disp.
                                                        </Badge>
                                                    </HStack>
                                                    {/* Stats P, A, M */}
                                                    <HStack spacing={2} pt={1} borderTop="1px solid" borderColor="brand.700">
                                                        <Badge colorScheme="yellow" variant="subtle" flex={1} textAlign="center">
                                                            P: {parte.Potencia || 0}
                                                        </Badge>
                                                        <Badge colorScheme="blue" variant="subtle" flex={1} textAlign="center">
                                                            A: {parte.Aerodinamica || 0}
                                                        </Badge>
                                                        <Badge colorScheme="green" variant="subtle" flex={1} textAlign="center">
                                                            M: {parte.Manejo || 0}
                                                        </Badge>
                                                    </HStack>
                                                </VStack>
                                            </CardBody>
                                        </Card>
                                    );
                                })}
                            
                            {slotActivo && inventario.filter(item => {
                                const categoriaId = SLOTS_CONFIG[slotActivo]?.categoriaId;
                                return item.Id_categoria === categoriaId;
                            }).length === 0 && (
                                <Text color="gray.500" textAlign="center" py={4}>
                                    No hay partes disponibles en el inventario para {SLOTS_CONFIG[slotActivo]?.nombre}. 
                                    Debes comprar partes primero.
                                </Text>
                            )}
                        </VStack>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Modal para cambiar piloto */}
            <Modal isOpen={isOpenPiloto} onClose={onClosePiloto} size="md" isCentered>
                <ModalOverlay bg="blackAlpha.800"/>
                <ModalContent bg="brand.800" borderColor="brand.700">
                    <ModalHeader color="white">Cambiar Piloto</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody pb={6}>
                        <VStack spacing={4} align="stretch">
                            {loadingConductores ? (
                                <Center py={6}>
                                    <Spinner color="accent.500" />
                                </Center>
                            ) : (
                                <>
                                    <FormControl>
                                        <FormLabel color="gray.300">Selecciona un piloto</FormLabel>
                                        {conductoresDisponibles.length > 0 ? (
                                            <select 
                                                value={nuevoPiloto || ''}
                                                onChange={(e) => setNuevoPiloto(e.target.value || null)}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    backgroundColor: '#15202b',
                                                    color: '#fff',
                                                    border: '1px solid #333',
                                                    borderRadius: '6px',
                                                    fontFamily: 'inherit'
                                                }}
                                            >
                                                <option value="">Sin piloto</option>
                                                {conductoresDisponibles.map((c) => (
                                                    <option key={c.Id_usuario} value={c.Id_usuario}>
                                                        {c.Nombre_usuario || c.Correo_usuario}
                                                        {c.Habilidad !== null && ` (Habilidad: ${c.Habilidad})`}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <Text color="yellow.400" fontSize="sm">
                                                No hay pilotos disponibles en el equipo
                                            </Text>
                                        )}
                                        <Text fontSize="xs" color="gray.500" mt={2}>
                                            El piloto actual es: {carro?.Conductor || 'Sin asignar'}
                                        </Text>
                                    </FormControl>
                                </>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClosePiloto}>
                            Cancelar
                        </Button>
                        <Button 
                            colorScheme="blue" 
                            onClick={handleCambiarPiloto}
                            isLoading={cambingPiloto}
                        >
                            Guardar Cambios
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
}

export default ArmadoCarro;
