import {
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    updateProfile
} from "firebase/auth";
import { firebaseAuth } from "./config";
import { FIREBASE_ERROR_MESSAGES } from "../constants";

// Configurar proveedor de Google
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

/**
 * Inicia sesión con Google
 * @returns {Promise<Object>} Resultado de la operación con datos del usuario o error
 */
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(firebaseAuth, googleProvider);
        const { displayName, email, photoURL, uid } = result.user;

        return {
            ok: true,
            displayName,
            email,
            photoURL,
            uid
        };

    } catch (error) {
        const errorMessage = FIREBASE_ERROR_MESSAGES[error.code] || FIREBASE_ERROR_MESSAGES.default;
        return {
            ok: false,
            errorMessage,
            errorCode: error.code
        };
    }
};

// Mantener exportación legacy por compatibilidad
export const singInGoogle = signInWithGoogle;

/**
 * Registra un nuevo usuario con email y contraseña
 * @param {Object} userData - Datos del usuario
 * @param {string} userData.email - Email del usuario
 * @param {string} userData.password - Contraseña del usuario
 * @param {string} userData.displayName - Nombre a mostrar del usuario
 * @returns {Promise<Object>} Resultado de la operación con datos del usuario o error
 */
export const registerUserWithEmailAndPassword = async ({ email, password, displayName }) => {
    try {
        const response = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        const { uid, photoURL } = response.user;

        await updateProfile(firebaseAuth.currentUser, { displayName });

        return {
            ok: true,
            uid,
            photoURL,
            email,
            displayName
        };

    } catch (error) {
        const errorMessage = FIREBASE_ERROR_MESSAGES[error.code] || FIREBASE_ERROR_MESSAGES.default;
        return {
            ok: false,
            errorMessage,
            errorCode: error.code
        };
    }
};

/**
 * Inicia sesión con email y contraseña
 * @param {Object} credentials - Credenciales del usuario
 * @param {string} credentials.email - Email del usuario
 * @param {string} credentials.password - Contraseña del usuario
 * @returns {Promise<Object>} Resultado de la operación con datos del usuario o error
 */
export const loginWithEmailAndPassword = async ({ email, password }) => {
    try {
        const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
        const { displayName, photoURL, uid } = result.user;

        return {
            ok: true,
            displayName,
            email,
            photoURL,
            uid
        };

    } catch (error) {
        const errorMessage = FIREBASE_ERROR_MESSAGES[error.code] || FIREBASE_ERROR_MESSAGES.default;

        return {
            ok: false,
            errorMessage,
            errorCode: error.code
        };
    }
};

/**
 * Cierra la sesión del usuario actual
 * @returns {Promise<void>}
 */
export const logoutFirebase = async () => {
    return await firebaseAuth.signOut();
};