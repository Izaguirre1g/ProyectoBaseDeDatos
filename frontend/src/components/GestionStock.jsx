// Componente para gestionar stock (solo Admin)
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
    Input,
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
} from '@chakra-ui/react';
import { partesService } from '../services/partes.service';

export function ModalGestionStock({ isOpen, onClose, parte, onSuccess }) {
    const [cantidad, setCantidad] = useState(1);
    const [motivo, setMotivo] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleAñadir = async () => {
        if (cantidad <= 0) {
            toast({
                title: 'Error',
                description: 'La cantidad debe ser mayor a 0',
                status: 'error',
                duration: 3000,
            });
            return;
        }

        setLoading(true);
        try {
            const response = await partesService.añadirStock(
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
                });
                onSuccess?.();
                onClose();
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Error al añadir stock',
                status: 'error',
                duration: 5000,
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
                });
                onSuccess?.();
                onClose();
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Error al quitar stock',
                status: 'error',
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    Gestionar Stock: {parte?.Nombre}
                </ModalHeader>
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Text>
                            <strong>Stock actual:</strong> {parte?.Stock_total || 0} unidades
                        </Text>

                        <FormControl>
                            <FormLabel>Cantidad</FormLabel>
                            <NumberInput
                                min={1}
                                value={cantidad}
                                onChange={(_, val) => setCantidad(val)}
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Motivo (opcional)</FormLabel>
                            <Textarea
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                placeholder="Ej: Reposición mensual, Ajuste por inventario, etc."
                            />
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <HStack spacing={3}>
                        <Button
                            colorScheme="red"
                            onClick={handleQuitar}
                            isLoading={loading}
                        >
                            Quitar Stock
                        </Button>
                        <Button
                            colorScheme="green"
                            onClick={handleAñadir}
                            isLoading={loading}
                        >
                            Añadir Stock
                        </Button>
                        <Button onClick={onClose}>
                            Cancelar
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}