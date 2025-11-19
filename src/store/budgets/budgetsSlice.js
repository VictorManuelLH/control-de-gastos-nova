import { createSlice } from '@reduxjs/toolkit';
import { LocalStorageService } from '../../services/localStorage.service';
import { BUDGET_PERIODS } from '../../constants';

/**
 * Estado inicial del slice de presupuestos
 */
const initialState = {
    budgets: [],
    activeBudget: null,
    isSaving: false,
    messageSaved: '',
    // Configuración de alertas
    alerts: {
        enabled: true,
        threshold: 80 // Alertar al 80% del presupuesto
    }
};

/**
 * Slice de Redux para manejar el estado de presupuestos
 */
export const budgetsSlice = createSlice({
    name: 'budgets',
    initialState,
    reducers: {
        /**
         * Indica que se está guardando un presupuesto
         */
        startSaving: (state) => {
            state.isSaving = true;
        },

        /**
         * Agrega un nuevo presupuesto
         * @param {Object} action.payload - Presupuesto a agregar
         * @param {string} action.payload.id - ID único del presupuesto
         * @param {string} action.payload.categoryId - ID de la categoría
         * @param {number} action.payload.amount - Monto del presupuesto
         * @param {string} action.payload.period - Período (monthly, weekly, yearly)
         * @param {number} action.payload.year - Año del presupuesto
         * @param {number} action.payload.month - Mes del presupuesto (si aplica)
         */
        addBudget: (state, action) => {
            state.budgets.push(action.payload);
            state.isSaving = false;
            state.messageSaved = 'Presupuesto creado correctamente';
        },

        /**
         * Actualiza un presupuesto existente
         */
        updateBudget: (state, action) => {
            state.isSaving = false;
            state.budgets = state.budgets.map(budget =>
                budget.id === action.payload.id ? action.payload : budget
            );
            state.messageSaved = 'Presupuesto actualizado correctamente';
        },

        /**
         * Elimina un presupuesto por su ID
         */
        deleteBudget: (state, action) => {
            state.activeBudget = null;
            state.budgets = state.budgets.filter(budget => budget.id !== action.payload);
            state.messageSaved = 'Presupuesto eliminado correctamente';
        },

        /**
         * Establece el presupuesto activo
         */
        setActiveBudget: (state, action) => {
            state.activeBudget = action.payload;
            state.messageSaved = '';
        },

        /**
         * Establece todos los presupuestos
         */
        setBudgets: (state, action) => {
            state.budgets = action.payload;
        },

        /**
         * Actualiza la configuración de alertas
         */
        updateAlertSettings: (state, action) => {
            state.alerts = { ...state.alerts, ...action.payload };
        },

        /**
         * Limpia todos los presupuestos al cerrar sesión
         */
        clearBudgetsLogout: (state) => {
            state.budgets = [];
            state.activeBudget = null;
            state.isSaving = false;
            state.messageSaved = '';
        },

        /**
         * Limpia el mensaje guardado
         */
        clearMessage: (state) => {
            state.messageSaved = '';
        },

        /**
         * Obtiene el presupuesto de una categoría específica para un período
         * @param {Object} action.payload
         * @param {string} action.payload.categoryId - ID de la categoría
         * @param {number} action.payload.year - Año
         * @param {number} action.payload.month - Mes
         */
        getBudgetForCategory: (state, action) => {
            const { categoryId, year, month } = action.payload;
            const budget = state.budgets.find(b =>
                b.categoryId === categoryId &&
                b.year === year &&
                (b.period === BUDGET_PERIODS.MONTHLY ? b.month === month : true)
            );
            state.activeBudget = budget || null;
        }
    }
});

export const {
    startSaving,
    addBudget,
    updateBudget,
    deleteBudget,
    setActiveBudget,
    setBudgets,
    updateAlertSettings,
    clearBudgetsLogout,
    clearMessage,
    getBudgetForCategory
} = budgetsSlice.actions;
