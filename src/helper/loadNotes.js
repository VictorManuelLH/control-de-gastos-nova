import { collection, getDocs } from "firebase/firestore/lite";
import { FireBaseDB } from "../firebase/config";

export const loadNotes = async(uid = '') => {
    if (!uid) throw new Error('El UID no existe');

    try {
        const path = `${uid}/journal/notes`;

        const collectionRef = collection(FireBaseDB, path);

        const docs = await getDocs(collectionRef);

        const notes = [];
        docs.forEach(doc => {
            const noteData = { id: doc.id, ...doc.data() };
            notes.push(noteData);
        });

        return notes;

    } catch (error) {
        console.error('❌ loadNotes - Error detallado:', error);
        console.error('❌ loadNotes - Error code:', error.code);
        console.error('❌ loadNotes - Error message:', error.message);
        throw new Error('Error al cargar notas desde Firestore: ' + error.message);
    }
}
