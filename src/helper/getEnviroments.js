/**
 * Obtiene las variables de entorno de la aplicación
 * @returns {Object} Objeto con todas las variables de entorno
 */
export const getEnvironments = () => {
    return {
        VITE_APIKEY: import.meta.env.VITE_APIKEY,
        VITE_APIKEYOPENIA: import.meta.env.VITE_APIKEYOPENIA,
        VITE_AUTHDOMAIN: import.meta.env.VITE_AUTHDOMAIN,
        VITE_PROJECTID: import.meta.env.VITE_PROJECTID,
        VITE_STORAGEBUCKET: import.meta.env.VITE_STORAGEBUCKET,
        VITE_MESSAGINGSENDERID: import.meta.env.VITE_MESSAGINGSENDERID,
        VITE_APPID: import.meta.env.VITE_APPID,
        VITE_MEASUREMENTID: import.meta.env.VITE_MEASUREMENTID,
        VITE_CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        VITE_CLOUDINARY_UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    };
};

// Mantener exportación legacy por compatibilidad
export const getEnviroments = getEnvironments;
