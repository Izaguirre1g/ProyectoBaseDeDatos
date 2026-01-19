import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Progress,
    Flex,
    Spinner,
    Center,
    useToast,
} from '@chakra-ui/react';
import { Car, Zap, Wind, Target, User, Building2 } from 'lucide-react';
import { carrosService } from '../services/carros.service';

function Carros() {
    const [carros, setCarros] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        cargarCarros();
    }, []);

    const cargarCarros = async () => {
        try {
            setLoading(true);
            const data = await carrosService.getAll();
            
            // Obtener conteo real de partes para cada carro
            const carrosEnriquecidos = await Promise.all(
                data.map(async (c) => {
                    try {
                        const partesData = await carrosService.getPartes(c.Id_carro);
                        const numPartes = partesData ? (Array.isArray(partesData) ? partesData.length : (partesData.Count || 0)) : 0;
                        
                        // Crear slots con información de partes
                        const configuracion = {};
                        const partesArray = Array.isArray(partesData) ? partesData : (partesData.value || []);
                        partesArray.forEach(parte => {
                            if (parte.Id_categoria === 1) configuracion.powerUnit = { potencia: parte.Potencia };
                            if (parte.Id_categoria === 2) configuracion.aerodinamica = { aerodinamica: parte.Aerodinamica };
                            if (parte.Id_categoria === 3) configuracion.neumaticos = { manejo: parte.Manejo };
                            if (parte.Id_categoria === 4) configuracion.suspension = { manejo: parte.Manejo };
                            if (parte.Id_categoria === 5) configuracion.cajaCambios = { manejo: parte.Manejo };
                        });
                        
                        return {
                            id: c.Id_carro,
                            numero: c.Id_carro,
                            modelo: c.Equipo,
                            conductor: c.Conductor || 'Sin asignar',
                            equipo: c.Equipo,
                            configuracion,
                            finalizado: c.Finalizado === 1,
                            numPartes
                        };
                    } catch (error) {
                        console.error(`Error al obtener partes del carro ${c.Id_carro}:`, error);
                        return {
                            id: c.Id_carro,
                            numero: c.Id_carro,
                            modelo: c.Equipo,
                            conductor: c.Conductor || 'Sin asignar',
                            equipo: c.Equipo,
                            configuracion: {},
                            finalizado: c.Finalizado === 1,
                            numPartes: 0
                        };
                    }
                })
            );
            setCarros(carrosEnriquecidos);
        } catch (error) {
            toast({
                title: 'Error al cargar carros',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const calcularStats = (configuracion) => {
        const slots = ['powerUnit', 'aerodinamica', 'cajaCambios', 'suspension', 'neumaticos'];
        let potencia = 0, aerodinamica = 0, manejo = 0, instaladas = 0;
        
        slots.forEach(slot => {
            if (configuracion[slot]) {
                potencia += configuracion[slot].potencia || 0;
                aerodinamica += configuracion[slot].aerodinamica || 0;
                manejo += configuracion[slot].manejo || 0;
                instaladas++;
            }
        });
        
        return { potencia, aerodinamica, manejo, instaladas, total: slots.length };
    };

    if (loading) {
        return (
            <Center minH="60vh">
                <Spinner size="xl" color="accent.600" />
            </Center>
        );
    }

    return (
        <Container maxW="container.xl" py={8}>
            <Box mb={6}>
                <Heading size="lg" color="white">Armado de Carros</Heading>
                <Text color="gray.400" mt={1}>Selecciona un carro para configurar sus partes</Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                {carros.map(carro => {
                    const stats = calcularStats(carro.configuracion);
                    const isCompleto = stats.instaladas === stats.total;
                    
                    return (
                        <Card 
                            key={carro.id}
                            bg="brand.800" 
                            borderColor="brand.700"
                            cursor="pointer"
                            _hover={{ 
                                borderColor: 'accent.600', 
                                transform: 'translateY(-4px)',
                                boxShadow: 'lg'
                            }}
                            transition="all 0.2s"
                            onClick={() => navigate(`/carros/${carro.id}`)}
                        >
                            <CardBody>
                                <VStack align="stretch" spacing={4}>
                                    {/* Header */}
                                    <Flex justify="space-between" align="start">
                                        <HStack>
                                            <Flex
                                                w={10}
                                                h={10}
                                                bg="accent.600"
                                                borderRadius="lg"
                                                align="center"
                                                justify="center"
                                            >
                                                <Car size={20} color="white"/>
                                            </Flex>
                                            <Box>
                                                <Heading size="sm" color="white">
                                                    {carro.modelo} #{carro.numero}
                                                </Heading>
                                                <HStack spacing={1} mt={0.5}>
                                                    <User size={12} color="#718096"/>
                                                    <Text fontSize="xs" color="gray.400">
                                                        {carro.conductor}
                                                    </Text>
                                                </HStack>
                                            </Box>
                                        </HStack>
                                        <Badge 
                                            colorScheme={isCompleto ? 'green' : 'orange'}
                                            variant="subtle"
                                        >
                                            {stats.instaladas}/{stats.total}
                                        </Badge>
                                    </Flex>

                                    {/* Equipo */}
                                    <HStack spacing={2} color="gray.500">
                                        <Building2 size={14}/>
                                        <Text fontSize="sm">{carro.equipo}</Text>
                                    </HStack>

                                    {/* Stats preview */}
                                    <VStack spacing={2}>
                                        <HStack w="full">
                                            <Zap size={12} color="#eab308"/>
                                            <Progress 
                                                value={stats.potencia / 45 * 100} 
                                                colorScheme="yellow" 
                                                bg="brand.700" 
                                                size="xs" 
                                                flex={1}
                                                borderRadius="full"
                                            />
                                            <Text fontSize="xs" color="gray.400" w="30px" textAlign="right">
                                                {stats.potencia}
                                            </Text>
                                        </HStack>
                                        <HStack w="full">
                                            <Wind size={12} color="#3b82f6"/>
                                            <Progress 
                                                value={stats.aerodinamica / 45 * 100} 
                                                colorScheme="blue" 
                                                bg="brand.700" 
                                                size="xs" 
                                                flex={1}
                                                borderRadius="full"
                                            />
                                            <Text fontSize="xs" color="gray.400" w="30px" textAlign="right">
                                                {stats.aerodinamica}
                                            </Text>
                                        </HStack>
                                        <HStack w="full">
                                            <Target size={12} color="#22c55e"/>
                                            <Progress 
                                                value={stats.manejo / 45 * 100} 
                                                colorScheme="green" 
                                                bg="brand.700" 
                                                size="xs" 
                                                flex={1}
                                                borderRadius="full"
                                            />
                                            <Text fontSize="xs" color="gray.400" w="30px" textAlign="right">
                                                {stats.manejo}
                                            </Text>
                                        </HStack>
                                    </VStack>

                                    {/* Estado */}
                                    <Text 
                                        fontSize="xs" 
                                        color={isCompleto ? 'green.400' : 'orange.400'}
                                        textAlign="center"
                                    >
                                        {isCompleto ? 'Listo para competir' : 'Configuracion incompleta'}
                                    </Text>
                                </VStack>
                            </CardBody>
                        </Card>
                    );
                })}
            </SimpleGrid>
        </Container>
    );
}

export default Carros;
