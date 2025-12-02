import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, BUDGET_PERIODS } from '../constants';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Servicio para generar datos de resúmenes
 */
class SummaryService {
    /**
     * Genera datos para resumen diario
     */
    generateDailySummary(transactions, date = new Date()) {
        const startDate = startOfDay(date);
        const endDate = endOfDay(date);

        const dailyTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= startDate && tDate <= endDate;
        });

        const expenses = dailyTransactions.filter(t => t.type === 'expense');
        const income = dailyTransactions.filter(t => t.type === 'income');

        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
        const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
        const balance = totalIncome - totalExpenses;

        // Encontrar la categoría con mayor gasto
        let topCategory = null;
        if (expenses.length > 0) {
            const categoryTotals = {};
            expenses.forEach(t => {
                categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
            });

            const topCategoryId = Object.keys(categoryTotals).reduce((a, b) =>
                categoryTotals[a] > categoryTotals[b] ? a : b
            );

            const category = EXPENSE_CATEGORIES.find(c => c.id === topCategoryId);
            topCategory = {
                name: category?.name || topCategoryId,
                amount: categoryTotals[topCategoryId]
            };
        }

        return {
            date: format(date, "d 'de' MMMM 'de' yyyy", { locale: es }),
            totalExpenses,
            totalIncome,
            balance,
            transactionsCount: dailyTransactions.length,
            topCategory
        };
    }

    /**
     * Genera datos para resumen semanal
     */
    generateWeeklySummary(transactions, budgets, date = new Date()) {
        const startDate = startOfWeek(date, { weekStartsOn: 1 }); // Lunes
        const endDate = endOfWeek(date, { weekStartsOn: 1 }); // Domingo

        const weeklyTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= startDate && tDate <= endDate;
        });

        const expenses = weeklyTransactions.filter(t => t.type === 'expense');
        const income = weeklyTransactions.filter(t => t.type === 'income');

        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
        const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
        const balance = totalIncome - totalExpenses;

        // Calcular promedio diario
        const daysInPeriod = 7;
        const avgDailyExpense = totalExpenses / daysInPeriod;

        // Top categorías
        const categoryTotals = {};
        expenses.forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

        const topCategories = Object.entries(categoryTotals)
            .map(([categoryId, amount]) => {
                const category = EXPENSE_CATEGORIES.find(c => c.id === categoryId);
                return {
                    id: categoryId,
                    name: category?.name || categoryId,
                    amount
                };
            })
            .sort((a, b) => b.amount - a.amount);

        // Estado de presupuestos
        const budgetStatus = this.calculateBudgetStatus(budgets, transactions, date);

        return {
            weekStart: format(startDate, "d 'de' MMM", { locale: es }),
            weekEnd: format(endDate, "d 'de' MMM", { locale: es }),
            totalExpenses,
            totalIncome,
            balance,
            transactionsCount: weeklyTransactions.length,
            topCategories,
            avgDailyExpense,
            budgetStatus
        };
    }

    /**
     * Genera datos para resumen mensual
     */
    generateMonthlySummary(transactions, budgets, date = new Date()) {
        const startDate = startOfMonth(date);
        const endDate = endOfMonth(date);

        const monthlyTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= startDate && tDate <= endDate;
        });

        const expenses = monthlyTransactions.filter(t => t.type === 'expense');
        const income = monthlyTransactions.filter(t => t.type === 'income');

        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
        const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
        const balance = totalIncome - totalExpenses;

        // Calcular promedio diario
        const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const avgDailyExpense = totalExpenses / daysInMonth;

        // Top categorías
        const categoryTotals = {};
        expenses.forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

        const topCategories = Object.entries(categoryTotals)
            .map(([categoryId, amount]) => {
                const category = EXPENSE_CATEGORIES.find(c => c.id === categoryId);
                return {
                    id: categoryId,
                    name: category?.name || categoryId,
                    amount
                };
            })
            .sort((a, b) => b.amount - a.amount);

        // Estado de presupuestos
        const budgetStatus = this.calculateBudgetStatus(budgets, transactions, date);

        // Comparar con mes anterior
        const lastMonthDate = subMonths(date, 1);
        const lastMonthStart = startOfMonth(lastMonthDate);
        const lastMonthEnd = endOfMonth(lastMonthDate);

        const lastMonthExpenses = transactions
            .filter(t => {
                const tDate = new Date(t.date);
                return tDate >= lastMonthStart && tDate <= lastMonthEnd && t.type === 'expense';
            })
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            month: format(date, 'MMMM', { locale: es }),
            year: date.getFullYear(),
            totalExpenses,
            totalIncome,
            balance,
            transactionsCount: monthlyTransactions.length,
            topCategories,
            avgDailyExpense,
            budgetStatus,
            comparedToLastMonth: lastMonthExpenses
        };
    }

    /**
     * Calcula el estado de los presupuestos
     */
    calculateBudgetStatus(budgets, transactions, date = new Date()) {
        const currentYear = date.getFullYear();
        const currentMonth = date.getMonth();

        let onTrack = 0;
        let warning = 0;
        let exceeded = 0;

        budgets.forEach(budget => {
            if (!budget.enabled) return;

            // Solo considerar presupuestos del período actual
            if (budget.year !== currentYear) return;
            if (budget.period === BUDGET_PERIODS.MONTHLY && budget.month !== currentMonth) return;

            // Calcular gasto en el presupuesto
            const relevantTransactions = transactions.filter(t => {
                const tDate = new Date(t.date);
                const sameCategory = t.category === budget.categoryId;
                const sameYear = tDate.getFullYear() === budget.year;
                const sameMonth = budget.period === BUDGET_PERIODS.MONTHLY
                    ? tDate.getMonth() === budget.month
                    : true;

                return sameCategory && sameYear && sameMonth && t.type === 'expense';
            });

            const totalSpent = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
            const percentage = (totalSpent / budget.amount) * 100;

            if (percentage >= 100) {
                exceeded++;
            } else if (percentage >= 80) {
                warning++;
            } else {
                onTrack++;
            }
        });

        return { onTrack, warning, exceeded };
    }
}

// Exportar instancia única
export const summaryService = new SummaryService();
