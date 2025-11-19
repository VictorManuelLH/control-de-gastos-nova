import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
    Card,
    CardContent,
    Typography,
    Stack,
    Avatar,
    IconButton,
    Chip,
    Box,
    Tooltip
} from '@mui/material';
import { Edit, Delete, Warning, CheckCircle } from '@mui/icons-material';
import { BudgetProgressBar } from './BudgetProgressBar';
import { getCategoryById, TRANSACTION_TYPES, getBudgetStatus, BUDGET_STATUS } from '../../constants';

/**
 * Componente que muestra una tarjeta de presupuesto con su progreso
 *
 */
export const BudgetCard = ({ budget, onEdit, onDelete }) => {
    const { transactions } = useSelector(state => state.expenses);

    // Obtener información de la categoría
    const category = getCategoryById(budget.categoryId, TRANSACTION_TYPES.EXPENSE);

    // Calcular gasto actual para este presupuesto
    const spent = useMemo(() => {
        const relevantTransactions = transactions.filter(t => {
            if (t.type !== TRANSACTION_TYPES.EXPENSE) return false;
            if (t.category !== budget.categoryId) return false;

            const transactionDate = new Date(t.date);
            const budgetYear = budget.year;
            const budgetMonth = budget.month;

            // Validar año
            if (transactionDate.getFullYear() !== budgetYear) return false;

            // Si es mensual, validar mes
            if (budget.period === 'monthly' && transactionDate.getMonth() !== budgetMonth) {
                return false;
            }

            return true;
        });

        return relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
    }, [transactions, budget]);

    // Calcular porcentaje
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    const status = getBudgetStatus(percentage);

    // Formatear período
    const formatPeriod = () => {
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        if (budget.period === 'monthly') {
            return `${monthNames[budget.month]} ${budget.year}`;
        } else if (budget.period === 'yearly') {
            return `Año ${budget.year}`;
        } else {
            return 'Semanal';
        }
    };

    // Determinar icono de estado
    const getStatusIcon = () => {
        if (status === BUDGET_STATUS.EXCEEDED || status === BUDGET_STATUS.DANGER) {
            return <Warning sx={{ fontSize: 20, color: 'error.main' }} />;
        }
        return <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />;
    };

    return (
        <Card
            sx={{
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                border: status === BUDGET_STATUS.EXCEEDED
                    ? '2px solid'
                    : '1px solid',
                borderColor: status === BUDGET_STATUS.EXCEEDED
                    ? 'error.main'
                    : 'divider',
                '&:hover': {
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                    transform: 'translateY(-4px)'
                }
            }}
        >
            <CardContent sx={{ p: 3 }}>
                {/* Header */}
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    sx={{ mb: 2 }}
                >
                    {/* Categoría */}
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                        <Avatar
                            sx={{
                                bgcolor: category.color,
                                width: 48,
                                height: 48,
                                fontSize: '1.5rem'
                            }}
                        >
                            {category.icon}
                        </Avatar>

                        <Box>
                            <Typography variant="h6" fontWeight={600}>
                                {category.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {formatPeriod()}
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Estado */}
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        {getStatusIcon()}

                        {/* Acciones */}
                        <Tooltip title="Editar">
                            <IconButton
                                size="small"
                                onClick={() => onEdit(budget)}
                                sx={{ color: 'primary.main' }}
                            >
                                <Edit fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Eliminar">
                            <IconButton
                                size="small"
                                onClick={() => onDelete(budget)}
                                sx={{ color: 'error.main' }}
                            >
                                <Delete fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>

                {/* Barra de Progreso */}
                <BudgetProgressBar
                    spent={spent}
                    budget={budget.amount}
                    showDetails={true}
                    height={10}
                />

                {/* Footer con tags */}
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 2 }}
                    justifyContent="flex-end"
                >
                    {budget.enabled ? (
                        <Chip
                            label="Activo"
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ fontWeight: 500, fontSize: '0.7rem' }}
                        />
                    ) : (
                        <Chip
                            label="Desactivado"
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 500, fontSize: '0.7rem' }}
                        />
                    )}

                    <Chip
                        label={`Alerta: ${budget.alertThreshold}%`}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 500, fontSize: '0.7rem' }}
                    />
                </Stack>
            </CardContent>
        </Card>
    );
};
