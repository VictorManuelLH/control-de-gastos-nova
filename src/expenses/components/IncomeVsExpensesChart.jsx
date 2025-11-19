import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Box, Typography, Paper, Stack, Alert, AlertTitle, Divider, Grid, LinearProgress, Chip } from '@mui/material';
import { Savings, TrendingUp, AccountBalance, Info, CheckCircle, Warning } from '@mui/icons-material';
import { TRANSACTION_TYPES } from '../../constants';

export const IncomeVsExpensesChart = ({ transactions }) => {
    // Agrupar transacciones por mes
    const monthlyData = useMemo(() => {
        const monthlyTotals = {};

        transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyTotals[monthKey]) {
                monthlyTotals[monthKey] = {
                    month: monthKey,
                    gastos: 0,
                    ingresos: 0
                };
            }

            if (transaction.type === TRANSACTION_TYPES.EXPENSE) {
                monthlyTotals[monthKey].gastos += transaction.amount;
            } else {
                monthlyTotals[monthKey].ingresos += transaction.amount;
            }
        });

        // Convertir a array y ordenar por fecha (últimos 6 meses)
        const sortedData = Object.values(monthlyTotals)
            .sort((a, b) => b.month.localeCompare(a.month))
            .slice(0, 6)
            .reverse();

        // Formatear nombres de mes
        return sortedData.map(item => {
            const [year, month] = item.month.split('-');
            const date = new Date(year, parseInt(month) - 1);
            const monthName = date.toLocaleDateString('es-ES', { month: 'short' });

            return {
                ...item,
                mes: monthName.charAt(0).toUpperCase() + monthName.slice(1),
                balance: item.ingresos - item.gastos
            };
        });
    }, [transactions]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0
        }).format(value);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const ingresos = payload.find(p => p.dataKey === 'ingresos')?.value || 0;
            const gastos = payload.find(p => p.dataKey === 'gastos')?.value || 0;
            const balance = ingresos - gastos;

            return (
                <Paper
                    sx={{
                        p: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid',
                        borderColor: 'primary.main',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                >
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        {label}
                    </Typography>
                    <Stack spacing={0.5}>
                        <Stack direction="row" justifyContent="space-between" spacing={2}>
                            <Typography variant="body2" color="success.main">
                                Ingresos:
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="success.main">
                                {formatCurrency(ingresos)}
                            </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" spacing={2}>
                            <Typography variant="body2" color="error.main">
                                Gastos:
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="error.main">
                                {formatCurrency(gastos)}
                            </Typography>
                        </Stack>
                        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 0.5, mt: 0.5 }}>
                            <Stack direction="row" justifyContent="space-between" spacing={2}>
                                <Typography variant="body2" fontWeight={600}>
                                    Balance:
                                </Typography>
                                <Typography
                                    variant="body2"
                                    fontWeight={700}
                                    color={balance >= 0 ? 'success.main' : 'error.main'}
                                >
                                    {formatCurrency(balance)}
                                </Typography>
                            </Stack>
                        </Box>
                    </Stack>
                </Paper>
            );
        }
        return null;
    };

    if (monthlyData.length === 0) {
        return (
            <Paper
                sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: 'white',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
            >
                <Typography variant="h6" color="text.secondary">
                    No hay datos para mostrar
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Agrega transacciones para ver la comparación
                </Typography>
            </Paper>
        );
    }

    // Calcular balance total y métricas
    const totalBalance = monthlyData.reduce((sum, item) => sum + item.balance, 0);
    const totalIncome = monthlyData.reduce((sum, item) => sum + item.ingresos, 0);
    const totalExpenses = monthlyData.reduce((sum, item) => sum + item.gastos, 0);

    // Calcular tasa de ahorro
    const savingsRate = totalIncome > 0 ? ((totalBalance / totalIncome) * 100).toFixed(1) : 0;

    // Análisis de patrones de gasto
    const analyzeSpendingPatterns = () => {
        if (monthlyData.length === 0) return null;

        // Encontrar mejor y peor mes
        const bestMonth = monthlyData.reduce((max, month) =>
            month.balance > max.balance ? month : max
        , monthlyData[0]);

        const worstMonth = monthlyData.reduce((min, month) =>
            month.balance < min.balance ? month : min
        , monthlyData[0]);

        // Calcular promedio de gastos
        const avgExpense = totalExpenses / monthlyData.length;

        // Meses con gastos por encima del promedio
        const highSpendingMonths = monthlyData.filter(m => m.gastos > avgExpense);

        // Tendencia general
        const positiveTrend = monthlyData.filter(m => m.balance > 0).length > monthlyData.length / 2;

        return {
            bestMonth,
            worstMonth,
            avgExpense,
            highSpendingMonths,
            positiveTrend
        };
    };

    const patterns = analyzeSpendingPatterns();

    // Generar recomendaciones
    const getRecommendations = () => {
        if (!patterns) return null;

        const recommendations = [];

        // Recomendación basada en tasa de ahorro
        if (savingsRate < 10) {
            recommendations.push({
                type: 'warning',
                icon: <Warning />,
                title: 'Tasa de Ahorro Baja',
                message: `Estás ahorrando solo el ${savingsRate}% de tus ingresos. Los expertos recomiendan ahorrar al menos 20%. Intenta reducir gastos no esenciales.`
            });
        } else if (savingsRate >= 20) {
            recommendations.push({
                type: 'success',
                icon: <CheckCircle />,
                title: '¡Excelente Ahorro!',
                message: `Estás ahorrando el ${savingsRate}% de tus ingresos. ¡Sigue así! Estás por encima de la recomendación del 20%.`
            });
        } else {
            recommendations.push({
                type: 'info',
                icon: <Info />,
                title: 'Buen Progreso',
                message: `Ahorras el ${savingsRate}% de tus ingresos. Estás cerca del objetivo del 20%. ¡Sigue mejorando!`
            });
        }

        // Recomendación basada en consistencia
        if (patterns.highSpendingMonths.length > monthlyData.length / 2) {
            recommendations.push({
                type: 'info',
                icon: <TrendingUp />,
                title: 'Oportunidad de Mejora',
                message: `${patterns.highSpendingMonths.length} de ${monthlyData.length} meses tienen gastos superiores al promedio (${formatCurrency(patterns.avgExpense)}). Identifica gastos recurrentes que puedas reducir.`
            });
        }

        return recommendations;
    };

    const recommendations = getRecommendations();

    return (
        <Paper
            id="income-vs-expenses-chart"
            sx={{
                p: 3,
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
        >
            <Typography variant="h6" fontWeight={600} gutterBottom>
                💰 Comparativa: Ingresos vs Gastos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Visualiza el balance de tus finanzas mes a mes y descubre cuánto estás ahorrando o gastando de más
            </Typography>

            {/* Tarjetas de métricas principales */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            bgcolor: totalBalance >= 0 ? '#2ecc7110' : '#e74c3c10',
                            borderRadius: 2,
                            border: `2px solid ${totalBalance >= 0 ? '#2ecc71' : '#e74c3c'}`
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <AccountBalance sx={{ color: totalBalance >= 0 ? '#2ecc71' : '#e74c3c', fontSize: 24 }} />
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>
                                BALANCE ACUMULADO
                            </Typography>
                        </Stack>
                        <Typography
                            variant="h4"
                            fontWeight={700}
                            color={totalBalance >= 0 ? '#2ecc71' : '#e74c3c'}
                        >
                            {formatCurrency(totalBalance)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {totalBalance >= 0 ? 'Has ahorrado' : 'Gastos excedentes'} en los últimos {monthlyData.length} meses
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            bgcolor: '#4facfe10',
                            borderRadius: 2,
                            border: '1px solid #4facfe40'
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <Savings sx={{ color: '#4facfe', fontSize: 24 }} />
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>
                                TASA DE AHORRO
                            </Typography>
                        </Stack>
                        <Typography variant="h4" fontWeight={700} color="#4facfe">
                            {savingsRate}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {savingsRate >= 20 ? '¡Por encima del objetivo!' : savingsRate >= 10 ? 'Cerca del objetivo (20%)' : 'Por debajo del objetivo (20%)'}
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={Math.min(parseFloat(savingsRate), 100)}
                            sx={{
                                mt: 1,
                                height: 8,
                                borderRadius: 1,
                                bgcolor: '#4facfe20',
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: savingsRate >= 20 ? '#2ecc71' : savingsRate >= 10 ? '#FFA726' : '#f5576c',
                                    borderRadius: 1
                                }
                            }}
                        />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            bgcolor: '#f8f9fa',
                            borderRadius: 2,
                            border: '1px solid #e0e0e0'
                        }}
                    >
                        <Typography variant="caption" color="text.secondary" fontWeight={700} gutterBottom sx={{ display: 'block' }}>
                            PROMEDIO MENSUAL
                        </Typography>
                        <Stack spacing={0.5}>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="caption" color="text.secondary">
                                    Ingresos:
                                </Typography>
                                <Typography variant="caption" fontWeight={600} color="#4facfe">
                                    {formatCurrency(totalIncome / monthlyData.length)}
                                </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="caption" color="text.secondary">
                                    Gastos:
                                </Typography>
                                <Typography variant="caption" fontWeight={600} color="#f5576c">
                                    {formatCurrency(totalExpenses / monthlyData.length)}
                                </Typography>
                            </Stack>
                            <Divider sx={{ my: 0.5 }} />
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="caption" fontWeight={700}>
                                    Ahorro:
                                </Typography>
                                <Typography
                                    variant="caption"
                                    fontWeight={700}
                                    color={totalBalance >= 0 ? '#2ecc71' : '#e74c3c'}
                                >
                                    {formatCurrency(totalBalance / monthlyData.length)}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            {/* Recomendaciones automáticas */}
            {recommendations && recommendations.length > 0 && (
                <Stack spacing={1} sx={{ mb: 2 }}>
                    {recommendations.map((rec, index) => (
                        <Alert
                            key={index}
                            severity={rec.type}
                            icon={rec.icon}
                            sx={{
                                '& .MuiAlert-message': {
                                    width: '100%'
                                }
                            }}
                        >
                            <AlertTitle sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                                {rec.title}
                            </AlertTitle>
                            <Typography variant="body2">{rec.message}</Typography>
                        </Alert>
                    ))}
                </Stack>
            )}

            <Divider sx={{ mb: 2 }} />

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="mes"
                        stroke="#666"
                        style={{ fontSize: '0.8rem' }}
                    />
                    <YAxis
                        stroke="#666"
                        style={{ fontSize: '0.8rem' }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ fontSize: '0.9rem', paddingTop: '10px' }}
                    />
                    <Bar
                        dataKey="ingresos"
                        name="Ingresos"
                        radius={[8, 8, 0, 0]}
                        animationDuration={1000}
                    >
                        {monthlyData.map((entry, index) => (
                            <Cell key={`cell-income-${index}`} fill="#4facfe" />
                        ))}
                    </Bar>
                    <Bar
                        dataKey="gastos"
                        name="Gastos"
                        radius={[8, 8, 0, 0]}
                        animationDuration={1000}
                    >
                        {monthlyData.map((entry, index) => (
                            <Cell key={`cell-expense-${index}`} fill="#f5576c" />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Análisis mes a mes */}
            <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Balance Mensual Detallado
                </Typography>
                <Stack spacing={1}>
                    {monthlyData.map((month, index) => {
                        const isPositive = month.balance >= 0;
                        const savingsPercent = month.ingresos > 0 ? ((month.balance / month.ingresos) * 100).toFixed(1) : 0;
                        const isBestMonth = patterns && month.mes === patterns.bestMonth.mes;
                        const isWorstMonth = patterns && month.mes === patterns.worstMonth.mes;

                        return (
                            <Paper
                                key={index}
                                elevation={0}
                                sx={{
                                    p: 2,
                                    bgcolor: isPositive ? '#2ecc7110' : '#e74c3c10',
                                    border: isBestMonth ? '2px solid #2ecc71' : isWorstMonth ? '2px solid #e74c3c' : '1px solid',
                                    borderColor: isPositive ? '#2ecc7140' : '#e74c3c40',
                                    borderRadius: 2,
                                    position: 'relative'
                                }}
                            >
                                {isBestMonth && (
                                    <Chip
                                        label="MEJOR MES"
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            bgcolor: '#2ecc71',
                                            color: 'white',
                                            fontWeight: 700,
                                            fontSize: '0.65rem'
                                        }}
                                    />
                                )}
                                {isWorstMonth && (
                                    <Chip
                                        label="NECESITA ATENCIÓN"
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            bgcolor: '#e74c3c',
                                            color: 'white',
                                            fontWeight: 700,
                                            fontSize: '0.65rem'
                                        }}
                                    />
                                )}
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={3}>
                                        <Typography variant="body2" fontWeight={700}>
                                            {month.mes}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Tasa ahorro: {savingsPercent}%
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <Typography variant="caption" color="text.secondary">
                                            Ingresos
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600} color="#4facfe">
                                            {formatCurrency(month.ingresos)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <Typography variant="caption" color="text.secondary">
                                            Gastos
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600} color="#f5576c">
                                            {formatCurrency(month.gastos)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <Typography variant="caption" color="text.secondary">
                                            Balance
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            fontWeight={700}
                                            color={isPositive ? '#2ecc71' : '#e74c3c'}
                                        >
                                            {formatCurrency(month.balance)}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                        );
                    })}
                </Stack>
            </Box>

            {/* Guía de interpretación */}
            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    💡 <strong>Cómo interpretar esta gráfica:</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" component="div">
                    • <strong>Barras azules (Ingresos):</strong> Representan el dinero que entra cada mes.
                    <br />
                    • <strong>Barras rojas (Gastos):</strong> Representan el dinero que gastas cada mes.
                    <br />
                    • <strong>Balance positivo:</strong> Cuando la barra azul es más alta que la roja = estás ahorrando ✅
                    <br />
                    • <strong>Balance negativo:</strong> Cuando la barra roja es más alta que la azul = gastas más de lo que ganas ⚠️
                    <br />
                    • <strong>Meta recomendada:</strong> Ahorrar al menos el 20% de tus ingresos mensuales.
                    {patterns && (
                        <>
                            <br />
                            • <strong>Tu mejor mes fue:</strong> {patterns.bestMonth.mes} con un balance de {formatCurrency(patterns.bestMonth.balance)}
                        </>
                    )}
                </Typography>
            </Box>
        </Paper>
    );
};
