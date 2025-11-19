import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Container,
    Grid,
    Typography,
    Fab,
    Card,
    CardContent,
    Stack,
    Button,
    Toolbar,
    Alert,
    AlertTitle,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    Add,
    TrendingUp,
    AccountBalanceWallet,
    Warning,
    PictureAsPdf,
    Assessment,
    CalendarMonth
} from '@mui/icons-material';
import { BudgetCard, BudgetModal } from '../components';
import { Navbar } from '../../journal/components';
import { setActiveBudget } from '../../store/budgets/budgetsSlice';
import { startDeletingBudget } from '../../store/budgets/thunks';
import { BUDGET_STATUS, getBudgetStatus } from '../../constants';
import { pdfService } from '../../services';
import { captureMultipleCharts, waitForChartsToRender } from '../../utils';

/**
 * Página principal de gestión de presupuestos
 */
export const BudgetsPage = () => {
    const dispatch = useDispatch();
    const { budgets } = useSelector(state => state.budgets);
    const { transactions } = useSelector(state => state.expenses);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);
    const [pdfMenuAnchor, setPdfMenuAnchor] = useState(null);

    // Calcular estadísticas de presupuestos
    const stats = {
        total: budgets.length,
        active: budgets.filter(b => b.enabled).length,
        exceeded: 0,
        atRisk: 0
    };

    // Calcular presupuestos excedidos y en riesgo
    budgets.forEach(budget => {
        if (!budget.enabled) return;

        const spent = transactions
            .filter(t => {
                if (t.type !== 'expense') return false;
                if (t.category !== budget.categoryId) return false;

                const transactionDate = new Date(t.date);
                if (transactionDate.getFullYear() !== budget.year) return false;

                if (budget.period === 'monthly' && transactionDate.getMonth() !== budget.month) {
                    return false;
                }

                return true;
            })
            .reduce((sum, t) => sum + t.amount, 0);

        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
        const status = getBudgetStatus(percentage);

        if (status === BUDGET_STATUS.EXCEEDED) {
            stats.exceeded++;
        } else if (status === BUDGET_STATUS.DANGER || status === BUDGET_STATUS.WARNING) {
            stats.atRisk++;
        }
    });

    // Abrir modal para crear
    const handleOpenCreate = () => {
        setEditingBudget(null);
        setModalOpen(true);
    };

    // Abrir modal para editar
    const handleOpenEdit = (budget) => {
        setEditingBudget(budget);
        dispatch(setActiveBudget(budget));
        setModalOpen(true);
    };

    // Eliminar presupuesto
    const handleDelete = (budget) => {
        dispatch(setActiveBudget(budget));
        dispatch(startDeletingBudget());
    };

    // Cerrar modal
    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingBudget(null);
    };

    // Funciones para generar PDFs
    const handleOpenPdfMenu = (event) => {
        setPdfMenuAnchor(event.currentTarget);
    };

    const handleClosePdfMenu = () => {
        setPdfMenuAnchor(null);
    };

    const handleDownloadBudgetsReport = () => {
        pdfService.generateBudgetsReport(budgets, transactions);
        handleClosePdfMenu();
    };

    const handleDownloadMonthlyReport = async () => {
        try {
            const currentDate = new Date();

            // Esperar a que las gráficas se rendericen (si están en la página de gastos)
            await waitForChartsToRender();

            // Intentar capturar gráficas si están disponibles
            const chartIds = ['monthly-trend-chart', 'expenses-by-category-chart', 'income-vs-expenses-chart'];
            const chartImages = await captureMultipleCharts(chartIds);

            pdfService.generateMonthlyReport(
                transactions,
                budgets,
                currentDate.getMonth(),
                currentDate.getFullYear(),
                chartImages
            );
            handleClosePdfMenu();
        } catch (error) {
            console.error('Error al generar reporte mensual:', error);
            const currentDate = new Date();
            pdfService.generateMonthlyReport(
                transactions,
                budgets,
                currentDate.getMonth(),
                currentDate.getFullYear()
            );
            handleClosePdfMenu();
        }
    };

    return (
        <Box sx={{ display: 'flex' }} className="animate__animated animate__fadeIn animate__faster">
            {/* Navbar */}
            <Navbar drawerWidth={0} />

            {/* Contenido principal */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
            >
                <Toolbar />

                <Container maxWidth="lg" sx={{ pt: 4, pb: 10 }}>
                    {/* Header */}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={2}
                        sx={{ mb: 4 }}
                    >
                        <Box>
                            <Typography
                                variant="h4"
                                fontWeight={700}
                                sx={{ color: 'white', mb: 0.5 }}
                            >
                                💰 Mis Presupuestos
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                Administra tus límites de gasto por categoría
                            </Typography>
                        </Box>

                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="contained"
                                startIcon={<PictureAsPdf />}
                                onClick={handleOpenPdfMenu}
                                sx={{
                                    bgcolor: 'white',
                                    color: 'primary.main',
                                    borderRadius: 2,
                                    px: 3,
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                                        transform: 'scale(1.05)'
                                    },
                                    transition: 'all 0.3s ease',
                                    display: { xs: 'none', sm: 'flex' }
                                }}
                            >
                                Descargar PDF
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleOpenCreate}
                                sx={{
                                    bgcolor: 'white',
                                    color: 'primary.main',
                                    borderRadius: 2,
                                    px: 3,
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                                        transform: 'scale(1.05)'
                                    },
                                    transition: 'all 0.3s ease',
                                    display: { xs: 'none', sm: 'flex' }
                                }}
                            >
                                Nuevo Presupuesto
                            </Button>
                        </Stack>
                    </Stack>

                    {/* Menú de PDFs */}
                    <Menu
                        anchorEl={pdfMenuAnchor}
                        open={Boolean(pdfMenuAnchor)}
                        onClose={handleClosePdfMenu}
                        PaperProps={{
                            sx: {
                                borderRadius: 2,
                                mt: 1,
                                minWidth: 250
                            }
                        }}
                    >
                        <MenuItem onClick={handleDownloadBudgetsReport}>
                            <ListItemIcon>
                                <Assessment fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Reporte de Presupuestos"
                                secondary="Estado actual de presupuestos"
                            />
                        </MenuItem>
                        <MenuItem onClick={handleDownloadMonthlyReport}>
                            <ListItemIcon>
                                <CalendarMonth fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Reporte Mensual Completo"
                                secondary="Reporte completo del mes actual"
                            />
                        </MenuItem>
                    </Menu>

                    {/* Estadísticas */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {/* Total Presupuestos */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.95)' }}>
                                <CardContent>
                                    <Stack spacing={1}>
                                        <AccountBalanceWallet sx={{ color: 'primary.main', fontSize: 32 }} />
                                        <Typography variant="h4" fontWeight={700}>
                                            {stats.total}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Presupuestos
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Activos */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.95)' }}>
                                <CardContent>
                                    <Stack spacing={1}>
                                        <TrendingUp sx={{ color: 'success.main', fontSize: 32 }} />
                                        <Typography variant="h4" fontWeight={700} color="success.main">
                                            {stats.active}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Activos
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* En Riesgo */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.95)' }}>
                                <CardContent>
                                    <Stack spacing={1}>
                                        <Warning sx={{ color: 'warning.main', fontSize: 32 }} />
                                        <Typography variant="h4" fontWeight={700} color="warning.main">
                                            {stats.atRisk}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            En Riesgo
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Excedidos */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.95)' }}>
                                <CardContent>
                                    <Stack spacing={1}>
                                        <Warning sx={{ color: 'error.main', fontSize: 32 }} />
                                        <Typography variant="h4" fontWeight={700} color="error.main">
                                            {stats.exceeded}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Excedidos
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Alertas */}
                    {stats.exceeded > 0 && (
                        <Alert
                            severity="error"
                            sx={{ mb: 3, borderRadius: 2 }}
                            icon={<Warning />}
                        >
                            <AlertTitle>¡Presupuestos Excedidos!</AlertTitle>
                            Tienes {stats.exceeded} {stats.exceeded === 1 ? 'presupuesto' : 'presupuestos'} que han superado el límite establecido.
                        </Alert>
                    )}

                    {stats.atRisk > 0 && (
                        <Alert
                            severity="warning"
                            sx={{ mb: 3, borderRadius: 2 }}
                            icon={<Warning />}
                        >
                            <AlertTitle>Presupuestos en Riesgo</AlertTitle>
                            Tienes {stats.atRisk} {stats.atRisk === 1 ? 'presupuesto' : 'presupuestos'} cerca del límite.
                        </Alert>
                    )}

                    {/* Lista de Presupuestos */}
                    {budgets.length === 0 ? (
                        <Card
                            sx={{
                                borderRadius: 3,
                                bgcolor: 'rgba(255, 255, 255, 0.95)',
                                p: 6,
                                textAlign: 'center'
                            }}
                        >
                            <AccountBalanceWallet
                                sx={{ fontSize: 100, color: 'grey.300', mb: 2 }}
                            />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No tienes presupuestos configurados
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Crea tu primer presupuesto para controlar tus gastos
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleOpenCreate}
                                sx={{
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                }}
                            >
                                Crear Presupuesto
                            </Button>
                        </Card>
                    ) : (
                        <Grid container spacing={3}>
                            {budgets.map((budget) => (
                                <Grid item xs={12} sm={6} md={4} key={budget.id}>
                                    <BudgetCard
                                        budget={budget}
                                        onEdit={handleOpenEdit}
                                        onDelete={handleDelete}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Container>

                {/* Botón Flotante (solo móvil) */}
                <Fab
                    color="primary"
                    aria-label="add"
                    onClick={handleOpenCreate}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        display: { xs: 'flex', sm: 'none' },
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)'
                        },
                        transition: 'all 0.3s ease'
                    }}
                >
                    <Add />
                </Fab>

                {/* Modal */}
                <BudgetModal
                    open={modalOpen}
                    onClose={handleCloseModal}
                    budget={editingBudget}
                />
            </Box>
        </Box>
    );
};
