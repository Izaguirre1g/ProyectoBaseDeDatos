import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Flex,
    HStack,
    Button,
    Text,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Avatar,
    Divider,
    Icon,
} from '@chakra-ui/react';
import {
    LayoutDashboard,
    Users,
    Building2,
    Flag,
    Package,
    ShoppingCart,
    Wrench,
    LogOut,
    ChevronDown,
    User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function NavLink({ to, icon, children, isActive }) {
    return (
        <Button
            as={RouterLink}
            to={to}
            variant={isActive ? 'solid' : 'ghost'}
            size="sm"
            leftIcon={<Icon as={icon} boxSize={4} />}
            bg={isActive ? 'accent.600' : 'transparent'}
            _hover={{ bg: isActive ? 'accent.500' : 'brand.700' }}
        >
            {children}
        </Button>
    );
}

function Navbar() {
    const { usuario, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (location.pathname === '/login') {
        return null;
    }

    const isActive = (path) => location.pathname === path;

    return (
        <Box
            as="nav"
            bg="brand.800"
            borderBottom="1px"
            borderColor="brand.600"
            position="sticky"
            top={0}
            zIndex={1000}
            px={6}
            py={3}
        >
            <Flex justify="space-between" align="center" maxW="1400px" mx="auto">
                {/* Logo */}
                <Text
                    as={RouterLink}
                    to="/"
                    fontSize="lg"
                    fontWeight="bold"
                    color="white"
                    _hover={{ textDecoration: 'none', color: 'gray.200' }}
                >
                    F1 Database
                </Text>

                {isAuthenticated() && (
                    <>
                        {/* Navigation Links */}
                        <HStack spacing={1}>
                            <NavLink 
                                to="/" 
                                icon={LayoutDashboard} 
                                isActive={isActive('/')}
                            >
                                Dashboard
                            </NavLink>

                            {usuario?.rol === 'Admin' && (
                                <>
                                    <NavLink 
                                        to="/usuarios" 
                                        icon={Users} 
                                        isActive={isActive('/usuarios')}
                                    >
                                        Usuarios
                                    </NavLink>
                                    <NavLink 
                                        to="/carros" 
                                        icon={Wrench} 
                                        isActive={isActive('/carros') || location.pathname.startsWith('/carros/')}
                                    >
                                        Carros
                                    </NavLink>
                                    <NavLink 
                                        to="/catalogo" 
                                        icon={ShoppingCart} 
                                        isActive={isActive('/catalogo')}
                                    >
                                        Catalogo
                                    </NavLink>
                                </>
                            )}

                            {usuario?.rol === 'Engineer' && (
                                <>
                                    <NavLink 
                                        to="/carros" 
                                        icon={Wrench} 
                                        isActive={isActive('/carros') || location.pathname.startsWith('/carros/')}
                                    >
                                        Armado
                                    </NavLink>
                                    <NavLink 
                                        to="/catalogo" 
                                        icon={ShoppingCart} 
                                        isActive={isActive('/catalogo')}
                                    >
                                        Catalogo
                                    </NavLink>
                                </>
                            )}

                            <NavLink 
                                to="/catalogo" 
                                icon={ShoppingCart} 
                                isActive={isActive('/catalogo')}
                            >
                                Catalogo
                            </NavLink>
                        </HStack>

                        {/* User Menu */}
                        <Menu>
                            <MenuButton
                                as={Button}
                                variant="ghost"
                                rightIcon={<ChevronDown size={16} />}
                                _hover={{ bg: 'brand.700' }}
                            >
                                <HStack spacing={3}>
                                    <Avatar size="sm" name={usuario?.nombre} bg="accent.600" />
                                    <Box textAlign="left" display={{ base: 'none', md: 'block' }}>
                                        <Text fontSize="sm" fontWeight="500">
                                            {usuario?.nombre}
                                        </Text>
                                        <Text fontSize="xs" color="gray.400">
                                            {usuario?.rol}
                                        </Text>
                                    </Box>
                                </HStack>
                            </MenuButton>
                            <MenuList bg="brand.800" borderColor="brand.600">
                                <MenuItem 
                                    icon={<User size={16} />}
                                    bg="brand.800"
                                    _hover={{ bg: 'brand.700' }}
                                >
                                    Mi Perfil
                                </MenuItem>
                                <Divider borderColor="brand.600" />
                                <MenuItem
                                    icon={<LogOut size={16} />}
                                    onClick={handleLogout}
                                    bg="brand.800"
                                    _hover={{ bg: 'brand.700' }}
                                    color="red.400"
                                >
                                    Cerrar Sesion
                                </MenuItem>
                            </MenuList>
                        </Menu>
                    </>
                )}
            </Flex>
        </Box>
    );
}

export default Navbar;
