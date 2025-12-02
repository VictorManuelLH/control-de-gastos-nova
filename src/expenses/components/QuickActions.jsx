import { useNavigate } from 'react-router-dom';
import { Grid, Card, CardContent, Stack, Avatar, Typography, Box } from '@mui/material';
import {
    Assessment,
    Repeat,
    AccountBalanceWallet,
    Notifications,
    Telegram,
    BarChart
} from '@mui/icons-material';

/**
 * Componente de accesos rápidos a las diferentes secciones
 */
export const QuickActions = () => {
    const navigate = useNavigate();

    const quickActions = [
        {
            title: 'Transacciones',
            description: 'Ver y gestionar gastos e ingresos',
            icon: <AccountBalanceWallet sx={{ fontSize: 32 }} />,
            color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            path: '/expenses'
        },
        {
            title: 'Presupuestos',
            description: 'Controlar límites de gasto',
            icon: <Assessment sx={{ fontSize: 32 }} />,
            color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            path: '/budgets'
        },
        {
            title: 'Recurrentes',
            description: 'Gestionar suscripciones',
            icon: <Repeat sx={{ fontSize: 32 }} />,
            color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            path: '/recurring'
        },
        {
            title: 'Telegram',
            description: 'Configurar notificaciones',
            icon: <Telegram sx={{ fontSize: 32 }} />,
            color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            path: '/telegram'
        }
    ];

    return (
        <Box>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'white' }}>
                Accesos Rápidos
            </Typography>
            <Grid container spacing={2}>
                {quickActions.map((action) => (
                    <Grid item xs={6} sm={6} md={3} key={action.title}>
                        <Card
                            onClick={() => navigate(action.path)}
                            sx={{
                                borderRadius: 3,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                height: '100%',
                                background: 'rgba(255, 255, 255, 0.95)',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)'
                                }
                            }}
                        >
                            <CardContent>
                                <Stack spacing={2} alignItems="center" textAlign="center">
                                    <Avatar
                                        sx={{
                                            width: 64,
                                            height: 64,
                                            background: action.color
                                        }}
                                    >
                                        {action.icon}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={700}>
                                            {action.title}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {action.description}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};
