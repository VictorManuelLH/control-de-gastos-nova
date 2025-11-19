import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";
import { getEnvironments } from "../helper/getEnviroments";

/**
 * Obtiene la configuración de Firebase desde las variables de entorno
 * @returns {Object} Configuración de Firebase
 */
const getFirebaseConfig = () => {
  const env = getEnvironments();

  return {
    apiKey: env.VITE_APIKEY,
    authDomain: env.VITE_AUTHDOMAIN,
    projectId: env.VITE_PROJECTID,
    storageBucket: env.VITE_STORAGEBUCKET,
    messagingSenderId: env.VITE_MESSAGINGSENDERID,
    appId: env.VITE_APPID,
    measurementId: env.VITE_MEASUREMENTID
  };
};

// Inicializar Firebase con la configuración
const firebaseConfig = getFirebaseConfig();

// Exportar instancias de Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseDB = getFirestore(firebaseApp);

// Mantener exportaciones legacy por compatibilidad
export const FireBaseApp = firebaseApp;
export const FireBaseAuth = firebaseAuth;
export const FireBaseDB = firebaseDB;
