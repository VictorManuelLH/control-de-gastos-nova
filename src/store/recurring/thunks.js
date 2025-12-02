import { collection, deleteDoc, doc, setDoc, getDocs } from 'firebase/firestore/lite';
import { FireBaseDB } from '../../firebase/config';
import {
    startSaving,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    setRecurrings,
    pauseRecurring,
    resumeRecurring,
    cancelRecurring,
    updateNextDate,
    setUpcomingRecurrings,
    setLastCheckDate,
    clearMessage
} from './recurringSlice';
import { startNewTransaction } from '../expenses/thunks';
import { RECURRING_FREQUENCIES, RECURRING_STATUS, REMINDER_DAYS_BEFORE } from '../../constants';
import { pwaNotificationService } from '../../services';
import Swal from 'sweetalert2';
import { addDays, addWeeks, addMonths, addYears, isBefore, isToday, differenceInDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Calcula la próxima fecha según la frecuencia
 */
const calculateNextDate = (currentDate, frequency) => {
    const date = new Date(currentDate);

    switch (frequency) {
        case RECURRING_FREQUENCIES.DAILY:
            return addDays(date, 1).getTime();
        case RECURRING_FREQUENCIES.WEEKLY:
            return addWeeks(date, 1).getTime();
        case RECURRING_FREQUENCIES.BIWEEKLY:
            return addDays(date, 15).getTime();
        case RECURRING_FREQUENCIES.MONTHLY:
            return addMonths(date, 1).getTime();
        case RECURRING_FREQUENCIES.QUARTERLY:
            return addMonths(date, 3).getTime();
        case RECURRING_FREQUENCIES.BIANNUAL:
            return addMonths(date, 6).getTime();
        case RECURRING_FREQUENCIES.YEARLY:
            return addYears(date, 1).getTime();
        default:
            return addMonths(date, 1).getTime();
    }
};

/**
 * Crea un nuevo gasto recurrente
 */
export const startNewRecurring = (recurringData) => {
    return async (dispatch, getState) => {
        dispatch(startSaving());

        const { uid } = getState().auth;

        const newRecurring = {
            ...recurringData,
            userId: uid,
            status: RECURRING_STATUS.ACTIVE,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            lastProcessedDate: null,
            nextDate: recurringData.nextDate || Date.now()
        };

        try {
            const path = `${uid}/recurring/items`;
            const newDoc = doc(collection(FireBaseDB, path));

            await setDoc(newDoc, newRecurring);
            newRecurring.id = newDoc.id;

            console.log('✅ Gasto recurrente creado:', newRecurring.id);
            dispatch(addRecurring(newRecurring));

            Swal.fire({
                title: '¡Gasto recurrente creado!',
                text: `${newRecurring.name} se registrará automáticamente`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            setTimeout(() => {
                dispatch(clearMessage());
            }, 3000);
        } catch (error) {
            console.error('❌ Error al crear gasto recurrente:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo crear el gasto recurrente',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
        }
    };
};

/**
 * Actualiza un gasto recurrente existente
 */
export const startUpdatingRecurring = (recurringData) => {
    return async (dispatch, getState) => {
        dispatch(startSaving());

        const { uid } = getState().auth;

        if (!recurringData.id) {
            console.error('❌ No hay ID de gasto recurrente para actualizar');
            return;
        }

        const recurringToFireStore = {
            ...recurringData,
            updatedAt: Date.now()
        };

        delete recurringToFireStore.id;

        try {
            const path = `${uid}/recurring/items/${recurringData.id}`;
            const docRef = doc(FireBaseDB, path);

            await setDoc(docRef, recurringToFireStore, { merge: true });

            console.log('✅ Gasto recurrente actualizado:', recurringData.id);

            dispatch(updateRecurring({
                id: recurringData.id,
                ...recurringToFireStore
            }));

            Swal.fire({
                title: '¡Actualizado!',
                text: 'Los cambios se han guardado',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            setTimeout(() => {
                dispatch(clearMessage());
            }, 3000);
        } catch (error) {
            console.error('❌ Error al actualizar gasto recurrente:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo actualizar el gasto recurrente',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
        }
    };
};

/**
 * Elimina un gasto recurrente
 */
export const startDeletingRecurring = (recurringId) => {
    return async (dispatch, getState) => {
        const { uid } = getState().auth;

        if (!recurringId) {
            return;
        }

        const result = await Swal.fire({
            title: '¿Eliminar gasto recurrente?',
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
                const path = `${uid}/recurring/items/${recurringId}`;
                const docRef = doc(FireBaseDB, path);

                await deleteDoc(docRef);

                console.log('✅ Gasto recurrente eliminado:', recurringId);

                dispatch(deleteRecurring(recurringId));

                Swal.fire({
                    title: '¡Eliminado!',
                    text: 'El gasto recurrente ha sido eliminado',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });

                setTimeout(() => {
                    dispatch(clearMessage());
                }, 3000);
            } catch (error) {
                console.error('❌ Error al eliminar gasto recurrente:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo eliminar el gasto recurrente',
                    icon: 'error',
                    confirmButtonText: 'Entendido'
                });
            }
        }
    };
};

/**
 * Pausa un gasto recurrente
 */
export const startPausingRecurring = (recurringId) => {
    return async (dispatch, getState) => {
        const { uid } = getState().auth;

        try {
            const path = `${uid}/recurring/items/${recurringId}`;
            const docRef = doc(FireBaseDB, path);

            await setDoc(docRef, {
                status: RECURRING_STATUS.PAUSED,
                updatedAt: Date.now()
            }, { merge: true });

            dispatch(pauseRecurring(recurringId));

            Swal.fire({
                title: 'Pausado',
                text: 'El gasto recurrente ha sido pausado',
                icon: 'info',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('❌ Error al pausar gasto recurrente:', error);
        }
    };
};

/**
 * Reactiva un gasto recurrente pausado
 */
export const startResumingRecurring = (recurringId) => {
    return async (dispatch, getState) => {
        const { uid } = getState().auth;

        try {
            const path = `${uid}/recurring/items/${recurringId}`;
            const docRef = doc(FireBaseDB, path);

            await setDoc(docRef, {
                status: RECURRING_STATUS.ACTIVE,
                updatedAt: Date.now()
            }, { merge: true });

            dispatch(resumeRecurring(recurringId));

            Swal.fire({
                title: 'Reactivado',
                text: 'El gasto recurrente ha sido reactivado',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('❌ Error al reactivar gasto recurrente:', error);
        }
    };
};

/**
 * Carga los gastos recurrentes desde Firebase
 */
export const startLoadingRecurrings = () => {
    return async (dispatch, getState) => {
        try {
            const { uid } = getState().auth;

            if (!uid) {
                console.error('❌ startLoadingRecurrings - El UID no existe');
                throw new Error('El UID no existe');
            }

            const path = `${uid}/recurring/items`;
            console.log('💰 Cargando gastos recurrentes desde:', path);

            const collectionRef = collection(FireBaseDB, path);
            const docs = await getDocs(collectionRef);

            const recurrings = [];
            docs.forEach(doc => {
                const recurringData = { id: doc.id, ...doc.data() };
                recurrings.push(recurringData);
            });

            console.log('✅ Gastos recurrentes cargados:', recurrings.length);
            dispatch(setRecurrings(recurrings));

            // Verificar gastos pendientes
            dispatch(checkPendingRecurrings());
        } catch (error) {
            console.error('❌ startLoadingRecurrings - Error:', error);
            dispatch(setRecurrings([]));
        }
    };
};

/**
 * Verifica y procesa gastos recurrentes pendientes
 */
export const checkPendingRecurrings = () => {
    return async (dispatch, getState) => {
        const { recurrings } = getState().recurring;
        const today = new Date();
        const upcoming = [];

        for (const recurring of recurrings) {
            if (recurring.status !== RECURRING_STATUS.ACTIVE) continue;

            const nextDate = new Date(recurring.nextDate);

            // Si la fecha ya pasó, procesar el gasto
            if (isBefore(nextDate, today) || isToday(nextDate)) {
                // Registrar la transacción automáticamente
                await dispatch(processRecurringTransaction(recurring));
            }
            // Si falta poco, agregar a upcoming para recordatorios
            else {
                const daysUntil = differenceInDays(nextDate, today);
                if (daysUntil <= REMINDER_DAYS_BEFORE) {
                    upcoming.push({
                        ...recurring,
                        daysUntil
                    });

                    // Enviar recordatorio
                    dispatch(sendRecurringReminder(recurring, daysUntil));
                }
            }
        }

        dispatch(setUpcomingRecurrings(upcoming));
        dispatch(setLastCheckDate(Date.now()));
    };
};

/**
 * Procesa una transacción recurrente (la registra)
 */
const processRecurringTransaction = (recurring) => {
    return async (dispatch, getState) => {
        const { uid } = getState().auth;

        // Crear la transacción
        const transaction = {
            type: 'expense',
            category: recurring.category,
            amount: recurring.amount,
            description: `${recurring.name} (Recurrente)`,
            date: Date.now(),
            recurringId: recurring.id,
            isRecurring: true
        };

        // Registrar la transacción
        await dispatch(startNewTransaction(transaction));

        // Calcular la próxima fecha
        const nextDate = calculateNextDate(recurring.nextDate, recurring.frequency);

        // Actualizar en Firebase
        try {
            const path = `${uid}/recurring/items/${recurring.id}`;
            const docRef = doc(FireBaseDB, path);

            await setDoc(docRef, {
                nextDate,
                lastProcessedDate: Date.now(),
                updatedAt: Date.now()
            }, { merge: true });

            dispatch(updateNextDate({ id: recurring.id, nextDate }));

            // Notificar al usuario
            pwaNotificationService.notifySuccess(
                '💸 Gasto Recurrente Registrado',
                `${recurring.name}: $${recurring.amount.toFixed(2)} - Próximo cargo: ${format(new Date(nextDate), 'd MMM', { locale: es })}`
            );

            console.log(`✅ Gasto recurrente procesado: ${recurring.name}`);
        } catch (error) {
            console.error('❌ Error al actualizar próxima fecha:', error);
        }
    };
};

/**
 * Envía recordatorio de gasto próximo
 */
const sendRecurringReminder = (recurring, daysUntil) => {
    return () => {
        const daysText = daysUntil === 0 ? 'hoy' : daysUntil === 1 ? 'mañana' : `en ${daysUntil} días`;

        pwaNotificationService.notifyWarning(
            '⏰ Gasto Recurrente Próximo',
            `${recurring.name} ($${recurring.amount.toFixed(2)}) se cobrará ${daysText}`
        );
    };
};
