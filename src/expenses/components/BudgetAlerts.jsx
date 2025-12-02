import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Box, Stack, Chip, LinearProgress, Alert, Button } from '@mui/material';
import { Warning, TrendingUp, ArrowForward } from '@mui/icons-material';
import { getCategoryById, TRANSACTION_TYPES } from '../../constants';
import { getBudgetStatus, BUDGET_STATUS, BUDGET_COLORS, calculateBudgetPercentage } from '../../constants/budgets';

/**
 * Componente que muestra alertas de presupuestos cercanos al límite
 * @param {Object} props
 * @param {Array} props.budgets - Lista de presupuestos
 * @param {Array} props.transactions - Lista de transacciones
 */
export const BudgetAlerts = ({ budgets, transactions }) => {
    const navigate = useNavigate();

    // Calcular gastos por categoría del mes actual
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthlyExpensesByCategory = transactions
        .filter(t => {
            const transactionDate = new Date(t.date);
            return (
                t.type === TRANSACTION_TYPES.EXPENSE &&
                transactionDate.getMonth() === currentMonth &&
                transactionDate.getFullYear() === currentYear
            );
        })
        .reduce((acc, transaction) => {
            const categoryId = transaction.category;
            acc[categoryId] = (acc[categoryId] || 0) + transaction.amount;
            return acc;
        }, {});

    // Filtrar presupuestos con alertas (warning, danger, exceeded)
    const budgetsWithAlerts = budgets
        .filter(budget => budget.period === 'monthly')
        .map(budget => {
            const spent = monthlyExpensesByCategory[budget.categoryId] || 0;
            const percentage = calculateBudgetPercentage(spent, budget.amount);
            const status = getBudgetStatus(percentage);
            const category = getCategoryById(budget.categoryId, TRANSACTION_TYPES.EXPENSE);

            return {
                ...budget,
                spent,
                percentage,
                status,
                category
            };
        })
        .filter(budget =>
            budget.status === BUDGET_STATUS.WARNING ||
            budget.status === BUDGET_STATUS.DANGER ||
            budget.status === BUDGET_STATUS.EXCEEDED
        )
        .sort((a, b) => b.percentage - a.percentage); // Ordenar por porcentaje descendente

    if (budgetsWithAlerts.length === 0) {
        return null;
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
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
                    <Warning color="warning" />
                    <Typography variant="h6" fontWeight={600}>
                        Alertas de Presupuestos
                    </Typography>
                    <Chip
                        label={budgetsWithAlerts.length}
                        size="small"
                        color="warning"
                        sx={{ ml: 'auto' }}
                    />
                </Stack>

                <Stack spacing={2}>
                    {budgetsWithAlerts.map((budget) => (
                        <Alert
                            key={budget.id}
                            severity={
                                budget.status === BUDGET_STATUS.EXCEEDED ? 'error' :
                                budget.status === BUDGET_STATUS.DANGER ? 'error' :
                                'warning'
                            }
                            sx={{
                                borderRadius: 2,
                                '& .MuiAlert-message': {
                                    width: '100%'
                                }
                            }}
                        >
                            <Stack spacing={1}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            {budget.category?.icon} {budget.category?.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatCurrency(budget.spent)} de {formatCurrency(budget.amount)}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={`${budget.percentage}%`}
                                        size="small"
                                        sx={{
                                            fontWeight: 700,
                                            bgcolor: BUDGET_COLORS[budget.status],
                                            color: 'white'
                                        }}
                                    />
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min(budget.percentage, 100)}
                                    sx={{
                                        height: 8,
                                        borderRadius: 1,
                                        bgcolor: 'rgba(0, 0, 0, 0.1)',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: BUDGET_COLORS[budget.status]
                                        }
                                    }}
                                />
                            </Stack>
                        </Alert>
                    ))}
                </Stack>

                <Button
                    fullWidth
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/budgets')}
                    sx={{ mt: 2 }}
                >
                    Ver todos los presupuestos
                </Button>
            </CardContent>
        </Card>
    );
};
