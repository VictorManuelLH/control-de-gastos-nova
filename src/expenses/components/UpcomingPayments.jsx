import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Box, Stack, Chip, Avatar, Button, Divider } from '@mui/material';
import { CalendarMonth, ArrowForward, Repeat } from '@mui/icons-material';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { getCategoryById, TRANSACTION_TYPES } from '../../constants';
import { RECURRING_STATUS } from '../../constants/recurring';

/**
 * Componente que muestra los próximos pagos recurrentes
 * @param {Object} props
 * @param {Array} props.recurrings - Lista de gastos recurrentes
 */
export const UpcomingPayments = ({ recurrings }) => {
    const navigate = useNavigate();

    // Filtrar pagos activos y ordenar por fecha próxima
    const upcomingPayments = recurrings
        .filter(recurring => recurring.status === RECURRING_STATUS.ACTIVE)
        .map(recurring => {
            const nextDate = typeof recurring.nextDate === 'string'
                ? parseISO(recurring.nextDate)
                : new Date(recurring.nextDate);
            const today = new Date();
            const daysUntil = differenceInDays(nextDate, today);
            const category = getCategoryById(recurring.category, TRANSACTION_TYPES.EXPENSE);

            return {
                ...recurring,
                nextDate,
                daysUntil,
                category
            };
        })
        .filter(payment => payment.daysUntil >= 0 && payment.daysUntil <= 30) // Próximos 30 días
        .sort((a, b) => a.daysUntil - b.daysUntil)
        .slice(0, 5); // Mostrar solo los 5 más próximos

    if (upcomingPayments.length === 0) {
        return (
            <Card
                sx={{
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    bgcolor: 'white'
                }}
            >
                <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <Repeat color="primary" />
                        <Typography variant="h6" fontWeight={600}>
                            Próximos Pagos
                        </Typography>
                    </Stack>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CalendarMonth sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                            No hay pagos programados en los próximos 30 días
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };

    const getDaysLabel = (days) => {
        if (days === 0) return 'Hoy';
        if (days === 1) return 'Mañana';
        return `En ${days} días`;
    };

    const getDaysColor = (days) => {
        if (days <= 2) return 'error';
        if (days <= 7) return 'warning';
        return 'info';
    };

    return (
        <Card
            sx={{
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                bgcolor: 'white'
            }}
        >
            <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Repeat color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                        Próximos Pagos
                    </Typography>
                    <Chip
                        label={upcomingPayments.length}
                        size="small"
                        color="primary"
                        sx={{ ml: 'auto' }}
                    />
                </Stack>

                <Stack spacing={2}>
                    {upcomingPayments.map((payment, index) => (
                        <Box key={payment.id}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar
                                    sx={{
                                        bgcolor: payment.category?.color || 'primary.main',
                                        width: 48,
                                        height: 48
                                    }}
                                >
                                    {payment.category?.icon || '💰'}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        {payment.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {payment.category?.name} • {format(payment.nextDate, "d 'de' MMMM", { locale: es })}
                                    </Typography>
                                </Box>
                                <Stack alignItems="flex-end" spacing={0.5}>
                                    <Typography variant="subtitle1" fontWeight={700} color="error.main">
                                        {formatCurrency(payment.amount)}
                                    </Typography>
                                    <Chip
                                        label={getDaysLabel(payment.daysUntil)}
                                        size="small"
                                        color={getDaysColor(payment.daysUntil)}
                                        sx={{ fontWeight: 600 }}
                                    />
                                </Stack>
                            </Stack>
                            {index < upcomingPayments.length - 1 && <Divider sx={{ mt: 2 }} />}
                        </Box>
                    ))}
                </Stack>

                <Button
                    fullWidth
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/recurring')}
                    sx={{ mt: 2 }}
                >
                    Ver todos los pagos recurrentes
                </Button>
            </CardContent>
        </Card>
    );
};
