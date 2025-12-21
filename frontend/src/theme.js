import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
    config: {
        initialColorMode: 'dark',
        useSystemColorMode: false,
    },
    colors: {
        brand: {
            50: '#f5f5f5',
            100: '#e0e0e0',
            200: '#bdbdbd',
            300: '#9e9e9e',
            400: '#757575',
            500: '#616161',
            600: '#424242',
            700: '#303030',
            800: '#212121',
            900: '#121212',
        },
        accent: {
            50: '#ffe5e5',
            100: '#ffb3b3',
            200: '#ff8080',
            300: '#ff4d4d',
            400: '#ff1a1a',
            500: '#e60000',
            600: '#e10600',
            700: '#800000',
            800: '#4d0000',
            900: '#1a0000',
        },
    },
    styles: {
        global: {
            body: {
                bg: 'brand.900',
                color: 'gray.100',
            },
        },
    },
    components: {
        Button: {
            baseStyle: {
                fontWeight: '500',
                borderRadius: 'md',
            },
            variants: {
                solid: {
                    bg: 'accent.600',
                    color: 'white',
                    _hover: {
                        bg: 'accent.500',
                    },
                },
                outline: {
                    borderColor: 'brand.600',
                    color: 'gray.300',
                    _hover: {
                        bg: 'brand.700',
                    },
                },
                ghost: {
                    color: 'gray.300',
                    _hover: {
                        bg: 'brand.700',
                    },
                },
            },
        },
        Input: {
            variants: {
                filled: {
                    field: {
                        bg: 'brand.800',
                        borderColor: 'brand.600',
                        _hover: {
                            bg: 'brand.700',
                        },
                        _focus: {
                            bg: 'brand.800',
                            borderColor: 'accent.500',
                        },
                    },
                },
            },
            defaultProps: {
                variant: 'filled',
            },
        },
        Select: {
            variants: {
                filled: {
                    field: {
                        bg: 'brand.800',
                        borderColor: 'brand.600',
                        _hover: {
                            bg: 'brand.700',
                        },
                    },
                },
            },
            defaultProps: {
                variant: 'filled',
            },
        },
        Card: {
            baseStyle: {
                container: {
                    bg: 'brand.800',
                    borderColor: 'brand.600',
                    borderWidth: '1px',
                    borderRadius: 'lg',
                },
            },
        },
        Modal: {
            baseStyle: {
                dialog: {
                    bg: 'brand.800',
                },
            },
        },
    },
});

export default theme;
