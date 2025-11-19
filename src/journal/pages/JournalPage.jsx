import { useDispatch, useSelector } from 'react-redux'
import { JournalLayout } from "../layout/JournalLayout"
import { NoteView, NothingSelectedView } from "../views"
import { startNewNote } from "../../store/journal"

export const JournalPage = () => {

    const { isSaving, active } = useSelector( state => state.journal )

    const dispatch = useDispatch()

    const onClickNewNote = () => {
        dispatch( startNewNote() )
    }

    return (
        <JournalLayout>

            {
                (!!active)
                ?   <NoteView />
                :   <NothingSelectedView onCreateNote={onClickNewNote} isSaving={isSaving} />
            }

        </JournalLayout>
    )
}
