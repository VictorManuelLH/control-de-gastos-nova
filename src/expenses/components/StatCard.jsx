import { Card, CardContent, Stack, Avatar, Box, Typography } from '@mui/material';

/**
 * Componente de tarjeta de estadística reutilizable
 * @param {Object} props
 * @param {string} props.title - Título de la estadística
 * @param {string} props.value - Valor a mostrar
 * @param {JSX.Element} props.icon - Ícono a mostrar
 * @param {string} props.gradient - Gradiente de fondo
 * @param {string} props.subtitle - Subtítulo opcional
 */
export const StatCard = ({ title, value, icon, gradient, subtitle }) => {
    return (
        <Card
            sx={{
                background: gradient,
                color: 'white',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
                }
            }}
        >
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                        sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            width: 56,
                            height: 56
                        }}
                    >
                        {icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            {title}
                        </Typography>
                        <Typography variant="h5" fontWeight={700}>
                            {value}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};
