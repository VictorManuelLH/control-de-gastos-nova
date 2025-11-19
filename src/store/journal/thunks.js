import { collection, deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore/lite';
import { FireBaseDB } from '../../firebase/config';
import { addNewEmptyNote, deleteNoteById, startSaving, setOpenAIResponse, setActiveNote, setPhotosToActiveNote, updateNote, togglePinNote, clearConversation } from './journalSlice';
import { fileUpload } from '../../helper';
import axios from 'axios';

export const startNewNote = () => {
    return async (dispatch, getState) => {
        dispatch(startSaving());

        const { uid } = getState().auth;

        const newNote = {
            title: "Nueva nota",
            body: "",
            imageUrls: [],
            conversation: [],
            isPinned: false,
            newField: "",
            date: new Date().getTime(),
        };

        try {
            // Ruta definitiva: {uid}/journal/notes
            const newDoc = doc(collection(FireBaseDB, `${uid}/journal/notes`));

            await setDoc(newDoc, newNote);
            newNote.id = newDoc.id;

            dispatch(addNewEmptyNote(newNote));
            dispatch(setActiveNote(newNote));
        } catch (error) {
            console.error("Error al crear nueva nota:", error);
        }
    };
};


export const togglePinNoteFirebase = (id, isPinned) => {
    return async (dispatch, getState) => {
        dispatch(startSaving());

        try {
            const { uid } = getState().auth;
            const { notes } = getState().journal;
            const note = notes.find(note => note.id === id);

            if (!note) {
                console.error('❌ togglePinNote - Nota no encontrada:', id);
                return;
            }

            const newPinnedState = !isPinned;
            console.log(`📌 Cambiando estado de fijado de nota ${id} a:`, newPinnedState);

            // Ruta definitiva: {uid}/journal/notes
            const noteRef = doc(FireBaseDB, `${uid}/journal/notes/${id}`);

            // Actualizar en Firestore
            await updateDoc(noteRef, {
                isPinned: newPinnedState
            });

            console.log('✅ Estado de fijado actualizado en Firestore');

            // Actualizar la nota completa con el nuevo estado de isPinned
            // IMPORTANTE: No cambiar la fecha, solo el estado de isPinned
            const updatedNote = {
                ...note,
                isPinned: newPinnedState
            };

            // Actualizar en localStorage
            const localNotes = JSON.parse(localStorage.getItem('notes')) || [];
            const updatedLocalNotes = localNotes.map(n =>
                n.id === id ? updatedNote : n
            );
            localStorage.setItem('notes', JSON.stringify(updatedLocalNotes));

            // Actualizar en Redux
            dispatch(togglePinNote(id));

            console.log(`✅ Nota ${newPinnedState ? 'fijada' : 'desfijada'} correctamente`);

        } catch (error) {
            console.error('❌ Error al cambiar estado de fijado:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
        }
    };
};

export const startSaveNote = () => {
    return async (dispatch, getState) => {
        dispatch(startSaving());

        const { uid } = getState().auth;
        const { active: note } = getState().journal;

        const noteToFireStore = { 
            ...note, 
            conversation: note.conversation || [],
            newField: note.newField || ""
        };

        delete noteToFireStore.id;

        // Ruta definitiva: {uid}/journal/notes
        const docRef = doc(FireBaseDB, `${uid}/journal/notes/${note.id}`);

        await setDoc(docRef, noteToFireStore, { merge: true });

        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        const updatedNotes = notes.map(n => (n.id === note.id ? { ...note, conversation: note.conversation || [], newField: note.newField || "" } : n));
        localStorage.setItem('notes', JSON.stringify(updatedNotes));

        dispatch(updateNote({
            id: note.id,
            ...noteToFireStore
        }));
    };
};

export const startUploadFiles = (files = []) => {
    return async (dispatch) => {
        dispatch(startSaving());

        const fileUploadPromises = [];

        for (const file of files) {
            fileUploadPromises.push(fileUpload(file));
        }

        const photoUrls = await Promise.all(fileUploadPromises);
        dispatch(setPhotosToActiveNote(photoUrls));
    };
};

export const startQuestion = (promptText) => {
    return async (dispatch) => {
        dispatch(startSaving());

        try {
            const apiKey = import.meta.env.VITE_APIKEYOPENIA;


            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4-turbo',
                    messages: [
                        { role: 'system', content: 'Eres un asistente útil que ayuda a un estudiante de universidad y es desarrollador de software, dame el resultado y explicame paso a paso el proceso sin desenvolverte tanto' },
                        { role: 'user', content: promptText }
                    ],
                    max_tokens: 4000,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                    },
                }
            );

            const answer = response.data.choices[0].message.content.trim();

            dispatch(setOpenAIResponse(answer));

        } catch (error) {
            console.error('Error al obtener respuesta de OpenAI:', error);
            const answer = 'Error al hacer su peticion, por favor vuelva a intentar.'
            dispatch(setOpenAIResponse(answer));
        }
    };
};

export const startCleanConversation = () => {
    return async (dispatch, getState) => {
        const { uid } = getState().auth;
        const { active: note } = getState().journal;

        if (!note) return;

        dispatch(clearConversation());

        // Ruta definitiva: {uid}/journal/notes
        const noteRef = doc(FireBaseDB, `${uid}/journal/notes/${note.id}`);

        await updateDoc(noteRef, {
            conversation: []
        });

        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        const updatedNotes = notes.map(n => (n.id === note.id ? { ...n, conversation: [] } : n));
        localStorage.setItem('notes', JSON.stringify(updatedNotes));

        dispatch(updateNote({
            ...note,
            conversation: []
        }));
    };
};


export const startDeletingNote = () => {
    return async (dispatch, getState) => {
        const { uid } = getState().auth;
        const { active: note } = getState().journal;

        // Ruta definitiva: {uid}/journal/notes
        const docRef = doc(FireBaseDB, `${uid}/journal/notes/${note.id}`);

        const respuesta = await deleteDoc(docRef);

        dispatch(deleteNoteById(note.id));
    };
};
