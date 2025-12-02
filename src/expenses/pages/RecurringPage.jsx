import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    IconButton,
    Chip,
    Stack,
    Fab,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Alert,
    AlertTitle,
    Tooltip,
    Divider
} from '@mui/material';
import {
    Add,
    Repeat,
    MoreVert,
    Edit,
    Delete,
    Pause,
    PlayArrow,
    Block,
    AttachMoney,
    Event,
    TrendingUp
} from '@mui/icons-material';
import { Navbar } from '../../journal/components';
import { RecurringModal } from '../components/RecurringModal';
import {
    startDeletingRecurring,
    startPausingRecurring,
    startResumingRecurring,
    checkPendingRecurrings
} from '../../store/recurring/thunks';
import { setActiveRecurring } from '../../store/recurring/recurringSlice';
import { EXPENSE_CATEGORIES, RECURRING_STATUS, FREQUENCY_METADATA } from '../../constants';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

export const RecurringPage = () => {
    const dispatch = useDispatch();
    const { recurrings, upcomingRecurrings } = useSelector(state => state.recurring);

    const [modalOpen, setModalOpen] = useState(false);
    const [recurringToEdit, setRecurringToEdit] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRecurring, setSelectedRecurring] = useState(null);

    // Verificar gastos pendientes al cargar
    useEffect(() => {
        dispatch(checkPendingRecurrings());
    }, [dispatch]);

    const activeRecurrings = useMemo(() => {
        return recurrings.filter(r => r.status === RECURRING_STATUS.ACTIVE);
    }, [recurrings]);

    const pausedRecurrings = useMemo(() => {
        return recurrings.filter(r => r.status === RECURRING_STATUS.PAUSED);
    }, [recurrings]);

    const totalMonthly = useMemo(() => {
        return activeRecurrings.reduce((sum, r) => {
            const freq = FREQUENCY_METADATA[r.frequency];
            const monthlyAmount = (r.amount * 30) / (freq?.days || 30);
            return sum + monthlyAmount;
        }, 0);
    }, [activeRecurrings]);

    const handleOpenMenu = (event, recurring) => {
        setAnchorEl(event.currentTarget);
        setSelectedRecurring(recurring);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setSelectedRecurring(null);
    };

    const handleEdit = () => {
        setRecurringToEdit(selectedRecurring);
        setModalOpen(true);
        handleCloseMenu();
    };

    const handleDelete = () => {
        dispatch(startDeletingRecurring(selectedRecurring.id));
        handleCloseMenu();
    };

    const handlePause = () => {
        dispatch(startPausingRecurring(selectedRecurring.id));
        handleCloseMenu();
    };

    const handleResume = () => {
        dispatch(startResumingRecurring(selectedRecurring.id));
        handleCloseMenu();
    };

    const handleOpenModal = () => {
        setRecurringToEdit(null);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setRecurringToEdit(null);
    };

    const getCategory = (categoryId) => {
        return EXPENSE_CATEGORIES.find(c => c.id === categoryId);
    };

    const getDaysUntilNext = (nextDate) => {
        const days = differenceInDays(new Date(nextDate), new Date());
        if (days < 0) return 'Vencido';
        if (days === 0) return 'Hoy';
        if (days === 1) return 'Mañana';
        return `En ${days} días`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case RECURRING_STATUS.ACTIVE:
                return 'success';
            case RECURRING_STATUS.PAUSED:
                return 'warning';
            case RECURRING_STATUS.CANCELLED:
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case RECURRING_STATUS.ACTIVE:
                return 'Activo';
            case RECURRING_STATUS.PAUSED:
                return 'Pausado';
            case RECURRING_STATUS.CANCELLED:
                return 'Cancelado';
            default:
                return status;
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Navbar drawerWidth={240} />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - 240px)` },
                    ml: { sm: `240px` },
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    minHeight: '100vh'
                }}
            >
                <Container maxWidth="lg" sx={{ pt: 4, pb: 10 }}>
                    {/* Header */}
                    <Paper
                        sx={{
                            p: 4,
                            mb: 3,
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                        }}
                    >
                        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                            <Box>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Repeat sx={{ fontSize: 48, color: 'primary.main' }} />
                                    <Box>
                                        <Typography variant="h4" fontWeight={700}>
                                            Gastos Recurrentes
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Administra tus suscripciones y gastos periódicos
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>

                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleOpenModal}
                                sx={{
                                    bgcolor: 'primary.main',
                                    '&:hover': { bgcolor: 'primary.dark' }
                                }}
                            >
                                Nuevo Gasto Recurrente
                            </Button>
                        </Stack>

                        {/* Estadísticas */}
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid item xs={12} sm={4}>
                                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                                    <Typography variant="h4" color="primary" fontWeight={700}>
                                        {activeRecurrings.length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Gastos Activos
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
                                    <Typography variant="h4" color="warning.main" fontWeight={700}>
                                        {pausedRecurrings.length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Pausados
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                                    <Typography variant="h4" color="success.main" fontWeight={700}>
                                        ${totalMonthly.toFixed(2)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Mensual
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Próximos gastos */}
                    {upcomingRecurrings.length > 0 && (
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            <AlertTitle>⏰ Próximos Cargos</AlertTitle>
                            {upcomingRecurrings.map(r => (
                                <Typography key={r.id} variant="body2">
                                    • {r.name}: ${r.amount.toFixed(2)} - {getDaysUntilNext(r.nextDate)}
                                </Typography>
                            ))}
                        </Alert>
                    )}

                    {/* Lista de gastos recurrentes */}
                    {recurrings.length === 0 ? (
                        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                            <Repeat sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No hay gastos recurrentes
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Crea tu primer gasto recurrente para automatizar tus registros
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleOpenModal}
                            >
                                Crear Primer Gasto
                            </Button>
                        </Paper>
                    ) : (
                        <Grid container spacing={3}>
                            {recurrings.map(recurring => {
                                const category = getCategory(recurring.category);
                                const frequency = FREQUENCY_METADATA[recurring.frequency];
                                const monthlyAmount = (recurring.amount * 30) / (frequency?.days || 30);

                                return (
                                    <Grid item xs={12} sm={6} md={4} key={recurring.id}>
                                        <Card
                                            sx={{
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                borderRadius: 2,
                                                transition: 'all 0.3s',
                                                opacity: recurring.status === RECURRING_STATUS.PAUSED ? 0.7 : 1,
                                                '&:hover': {
                                                    boxShadow: 6,
                                                    transform: 'translateY(-4px)'
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ flex: 1 }}>
                                                {/* Header */}
                                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Typography sx={{ fontSize: 28 }}>
                                                            {category?.icon}
                                                        </Typography>
                                                        <Box>
                                                            <Typography variant="h6" fontWeight={600}>
                                                                {recurring.name}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {category?.name}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>

                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleOpenMenu(e, recurring)}
                                                    >
                                                        <MoreVert />
                                                    </IconButton>
                                                </Stack>

                                                <Divider sx={{ my: 2 }} />

                                                {/* Monto */}
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="h4" color="primary" fontWeight={700}>
                                                        ${recurring.amount.toFixed(2)}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {frequency?.icon} {frequency?.name}
                                                    </Typography>
                                                </Box>

                                                {/* Info adicional */}
                                                <Stack spacing={1}>
                                                    <Chip
                                                        icon={<Event />}
                                                        label={`Próximo: ${getDaysUntilNext(recurring.nextDate)}`}
                                                        size="small"
                                                        sx={{ justifyContent: 'flex-start' }}
                                                    />
                                                    <Chip
                                                        icon={<AttachMoney />}
                                                        label={`~$${monthlyAmount.toFixed(2)}/mes`}
                                                        size="small"
                                                        color="secondary"
                                                        sx={{ justifyContent: 'flex-start' }}
                                                    />
                                                    <Chip
                                                        label={getStatusLabel(recurring.status)}
                                                        size="small"
                                                        color={getStatusColor(recurring.status)}
                                                        sx={{ justifyContent: 'flex-start' }}
                                                    />
                                                </Stack>

                                                {recurring.description && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                                                        "{recurring.description}"
                                                    </Typography>
                                                )}
                                            </CardContent>

                                            <CardActions sx={{ p: 2, pt: 0 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Desde {format(new Date(recurring.createdAt), 'd MMM yyyy', { locale: es })}
                                                </Typography>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}

                    {/* FAB para móviles */}
                    <Fab
                        color="primary"
                        sx={{
                            position: 'fixed',
                            bottom: 24,
                            right: 24,
                            display: { xs: 'flex', sm: 'none' }
                        }}
                        onClick={handleOpenModal}
                    >
                        <Add />
                    </Fab>

                    {/* Menú contextual */}
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleCloseMenu}
                    >
                        <MenuItem onClick={handleEdit}>
                            <ListItemIcon>
                                <Edit fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Editar</ListItemText>
                        </MenuItem>

                        {selectedRecurring?.status === RECURRING_STATUS.ACTIVE && (
                            <MenuItem onClick={handlePause}>
                                <ListItemIcon>
                                    <Pause fontSize="small" color="warning" />
                                </ListItemIcon>
                                <ListItemText>Pausar</ListItemText>
                            </MenuItem>
                        )}

                        {selectedRecurring?.status === RECURRING_STATUS.PAUSED && (
                            <MenuItem onClick={handleResume}>
                                <ListItemIcon>
                                    <PlayArrow fontSize="small" color="success" />
                                </ListItemIcon>
                                <ListItemText>Reanudar</ListItemText>
                            </MenuItem>
                        )}

                        <Divider />

                        <MenuItem onClick={handleDelete}>
                            <ListItemIcon>
                                <Delete fontSize="small" color="error" />
                            </ListItemIcon>
                            <ListItemText>Eliminar</ListItemText>
                        </MenuItem>
                    </Menu>

                    {/* Modal */}
                    <RecurringModal
                        open={modalOpen}
                        onClose={handleCloseModal}
                        recurringToEdit={recurringToEdit}
                    />
                </Container>
            </Box>
        </Box>
    );
};
