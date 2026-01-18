import { useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Text,
    VStack,
    HStack,
    Input,
    FormControl,
    FormLabel,
    FormHelperText,
    Badge,
    Divider,
    Alert,
    AlertIcon,
    Spinner,
    Box,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
} from '@chakra-ui/react';
import { ShoppingCart, DollarSign, Package, AlertCircle } from 'lucide-react';

/**
 * Modal de Compra de Partes
 * 
 * - isOpen: boolean - Si el modal está abierto
 * - onClose: function - Función para cerrar el modal
 * - parte: object - La parte seleccionada { Id_parte, Nombre, Precio, Marca, ... }
 * - idEquipo: number - ID del equipo que compra
 * - presupuestoDisponible: number - Presupuesto disponible del equipo
 * - onCompraExitosa: function - Callback cuando la compra es exitosa
 */
function ModalCompra({ 
    isOpen, 
    onClose, 
    parte, 
    idEquipo, 
    presupuestoDisponible,
    onCompraExitosa 
}) {
    const [cantidad, setCantidad] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [verificando, setVerificando] = useState(false);
    const [disponibilidad, setDisponibilidad] = useState(null);

    // Calcular precio total
    const precioTotal = parte ? parte.Precio * cantidad : 0;

    // Formatear precio
    const formatPrecio = (precio) => {
        return new Intl.NumberFormat('es-CR', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(precio);
    };

    // Verificar disponibilidad cuando cambia la cantidad
    const verificarDisponibilidad = async () => {
        if (!parte || cantidad <= 0) return;

        setVerificando(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:3000/api/partes/verificar-disponibilidad', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    idEquipo,
                    idParte: parte.Id_parte,
                    cantidad
                })
            });

            if (!response.ok) {
                throw new Error('Error al verificar disponibilidad');
            }

            const data = await response.json();
            setDisponibilidad(data);
        } catch (err) {
            console.error('Error verificando disponibilidad:', err);
            setError('No se pudo verificar la disponibilidad');
        } finally {
            setVerificando(false);
        }
    };

    // Verificar cuando cambia la cantidad
    const handleCantidadChange = (e) => {
        const nuevaCantidad = parseInt(e.target.value) || 1;
        setCantidad(nuevaCantidad > 0 ? nuevaCantidad : 1);
    };

    // Realizar la compra
    const handleComprar = async () => {
        if (!parte || cantidad <= 0) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:3000/api/partes/comprar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    idEquipo,
                    idParte: parte.Id_parte,
                    cantidad
                })
            });

            const data = await response.json();

            if (data.success) {
                // Compra exitosa
                if (onCompraExitosa) {
                    onCompraExitosa(data);
                }
                onClose();
            } else {
                // Error en la compra
                setError(data.mensaje || 'Error al realizar la compra');
            }
        } catch (err) {
            console.error('Error en compra:', err);
            setError('Error de conexión al realizar la compra');
        } finally {
            setLoading(false);
        }
    };

    // Resetear al cerrar
    const handleClose = () => {
        setCantidad(1);
        setError(null);
        setDisponibilidad(null);
        onClose();
    };

    if (!parte) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="lg">
            <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(5px)" />
            <ModalContent bg="brand.800" borderColor="brand.600" borderWidth="1px">
                <ModalHeader color="white">
                    <HStack spacing={3}>
                        <ShoppingCart size={24} color="#48BB78" />
                        <Text>Comprar Parte</Text>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton color="white" />

                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        {/* Información de la parte */}
                        <Box>
                            <Text fontSize="lg" fontWeight="bold" color="white">
                                {parte.Nombre}
                            </Text>
                            <HStack spacing={2} mt={1}>
                                <Badge colorScheme="gray" fontSize="xs">
                                    {parte.Marca}
                                </Badge>
                                <Badge colorScheme="blue" fontSize="xs">
                                    {parte.Categoria}
                                </Badge>
                            </HStack>
                        </Box>

                        <Divider borderColor="brand.700" />

                        {/* Precio unitario */}
                        <Stat>
                            <StatLabel color="gray.400">Precio Unitario</StatLabel>
                            <StatNumber color="green.400">{formatPrecio(parte.Precio)}</StatNumber>
                        </Stat>

                        {/* Input de cantidad */}
                        <FormControl>
                            <FormLabel color="white">Cantidad</FormLabel>
                            <HStack>
                                <Button
                                    size="sm"
                                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                                    isDisabled={loading}
                                >
                                    -
                                </Button>
                                <Input
                                    type="number"
                                    value={cantidad}
                                    onChange={handleCantidadChange}
                                    min="1"
                                    textAlign="center"
                                    color="white"
                                    isDisabled={loading}
                                />
                                <Button
                                    size="sm"
                                    onClick={() => setCantidad(cantidad + 1)}
                                    isDisabled={loading}
                                >
                                    +
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={verificarDisponibilidad}
                                    isLoading={verificando}
                                    colorScheme="blue"
                                    variant="outline"
                                >
                                    Verificar
                                </Button>
                            </HStack>
                            <FormHelperText color="gray.500">
                                Haz clic en "Verificar" para comprobar stock y presupuesto
                            </FormHelperText>
                        </FormControl>

                        {/* Resultado de verificación */}
                        {disponibilidad && (
                            <Box
                                p={3}
                                bg={disponibilidad.PuedeComprar ? 'green.900' : 'red.900'}
                                borderRadius="md"
                                borderWidth="1px"
                                borderColor={disponibilidad.PuedeComprar ? 'green.600' : 'red.600'}
                            >
                                <VStack align="stretch" spacing={2}>
                                    <HStack justify="space-between">
                                        <Text color="gray.300" fontSize="sm">Stock disponible:</Text>
                                        <Text color="white" fontWeight="bold">
                                            {disponibilidad.StockDisponible} unidades
                                        </Text>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text color="gray.300" fontSize="sm">Tu presupuesto:</Text>
                                        <Text color="white" fontWeight="bold">
                                            {formatPrecio(disponibilidad.PresupuestoDisponible)}
                                        </Text>
                                    </HStack>
                                    <Divider borderColor={disponibilidad.PuedeComprar ? 'green.700' : 'red.700'} />
                                    <HStack justify="space-between">
                                        <Text color={disponibilidad.PuedeComprar ? 'green.200' : 'red.200'}>
                                            {disponibilidad.Mensaje}
                                        </Text>
                                        {disponibilidad.PuedeComprar ? (
                                            <Badge colorScheme="green">✓ Disponible</Badge>
                                        ) : (
                                            <Badge colorScheme="red">✗ No disponible</Badge>
                                        )}
                                    </HStack>
                                </VStack>
                            </Box>
                        )}

                        {/* Precio total */}
                        <Box
                            p={4}
                            bg="brand.700"
                            borderRadius="md"
                            borderWidth="1px"
                            borderColor="brand.600"
                        >
                            <HStack justify="space-between">
                                <Text color="gray.300" fontSize="lg">Total a pagar:</Text>
                                <Text color="green.400" fontSize="2xl" fontWeight="bold">
                                    {formatPrecio(precioTotal)}
                                </Text>
                            </HStack>
                            {presupuestoDisponible < precioTotal && (
                                <Alert status="warning" mt={2} bg="orange.900" borderRadius="md">
                                    <AlertIcon />
                                    <Text fontSize="sm">
                                        Presupuesto insuficiente. Te faltan {formatPrecio(precioTotal - presupuestoDisponible)}
                                    </Text>
                                </Alert>
                            )}
                        </Box>

                        {/* Error */}
                        {error && (
                            <Alert status="error" bg="red.900" borderRadius="md">
                                <AlertIcon />
                                <Text fontSize="sm">{error}</Text>
                            </Alert>
                        )}
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={handleClose} isDisabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        colorScheme="green"
                        leftIcon={loading ? <Spinner size="sm" /> : <ShoppingCart size={16} />}
                        onClick={handleComprar}
                        isLoading={loading}
                        isDisabled={!disponibilidad || !disponibilidad.PuedeComprar}
                    >
                        Confirmar Compra
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default ModalCompra;

