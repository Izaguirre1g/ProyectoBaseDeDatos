import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Heading,
    Text,
    SimpleGrid,
    Card,
    CardBody,
    Button,
    Badge,
    HStack,
    VStack,
    Progress,
    Flex,
    Wrap,
    WrapItem,
    Spinner,
    Center,
    Alert,
    AlertIcon,
    Divider,
    useToast,
} from '@chakra-ui/react';
import { Package, Zap, Wind, Target, ShoppingCart } from 'lucide-react';
import partesService from '../services/partes.service';
import ModalCompra from '../components/ModalCompra';

function Catalogo() {
    const [partes, setPartes] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [categoriaActiva, setCategoriaActiva] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const toast = useToast();

    // Estados para el modal de compra
    const [modalCompraOpen, setModalCompraOpen] = useState(false);
    const [parteSeleccionada, setParteSeleccionada] = useState(null);
    const [presupuestoDisponible, setPresupuestoDisponible] = useState(0);

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const data = await partesService.getCategorias();
                setCategorias(data);
            } catch (err) {
                console.error('Error al cargar categorias:', err);
            }
        };
        fetchCategorias();
    }, []);

    useEffect(() => {
        // Obtener datos del usuario logueado
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        
        // Obtener presupuesto del equipo
        if (usuario.Id_equipo) {
            fetch(`http://localhost:3000/api/equipos/${usuario.Id_equipo}/presupuesto`, {
                credentials: 'include'
            })
            .then(res => res.json())
            .then(data => {
                setPresupuestoDisponible(data.Presupuesto || 0);
            })
            .catch(err => console.error('Error al obtener presupuesto:', err));
        }
    }, []);

    useEffect(() => {
        const fetchPartes = async () => {
            setLoading(true);
            try {
                const data = await partesService.getAll(categoriaActiva);
                setPartes(data);
                setError(null);
            } catch (err) {
                setError('Error al cargar partes');
            } finally {
                setLoading(false);
            }
        };
        fetchPartes();
    }, [categoriaActiva]);

    const formatPrecio = (precio) => {
        return new Intl.NumberFormat('es-CR', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(precio);
    };

    const getStatColorScheme = (value) => {
        if (value >= 7) return 'green';
        if (value >= 4) return 'yellow';
        return 'red';
    };

    

    const StatBar = ({ label, value, icon: IconComponent }) => (
        <HStack spacing={3} w="full">
            <HStack w="90px" spacing={2}>
                <IconComponent size={14} color="#718096" />
                <Text fontSize="xs" color="gray.500">{label}</Text>
            </HStack>
            <Progress 
                value={(value / 9) * 100} 
                colorScheme={getStatColorScheme(value)}
                bg="brand.700"
                borderRadius="full"
                size="sm"
                flex={1}
            />
            <Text fontSize="xs" fontWeight="bold" color="white" w="20px" textAlign="right">
                {value}
            </Text>
        </HStack>
    );

    const handleComprar = (parte) => {
        setParteSeleccionada(parte);
        setModalCompraOpen(true);
    };

    const handleCompraExitosa = (data) => {
        toast({
            title: '¡Compra exitosa!',
            description: data.mensaje || 'La parte ha sido agregada a tu inventario',
            status: 'success',
            duration: 5000,
            isClosable: true,
        });
        
        // Recargar partes para actualizar stock
        fetchPartes();
        
        // Actualizar presupuesto
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        if (usuario.Id_equipo) {
            fetch(`http://localhost:3000/api/equipos/${usuario.Id_equipo}/presupuesto`, {
                credentials: 'include'
            })
            .then(res => res.json())
            .then(data => {
                setPresupuestoDisponible(data.Presupuesto || 0);
            });
        }
    };

    const getCategoriaIcon = (catId) => {
        const icons = {
            'Motor': Zap,
            'Aerodinamica': Wind,
            'Transmision': Target,
        };
        return icons[catId] || Package;
    };

    return (
        <Container maxW="container.xl" py={8}>
            <Box mb={6}>
                <Heading size="lg" color="white">Catalogo de Partes F1</Heading>
                <Text color="gray.400" mt={1}>Selecciona las mejores partes para tu carro</Text>
            </Box>

            {/* Filtros por categoria */}
            <Wrap spacing={3} mb={6}>
                <WrapItem key="cat-todas">
                    <Button
                        leftIcon={<Package size={16} />}
                        variant={categoriaActiva === null ? 'solid' : 'outline'}
                        size="sm"
                        borderRadius="full"
                        onClick={() => setCategoriaActiva(null)}
                    >
                        Todas
                    </Button>
                </WrapItem>
                {categorias.map(cat => (
                    <WrapItem key={cat.id || cat.Id_categoria}>
                        <Button
                            variant={categoriaActiva === (cat.id || cat.Id_categoria) ? 'solid' : 'outline'}
                            size="sm"
                            borderRadius="full"
                            onClick={() => setCategoriaActiva(cat.id || cat.Id_categoria)}
                        >
                            {cat.nombre}
                        </Button>
                    </WrapItem>
                ))}
            </Wrap>

            {/* Mensaje de error */}
            {error && (
                <Alert status="error" bg="red.900" color="red.200" borderRadius="md" mb={6}>
                    <AlertIcon color="red.400" />
                    {error}
                </Alert>
            )}

            {/* Loading */}
            {loading && (
                <Center py={12}>
                    <VStack spacing={4}>
                        <Spinner size="xl" color="accent.600" thickness="4px" />
                        <Text color="gray.500">Cargando partes...</Text>
                    </VStack>
                </Center>
            )}

            {/* Grid de partes */}
            {!loading && (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                    {partes.map(parte => (
                        <Card 
                            key={parte.Id_parte} 
                            bg="brand.800" 
                            borderColor="brand.700"
                            _hover={{ borderColor: 'brand.600', transform: 'translateY(-2px)' }}
                            transition="all 0.2s"
                        >
                            <CardBody>
                                <Flex justify="space-between" mb={2}>
                                    <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                                        {parte.Categoria}
                                    </Text>
                                    <Badge 
                                        colorScheme="gray" 
                                        variant="subtle"
                                        fontSize="xs"
                                    >
                                        Marca: {parte.Marca}
                                    </Badge>
                                </Flex>
                                <Heading size="sm" color="white" mb={1}>{parte.Nombre}</Heading>
                                <Text fontSize="sm" color="gray.500" mb={4}>{parte.Descripcion || 'Sin descripción'}</Text>

                                <VStack spacing={2} mb={4}>
                                    <StatBar label="Potencia" value={parte.Potencia} icon={Zap} />
                                    <StatBar label="Aero" value={parte.Aerodinamica} icon={Wind} />
                                    <StatBar label="Manejo" value={parte.Manejo} icon={Target} />
                                </VStack>

                                <Divider borderColor="brand.700" mb={4} />

                                <Flex justify="space-between" align="center">
                                    <Text fontSize="lg" fontWeight="bold" color="green.400">
                                        {formatPrecio(parte.Precio)}
                                    </Text>
                                    <Button 
                                        size="sm" 
                                        leftIcon={<ShoppingCart size={14} />}
                                        onClick={() => handleComprar(parte)}
                                    >
                                        Comprar
                                    </Button>
                                </Flex>
                            </CardBody>
                        </Card>
                    ))}
                </SimpleGrid>
            )}

            {/* Modal de Compra */}
            <ModalCompra
                isOpen={modalCompraOpen}
                onClose={() => setModalCompraOpen(false)}
                parte={parteSeleccionada}
                idEquipo={JSON.parse(localStorage.getItem('usuario') || '{}').Id_equipo}
                presupuestoDisponible={presupuestoDisponible}
                onCompraExitosa={handleCompraExitosa}
            />

            {/* Resumen */}
            <Text textAlign="center" mt={8} color="gray.600" fontSize="sm">
                Mostrando {partes.length} partes
                {categoriaActiva && ` en ${categorias.find(c => c.id === categoriaActiva)?.nombre}`}
            </Text>
        </Container>
    );
}

export default Catalogo;
