import NotesOverview from "@/components/notes/NotesOverview";
import {Flex, ScrollArea, Tabs} from "@mantine/core";
import EditNote from "@/components/notes/EditNote";
import {useNotes} from "@/context/NotesContext";
import NoteTab from "@/components/notes/NoteTab";

export default function Home() {
    const { openedNotes, activeNote } = useNotes();
    return (
       <Flex p="md" direction="column" mah={"calc(100vh - 70px)"}>
           {activeNote ? (
               <Tabs value={`${activeNote.id}`} keepMounted={false}>
                   <ScrollArea scrollbarSize={1}>
                       <Tabs.List style={{ flexWrap: "nowrap" }}>
                           {
                               openedNotes.map((note: Note) => (
                                   <NoteTab note={note} key={note.id} />
                               ))
                           }
                       </Tabs.List>
                   </ScrollArea>
               </Tabs>
           ) : null}
           <ScrollArea.Autosize
               offsetScrollbars
               scrollbarSize={6}
               style={{ "overflow-y": "auto", flexGrow: 1 }}
               p="sm"
           >
               {activeNote ? <EditNote note={activeNote} /> : <NotesOverview />}
           </ScrollArea.Autosize>
       </Flex>
    )
}