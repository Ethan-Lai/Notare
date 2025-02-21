import {SimpleGrid, Skeleton, Stack, Text} from "@mantine/core";
import NotePreview from "@/components/notes/NotePreview";
import {useNotes} from "@/context/NotesContext";

export default function NotesOverview() {
    const { notes, initialLoad }: { notes: Note[], initialLoad: boolean  } = useNotes();

    // Sizing setup
    const height = 180;

    return (
        <Stack>
            <SimpleGrid
                cols={{ base: 1, sm: 1, md: 2, lg: 3 }}
            >
                {initialLoad && Array(6)
                    .fill(0)
                    .map((_, index) => (
                        <Skeleton key={index} h={height} animate={true} />
                    ))
                }

                {notes.map((note) => (
                    <NotePreview note={note} height={height} key={note.id} />
                ))}
            </SimpleGrid>

            {/* TODO: Update empty view */}
            {(!initialLoad && notes.length == 0) && (
                <Text size="lg" fw={600}>
                    No Notes Found.
                </Text>
            )}
        </Stack>
    )
}