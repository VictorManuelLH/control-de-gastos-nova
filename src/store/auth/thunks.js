import { loginWithEmailAndPassword, logoutFirebase, registerUserWithEmailAndPassword, singInGoogle } from "../../firebase/providers"
import { loadNotes, loadTransactions } from "../../helper"
import { clearNotesLogout, setNotes } from "../journal/journalSlice"
import { clearTransactionsLogout, setTransactions } from "../expenses/expensesSlice"
import { clearBudgetsLogout, setBudgets } from "../budgets/budgetsSlice"
import { checkingCredentiales, login, logout } from "./authSlice"
import { startLoadingBudgets } from "../budgets/thunks"

export const checkingAuthentication = ( email, password ) => {
    return async( dispatch ) => {
        dispatch( checkingCredentiales() )
    }
}

export const startGoogleSingIn = () => {
    return async( dispatch ) => {
        dispatch( checkingCredentiales() )
        const result = await singInGoogle()
        if( !result.ok ) return dispatch( logout( result.errorMessage ) )
        dispatch( login( result ) )
    }
}

export const startCreatingUserWithEmailPassword = ({ email, password, displayName }) => {

    return async( dispatch ) => {

        dispatch( checkingCredentiales() )
        const { ok, uid, photoURL, errorMessage } = await registerUserWithEmailAndPassword({ email, password, displayName })
        if( !ok ) return dispatch( logout( {errorMessage} ) )
        dispatch( login({ uid, displayName, email, photoURL }) )
        
    }
    
}

export const startLoginWithEmailAndPassword = ({ email, password }) => {
    return async( dispatch ) => {
        
        dispatch( checkingCredentiales() )
        const { ok, uid, photoURL, errorMessage } = await loginWithEmailAndPassword({ email, password })
        if( !ok ) return dispatch( logout( {errorMessage} ) )
        dispatch( login({ email, password }) )
    }

}

export const startLogout = () => {
    return async( dispatch ) => {
        await logoutFirebase()
        dispatch( clearNotesLogout() )
        dispatch( clearTransactionsLogout() )
        dispatch( clearBudgetsLogout() )
        dispatch( logout() )
    }
}

export const startLoadingNotes = () => {

    return async( dispatch, getState ) => {

        try {
            const { uid } = getState().auth

            if( !uid ) {
                console.error('❌ startLoadingNotes - El UID no existe')
                throw new Error('El UID no existe')
            }

            const notes = await loadNotes( uid )

            dispatch( setNotes( notes ) )
        } catch (error) {
            console.error('❌ startLoadingNotes - Error al cargar notas:', error)
            console.error('❌ startLoadingNotes - Error completo:', error.message)
            // Si hay error de permisos, las notas quedan vacías
            dispatch( setNotes( [] ) )
        }
    }
}

export const startLoadingTransactions = () => {

    return async( dispatch, getState ) => {

        try {
            const { uid } = getState().auth

            if( !uid ) {
                console.error('❌ startLoadingTransactions - El UID no existe')
                throw new Error('El UID no existe')
            }

            const transactions = await loadTransactions( uid )

            dispatch( setTransactions( transactions ) )
        } catch (error) {
            console.error('❌ startLoadingTransactions - Error al cargar transacciones:', error)
            console.error('❌ startLoadingTransactions - Error completo:', error.message)
            // Si hay error de permisos, las transacciones quedan vacías
            dispatch( setTransactions( [] ) )
        }
    }
}