import { createSlice } from '@reduxjs/toolkit';
import { LocalStorageService } from '../../services/localStorage.service';

/**
 * Estado inicial del slice de expenses
 */
const initialState = {
    isSaving: false,
    messageSaved: '',
    transactions: LocalStorageService.getExpenses(),
    active: null,
    filters: {
        type: null, // 'expense' | 'income' | null (todos)
        category: null,
        startDate: null,
        endDate: null,
        searchTerm: ''
    },
    statistics: {
        totalExpenses: 0,
        totalIncome: 0,
        balance: 0,
        expensesByCategory: [],
        monthlyTrend: []
    }
};

/**
 * Slice de Redux para manejar el estado de gastos e ingresos
 */
export const expensesSlice = createSlice({
    name: 'expenses',
    initialState,
    reducers: {
        /**
         * Indica que se está guardando una transacción
         */
        startSaving: (state) => {
            state.isSaving = true;
        },

        /**
         * Agrega una nueva transacción (gasto o ingreso)
         */
        addNewTransaction: (state, action) => {
            state.transactions.push(action.payload);
            state.isSaving = false;
            LocalStorageService.saveExpenses(state.transactions);
            state.messageSaved = `${action.payload.type === 'expense' ? 'Gasto' : 'Ingreso'} agregado correctamente`;
        },

        /**
         * Establece la transacción activa
         */
        setActiveTransaction: (state, action) => {
            state.active = action.payload;
            state.messageSaved = '';
        },

        /**
         * Establece todas las transacciones
         */
        setTransactions: (state, action) => {
            state.transactions = action.payload;
            LocalStorageService.saveExpenses(state.transactions);
        },

        /**
         * Actualiza una transacción existente
         */
        updateTransaction: (state, action) => {
            state.isSaving = false;
            state.transactions = state.transactions.map(transaction =>
                transaction.id === action.payload.id ? action.payload : transaction
            );
            LocalStorageService.saveExpenses(state.transactions);
            state.messageSaved = `Transacción actualizada correctamente`;
        },

        /**
         * Elimina una transacción por su ID
         */
        deleteTransactionById: (state, action) => {
            state.active = null;
            state.transactions = state.transactions.filter(transaction => transaction.id !== action.payload);
            LocalStorageService.saveExpenses(state.transactions);
            state.messageSaved = 'Transacción eliminada correctamente';
        },

        /**
         * Establece los filtros de búsqueda
         */
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },

        /**
         * Limpia todos los filtros
         */
        clearFilters: (state) => {
            state.filters = {
                type: null,
                category: null,
                startDate: null,
                endDate: null,
                searchTerm: ''
            };
        },

        /**
         * Actualiza las estadísticas calculadas
         */
        updateStatistics: (state, action) => {
            state.statistics = action.payload;
        },

        /**
         * Limpia todas las transacciones al cerrar sesión
         */
        clearTransactionsLogout: (state) => {
            state.isSaving = false;
            state.messageSaved = '';
            state.transactions = [];
            state.active = null;
            state.filters = initialState.filters;
            state.statistics = initialState.statistics;
            LocalStorageService.clearExpenses();
        },

        /**
         * Limpia el mensaje guardado
         */
        clearMessage: (state) => {
            state.messageSaved = '';
        }
    }
});

export const {
    startSaving,
    addNewTransaction,
    setActiveTransaction,
    setTransactions,
    updateTransaction,
    deleteTransactionById,
    setFilters,
    clearFilters,
    updateStatistics,
    clearTransactionsLogout,
    clearMessage
} = expensesSlice.actions;
