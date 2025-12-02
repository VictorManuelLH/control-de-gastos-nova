import { createSlice } from '@reduxjs/toolkit';
import { RECURRING_STATUS } from '../../constants';

/**
 * Estado inicial del slice de gastos recurrentes
 */
const initialState = {
    recurrings: [],
    activeRecurring: null,
    isSaving: false,
    messageSaved: '',
    upcomingRecurrings: [], // Gastos próximos a vencer
    lastCheckDate: null
};

/**
 * Slice de Redux para manejar gastos recurrentes / suscripciones
 */
export const recurringSlice = createSlice({
    name: 'recurring',
    initialState,
    reducers: {
        /**
         * Indica que se está guardando un gasto recurrente
         */
        startSaving: (state) => {
            state.isSaving = true;
        },

        /**
         * Agrega un nuevo gasto recurrente
         */
        addRecurring: (state, action) => {
            state.recurrings.push(action.payload);
            state.isSaving = false;
            state.messageSaved = 'Gasto recurrente creado correctamente';
        },

        /**
         * Actualiza un gasto recurrente existente
         */
        updateRecurring: (state, action) => {
            state.isSaving = false;
            state.recurrings = state.recurrings.map(recurring =>
                recurring.id === action.payload.id ? action.payload : recurring
            );
            state.messageSaved = 'Gasto recurrente actualizado correctamente';
        },

        /**
         * Elimina un gasto recurrente por su ID
         */
        deleteRecurring: (state, action) => {
            state.activeRecurring = null;
            state.recurrings = state.recurrings.filter(recurring => recurring.id !== action.payload);
            state.messageSaved = 'Gasto recurrente eliminado correctamente';
        },

        /**
         * Establece el gasto recurrente activo
         */
        setActiveRecurring: (state, action) => {
            state.activeRecurring = action.payload;
            state.messageSaved = '';
        },

        /**
         * Establece todos los gastos recurrentes
         */
        setRecurrings: (state, action) => {
            state.recurrings = action.payload;
        },

        /**
         * Pausa un gasto recurrente (cambia estado a paused)
         */
        pauseRecurring: (state, action) => {
            state.recurrings = state.recurrings.map(recurring =>
                recurring.id === action.payload
                    ? { ...recurring, status: RECURRING_STATUS.PAUSED }
                    : recurring
            );
            state.messageSaved = 'Gasto recurrente pausado';
        },

        /**
         * Reactiva un gasto recurrente pausado
         */
        resumeRecurring: (state, action) => {
            state.recurrings = state.recurrings.map(recurring =>
                recurring.id === action.payload
                    ? { ...recurring, status: RECURRING_STATUS.ACTIVE }
                    : recurring
            );
            state.messageSaved = 'Gasto recurrente reactivado';
        },

        /**
         * Cancela un gasto recurrente (marca como cancelado)
         */
        cancelRecurring: (state, action) => {
            state.recurrings = state.recurrings.map(recurring =>
                recurring.id === action.payload
                    ? { ...recurring, status: RECURRING_STATUS.CANCELLED }
                    : recurring
            );
            state.messageSaved = 'Gasto recurrente cancelado';
        },

        /**
         * Actualiza la próxima fecha de un gasto recurrente
         */
        updateNextDate: (state, action) => {
            const { id, nextDate } = action.payload;
            state.recurrings = state.recurrings.map(recurring =>
                recurring.id === id
                    ? { ...recurring, nextDate, lastProcessedDate: new Date().getTime() }
                    : recurring
            );
        },

        /**
         * Actualiza la lista de gastos próximos a vencer
         */
        setUpcomingRecurrings: (state, action) => {
            state.upcomingRecurrings = action.payload;
        },

        /**
         * Actualiza la fecha del último chequeo
         */
        setLastCheckDate: (state, action) => {
            state.lastCheckDate = action.payload;
        },

        /**
         * Limpia todos los gastos recurrentes al cerrar sesión
         */
        clearRecurringsLogout: (state) => {
            state.recurrings = [];
            state.activeRecurring = null;
            state.isSaving = false;
            state.messageSaved = '';
            state.upcomingRecurrings = [];
            state.lastCheckDate = null;
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
    addRecurring,
    updateRecurring,
    deleteRecurring,
    setActiveRecurring,
    setRecurrings,
    pauseRecurring,
    resumeRecurring,
    cancelRecurring,
    updateNextDate,
    setUpcomingRecurrings,
    setLastCheckDate,
    clearRecurringsLogout,
    clearMessage
} = recurringSlice.actions;
