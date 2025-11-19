import { collection, deleteDoc, doc, setDoc, getDocs } from 'firebase/firestore/lite';
import { FireBaseDB } from '../../firebase/config';
import {
    startSaving,
    addBudget,
    updateBudget,
    deleteBudget,
    setBudgets,
    clearMessage
} from './budgetsSlice';
import { BUDGET_PERIODS } from '../../constants';
import Swal from 'sweetalert2';

/**
 * Genera un ID único para el presupuesto
 */
const generateBudgetId = () => {
    return `budget_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Crea un nuevo presupuesto
 * @param {Object} budgetData - Datos del presupuesto
 * @param {string} budgetData.categoryId - ID de la categoría
 * @param {number} budgetData.amount - Monto del presupuesto
 * @param {string} budgetData.period - Período (monthly, weekly, yearly)
 * @param {number} budgetData.year - Año
 * @param {number} budgetData.month - Mes (si aplica)
 */
export const startNewBudget = (budgetData) => {
    return async (dispatch, getState) => {
        dispatch(startSaving());

        const { uid } = getState().auth;
        const { categoryId, amount, period = BUDGET_PERIODS.MONTHLY, year, month } = budgetData;

        // Validar que no exista un presupuesto para esta categoría en este período
        const { budgets } = getState().budgets;
        const existingBudget = budgets.find(b =>
            b.categoryId === categoryId &&
            b.year === year &&
            (period === BUDGET_PERIODS.MONTHLY ? b.month === month : true)
        );

        if (existingBudget) {
            Swal.fire({
                title: 'Presupuesto existente',
                text: 'Ya existe un presupuesto para esta categoría en este período',
                icon: 'warning',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        const newBudget = {
            categoryId,
            amount: parseFloat(amount),
            period,
            year,
            month: period === BUDGET_PERIODS.MONTHLY ? month : null,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            alertThreshold: 80, // Alertar al 80%
            enabled: true,
            userId: uid
        };

        try {
            // Guardar en Firebase
            const path = `${uid}/expenses/budgets`;
            const newDoc = doc(collection(FireBaseDB, path));

            await setDoc(newDoc, newBudget);
            newBudget.id = newDoc.id;

            console.log('✅ Presupuesto creado en Firebase:', newBudget.id);
            dispatch(addBudget(newBudget));

            // Mostrar mensaje de éxito
            Swal.fire({
                title: '¡Presupuesto creado!',
                text: 'El presupuesto se ha creado correctamente',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            // Limpiar mensaje después de 3 segundos
            setTimeout(() => {
                dispatch(clearMessage());
            }, 3000);
        } catch (error) {
            console.error('❌ Error al crear presupuesto:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo crear el presupuesto',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
        }
    };
};

/**
 * Actualiza un presupuesto existente
 * @param {Object} budgetData - Datos actualizados del presupuesto
 */
export const startUpdatingBudget = (budgetData) => {
    return async (dispatch, getState) => {
        dispatch(startSaving());

        const { uid } = getState().auth;

        if (!budgetData.id) {
            console.error('❌ No hay ID de presupuesto para actualizar');
            return;
        }

        const budgetToFireStore = {
            ...budgetData,
            amount: parseFloat(budgetData.amount),
            updatedAt: Date.now()
        };

        delete budgetToFireStore.id;

        try {
            const path = `${uid}/expenses/budgets/${budgetData.id}`;
            const docRef = doc(FireBaseDB, path);

            await setDoc(docRef, budgetToFireStore, { merge: true });

            console.log('✅ Presupuesto actualizado en Firebase:', budgetData.id);

            dispatch(updateBudget({
                id: budgetData.id,
                ...budgetToFireStore
            }));

            // Mostrar mensaje de éxito
            Swal.fire({
                title: '¡Presupuesto actualizado!',
                text: 'Los cambios se han guardado correctamente',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            // Limpiar mensaje después de 3 segundos
            setTimeout(() => {
                dispatch(clearMessage());
            }, 3000);
        } catch (error) {
            console.error('❌ Error al actualizar presupuesto:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo actualizar el presupuesto',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
        }
    };
};

/**
 * Elimina un presupuesto
 * @param {string} budgetId - ID del presupuesto a eliminar
 */
export const startDeletingBudget = () => {
    return async (dispatch, getState) => {
        const { uid } = getState().auth;
        const { activeBudget } = getState().budgets;

        if (!activeBudget) {
            return;
        }

        // Confirmar eliminación
        const result = await Swal.fire({
            title: '¿Eliminar presupuesto?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const path = `${uid}/expenses/budgets/${activeBudget.id}`;
                const docRef = doc(FireBaseDB, path);

                await deleteDoc(docRef);

                console.log('✅ Presupuesto eliminado de Firebase:', activeBudget.id);

                dispatch(deleteBudget(activeBudget.id));

                Swal.fire({
                    title: '¡Eliminado!',
                    text: 'El presupuesto ha sido eliminado',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });

                setTimeout(() => {
                    dispatch(clearMessage());
                }, 3000);
            } catch (error) {
                console.error('❌ Error al eliminar presupuesto:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo eliminar el presupuesto',
                    icon: 'error',
                    confirmButtonText: 'Entendido'
                });
            }
        }
    };
};

/**
 * Carga los presupuestos desde Firebase
 */
export const startLoadingBudgets = () => {
    return async (dispatch, getState) => {
        try {
            const { uid } = getState().auth;

            if (!uid) {
                console.error('❌ startLoadingBudgets - El UID no existe');
                throw new Error('El UID no existe');
            }

            const path = `${uid}/expenses/budgets`;
            console.log('💰 Cargando presupuestos desde:', path);

            const collectionRef = collection(FireBaseDB, path);
            const docs = await getDocs(collectionRef);

            const budgets = [];
            docs.forEach(doc => {
                const budgetData = { id: doc.id, ...doc.data() };
                budgets.push(budgetData);
            });

            console.log('✅ Presupuestos cargados:', budgets.length);
            dispatch(setBudgets(budgets));
        } catch (error) {
            console.error('❌ startLoadingBudgets - Error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            dispatch(setBudgets([]));
        }
    };
};

/**
 * Verifica si algún presupuesto ha sido excedido
 * @param {Array} transactions - Lista de transacciones
 * @param {Array} budgets - Lista de presupuestos
 * @returns {Array} Lista de presupuestos excedidos
 */
export const checkBudgetAlerts = (transactions, budgets) => {
    return (dispatch) => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        const exceededBudgets = [];

        budgets.forEach(budget => {
            if (!budget.enabled) return;

            // Filtrar transacciones relevantes para este presupuesto
            const relevantTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                const sameCategory = t.category === budget.categoryId;
                const sameYear = transactionDate.getFullYear() === budget.year;
                const sameMonth = budget.period === BUDGET_PERIODS.MONTHLY
                    ? transactionDate.getMonth() === budget.month
                    : true;

                return sameCategory && sameYear && sameMonth && t.type === 'expense';
            });

            // Calcular total gastado
            const totalSpent = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
            const percentage = (totalSpent / budget.amount) * 100;

            // Si excede el threshold, agregar a la lista
            if (percentage >= budget.alertThreshold) {
                exceededBudgets.push({
                    budget,
                    totalSpent,
                    percentage: Math.round(percentage)
                });
            }
        });

        return exceededBudgets;
    };
};
