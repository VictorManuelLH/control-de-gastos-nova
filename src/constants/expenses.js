/**
 * Tipos de transacciones
 */
export const TRANSACTION_TYPES = {
    EXPENSE: 'expense',
    INCOME: 'income'
};

/**
 * Categorías de gastos con íconos
 */
export const EXPENSE_CATEGORIES = [
    { id: 'alimentacion', name: 'Alimentación', icon: '🍔', color: '#FF6B6B' },
    { id: 'transporte', name: 'Transporte', icon: '🚗', color: '#4ECDC4' },
    { id: 'vivienda', name: 'Vivienda', icon: '🏠', color: '#45B7D1' },
    { id: 'servicios', name: 'Servicios', icon: '💡', color: '#FFA07A' },
    { id: 'entretenimiento', name: 'Entretenimiento', icon: '🎮', color: '#98D8C8' },
    { id: 'ropa', name: 'Ropa', icon: '👕', color: '#F7B731' },
    { id: 'salud', name: 'Salud', icon: '💊', color: '#5F27CD' },
    { id: 'educacion', name: 'Educación', icon: '📚', color: '#00D2D3' },
    { id: 'otros', name: 'Otros', icon: '💰', color: '#A8A8A8' }
];

/**
 * Categorías de ingresos con íconos
 */
export const INCOME_CATEGORIES = [
    { id: 'salario', name: 'Salario', icon: '💼', color: '#2ECC71' },
    { id: 'freelance', name: 'Freelance', icon: '💻', color: '#3498DB' },
    { id: 'negocio', name: 'Negocio', icon: '🏢', color: '#9B59B6' },
    { id: 'inversion', name: 'Inversión', icon: '📈', color: '#1ABC9C' },
    { id: 'regalo', name: 'Regalo', icon: '🎁', color: '#E74C3C' },
    { id: 'otros_ingresos', name: 'Otros', icon: '💵', color: '#95A5A6' }
];

/**
 * Períodos de tiempo para filtros y estadísticas
 */
export const TIME_PERIODS = {
    WEEK: 'week',
    MONTH: 'month',
    QUARTER: 'quarter',
    YEAR: 'year',
    CUSTOM: 'custom'
};

/**
 * Estados de metas financieras
 */
export const GOAL_STATUS = {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};

/**
 * Obtiene una categoría por su ID
 */
export const getCategoryById = (categoryId, type = TRANSACTION_TYPES.EXPENSE) => {
    const categories = type === TRANSACTION_TYPES.EXPENSE
        ? EXPENSE_CATEGORIES
        : INCOME_CATEGORIES;

    return categories.find(cat => cat.id === categoryId) || categories[categories.length - 1];
};
