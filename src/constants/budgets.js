
/**
 * Estados de alerta del presupuesto
 */
export const BUDGET_STATUS = {
    SAFE: 'safe',           // 0-70%
    WARNING: 'warning',     // 71-90%
    DANGER: 'danger',       // 91-100%
    EXCEEDED: 'exceeded'    // >100%
};

/**
 * Colores para cada estado del presupuesto
 */
export const BUDGET_COLORS = {
    [BUDGET_STATUS.SAFE]: '#4CAF50',
    [BUDGET_STATUS.WARNING]: '#FF9800',
    [BUDGET_STATUS.DANGER]: '#F44336',
    [BUDGET_STATUS.EXCEEDED]: '#D32F2F'
};

/**
 * Mensajes de alerta según el estado
 */
export const BUDGET_MESSAGES = {
    [BUDGET_STATUS.SAFE]: 'Vas muy bien',
    [BUDGET_STATUS.WARNING]: '¡Cuidado! Te estás acercando al límite',
    [BUDGET_STATUS.DANGER]: '¡Alerta! Estás cerca del límite',
    [BUDGET_STATUS.EXCEEDED]: '¡Presupuesto excedido!'
};

/**
 * Íconos para cada estado
 */
export const BUDGET_ICONS = {
    [BUDGET_STATUS.SAFE]: '✅',
    [BUDGET_STATUS.WARNING]: '⚠️',
    [BUDGET_STATUS.DANGER]: '🚨',
    [BUDGET_STATUS.EXCEEDED]: '❌'
};

export const getBudgetStatus = (percentage) => {
    if (percentage > 100) return BUDGET_STATUS.EXCEEDED;
    if (percentage > 90) return BUDGET_STATUS.DANGER;
    if (percentage > 70) return BUDGET_STATUS.WARNING;
    return BUDGET_STATUS.SAFE;
};

export const calculateBudgetPercentage = (spent, budget) => {
    if (budget === 0) return 0;
    return Math.round((spent / budget) * 100);
};

/**
 * Períodos de presupuesto disponibles
 */
export const BUDGET_PERIODS = {
    MONTHLY: 'monthly',
    WEEKLY: 'weekly',
    YEARLY: 'yearly'
};

/**
 * Configuración por defecto para nuevos presupuestos
 */
export const DEFAULT_BUDGET = {
    amount: 0,
    period: BUDGET_PERIODS.MONTHLY,
    alertAt: 80,
    enabled: true
};
