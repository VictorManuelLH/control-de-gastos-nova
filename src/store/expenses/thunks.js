import { collection, deleteDoc, doc, setDoc, getDocs } from 'firebase/firestore/lite';
import { FireBaseDB } from '../../firebase/config';
import {
    startSaving,
    addNewTransaction,
    setActiveTransaction,
    setTransactions,
    updateTransaction,
    deleteTransactionById
} from './expensesSlice';
import { telegramService } from '../../services';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, BUDGET_PERIODS } from '../../constants';

/**
 * Carga todas las transacciones desde Firebase
 */
export const startLoadingTransactions = () => {
    return async (dispatch, getState) => {
        try {
            const { uid } = getState().auth;

            if (!uid) {
                console.error('❌ startLoadingTransactions - El UID no existe');
                throw new Error('El UID no existe');
            }

            const path = `${uid}/expenses/transactions`;
            console.log('📊 Cargando transacciones desde:', path);

            const collectionRef = collection(FireBaseDB, path);
            const docs = await getDocs(collectionRef);

            const transactions = [];
            docs.forEach(doc => {
                const transactionData = { id: doc.id, ...doc.data() };
                transactions.push(transactionData);
            });

            console.log('✅ Transacciones cargadas:', transactions.length);
            dispatch(setTransactions(transactions));
        } catch (error) {
            console.error('❌ startLoadingTransactions - Error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            dispatch(setTransactions([]));
        }
    };
};

/**
 * Verifica presupuestos después de agregar una transacción y envía alertas si es necesario
 */
const checkBudgetAlertsAfterTransaction = async (transaction, budgets, allTransactions) => {
    if (transaction.type !== 'expense' || !telegramService.isConfigured()) {
        return;
    }

    const transactionDate = new Date(transaction.date);
    const transactionYear = transactionDate.getFullYear();
    const transactionMonth = transactionDate.getMonth();

    // Encontrar presupuestos que aplican a esta transacción
    const relevantBudgets = budgets.filter(budget => {
        if (!budget.enabled) return false;
        if (budget.categoryId !== transaction.category) return false;
        if (budget.year !== transactionYear) return false;

        if (budget.period === BUDGET_PERIODS.MONTHLY && budget.month !== transactionMonth) {
            return false;
        }

        return true;
    });

    // Verificar cada presupuesto relevante
    for (const budget of relevantBudgets) {
        // Calcular total gastado incluyendo la nueva transacción
        const relevantTransactions = allTransactions.filter(t => {
            const tDate = new Date(t.date);
            const sameCategory = t.category === budget.categoryId;
            const sameYear = tDate.getFullYear() === budget.year;
            const sameMonth = budget.period === BUDGET_PERIODS.MONTHLY
                ? tDate.getMonth() === budget.month
                : true;

            return sameCategory && sameYear && sameMonth && t.type === 'expense';
        });

        const totalSpent = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
        const percentage = (totalSpent / budget.amount) * 100;
        const remaining = budget.amount - totalSpent;

        // Obtener nombre de la categoría
        const categoryName = EXPENSE_CATEGORIES.find(c => c.id === budget.categoryId)?.name || budget.categoryId;

        // Enviar alerta si alcanza umbrales (80%, 90%, 100%)
        if (percentage >= 80) {
            await telegramService.sendBudgetAlert({
                category: categoryName,
                budget: budget.amount,
                spent: totalSpent,
                percentage: percentage,
                remaining: remaining
            });
        }
    }
};

/**
 * Crea una nueva transacción (gasto o ingreso)
 */
export const startNewTransaction = (transactionData) => {
    return async (dispatch, getState) => {
        dispatch(startSaving());

        const { uid } = getState().auth;

        const newTransaction = {
            ...transactionData,
            userId: uid,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
        };

        try {
            const path = `${uid}/expenses/transactions`;
            const newDoc = doc(collection(FireBaseDB, path));

            await setDoc(newDoc, newTransaction);
            newTransaction.id = newDoc.id;

            console.log('✅ Transacción creada:', newTransaction.id);
            dispatch(addNewTransaction(newTransaction));
            dispatch(setActiveTransaction(newTransaction));

            // Obtener estado actualizado
            const state = getState();
            const { budgets } = state.budgets;
            const { transactions } = state.expenses;

            // Enviar notificación de transacción (solo para montos significativos > $100)
            if (telegramService.isConfigured() && newTransaction.amount > 100) {
                const categories = newTransaction.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
                const categoryName = categories.find(c => c.id === newTransaction.category)?.name || newTransaction.category;

                await telegramService.sendTransactionNotification({
                    type: newTransaction.type,
                    amount: newTransaction.amount,
                    category: categoryName,
                    description: newTransaction.description || ''
                });
            }

            // Verificar presupuestos y enviar alertas si es necesario
            await checkBudgetAlertsAfterTransaction(newTransaction, budgets, transactions);

        } catch (error) {
            console.error('❌ Error al crear transacción:', error);
        }
    };
};

/**
 * Guarda/actualiza una transacción existente
 */
export const startSaveTransaction = () => {
    return async (dispatch, getState) => {
        dispatch(startSaving());

        const { uid } = getState().auth;
        const { active: transaction } = getState().expenses;

        if (!transaction) {
            console.error('❌ No hay transacción activa para guardar');
            return;
        }

        const transactionToFireStore = {
            ...transaction,
            updatedAt: new Date().getTime()
        };

        delete transactionToFireStore.id;

        const path = `${uid}/expenses/transactions/${transaction.id}`;
        const docRef = doc(FireBaseDB, path);

        try {
            await setDoc(docRef, transactionToFireStore, { merge: true });

            console.log('✅ Transacción actualizada:', transaction.id);
            dispatch(updateTransaction({
                id: transaction.id,
                ...transactionToFireStore
            }));
        } catch (error) {
            console.error('❌ Error al guardar transacción:', error);
        }
    };
};

/**
 * Elimina una transacción
 */
export const startDeletingTransaction = () => {
    return async (dispatch, getState) => {
        const { uid } = getState().auth;
        const { active: transaction } = getState().expenses;

        if (!transaction) {
            console.error('❌ No hay transacción activa para eliminar');
            return;
        }

        try {
            const path = `${uid}/expenses/transactions/${transaction.id}`;
            const docRef = doc(FireBaseDB, path);

            await deleteDoc(docRef);

            console.log('✅ Transacción eliminada:', transaction.id);
            dispatch(deleteTransactionById(transaction.id));
        } catch (error) {
            console.error('❌ Error al eliminar transacción:', error);
        }
    };
};
