import NotesOverview from "@/components/notes/NotesOverview";
import {Box} from "@mantine/core";
import EditNote from "@/components/notes/EditNote";
import {useNotes} from "@/context/NotesContext";

export default function Home() {
    const { activeNote, setActiveNote } = useNotes();

    return (
       <Box>
           {activeNote ? <EditNote note={activeNote} /> : <NotesOverview />}
       </Box>
    )
}