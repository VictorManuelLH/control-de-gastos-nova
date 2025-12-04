import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Fab,
    Paper,
    Avatar,
    Stack,
    Chip,
    IconButton,
    Divider,
    Toolbar,
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    SpeedDial,
    SpeedDialAction
} from '@mui/material';
import {
    Add,
    TrendingUp,
    TrendingDown,
    AccountBalanceWallet,
    Edit,
    Delete,
    Assessment,
    PictureAsPdf,
    Description,
    BarChart,
    CalendarMonth,
    Download
} from '@mui/icons-material';
import {
    TransactionModal,
    ExpensesByCategoryChart,
    MonthlyTrendChart,
    IncomeVsExpensesChart
} from '../components';
import { startLoadingTransactions } from '../../store/auth/thunks';
import { startDeletingTransaction } from '../../store/expenses/thunks';
import { setActiveTransaction } from '../../store/expenses/expensesSlice';
import { getCategoryById, TRANSACTION_TYPES } from '../../constants';
import { Navbar } from '../../journal/components';
import { pdfService } from '../../services';
import { captureMultipleCharts, waitForChartsToRender } from '../../utils';

export const ExpensesPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { transactions } = useSelector(state => state.expenses);
    const { budgets } = useSelector(state => state.budgets);
    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [pdfMenuAnchor, setPdfMenuAnchor] = useState(null);

    // Cargar transacciones al montar el componente
    useEffect(() => {
        dispatch(startLoadingTransactions());
    }, [dispatch]);

    // Calcular estadísticas
    const statistics = useMemo(() => {
        const totalExpenses = transactions
            .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
            .reduce((sum, t) => sum + t.amount, 0);

        const totalIncome = transactions
            .filter(t => t.type === TRANSACTION_TYPES.INCOME)
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = totalIncome - totalExpenses;

        return { totalExpenses, totalIncome, balance };
    }, [transactions]);

    // Ordenar transacciones por fecha (más recientes primero)
    const sortedTransactions = useMemo(() => {
        return [...transactions].sort((a, b) => b.date - a.date);
    }, [transactions]);

    const handleOpenModal = (transaction = null) => {
        if (transaction) {
            setEditMode(true);
            dispatch(setActiveTransaction(transaction));
        } else {
            setEditMode(false);
            dispatch(setActiveTransaction(null));
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditMode(false);
    };

    const handleDeleteTransaction = (transaction) => {
        if (window.confirm('¿Estás seguro de eliminar esta transacción?')) {
            dispatch(setActiveTransaction(transaction));
            dispatch(startDeletingTransaction());
        }
    };

    // Funciones para generar PDFs
    const handleOpenPdfMenu = (event) => {
        setPdfMenuAnchor(event.currentTarget);
    };

    const handleClosePdfMenu = () => {
        setPdfMenuAnchor(null);
    };

    const handleDownloadTransactionsReport = () => {
        pdfService.generateTransactionsReport(transactions);
        handleClosePdfMenu();
    };

    const handleDownloadStatisticsReport = async () => {
        try {
            // Esperar a que las gráficas se rendericen
            await waitForChartsToRender();

            // Capturar gráficas
            const chartIds = ['expenses-by-category-chart', 'income-vs-expenses-chart'];
            const chartImages = await captureMultipleCharts(chartIds);

            pdfService.generateStatisticsReport(transactions, chartImages);
            handleClosePdfMenu();
        } catch (error) {
            console.error('Error al generar reporte:', error);
            pdfService.generateStatisticsReport(transactions);
            handleClosePdfMenu();
        }
    };

    const handleDownloadMonthlyReport = async () => {
        try {
            const currentDate = new Date();

            // Esperar a que las gráficas se rendericen
            await waitForChartsToRender();

            // Capturar gráficas
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
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
                    width: '100%',
                    maxWidth: '100vw',
                    overflowX: 'hidden'
                }}
            >
                <Toolbar sx={{ minHeight: { xs: '56px', sm: '64px' } }} />

                <Container maxWidth="lg" sx={{ pt: { xs: 2, sm: 4 }, pb: { xs: 12, sm: 10 }, px: { xs: 2, sm: 3 } }}>
                {/* Botón de Descarga PDF */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<PictureAsPdf sx={{ display: { xs: 'none', sm: 'block' } }} />}
                        onClick={handleOpenPdfMenu}
                        size={{ xs: 'small', sm: 'medium' }}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            borderRadius: 2,
                            px: { xs: 2, sm: 3 },
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            '&:hover': {
                                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {window.innerWidth < 600 ? 'PDF' : 'Descargar PDF'}
                    </Button>
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
                        <MenuItem onClick={handleDownloadTransactionsReport}>
                            <ListItemIcon>
                                <Description fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Reporte de Transacciones"
                                secondary="Lista detallada de transacciones"
                            />
                        </MenuItem>
                        <MenuItem onClick={handleDownloadStatisticsReport}>
                            <ListItemIcon>
                                <BarChart fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Resumen de Estadísticas"
                                secondary="Análisis por categoría"
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
                </Box>

                {/* Header con Estadísticas */}
                <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
                    {/* Balance Total */}
                    <Grid item xs={12} md={4}>
                        <Card
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                borderRadius: { xs: 2, sm: 1 }
                            }}
                        >
                            <CardContent sx={{ p: { xs: 2, sm: 2 } }}>
                                <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
                                    <Avatar
                                        sx={{
                                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                                            width: { xs: 48, sm: 56 },
                                            height: { xs: 48, sm: 56 }
                                        }}
                                    >
                                        <AccountBalanceWallet sx={{ fontSize: { xs: 24, sm: 28 } }} />
                                    </Avatar>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                            Balance Total
                                        </Typography>
                                        <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                                            {formatCurrency(statistics.balance)}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Total Ingresos */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Card
                            sx={{
                                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                color: 'white',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                borderRadius: { xs: 2, sm: 1 }
                            }}
                        >
                            <CardContent sx={{ p: { xs: 2, sm: 2 } }}>
                                <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
                                    <Avatar
                                        sx={{
                                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                                            width: { xs: 48, sm: 56 },
                                            height: { xs: 48, sm: 56 }
                                        }}
                                    >
                                        <TrendingUp sx={{ fontSize: { xs: 24, sm: 28 } }} />
                                    </Avatar>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                            Ingresos
                                        </Typography>
                                        <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                                            {formatCurrency(statistics.totalIncome)}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Total Gastos */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Card
                            sx={{
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                color: 'white',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                borderRadius: { xs: 2, sm: 1 }
                            }}
                        >
                            <CardContent sx={{ p: { xs: 2, sm: 2 } }}>
                                <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
                                    <Avatar
                                        sx={{
                                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                                            width: { xs: 48, sm: 56 },
                                            height: { xs: 48, sm: 56 }
                                        }}
                                    >
                                        <TrendingDown sx={{ fontSize: { xs: 24, sm: 28 } }} />
                                    </Avatar>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                            Gastos
                                        </Typography>
                                        <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                                            {formatCurrency(statistics.totalExpenses)}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Acceso Rápido a Presupuestos */}
                <Card
                    sx={{
                        borderRadius: { xs: 2, sm: 3 },
                        mb: { xs: 3, sm: 4 },
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)'
                        }
                    }}
                    onClick={() => navigate('/budgets')}
                >
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            justifyContent="space-between"
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                            spacing={2}
                        >
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar
                                    sx={{
                                        bgcolor: 'primary.main',
                                        width: 56,
                                        height: 56
                                    }}
                                >
                                    <Assessment sx={{ fontSize: 32 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" fontWeight={600}>
                                        💰 Gestiona tus Presupuestos
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Establece límites de gasto por categoría y controla tu dinero
                                    </Typography>
                                </Box>
                            </Stack>

                            <Chip
                                label="Ver Presupuestos"
                                color="primary"
                                sx={{
                                    fontWeight: 600,
                                    px: 2,
                                    py: 2.5,
                                    fontSize: '0.9rem'
                                }}
                            />
                        </Stack>
                    </CardContent>
                </Card>

                {/* Sección de Gráficas */}
                {transactions.length > 0 && (
                    <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                        <Typography variant="h5" fontWeight={700} sx={{ mb: { xs: 2, sm: 3 }, color: 'white', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                            Análisis y Estadísticas
                        </Typography>
                        <Grid container spacing={{ xs: 2, sm: 3 }}>
                            {/* Gráfica de Pastel - Gastos por Categoría */}
                            <Grid item xs={12} md={6}>
                                <ExpensesByCategoryChart transactions={transactions} />
                            </Grid>

                            {/* Gráfica de Barras - Ingresos vs Gastos */}
                            <Grid item xs={12} md={6}>
                                <IncomeVsExpensesChart transactions={transactions} />
                            </Grid>

                            {/* Gráfica de Línea - Tendencia Mensual */}
                            <Grid item xs={12}>
                                <MonthlyTrendChart transactions={transactions} />
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* Lista de Transacciones */}
                <Card
                    sx={{
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        bgcolor: 'white'
                    }}
                >
                    <Box
                        sx={{
                            p: 2.5,
                            borderBottom: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <Typography variant="h6" fontWeight={600}>
                            Transacciones Recientes
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {transactions.length} {transactions.length === 1 ? 'transacción' : 'transacciones'}
                        </Typography>
                    </Box>

                    <Box sx={{ p: 2 }}>
                        {sortedTransactions.length === 0 ? (
                            <Box
                                sx={{
                                    py: 8,
                                    textAlign: 'center'
                                }}
                            >
                                <AccountBalanceWallet
                                    sx={{
                                        fontSize: 80,
                                        color: 'grey.300',
                                        mb: 2
                                    }}
                                />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No hay transacciones aún
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Comienza agregando tu primer gasto o ingreso
                                </Typography>
                            </Box>
                        ) : (
                            <Stack spacing={1}>
                                {sortedTransactions.map((transaction) => {
                                    const category = getCategoryById(transaction.category, transaction.type);
                                    const isExpense = transaction.type === TRANSACTION_TYPES.EXPENSE;

                                    return (
                                        <Paper
                                            key={transaction.id}
                                            sx={{
                                                p: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                borderRadius: 2,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                    transform: 'translateY(-2px)'
                                                }
                                            }}
                                        >
                                            {/* Ícono de Categoría */}
                                            <Avatar
                                                sx={{
                                                    bgcolor: category.color,
                                                    width: 48,
                                                    height: 48
                                                }}
                                            >
                                                {category.icon}
                                            </Avatar>

                                            {/* Información */}
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight={600}
                                                    sx={{
                                                        fontSize: { xs: '0.9rem', sm: '1rem' },
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {transaction.description || category.name}
                                                </Typography>
                                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 1 }} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                                                    <Chip
                                                        label={category.name}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: `${category.color}20`,
                                                            color: category.color,
                                                            fontWeight: 500,
                                                            fontSize: '0.7rem'
                                                        }}
                                                    />
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                                        {formatDate(transaction.date)}
                                                    </Typography>
                                                </Stack>
                                            </Box>

                                            {/* Monto y Acciones en columna para móvil */}
                                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-end', sm: 'center' }, gap: { xs: 1, sm: 2 } }}>
                                                {/* Monto */}
                                                <Typography
                                                    variant="h6"
                                                    fontWeight={700}
                                                    color={isExpense ? 'error.main' : 'success.main'}
                                                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                                                >
                                                    {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
                                                </Typography>

                                                {/* Acciones */}
                                                <Stack direction="row" spacing={0.5}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenModal(transaction)}
                                                        sx={{ color: 'primary.main', p: { xs: 0.5, sm: 1 } }}
                                                    >
                                                        <Edit fontSize="small" sx={{ fontSize: { xs: 18, sm: 20 } }} />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDeleteTransaction(transaction)}
                                                        sx={{ color: 'error.main', p: { xs: 0.5, sm: 1 } }}
                                                    >
                                                        <Delete fontSize="small" sx={{ fontSize: { xs: 18, sm: 20 } }} />
                                                    </IconButton>
                                                </Stack>
                                            </Box>
                                        </Paper>
                                    );
                                })}
                            </Stack>
                        )}
                    </Box>
                </Card>

                {/* Botón Flotante para Agregar */}
                <Fab
                    color="primary"
                    aria-label="add"
                    onClick={() => handleOpenModal()}
                    sx={{
                        position: 'fixed',
                        bottom: { xs: 90, sm: 24 },
                        right: { xs: 16, sm: 24 },
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        width: { xs: 56, sm: 56 },
                        height: { xs: 56, sm: 56 },
                        '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)'
                        },
                        transition: 'all 0.3s ease'
                    }}
                >
                    <Add sx={{ fontSize: { xs: 28, sm: 24 } }} />
                </Fab>

                {/* Modal de Transacción */}
                <TransactionModal
                    open={modalOpen}
                    onClose={handleCloseModal}
                    editMode={editMode}
                />
                </Container>
            </Box>
        </Box>
    );
};
