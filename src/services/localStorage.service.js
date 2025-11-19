import { STORAGE_KEYS } from '../constants';

/**
 * Servicio para manejar operaciones con localStorage
 */
export class LocalStorageService {
    /**
     * Guarda un valor en localStorage
     * @param {string} key - Clave para almacenar
     * @param {*} value - Valor a almacenar (será convertido a JSON)
     */
    static setItem(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
        } catch (error) {
            console.error(`Error al guardar en localStorage (${key}):`, error);
        }
    }

    /**
     * Obtiene un valor de localStorage
     * @param {string} key - Clave a buscar
     * @param {*} defaultValue - Valor por defecto si no existe o hay error
     * @returns {*} Valor deserializado o valor por defecto
     */
    static getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error al leer de localStorage (${key}):`, error);
            return defaultValue;
        }
    }

    /**
     * Elimina un valor de localStorage
     * @param {string} key - Clave a eliminar
     */
    static removeItem(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error al eliminar de localStorage (${key}):`, error);
        }
    }

    /**
     * Limpia todo el localStorage
     */
    static clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error al limpiar localStorage:', error);
        }
    }

    // Métodos específicos para notas
    static saveNotes(notes) {
        console.log('💾 LocalStorage - Guardando notas:', notes?.length || 0);
        this.setItem(STORAGE_KEYS.NOTES, notes);
    }

    static getNotes() {
        const notes = this.getItem(STORAGE_KEYS.NOTES, []);
        console.log('📖 LocalStorage - Leyendo notas:', notes?.length || 0);
        return notes;
    }

    static clearNotes() {
        this.removeItem(STORAGE_KEYS.NOTES);
    }

    // Métodos específicos para nota activa
    static saveActiveNote(note) {
        this.setItem(STORAGE_KEYS.ACTIVE_NOTE, note);
    }

    static getActiveNote() {
        return this.getItem(STORAGE_KEYS.ACTIVE_NOTE);
    }

    static clearActiveNote() {
        this.removeItem(STORAGE_KEYS.ACTIVE_NOTE);
    }

    // Métodos específicos para gastos
    static saveExpenses(expenses) {
        this.setItem(STORAGE_KEYS.EXPENSES, expenses);
    }

    static getExpenses() {
        return this.getItem(STORAGE_KEYS.EXPENSES, []);
    }

    static clearExpenses() {
        this.removeItem(STORAGE_KEYS.EXPENSES);
    }

    // Métodos específicos para presupuestos
    /**
     * Guarda los presupuestos en localStorage
     * @param {Array} budgets - Array de presupuestos
     */
    static saveBudgets(budgets) {
        console.log('💾 LocalStorage - Guardando presupuestos:', budgets?.length || 0);
        this.setItem(STORAGE_KEYS.BUDGETS, budgets);
    }

    /**
     * Obtiene los presupuestos desde localStorage
     * @returns {Array} Array de presupuestos
     */
    static getBudgets() {
        const budgets = this.getItem(STORAGE_KEYS.BUDGETS, []);
        console.log('📖 LocalStorage - Leyendo presupuestos:', budgets?.length || 0);
        return budgets;
    }

    /**
     * Limpia todos los presupuestos
     */
    static clearBudgets() {
        console.log('🗑️ LocalStorage - Limpiando presupuestos');
        this.removeItem(STORAGE_KEYS.BUDGETS);
    }
}
