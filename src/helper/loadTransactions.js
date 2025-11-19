import { collection, getDocs } from "firebase/firestore/lite";
import { FireBaseDB } from "../firebase/config";

/**
 * Carga las transacciones (gastos e ingresos) de un usuario desde Firestore
 * @param {string} uid - ID del usuario
 * @returns {Promise<Array>} Array de transacciones
 */
export const loadTransactions = async(uid = '') => {
    if (!uid) throw new Error('El UID no existe');

    try {
        const path = `${uid}/expenses/transactions`;
        console.log('📊 loadTransactions - Cargando desde:', path);

        const collectionRef = collection(FireBaseDB, path);
        const docs = await getDocs(collectionRef);

        const transactions = [];
        docs.forEach(doc => {
            const transactionData = { id: doc.id, ...doc.data() };
            transactions.push(transactionData);
        });

        console.log('✅ loadTransactions - Transacciones cargadas:', transactions.length);
        return transactions;

    } catch (error) {
        console.error('❌ loadTransactions - Error detallado:', error);
        console.error('❌ loadTransactions - Error code:', error.code);
        console.error('❌ loadTransactions - Error message:', error.message);
        throw new Error('Error al cargar transacciones desde Firestore: ' + error.message);
    }
}
