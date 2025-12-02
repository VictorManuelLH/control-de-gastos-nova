/**
 * Servicio para rastrear notificaciones enviadas y evitar duplicados
 */

const TRACKING_KEYS = {
    BUDGET_ALERTS: 'notification_budget_alerts',
    TRANSACTION_NOTIFICATIONS: 'notification_transactions',
    SUMMARIES: 'notification_summaries',
    PREFERENCES: 'notification_preferences'
};

// Umbrales de alerta de presupuesto
export const BUDGET_THRESHOLDS = {
    WARNING: 80,
    CRITICAL: 90,
    EXCEEDED: 100
};

/**
 * Configuración por defecto de notificaciones
 */
const DEFAULT_PREFERENCES = {
    budgetAlerts: {
        enabled: true,
        thresholds: {
            80: true,  // Alertar al 80%
            90: true,  // Alertar al 90%
            100: true  // Alertar al 100%
        }
    },
    transactionNotifications: {
        enabled: true,
        minAmount: 100, // Monto mínimo para notificar
        notifyExpenses: true,
        notifyIncome: true
    },
    summaries: {
        daily: {
            enabled: false,
            time: '20:00' // 8 PM
        },
        weekly: {
            enabled: false,
            day: 0, // Domingo
            time: '18:00'
        },
        monthly: {
            enabled: false,
            day: 1, // Día 1 del mes
            time: '18:00'
        }
    }
};

class NotificationTrackingService {
    constructor() {
        this.init();
    }

    init() {
        // Inicializar preferencias si no existen
        if (!localStorage.getItem(TRACKING_KEYS.PREFERENCES)) {
            this.savePreferences(DEFAULT_PREFERENCES);
        }
    }

    /**
     * Obtiene las preferencias de notificaciones
     */
    getPreferences() {
        try {
            const prefs = localStorage.getItem(TRACKING_KEYS.PREFERENCES);
            return prefs ? JSON.parse(prefs) : DEFAULT_PREFERENCES;
        } catch (error) {
            console.error('Error al leer preferencias:', error);
            return DEFAULT_PREFERENCES;
        }
    }

    /**
     * Guarda las preferencias de notificaciones
     */
    savePreferences(preferences) {
        try {
            localStorage.setItem(TRACKING_KEYS.PREFERENCES, JSON.stringify(preferences));
            console.log('✅ Preferencias de notificaciones guardadas');
        } catch (error) {
            console.error('❌ Error al guardar preferencias:', error);
        }
    }

    /**
     * Actualiza preferencias específicas
     */
    updatePreferences(updates) {
        const currentPrefs = this.getPreferences();
        const newPrefs = { ...currentPrefs, ...updates };
        this.savePreferences(newPrefs);
        return newPrefs;
    }

    /**
     * Genera una clave única para alertas de presupuesto
     */
    generateBudgetAlertKey(budgetId, threshold) {
        return `${budgetId}_${threshold}`;
    }

    /**
     * Verifica si ya se envió una alerta de presupuesto para un umbral específico
     */
    wasBudgetAlertSent(budgetId, threshold) {
        try {
            const alerts = localStorage.getItem(TRACKING_KEYS.BUDGET_ALERTS);
            if (!alerts) return false;

            const alertsMap = JSON.parse(alerts);
            const key = this.generateBudgetAlertKey(budgetId, threshold);

            return !!alertsMap[key];
        } catch (error) {
            console.error('Error al verificar alerta:', error);
            return false;
        }
    }

    /**
     * Marca una alerta de presupuesto como enviada
     */
    markBudgetAlertAsSent(budgetId, threshold, percentage) {
        try {
            const alerts = localStorage.getItem(TRACKING_KEYS.BUDGET_ALERTS);
            const alertsMap = alerts ? JSON.parse(alerts) : {};

            const key = this.generateBudgetAlertKey(budgetId, threshold);
            alertsMap[key] = {
                sentAt: new Date().toISOString(),
                percentage: percentage,
                threshold: threshold
            };

            localStorage.setItem(TRACKING_KEYS.BUDGET_ALERTS, JSON.stringify(alertsMap));
            console.log(`✅ Alerta de presupuesto marcada: ${key}`);
        } catch (error) {
            console.error('Error al marcar alerta:', error);
        }
    }

    /**
     * Limpia alertas de presupuesto cuando el porcentaje baja
     * (por ejemplo, si se elimina una transacción)
     */
    resetBudgetAlerts(budgetId, currentPercentage) {
        try {
            const alerts = localStorage.getItem(TRACKING_KEYS.BUDGET_ALERTS);
            if (!alerts) return;

            const alertsMap = JSON.parse(alerts);
            let modified = false;

            // Limpiar alertas de umbrales superiores al porcentaje actual
            Object.values(BUDGET_THRESHOLDS).forEach(threshold => {
                if (currentPercentage < threshold) {
                    const key = this.generateBudgetAlertKey(budgetId, threshold);
                    if (alertsMap[key]) {
                        delete alertsMap[key];
                        modified = true;
                        console.log(`🔄 Alerta resetada: ${key}`);
                    }
                }
            });

            if (modified) {
                localStorage.setItem(TRACKING_KEYS.BUDGET_ALERTS, JSON.stringify(alertsMap));
            }
        } catch (error) {
            console.error('Error al resetear alertas:', error);
        }
    }

    /**
     * Verifica si se debe enviar alerta de presupuesto
     */
    shouldSendBudgetAlert(budgetId, percentage) {
        const prefs = this.getPreferences();

        if (!prefs.budgetAlerts.enabled) {
            return { shouldSend: false, threshold: null };
        }

        // Determinar el umbral cruzado
        let threshold = null;

        if (percentage >= BUDGET_THRESHOLDS.EXCEEDED && prefs.budgetAlerts.thresholds[100]) {
            threshold = BUDGET_THRESHOLDS.EXCEEDED;
        } else if (percentage >= BUDGET_THRESHOLDS.CRITICAL && prefs.budgetAlerts.thresholds[90]) {
            threshold = BUDGET_THRESHOLDS.CRITICAL;
        } else if (percentage >= BUDGET_THRESHOLDS.WARNING && prefs.budgetAlerts.thresholds[80]) {
            threshold = BUDGET_THRESHOLDS.WARNING;
        }

        if (!threshold) {
            return { shouldSend: false, threshold: null };
        }

        // Verificar si ya se envió esta alerta
        const alreadySent = this.wasBudgetAlertSent(budgetId, threshold);

        return {
            shouldSend: !alreadySent,
            threshold: threshold
        };
    }

    /**
     * Verifica si se debe enviar notificación de transacción
     */
    shouldSendTransactionNotification(transaction) {
        const prefs = this.getPreferences();

        if (!prefs.transactionNotifications.enabled) {
            return false;
        }

        if (transaction.amount < prefs.transactionNotifications.minAmount) {
            return false;
        }

        if (transaction.type === 'expense' && !prefs.transactionNotifications.notifyExpenses) {
            return false;
        }

        if (transaction.type === 'income' && !prefs.transactionNotifications.notifyIncome) {
            return false;
        }

        return true;
    }

    /**
     * Registra el último resumen enviado
     */
    markSummaryAsSent(type) {
        try {
            const summaries = localStorage.getItem(TRACKING_KEYS.SUMMARIES);
            const summariesMap = summaries ? JSON.parse(summaries) : {};

            summariesMap[type] = {
                sentAt: new Date().toISOString(),
                date: new Date().toLocaleDateString('es-MX')
            };

            localStorage.setItem(TRACKING_KEYS.SUMMARIES, JSON.stringify(summariesMap));
            console.log(`✅ Resumen ${type} marcado como enviado`);
        } catch (error) {
            console.error('Error al marcar resumen:', error);
        }
    }

    /**
     * Verifica si ya se envió un resumen hoy
     */
    wasSummarySentToday(type) {
        try {
            const summaries = localStorage.getItem(TRACKING_KEYS.SUMMARIES);
            if (!summaries) return false;

            const summariesMap = JSON.parse(summaries);
            const summary = summariesMap[type];

            if (!summary) return false;

            const today = new Date().toLocaleDateString('es-MX');
            return summary.date === today;
        } catch (error) {
            console.error('Error al verificar resumen:', error);
            return false;
        }
    }

    /**
     * Limpia el tracking de todas las notificaciones
     */
    clearAllTracking() {
        localStorage.removeItem(TRACKING_KEYS.BUDGET_ALERTS);
        localStorage.removeItem(TRACKING_KEYS.TRANSACTION_NOTIFICATIONS);
        localStorage.removeItem(TRACKING_KEYS.SUMMARIES);
        console.log('🗑️ Tracking de notificaciones limpiado');
    }

    /**
     * Limpia solo las alertas de presupuesto
     */
    clearBudgetAlerts() {
        localStorage.removeItem(TRACKING_KEYS.BUDGET_ALERTS);
        console.log('🗑️ Alertas de presupuesto limpiadas');
    }

    /**
     * Obtiene estadísticas de notificaciones enviadas
     */
    getNotificationStats() {
        try {
            const budgetAlerts = localStorage.getItem(TRACKING_KEYS.BUDGET_ALERTS);
            const summaries = localStorage.getItem(TRACKING_KEYS.SUMMARIES);

            const budgetAlertsCount = budgetAlerts
                ? Object.keys(JSON.parse(budgetAlerts)).length
                : 0;

            const summariesData = summaries ? JSON.parse(summaries) : {};

            return {
                totalBudgetAlerts: budgetAlertsCount,
                lastDailySummary: summariesData.daily?.sentAt || null,
                lastWeeklySummary: summariesData.weekly?.sentAt || null,
                lastMonthlySummary: summariesData.monthly?.sentAt || null
            };
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            return {
                totalBudgetAlerts: 0,
                lastDailySummary: null,
                lastWeeklySummary: null,
                lastMonthlySummary: null
            };
        }
    }
}

// Exportar instancia única
export const notificationTrackingService = new NotificationTrackingService();
