import { Box, Card, CardContent, Typography, Grid, IconButton, Tooltip, Paper, Stack } from '@mui/material';
import { Check } from '@mui/icons-material';
import { useThemeContext } from '../context';
import { themeMetadata } from '../theme/themes';

export const ThemeSelector = () => {
    const { currentTheme, setTheme } = useThemeContext();

    const handleThemeClick = (themeName) => {
        setTheme(themeName);
    };

    return (
        <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Selecciona tu tema favorito
            </Typography>

            <Grid container spacing={2}>
                {Object.entries(themeMetadata).map(([themeKey, theme]) => {
                    const isActive = currentTheme === themeKey;

                    return (
                        <Grid item xs={12} sm={6} md={4} key={themeKey}>
                            <Tooltip title={theme.description} arrow>
                                <Card
                                    onClick={() => handleThemeClick(themeKey)}
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        border: isActive ? 3 : 1,
                                        borderColor: isActive ? 'primary.main' : 'divider',
                                        transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                        boxShadow: isActive ? 4 : 1,
                                        '&:hover': {
                                            transform: 'scale(1.08)',
                                            boxShadow: 6,
                                            borderColor: 'primary.light'
                                        },
                                        position: 'relative',
                                        overflow: 'visible'
                                    }}
                                >
                                    {/* Indicador de tema activo */}
                                    {isActive && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: -8,
                                                right: -8,
                                                bgcolor: 'primary.main',
                                                borderRadius: '50%',
                                                width: 32,
                                                height: 32,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: 3,
                                                zIndex: 1
                                            }}
                                        >
                                            <Check sx={{ color: 'white', fontSize: 20 }} />
                                        </Box>
                                    )}

                                    <CardContent sx={{ p: 2 }}>
                                        <Stack spacing={2}>
                                            {/* Preview del gradiente del tema */}
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    height: 60,
                                                    background: theme.gradient,
                                                    borderRadius: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 32
                                                }}
                                            >
                                                {theme.icon}
                                            </Paper>

                                            {/* Información del tema */}
                                            <Box>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 600,
                                                        fontSize: '1rem',
                                                        mb: 0.5
                                                    }}
                                                >
                                                    {theme.name}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ fontSize: '0.75rem' }}
                                                >
                                                    {theme.description}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Tooltip>
                        </Grid>
                    );
                })}
            </Grid>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" align="center">
                    💡 Tip: También puedes cambiar el tema haciendo click en tu saludo en la barra superior
                </Typography>
            </Box>
        </Box>
    );
};
