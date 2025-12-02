import { useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Grid, Toolbar, Typography, Card, CardContent, Fab } from '@mui/material';
import {
    Add,
    TrendingUp,
    TrendingDown,
    AccountBalanceWallet
} from '@mui/icons-material';
import { useState } from 'react';
import { Navbar } from '../../journal/components';
import {
    StatCard,
    BudgetAlerts,
    UpcomingPayments,
    QuickActions,
    TransactionModal,
    MonthlyTrendChart
} from '../components';
import { startLoadingTransactions } from '../../store/auth/thunks';
import { TRANSACTION_TYPES } from '../../constants';

export const DashboardPage = () => {
    const dispatch = useDispatch();
    const { transactions } = useSelector(state => state.expenses);
    const { budgets } = useSelector(state => state.budgets);
    const { recurrings } = useSelector(state => state.recurring);
    const [modalOpen, setModalOpen] = useState(false);

    // Cargar transacciones al montar el componente
    useEffect(() => {
        dispatch(startLoadingTransactions());
    }, [dispatch]);

    // Calcular estadísticas del mes actual
    const currentMonthStats = useMemo(() => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const monthTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return (
                transactionDate.getMonth() === currentMonth &&
                transactionDate.getFullYear() === currentYear
            );
        });

        const expenses = monthTransactions
            .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
            .reduce((sum, t) => sum + t.amount, 0);

        const income = monthTransactions
            .filter(t => t.type === TRANSACTION_TYPES.INCOME)
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = income - expenses;

        return { expenses, income, balance };
    }, [transactions]);

    // Calcular estadísticas totales (histórico)
    const totalStats = useMemo(() => {
        const totalExpenses = transactions
            .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
            .reduce((sum, t) => sum + t.amount, 0);

        const totalIncome = transactions
            .filter(t => t.type === TRANSACTION_TYPES.INCOME)
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = totalIncome - totalExpenses;

        return { totalExpenses, totalIncome, balance };
    }, [transactions]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const currentMonth = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

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
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" fontWeight={700} sx={{ color: 'white', mb: 1 }}>
                            Panel de Control
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                            Resumen de {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)}
                        </Typography>
                    </Box>

                    {/* Estadísticas del Mes Actual */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {/* Balance del Mes */}
                        <Grid item xs={12} md={4}>
                            <StatCard
                                title="Balance del Mes"
                                value={formatCurrency(currentMonthStats.balance)}
                                icon={<AccountBalanceWallet />}
                                gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                subtitle={currentMonthStats.balance >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
                            />
                        </Grid>

                        {/* Ingresos del Mes */}
                        <Grid item xs={12} sm={6} md={4}>
                            <StatCard
                                title="Ingresos del Mes"
                                value={formatCurrency(currentMonthStats.income)}
                                icon={<TrendingUp />}
                                gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                            />
                        </Grid>

                        {/* Gastos del Mes */}
                        <Grid item xs={12} sm={6} md={4}>
                            <StatCard
                                title="Gastos del Mes"
                                value={formatCurrency(currentMonthStats.expenses)}
                                icon={<TrendingDown />}
                                gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                            />
                        </Grid>
                    </Grid>

                    {/* Accesos Rápidos */}
                    <Box sx={{ mb: 4 }}>
                        <QuickActions />
                    </Box>

                    {/* Alertas y Próximos Pagos */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {/* Alertas de Presupuestos */}
                        <Grid item xs={12} md={6}>
                            <BudgetAlerts budgets={budgets} transactions={transactions} />
                        </Grid>

                        {/* Próximos Pagos */}
                        <Grid item xs={12} md={6}>
                            <UpcomingPayments recurrings={recurrings} />
                        </Grid>
                    </Grid>

                    {/* Gráfico de Tendencia */}
                    {transactions.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'white' }}>
                                Tendencia Mensual
                            </Typography>
                            <MonthlyTrendChart transactions={transactions} />
                        </Box>
                    )}

                    {/* Resumen Total (Histórico) */}
                    <Card
                        sx={{
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            bgcolor: 'rgba(255, 255, 255, 0.95)'
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                                Resumen Total (Histórico)
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={4}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Balance Total
                                        </Typography>
                                        <Typography
                                            variant="h5"
                                            fontWeight={700}
                                            color={totalStats.balance >= 0 ? 'success.main' : 'error.main'}
                                        >
                                            {formatCurrency(totalStats.balance)}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Ingresos Totales
                                        </Typography>
                                        <Typography variant="h5" fontWeight={700} color="success.main">
                                            {formatCurrency(totalStats.totalIncome)}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Gastos Totales
                                        </Typography>
                                        <Typography variant="h5" fontWeight={700} color="error.main">
                                            {formatCurrency(totalStats.totalExpenses)}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Mensaje si no hay transacciones */}
                    {transactions.length === 0 && (
                        <Card
                            sx={{
                                borderRadius: 3,
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                bgcolor: 'rgba(255, 255, 255, 0.95)',
                                mt: 4
                            }}
                        >
                            <CardContent>
                                <Box sx={{ textAlign: 'center', py: 6 }}>
                                    <AccountBalanceWallet
                                        sx={{
                                            fontSize: 80,
                                            color: 'grey.300',
                                            mb: 2
                                        }}
                                    />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        ¡Bienvenido a tu Panel de Control!
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Comienza agregando tu primera transacción para ver estadísticas
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    )}
                </Container>

                {/* Botón Flotante para Agregar */}
                <Fab
                    color="primary"
                    aria-label="add"
                    onClick={handleOpenModal}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
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

                {/* Modal de Transacción */}
                <TransactionModal
                    open={modalOpen}
                    onClose={handleCloseModal}
                    editMode={false}
                />
            </Box>
        </Box>
    );
};
