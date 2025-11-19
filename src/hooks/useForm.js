import { useEffect, useMemo, useState } from 'react';

/**
 * Hook personalizado para manejar formularios con validación
 * @param {Object} initialForm - Estado inicial del formulario
 * @param {Object} formValidations - Objeto con funciones de validación para cada campo
 * @returns {Object} Estado del formulario y funciones para manejarlo
 */
export const useForm = (initialForm = {}, formValidations = {}) => {
    const [formState, setFormState] = useState(initialForm);
    const [formValidation, setFormValidation] = useState({});

    useEffect(() => {
        createValidators();
    }, [formState]);

    useEffect(() => {
        setFormState(initialForm);
    }, [initialForm]);

    /**
     * Verifica si el formulario es válido
     */
    const isFormValid = useMemo(() => {
        for (const formValue of Object.keys(formValidation)) {
            if (formValidation[formValue] !== null) return false;
        }
        return true;
    }, [formValidation]);

    /**
     * Maneja el cambio de un input
     */
    const onInputChange = ({ target }) => {
        const { name, value } = target;
        setFormState({
            ...formState,
            [name]: value
        });
    };

    /**
     * Reinicia el formulario a su estado inicial
     */
    const onResetForm = () => {
        setFormState(initialForm);
    };

    /**
     * Crea los validadores para cada campo del formulario
     */
    const createValidators = () => {
        const formCheckedValues = {};

        for (const formField of Object.keys(formValidations)) {
            const [validatorFn, errorMessage] = formValidations[formField];
            formCheckedValues[`${formField}Valid`] = validatorFn(formState[formField]) ? null : errorMessage;
        }

        setFormValidation(formCheckedValues);
    };

    return {
        ...formState,
        formState,
        onInputChange,
        onResetForm,
        ...formValidation,
        isFormValid
    };
};