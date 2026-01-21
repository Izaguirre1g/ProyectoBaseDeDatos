import { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    useToast,
    HStack,
    VStack,
    Text,
    Divider,
    SimpleGrid,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Box,
    Badge,
} from '@chakra-ui/react';
import { Plus, Zap, Wind, Target } from 'lucide-react';
import partesService from '../services/partes.service';

/**
 * Modal para crear una nueva parte en el inventario
 * Solo accesible por Admin
 */
export function ModalNuevaParte({ isOpen, onClose, categorias, onSuccess }) {
    const [formData, setFormData] = useState({
        nombre: '',
        marca: '',
        idCategoria: '',
        precio: 0,
        potencia: 5,
        aerodinamica: 5,
        manejo: 5,
        stockInicial: 10,
    });
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    // Reiniciar formulario cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            setFormData({
                nombre: '',
                marca: '',
                idCategoria: categorias[0]?.Id_categoria || '',
                precio: 0,
                potencia: 5,
                aerodinamica: 5,
                manejo: 5,
                stockInicial: 10,
            });
        }
    }, [isOpen, categorias]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNumberChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        // Validaciones
        if (!formData.nombre.trim()) {
            toast({
                title: 'Error',
                description: 'El nombre de la parte es requerido',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (!formData.idCategoria) {
            toast({
                title: 'Error',
                description: 'Debes seleccionar una categoría',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (formData.precio <= 0) {
            toast({
                title: 'Error',
                description: 'El precio debe ser mayor a 0',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setLoading(true);
        try {
            // Crear la parte
            const nuevaParte = await partesService.crearParte({
                nombre: formData.nombre.trim(),
                marca: formData.marca.trim() || 'Genérica',
                idCategoria: parseInt(formData.idCategoria),
                precio: parseFloat(formData.precio),
                potencia: parseInt(formData.potencia),
                aerodinamica: parseInt(formData.aerodinamica),
                manejo: parseInt(formData.manejo),
            });

            console.log('Parte creada:', nuevaParte);

            // Si se especificó stock inicial, agregarlo
            if (formData.stockInicial > 0 && nuevaParte?.Id_parte) {
                try {
                    await partesService.agregarStock(
                        nuevaParte.Id_parte,
                        parseInt(formData.stockInicial),
                        'Stock inicial al crear parte'
                    );
                } catch (stockError) {
                    console.error('Error al agregar stock inicial:', stockError);
                    // La parte se creó, solo falló el stock
                    toast({
                        title: 'Parte creada parcialmente',
                        description: 'La parte se creó pero no se pudo agregar el stock inicial',
                        status: 'warning',
                        duration: 5000,
                        isClosable: true,
                    });
                }
            }

            toast({
                title: '¡Parte creada exitosamente!',
                description: `${formData.nombre} ha sido agregada al catálogo con ${formData.stockInicial} unidades de stock`,
                status: 'success',
                duration: 5000,
                isClosable: true,
            });

            // Llamar callback de éxito y cerrar modal
            if (onSuccess) onSuccess();
            onClose();

        } catch (error) {
            console.error('Error al crear parte:', error);
            toast({
                title: 'Error al crear la parte',
                description: error.response?.data?.error || error.message || 'Error desconocido',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    // Componente para mostrar slider de stats
    const StatSlider = ({ label, name, value, icon: IconComponent, color }) => (
        <FormControl>
            <FormLabel fontSize="sm">
                <HStack spacing={2}>
                    <IconComponent size={14} color={color} />
                    <Text>{label}</Text>
                    <Badge colorScheme={value >= 7 ? 'green' : value >= 4 ? 'yellow' : 'red'}>
                        {value}
                    </Badge>
                </HStack>
            </FormLabel>
            <Slider
                min={1}
                max={9}
                step={1}
                value={value}
                onChange={(val) => handleNumberChange(name, val)}
                colorScheme={value >= 7 ? 'green' : value >= 4 ? 'yellow' : 'red'}
            >
                <SliderTrack>
                    <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb boxSize={5}>
                    <Box color={color} as={IconComponent} boxSize={3} />
                </SliderThumb>
            </Slider>
        </FormControl>
    );

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="lg" isCentered>
            <ModalOverlay backdropFilter="blur(5px)" />
            <ModalContent>
                <ModalHeader>
                    <HStack spacing={2}>
                        <Plus size={24} />
                        <Text>Agregar nueva parte al inventario</Text>
                    </HStack>
                </ModalHeader>

                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        {/* Información básica */}
                        <SimpleGrid columns={2} spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Nombre</FormLabel>
                                <Input
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Motor V6 Turbo"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Marca</FormLabel>
                                <Input
                                    name="marca"
                                    value={formData.marca}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Ferrari, Mercedes..."
                                />
                            </FormControl>
                        </SimpleGrid>

                        <SimpleGrid columns={2} spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Categoría</FormLabel>
                                <Select
                                    name="idCategoria"
                                    value={formData.idCategoria}
                                    onChange={handleInputChange}
                                    placeholder="Seleccionar categoría"
                                >
                                    {categorias.map(cat => (
                                        <option key={cat.Id_categoria} value={cat.Id_categoria}>
                                            {cat.Nombre}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Precio (USD)</FormLabel>
                                <NumberInput
                                    min={0}
                                    value={formData.precio}
                                    onChange={(_, val) => handleNumberChange('precio', val || 0)}
                                >
                                    <NumberInputField placeholder="0.00" />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </FormControl>
                        </SimpleGrid>

                        <Divider />

                        {/* Stats */}
                        <Text fontWeight="bold" fontSize="md">Estadísticas de la Parte</Text>
                        
                        <VStack spacing={4}>
                            <StatSlider 
                                label="Potencia" 
                                name="potencia" 
                                value={formData.potencia}
                                icon={Zap}
                                color="#F6E05E"
                            />
                            <StatSlider 
                                label="Aerodinámica" 
                                name="aerodinamica" 
                                value={formData.aerodinamica}
                                icon={Wind}
                                color="#63B3ED"
                            />
                            <StatSlider 
                                label="Manejo" 
                                name="manejo" 
                                value={formData.manejo}
                                icon={Target}
                                color="#68D391"
                            />
                        </VStack>

                        <Divider />

                        {/* Stock inicial */}
                        <FormControl>
                            <FormLabel fontWeight="bold">
                                Stock Inicial
                                <Text as="span" fontWeight="normal" fontSize="sm" color="gray.500" ml={2}>
                                    (unidades disponibles para vender)
                                </Text>
                            </FormLabel>
                            <NumberInput
                                min={0}
                                max={9999}
                                value={formData.stockInicial}
                                onChange={(_, val) => handleNumberChange('stockInicial', val || 0)}
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <HStack spacing={3}>
                        <Button 
                            variant="ghost" 
                            onClick={handleClose}
                            isDisabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            leftIcon={<Plus size={18} />}
                            colorScheme="green"
                            onClick={handleSubmit}
                            isLoading={loading}
                            loadingText="Creando..."
                        >
                            Crear Parte
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default ModalNuevaParte;
