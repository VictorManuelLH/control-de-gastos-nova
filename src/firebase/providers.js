import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { FireBaseAuth } from "./config";

const googleProvider = new GoogleAuthProvider()

googleProvider.setCustomParameters({
    prompt: 'select_account'
})

export const singInGoogle = async() => {
    try {
        const result = await signInWithPopup( FireBaseAuth, googleProvider )
        // const credentials = GoogleAuthProvider.credentialFromResult( result )
        const { displayName, email, photoURL, uid } = result.user
        
        return{
            ok: true,
            displayName, email, photoURL, uid
        }
        
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        return {
            ok: false,
            errorMessage,
        }
    }
}

export const registerUserWithEmailAndPassword = async({ email, password, displayName }) => {

    try {
        
        const respuesta = await createUserWithEmailAndPassword( FireBaseAuth, email, password )
        const { uid, photoURL } = respuesta.user

        await updateProfile( FireBaseAuth.currentUser, { displayName } )

        return{
            ok: true, 
            uid, photoURL, email, displayName
        }

    } catch (error) {
        return { ok: false, errorMessage: error.message }
    }

}

export const loginWithEmailAndPassword = async({ email, password }) => {
    try {
        console.log("🔐 Intentando login con:", email);
        console.log("🔥 Auth instance:", FireBaseAuth);
        
        const resultado = await signInWithEmailAndPassword(FireBaseAuth, email, password);
        const { displayName, photoURL, uid } = resultado.user;
        
        console.log("✅ Login exitoso:", uid);
        
        return {
            ok: true,
            displayName, 
            email, 
            photoURL, 
            uid
        }

    } catch (error) {
        console.error("❌ Error en login:", error);
        
        // Manejo específico de errores de Firebase
        let errorMessage = "Error desconocido";
        
        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage = "El formato del email es inválido";
                break;
            case 'auth/user-disabled':
                errorMessage = "Este usuario ha sido deshabilitado";
                break;
            case 'auth/user-not-found':
                errorMessage = "No existe usuario con este email";
                break;
            case 'auth/wrong-password':
                errorMessage = "Contraseña incorrecta";
                break;
            case 'auth/too-many-requests':
                errorMessage = "Demasiados intentos fallidos. Intenta más tarde";
                break;
            case 'auth/network-request-failed':
                errorMessage = "Error de conexión a internet";
                break;
            default:
                errorMessage = error.message || "Error al iniciar sesión";
        }
        
        return {
            ok: false,
            errorMessage,
            errorCode: error.code
        }
    }
}

export const logoutFirebase = async() => {

    return await FireBaseAuth.signOut()

}