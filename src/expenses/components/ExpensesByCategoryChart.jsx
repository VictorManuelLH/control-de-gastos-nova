import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Box, Typography, Paper, Stack, Chip, Avatar, Alert, AlertTitle, Divider } from '@mui/material';
import { TrendingUp, Info, Warning } from '@mui/icons-material';
import { TRANSACTION_TYPES, getCategoryById } from '../../constants';

export const ExpensesByCategoryChart = ({ transactions }) => {
    // Calcular gastos por categoría
    const expensesByCategory = useMemo(() => {
        const expenses = transactions.filter(t => t.type === TRANSACTION_TYPES.EXPENSE);

        const categoryTotals = {};
        expenses.forEach(expense => {
            if (!categoryTotals[expense.category]) {
                categoryTotals[expense.category] = 0;
            }
            categoryTotals[expense.category] += expense.amount;
        });

        // Convertir a array para el gráfico
        return Object.entries(categoryTotals).map(([categoryId, amount]) => {
            const category = getCategoryById(categoryId, TRANSACTION_TYPES.EXPENSE);
            return {
                name: category.name,
                value: amount,
                color: category.color,
                icon: category.icon
            };
        }).sort((a, b) => b.value - a.value); // Ordenar de mayor a menor
    }, [transactions]);

    const totalExpenses = useMemo(() => {
        return expensesByCategory.reduce((sum, item) => sum + item.value, 0);
    }, [expensesByCategory]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0
        }).format(value);
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percentage = ((data.value / totalExpenses) * 100).toFixed(1);

            return (
                <Paper
                    sx={{
                        p: 1.5,
                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: `2px solid ${data.color}`,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                >
                    <Stack spacing={0.5}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography sx={{ fontSize: '1.2rem' }}>{data.icon}</Typography>
                            <Typography variant="subtitle2" fontWeight={600}>
                                {data.name}
                            </Typography>
                        </Stack>
                        <Typography variant="h6" color={data.color} fontWeight={700}>
                            {formatCurrency(data.value)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {percentage}% del total
                        </Typography>
                    </Stack>
                </Paper>
            );
        }
        return null;
    };

    const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null; // No mostrar etiquetas muy pequeñas

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    if (expensesByCategory.length === 0) {
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
                    No hay gastos para mostrar
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Comienza agregando tus gastos para ver el análisis
                </Typography>
            </Paper>
        );
    }

    // Calcular estadísticas adicionales e insights
    const topCategory = expensesByCategory[0];
    const avgExpensePerCategory = totalExpenses / expensesByCategory.length;

    // Identificar categorías que están por encima del promedio
    const aboveAverageCategories = expensesByCategory.filter(cat => cat.value > avgExpensePerCategory);

    // Calcular el porcentaje del top 3
    const top3Total = expensesByCategory.slice(0, 3).reduce((sum, cat) => sum + cat.value, 0);
    const top3Percentage = totalExpenses > 0 ? (top3Total / totalExpenses * 100).toFixed(0) : 0;

    // Generar insight inteligente
    const getInsight = () => {
        if (!topCategory) return null;

        const topPercentage = ((topCategory.value / totalExpenses) * 100).toFixed(0);

        if (topPercentage > 50) {
            return {
                type: 'warning',
                icon: <Warning />,
                title: 'Concentración Alta',
                message: `${topCategory.icon} ${topCategory.name} representa el ${topPercentage}% de tus gastos totales. Considera diversificar tus gastos para mejor balance financiero.`
            };
        } else if (top3Percentage > 75) {
            return {
                type: 'info',
                icon: <Info />,
                title: 'Patrón de Gasto',
                message: `Tus 3 categorías principales (${expensesByCategory.slice(0, 3).map(c => c.icon + ' ' + c.name).join(', ')}) representan el ${top3Percentage}% del total. Este es un patrón de gasto concentrado.`
            };
        } else {
            return {
                type: 'success',
                icon: <TrendingUp />,
                title: 'Gastos Balanceados',
                message: `Tus gastos están bien distribuidos. La categoría principal ${topCategory.icon} ${topCategory.name} representa solo el ${topPercentage}% del total.`
            };
        }
    };

    const insight = getInsight();

    return (
        <Paper
            id="expenses-by-category-chart"
            sx={{
                p: 3,
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
        >
            {/* Encabezado con descripción */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                    📊 Distribución de Gastos por Categoría
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Análisis detallado de cómo distribuyes tu dinero entre diferentes categorías de gasto
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
                    <Chip
                        label={`Total gastado: ${formatCurrency(totalExpenses)}`}
                        sx={{
                            bgcolor: '#667eea20',
                            color: '#667eea',
                            fontWeight: 600,
                            fontSize: '0.85rem'
                        }}
                    />
                    <Chip
                        label={`${expensesByCategory.length} categorías activas`}
                        sx={{
                            bgcolor: '#4facfe20',
                            color: '#4facfe',
                            fontWeight: 600,
                            fontSize: '0.85rem'
                        }}
                    />
                    <Chip
                        label={`Promedio/categoría: ${formatCurrency(avgExpensePerCategory)}`}
                        sx={{
                            bgcolor: '#98D8C820',
                            color: '#98D8C8',
                            fontWeight: 600,
                            fontSize: '0.85rem'
                        }}
                    />
                </Stack>

                {/* Insight inteligente */}
                {insight && (
                    <Alert
                        severity={insight.type}
                        icon={insight.icon}
                        sx={{
                            mb: 2,
                            '& .MuiAlert-message': {
                                width: '100%'
                            }
                        }}
                    >
                        <AlertTitle sx={{ fontWeight: 700 }}>{insight.title}</AlertTitle>
                        {insight.message}
                    </Alert>
                )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={CustomLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                    >
                        {expensesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>

            {/* Leyenda personalizada mejorada */}
            <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mb: 1 }}>
                    Desglose Detallado por Categoría
                </Typography>
                <Stack spacing={1}>
                    {expensesByCategory.map((item, index) => {
                        const percentage = ((item.value / totalExpenses) * 100).toFixed(1);
                        const isAboveAverage = item.value > avgExpensePerCategory;
                        const isTop3 = index < 3;

                        return (
                            <Stack
                                key={index}
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: `${item.color}10`,
                                    border: isTop3 ? `2px solid ${item.color}` : '1px solid',
                                    borderColor: isTop3 ? item.color : 'divider',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    '&:hover': {
                                        bgcolor: `${item.color}20`,
                                        transform: 'translateX(4px)',
                                        boxShadow: `0 4px 12px ${item.color}40`
                                    }
                                }}
                            >
                                {/* Badge de posición para top 3 */}
                                {isTop3 && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: -8,
                                            left: 8,
                                            bgcolor: item.color,
                                            color: 'white',
                                            px: 1,
                                            py: 0.25,
                                            borderRadius: 1,
                                            fontSize: '0.65rem',
                                            fontWeight: 700
                                        }}
                                    >
                                        TOP {index + 1}
                                    </Box>
                                )}

                                <Stack direction="row" alignItems="center" spacing={1.5} flex={1}>
                                    <Avatar
                                        sx={{
                                            bgcolor: item.color,
                                            width: 40,
                                            height: 40,
                                            fontSize: '1.2rem',
                                            boxShadow: `0 2px 8px ${item.color}60`
                                        }}
                                    >
                                        {item.icon}
                                    </Avatar>
                                    <Box flex={1}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Typography variant="body2" fontWeight={600}>
                                                {item.name}
                                            </Typography>
                                            {isAboveAverage && (
                                                <Chip
                                                    label="Por encima del promedio"
                                                    size="small"
                                                    sx={{
                                                        bgcolor: '#FF9800',
                                                        color: 'white',
                                                        height: 18,
                                                        fontSize: '0.65rem',
                                                        fontWeight: 600,
                                                        '& .MuiChip-label': { px: 1 }
                                                    }}
                                                />
                                            )}
                                        </Stack>
                                        <Typography variant="caption" color="text.secondary">
                                            {((item.value / totalExpenses) * 100).toFixed(1)}% del total
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Stack alignItems="flex-end" spacing={0.5}>
                                    <Typography variant="h6" fontWeight={700} color={item.color}>
                                        {formatCurrency(item.value)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        vs promedio: {formatCurrency(avgExpensePerCategory)}
                                    </Typography>
                                </Stack>
                            </Stack>
                        );
                    })}
                </Stack>

                {/* Resumen final */}
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        💡 <strong>Interpretación:</strong>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        • Las categorías marcadas como TOP 3 representan el {top3Percentage}% de tus gastos totales
                        <br />
                        • {aboveAverageCategories.length} de {expensesByCategory.length} categorías están por encima del gasto promedio de {formatCurrency(avgExpensePerCategory)}
                        {topCategory && (
                            <>
                                <br />
                                • Tu mayor gasto es en {topCategory.icon} {topCategory.name} con {formatCurrency(topCategory.value)}
                            </>
                        )}
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
};
