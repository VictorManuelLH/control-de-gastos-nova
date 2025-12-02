/**
 * Servicio de Telegram para enviar notificaciones
 */

class TelegramService {
    constructor() {
        this.botToken = null;
        this.chatId = null;
        this.baseUrl = 'https://api.telegram.org/bot';
    }

    /**
     * Configura las credenciales de Telegram
     */
    configure(botToken, chatId) {
        this.botToken = botToken;
        this.chatId = chatId;

        // Guardar en localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('telegram_bot_token', botToken);
            localStorage.setItem('telegram_chat_id', chatId);
        }
    }

    /**
     * Carga la configuración desde localStorage
     */
    loadConfig() {
        if (typeof window !== 'undefined') {
            this.botToken = localStorage.getItem('telegram_bot_token');
            this.chatId = localStorage.getItem('telegram_chat_id');
        }
        return this.isConfigured();
    }

    /**
     * Verifica si Telegram está configurado
     */
    isConfigured() {
        return !!(this.botToken && this.chatId);
    }

    /**
     * Limpia la configuración
     */
    clearConfig() {
        this.botToken = null;
        this.chatId = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('telegram_bot_token');
            localStorage.removeItem('telegram_chat_id');
        }
    }

    /**
     * Envía un mensaje de texto a Telegram
     */
    async sendMessage(text, parseMode = 'HTML') {
        if (!this.isConfigured()) {
            console.warn('⚠️ Telegram no está configurado');
            return { success: false, error: 'No configurado' };
        }

        try {
            const url = `${this.baseUrl}${this.botToken}/sendMessage`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: this.chatId,
                    text: text,
                    parse_mode: parseMode,
                }),
            });

            const data = await response.json();

            if (data.ok) {
                console.log('✅ Mensaje enviado a Telegram');
                return { success: true, data };
            } else {
                console.error('❌ Error al enviar mensaje:', data);
                return { success: false, error: data.description };
            }
        } catch (error) {
            console.error('❌ Error de red al enviar mensaje:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Prueba la conexión con Telegram
     */
    async testConnection() {
        if (!this.isConfigured()) {
            return { success: false, error: 'No configurado' };
        }

        try {
            const url = `${this.baseUrl}${this.botToken}/getMe`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.ok) {
                console.log('✅ Conexión exitosa con bot:', data.result.username);
                return {
                    success: true,
                    botName: data.result.first_name,
                    botUsername: data.result.username
                };
            } else {
                return { success: false, error: data.description };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Formatea moneda para mensajes
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    }

    /**
     * Envía alerta de presupuesto
     */
    async sendBudgetAlert(budgetData) {
        const { category, budget, spent, percentage, remaining } = budgetData;

        let emoji = '⚠️';
        let level = 'ADVERTENCIA';

        if (percentage >= 100) {
            emoji = '🚨';
            level = 'EXCEDIDO';
        } else if (percentage >= 90) {
            emoji = '🔴';
            level = 'CRÍTICO';
        }

        const message = `
${emoji} <b>ALERTA DE PRESUPUESTO - ${level}</b>

📊 Categoría: <b>${category}</b>
💰 Presupuesto: ${this.formatCurrency(budget)}
💸 Gastado: ${this.formatCurrency(spent)} (${percentage.toFixed(1)}%)
🔋 Restante: ${this.formatCurrency(remaining)}

${percentage >= 100
    ? '❌ Has excedido tu presupuesto. Revisa tus gastos.'
    : percentage >= 90
        ? '⚠️ Estás muy cerca del límite. Modera tus gastos.'
        : '📝 Intenta no exceder el presupuesto restante.'
}
        `.trim();

        return this.sendMessage(message);
    }

    /**
     * Envía resumen diario
     */
    async sendDailySummary(summaryData) {
        const { date, totalExpenses, totalIncome, balance, transactionsCount, topCategory } = summaryData;

        const balanceEmoji = balance >= 0 ? '✅' : '❌';
        const balanceText = balance >= 0 ? 'Positivo' : 'Negativo';

        const message = `
📊 <b>RESUMEN DEL DÍA</b>
📅 ${date}

💰 Ingresos: ${this.formatCurrency(totalIncome)}
💸 Gastos: ${this.formatCurrency(totalExpenses)}
${balanceEmoji} Balance: ${this.formatCurrency(balance)} (${balanceText})

📝 Transacciones: ${transactionsCount}
${topCategory ? `🔝 Mayor gasto: ${topCategory.name} (${this.formatCurrency(topCategory.amount)})` : ''}

${balance >= 0
    ? '🎉 ¡Buen trabajo! Tuviste un día con balance positivo.'
    : '💡 Recuerda controlar tus gastos para mantener el balance.'
}
        `.trim();

        return this.sendMessage(message);
    }

    /**
     * Envía resumen semanal
     */
    async sendWeeklySummary(summaryData) {
        const {
            weekStart,
            weekEnd,
            totalExpenses,
            totalIncome,
            balance,
            transactionsCount,
            topCategories,
            avgDailyExpense,
            budgetStatus
        } = summaryData;

        const balanceEmoji = balance >= 0 ? '✅' : '❌';
        const balanceText = balance >= 0 ? 'Positivo' : 'Negativo';

        let categoriesText = '';
        if (topCategories && topCategories.length > 0) {
            categoriesText = '\n\n📊 <b>Top 3 Categorías de Gastos:</b>\n';
            topCategories.slice(0, 3).forEach((cat, index) => {
                categoriesText += `${index + 1}. ${cat.name}: ${this.formatCurrency(cat.amount)}\n`;
            });
        }

        let budgetText = '';
        if (budgetStatus && budgetStatus.exceeded > 0) {
            budgetText = `\n⚠️ <b>${budgetStatus.exceeded}</b> presupuesto(s) excedido(s)`;
        }

        const message = `
📈 <b>RESUMEN SEMANAL</b>
📅 Del ${weekStart} al ${weekEnd}

💰 Ingresos: ${this.formatCurrency(totalIncome)}
💸 Gastos: ${this.formatCurrency(totalExpenses)}
${balanceEmoji} Balance: ${this.formatCurrency(balance)} (${balanceText})

📊 Promedio diario: ${this.formatCurrency(avgDailyExpense || 0)}
📝 Transacciones: ${transactionsCount}${categoriesText}${budgetText}

${balance >= 0
    ? '🎉 ¡Excelente semana! Mantén el control de tus finanzas.'
    : '💡 Considera revisar tus gastos para la próxima semana.'
}
        `.trim();

        return this.sendMessage(message);
    }

    /**
     * Envía resumen mensual
     */
    async sendMonthlySummary(summaryData) {
        const {
            month,
            year,
            totalExpenses,
            totalIncome,
            balance,
            transactionsCount,
            topCategories,
            avgDailyExpense,
            budgetStatus,
            comparedToLastMonth
        } = summaryData;

        const balanceEmoji = balance >= 0 ? '✅' : '❌';
        const balanceText = balance >= 0 ? 'Positivo' : 'Negativo';

        let categoriesText = '';
        if (topCategories && topCategories.length > 0) {
            categoriesText = '\n\n📊 <b>Top 5 Categorías:</b>\n';
            topCategories.slice(0, 5).forEach((cat, index) => {
                const emoji = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][index];
                categoriesText += `${emoji} ${cat.name}: ${this.formatCurrency(cat.amount)}\n`;
            });
        }

        let budgetText = '';
        if (budgetStatus) {
            budgetText = `\n\n💰 <b>Estado de Presupuestos:</b>\n`;
            budgetText += `✅ En control: ${budgetStatus.onTrack || 0}\n`;
            budgetText += `⚠️ En alerta: ${budgetStatus.warning || 0}\n`;
            budgetText += `🚨 Excedidos: ${budgetStatus.exceeded || 0}`;
        }

        let comparisonText = '';
        if (comparedToLastMonth) {
            const diff = totalExpenses - comparedToLastMonth;
            const emoji = diff > 0 ? '📈' : '📉';
            const action = diff > 0 ? 'aumentaron' : 'disminuyeron';
            comparisonText = `\n\n${emoji} Los gastos ${action} ${this.formatCurrency(Math.abs(diff))} vs. mes anterior`;
        }

        const message = `
📆 <b>RESUMEN MENSUAL</b>
🗓️ ${month} ${year}

💰 Ingresos totales: ${this.formatCurrency(totalIncome)}
💸 Gastos totales: ${this.formatCurrency(totalExpenses)}
${balanceEmoji} Balance final: ${this.formatCurrency(balance)} (${balanceText})

📊 Promedio diario: ${this.formatCurrency(avgDailyExpense || 0)}
📝 Total de transacciones: ${transactionsCount}${categoriesText}${budgetText}${comparisonText}

${balance >= 0
    ? '🎉 ¡Excelente mes! Tus finanzas están en buen estado.'
    : '💡 Considera ajustar tus presupuestos para el próximo mes.'
}
        `.trim();

        return this.sendMessage(message);
    }

    /**
     * Envía notificación de nueva transacción
     */
    async sendTransactionNotification(transactionData) {
        const { type, amount, category, description } = transactionData;

        const typeEmoji = type === 'expense' ? '💸' : '💰';
        const typeText = type === 'expense' ? 'Gasto registrado' : 'Ingreso registrado';

        const message = `
${typeEmoji} <b>${typeText.toUpperCase()}</b>

📁 Categoría: ${category}
💵 Monto: ${this.formatCurrency(amount)}
${description ? `📝 ${description}` : ''}

✅ Transacción guardada exitosamente.
        `.trim();

        return this.sendMessage(message);
    }
}

// Exportar instancia única
export const telegramService = new TelegramService();
