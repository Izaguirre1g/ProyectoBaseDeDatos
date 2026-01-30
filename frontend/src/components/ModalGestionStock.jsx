import { useState } from 'react';
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
    Textarea,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    useToast,
    HStack,
    VStack,
    Text,
    Badge,
    Divider,
    Box,
} from '@chakra-ui/react';
import { Package, Plus, Minus } from 'lucide-react';
import { partesService } from '../services/partes.service';

/**
 * Modal para gestionar stock de una parte
 * Solo accesible por Admin
 */
export function ModalGestionStock({ isOpen, onClose, parte, onSuccess }) {
    const [cantidad, setCantidad] = useState(1);
    const [motivo, setMotivo] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleAgregar = async () => {
        if (cantidad <= 0) {
            toast({
                title: 'Error',
                description: 'La cantidad debe ser mayor a 0',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setLoading(true);
        try {
            const response = await partesService.agregarStock(
                parte.Id_parte,
                cantidad,
                motivo || 'Reposición de inventario'
            );

            if (response.success) {
                toast({
                    title: 'Stock añadido',
                    description: response.mensaje,
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
                
                // Reiniciar formulario
                setCantidad(1);
                setMotivo('');
                
                // Llamar callback de éxito y cerrar modal
                if (onSuccess) onSuccess();
                onClose();
            } else {
                toast({
                    title: 'Error',
                    description: response.mensaje || 'No se pudo agregar el stock',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Error al agregar stock',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleQuitar = async () => {
        if (cantidad <= 0) {
            toast({
                title: 'Error',
                description: 'La cantidad debe ser mayor a 0',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // Verificar que hay suficiente stock
        const stockActual = parte?.Stock_total || 0;
        if (cantidad > stockActual) {
            toast({
                title: 'Stock insuficiente',
                description: `Solo hay ${stockActual} unidades disponibles. No se pueden quitar ${cantidad}.`,
                status: 'warning',
                duration: 4000,
                isClosable: true,
            });
            return;
        }

        setLoading(true);
        try {
            const response = await partesService.quitarStock(
                parte.Id_parte,
                cantidad,
                motivo || 'Ajuste de inventario'
            );

            if (response.success) {
                toast({
                    title: 'Stock quitado',
                    description: response.mensaje,
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
                
                // Reiniciar formulario
                setCantidad(1);
                setMotivo('');
                
                // Llamar callback de éxito y cerrar modal
                if (onSuccess) onSuccess();
                onClose();
            } else {
                toast({
                    title: 'Error',
                    description: response.mensaje || 'No se pudo quitar el stock',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Error al quitar stock:', error);
            toast({
                title: 'Error',
                description: error.message || 'Error al quitar stock',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        // Reiniciar formulario al cerrar
        setCantidad(1);
        setMotivo('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="md" isCentered>
            <ModalOverlay backdropFilter="blur(5px)" />
            <ModalContent>
                <ModalHeader>
                    <HStack spacing={2}>
                        <Package size={24} />
                        <Text>Gestionar Stock</Text>
                    </HStack>
                </ModalHeader>

                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        {/* Información de la parte */}
                        <Box 
                            p={4} 
                            bg="gray.60" 
                            borderRadius="md" 
                            borderWidth="1px"
                        >
                            <VStack align="stretch" spacing={2}>
                                <HStack justify="space-between">
                                    <Text fontWeight="bold" fontSize="lg">
                                        {parte?.Nombre}
                                    </Text>
                                    <Badge 
                                        colorScheme={
                                            (parte?.Stock_total || 0) === 0 ? 'red' :
                                            (parte?.Stock_total || 0) < 10 ? 'yellow' :
                                            'green'
                                        }
                                        fontSize="md"
                                        px={3}
                                        py={1}
                                    >
                                        {parte?.Stock_total || 0} unidades
                                    </Badge>
                                </HStack>
                                <Text fontSize="sm" color="gray.600">
                                    {parte?.Marca} | {parte?.Categoria}
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                    Precio: ${new Intl.NumberFormat('es-CR').format(parte?.Precio)}
                                </Text>
                            </VStack>
                        </Box>

                        <Divider />

                        {/* Cantidad */}
                        <FormControl isRequired>
                            <FormLabel fontWeight="semibold">
                                Cantidad
                            </FormLabel>
                            <NumberInput
                                min={1}
                                max={9999}
                                value={cantidad}
                                onChange={(valueString, valueNumber) => 
                                    setCantidad(valueNumber)
                                }
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </FormControl>

                        {/* Motivo */}
                        <FormControl>
                            <FormLabel fontWeight="semibold">
                                Motivo <Text as="span" fontWeight="normal" fontSize="sm">(opcional)</Text>
                            </FormLabel>
                            <Textarea
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                placeholder="Ej: Reposición mensual, Ajuste por inventario físico, Devolución de proveedor, etc."
                                rows={3}
                            />
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <HStack spacing={3} width="100%" justify="space-between">
                        <Button
                            leftIcon={<Minus size={18} />}
                            colorScheme="red"
                            onClick={handleQuitar}
                            isLoading={loading}
                            loadingText="Quitando..."
                            isDisabled={(parte?.Stock_total || 0) === 0}
                        >
                            Quitar Stock
                        </Button>
                        
                        <HStack spacing={2}>
                            <Button
                                leftIcon={<Plus size={18} />}
                                colorScheme="green"
                                onClick={handleAgregar}
                                isLoading={loading}
                                loadingText="Agregando..."
                            >
                                Agregar Stock
                            </Button>
                            <Button 
                                variant="ghost" 
                                onClick={handleClose}
                                isDisabled={loading}
                            >
                                Cancelar
                            </Button>
                        </HStack>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
