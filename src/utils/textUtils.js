import { TEXT_LIMITS } from '../constants';

/**
 * Trunca un texto a un límite especificado
 * @param {string} text - Texto a truncar
 * @param {number} limit - Límite de caracteres
 * @returns {string} Texto truncado con "..." o texto original
 */
export const truncateText = (text, limit = TEXT_LIMITS.TITLE_PREVIEW) => {
    if (!text) return '';
    return text.length > limit ? `${text.substring(0, limit)}...` : text;
};

/**
 * Capitaliza la primera letra de un texto
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto con primera letra mayúscula
 */
export const capitalize = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Valida si un email tiene formato válido
 * @param {string} email - Email a validar
 * @returns {boolean} true si el email es válido
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Genera un ID único basado en timestamp
 * @returns {string} ID único
 */
export const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
