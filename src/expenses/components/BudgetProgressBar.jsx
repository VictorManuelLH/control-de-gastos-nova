import { Box, LinearProgress, Typography, Stack } from '@mui/material';
import { getBudgetStatus, BUDGET_COLORS, BUDGET_MESSAGES, BUDGET_ICONS } from '../../constants';

/**
 * Componente que muestra una barra de progreso del presupuesto
 * con colores dinámicos según el porcentaje usado
 *
 * @param {Object} props
 * @param {number} props.spent - Cantidad gastada
 * @param {number} props.budget - Presupuesto total
 * @param {boolean} props.showDetails - Mostrar detalles numéricos
 * @param {number} props.height - Altura de la barra (default: 8)
 */
export const BudgetProgressBar = ({
    spent = 0,
    budget = 0,
    showDetails = true,
    height = 8
}) => {
    // Calcular porcentaje
    const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    const displayPercentage = Math.round(percentage);

    // Determinar estado y color
    const status = getBudgetStatus(percentage);
    const color = BUDGET_COLORS[status];
    const message = BUDGET_MESSAGES[status];
    const icon = BUDGET_ICONS[status];

    // Calcular cantidad restante
    const remaining = budget - spent;
    const isExceeded = spent > budget;

    // Formatear moneda
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* Barra de progreso */}
            <Box sx={{ position: 'relative', mb: showDetails ? 1 : 0 }}>
                <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                        height: height,
                        borderRadius: 2,
                        bgcolor: 'rgba(0, 0, 0, 0.08)',
                        '& .MuiLinearProgress-bar': {
                            bgcolor: color,
                            borderRadius: 2,
                            transition: 'all 0.3s ease'
                        }
                    }}
                />

                {/* Indicador de exceso (si aplica) */}
                {isExceeded && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: height,
                            borderRadius: 2,
                            background: `repeating-linear-gradient(
                                45deg,
                                ${color}00,
                                ${color}00 10px,
                                ${color}40 10px,
                                ${color}40 20px
                            )`,
                            animation: 'slideStripes 1s linear infinite',
                            '@keyframes slideStripes': {
                                '0%': { backgroundPosition: '0 0' },
                                '100%': { backgroundPosition: '20px 0' }
                            }
                        }}
                    />
                )}
            </Box>

            {/* Detalles */}
            {showDetails && (
                <Stack spacing={0.5}>
                    {/* Porcentaje y Estado */}
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ color }}
                        >
                            {icon} {displayPercentage}% usado
                        </Typography>

                        <Typography
                            variant="caption"
                            sx={{
                                color,
                                fontWeight: 500
                            }}
                        >
                            {message}
                        </Typography>
                    </Stack>

                    {/* Cantidades */}
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Typography variant="caption" color="text.secondary">
                            Gastado: <strong>{formatCurrency(spent)}</strong>
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                            {isExceeded ? 'Excedido por' : 'Disponible'}: {' '}
                            <strong style={{ color: isExceeded ? color : 'inherit' }}>
                                {formatCurrency(Math.abs(remaining))}
                            </strong>
                        </Typography>
                    </Stack>

                    {/* Presupuesto total */}
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ textAlign: 'center' }}
                    >
                        Presupuesto total: <strong>{formatCurrency(budget)}</strong>
                    </Typography>
                </Stack>
            )}
        </Box>
    );
};
