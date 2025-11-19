import { getEnvironments } from './getEnviroments';
import { ERROR_MESSAGES } from '../constants';

/**
 * Sube un archivo a Cloudinary
 * @param {File} file - Archivo a subir
 * @returns {Promise<string|null>} URL segura del archivo subido o null si falla
 */
export const fileUpload = async (file) => {
    if (!file) {
        console.warn(ERROR_MESSAGES.NO_FILE);
        return null;
    }

    const env = getEnvironments();
    const cloudUrl = `https://api.cloudinary.com/v1_1/${env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;

    const formData = new FormData();
    formData.append('upload_preset', env.VITE_CLOUDINARY_UPLOAD_PRESET);
    formData.append('file', file);

    try {
        const response = await fetch(cloudUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(ERROR_MESSAGES.UPLOAD_FAILED);
        }

        const cloudResponse = await response.json();
        return cloudResponse.secure_url;

    } catch (error) {
        console.error('Error al subir archivo:', error);
        return null;
    }
};