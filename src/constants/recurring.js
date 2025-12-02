/**
 * Constantes para gastos recurrentes / suscripciones
 */

// Frecuencias de recurrencia
export const RECURRING_FREQUENCIES = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    BIWEEKLY: 'biweekly',
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    BIANNUAL: 'biannual',
    YEARLY: 'yearly'
};

// Metadata de frecuencias
export const FREQUENCY_METADATA = {
    [RECURRING_FREQUENCIES.DAILY]: {
        id: RECURRING_FREQUENCIES.DAILY,
        name: 'Diario',
        shortName: 'Día',
        icon: '📅',
        days: 1,
        description: 'Cada día'
    },
    [RECURRING_FREQUENCIES.WEEKLY]: {
        id: RECURRING_FREQUENCIES.WEEKLY,
        name: 'Semanal',
        shortName: 'Semana',
        icon: '📆',
        days: 7,
        description: 'Cada semana'
    },
    [RECURRING_FREQUENCIES.BIWEEKLY]: {
        id: RECURRING_FREQUENCIES.BIWEEKLY,
        name: 'Quincenal',
        shortName: 'Quincena',
        icon: '📋',
        days: 15,
        description: 'Cada 15 días'
    },
    [RECURRING_FREQUENCIES.MONTHLY]: {
        id: RECURRING_FREQUENCIES.MONTHLY,
        name: 'Mensual',
        shortName: 'Mes',
        icon: '🗓️',
        days: 30,
        description: 'Cada mes'
    },
    [RECURRING_FREQUENCIES.QUARTERLY]: {
        id: RECURRING_FREQUENCIES.QUARTERLY,
        name: 'Trimestral',
        shortName: 'Trimestre',
        icon: '📊',
        days: 90,
        description: 'Cada 3 meses'
    },
    [RECURRING_FREQUENCIES.BIANNUAL]: {
        id: RECURRING_FREQUENCIES.BIANNUAL,
        name: 'Semestral',
        shortName: 'Semestre',
        icon: '📈',
        days: 180,
        description: 'Cada 6 meses'
    },
    [RECURRING_FREQUENCIES.YEARLY]: {
        id: RECURRING_FREQUENCIES.YEARLY,
        name: 'Anual',
        shortName: 'Año',
        icon: '📅',
        days: 365,
        description: 'Cada año'
    }
};

// Estado de gastos recurrentes
export const RECURRING_STATUS = {
    ACTIVE: 'active',
    PAUSED: 'paused',
    CANCELLED: 'cancelled'
};

// Categorías comunes de suscripciones (para sugerencias)
export const COMMON_SUBSCRIPTIONS = [
    { name: 'Netflix', category: 'entretenimiento', avgAmount: 139, icon: '📺' },
    { name: 'Spotify', category: 'entretenimiento', avgAmount: 115, icon: '🎵' },
    { name: 'Disney+', category: 'entretenimiento', avgAmount: 159, icon: '🎬' },
    { name: 'Amazon Prime', category: 'entretenimiento', avgAmount: 99, icon: '📦' },
    { name: 'YouTube Premium', category: 'entretenimiento', avgAmount: 99, icon: '▶️' },
    { name: 'Gimnasio', category: 'salud', avgAmount: 600, icon: '🏋️' },
    { name: 'Internet', category: 'servicios', avgAmount: 500, icon: '🌐' },
    { name: 'Teléfono', category: 'servicios', avgAmount: 300, icon: '📱' },
    { name: 'Luz', category: 'servicios', avgAmount: 400, icon: '💡' },
    { name: 'Agua', category: 'servicios', avgAmount: 200, icon: '💧' },
    { name: 'Gas', category: 'servicios', avgAmount: 300, icon: '🔥' },
    { name: 'Renta', category: 'vivienda', avgAmount: 8000, icon: '🏠' },
    { name: 'Seguro de Auto', category: 'transporte', avgAmount: 1200, icon: '🚗' },
    { name: 'PlayStation Plus', category: 'entretenimiento', avgAmount: 150, icon: '🎮' },
    { name: 'Xbox Game Pass', category: 'entretenimiento', avgAmount: 149, icon: '🎮' },
    { name: 'iCloud', category: 'servicios', avgAmount: 39, icon: '☁️' },
    { name: 'Dropbox', category: 'servicios', avgAmount: 99, icon: '📂' }
];

// Días de anticipación para recordatorios
export const REMINDER_DAYS_BEFORE = 2;

// Storage key
export const STORAGE_KEYS = {
    RECURRING: 'recurring_expenses',
    LAST_CHECK: 'recurring_last_check'
};
