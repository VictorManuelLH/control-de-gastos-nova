import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography, Paper, Stack, Chip, Alert, AlertTitle, Divider, Grid } from '@mui/material';
import { TrendingUp, TrendingDown, CheckCircle, Warning, Info, Lightbulb } from '@mui/icons-material';
import { TRANSACTION_TYPES } from '../../constants';

export const MonthlyTrendChart = ({ transactions }) => {
    // Agrupar transacciones por mes
    const monthlyData = useMemo(() => {
        const monthlyTotals = {};

        transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyTotals[monthKey]) {
                monthlyTotals[monthKey] = {
                    month: monthKey,
                    expenses: 0,
                    income: 0
                };
            }

            if (transaction.type === TRANSACTION_TYPES.EXPENSE) {
                monthlyTotals[monthKey].expenses += transaction.amount;
            } else {
                monthlyTotals[monthKey].income += transaction.amount;
            }
        });

        // Convertir a array y ordenar por fecha
        const sortedData = Object.values(monthlyTotals).sort((a, b) =>
            a.month.localeCompare(b.month)
        );

        // Formatear nombres de mes
        return sortedData.map(item => {
            const [year, month] = item.month.split('-');
            const date = new Date(year, parseInt(month) - 1);
            const monthName = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });

            return {
                ...item,
                monthLabel: monthName.charAt(0).toUpperCase() + monthName.slice(1),
                balance: item.income - item.expenses
            };
        });
    }, [transactions]);

    const totalIncome = useMemo(() => {
        return monthlyData.reduce((sum, item) => sum + item.income, 0);
    }, [monthlyData]);

    const totalExpenses = useMemo(() => {
        return monthlyData.reduce((sum, item) => sum + item.expenses, 0);
    }, [monthlyData]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0
        }).format(value);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;

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
                        {data.monthLabel}
                    </Typography>
                    <Stack spacing={0.5}>
                        <Stack direction="row" justifyContent="space-between" spacing={2}>
                            <Typography variant="body2" color="success.main">
                                Ingresos:
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="success.main">
                                {formatCurrency(data.income)}
                            </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" spacing={2}>
                            <Typography variant="body2" color="error.main">
                                Gastos:
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="error.main">
                                {formatCurrency(data.expenses)}
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
                                    color={data.balance >= 0 ? 'success.main' : 'error.main'}
                                >
                                    {formatCurrency(data.balance)}
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
                    Agrega transacciones para ver la tendencia
                </Typography>
            </Paper>
        );
    }

    // Calcular promedio mensual
    const avgMonthlyIncome = monthlyData.length > 0 ? totalIncome / monthlyData.length : 0;
    const avgMonthlyExpenses = monthlyData.length > 0 ? totalExpenses / monthlyData.length : 0;

    // Análisis de tendencias
    const analyzeTrends = () => {
        if (monthlyData.length < 2) return null;

        const lastMonth = monthlyData[monthlyData.length - 1];
        const previousMonth = monthlyData[monthlyData.length - 2];

        // Calcular cambios
        const expenseChange = lastMonth.expenses - previousMonth.expenses;
        const expenseChangePercent = previousMonth.expenses > 0
            ? ((expenseChange / previousMonth.expenses) * 100).toFixed(1)
            : 0;

        const incomeChange = lastMonth.income - previousMonth.income;
        const incomeChangePercent = previousMonth.income > 0
            ? ((incomeChange / previousMonth.income) * 100).toFixed(1)
            : 0;

        const balanceChange = lastMonth.balance - previousMonth.balance;

        // Calcular tendencia general (últimos 3 meses)
        const recentMonths = monthlyData.slice(-3);
        const avgRecentBalance = recentMonths.reduce((sum, m) => sum + m.balance, 0) / recentMonths.length;

        // Contar meses positivos vs negativos
        const positiveMonths = monthlyData.filter(m => m.balance > 0).length;
        const negativeMonths = monthlyData.filter(m => m.balance < 0).length;

        return {
            lastMonth,
            previousMonth,
            expenseChange,
            expenseChangePercent,
            incomeChange,
            incomeChangePercent,
            balanceChange,
            avgRecentBalance,
            positiveMonths,
            negativeMonths,
            totalMonths: monthlyData.length
        };
    };

    const trends = analyzeTrends();

    // Generar insights basados en tendencias
    const getInsights = () => {
        if (!trends) return null;

        const insights = [];

        // Insight sobre balance general
        if (trends.positiveMonths > trends.negativeMonths) {
            insights.push({
                type: 'success',
                icon: <CheckCircle />,
                title: '¡Excelente Control Financiero!',
                message: `${trends.positiveMonths} de ${trends.totalMonths} meses con balance positivo. Estás ahorrando consistentemente.`
            });
        } else if (trends.negativeMonths > trends.positiveMonths) {
            insights.push({
                type: 'warning',
                icon: <Warning />,
                title: 'Atención Requerida',
                message: `${trends.negativeMonths} de ${trends.totalMonths} meses con balance negativo. Es momento de revisar tus gastos.`
            });
        }

        // Insight sobre cambios recientes
        if (Math.abs(trends.expenseChangePercent) > 20) {
            const direction = trends.expenseChange > 0 ? 'aumentado' : 'reducido';
            const color = trends.expenseChange > 0 ? 'warning' : 'success';
            insights.push({
                type: color,
                icon: <Info />,
                title: 'Cambio Significativo en Gastos',
                message: `Tus gastos han ${direction} ${Math.abs(trends.expenseChangePercent)}% respecto al mes anterior.`
            });
        }

        // Insight sobre tendencia de ahorro
        if (trends.avgRecentBalance > 0) {
            const savingsRate = ((avgMonthlyIncome - avgMonthlyExpenses) / avgMonthlyIncome * 100).toFixed(1);
            insights.push({
                type: 'info',
                icon: <Lightbulb />,
                title: 'Tasa de Ahorro',
                message: `Estás ahorrando aproximadamente ${savingsRate}% de tus ingresos mensuales. ${savingsRate > 20 ? '¡Excelente!' : savingsRate > 10 ? '¡Bien hecho!' : 'Intenta aumentar este porcentaje.'}`
            });
        }

        return insights;
    };

    const insights = getInsights();

    return (
        <Paper
            id="monthly-trend-chart"
            sx={{
                p: 3,
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
        >
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                    📈 Evolución de Ingresos y Gastos
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Analiza la evolución de tus finanzas mes a mes y descubre patrones en tu comportamiento financiero
                </Typography>

                {/* Métricas principales */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                bgcolor: '#4facfe10',
                                borderRadius: 2,
                                border: '1px solid #4facfe40'
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                <TrendingUp sx={{ color: '#4facfe', fontSize: 20 }} />
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    INGRESOS TOTALES
                                </Typography>
                            </Stack>
                            <Typography variant="h5" fontWeight={700} color="#4facfe">
                                {formatCurrency(totalIncome)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Promedio: {formatCurrency(avgMonthlyIncome)}/mes
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                bgcolor: '#f5576c10',
                                borderRadius: 2,
                                border: '1px solid #f5576c40'
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                <TrendingDown sx={{ color: '#f5576c', fontSize: 20 }} />
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    GASTOS TOTALES
                                </Typography>
                            </Stack>
                            <Typography variant="h5" fontWeight={700} color="#f5576c">
                                {formatCurrency(totalExpenses)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Promedio: {formatCurrency(avgMonthlyExpenses)}/mes
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                bgcolor: totalIncome >= totalExpenses ? '#2ecc7110' : '#e74c3c10',
                                borderRadius: 2,
                                border: `1px solid ${totalIncome >= totalExpenses ? '#2ecc7140' : '#e74c3c40'}`
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                {totalIncome >= totalExpenses ?
                                    <CheckCircle sx={{ color: '#2ecc71', fontSize: 20 }} /> :
                                    <Warning sx={{ color: '#e74c3c', fontSize: 20 }} />
                                }
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    BALANCE TOTAL
                                </Typography>
                            </Stack>
                            <Typography
                                variant="h5"
                                fontWeight={700}
                                color={totalIncome >= totalExpenses ? '#2ecc71' : '#e74c3c'}
                            >
                                {formatCurrency(totalIncome - totalExpenses)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {totalIncome >= totalExpenses ? 'Ahorro generado' : 'Déficit acumulado'}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Insights automáticos */}
                {insights && insights.length > 0 && (
                    <Stack spacing={1} sx={{ mb: 2 }}>
                        {insights.map((insight, index) => (
                            <Alert
                                key={index}
                                severity={insight.type}
                                icon={insight.icon}
                                sx={{
                                    '& .MuiAlert-message': {
                                        width: '100%'
                                    }
                                }}
                            >
                                <AlertTitle sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                                    {insight.title}
                                </AlertTitle>
                                <Typography variant="body2">{insight.message}</Typography>
                            </Alert>
                        ))}
                    </Stack>
                )}

                {/* Comparación mes a mes */}
                {trends && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            bgcolor: '#f8f9fa',
                            borderRadius: 2,
                            mb: 2
                        }}
                    >
                        <Typography variant="caption" fontWeight={700} color="text.secondary" gutterBottom sx={{ display: 'block' }}>
                            📊 CAMBIOS RESPECTO AL MES ANTERIOR
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography variant="caption" color="text.secondary">
                                        Ingresos:
                                    </Typography>
                                    <Chip
                                        label={`${trends.incomeChange >= 0 ? '+' : ''}${trends.incomeChangePercent}%`}
                                        size="small"
                                        sx={{
                                            bgcolor: trends.incomeChange >= 0 ? '#2ecc7120' : '#e74c3c20',
                                            color: trends.incomeChange >= 0 ? '#2ecc71' : '#e74c3c',
                                            fontWeight: 700,
                                            fontSize: '0.7rem'
                                        }}
                                    />
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography variant="caption" color="text.secondary">
                                        Gastos:
                                    </Typography>
                                    <Chip
                                        label={`${trends.expenseChange >= 0 ? '+' : ''}${trends.expenseChangePercent}%`}
                                        size="small"
                                        sx={{
                                            bgcolor: trends.expenseChange <= 0 ? '#2ecc7120' : '#e74c3c20',
                                            color: trends.expenseChange <= 0 ? '#2ecc71' : '#e74c3c',
                                            fontWeight: 700,
                                            fontSize: '0.7rem'
                                        }}
                                    />
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography variant="caption" color="text.secondary">
                                        Balance:
                                    </Typography>
                                    <Chip
                                        label={`${trends.balanceChange >= 0 ? '+' : ''}${formatCurrency(trends.balanceChange)}`}
                                        size="small"
                                        sx={{
                                            bgcolor: trends.balanceChange >= 0 ? '#2ecc7120' : '#e74c3c20',
                                            color: trends.balanceChange >= 0 ? '#2ecc71' : '#e74c3c',
                                            fontWeight: 700,
                                            fontSize: '0.7rem'
                                        }}
                                    />
                                </Stack>
                            </Grid>
                        </Grid>
                    </Paper>
                )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="monthLabel"
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
                        iconType="line"
                    />
                    <Line
                        type="monotone"
                        dataKey="income"
                        stroke="#4facfe"
                        strokeWidth={3}
                        name="Ingresos"
                        dot={{ fill: '#4facfe', r: 5 }}
                        activeDot={{ r: 7 }}
                        animationDuration={1000}
                    />
                    <Line
                        type="monotone"
                        dataKey="expenses"
                        stroke="#f5576c"
                        strokeWidth={3}
                        name="Gastos"
                        dot={{ fill: '#f5576c', r: 5 }}
                        activeDot={{ r: 7 }}
                        animationDuration={1000}
                    />
                </LineChart>
            </ResponsiveContainer>

            {/* Guía de interpretación */}
            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    💡 <strong>Cómo interpretar esta gráfica:</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" component="div">
                    • <strong>Línea azul (Ingresos):</strong> Muestra cuánto dinero entra cada mes. Una línea ascendente es positiva.
                    <br />
                    • <strong>Línea roja (Gastos):</strong> Muestra cuánto dinero sale cada mes. Una línea descendente es positiva.
                    <br />
                    • <strong>Objetivo ideal:</strong> La línea azul debe estar siempre por encima de la roja (ahorras dinero).
                    <br />
                    • <strong>Patrón saludable:</strong> {trends && trends.positiveMonths >= trends.totalMonths / 2
                        ? `✅ Tienes ${trends.positiveMonths} meses positivos de ${trends.totalMonths} total. ¡Buen trabajo!`
                        : `⚠️ Solo ${trends?.positiveMonths || 0} de ${trends?.totalMonths || 0} meses son positivos. Intenta reducir gastos o aumentar ingresos.`
                    }
                </Typography>
            </Box>
        </Paper>
    );
};
