import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardBody,
    Heading,
    VStack,
    HStack,
    Select,
    Button,
    Icon,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Spinner,
    Center,
} from '@chakra-ui/react';
import { ExternalLink, RefreshCw } from 'lucide-react';

/**
 * Componente para embeber dashboards de Grafana en la aplicación
 * Utilizando iframes con seguridad mediante parámetros de URL
 */


//CAMBIAR ESTE URL POR LA IP DE LA COMPU

const GRAFANA_BASE_URL = `http://${window.location.hostname}:3001`;

// IDs de los paneles (estos se obtienen de Grafana cuando creas los paneles)
// Formato: /d-solo/ID_DASHBOARD/NOMBRE?panelId=NUMERO_PANEL
const PANELS = {
    ranking: {
        title: 'Ranking por Simulacion',
        description: 'Posiciones finales de cada simulación',
        url: '/d-solo/f1sim/f1-simulaciones?panelId=1&refresh=30s&var-simulacion=$simulacion',
    },
    comparacion: {
        title: 'Comparacion Setup vs Tiempo',
        description: 'Cómo cambia el tiempo con diferentes configuraciones',
        url: '/d-solo/f1sim/f1-simulaciones?panelId=2&refresh=30s&var-carro=$carro',
    },
    pam: {
        title: 'P, A, M vs Tiempo',
        description: 'Relación entre potencia, aerodinámica, manejo y tiempo',
        url: '/d-solo/f1sim/f1-simulaciones?panelId=3&refresh=30s&var-simulacion=$simulacion',
    },
    dashboard: {
        title: 'Dashboard Completo',
        description: 'Vista completa de todas las simulaciones',
        url: '/d/f1sim/f1-simulaciones?kiosk=tv&refresh=1m',
    },
};

/**
 * Panel individual de Grafana
 */
function GrafanaPanel({ panel, panelKey, simulacion, carro }) {
    const [isLoading, setIsLoading] = useState(true);
    
    // Reemplazar variables en la URL
    let panelUrl = PANELS[panelKey].url
        .replace('$simulacion', simulacion || '1')
        .replace('$carro', carro || '1');

    const fullUrl = `${GRAFANA_BASE_URL}${panelUrl}`;

    return (
        <Card bg="brand.800" borderColor="brand.700" borderWidth="1px">
            <CardBody p={4}>
                <VStack align="stretch" spacing={3}>
                    <Box>
                        <Heading size="sm" color="white" mb={1}>
                            {panel.title}
                        </Heading>
                        <Box fontSize="xs" color="gray.400">
                            {panel.description}
                        </Box>
                    </Box>

                    {/* Iframe del panel */}
                    <Box
                        position="relative"
                        w="full"
                        h="400px"
                        borderRadius="md"
                        overflow="hidden"
                        bg="brand.900"
                    >
                        {isLoading && (
                            <Center position="absolute" w="full" h="full">
                                <Spinner color="accent.500" />
                            </Center>
                        )}
                        <iframe
                            src={fullUrl}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                borderRadius: '8px',
                            }}
                            title={panel.title}
                            onLoad={() => setIsLoading(false)}
                            allow="allowfullscreen"
                        />
                    </Box>

                    {/* Link externo */}
                    <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<Icon as={ExternalLink} />}
                        as="a"
                        href={fullUrl}
                        target="_blank"
                        color="accent.400"
                    >
                        Ver en Grafana
                    </Button>
                </VStack>
            </CardBody>
        </Card>
    );
}

/**
 * Componente principal de Grafana
 */
export function GrafanaDashboard() {
    const [simulacion, setSimulacion] = useState('1');
    const [carro, setCarro] = useState('1');
    const [simulaciones, setSimulaciones] = useState([]);
    const [carros, setCarros] = useState([]);
    const [loading, setLoading] = useState(true);

    // Cargar simulaciones y carros disponibles
    useEffect(() => {
        // En una aplicación real, esto vendría del backend
        // Por ahora usamos valores hardcodeados
        
        // Simular carga de datos
        setTimeout(() => {
            setSimulaciones([
                { id: '1', label: 'Simulación 1' },
                { id: '2', label: 'Simulación 2' },
                { id: '3', label: 'Simulación 3' },
            ]);
            setCarros([
                { id: '1', label: 'Ferrari Carro #1' },
                { id: '2', label: 'Ferrari Carro #2' },
                { id: '3', label: 'Mercedes Carro #1' },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <VStack align="stretch" spacing={6} w="full">
            {/* Header */}
            <Card bg="brand.800" borderColor="brand.700" borderWidth="1px">
                <CardBody>
                    <VStack align="stretch" spacing={4}>
                        <HStack justify="space-between">
                            <Heading size="lg" color="white">
                                Analisis de Simulaciones
                            </Heading>
                            <Button
                                size="sm"
                                leftIcon={<Icon as={RefreshCw} />}
                                colorScheme="blue"
                                variant="outline"
                                as="a"
                                href={`${GRAFANA_BASE_URL}/dashboard`}
                                target="_blank"
                            >
                                Ir a Grafana
                            </Button>
                        </HStack>

                        {/* Controles */}
                        <HStack spacing={4}>
                            <Box flex={1}>
                                <Box fontSize="xs" color="gray.400" mb={1}>
                                    Simulación
                                </Box>
                                <Select
                                    value={simulacion}
                                    onChange={(e) => setSimulacion(e.target.value)}
                                    bg="brand.700"
                                    color="white"
                                    isDisabled={loading}
                                >
                                    {simulaciones.map((sim) => (
                                        <option key={sim.id} value={sim.id}>
                                            {sim.label}
                                        </option>
                                    ))}
                                </Select>
                            </Box>

                            <Box flex={1}>
                                <Box fontSize="xs" color="gray.400" mb={1}>
                                    Carro (para comparación)
                                </Box>
                                <Select
                                    value={carro}
                                    onChange={(e) => setCarro(e.target.value)}
                                    bg="brand.700"
                                    color="white"
                                    isDisabled={loading}
                                >
                                    {carros.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.label}
                                        </option>
                                    ))}
                                </Select>
                            </Box>
                        </HStack>
                    </VStack>
                </CardBody>
            </Card>

            {/* Tabs con paneles */}
            <Tabs variant="enclosed" colorScheme="brand">
                <TabList bg="brand.700" p={2} borderRadius="md">
                    <Tab color="white" _selected={{ color: 'accent.400', bg: 'brand.600' }}>
                        Ranking
                    </Tab>
                    <Tab color="white" _selected={{ color: 'accent.400', bg: 'brand.600' }}>
                        Setup Comparison
                    </Tab>
                    <Tab color="white" _selected={{ color: 'accent.400', bg: 'brand.600' }}>
                        P,A,M Analysis
                    </Tab>
                    <Tab color="white" _selected={{ color: 'accent.400', bg: 'brand.600' }}>
                        Dashboard
                    </Tab>
                </TabList>

                <TabPanels>
                    {/* Panel 1: Ranking */}
                    <TabPanel>
                        <GrafanaPanel
                            panel={PANELS.ranking}
                            panelKey="ranking"
                            simulacion={simulacion}
                        />
                    </TabPanel>

                    {/* Panel 2: Comparación */}
                    <TabPanel>
                        <GrafanaPanel
                            panel={PANELS.comparacion}
                            panelKey="comparacion"
                            carro={carro}
                        />
                    </TabPanel>

                    {/* Panel 3: P, A, M */}
                    <TabPanel>
                        <GrafanaPanel
                            panel={PANELS.pam}
                            panelKey="pam"
                            simulacion={simulacion}
                        />
                    </TabPanel>

                    {/* Panel 4: Dashboard Completo */}
                    <TabPanel>
                        <Card bg="brand.800" borderColor="brand.700" borderWidth="1px">
                            <CardBody p={4}>
                                <Box
                                    as="iframe"
                                    src={`${GRAFANA_BASE_URL}${PANELS.dashboard.url}`}
                                    w="full"
                                    h="700px"
                                    borderRadius="md"
                                    border="none"
                                    title="Dashboard Completo"
                                    allow="allowfullscreen"
                                />
                            </CardBody>
                        </Card>
                    </TabPanel>
                </TabPanels>
            </Tabs>

            {/* Info adicional */}
            <Card bg="brand.900" borderColor="brand.700" borderWidth="1px">
                <CardBody>
                    <Box fontSize="sm" color="gray.300">
                        <strong>Tip:</strong> Puedes ver los dashboards en pantalla completa haciendo click
                        en "Ver en Grafana". Los datos se actualizan automáticamente cada 30 segundos.
                    </Box>
                </CardBody>
            </Card>
        </VStack>
    );
}

export default GrafanaDashboard;
