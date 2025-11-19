import { onAuthStateChanged } from "firebase/auth"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { FireBaseAuth } from "../firebase/config"
import { login, logout } from "../store/auth"
import { startLoadingNotes } from "../store/auth/thunks"
import { startLoadingBudgets } from "../store/budgets/thunks"

export const useCheckAuth = () => {

    const { status } = useSelector( state => state.auth )
    const dispatch = useDispatch()

    useEffect(() => {

        console.log('🔐 useCheckAuth - Iniciando verificación de autenticación');

        onAuthStateChanged( FireBaseAuth, async( user ) => {
            if( !user ) {
                console.log('❌ useCheckAuth - No hay usuario autenticado');
                return dispatch( logout() );
            }

            const { uid, email, displayName, photoURL } = user;
            console.log('✅ useCheckAuth - Usuario autenticado:', { uid, email, displayName });

            dispatch( login({ uid, email, displayName, photoURL }) );

            console.log('📥 useCheckAuth - Iniciando carga de notas...');
            dispatch( startLoadingNotes() );

            console.log('💰 useCheckAuth - Iniciando carga de presupuestos...');
            dispatch( startLoadingBudgets() );
        })

    }, [])

    return {
        status
    }

}
