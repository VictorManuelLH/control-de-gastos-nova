import { createSlice } from '@reduxjs/toolkit';
import { LocalStorageService } from '../../services/localStorage.service';
import { DEFAULT_SYMBOLS, CONVERSATION_ROLES } from '../../constants';

/**
 * Estado inicial del slice de journal
 */
const initialState = {
    isSaving: false,
    messageSaved: '',
    notes: LocalStorageService.getNotes(),
    active: null,
    symbols: DEFAULT_SYMBOLS,
    openAIResponse: null
};

/**
 * Slice de Redux para manejar el estado del journal (notas)
 */
export const journalSlice = createSlice({
    name: 'journal',
    initialState,
    reducers: {
        /**
         * Indica que se está guardando una nota
         */
        startSaving: (state) => {
            state.isSaving = true;
        },

        /**
         * Agrega un símbolo a la lista
         */
        addSymbol: (state, action) => {
            state.symbols.push(action.payload);
        },

        /**
         * Establece la respuesta de OpenAI
         */
        setOpenAIResponse: (state, action) => {
            state.isSaving = false;
            state.openAIResponse = action.payload;
        },

        /**
         * Agrega una nueva nota vacía
         */
        addNewEmptyNote: (state, action) => {
            state.notes.push(action.payload);
            state.isSaving = false;
            LocalStorageService.saveNotes(state.notes);
        },

        /**
         * Establece la nota activa
         */
        setActiveNote: (state, action) => {
            state.active = action.payload;
            state.messageSaved = '';

            // Asegurar que la nota tenga un array de conversación
            if (!state.active.conversation) {
                state.active.conversation = [];
            }

            // Actualizar la nota en el array de notas
            const noteIndex = state.notes.findIndex(note => note.id === state.active.id);
            if (noteIndex !== -1) {
                state.notes[noteIndex] = state.active;
            }

            LocalStorageService.saveNotes(state.notes);
        },

        /**
         * Establece todas las notas
         */
        setNotes: (state, action) => {
            state.notes = action.payload;
            LocalStorageService.saveNotes(state.notes);
        },

        /**
         * Actualiza una nota existente
         */
        updateNote: (state, action) => {
            state.isSaving = false;
            state.notes = state.notes.map(note =>
                note.id === action.payload.id ? action.payload : note
            );
            LocalStorageService.saveNotes(state.notes);
            state.messageSaved = `${action.payload.title}, actualizada correctamente`;
        },

        /**
         * Alterna el estado de fijado de una nota
         */
        togglePinNote: (state, action) => {
            state.isSaving = false;
            const noteId = action.payload;
            const noteIndex = state.notes.findIndex(note => note.id === noteId);

            if (noteIndex !== -1) {
                // Alternar estado de isPinned
                state.notes[noteIndex].isPinned = !state.notes[noteIndex].isPinned;

                // Si la nota activa es la que se está fijando/desfijando, actualizarla también
                if (state.active && state.active.id === noteId) {
                    state.active.isPinned = state.notes[noteIndex].isPinned;
                }

                // Guardar en localStorage
                LocalStorageService.saveNotes(state.notes);
            }
        },

        /**
         * Agrega fotos a la nota activa
         */
        setPhotosToActiveNote: (state, action) => {
            state.isSaving = false;
            if (state.active) {
                state.active.imageUrls = [...state.active.imageUrls, ...action.payload];
            }
        },

        /**
         * Limpia todas las notas al cerrar sesión
         */
        clearNotesLogout: (state) => {
            state.isSaving = false;
            state.messageSaved = '';
            state.notes = [];
            state.active = null;
            LocalStorageService.clearNotes();
        },

        /**
         * Elimina una nota por su ID
         */
        deleteNoteById: (state, action) => {
            state.active = null;
            state.notes = state.notes.filter(note => note.id !== action.payload);
            LocalStorageService.saveNotes(state.notes);
        },

        /**
         * Limpia la conversación de la nota activa
         */
        clearConversation: (state) => {
            state.isSaving = false;
            if (state.active) {
                state.active.conversation = [];
            }
        }
    }
});

export const {
    addNewEmptyNote,
    setActiveNote,
    setNotes,
    startSaving,
    setOpenAIResponse,
    updateNote,
    setPhotosToActiveNote,
    clearNotesLogout,
    deleteNoteById,
    togglePinNote,
    addSymbol,
    clearConversation
} = journalSlice.actions;
