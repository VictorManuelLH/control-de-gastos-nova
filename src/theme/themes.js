import { createTheme } from "@mui/material";
import { red, blue, green, orange, purple, grey } from "@mui/material/colors";

/**
 * Tema claro (Light) - Diseño limpio y minimalista
 */
export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
            contrastText: '#fff',
        },
        secondary: {
            main: '#9c27b0',
            light: '#ba68c8',
            dark: '#7b1fa2',
            contrastText: '#fff',
        },
        error: {
            main: red.A400
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
        text: {
            primary: '#212121',
            secondary: '#757575',
        },
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                },
            },
        },
    },
});

/**
 * Tema oscuro (Dark) - Para uso nocturno
 */
export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#90caf9',
            light: '#e3f2fd',
            dark: '#42a5f5',
            contrastText: '#000',
        },
        secondary: {
            main: '#ce93d8',
            light: '#f3e5f5',
            dark: '#ab47bc',
            contrastText: '#000',
        },
        error: {
            main: '#f44336'
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        },
        text: {
            primary: '#ffffff',
            secondary: '#b0b0b0',
        },
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: 'linear-gradient(135deg, #1e1e1e 0%, #121212 100%)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
    },
});

/**
 * Tema morado (Purple) - El tema original de la app
 */
export const purpleTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#667eea',
            light: '#818cf8',
            dark: '#5b21b6',
            contrastText: '#fff',
        },
        secondary: {
            main: '#764ba2',
            light: '#9333ea',
            dark: '#581c87',
            contrastText: '#fff',
        },
        error: {
            main: red.A400
        },
        background: {
            default: '#f8f7ff',
            paper: '#ffffff',
        },
        text: {
            primary: '#1e1b4b',
            secondary: '#64748b',
        },
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                },
            },
        },
    },
});

/**
 * Tema océano (Ocean) - Colores azules y turquesa
 */
export const oceanTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#0891b2',
            light: '#06b6d4',
            dark: '#164e63',
            contrastText: '#fff',
        },
        secondary: {
            main: '#0ea5e9',
            light: '#38bdf8',
            dark: '#0369a1',
            contrastText: '#fff',
        },
        error: {
            main: red.A400
        },
        background: {
            default: '#ecfeff',
            paper: '#ffffff',
        },
        text: {
            primary: '#0c4a6e',
            secondary: '#475569',
        },
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: 'linear-gradient(135deg, #0891b2 0%, #0ea5e9 100%)',
                },
            },
        },
    },
});

/**
 * Tema bosque (Forest) - Colores verdes naturales
 */
export const forestTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#059669',
            light: '#10b981',
            dark: '#064e3b',
            contrastText: '#fff',
        },
        secondary: {
            main: '#84cc16',
            light: '#a3e635',
            dark: '#4d7c0f',
            contrastText: '#fff',
        },
        error: {
            main: red.A400
        },
        background: {
            default: '#f0fdf4',
            paper: '#ffffff',
        },
        text: {
            primary: '#14532d',
            secondary: '#475569',
        },
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                },
            },
        },
    },
});

/**
 * Tema atardecer (Sunset) - Colores cálidos naranjas y rojos
 */
export const sunsetTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#f97316',
            light: '#fb923c',
            dark: '#9a3412',
            contrastText: '#fff',
        },
        secondary: {
            main: '#ef4444',
            light: '#f87171',
            dark: '#991b1b',
            contrastText: '#fff',
        },
        error: {
            main: red.A700
        },
        background: {
            default: '#fff7ed',
            paper: '#ffffff',
        },
        text: {
            primary: '#7c2d12',
            secondary: '#78716c',
        },
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
                },
            },
        },
    },
});

/**
 * Mapa de temas disponibles
 */
export const themes = {
    light: lightTheme,
    dark: darkTheme,
    purple: purpleTheme,
    ocean: oceanTheme,
    forest: forestTheme,
    sunset: sunsetTheme,
};

/**
 * Metadatos de los temas para mostrar en la UI
 */
export const themeMetadata = {
    light: {
        name: 'Claro',
        icon: '☀️',
        description: 'Tema claro y minimalista',
        gradient: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
    },
    dark: {
        name: 'Oscuro',
        icon: '🌙',
        description: 'Tema oscuro para la noche',
        gradient: 'linear-gradient(135deg, #1e1e1e 0%, #121212 100%)',
    },
};
