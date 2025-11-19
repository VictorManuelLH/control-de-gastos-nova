import { createSlice } from '@reduxjs/toolkit';
import { AUTH_STATUS } from '../../constants';

/**
 * Slice de Redux para manejar el estado de autenticación
 */
export const authSlice = createSlice({
    name: 'auth',
    initialState: {
        status: AUTH_STATUS.CHECKING,
        uid: null,
        email: null,
        displayName: null,
        photoURL: null,
        errorMessage: null
    },
    reducers: {
        /**
         * Acción para iniciar sesión
         */
        login: (state, { payload }) => {
            state.status = AUTH_STATUS.AUTHENTICATED;
            state.uid = payload.uid;
            state.email = payload.email;
            state.displayName = payload.displayName;
            state.photoURL = payload.photoURL;
            state.errorMessage = null;
        },
        /**
         * Acción para cerrar sesión
         */
        logout: (state, { payload }) => {
            state.status = AUTH_STATUS.NOT_AUTHENTICATED;
            state.uid = null;
            state.email = null;
            state.displayName = null;
            state.photoURL = null;
            state.errorMessage = payload?.errorMessage;
        },
        /**
         * Acción para indicar que se están verificando las credenciales
         */
        checkingCredentials: (state) => {
            state.status = AUTH_STATUS.CHECKING;
        },
    }
});

// Exportar las acciones
export const { login, logout, checkingCredentials } = authSlice.actions;

// Mantener exportación legacy por compatibilidad
export const checkingCredentiales = checkingCredentials;